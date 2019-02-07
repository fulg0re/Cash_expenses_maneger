$(document).ready(function(){
    readCookie();

    $.ajax({
        url: '/expenses/statistic',
        method: 'get',
        success: function(result) {
            var data = JSON.parse(result);

            drawChart(data);
        }
    });
});

function readCookie() {
    var cookiesData = document.cookie.split('; ');
    cookiesData.forEach(function(cookieData) {
        var data = cookieData.split('=');

        if (data[0] === 'filter_day') {
            $('#filter-input-day').val(data[1])
        }

        if (data[0] === 'filter_month') {
            $('#filter-input-month').val(data[1])
        }

        if (data[0] === 'filter_year') {
            $('#filter-input-year').val(data[1])
        }

        if (data[0] === 'filter_limit') {
            $('#filter-input-limit').val(data[1])
        }
    });
}

function addNewData() {
    $('#modal-div-add').modal('show');
}

function editRowData(id) {
    $.ajax({
        url: '/expenses/getDataById',
        method: 'post',
        data: {id: id},
        success: function(result) {
            var data = JSON.parse(result);

            $('#modal-input-id').val(data.id);
            $('#modal-input-spent-on').val(data.spent_on);
            $('#modal-input-amount').val(data.amount);
            $('#modal-span-currency').text(data.currency);
            $('#modal-input-date').val(data.date);

            $('#modal-div-edit').modal('show');
        }
    });
}

function deleteRowData(id) {
    if (confirm('Are you sure you want to delete this data ?')) {
        $.ajax({
            url: '/expenses/delete',
            method: 'post',
            data: {id: id},
            success: function(data) {
                var result = JSON.parse(data);

                if (result.status !== true) {
                    alert(result.message);
                }

                $(location).attr('href', result.redirect);
            }
        });
    }
}

function submitModalForm(modalType) {
    var modalWindow;
    var modalForm;

    if (modalType === 'edit') {
        modalWindow = $('#modal-div-edit');
        modalForm = $('#modal-form-edit');
    } else if (modalType === 'add') {
        modalWindow = $('#modal-div-add');
        modalForm = $('#modal-form-add');
    }

    modalWindow.modal('hide');
    modalForm.submit();
}

function applyFilter() {
    if ($('#filter-input-day').val() !== '') {
        document.cookie = `filter_day=${$('#filter-input-day').val()}`;
    }

    if ($('#filter-input-month').val() !== '') {
        document.cookie = `filter_month=${$('#filter-input-month').val()}`;
    }

    if ($('#filter-input-year').val() !== '') {
        document.cookie = `filter_year=${$('#filter-input-year').val()}`;
    }

    if ($('#filter-input-limit').val() !== '') {
        document.cookie = `filter_limit=${$('#filter-input-limit').val()}`;
    }

    location.reload();
}

function clearFilter() {
  document.cookie = "filter_day=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "filter_month=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "filter_year=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "filter_limit=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  location.reload();
}

function drawChart(data) {
    var chartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var chartColors = {
        winter: '#c0def7',
        spring: '#d3f7cf',
        summer: '#f9eda7',
        autumn: '#f7d7aa',
    };
    data.forEach(function(element) {
        chartData[element.month - 1] += element.amount;
    });

    var chart = $('#canvas-statistic-chart')[0].getContext('2d');

    //Global Options
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';

    var newChart = new Chart(chart, {
        type: 'bar', // bar, horizontalBar, pie, Line, doughnut, radar, poLarArea
        data: {
            labels: [
                'Jan(01)',
                'Feb(02)',
                'Mar(03)',
                'Apr(04)',
                'May(05)',
                'Jun(06)',
                'Jul(07)',
                'Aug(08)',
                'Sep(09)',
                'Oct(10)',
                'Nov(11)',
                'Dec(12)'
            ],
            datasets: [
                {
                    label: 'Expenses',
                    // data: [10, 20, 30, 45, 50, 60, 70, 80, 90, 100, 110, 120],
                    data: chartData,
                    backgroundColor: [
                        chartColors.winter,
                        chartColors.winter,

                        chartColors.spring,
                        chartColors.spring,
                        chartColors.spring,

                        chartColors.summer,
                        chartColors.summer,
                        chartColors.summer,

                        chartColors.autumn,
                        chartColors.autumn,
                        chartColors.autumn,

                        chartColors.winter
                    ],
                    hoverBorderWidth: 1,
                    hoverBorderColor: '#b2b2b2',
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Cash expenses statistic',
                fontSize: 25
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        userCallback: function(value, index, values) {
                            // Convert the number to a string and splite the string every 3 charaters from the end
                            value = value.toString();
                            value = value.split(/(?=(?:...)*$)/);

                            // Convert the array to a string and format the output
                            value = value.join('.');
                            return value + ' UAH';
                        }
                    }
                }]
            }
        }
    });
}
