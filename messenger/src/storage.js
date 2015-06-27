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

        doesMemberExist: function (member) {
            return dynamodb.getItem({
                TableName: 'usersTable',
                Key: {
                    userName: {
                        S: member
                    }
                }
            });
        },

        addMember: function (memberName, callback) {
            if (!this.doesMemberExist(memberName)) {

                // add new member to the users table
                dynamodb.putItem({
                    TableName: 'usersTable',
                    Item: {
                        'userName': memberName
                    }
                });

                // create a messages table for the new member
                var params = {
                    AttributeDefinitions: [
                        {
                            AttributeName: 'userId',
                            AttributeType: 'N'
                        },
                        {
                            AttributeName: 'sender',
                            AttributeType: 'S'
                        },
                        {
                            AttributeName: 'time',
                            AttributeType: 'N'
                        },
                        {
                            AttributeName: 'message',
                            AttributeType: 'S'
                        }
                    ],
                    KeySchema: [
                        {
                            AttributeName: 'Message ID',
                            KeyType: 'HASH'
                        }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 3,
                        WriteCapacityUnits: 3
                    },
                    TableName: memberName + 'Messages'
                };
                dynamodb.createTable(params, function (err, data) {
                    if (err) {
                        console.log(err, err.stack); // an error occurred
                    } else {
                        callback(true, data);
                    }
                });
            }
            callback(false);
        },
        isMessageSet: function () {
            return this.data.message !== '';
        },
        isRecipientSet: function () {
            return this.data.recipient !== '';
        },
        isSenderSet: function () {
            return this.data.sender !== '';
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

            var recipExist = this.doesMemberExist(this.data.recipient);
            if (recipExist && recipExist.length) {

                // sender, recipient, message
                this._session.attributes.currentMessageSession = this.data;

                var recipTable = this.data.recipient + 'Messages';

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
                        callback(data);
                    }
                });
            }
        }
    };

    return {
        hasUsers: function (session, callback) { // done
            var scanResults = dynamodb.scan({
                TableName: 'usersTable'
            });

            if (callback) {
                callback(session);
            }
            return scanResults && scanResults.length;
        },
        newMessage: function (session) {
            return new MessengerSession(session);
        }
    };
}());
module.exports = storage;











