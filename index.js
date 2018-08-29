var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.6a7efb87-1f31-49dd-b07a-0c6ee7993a0e';
var languageStrings = require('./strings');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context, callback) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        var alexa = Alexa.handler(event, context, callback);
        alexa.appId = APP_ID;
        alexa.resources = languageStrings;
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

        alexa.registerHandlers(newSessionHandlers,endSessionHandlers,categoryModeHandlers,contentModeHandlers,introModeHandlers);
        alexa.execute();
    
    } catch (e) {
        context.fail("Exception: " + e);
    }
}; //End exports.handler

//Funciones de interaccion con la base
var request_db = require('./request-db'); 

/*
    'AMAZON.HelpIntent': function () {    
        this.emit(':ask', "Return Notice lets ","");//Completar
    },
    'DialogIntent':function(){
        //this.event.request.dialogState --->current dialog state
        
        const intentObj = this.event.request.intent; --->the intent object represents the intent sent to the skill
    },  
*/
const newSessionHandlers ={
    'LaunchRequest': function () {
        this.handler.state = 'CATEGORYMODE';
        this.response.speak(this.t('WELCOME_MESSAGE')).listen(this.t('REP_WELCOME')); //this.t() se usa para obtener el string del mensaje en base al idioma locale del request
        this.response.shouldEndSession(false);
        this.emit(':responseReady');
    }
};

const endSessionHandlers = {
     'SessionEndedRequest' : function() {
        //onSessionEnded(this.event.request, this.event.session);
        if (this.event.request.reason == 'USER_INITIATED'){
            this.emit(':tell',this.t('LEAVE_MESSAGE'));         
        }else{
            console.log("error ",this.event.request.error.message)
            this.emit(':tell',this.t('LEAVE_MESSAGE_2'));
        }

    },   
};

const categoryModeHandlers = Alexa.CreateStateHandler('CATEGORYMODE',{
    'SessionEndedRequest' : function() {
        //onSessionEnded(this.event.request, this.event.session);
        this.emit('SessionEndedRequest');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':ask',this.t('STOP_MESSAGE'),this.t('REP_STOP'));
    },
    'Register': function(){
        //var myThis = this;
        obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
            confirmSlotValue(this,(objectIntent)=>{//Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario
                
                request_db.busqueda_usuario(slotValue,this.event.session.user.userId,(username)=>{
                    console.log("username ",username)
                    if(username == null){//Si no está registrado en la base con ese nombre
                        request_db.registrar_usuario(slotValue,this.event.session.user.userId);       
                        this.emit(':tell', this.t('REGISTER_SUC_MESSAGE', {slotValue:slotValue}));
                        this.emit('LaunchRequest')
                    }        
                    else{
                        this.emit(':ask', this.t('REGISTER_REJ_MESSAGE',{slotValue:slotValue}),this.t('REP_REGISTER_REJ_MESSAGE'));
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
                request_db.busqueda_usuario(slotValue,this.event.session.user.userId,(username)=>{//Voy a buscar el user a la base 
                    if(username != null){//Si el user ya está registrado en la base        
                        this.attributes['logueado']= slotValue; //Se loguea: Asigna a prop.'logueado' de attributes de session el valor del slot(user)
                        this.emit(':ask', this.t('LOGIN_SUC_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_SUC_MESSAGE'));
                    }
                    else{
                        this.emit(':ask', this.t('LOGIN_REJ_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_REJ_MESSAGE'));
                    }
                });
            });
        }
        else{
            var slotValue = this.attributes['logueado']
            this.emit(':ask', this.t('LOGIN_REJ2_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_REJ2_MESSAGE'));
        }
    },
    'Logout': function(){
        //console.log("---log out : "+this.attributes['logueado']+(!this.attributes['logueado']))
        if(this.attributes['logueado']){
            obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario
                
                if(this.attributes['logueado'] == slotValue){ //Si existe un usuario activo con el nombre del slotValue
                    this.attributes['logueado']= ""; //Inicializa a prop.'logueado' de attributes de session 
                    this.emit(':tell', this.t('LOGOUT_SUC_MESSAGE',{slotValue:slotValue}));
                }else{
                    this.emit(':ask', this.t('LOGOUT_REJ_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGOUT_REJ_MESSAGE'));
                }
            });
        }else{ 
            this.emit(':tell', this.t('LOGOUT_REJ2_MESSAGE'));
        } 
    },
    'CategoriesIntent':function(){ //Utterance:return my categories
        var usuarioLogueado = this.attributes['logueado'];
        request_db.getCategories(usuarioLogueado,this.event.session.user.userId,(categories)=>{ //categories=[{},{}]
            //this.attributes['Action'] = 'ListCategories'
            this.attributes['ActualIndex'] = -1 
            console.log("---Categories",categories)
            this.attributes['Categories'] = categories
            this.emitWithState('ConfirmationProcess')
        });
    },    
    'ConfirmationProcess':function(){ //Utterance:Next
        
        var listaCategorias = this.attributes['Categories'] 
        if(this.attributes['ActualIndex'] == (listaCategorias.length - 1)){//Si leyó toda la lista 
            //this.handler.state = 'MENUMODE'
            this.handler.state = ''
            this.emitWithState(':ask',this.t('START_POINT'))
        }else{ 
                this.attributes['ActualIndex']+=1
                var index = this.attributes['ActualIndex'];
                var category = listaCategorias[index].category;
                if(index == 0){//Agrega mensaje inicial a la lectura de categorias
                    this.emit(':ask',this.t('LIST_OF_CATEGORIES',{category:category}),this.t('LIST_OF_CATEGORIES',{category:category}));//Lee los titulos de a uno
                }else{
                    this.emit(':ask',category,category);//Lee los titulos de a uno
                }            
        }
    },
    'Okintent': function() { //Utterance:ok
        //this.attributes['ActualIndex'] +=1;        
        var listaCategorias = this.attributes['Categories']
        this.handler.state = 'CONTENTMODE'
        console.log("---state :",this.handler.state)
        var cate = listaCategorias[this.attributes['ActualIndex']];
        console.log("---cate :",cate," ",cate.category)
        this.emitWithState('ReturnNoticeIntent',cate.category)
        //Fijarse como volver de nuevo a la lista de categorias                
    },
});

