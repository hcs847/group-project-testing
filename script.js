var stockCardEl = document.querySelector(".stock-card")
var todayQuoteEl = document.querySelector("#image-1");
var companyInfoEl = document.querySelector(".company-info");
var stockCurrentEl = document.querySelector(".stock-current");
var stockPreviousEl = document.querySelector(".stock-previous");
var companyUrlEl = document.querySelector(".website");
var newsFeedEl = document.querySelector(".news-feed");
var addToWatchedEl = document.createElement("a");


var getRapidApiNews = function () {
    fetch("https://bloomberg-market-and-financial-news.p.rapidapi.com/stories/list?template=STOCK&id=usdjpy", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "bloomberg-market-and-financial-news.p.rapidapi.com",
            "x-rapidapi-key": "8a1f46e1d8msh570b0c0e9eeb024p19ee6bjsn73741d7971e8"
        }
    }).then(function (response) {
        response.json().then(function (data) {
            console.log("this is rapidApi: ", data.stories);
            if (data.stories) {
                for (var i = 0; i < 6; i++) {
                    var newsImage = data.stories[i].thumbnailImage;
                    var newsHeadline = data.stories[i].title;
                    var newsUrl = data.stories[i].shortURL;

                    var newsImageEl = document.createElement("div");
                    newsImageEl.classList = "card-stacked small";
                    newsImageEl.innerHTML = "<div class='card-image article-image'><img src='" +
                        newsImage + "' class='responsive-img'/></div>";

                    var newsTitleEl = document.createElement("div");
                    newsTitleEl.classList = "action-card article-link";
                    newsTitleEl.innerHTML = "<a href='" + newsUrl + "' target='_blank'>" + newsHeadline + "</a>";
                    newsImageEl.appendChild(newsTitleEl);
                    newsFeedEl.appendChild(newsImageEl);
                }
            }
        })
    })
}

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
    fetch("https://finnhub.io/api/v1/company-news?symbol=AMZN&from=2020-10-26&to=2020-10-26&source='https://www.forbes.com'&token=bubka1v48v6ouqkj675g").then(function (response) {
        response.json().then(function (data) {
            console.log("Second API call: ", data, data[0].headline);
            var stockNewsEl = document.createElement("div");
            stockNewsEl.classList = "card-image";
            stockNewsEl.innerHTML = "<img class='responsiv-img' src='" + data[0].image + "' alt='news'><span class='card-title>" + data[0].headline + '</span>';
            stockCardEl.appendChild(stockNewsEl);

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

            var webUrlEl = document.createElement("td");
            webUrlEl.innerHTML = "<a href='" + data.weburl + "'>" + data.name;
            companyUrlEl.appendChild(webUrlEl);

            getStockPrices();

        })
    })
};

getCompanyData();
// getNewsData(); 
getRapidApiNews();

// initliaze interactive elements materialize