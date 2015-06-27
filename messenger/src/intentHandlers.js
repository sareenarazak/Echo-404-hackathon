// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var session.data.userName = null;
var session.data.repeatRecipient = false;
var session.data.repeatMessage = false;

var registerIntentHandlers = function (intentHandlers) {
    intentHandlers.MyNameIntent = function (intent, session, response) {
        if (session.data.userName) {
            response.ask("Am I not talking to " + session.data.userName + " ?");
        } else {
            userName = intent.slots.Member.value;
            if (!userName) {
                response.ask("Who am I talking to?", "Can you please state your name?");
            } else {
                response.tell("Welcome " + userName);
            }
        }
    }

    intentHandlers.AddMemberIntent = function (intent, session, response) {
        var memberName = intent.slots.Member.value;
        if (!memberName) {
            response.ask("Sorry, I didn\'t get that. Who would you like to add?");
        } else {
            session.addMember(memberName, function (success) {
                if (success) {
                    response.tell(memberName + " added successfully to your echo family.");
                } else {
                    response.tell(memberName + " is already a part of your echo family.")
                }
            });
        }
    }

    intentHandlers.SendMessageIntent = function (intent, session, response) {
        if (!session.data.userName) {
            response.ask("Who am I talking to?", "Can you please state your name?");
        } else {
            session.data.sender = session.data.userName;
        }

        var recipient = intent.slots.userName.value;
        if (!recipient && !session.data.repeatRecipient) {
            response.ask("Sorry, I didn\'t get that. Who would you like to deliver this message to?");
            session.data.repeatRecipient = true;
            return;
        } else if (!recipient && session.data.repeatRecipient) {
            session.data.repeatRecipient = false;
            response.tell("Please, repeat your message and whom you want to send it.");
            return;
        }
        else if (session.data.repeatRecipient && session.data.message) {
            session.data.repeatRecipient = false;
            session.data.recipient = recipient;
            session.saveMessage(function (success) {
                if(success) {
                    response.tell("Don't you worry! " + recipient + " will receive your message!");
                    session.data.recipient = null;
                    session.data.message = null;
                } else {
                    response.tell("Please, repeat your message and whom you want to send it.");
                }
            });
            return;
        }

        var message = intent.slots.Message.value;
        if (!message && !session.data.repeatMessage) {
            response.ask("Sorry, I didn\'t get that. Can you repeat your message?");
            session.data.repeatMessage = true;
            return;
        } else if (!message && session.data.repeatMessage) {
            response.tell("Please, repeat your message and whom you want to send it.");
            session.data.repeatMessage = false;
            return;
        }
        else {
            session.data.message = message;
            session.data.recipient = recipient;
            session.saveMessage(function (success) {
                if(success) {
                    response.tell("Don't you worry! " + recipient + " will receive your message!");
                    session.data.recipient = null;
                    session.data.message = null;
                } else {
                    response.tell("Please, repeat your message and whom you want to send it.");
                }
            });
            return;
        }
    }
};
exports.register = registerIntentHandlers;