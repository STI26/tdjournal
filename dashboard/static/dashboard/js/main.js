// Setting for flatpickr
const cfgFlatpickr = {
  enableTime: true,
  dateFormat: 'd.m.y H:i',
  time_24hr: true,
  'locale': 'ru',
  // disableMobile: "true",
};
const cfgFlatpickrRange = {
  mode: 'range',
  dateFormat: 'd.m.y',
  'locale': 'ru',
  // disableMobile: "true",
};

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.closest('.dropdown-btn')) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    for (let i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i].classList.contains('is-showing')) {
        dropdowns[i].classList.remove('is-showing');
      }
    }
  }
}
/* Fetch */
async function postData(url='', data={}, operation='') {
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  // Send the data using post
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json',
      'operation': operation,
    },
    body: JSON.stringify(data),
  })
  return response.json();
}
/* Show pagination block */
const showPagination = (page, paginator, halfPaginationLength) => {
  // n: number pages
  const n = (paginator === null ? 1 : paginator.numPages);
  page = page - 1;  // start 0
  document.querySelector('.pagination').innerHTML = '';
  const pagination = new DocumentFragment();
  if (n > 1) {
    let i,
        link;
    // Show previous page
    if (paginator.hasPrevious) {
      link = document.createElement('a');
      link.href = '#';
      link.innerHTML = '&laquo';
      link.dataset.page = paginator.previousPageNumber;
      pagination.appendChild(link);
    }
    if (page <= halfPaginationLength) {
      i = 0;
    // Show first page
    } else {
      i = (page > halfPaginationLength ? halfPaginationLength - 2 : halfPaginationLength);
      i = (n > (page + halfPaginationLength) ? page - i : n - (i * 2 + 1));
      link = document.createElement('a');
      link.href = '#';
      link.innerText = 1;
      link.dataset.page = 1;
      pagination.appendChild(link);
      link = document.createElement('span');
      link.innerHTML = '...';
      pagination.appendChild(link);
    }
    let maxPage;
    if (page <= halfPaginationLength) {
      maxPage = i + (halfPaginationLength * 2) - 1;
    } else {
      maxPage = i + halfPaginationLength + 2;
    }
    if (page > n - halfPaginationLength - 2) {
      i = (n - 9 < 0 ? 0 : n - 9);
      maxPage += 2;
    }
    // Show the main pages of the paginations block
    while (i < maxPage && i < n) {
      link = document.createElement('a');
      link.href = '#';
      link.innerText = i + 1;
      if (page === 0 && i === 0) {
        link.classList.add('active');
      } else if (page === i) {
        link.classList.add('active');
      }
      link.dataset.page = i + 1;
      pagination.appendChild(link);
      i++;
    }
    // Show last page
    if (n > maxPage + 2) {
      link = document.createElement('span');
      link.innerHTML = '...';
      pagination.appendChild(link);
      link = document.createElement('a');
      link.href = '#';
      link.innerText = n;
      link.dataset.page = paginator.numPages;
      pagination.appendChild(link);
    }
    // Show next page
    if (paginator.hasNext) {
      link = document.createElement('a');
      link.href = '#';
      link.innerHTML = '&raquo';
      link.dataset.page = paginator.nextPageNumber;
      pagination.appendChild(link);
    }
    document.querySelector('.pagination').appendChild(pagination);
  }
}
/* Open auxiliary modal */
const openAuxiliaryModal = (tableName, id=null) => {
  let header;
  let form = null;
  switch (tableName) {
    case 'departments':
    case 'modal-department':
      header = 'отдел';
      document.querySelector('#modal-new-department-name').innerHTML = '';
      document.querySelector('#modal-new-department-short-name').innerHTML = '';
      form = 'modal-department-add';
      break;
    case 'locations':
    case 'modal-location':
      header = 'расположение';
      document.querySelector('#modal-department-for-new-location').value = 0;
      document.querySelector('#modal-new-location-office').innerHTML = '';
      document.querySelector('#modal-new-location-phone').innerHTML = '';
      document.querySelector('#modal-new-location-building').value = 0;
      form = 'modal-location-add';
      break;
    case 'employees':
    case 'modal-employee':
    case 'modal-customer-in':
    case 'modal-customer-out':
      header = 'сотрудника';
      document.querySelector('#modal-new-lname').innerHTML = '';
      document.querySelector('#modal-new-fname').innerHTML = '';
      document.querySelector('#modal-new-pname').innerHTML = '';
      document.querySelector('#modal-department-for-new-employee').value = 0;
      form = 'modal-employee-add';
      break;
    case 'equipment':
    case 'modal-equipment-model':
      header = 'наименование техники';
      document.querySelector('#modal-new-equipment-type-id').value = 0;
      document.querySelector('#modal-new-equipment-brand').value = 0;
      document.querySelector('#modal-new-equipment-model').innerHTML = '';
      form = 'modal-equipment-model-add';
      break;
    case 'type_of_equipment':
    case 'modal-equipment-type':
      header = 'тип техники';
      document.querySelector('#modal-new-equipment-type').innerHTML = '';
      form = 'modal-equipment-type-add';
      break;
    case 'buildings':
      header = 'филиал';
      document.querySelector('#modal-new-building').innerHTML = '';
      document.querySelector('#modal-new-building-short-name').innerHTML = '';
      form = 'modal-building-add';
      break;
    case 'brands':
    case 'modal-equipment-brand':
      header = 'филиал';
      document.querySelector('#modal-new-brand').innerHTML = '';
      document.querySelector('#modal-new-brand-short-name').innerHTML = '';
      form = 'modal-brand-add';
      break;
    default:
      break;
  }
  if (form !== null) {
    let selector = `#${form} .modal-header h4`;
    let headerEl = document.querySelector(selector);
    header = (id === null ? `Добавить ${header}` : `Изменить ${header}(#${id})`);
    headerEl.innerText = header;
    modal.open('modal-auxiliary');
    modalDisplay(form);
  }
}
/* Get value from auxiliary form */
const getAuxiliaryForm = (tableName) => {
  let obj;
  switch (tableName) {
    case 'modal-department-add':
      obj = {
        table: 'departments',
        vars: {
          name: document.querySelector('#modal-new-department-name').value,
          short_name: document.querySelector('#modal-new-department-short-name').value,
        }
      };
      break;
    case 'modal-location-add':
      obj = {
        table: 'locations',
        vars: {
          department_id: document.querySelector('#modal-department-for-new-location').value,
          office: document.querySelector('#modal-new-location-office').value,
          building_id: document.querySelector('#modal-new-location-building').value,
          phone: document.querySelector('#modal-new-location-phone').value
        }
      };
      break;
    case 'modal-employee-add':
      obj = {
        table: 'employees',
        vars: {
          l_name: document.querySelector('#modal-new-lname').value,
          f_name: document.querySelector('#modal-new-fname').value,
          patronymic: document.querySelector('#modal-new-pname').value,
          department_id: document.querySelector('#modal-department-for-new-employee').value
        }
      };
      break;
    case 'modal-equipment-model-add':
      obj = {
        table: 'equipment',
        vars: {
          type_id: document.querySelector('#modal-new-equipment-type-id').value,
          brand_id: document.querySelector('#modal-new-equipment-brand').value,
          model: document.querySelector('#modal-new-equipment-model').value
        }
      };
      break;
    case 'modal-equipment-type-add':
      obj = {
        table: 'type_of_equipment',
        vars: {
          name: document.querySelector('#modal-new-equipment-type').value
        }
      };
      break;
    case 'modal-building-add':
      obj = {
        table: 'buildings',
        vars: {
          name: document.querySelector('#modal-new-building').value,
          short_name: document.querySelector('#modal-new-building-short-name').value
        }
      };
      break;
    case 'modal-brand-add':
      obj = {
        table: 'brands',
        vars: {
          name: document.querySelector('#modal-new-brand').value,
          short_name: document.querySelector('#modal-new-brand-short-name').value
        }
      };
      break;
  }
  return obj;
};
/* Display current item in modal */
const modalDisplay = (id) => {
  Array.from(document.querySelector('.modal-auxiliary .modal-content').children).forEach((item, i) => {
    if (item.id === id) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
};
/* Show error block */
const infoBlock = (type, message, timeout=null) => {
  // css style type: error, success, info
  const fr = new DocumentFragment();
  const span = document.createElement('span');
  span.innerHTML = '&#10006;';
  span.addEventListener('click', (e) => {
    e.stopPropagation();
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
  });
  // autoclose infoBlock
  if (timeout !== null) {
    setTimeout(function () {
      if (span.parentNode.parentNode) {
        span.parentNode.parentNode.removeChild(span.parentNode);
      }
    }, timeout);
  }
  const li = document.createElement('li');
  li.classList.add('flash', `flash-${type}`);
  li.innerHTML = message;
  li.insertBefore(span, li.childNodes[0]);
  const ib = document.querySelector('#info-block');
  if (document.contains(ib)) {
    fr.appendChild(li);
    ib.appendChild(fr);
  } else {
    const ul = document.createElement('ul');
    ul.id = 'info-block';
    ul.appendChild(li);
    fr.appendChild(ul);
    const theFirstChild = document.querySelector('main.conteiner').firstChild;
    document.querySelector('main.conteiner').insertBefore(fr, theFirstChild);
  }
  this.clear = () => {
    document.querySelector('#info-block').innerHTML = '';
  };
  return this;
};
/* Convert to datetime with local timezone */
const addTimeZone = (dt, toString=false, onlyDate=false, formatUS=false) => {
  if (dt === '' || dt === null) {
    return '';
  }
  d = new Date(dt);
  d.setTime(d.getTime() + (-d.getTimezoneOffset() * 60000));
  if (!toString) {
    return d;
  }
  const date = (d.getDate() < 10 ? `0${d.getDate()}` : d.getDate());
  const month = (d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1);
  if (onlyDate && !formatUS) {
    return `${date}.${month}.${d.getFullYear()}`;
  } else if (onlyDate && formatUS) {
    return `${d.getFullYear()}-${month}-${date}`;
  }
  const hours = (d.getHours() < 10 ? `0${d.getHours()}` : d.getHours());
  const minutes = (d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes());
  if (formatUS) {
    return `${d.getFullYear()}-${month}-${date} ${hours}:${minutes}`;
  }
  return `${date}.${month}.${d.getFullYear()} ${hours}:${minutes}`;
};
// Methods for modal object
const modal = {
  modals: document.querySelectorAll('.modal'),
  initial: function() {
    this.modals.forEach((item) => {
      let dataTarget = item.getAttribute('id');
      item.querySelectorAll(`[data-target=${dataTarget}]`).forEach((modal) => {
        modal.addEventListener('click', () => {
          item.classList.remove('open-modal');
          setTimeout(() => {item.style.display = 'none';}, 400);
        });
      });
    });
  },
  open: function(modalId) {
    document.getElementById(modalId).style.display = 'block';
    setTimeout(() => {document.getElementById(modalId).classList.add('open-modal');}, 0);

  },
  close: function(modalId) {
    document.getElementById(modalId).classList.remove('open-modal');
    setTimeout(() => {document.getElementById(modalId).style.display = 'none';}, 400);
  },
};

docReady(function() {
  // DOM is loaded and ready for manipulation here

  // https://github.com/feathericons/feather
  feather.replace()

  // https://github.com/flatpickr/flatpickr
  flatpickr('.flatpickr', cfgFlatpickr);
  flatpickr('.flatpickr-range', cfgFlatpickrRange);

  // Toggle dropdowns
  document.querySelectorAll('.dropdown-btn').forEach((item, i) => {
    let dataTarget = item.getAttribute('id');
    item.addEventListener('click', () => {
      document.querySelector(`[data-target=${dataTarget}]`).classList.toggle('is-showing');
    });
  });

  // Close modals with [data-target]
  modal.initial();

  // Navbar: Toggle menu
  if (document.querySelector('#nav-menu')) {
    document.querySelector('#nav-menu').addEventListener('click', function() {
      let bar = document.querySelector('#topnavbar');
      if (bar.classList.contains('responsive')) {
        bar.classList.remove('responsive');
        bar.querySelectorAll('a svg.feather.feather-x')[0].innerHTML = feather.icons['menu'].toSvg();
      } else {
        bar.classList.add('responsive');
        bar.querySelectorAll('a svg.feather.feather-menu')[0].innerHTML = feather.icons['x'].toSvg();
      }
    });
  }
});
