// Element variable declartions
var stockCardEl = document.querySelector(".stock-card");
var companyInfoEl = document.querySelector(".company-info");
var stockCurrentEl = document.querySelector(".stock-current");
var stockPreviousEl = document.querySelector(".stock-previous");
var companyUrlEl = document.querySelector(".website");
var newsFeedEl = document.querySelector(".news-feed");
var previousStockTickersEl = document.querySelector(".search-results");
var addToWatchedEl = document.createElement("a");

// getting data from localStorage or default values
var stockTickers = JSON.parse(localStorage.getItem("stock-tickers")) || [];
var stockTickersDefault = ["AAPL"];

// rendering previously searched stock on side nav
var displayPreviousStockTickers = function (stockTickers) {
    var previousStockTickerUl = document.createElement("ul");
    for (var i = 0; i < stockTickers.length; i++) {
        var previousStockTickerLi = document.createElement("li");
        previousStockTickerLi.innerHTML = '<a href="#">' + stockTickers[i] + "</a>";
        previousStockTickersEl.appendChild(previousStockTickerUl);
        previousStockTickerUl.appendChild(previousStockTickerLi);
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
    // TO DO: add limit of 10 tickers
};

// fetching bloomberg market new end point through rapidapi to render at the bottom of the page
var getRapidApiNews = function () {
    fetch(
        "https://bloomberg-market-and-financial-news.p.rapidapi.com/stories/list?template=STOCK&id=usdjpy", {
            method: "GET",
            headers: {
                "x-rapidapi-host": "bloomberg-market-and-financial-news.p.rapidapi.com",
                "x-rapidapi-key": "8a1f46e1d8msh570b0c0e9eeb024p19ee6bjsn73741d7971e8",
            },
        }
    ).then(function (response) {
        response.json().then(function (data) {
            console.log("this is rapidApi: ", data.stories);
            if (data.stories) {
                for (var i = 0; i < 6; i++) {
                    var newsImage = data.stories[i].thumbnailImage;
                    var newsHeadline = data.stories[i].title;
                    var newsUrl = data.stories[i].shortURL;

                    var newsImageEl = document.createElement("div");
                    newsImageEl.classList = "card-stacked small col s2";
                    newsImageEl.innerHTML =
                        "<div class='card-image article-image'><img src='" +
                        newsImage +
                        "' class='responsive-img'/></div>";

                    var newsTitleEl = document.createElement("div");
                    newsTitleEl.classList = "action-card article-link";
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

// news Data
var getNewsData = function () {
    fetch(
        "https://finnhub.io/api/v1/company-news?symbol=AMZN&from=2020-10-26&to=2020-10-26&source='https://www.forbes.com'&token=bubka1v48v6ouqkj675g"
    ).then(function (response) {
        response.json().then(function (data) {
            console.log("Company News API call: ", data, data[0].headline);
            var stockNewsEl = document.createElement("div");
            stockNewsEl.classList = "card-image";
            stockNewsEl.innerHTML =
                "<img class='responsiv-img' src='" +
                data[0].image +
                "' alt='news'><span class='card-title>" +
                data[0].headline +
                "</span>";
            stockCardEl.appendChild(stockNewsEl);
        });
    });
};

// function to fetch stock prices
var getStockPrices = function (stockTicker) {
    fetch(
        "https://finnhub.io/api/v1/quote?symbol=" +
        stockTicker +
        "&token=bubka1v48v6ouqkj675g"
    ).then(function (response) {
        response.json().then(function (data) {

            stockCurrentEl.innerHTML = "";
            var currentPriceEl = document.createElement("td");
            currentPriceEl.textContent = Math.round(data.c * 100) / 100;
            stockCurrentEl.appendChild(currentPriceEl);
            stockPreviousEl.innerHTML = "";

            var previousPriceEl = document.createElement("td");
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
            "&token=bubka1v48v6ouqkj675g"
        )
        .then(function (stockResponse) {
            return stockResponse.json();
        })
        .then(function (data) {
            // initializing the innerHTMLs of all elements
            companyInfoEl.innerHTML = "";
            companyUrlEl.innerHTML = "";

            // getting the company logo
            var companyLogoEl = document.createElement("th");
            companyLogoEl.setAttribute("class", "card-image company-logo");
            var logoImgEl = document.createElement("img");
            logoImgEl.setAttribute("src", data.logo);
            logoImgEl.setAttribute("class", "responsive-img");
            logoImgEl.setAttribute("alt", "logo");
            companyLogoEl.append(logoImgEl);
            companyInfoEl.appendChild(companyLogoEl);

            // Display Company Name
            var nameEl = document.createElement("th");
            nameEl.setAttribute("style", "text-align: center");
            nameEl.textContent = data.name;
            companyInfoEl.appendChild(nameEl);

            //D isplay Stock Ticker
            var symbolEl = document.createElement("th");
            symbolEl.textContent = data.ticker;
            companyInfoEl.appendChild(symbolEl);

            // function to generate the current and Open price
            getStockPrices(data.ticker);

            // Display Website URL
            var webUrlEl = document.createElement("td");
            webUrlEl.innerHTML = "<a href='" + data.weburl + "'>" + data.name;
            companyUrlEl.appendChild(webUrlEl);

            // save stock ticker in local storage as per extracted from api not as typed
            storeStockTickers(data.ticker);
        });
};

// rendering stored list of stock tickers from local storage, starting with one value
var renderStoredStockTickers = function (i = 0) {
    if (stockTickers.length === 0) {
        //for (var i = 0; i < stockTickersDefault.length; i++) {
        getCompanyData(stockTickersDefault[i]);
        //}
    } else {
        //for (var i = 0; i < stockTickers.length; i++) {
        getCompanyData(stockTickers[i]);
        //}
    }
};

var previousStockTickersHandler = function (event) {
    var stockTickerSelected = event.target.textContent;

    // calling function to render previously searched tickers on click event
    getCompanyData(stockTickerSelected);
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
    getCompanyData(stockTicker);

});

// render stock clicked from previous searched side-nav
previousStockTickersEl.addEventListener("click", previousStockTickersHandler);

// This shows up as default on the page before the page is cleared to have a search result.
//getCompanyData('AAPL');

// initliaze interactive elements for Materialize
$(document).ready(function () {
    $(".sidenav").sidenav();
});