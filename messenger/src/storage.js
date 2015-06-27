// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The MessengerSession class stores all game states for the user
     */
    function MessengerSession(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                sender: '',
                recipient: '',
                message: ''
            };
        }
        this._session = session;
    }

    // all of this stuff pertains to a specific session
    // where the user is leaving a message
    MessengerSession.prototype = {
        isMessageSet: function () {
            return this.data.message != '';
        },
        isRecipientSet: function () {
            return this.data.recipient != '';
        },
        isSenderSet: function () {
            return this.data.sender != '';
        },

        // this should only be reached/called when the above three 
        // functions have been verified (session has sender, recip, msg)
        saveMessage: function (callback) {

            function doesRecipientExist(recip) {
                if (recip) {
                    return dynamodb.getItem({
                        TableName: 'usersTable',
                        Key: {
                            userName: {
                                S: recip
                        }
                    });
                }
            }

            var recipExist = doesRecipientExist(this.data.recipient);
            if (recipExist && recipExist.length) {

                // sender, recipient, message
                this._session.attributes.currentMessage = this.data;

                var recipTable = this.data.recipient + 'Messages';

                var newMsg = {
                    sender: this.data.sender,
                    time: '',// TODO: get time
                    message: this.data.message
                };

                dynamodb.putItem({
                    TableName: recipTable, //TODO: create DB and update with name
                    Item: {
                        time: '', //TODO: get time
                        sender: this.data.sender,                        
                        message: this.data.message
                    }
                }, function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    }
                    if (callback) {
                        callback();
                });
            }
        }
    };

    return {
        hasUsers: function (session, callback) { // done

            var scanResults = dynamodb.scan({
                TableName: 'usersTable'
            });
            return scanResults && scanResults.length;

        },
        loadMessages: function (session, callback) {

            // if (session.attributes.currentGame) {
            //     console.log('get game from session=' + session.attributes.currentGame);
            //     callback(new Game(session, session.attributes.currentGame));
            //     return;
            // }
            // dynamodb.getItem({
            //     TableName: 'ScoreKeeperUserData',
            //     Key: {
            //         CustomerId: {
            //             S: session.user.userId
            //         }
            //     }
            // }, function (err, data) {
            //     var currentGame;
            //     if (err) {
            //         console.log(err, err.stack);
            //         currentGame = new Game(session);
            //         session.attributes.currentGame = currentGame.data;
            //         callback(currentGame);
            //     } else if (data.Item === undefined) {
            //         currentGame = new Game(session);
            //         session.attributes.currentGame = currentGame.data;
            //         callback(currentGame);
            //     } else {
            //         console.log('get game from dynamodb=' + data.Item.Data.S);
            //         currentGame = new Game(session, JSON.parse(data.Item.Data.S));
            //         session.attributes.currentGame = currentGame.data;
            //         callback(currentGame);
            //     }
            // });
        },
        newMessage: function (session) {
            return new MessengerSession(session);
        }
    };
})();
module.exports = storage;