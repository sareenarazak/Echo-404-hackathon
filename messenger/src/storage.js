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

        doesMemberExist: function(member) {
            return dynamodb.getItem({
                TableName: 'usersTable',
                Key: {
                    userName: {
                        S: member
                }
            });
        }

        addMember: function (memberName, callback) {
            if (!doesMemberExist(member)) {
                dynamodb.putItem({
                    TableName: 'usersTable',
                    Item: {
                        'userName': memberName
                    }
                });

                callback(true);
            }
            callback(false);
        },
        isMessageSet: function () {
            return this.data.message != '';
        },
        isRecipientSet: function () {
            return this.data.recipient != '';
        },
        isSenderSet: function () {
            return this.data.sender != '';
        },
        getMessages: function (session, callback) {

            var userTableName = session.data.userName + 'Messages';
            dynamodb.scan({
                TableName: userTableName,
                AttributesToGet: [
                    'time',
                    'sender',
                    'message'
                ]
            }, function (err, data) {
                if (err || data === undefined) {
                    callback(false);
                } else {
                    callback(JSON.parse(data));
                }
            });
        },

        // this should only be reached/called when the above three 
        // functions have been verified (session has sender, recip, msg)
        saveMessage: function (callback) {

            var recipExist = doesMemberExist(this.data.recipient);
            if (recipExist && recipExist.length) {

                // sender, recipient, message
                this._session.attributes.currentMessageSession = this.data;

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
        newMessage: function (session) {
            return new MessengerSession(session);
        }
    };
})();
module.exports = storage;











