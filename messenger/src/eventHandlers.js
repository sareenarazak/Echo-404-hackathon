// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        //if user said a one shot command that triggered an intent event,
        //it will start a new session, and then we should avoid speaking too many words.
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        //Speak welcome message and ask user questions
        //based on whether there are players or not.
        var empty = storage.hasUsers();
        var speechOutput = '',
                reprompt;
        if(!empty)
        {
            speechOutput += 'Welcome to messenger! How can I help you?'
            reprompt = textHelper.nextHelp;
        }
        else
        {
            speechOutput += 'Welcome to messenger! Do you want to set up your user account'
            reprompt = textHelper.completeHelp;
        }
        response.ask(speechOutput, reprompt);
    
    };
};
exports.register = registerEventHandlers;