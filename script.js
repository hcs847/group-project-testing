// Element variable declartions
var stockCardEl = document.querySelector(".stock-card");
var companyInfoEl = document.querySelector(".stock-info");
var companyLogoEl = document.querySelector(".company-logo");

var stockCurrentEl = document.querySelector(".current-price");
var stockPreviousEl = document.querySelector(".previous-price");
var companyUrlEl = document.querySelector(".website-url");
var newsFeedEl = document.querySelector(".news-feed");
var stockNewsEl = document.querySelector(".stock-news");


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
    // debugger;
    var mainDate = now.format("YYYY-MM-DD");
    //var mainDate = moment('today', 'YYYY-MM-DD');
    var oldDate = moment().subtract('days', 7).format('YYYY-MM-DD');
    var newsURL = "https://finnhub.io/api/v1/company-news?symbol=" + stockTicker + "&from=" + oldDate + "&to=" + mainDate + "&token=bufqlff48v6veg4jhmcg";

    console.log(newsURL, oldDate, mainDate);

    fetch(newsURL)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    //alert("successful");
                    console.log(data);
                    displayNewsData(data);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            // Notice this `.catch()` getting chained onto the end of the `.then()` method
            alert("Unable to connect to API");
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
            nameEl.setAttribute("class", "col s7 m7 l7 center-align company-info blue-text text-darken-3");
            nameEl.textContent = data.name;
            companyInfoEl.appendChild(nameEl);

            //D isplay Stock Ticker
            var symbolEl = document.createElement("div");
            symbolEl.setAttribute("class", "col s3 m3 l3 center-align company-info blue-text text-darken-3");

            symbolEl.textContent = data.ticker;
            companyInfoEl.appendChild(symbolEl);

            // function to generate the current and Open price
            getStockPrices(data.ticker);

            // Display Website URL
            var webUrlEl = document.createElement("p");
            webUrlEl.innerHTML = "<a href='" + data.weburl + "' target='_blank'>" + data.name + "</a>";
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
        getNewsData(stockTickersDefault[i]);
        //}
    } else {
        //for (var i = 0; i < stockTickers.length; i++) {
        getCompanyData(stockTickers[i]);
        getNewsData(stockTickers[i]);
        //}
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
    console.log(stockTicker);
    getCompanyData(stockTicker);

    // add function for getting stock news
    getNewsData(stockTicker);
});

// render stock clicked from previous searched side-nav
previousStockTickersEl.addEventListener("click", previousStockTickersHandler);

// This shows up as default on the page before the page is cleared to have a search result.
//getCompanyData('AAPL');

// initliaze interactive elements for Materialize
$(document).ready(function () {
    $('.sidenav').sidenav();
});

//display News Data
var displayNewsData = function (data) {

    var results = data.list;

    //debugger;
    alert("successful");

    stockNewsEl.innerHTML = "";
    if (data.length === 0) {
        stockNewsEl.textContent = "No data found.";
        return;
    }

    // filter results to including images
    var filteredData = data.filter(function (article) {
        return article.image;
    });

    // rendering stock news title
    var newsTitleEl = document.createElement("div");
    newsTitleEl.classList = "col s12 m12 l12 white-text blue-grey darken-4 stock-news-title center";
    newsTitleEl.innerHTML = "<h4>Stock News</h4>";
    stockNewsEl.appendChild(newsTitleEl);

    for (var i = 0; i < 4; i++) {
        // checking if image is available

        var newsEl = document.createElement("div");
        newsEl.classList = "row white";
        // newsEl.classList = "card-image company-logo";
        //stockNewsEl.classList = "card-img-top";
        newsEl.innerHTML = "<div class='col s4 m4 l4 article-image'><img class='responsive-img' src='" + filteredData[i].image + "' alt='news'></div>";
        //stockNewsEl.appendChild(newsEl);
        stockNewsEl.appendChild(newsEl);

        var stockNewsUrlEl = document.createElement("div");
        stockNewsUrlEl.classList = "col s8 m8 l8 white";
        //newsEl.append(newsUrlEl);
        // var newsUrlEl = document.createElement("p");
        stockNewsUrlEl.innerHTML = "<p class='article-link'><a href='" + filteredData[i].url + "' target='_blank'>" + filteredData[i].headline + '</a></p>';
        newsEl.appendChild(stockNewsUrlEl);


    }
}