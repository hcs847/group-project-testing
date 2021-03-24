// API keys variables
var finHubKey = config.finHubToken;
var rapidApiKey = config.rapidApiKey;

// Element variable declartions
var companyInfoEl = document.querySelector(".stock-info");
var companyLogoEl = document.querySelector(".company-logo");
var searchEl = document.querySelector("#search");
var stockCurrentEl = document.querySelector(".current-price");
var stockPreviousEl = document.querySelector(".previous-price");
var companyUrlEl = document.querySelector(".website-url");
var newsFeedEl = document.querySelector(".news-feed");
var stockNewsEl = document.querySelector(".stock-news");
var previousStockTickersEl = document.querySelector(".search-results");

// getting data from localStorage or default values
var stockTickers = JSON.parse(localStorage.getItem("stock-tickers")) || [];
var stockTickersDefault = "ZM";

// rendering previously searched stock on side nav
var displayPreviousStockTickers = function (stockTickers) {
  if (stockTickers.length <= 9) {
    var previousStockTickerUl = document.createElement("ul");
    for (var i = stockTickers.length - 1; i >= 0; i--) {
      var previousStockTickerLi = document.createElement("li");
      previousStockTickerLi.innerHTML =
        '<a href="#">' + stockTickers[i] + "</a>";
      previousStockTickersEl.appendChild(previousStockTickerUl);
      previousStockTickerUl.appendChild(previousStockTickerLi);
    }
  } else {
    // remove first item from array when previously searched stock are over 10
    stockTickers.shift();
    // call the the display previously searched function after trunctation to 10
    displayPreviousStockTickers(stockTickers);
  }
};

// saving searched stock into local storage
var storeStockTickers = function (stockTicker) {
  if (!stockTickers.includes(stockTicker)) {
    stockTickers.push(stockTicker);
    localStorage.setItem("stock-tickers", JSON.stringify(stockTickers));
    previousStockTickersEl.textContent = "";

    // call function to display previously searched
    displayPreviousStockTickers(stockTickers);
  }
};

// fetching bloomberg market new end point through rapidapi to render at the bottom of the page
var getRapidApiNews = function () {
  fetch(
    "https://bloomberg-market-and-financial-news.p.rapidapi.com/stories/list?template=STOCK&id=usdjpy", {
    method: "GET",
    headers: {
      "x-rapidapi-host": "bloomberg-market-and-financial-news.p.rapidapi.com",
      "x-rapidapi-key": rapidApiKey,
    },
  }
  ).then(function (response) {
    response.json().then(function (data) {
      if (data.stories) {
        for (var i = 0; i < 6; i++) {
          var newsImage = data.stories[i].thumbnailImage;
          var newsHeadline = data.stories[i].title;
          var newsUrl = data.stories[i].shortURL;

          var newsImageEl = document.createElement("div");
          newsImageEl.classList = "col s6 m6 l4";
          newsImageEl.innerHTML =
            "<div class='col s4 m4 l4'><img src='" +
            newsImage +
            "' class='responsive-img'/></div>";
          var newsTitleEl = document.createElement("div");
          newsTitleEl.classList = "col s8 m8 l8 article-link";
          newsTitleEl.innerHTML =
            "<a class='black-text' href='" +
            newsUrl +
            "' target='_blank'>" +
            newsHeadline +
            "</a>";
          newsImageEl.appendChild(newsTitleEl);
          newsFeedEl.appendChild(newsImageEl);
        }
      }
    });
  });
};

// function to get stock news
var getNewsData = function (stockTicker) {
  var st = stockTicker;
  let now = moment();
  var mainDate = now.format("YYYY-MM-DD");
  var oldDate = moment().subtract("days", 14).format("YYYY-MM-DD");
  var newsURL =
    "https://finnhub.io/api/v1/company-news?symbol=" +
    stockTicker +
    "&from=" +
    oldDate +
    "&to=" +
    mainDate +
    "&token=" +
    finHubKey;

  fetch(newsURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayNewsData(data);
        });
      } else {
        //alert("Error: " + response.statusText);
        console.log("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      // Notice this `.catch()` getting chained onto the end of the `.then()` method
      //alert("Unable to connect to API");
      console.log("Unable to connect to API");
    });
};

// function to fetch stock prices
var getStockPrices = function (stockTicker) {
  fetch(
    "https://finnhub.io/api/v1/quote?symbol=" +
    stockTicker +
    "&token=" +
    finHubKey
  ).then(function (response) {
    response.json().then(function (data) {
      stockCurrentEl.innerHTML = "";
      var currentPriceEl = document.createElement("p");
      currentPriceEl.textContent = Math.round(data.c * 100) / 100;
      stockCurrentEl.appendChild(currentPriceEl);

      stockPreviousEl.innerHTML = "";
      var previousPriceEl = document.createElement("p");
      previousPriceEl.textContent = Math.round(data.pc * 100) / 100;
      stockPreviousEl.appendChild(previousPriceEl);
    });
  });
};

