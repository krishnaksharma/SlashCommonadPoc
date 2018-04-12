'use strict';
var config = require('../hrms/config/config.json');
const queryString = require('query-string');
var hrms = require('./hrms');
const debug = require('debug')('hrmsHandler');
debug.enabled = true;
module.exports.interviewee = (event, context, callback) => {
    const body = queryString.parse(event.body);
    debug("Event", event);
    debug("Body", body);
    var username = body.username ? body.username.trim() : null;
    var date = body.text ? body.text.trim() : null;
    var isMattermostCommand = body.token === config.mattermostCommandToken;
    debug('isMattermostCommand:' + isMattermostCommand);
    hrms.listInterviewee(username + "@synerzip.com", date).then(function (response) {
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
        debug('lambdaResponse:\n');
        debug(lambdaResponse);
        callback(null, lambdaResponse);
    }).catch(function (reason) {
        console.log(TAG, '[FAIL] Unable to get interviewee list [reason.response.body]: \n' + reason.response.body);
        const lambdaResponse = {
            "statusCode": 200,
            "body": reason.response.body
        };
        callback(null, lambdaResponse);
    });
};

function createLambdaResponseCard(response) {
    return {
        "statusCode": 200,
        "body": JSON.stringify(response)
    };
}