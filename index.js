
var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.6a7efb87-1f31-49dd-b07a-0c6ee7993a0e';
var languageStrings = require('./strings');
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')
var states = ['newSession','endSession','validationMode','flowMode','orderedMode','titleMode','categoryMode','contentMode','introMode']


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context, callback) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        var alexa = Alexa.handler(event, context, callback);
        alexa.appId = APP_ID;
        alexa.resources = languageStrings;

        if (event.session.application.applicationId !== APP_ID) {
             context.fail("Invalid Application ID");
         }
       
        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }
        states.forEach(function(state,index){
            var name = state
            if(index < 2)
                state = ''
            alexa.registerHandlers(Alexa.CreateStateHandler(state, require('./'+name+'Handler')))
        })
       
        alexa.execute();
    
    } catch (e) {
        context.fail("Exception: " + e);
    }
}; //End exports.handler


// --------------- Function Listeners -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
                + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user ends the session ('saying exit' for example).
 * Is not called when the skill returns shouldEndSession=true, because in this case the service doesn't receive a SessionEndedRequest.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
                + ", sessionId=" + session.sessionId);
}

  
// --------------- Helper functions -----------------------

function getSafe(fn) {
    try {
        return fn();
    } catch (e) {
        return false;
    }
}

// --------------- Functions that control the skill's behavior -----------------------


//Save the info of a content that was obtained through the puppeteer api in a session attribute called "Contents"
function setAttributes( handlerThis,content,indice){    //index,speechOutput, intro, title,host,noticia){ 
    return new Promise((resolve,reject) => {
        let speechOutput;
        try{
            let texto = content.texto       
            if(texto.title){
                if(texto.contenido){
                    if(indice === (handlerThis.attributes['Contenidos'].length - 1) ){ 
                        speechOutput = texto.contenido + handlerThis.t("LAST_CONTENT")+ handlerThis.t("LAST_CONTENT_END")
                    }else{
                        speechOutput = texto.contenido + handlerThis.t('CONTENT_END')
                    }  
                    texto.speechOutput = speechOutput;
                }
                content.setText(texto)
                handlerThis.attributes['ContentsToRead'][indice] = content
                resolve("Success")           
            }
            else{
                console.log("Reject")
                reject("Reject")
            } 
        }catch(err){
            console.log("Error - ",err)
        }       
    })
}


//Capaz no es necesaria la funcion
function returnOptions(op,handlerThis,callback){
    var options = "";
    console.log("----",op)
    op.forEach((option,index,array) =>{
        if(index != (array.length - 1))//Si no es el ultimo elem
            options+= (option+handlerThis.t('CONECTOR'));
        else
            options += option
    });
    console.log("----",options)
    callback(options)
}


//Funcion que se encarga de obtener el slot si el usuario no lo incluye en el request
function obtainSlotValue(handlerThis,callback){
    var intentObj //the intent object represents the intent sent to the skill 
    if(handlerThis.event.request.intent){
       intentObj = handlerThis.event.request.intent; 
    }else{
       intentObj = handlerThis.request.intent; 
    }

    console.log("Obtain Slot Value - ",intentObj, Object.keys(intentObj))
    if(!intentObj.slots.User.value){ //Si no incluyó su nombre dentro del request
        var slotToElicit = 'User';
        var speechOutput = handlerThis.t('OBTAIN_SLOT');
        var repromptSpeech = handlerThis.t('REP_OBTAIN_SLOT');
        handlerThis.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);

    }else{
        console.log("---usuario",intentObj.slots.User.value)
        callback(intentObj);
    }
}

//Funcion que se encarga de pedirle confirmacion al usuario acerca del valor del slot que dijo en el request.
function confirmSlotValue(handlerThis,callback){
    
    const intentObj = handlerThis.event.request.intent;
    const slotToConfirm = 'User';
    
    if(intentObj.slots.User.confirmationStatus !== 'CONFIRMED'){
        if(intentObj.slots.User.confirmationStatus !== 'DENIED'){
            //El usuario todavia no confirmó el slot. Se le pide confirmación
            const speechOutput = handlerThis.t('CONFIRM_SLOT',{user:intentObj.slots.User.value})
            handlerThis.emit(':confirmSlot', slotToConfirm, speechOutput, speechOutput);
        }else{
            //El usuario niega la confirmacion del slot. Se le pide que haga el request con un nuevo valor
            const slotToElicit = 'User';
            const speechOutput = handlerThis.t('CONFIRM_SLOT_REP');
            handlerThis.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
        }
    }else{
        callback(intentObj);
    }
}

exports.obtainSlotValue = obtainSlotValue
exports.confirmSlotValue = confirmSlotValue
exports.returnOptions = returnOptions
exports.setAttributes = setAttributes
exports.onSessionStarted = onSessionStarted
exports.onSessionEnded = onSessionEnded
exports.getSafe = getSafe