// This Function is called when search is clicked.
// This is dynamically run with the value of the #search field elemnet
var getCompanyData = function (stockTicker) {
  fetch(
    "https://finnhub.io/api/v1/stock/profile2?symbol=" +
    stockTicker +
    "&token=" +
    finHubKey
  )
    .then(function (stockResponse) {
      return stockResponse.json();
    })
    .then(function (data) {
      if (data.name == undefined || data.name == null || data.name == "") {
        console.log("data is empty");
        $("#error-msg").empty();
        var errorMsg = $("#error-msg");
        var displayError = document.createElement("p");
        displayError.setAttribute("style", "color:red");
        displayError.innerHTML = "Please enter a valid Stock Ticker";
        errorMsg.append(displayError);
      } else {
        // initializing the innerHTMLs of all elements
        companyInfoEl.innerHTML = "";
        companyUrlEl.innerHTML = "";
        $("#error-msg").empty();

        // getting the company logo
        var companyLogoEl = document.createElement("div");
        companyLogoEl.setAttribute("class", "col s2 m2 l2 center-align");
        var logoImage = document.createElement("div");
        logoImage.setAttribute("class", "card-image company-logo");
        var logoImgEl = document.createElement("img");
        logoImgEl.setAttribute("src", data.logo);
        logoImgEl.setAttribute("class", "responsive-img");
        logoImgEl.setAttribute("alt", "logo");
        logoImage.append(logoImgEl);
        companyLogoEl.append(logoImage);
        companyInfoEl.appendChild(companyLogoEl);

        // Display Company Name
        var nameEl = document.createElement("div");
        nameEl.setAttribute(
          "class",
          "col s7 m7 l7 center-align company-info blue-text text-darken-3"
        );
        nameEl.textContent = data.name;
        companyInfoEl.appendChild(nameEl);

        // Display Stock Ticker
        var symbolEl = document.createElement("div");
        symbolEl.setAttribute(
          "class",
          "col s3 m3 l3 center-align company-info blue-text text-darken-3"
        );

        symbolEl.textContent = data.ticker;
        companyInfoEl.appendChild(symbolEl);

        // function to generate the current and Open price
        getStockPrices(data.ticker);

        // Display Website URL
        var webUrlEl = document.createElement("p");
        webUrlEl.innerHTML =
          "<a href='" + data.weburl + "' target='_blank'>" + data.name + "</a>";
        companyUrlEl.appendChild(webUrlEl);

        // save stock ticker in local storage as per extracted from api not as typed
        storeStockTickers(data.ticker);

        // clear the search input element
        searchEl.value = "";
      }
    });
};

// rendering stored list of stock tickers from local storage, starting with one value
var renderStoredStockTickers = function () {
  if (stockTickers.length === 0) {
    getCompanyData(stockTickersDefault);
    getNewsData(stockTickersDefault);
  } else {
    // displaying last searched stock
    getCompanyData(stockTickers[stockTickers.length - 1]);
    getNewsData(stockTickers[stockTickers.length - 1]);
  }
};

var previousStockTickersHandler = function (event) {
  var stockTickerSelected = event.target.textContent;

  // calling function to render previously searched tickers on click event
  getCompanyData(stockTickerSelected);

  // calling the stock news function to render stock news
  getNewsData(stockTickerSelected);
};

// calling function to display previously searched stock
displayPreviousStockTickers(stockTickers);

// Calling function to render previously searched tickers on the side nav
renderStoredStockTickers();

// calling the news api to render market news in the footer
getRapidApiNews();

// Event Listener for the search icon, when clicked will run the getCompanyData function to display stock information.
$(document).on("click", ".search-icon", function () {
  // getting the search value.
  var stockTicker = document.querySelector("#search").value;
  // calling stockTicker;
  getCompanyData(stockTicker);

  // call function for getting stock news
  getNewsData(stockTicker);
});
// Event Listener for the search icon, when enter is pressed it  will run the getCompanyData function to display stock information.

$(document.querySelector("#search")).keypress(function (e) {
  if (e.which == 13) {
    // code 13 is enter key in most browsers
    // getting the search value.
    var stockTicker = document.querySelector("#search").value;
    getCompanyData(stockTicker);
    // call function for getting stock news
    getNewsData(stockTicker);
  }
});
// render stock clicked from previous searched side-nav
previousStockTickersEl.addEventListener("click", previousStockTickersHandler);

// initliaze interactive elements for Materialize
$(document).ready(function () {
  $(".sidenav").sidenav();
});

//display News Data
var displayNewsData = function (data) {
  var results = data.list;

  stockNewsEl.innerHTML = "";
  if (data.length === 0) {
    stockNewsEl.textContent = "No data found.";
    return;
  }

  // filter results to articles including images
  var filteredData = data.filter(function (article) {
    return article.image;
  });

  // rendering stock news title
  var newsTitleEl = document.createElement("div");
  newsTitleEl.classList = "row";
  newsTitleEl.innerHTML =
    "<div class='col s12 m12 l12 white-text blue-grey darken-4 stock-news-title center'><h4>Stock News</h4></div>";
  stockNewsEl.appendChild(newsTitleEl);

  for (var i = 0; i < 4; i++) {
    var newsEl = document.createElement("div");
    newsEl.classList = "row";
    newsEl.innerHTML =
      "<div class='col s4 m4 l4 article-image'><img class='responsive-img' src='" +
      filteredData[i].image +
      "' alt='news'></div>";
    stockNewsEl.appendChild(newsEl);

    var stockNewsUrlEl = document.createElement("div");
    stockNewsUrlEl.classList = "col s8 m8 l8 white";
    stockNewsUrlEl.innerHTML =
      "<p class='article-link'><a href='" +
      filteredData[i].url +
      "' target='_blank'>" +
      filteredData[i].headline +
      "</a></p>";
    newsEl.appendChild(stockNewsUrlEl);
  }
};