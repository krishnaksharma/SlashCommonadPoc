var requestPromise = require('request-promise');

module.exports = {
    byCity: getWeather
};

function getWeather(city) {
    return requestPromise('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=Metric&appid=568a5352e301d762097e813514a2d82f')
        .then(function (body) {
            var response = JSON.parse(body);
            return response;
        });
}