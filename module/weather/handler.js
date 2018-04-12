'use strict';
var weather = require('./weather.js');
var config = require('./config/config.json');
const queryString = require('query-string');
const debug = require('debug')('weather');
debug.enabled = true;
module.exports.weather = (event, context, callback) => {
    const body = queryString.parse(event.body);
    debug("Event", event);
    debug("Body", body);
    var cityName = body.text ? body.text.trim() : null;
    var isMattermostCommand = body.token === config.mattermostCommandToken;
    debug('isMattermostCommand:' + isMattermostCommand);
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
        debug(lambdaResponse);
        callback(null, lambdaResponse);
    }).catch(function (reason) {
        debug('[FAIL] Unable to get weather: ' + reason);
        debug('[FAIL] Unable to get weather [reason.response.body]: ' + reason.response.body);
        const lambdaResponse = {
            "statusCode": 200,
            "body": reason.response.body
        };
        callback(null, lambdaResponse);
    });
};