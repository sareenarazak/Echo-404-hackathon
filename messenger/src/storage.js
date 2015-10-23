// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var AWS = require("aws-sdk");
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: ''
});

AWS.config.loadFromPath('credentials.json');

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

     MessengerSession.prototype = {
        
        isMessageSet: function () {
            return self.data.message !== '';
        },
        isRecipientSet: function () {
            return self.data.recipient !== '';
        },
        isSenderSet: function () {
            return self.data.sender !== '';
        }
    };

    return {
        logInfo: function (thing) {
            console.log(thing + " START");
            for (var v in thing) {
                console.log("value : " + v);
            }
            console.log(thing + " END");
        },

        hasUsers: function (session, callback) {
            console.log("we are inside the hasUsers function");
            var scanResults = dynamodb.scan({
                TableName: 'usersTable'
            });

            if (callback) {
                callback(session);
            }
            return scanResults && scanResults.length;
        },
        hasUser: function (userName, callback) {

            if (!userName) callback(false);

            var self = this;
            dynamodb.getItem({
                TableName   : 'FamilyMessages',
                Key         : {
                    Recipient   : { 'S' : userName }
                }
            }, function (err, data) {
                if (err) {
                    console.log("error thrown in the getItem callback of hasUser() -- storage.js");
                    self.logInfo(err);
                }

                callback(Number(JSON.stringify(data).length) > 2);
            });
        },
    newMessage: function (session) {
            return new MessengerSession(session);
        },

        addMember: function (session, memberName, callback) {
            var self = this;
            dynamodb.putItem({
                TableName: 'FamilyMessages',
                Item: {
                    'Recipient' : { 'S' : memberName }
                }
            }, function (err, data) {
                if (err) {
                    console.log("error in the putItem call in addMember of storage.js");
                    self.logInfo(err);
                    callback(false);
                }
                else {
                    console.log("Added member '" + memberName + "'");
                    callback(true);
                }
            });
        },

        getMessages: function (recipient, callback) { // still need to test
            var self = this;
            console.log("just got to getMessages of storage.js");
            dynamodb.getItem({
                TableName: 'FamilyMessages',
                AttributesToGet: [
                    'Messages'
                ],
                Key: {
                    'Recipient': { 'S' : recipient }
                }
            }, function (err, data) {
                if (err) {
                    console.log("error in the getItem call in getMessages of storage.js");
                    self.logInfo(err);
                    callback(undefined);
                }
                else if (!data) {
                    console.log("No messages for member '" + recipient + "'");
                    callback(null);
                }
                else if (data && data.Item && data.Item.Messages && data.Item.Messages.S){
                    console.log("Retrieved messages for member '" + recipient + "'");
                    var msgs = [].concat(JSON.parse(data.Item.Messages.S));
                    callback(msgs);
                }
            });
        },

        saveMessage: function (data, callback) {

            var self = this;
            var msgs = [];
            dynamodb.getItem({
                TableName: 'FamilyMessages',
                AttributesToGet: [
                    'Messages'
                ],
                Key: {
                    'Recipient': { 'S' : data.recipient } // TODO: change this back to data.recipient
                }
            }, function (err, mmm) {
                if (err) {
                    console.log("error in the getItem call in saveMessage of storage.js");
                    self.logInfo(err);
                    callback(undefined);
                }
                else if (mmm && mmm.Item && mmm.Item.Messages && mmm.Item.Messages.S){
                    msgs = [].concat(JSON.parse(mmm.Item.Messages.S));
                }
                // else it's their first message
                
                msgs.push({
                    'sender'    : data.sender,
                    'message'   : data.message
                });

                dynamodb.putItem({
                    TableName: 'FamilyMessages',
                    Item: {
                        'Recipient'     : { 'S' : data.recipient },
                        'Messages'      : {
                            'S' : JSON.stringify(msgs)
                        }
                    }
                }, function (err) {
                    if (err) {
                        console.log("error in putItem of saveMessage");
                        self.logInfo(err);
                    }
                    if (callback) {
                        callback();
                    }
                });
            });
        }
    };
}());
module.exports = storage;
