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
        this.response.speak('Welcome to Read Notice Skill. Login with your name to start').listen('Login with your name to start');
        this.response.shouldEndSession(false);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function() {
        //onSessionEnded(this.event.request, this.event.session);
        this.emit(':tell','Goodbye!');
    },/*
    'AMAZON.HelpIntent': function () {    
        this.emit(':ask', "Return Notice lets ","");//Completar
    },*/
    'AMAZON.StopIntent': function () {
        this.emit(':ask', "Okay, what do you want to do now?","Are you there? What we do now?");
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
                        this.emit('LaunchRequest');
                    }        
                    else{
                        this.emit(':ask', "Sorry, the user already exists. It is not possible to register with the username "+ slotValue +". Register with a new name"," Please, register with a new name");
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
                        this.emit(':ask', "Hello "+ this.attributes['logueado']+"! Now, you can get your content.","If you want to listen the content just say it");
                    }
                    else{
                        this.emit(':ask', "Sorry, there is no registered user with the name "+ slotValue +". Log in with a valid username.","Please, log in with a valid username");
                    }
                });
            });
        }
        else{
            this.emit(':ask', "Sorry, you can not login because the user "+ this.attributes['logueado']+" is already active in the system.","Please, go back later");
        }
    },
    'Logout': function(){

        if(!this.attributes['logueado']){
            obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario
                
                if(this.attributes['logueado'] == slotValue){ //Si existe un usuario activo con el nombre del slotValue
                    this.attributes['logueado']= ""; //Inicializa a prop.'logueado' de attributes de session 
                    this.emit(':tell', "Goodbye "+ slotValue+". See you later!");
                }else{
                    this.emit(':ask', "Sorry, you can not close the session. Please enter a correct username. The active user in the system is " + this.attributes['logueado'],"Please, enter a correct username");
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
            
            func_db.obtener_datos_conf(usuarioLogueado,this.event.session.user.userId,(url, path) =>{
                //if(url != null && clase != null){//Si existe el usuario
                    if(path != null){ //Si tiene url y clase definidos
                        getNoticeResponse(url,path, (cardTitle, speechOutput, repromptText, shouldEndSession) => {
                                     //this.response = buildResponse(sessionAttributes, speechletResponse);
                                     this.emit(':askWithCard', speechOutput,repromptText, cardTitle, speechOutput, null);
                                  //this.emit(':saveState',true); //This is to persist session attributes into a table 'Users' in DynamoDB
                                });
                    }else{
                       this.emit(':ask', "Sorry, the user "+ usuarioLogueado +" does not have url and class configured to get the content","What do you want to do now?");
                    }
                //}else{
                 //this.emit(':ask', "Sorry, there is no registered user with the name "+ usuarioLogueado +". Please, login with a valid username","Please, login with a valid username");
                //}
            });//End obtener_datos_conf
        }else{
            this.emit(':ask', "Sorry, first you must login to be able to get news","Please login before you can obtain the content");
        }
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that.',"Please enter a valid intent request");
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

function getNoticeResponse(url,path,callback) {
    
    var repromptText = "What do you want to do now?";
    var cardTitle = "Title - ";//aca iria el titulo de la noticia
    //test http get
    testGet(url,path, (response) => {

        var speechOutput = "The text of the article is: " + response; //response=contenido 
        var shouldEndSession = false;
        //cardTitle += t;

        callback(cardTitle, speechOutput, repromptText, shouldEndSession);

    });
}

//Para obtener el elemento <a> a partir de un path dado.
//Falta manejar el error de null en caso de que nunca encuentre un elemento padre <a>
function findElementA(element){
    console.log("------Elemento",element.nodeName," ",element.parentNode.nodeName)
    var siblings = element.parentNode.childNodes;
    if (siblings.length>1){
      for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if(sibling.tagName === "a"){
          return sibling;
        }
      }
      return findElementA(element.parentNode);
    }
}

function testGet(url,path,responseFunction) {

    
    var EventEmitter = require("events").EventEmitter;
    var func = new EventEmitter();
    func.on('update', (contenido) => {
        responseFunction(contenido);
    });

    var request = require('request');
    var xpath = require('xpath')
    ,dom = require('xmldom').DOMParser;
    
    
    request(url,(error, response, body) => { 
        //poner aca las funciones getNoticias, walkDom,etc
        //console.log("---------Body",body);
        var docu = new dom().parseFromString(body);
        var getElementByXpath = function(path) {
            console.log("-------Path en getElement: ",path);
            console.log("-------Evaluate: ",xpath.evaluate(path, docu, null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.data);
            return (xpath.evaluate(path, docu, null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
        }

        //href=obtener el href del link de la noticia
        var href = (findElementA(getElementByXpath("//"+path))).getAttribute("href");        
        
        //Obtiene todo el contenido (todos los p hermanos buscando desde el body)
        request(href, (error, response, body) => { 
            var docu = new dom().parseFromString(body);
            var cuerpo = xpath.evaluate("//body", docu, null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var nodeMax;
            var maxP = 0;
            var contenido=[];
            var walkDOM = function (node,func) {
                func(node);
                node = node.firstChild;
                while(node) {
                  walkDOM(node,func);  
                  node = node.nextSibling;
                  if(node == cuerpo.lastChild){
                    var siblings = nodeMax.getElementsByTagName("p");
                    for (var i= 0; i<siblings.length; i++) {
                      var sibling= siblings[i];
                      contenido.push(sibling.textContent); //+=sibling.textContent+"\n";
                      //sibling.style.backgroundColor = "red";
                    }
                    contenido=contenido.join("\n");
                    console.log("Contenido: ",contenido);
                  }
                }
            };
            
            walkDOM(cuerpo,function(node) {
               var cantP=0;
               if(node.nodeType===1){                     
                  for (var i= 0; i < node.childNodes.length; i++) {
                    var child= node.childNodes[i];
                    if(child.tagName==="p"){ //Tener en cuenta tmb los text: child.nodeType===3 ||
                      cantP+=1;
                    }
                  }
                   if(cantP > maxP){
                    maxP = cantP;
                    nodeMax = node;
                   }
                }
            });

            func.emit('update',contenido);
        });
        /*
        var parrafos = xpath.evaluate(
            "//*[@class='"+clase+"']",  // xpathExpression: se fija todos los elementos que posean la clase pasada
            doc,                        // contextNode
            null,                       // namespaceResolver
            xpath.XPathResult.ANY_TYPE, // resultType
            null                        // result
        )
        node = parrafos.iterateNext();
        while (node) {
            contenido+=node.firstChild.data;
            console.log(node.firstChild.data);
            node = parrafos.iterateNext();
        }
        var title = xpath.select("string(//title)", doc);
        */
        
    });
    
}//Cierra testGet

