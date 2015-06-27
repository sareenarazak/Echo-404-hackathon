// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var session.userName = null;
var session.repeatRecipient = false;
var session.repeatMessage = false;

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.MyNameIntent = function (intent, session, response) {
        if (session.userName) {
            response.ask("Am I not talking to " + session.userName + " ?");
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
            storage.loadMessages(session, function (currentMessages) {
                currentMessages.addMember(memberName, function (success) {
                    if (success) {
                        response.tell(memberName + " added successfully to your echo family.");
                    } else {
                        response.tell(memberName + " is already a part of your echo family.")
                    }
                    
                });
            });
        }
    }

    intentHandlers.SendMessageIntent = function (intent, session, response) {
        var recipient = intent.slots.Sender.value;
        if (!recipient && !session.repeatRecipient) {
            response.ask("Sorry, I didn\'t get that. Who would you like to deliver this message to?");
            session.repeatRecipient = true;
            return;
        } else if (!recipient && session.repeatRecipient) {
            session.repeatRecipient = false;
            response.tell("Please, repeat your message and whom you want to send it.");
            return;
        }
        else if (session.repeatRecipient && session.message) {
            session.repeatRecipient = false;
            session.recipient = recipient;
            storage.saveMessage(session, function (success) {
                if(success) {
                    response.tell("Don't you worry! " + recipient + " will receive your message!");
                    session.recipient = null;
                    session.message = null;
                } else {
                    response.tell("Please, repeat your message and whom you want to send it.");
                }
            })
            return;
        }

        var message = intent.slots.Message.value;
        if (!message && !session.repeatMessage) {
            response.ask("Sorry, I didn\'t get that. Can you repeat your message?");
            session.repeatMessage = true;
            return;
        } else if (!message && session.repeatMessage) {
            response.tell("Please, repeat your message and whom you want to send it.");
            session.repeatMessage = false;
            return;
        }
        else {
            session.message = message;
            session.recipient = recipient;
            storage.saveMessage(session, function (success) {
                if(success) {
                    response.tell("Don't you worry! " + recipient + " will receive your message!");
                    session.recipient = null;
                    session.message = null;
                } else {
                    response.tell("I can't find " + recipient + " in your echo family. Who is that again?");
                    session.repeatRecipient = true;
                }
            });
            return;
        }
    }
};
exports.register = registerIntentHandlers;