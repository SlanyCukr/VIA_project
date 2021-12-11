var lineChartSocial = null;
var lineChartPrice = null;

getCurrencies()
fillDoughnutChart()

function startLoading() {
  $(".loading").show()
}

function stopLoading() {
  $(".loading").hide()
}

function getCurrencies() {
  const settings = {
    "url": `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50&sort=market_cap`,
    "method": "GET",
    "headers": {
      'X-CMC_PRO_API_KEY': '3d7517a3-f987-4fbb-85a4-92aec25ca397'
    },
    error: function (xhr, status, error) {
      console.log(JSON.parse(xhr.responseText))
    }
  };

  return $.ajax(settings).done(function (response) {
    let datalist = $("#brow")
    for (let i = 0; i < response.data.length; i++) {
      let option = `<option>${response.data[i].symbol}</option>`
      datalist.append(option)
    }
  });
}

/**
 * Asks API for social data only - used for doughnut chart.
 * @param {String} currency 
 * @param {Int} data_points 
 * @param {Function} callback 
 * @returns 
 */
function getSocialData(currency, data_points, callback) {
  const settings = {
    "url": `https://api.lunarcrush.com/v2?data=assets&key=5kh3il7x10l2mk64va5jii&symbol=${currency}&data_points=${data_points}`,
    "method": "GET",
    error: function (xhr, status, error) {
      console.log(JSON.parse(xhr.responseText))
    }
  };

  return $.ajax(settings).done(function (response) {
    object_response = JSON.parse(response)

    callback(object_response.data[0].social_volume)
  });
}

/**
 * Asks API for time series data.
 * @param {String} currency 
 * @param {Int} data_points 
 * @param {Function} callback 
 * @returns 
 */
function getAllData(currency, data_points, callback) {
  const settings = {
    "url": `https://api.lunarcrush.com/v2?data=assets&key=5kh3il7x10l2mk64va5jii&symbol=${currency}&data_points=${data_points}`,
    "method": "GET",
    error: function (xhr, status, error) {
      console.log(JSON.parse(xhr.responseText))
    }
  };

  return $.ajax(settings).done(function (response) {
    object_response = JSON.parse(response)

    console.log(object_response)

    for (let i = 0; i < object_response.data[0].timeSeries.length; i++) {
      callback(object_response.data[0].timeSeries[i])
    }
  });
}

/**
 * Is called from submit button in document.
 * Handles creating of first two graphs.
 */
async function submitClicked() {
  // select coin name, number of data points from document
  let coin = $("#selected_coin").val()
  let data_points = $("#data_points").val()

  // load all data
  let xValues = []
  let yValuesSocial = []
  let yValuesPrice = []

  startLoading()
  await getAllData(coin, data_points, (values) => {
    xValues.push(moment(values.time * 1000).format('YYYY-MM-DD HH:m:s'))
    yValuesSocial.push(values.social_volume)
    yValuesPrice.push(values.close)
  })

  // remove old graphs if they can be removed
  if (lineChartSocial) {
    lineChartSocial.destroy()
    lineChartPrice.destroy()
  }

  // create graphs
  lineChartSocial = new Chart("line_chart_social", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [{
        label: `Social volume ${coin}`,
        backgroundColor: "rgba(0,0,0,1.0)",
        borderColor: "rgba(0,0,0,0.1)",
        data: yValuesSocial
      }]
    },
    options: {
      title: {
        display: true,
        text: `Cryptocurrency social values for ${coin}`
      }
    }
  });

  lineChartPrice = new Chart("line_chart_price", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [{
        label: `Close price ${coin}`,
        backgroundColor: "rgba(0,0,0,1.0)",
        borderColor: "rgba(0,0,0,0.1)",
        data: yValuesPrice
      }]
    },
    options: {
      title: {
        display: true,
        text: `Cryptocurrency price values for ${coin}`
      }
    }
  });

  stopLoading()
}

/**
 * Fills doughnut chart with social data for BTC LTC SOL and XMR.
 */
async function fillDoughnutChart() {
  let barColors = [
    "rgba(255,0,0,1.0)",
    "rgba(0,255,0,1.0)",
    "rgba(0,0,255,1.0)",
    "rgba(255,255,0,1.0)",
    "rgba(0,255,255,1.0)",
  ];

  yValues = []

  // load data to display
  startLoading()
  await getSocialData("BTC", 1, (value) => yValues.push(value))
  await getSocialData("LTC", 1, (value) => yValues.push(value))
  await getSocialData("SOL", 1, (value) => yValues.push(value))
  await getSocialData("XMR", 1, (value) => yValues.push(value))

  let xValues = ["BTC", "LTC", "SOL", "XMR"];

  new Chart("doughnut_chart", {
    type: "pie",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      title: {
        display: true,
        text: "Cryptocurrency social values"
      }
    }
  });

  stopLoading()
}