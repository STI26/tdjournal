from django.db import models


class Departments(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    short_name = models.TextField()
    department_dn = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Department"


class Employees(models.Model):
    is_deleted = models.BooleanField(default=False)
    l_name = models.TextField()
    f_name = models.TextField(blank=True)
    patronymic = models.TextField(blank=True)
    department = models.ForeignKey(Departments, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.l_name} {self.f_name}({self.department})'

    class Meta:
        verbose_name = "Employee"


class Technical_groups(models.Model):
    employee = models.ForeignKey(Employees, on_delete=models.CASCADE)
    group_dn = models.TextField()

    def __str__(self):
        return f'{self.employee}({self.group_dn})'

    class Meta:
        verbose_name = "Technical_group"


class Buildings(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    short_name = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Building"


class Locations(models.Model):
    is_deleted = models.BooleanField(default=False)
    office = models.TextField()
    phone = models.TextField(blank=True)
    department = models.ForeignKey(Departments, on_delete=models.CASCADE)
    building = models.ForeignKey(Buildings, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.office}; {self.department}; {self.building}'

    class Meta:
        verbose_name = "Location"


class Brands(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()
    short_name = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Brand"


class Type_of_equipment(models.Model):
    is_deleted = models.BooleanField(default=False)
    name = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Type_of_equipment"
        verbose_name_plural = "Type_of_equipment"


class Equipment(models.Model):
    is_deleted = models.BooleanField(default=False)
    type = models.ForeignKey(Type_of_equipment, on_delete=models.CASCADE)
    brand = models.ForeignKey(Brands, on_delete=models.CASCADE)
    model = models.TextField()

    def __str__(self):
        return f'{self.type}; {self.brand}; {self.model}'

    class Meta:
        verbose_name = "Equipment"
        verbose_name_plural = "Equipment"


class Repairs(models.Model):
    is_deleted = models.BooleanField(default=False)
    date_in = models.DateTimeField()
    department = models.ForeignKey(Departments, on_delete=models.CASCADE)
    locations = models.ForeignKey(Locations, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    defect = models.TextField()
    inv_number = models.TextField()
    customer_in = models.ForeignKey(
        Employees,
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_customer_in',)
    employee = models.ForeignKey(
        Employees,
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_employee',)
    repair = models.TextField(blank=True)
    current_state = models.TextField(blank=True)
    date_out = models.DateTimeField(null=True)
    customer_out = models.ForeignKey(
        Employees,
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_customer_out',
        null=True)

    def __str__(self):
        return f"""{self.date_in};
                {self.locations};
                {self.equipment};
                {self.date_out}
                """

    class Meta:
        verbose_name = "Repair"
