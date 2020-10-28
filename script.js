var stockCardEl = document.querySelector(".stock-card")
var todayQuoteEl = document.querySelector("#image-1");
var companyInfoEl = document.querySelector(".company-info");
var stockCurrentEl = document.querySelector(".stock-current");
var stockPreviousEl = document.querySelector(".stock-previous");
var addToWatchedEl = document.createElement("a");

var getStockPrices = function () {
    fetch("https://finnhub.io/api/v1/quote?symbol=AMZN&token=bubka1v48v6ouqkj675g").then(function (response) {
        response.json().then(function (data) {
            console.log("First API call: ", data);
            var currentPriceEl = document.createElement("td");
            currentPriceEl.textContent = Math.round(data.c * 100) / 100;
            stockCurrentEl.appendChild(currentPriceEl);

            var previousPriceEl = document.createElement("td");
            previousPriceEl.textContent = Math.round(data.pc * 100) / 100;
            stockPreviousEl.appendChild(previousPriceEl);

        })
    })
};

// dynamically render dates based on user's input
var getNewsData = function () {
    fetch("https://finnhub.io/api/v1/company-news?symbol=AMZN&from=2020-10-26&to=2020-10-26&source=marketwatch&token=bubka1v48v6ouqkj675g").then(function (response) {
        response.json().then(function (data) {
            console.log("Second API call: ", data[0]);
            //todayQuoteEl.innerHTML = "<img src='" + data[0].image + "'alt='news'>";
            //data[0].headline
        })
    })
};

var getCompanyData = function () {
    fetch("https://finnhub.io/api/v1/stock/profile2?symbol=AMZN&token=bubka1v48v6ouqkj675g").then(function (response) {
        response.json().then(function (data) {
            console.log("third API call: ", data, data.name, data.ticker);
            todayQuoteEl.innerHTML = "<img src='" + data.logo + "' class='responsive-img' alt='logo'>";
            // button to add to favorite -- add event listner
            addToWatchedEl.classList = "btn-small btn-floating halfway-fab waves-effect waves-light red";
            addToWatchedEl.innerHTML = "<i class ='small material-icons'>add</i>";
            stockCardEl.appendChild(addToWatchedEl);

            var nameEl = document.createElement("th");
            nameEl.textContent = data.name;
            companyInfoEl.appendChild(nameEl);

            var symbolEl = document.createElement("th");
            symbolEl.textContent = data.ticker;
            companyInfoEl.appendChild(symbolEl);

            getStockPrices();

        })
    })
};

getCompanyData();
getNewsData();

// initliaze interactive elements - buttons