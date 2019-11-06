//------------ Global Handlers --------------
var Alexa = require('alexa-sdk');
var index = require('./index');

module.exports = {
    'SessionEndedRequest' : function() {
        if (this.event.request.reason == 'USER_INITIATED'){
            this.emit(':tell',this.t('LEAVE_MESSAGE'));         
        }else{
            console.log("error ",this.event.request.error.message)
            this.emit(':tell',this.t('LEAVE_MESSAGE_2'));
        }

    }   
}