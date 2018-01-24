var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.6a7efb87-1f31-49dd-b07a-0c6ee7993a0e';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context, callback) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        var alexa = Alexa.handler(event, context, callback);
        alexa.appId = APP_ID;
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        //alexa.dynamoDBTableName = 'User';
        if (event.session.application.applicationId !== APP_ID) {
             context.fail("Invalid Application ID");
         }
       
        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        alexa.registerHandlers(handlers);
        alexa.execute();
    
    } catch (e) {
        context.fail("Exception: " + e);
    }
}; //End exports.handler

//Funciones de interaccion con la base
var func_db = require('./function_db'); 

/*
var readModeHandlers = {

};
var startModeHandlers = {
    'LaunchRequest': function () {
        this.response.speak('Welcome to Read Notice Skill. Do yo want to start?')
        .listen('Say yes to start or no to quit.');
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function() {
        //onSessionEnded(this.event.request, this.event.session);
        this.emit(':tell','Goodbye!');
    },
    'AMAZON.YesIntent': function(){
        this.response.speak('Great! Please try to saying the utterance for login in the system')
        .listen('Please say: sign in with name');
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function(){
        this.emit(':tell','Ok, see you next time');
    },
};
*/

//Handlers para los intent del skill
var handlers = {
    'LaunchRequest': function () {
        this.response.speak('Welcome to Read Notice Skill. Do yo want to start?')
        .listen('Say yes to start or no to quit.');
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function() {
        //onSessionEnded(this.event.request, this.event.session);
        this.emit(':tell','Goodbye!');
    },
    /*
    'DialogIntent':function(){
        //this.event.request.dialogState --->current dialog state
        
        const intentObj = this.event.request.intent; --->the intent object represents the intent sent to the skill
    },  
    */
    'Register': function(){
        //var myThis = this;
        obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
            confirmSlotValue(this,(objectIntent)=>{//Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario
                
                func_db.busqueda_usuario(slotValue,this.event.session.user.userId,(username)=>{

                    if(username == null){//Si no está registrado en la base con ese nombre
                        func_db.registrar_usuario(slotValue,this.event.session.user.userId);       
                        this.emit(':tell', "Great! Could be successfully registered with the username "+ slotValue);
                    }        
                    else{
                        this.emit(':tell', "Sorry, the user already exists. It is not possible to register with the username "+ slotValue +". Please, register with a new name");
                    }
                });
            });
        });
    },
    'Login': function(){
        //var myThis = this;
        if(!this.attributes['logueado']){ //Si no ingresó nadie todavia
            obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario
                
                func_db.busqueda_usuario(slotValue,this.event.session.user.userId,(username)=>{//Voy a buscar el user a la base 
                    if(username != null){//Si el user ya está registrado en la base        
                        this.attributes['logueado']= slotValue; //Se loguea: Asigna a prop.'logueado' de attributes de session el valor del slot(user)
                        this.emit(':tell', "Hello "+ this.attributes['logueado']+"! Now, you can get your content");
                    }
                    else{
                        this.emit(':tell', "Sorry, there is no registered user with the name "+ slotValue +". Please, log in with a valid username");
                    }
                });
            });
        }
        else{
            this.emit(':tell', "Sorry, you can not login because the user "+ this.attributes['logueado']+" is already active in the system");
        }
    },
    'Logout': function(){
        if(this.attributes['logueado'] !== ""){
            obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario
                
                if(this.attributes['logueado'] == slotValue){ //Si existe un usuario activo con el nombre del slotValue
                    this.attributes['logueado']= ""; //Inicializa a prop.'logueado' de attributes de session 
                    this.emit(':tell', "Goodbye "+ slotValue+". See you later!");
                }else{
                    this.emit(':tell', "Sorry, you can not close the session. Please enter a correct username. The active user in the system is " + this.attributes['logueado']);
                }
            });
        }else{ 
            this.emit(':tell', "Sorry, you must first login before you can logout");
        } 
    },
    'ReturnNoticeIntent':function(){
        //var myThis = this;
        var usuarioLogueado = this.attributes['logueado'];
        if(this.attributes['logueado']){
            
            func_db.obtener_datos_conf(usuarioLogueado,this.event.session.user.userId,(url, clase) =>{
                if(url != null && clase != null){//Si existe el usuario
                    if(url != "" && clase != ""){ //Si tiene url y clase definidos
                        getNoticeResponse(url,clase, (cardTitle, speechOutput, repromptText, shouldEndSession) => {
                                     //this.response = buildResponse(sessionAttributes, speechletResponse);
                                     this.emit(':askWithCard', speechOutput,repromptText, cardTitle, speechOutput, null);
                                  //this.emit(':saveState',true); //This is to persist session attributes into a table 'Users' in DynamoDB
                                });
                    }else{
                       this.emit(':tell', "Sorry, the user "+ usuarioLogueado +" does not have url and class configured to get the content");
                    }
                }else{
                 this.emit(':tell', "Sorry, there is no registered user with the name "+ usuarioLogueado +". Please, login with a valid username");
                }
            });//End obtener_datos_conf
        }else{
            this.emit(':tell', "Sorry, first you must login to be able to get news");
        }
    },
    'Unhandled': function() {
        this.emit(':tell', 'Sorry, I didn\'t get that.');
    }
};


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
    // Add cleanup logic here
}



// --------------- Functions that control the skill's behavior -----------------------

//Funcion que se encarga de obtener el slot si el usuario no lo incluye en el request
function obtainSlotValue(handlerThis,callback){
    var intentObj = handlerThis.event.request.intent; //the intent object represents the intent sent to the skill 
    if(!intentObj.slots.User.value){ //Si no incluyó su nombre dentro del request
        var slotToElicit = 'User';
        var speechOutput = 'Which is your username?';
        var repromptSpeech = 'Please say your username';
        handlerThis.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);

    }else{
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
            const speechOutput = "You want to register with the name "+ intentObj.slots.User.value +"?";
            handlerThis.emit(':confirmSlot', slotToConfirm, speechOutput, speechOutput);
        }else{
            //El usuario niega la confirmacion del slot. Se le pide que haga el request con un nuevo valor
            const slotToElicit = 'User';
            const speechOutput = 'Okay, Which is your username?';
            handlerThis.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
        }
    }else{
        callback(intentObj);
    }
}

function getNoticeResponse(url,clase,callback) {
    
    var repromptText = null;
    var cardTitle = "Title - ";//aca iria el titulo de la noticia
    //test http get
    testGet(url,clase, (response,t) => {

        var speechOutput = "The text of the article is: " + response; //response=body.data o parrafo 
        var shouldEndSession = false;
        cardTitle += t;

        callback(cardTitle, speechOutput, repromptText, shouldEndSession);

    });
}

function testGet(url,clase,responseFunction) {

    
    var EventEmitter = require("events").EventEmitter;
    var func = new EventEmitter();
    func.on('update', (parrafo,title) => {
        //console.info('\n\nCall completed '+parrafo+" "+title); 
        responseFunction(parrafo,title);
    });
    var request = require('request');
    var xpath = require('xpath')
    ,dom = require('xmldom').DOMParser;

    request(url, (error, response, body) => { //url= 'http://cielosports.com/nota/75670/la_dirigencia_oferto_y_ahora_espera_por_el_si_de_ibanez/' 

        var xml = body;
        var doc = new dom().parseFromString(xml);
        var parrafo = xpath.select("string(//p)", doc);
        var title = xpath.select("string(//title)", doc);
        //console.log(nodes[0].toString());
      
        func.emit('update',parrafo,title)
    });
    

}//Cierra testGet

