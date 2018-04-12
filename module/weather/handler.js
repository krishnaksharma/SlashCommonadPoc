'use strict';
var weather = require('./weather.js');
var config = require('./config/config.json');
const queryString = require('query-string');
module.exports.weather = (event, context, callback) => {
    console.log('[EVENT] ', event);
    const body = queryString.parse(event.body);
    console.log("[EVENT BODY] ", body);
    console.log("[EVENT BODY TEXT] ", body.text);
    var cityName = body.text ? body.text.trim() : null;
    var isMattermostCommand = body.token === config.mattermostCommandToken;
    console.log('[EVENT] isMattermostCommand ', isMattermostCommand);

    weather.byCity(cityName).then(function (response) {
        var apiResponse;
        if (isMattermostCommand) {
            const mattermostResponse = {
                'text': JSON.stringify(response),
                'response_type': 'in_channel'
            };
            apiResponse = mattermostResponse;
        } else {
            apiResponse = response;
        }
        const lambdaResponse = {
            "statusCode": 200,
            "body": JSON.stringify(apiResponse)
        };
        console.log('lambdaResponse: ', lambdaResponse);
        callback(null, lambdaResponse);
    }).catch(function (reason) {
        console.log('[FAIL] Unable to get weather: ', reason);
        console.log('[FAIL] Unable to get weather [reason.response.body]: ', reason.response.body);
        const lambdaResponse = {
            "statusCode": 200,
            "body": reason.response.body
        };
        callback(null, lambdaResponse);
    });
};