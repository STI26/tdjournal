from datetime import datetime
from django.core.paginator import Paginator
from django.db.models import Q, Max
from django.db import IntegrityError
from repairs.models import (Departments, Equipment, Locations)
from toners.models import (NamesOfTonerCartridge, Statuses,
                           TonerCartridges, TonerCartridgesLog)


class DataToners(object):
    """included methods:
    loadToners() - Get toner-cartridges with current status.
    tonerLog() - Get the history of the current toner-cartridge.
    save() - Save current row in database.
    remove() - Remove current row in database.
    move() - Save movement toner-cartridge in log.
    getDepartments() - Get departments.
    getPrinters() - Get available printers.
    getLocationsAndStatuses() - Get locations with current department.
                                Get all statuses.
    openBlankForm() - Preparing a form for adding new toner-cartridge.
    getMaxID() - Get max number of toner-cartridge with the current prefix.
    getPrinterModels() - Get all printer models.


    Use 'action' for select method.
    """

    def action(self, operation, user, data=None):
        """Select and run function"""

        self.data = data
        self.user = user

        # Get the method from 'self'. Default to a lambda.
        method = getattr(self, operation,
                         lambda: {'status': False,
                                  'message': f"Метод '{operation}' не найден"})

        # Call the method as we return it
        return method()

    def loadToners(self):
        """Get toner-cartridges with current status.

        Format:
        self.data.number - number of rows returned(0 = all rows); type: int
        self.data.currentPage - current page; type: int
        self.data.type - filtration by type of toner-cartridges; type: str
        self.data.printer - filtration by printer; type: dict
        self.data.statuses - filtration by statuses of toner-cartridges;
                             type: list

        Return:
        {toners: toners data, paginator: paginator data, time: current time}
        """

        if self.data.get('type', None) is not None:
            filter = {'names__in': self._getNamesIDByName(self.data['type'])}
        elif self.data.get('printer', None) is not None:
            filter = {
                'names__in': self._getNamesIDByPrinter(self.data['printer'])
            }
        else:
            filter = {}

        # Get toner-cartridges by type
        cartridges = TonerCartridges.objects.filter(
            is_deleted=False, **filter,
        ).prefetch_related(
            'names',
        )

        # Convert an instance to list of dictionaries
        cartridgesList = []
        for crt in cartridges:
            row = {'id': crt.id,
                   'prefix': crt.prefix,
                   'number': crt.number,
                   'owner': crt.owner.short_name,
                   'type': [x[0] for x in crt.names.all().values_list('name')]}

            # Get latest status
            try:
                lastStatus = TonerCartridgesLog.objects \
                    .filter(toner_cartridge__id=row['id']) \
                    .values(
                        'date',
                        'location__office',
                        'status__id',
                        'status__name',
                        'status__logo',
                        'note'
                    ).latest('date')
                # Add latest status
                row.update(lastStatus)
            except TonerCartridgesLog.DoesNotExist:
                lastStatus = None
                cartridgesList.append(row)
                continue

            # Skip unnecessary items
            statuses = self.data.get('statuses')
            if statuses and row.get('status__id') in statuses:
                cartridgesList.append(row)

        # Get current time
        time = datetime.now().strftime('%d.%m.%y %H:%M:%S')

        # Show all repairs
        if int(self.data['number']) == 0:
            return {'toners': cartridgesList,
                    'paginator': None,
                    'time': time, }

        dataPage, paginator = self._getPagination(cartridgesList)

        return {'toners': dataPage,
                'paginator': paginator,
                'time': time, }

    def tonerLog(self):
        """Get the history of the current toner-cartridge."""

        # Get toner-cartridge by id
        try:
            crt = TonerCartridges.objects.filter(
                is_deleted=False,
                pk=int(self.data['id'])
            )
        except KeyError:
            return {'status': False,
                    'message': f'ID не обнаружен.'}
        except ValueError:
            return {'status': False,
                    'message': f'Неверный формат ID.'}

        if len(crt) != 1:
            return {'status': False,
                    'message': f'Запись №{self.data["id"]} не найдена.'}

        # Returned fields
        toner_cartridge = crt.values(
            'id',
            'owner__short_name',
            'prefix',
            'number',
        ).first()
        type = [x[0] for x in crt.first().names.all().values_list('name')]
        toner_cartridge['type'] = ', '.join(type)

        # Get all records with the toner-cartridge
        log = TonerCartridgesLog.objects.filter(
            is_deleted=False,
            toner_cartridge=crt.first(),
        )
        if len(log) == 0:
            return {'status': False,
                    'message': 'Записи не найдены.', }

        # Returned fields
        fields = ['date', 'location__office',
                  'status__name', 'status__logo',
                  'equipment__brand__short_name',
                  'equipment__model', 'note', ]

        return {'status': True,
                'message': '',
                'toner_cartridge': toner_cartridge,
                'log': list(log.values(*fields)), }

    def save(self):
        """Save current row in database."""

        try:
            new = TonerCartridges.objects.create(
                prefix=self.data['prefix'].upper(),
                number=int(self.data['number']),
                owner=Departments.objects.get(pk=self.data['owner']),
            )
        except IntegrityError:
            return {'status': False,
                    'message': 'Запись с таким ID уже есть.'}

        names = []
        for nameID in self.data['names']:
            name = NamesOfTonerCartridge.objects.get(pk=int(nameID))
            names.append(name)
        new.names.set(names)

        return {'status': True,
                'message': f'Запись №{new.id} успешно сохранена.'}

    def remove(self):
        """Remove current row in database."""

        try:
            toner = TonerCartridges.objects.filter(
                pk=int(self.data['id'])
            )
        except KeyError:
            return {'status': False,
                    'message': f'ID не обнаружен.'}
        except ValueError:
            return {'status': False,
                    'message': f'Неверный формат ID.'}

        if len(toner) != 1:
            return {'status': False,
                    'message': f'Запись №{self.data["id"]} не найдена.'}

        toner.update(is_deleted=True)

        return {'status': True,
                'message': f'Запись №{id} удалена.'}

    def move(self):
        """Save movement toner-cartridge in log."""

        status = Statuses.objects.get(pk=int(self.data['status']))
        equipment = Equipment.objects.filter(pk=self.data['equipment']).first()

        # Check selected printer
        if status.link_printer and not equipment:
            message = 'При выбраном статусе "{}" неоходимо выбрать принтер.'
            return {'status': False,
                    'message': message.format(status.name), }

        toners = []
        for toner in self.data['toner_cartridges']:
            new = TonerCartridgesLog.objects.create(
                date=self.data['date'],
                toner_cartridge=TonerCartridges.objects.get(pk=int(toner)),
                location=Locations.objects.get(pk=int(self.data['location'])),
                status=status,
                equipment=equipment,
                note=self.data.get('note', ''),
            )
            toners.append(new.id)

        if len(toners) == 1:
            message = 'Запись №{} успешно сохранена.'.format(
                ', '.join(map(str, toners))
            )
        else:
            message = 'Записи №{} успешно сохранены.'.format(
                ', '.join(map(str, toners))
            )

        return {'status': True,
                'message': message, }

    def getDepartments(self):
        """Get all departments."""

        departments = Departments.objects.filter(is_deleted=False) \
            .values('id', 'name', 'short_name')

        return {'departments': list(departments)}

    def getPrinters(self):
        """Get available printers."""

        link_printer = Statuses.objects.get(
            pk=int(self.data['status'])
        ).link_printer

        if not link_printer:
            return {'link_printer': link_printer}
        else:
            toners = TonerCartridges.objects.get(
                pk=self.data.get('toner_cartridges')[0]
            ).names.all()

            printers = NamesOfTonerCartridge.objects.filter(
                id__in=toners
            ).distinct().values_list(
                'printers__id',
                'printers__brand__short_name',
                'printers__model'
            )

            printers = map(lambda x: [x[0], ' '.join(x[1:])], printers)

        return {'link_printer': link_printer,
                'printers': list(printers), }

    def getLocationsAndStatuses(self):
        """Get locations with current department. Get all statuses."""

        d = Departments.objects.filter(pk=self.data['department']).first()

        locations = Locations.objects.filter(is_deleted=False, department=d) \
            .values('id', 'office')

        if len(self.data['toner_cartridges']) == 1:
            filter = {'is_deleted': False}
        else:
            filter = {'is_deleted': False, 'link_printer': False}

        statuses = Statuses.objects.filter(**filter).values('id', 'name')

        return {'locations': list(locations),
                'statuses': list(statuses), }

    def openBlankForm(self):
        """Preparing a form for adding new toner-cartridge."""

        types = NamesOfTonerCartridge.objects.filter(is_deleted=False) \
            .values('id', 'name')
        departments = Departments.objects.filter(is_deleted=False) \
            .values('id', 'name', 'short_name')

        return {'types': list(types),
                'departments': list(departments), }

    def getMaxID(self):
        """Get max number of toner-cartridge with the current prefix."""

        id = TonerCartridges.objects.filter(
            is_deleted=False,
            prefix__iexact=self.data['prefix'],
        ).aggregate(Max('number'))

        return {'maxID': id['number__max']}

    def getPrinterModels(self):
        """Get all printer models."""

        brand = self.data['brand']

        models = Equipment.objects.filter(
            is_deleted=False, brand__short_name__iexact=brand
        ).filter(
            Q(type__name__iexact='принтер') | Q(type__name__iexact='МФУ')
        )

        return {'status': True,
                'models': list(models.values('model')), }

    def _getNamesIDByName(self, name):
        """Get list namesOfTonerCartridge by name."""

        result = NamesOfTonerCartridge.objects.filter(
            is_deleted=False,
            name=name
        )

        return result

    def _getNamesIDByPrinter(self, printer):
        """Get list namesOfTonerCartridge by printer."""

        printers = Equipment.objects.filter(
            is_deleted=False,
            brand__short_name__iexact=printer['brand'],
            model__iexact=printer['model'],
        )

        result = NamesOfTonerCartridge.objects.filter(
            is_deleted=False,
            printers__in=printers,
        )

        return result

    def _getPagination(self, cartridgesList):
        """Get pagination info"""

        #  Show 'self.data['number']' toner-cartridges per page
        paginator = Paginator(cartridgesList, self.data['number'])
        p = paginator.get_page(self.data['currentPage'])

        hasPrevious = p.has_previous()
        previousPageNumber = p.previous_page_number() if hasPrevious else None
        hasNext = p.has_next()
        nextPageNumber = p.next_page_number() if hasNext else None
        numPages = paginator.num_pages

        paginator = {'hasPrevious': hasPrevious,
                     'previousPageNumber': previousPageNumber,
                     'hasNext': hasNext,
                     'nextPageNumber': nextPageNumber,
                     'numPages': numPages, }

        return p.object_list, paginator
