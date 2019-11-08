var Alexa = require('alexa-sdk');
var request_db = require('./request-db');
var index = require('./index');
var Content = require('./Classes/Content')
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')

module.exports = {
    'AMAZON.StopIntent': function () {
        this.emit(':ask',this.t('STOP_MESSAGE'),this.t('REP_STOP'));
    },
    'ReadInOrder':function(conjunto,pattern){
        var usuarioLogueado = this.attributes['logueado'];
        request_db.obtener_contenidos_por_orden(usuarioLogueado,conjunto) 
        .then(contents =>{
        	this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['si','no'] : ['yes','no']
            this.attributes['ActualIndex'] = 0
            this.attributes['Contenidos'] = contents //contents=[{content:{idcontent,infocontent:{url","xpath"},metadata}},{}]
            this.attributes['ContentsToRead'] = []            
            this.emitWithState('ConfirmationProcess',pattern)
        })
        .catch(e=>{
            //console.log("--No se encontraron contents ",e)
        })         
    },
    'ConfirmationProcess': function(pattern) {
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['ok','siguiente'] : ['ok','next']
            this.attributes['PrevRequest'] = "ReadTitle"
            
            var index = this.attributes['ActualIndex']
            var contenidos = this.attributes['Contenidos'][index]
            var contenido = contenidos.content.dataContent
            var usuario = this.attributes['logueado']
            
            var cont = new Content(contenido,pattern)
                cont.getTextFromDom(usuario)
                .then(resJson => {
                    var textoJson = JSON.parse(resJson)
                    //console.log("OrderedMode - textoJson: ",textoJson.title)                  
                    if(this.attributes['Contenidos'][index + 1]){
                        var nextContenido = this.attributes['Contenidos'][index + 1].content.dataContent                        
                        console.log("Va a buscar el siguiente - ",nextContenido)                  
                        var nextCont = new Content(nextContenido,pattern)
                        this.attributes['NextState'] = nextCont.sendNextRequest(nextContenido) //Al mandar el proximo request, obtenemos el próximo state
                    }
                    
                    if(textoJson.title){
                        console.log("#Va al confirmation title")
                        cont.setText(textoJson)
                        this.handler.state = cont.getState()
                        console.log("#Va al confirmation title ",this.handler.state)
                        this.emitWithState('Confirmation',cont)
                    }else{
                        this.handler.state = cont.getState()
                        this.emitWithState('Confirmation',cont)
                    }
                })
                .catch((e) => {
                    console.log("Error al intentar traer el title en OrderderMode - ",e)
                    if(this.attributes['Contenidos'][index + 1]){
                        var nextContenido = this.attributes['Contenidos'][index + 1].content.dataContent                        
                        var nextCont = new Content(nextContenido,pattern)
                        this.attributes['NextState'] = nextCont.sendNextRequest(nextContenido) //Al mandar el proximo request, obtenemos el próximo state
                    }
                    this.handler.state = cont.getState()
                    this.attributes['PrevRequest'] = "ConfirmationProcess"
                    this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['siguiente'] : ['next']
                    //this.emitWithState('Confirmation',cont)                    
                    this.emit(':ask',this.t('XPATH_CHANGED',{url:contenido.info.url}),this.t('XPATH_CHANGED',{url:contenido.info.url}))                    
                })         
    }
}

/*
    'AMAZON.YesIntent':function(){//Utterance yes
        if(this.attributes['PrevRequest'] != 'ReadContents'){
            console.log("entra al yes")
            this.emitWithState('IncorrectIntent');
        }else{
            this.emitWithState('ReadInOrder');
        }
    },
    'AMAZON.NoIntent':function(){//Utterance no
        if(this.attributes['PrevRequest'] != 'ReadContents'){
            console.log("entra al no")
            this.emitWithState('IncorrectIntent');
        }else{
            this.handler.state = 'categoryMode'
            this.emitWithState('CategoriesIntent');
        }
    },
    'IncorrectIntent':function(){ //Poner bien el mensaje
        console.log("--entra al incorrect")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            console.log("--vuelve del callback",message)
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    },
    'Logout': function(){
        this.handler.state = 'validationMode';
        this.emitWithState('Logout')
    },
    'Unhandled': function() {
        console.log("--entra al unhandled ordered")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    }*/
