Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* Area Chart */
function createLineChart(canvasID, labels, data) {
  const ctx = document.querySelector(`#${canvasID}`);
  const datasets = data.map(x => {
    const color = `rgba(${getRandomInt(250)}, ${getRandomInt(250)}, ${getRandomInt(250)}, 1)`;
    return {
      label: x.name,
      lineTension: 0.3,
      backgroundColor: 'rgba(78, 115, 223, 0.05)',
      borderColor: color,
      pointRadius: 3,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: color,
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: x.info,
    };
  });

  const myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value, index, values) {
              return value;
            }
          },
          gridLines: {
            color: 'rgb(234, 236, 244)',
            zeroLineColor: 'rgb(234, 236, 244)',
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: 'rgb(255,255,255)',
        bodyFontColor: '#858796',
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            let datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': ' + tooltipItem.yLabel;
          }
        }
      }
    }
  });
  return myLineChart;
}
/* Pie Chart */
function createPieChart(canvasID, labels, data, cutoutPercentage=80) {
  const ctx = document.querySelector(`#${canvasID}`);
  const datasets = data.map(x => {
    const hoverBgColors = x.map(i => `rgba(${getRandomInt(250)}, ${getRandomInt(250)}, ${getRandomInt(250)}, 0.6)`);
    const bgColors = hoverBgColors.map(i => i.replace('0.6', '1'));
    return {data: x,
            backgroundColor: bgColors,
            hoverBackgroundColor: hoverBgColors,
            hoverBorderColor: 'rgba(234, 236, 244, 1)', };
  });
  const myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: 'rgb(255,255,255)',
        bodyFontColor: '#858796',
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      // legend: {
      //   display: false
      // },
      cutoutPercentage: cutoutPercentage,
    },
  });
  return myPieChart;
}
function setDateLabel(dt, period) {
  d = new Date(dt);
  d.setTime(d.getTime() + (-d.getTimezoneOffset() * 60000));
  const date = (d.getDate() < 10 ? `0${d.getDate()}` : d.getDate());
  const month = (d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1);
  const obj = {
    year: d.getFullYear(),
    month: `${month}.${d.getFullYear()}`,
    day: `${date}.${month}.${d.getFullYear()}`,
  };
  return obj[period];
}
/* Render Charts */
function renderCharts() {
  defaultSettings.update();
  const url = document.querySelector('#charts').dataset.fetch;
  const obj = defaultSettings.get();
  postData(url, obj, 'getDataForCharts')
    .then(data => {
      // Repairs log
      const repairsLogLabel = data.repairsIn.log.map(i => setDateLabel(i.group, obj.period));
      const repairsLogIn = {info: data.repairsIn.log.map(i => i.count), name: 'Принято в ремонт'};
      const repairsLogOut = {info: data.repairsOut.log.map(i => i.count), name: 'Выдано из ремонта'};
      const repairsLogData = [repairsLogIn, repairsLogOut];
      window.repairsLineChart && window.repairsLineChart.destroy();
      window.repairsLineChart = createLineChart('repairs-log', repairsLogLabel, repairsLogData);
      // Repairs stats
      const repairsStatsLabelIn = data.repairsIn.stats.map(i => i.equipment__type__name);
      const repairsStatsIn = data.repairsIn.stats.map(i => i.count);
      window.repairsPieChart && window.repairsPieChart.destroy();
      window.repairsPieChart =  createPieChart('repairs-stats', repairsStatsLabelIn, [repairsStatsIn]);
      // TODO: add chart for out
      const repairsStatsLabelOut = data.repairsOut.stats.map(i => i.equipment__type__name);
      const repairsStatsOut = data.repairsOut.stats.map(i => i.count);
      // createPieChart('repairs-stats', repairsStatsLabelIn, repairsStatsIn);
      // Toners log
      const tonersLogLabel = data.toners.log.map(i => setDateLabel(i.group, obj.period));
      const tonersLog = {info: data.toners.log.map(i => i.count), name: 'Установлено картриджей'};
      window.tonersLineChart && window.tonersLineChart.destroy();
      window.tonersLineChart = createLineChart('toners-log', tonersLogLabel, [tonersLog]);
      // Toners stats
      const tonersStatsLabel = data.toners.stats.map(i => i.printer);
      const tonersStats = data.toners.stats.map(i => i.count);
      window.tonersPieChart && window.tonersPieChart.destroy();
      window.tonersPieChart = createPieChart('toners-stats', tonersStatsLabel, [tonersStats]);
    })
    .catch(error => {
      infoBlock('error', error, 5000);
    });
}
/* Get or set default settings */
const defaultSettings = {
  update: () => {
    const range = document.querySelector('[name=index-filter]:checked');
    const dates = document.querySelector('#index-filter-range').value.split(' — ');
    const period = document.querySelector('#index-filter-period');
    const data = {
      range: range ? range.value : null,
      customRange: dates.length === 2 ? dates.map(x => flatpickr.parseDate(x, 'd.m.y')) : null,
      period: period ? period.value : null,
    };
    localStorage.setItem('dashboard', JSON.stringify(data));
  },
  apply: () => {
    if (localStorage.dashboard) {
      const data = JSON.parse(localStorage.getItem('dashboard'));
      const range = document.querySelector(`#index-filter-${data.range}`);
      checkRange(data.range);
      flatpickr('#index-filter-range', cfgFlatpickrRange).clear();
      const period = document.querySelector('#index-filter-period');
      range ? range.checked = true : document.querySelector('#index-filter-week').checked = true;

      if (data.period && period) {
        period.value = data.period;
      }
    } else {
      document.querySelector('#index-filter-week').checked = true;
    }
  },
  get: () => {
    if (localStorage.dashboard) {
      const data = JSON.parse(localStorage.getItem('dashboard'));
      return data;
    }
    return null;
  }
}
/* Element display animation */
function animation(el) {
  this.show = () => {
    el.classList.add('is-showing');
    window.setTimeout(() => {el.classList.add('animation-opacity');}, 0);
    window.setTimeout(() => {el.classList.add('animation-width');}, 300);
  };
  this.hide = () => {
    el.classList.remove('animation-width');
    window.setTimeout(() => {el.classList.remove('animation-opacity');}, 1000);
    window.setTimeout(() => {el.classList.remove('is-showing');}, 1300);
  };
  return this;
}
/* Show advanced menu in top filter */
function checkRange(range) {
  const rangeEl = document.querySelector('#index-filter-range');
  const periodEl = document.querySelector('#index-filter-period');

  if (range === 'custom') {
    animation(rangeEl).show();
    animation(periodEl).show();
    return rangeEl.value;
  } else {
    animation(rangeEl).hide();
    animation(periodEl).hide();
  }

  return null;
}

docReady(function() {
  defaultSettings.apply();

  renderCharts();

  // Change date range in top filter
  document.querySelectorAll('[name=index-filter]').forEach((item) => {
    item.addEventListener('change', () => {
      defaultSettings.update();
      if (checkRange(item.value) === null) {
        renderCharts();
      }
    });
  });
  // Select custom date range in top filter
  flatpickr('#index-filter-range', cfgFlatpickrRange).config.onChange.push(function() {
    defaultSettings.update();
    renderCharts();
  });
  // Select custom date period in top filter
  document.querySelector('#index-filter-period').addEventListener('change', () => {
    defaultSettings.update();
    renderCharts();
  });

});
