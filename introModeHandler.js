var Alexa = require('alexa-sdk');
var index = require('./index');
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')

module.exports = {
    
    'ConfirmationProcess':function(){//Utterance siguiente
        console.log("--Entra al no - Intro mode")
        this.handler.state = 'contentMode'
        this.emitWithState('ConfirmationProcess');
    },
    'ProcessIntro':function(intro,mge){
        console.log("--Entra al process Intro mode - ",intro)
        this.attributes['PrevRequest'] = "ProcessIntro"
        this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['ok','siguiente'] : ['ok','next']
        this.emit(':ask',this.t('READ_INTRO',{intro:intro, mge:mge})) 
    },
    'Logout': function(){
        this.handler.state = 'validationMode';
        this.emitWithState('Logout')
    },
    'Unhandled': function() { 
        console.log("entra al unhandled intro")
        this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['si','no'] : ['yes','no']
		index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });    
    }
}