//Handlers para los intent del skill
const contentModeHandlers = Alexa.CreateStateHandler('CONTENTMODE', {
    'ReturnNoticeIntent':function(selectedCategory=""){ //Utterance:read my notice
        //var myThis = this;
        console.log("selected category",selectedCategory)
        var usuarioLogueado = this.attributes['logueado'];
        if(this.attributes['logueado']){     
            request_db.obtener_datos_conf(usuarioLogueado,this.event.session.user.userId,selectedCategory,(noticias) =>{
                //if(url != null && clase != null){//Si existe el usuario
                    console.log("---noticias",noticias)
                    this.attributes['ActualIndex'] = -1 
                    this.attributes['Noticias'] = noticias
                    //this.attributes['Action'] = 'ListContent'   
                    this.emitWithState('ConfirmationProcess')
            });//End obtener_datos_conf
        }else{
            this.emit(':ask', this.t('CONTENT_REJ_MESSAGE'),this.t('REP_CONTENT_REJ_MESSAGE'));
        }
    },   
    'ConfirmationProcess':function(){ //Utterance:Next        
        var listaContent = this.attributes['Noticias']
        //console.log("--Es el ultimo? ",listaContent[this.attributes['ActualIndex']],(listaContent.length - 1))     
        if(this.attributes['ActualIndex'] == (listaContent.length - 1)){//Si leyó toda la lista 
            this.handler.state = 'CATEGORYMODE'
            this.emitWithState('CategoriesIntent')
        }else{ 
                this.attributes['ActualIndex']+=1
                var index = this.attributes['ActualIndex'];
                var noticia = listaContent[index];
                getTitleContent(noticia, (title)=>{
                    this.attributes['ActualTitle'] = title;
                    this.attributes['ActualUrl'] = noticia.url;
                    this.attributes['ActualPath'] = noticia.xpath;
                    var metainfo = "";
                    if(noticia.metainfo){
                        metainfo = noticia.metainfo;
                        this.attributes['MetaInfo'] = metainfo;           
                    }

                    if(index == 0){//Agrega mensaje inicial a la lectura de titulos
                        this.emit(':ask',this.t('LIST_OF_TITLES',{metainfo:metainfo,title:title}),this.t('LIST_OF_TITLES',{metainfo:metainfo,title:title}));//Lee los titulos de a uno
                    }else{
                        this.emit(':ask',metainfo+". "+title,metainfo+". "+title);//Lee los titulos de a uno
                    }
                });
            }
    },    
    'Okintent': function() { //Utterance:ok
        //this.attributes['ActualIndex'] +=1;
        console.log("--entra al ok del contentmode")
        this.emitWithState('ReturnSingleContent',this.attributes['ActualUrl'],this.attributes['ActualPath'])               
    },
    'AMAZON.YesIntent':function(){//Utterance yes
        this.handler.state = 'INTROMODE'
        this.emitWithState('ProcessIntro', this.attributes['Intro']);
    },
    'AMAZON.NoIntent':function(){//Utterance no
        this.emitWithState('ReadContent');
    },
    'ReadContent':function(){
        console.log("--vuelve al read content")
        var repromptText = "What do you want to do now?";
        var shouldEndSession = false;
        this.emit(':askWithCard', this.attributes['Content'],repromptText,this.attributes['Intro'], this.attributes['Content'], null);        
    },
    'ReturnSingleContent':function(url,path){
                console.log("--entra al return single content")
                getNoticeResponse(url,path, (intro, speechOutput, repromptText, shouldEndSession) => {
                        //this.response = buildResponse(sessionAttributes, speechletResponse);
                        if(this.attributes['ActualIndex'] == (this.attributes['Noticias'].length - 1)){
                            speechOutput = speechOutput+this.t("LAST_CONTENT")+this.t("LAST_CONTENT_END")
                        }
                        this.attributes['Intro'] = intro;  
                        this.attributes['Content'] = speechOutput
                        this.emit(':ask',this.t('ASK_FOR_INTRO'),this.t('ASK_FOR_INTRO'))
                        //this.emit(':saveState',true); //This is to persist session attributes into a table 'Users' in DynamoDB
                });
            /*
            if(url != null && path != null){ //Si tiene url y path definidos
                
            }else{
                this.emit(':ask', "Sorry, the user "+ usuarioLogueado +" does not have url and class configured to get the content","What do you want to do now?");
            }*/            
    },
    'Unhandled': function() {
        this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE'),this.t('REP_CONTENT_REJ2_MESSAGE'));
    }
});

