//------------ Global Handlers --------------
var Alexa = require('alexa-sdk');
var index = require('./index');

module.exports = {
    'LaunchRequest': function () {
        this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['ingresar con el nombre','registrarse con el nombre'] : ['sign in with name','register with name']
        this.handler.state = 'validationMode';
        this.emit(':ask',this.t('WELCOME_MESSAGE'),this.t('REP_WELCOME'));       
    },
    'ReadContents':function(){
        this.handler.state = 'flowMode'
        this.emitWithState('ReadContents')        
    }
}