// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.
'use strict';
var textHelper = (function () {
    var nameBlacklist = {
        player: 1,
        players: 1
    };

    return {
        completeHelp: 'Here\'s some things you can say,'
        + ' My name is.'
        + ' Leave a message for.'
        + ' Check my messages.'
        + ' Delete my messages.'
        + ' and exit.',

        nextHelp: 'You can leave messages for another member. You can also check your messages. What would you like?',

        getPlayerName: function (recognizedPlayerName) {
            //do some trick on the recognized player name,
            //so we can get a better result
            if (!recognizedPlayerName) {
                return undefined;
            }
            var split = recognizedPlayerName.indexOf(' '), newName;

            if (split < 0) {
                newName = recognizedPlayerName;
            } else {
                //the name should only contain a first name, so ignore the second part if any
                newName = recognizedPlayerName.substring(0, split);
            }
            if (nameBlacklist[newName]) {
                //if the name is on our blacklist, it must be mis-recognition
                return undefined;
            }
            return newName;
        }
    };
})();
module.exports = textHelper;