const introModeHandlers = Alexa.CreateStateHandler('INTROMODE', {
    
    'AMAZON.YesIntent':function(){//Utterance yes
        this.handler.state = 'CONTENTMODE'
        this.emitWithState('ReadContent');
    },
    'AMAZON.NoIntent':function(){//Utterance no
        this.handler.state = 'CONTENTMODE'
        this.emitWithState('ConfirmationProcess');
    },
    'ProcessIntro':function(intro){
        this.emit(':ask',this.t('READ_INTRO',{intro:intro+this.t("LAST_CONTENT")}))
    }

});


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
    var intentObj //the intent object represents the intent sent to the skill 
    if(handlerThis.event.request.intent){
       intentObj = handlerThis.event.request.intent; //the intent object represents the intent sent to the skill 
    }else{
       intentObj = handlerThis.request.intent; //the intent object represents the intent sent to the skill 
    }
    console.log("---usuario",intentObj.slots.User.value)
    if(!intentObj.slots.User.value){ //Si no incluyó su nombre dentro del request
        var slotToElicit = 'User';
        var speechOutput = handlerThis.t('OBTAIN_SLOT');
        var repromptSpeech = handlerThis.t('REP_OBTAIN_SLOT');
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

function getTitleContent(noticia,callback){
    var request = require('request');
    var xpath = require('xpath')
    ,dom = require('xmldom').DOMParser;
    console.log("-------Noticia ",noticia,noticia.url,noticia.xpath)
    var title;
        request(noticia.url,(error, response, body) => { 
            //poner aca las funciones getNoticias, walkDom,etc
            //console.log("---------Body",body);
            var docu = new dom().parseFromString(body);
            var getElementByXpath = function(path) {
                console.log("-------Path en getElement: ",path);
                //console.log("-------Evaluate: ",xpath.evaluate(path, docu, null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.data);
                return (xpath.evaluate(path, docu, null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
              
            }
            
                console.log("----Element a ",findElementA(getElementByXpath("//"+noticia.xpath)).attributes[1].nodeValue)
                title = (findElementA(getElementByXpath("//"+noticia.xpath)).attributes[1].nodeValue)
                if(typeof title == undefined){
                    title = "The path of the content has changed"
                }
          
            console.log("---Title",title)
            callback(title);
        });
}


function getNoticeResponse(url,path,callback) {
    
    var intro ;//intro de la noticia
    //test http get
    getPath(url,path, (content,int) => {

        var speechOutput = "The text of the article is: " + content;
        intro=int

        callback(intro, speechOutput)

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

function getPath(url,path,responseFunction) {
    //url=url de la pagina principal
    
    var EventEmitter = require("events").EventEmitter;
    var func = new EventEmitter();
    func.on('update', (contenido,intro) => {
        console.log("entra al update con "+intro+contenido)
        responseFunction(contenido,intro);
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
            
            var intro = xpath.evaluate("(//h1|//h2|//h3)/following-sibling::p[1]",docu, null, xpath.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
            console.log("----intro "+intro)
            
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
                      //console.log(sibling.textContent,siblings.length)
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
                   //console.log("node max ",nodeMax)
                }
            });

            func.emit('update',contenido,intro);
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
    
}//Cierra getPath

