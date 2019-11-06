
var Alexa = require('alexa-sdk');
var request_db = require('./request-db');
var index = require('./index');
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')

module.exports = {
    'AMAZON.StopIntent': function () {
        this.emit(':ask',this.t('STOP_MESSAGE'),this.t('REP_STOP'));
    },
    'ReadContents':function(){ //Utterance: read my contents
        this.attributes['PrevRequest'] = 'ReadContents'
        if(!this.attributes['logueado']){ //Si no ingresó nadie todavia
            index.obtainSlotValue(this,(objectIntent)=>{
                var slotValue = objectIntent.slots.User.value;               
                var promise = request_db.busqueda_usuario(slotValue)
                promise.then(username =>{
                    //console.log(username)
                    this.attributes['logueado']= slotValue; 
                    this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['mis grupos','por categorias'] : ['my flows','by category']                        
                    var message = this.attributes['OPTIONS'][0]+this.t('CONECTOR')+this.attributes['OPTIONS'][1]
                    this.emit(':ask', this.t('LOGIN_SUC_MESSAGE',{slotValue:slotValue})+this.t('READ_OP'),this.t('REP_LOGIN_SUC_MESSAGE',{message:message}))
                })
                .catch(e =>{
                    this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['leer mis contenidos','retornar mis contenidos'] : ['read my contents','return my contents']                        
                    //console.log("---No se encontro el usuario ",e)
                    this.emit(':ask', this.t('LOGIN_REJ_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_REJ_MESSAGE'));                    
                })
            })    
        }else{
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['mis grupos','por categorias'] : ['my flows','by category']                        
            this.emit(':ask', this.t('READ_OP'),this.t('READ_OP'))            
        }
    },
    'CategoriesIntent':function(){ //Utterance: by categories,categories
        if(this.attributes['PrevRequest'] == 'ReadContents'){
            this.handler.state = 'categoryMode'
            this.emitWithState('CategoriesIntent')
        }else{
            this.emitWithState('IncorrectIntent')
        }
    },
    'SetsIntent':function(){//Utterance: my flows
        if(this.attributes['PrevRequest'] == 'ReadContents'){
            var usuarioLogueado = this.attributes['logueado'];
            this.attributes['PrevRequest'] = 'SetsIntent'
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['ok','siguiente'] : ['ok','next']
            request_db.getConjuntos(usuarioLogueado) //conjuntos=[{},{}]    ,this.event.session.user.userId
            .then(conjuntos =>{
                this.attributes['ActualIndex'] = -1 
                //console.log("---Conjuntos",conjuntos)
                this.attributes['Conjuntos'] = conjuntos
                this.emitWithState('ConfirmationProcess')
            })
            .catch(e=>{
                //console.log("--No se encontraron conjuntos ",e)
            })
        }else{
            this.emitWithState('IncorrectIntent')            
        } 
    },    
    'ConfirmationProcess':function(){ //Utterance:Next
        //console.log("---entra al confirm")
        if( this.attributes['PrevRequest'] == 'SetsIntent'){
            console.log("---Primer if ")
            var listaConjuntos = this.attributes['Conjuntos'] 
            if(this.attributes['ActualIndex'] == (listaConjuntos.length - 1)){//Si leyó toda la lista 
                console.log("---Segundo if ")
                this.attributes['PrevRequest'] = 'ReadContents'
                this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['mis grupos','por categorias'] : ['my flows','by category']                        
                this.emit(':ask',this.t('START_POINT_2'),this.t('START_POINT_2'))
            }else{ 
                console.log("---Else ")
                this.attributes['ActualIndex']+=1
                var index = this.attributes['ActualIndex'];
                var conjunto = listaConjuntos[index].nombreConjunto;
                if(index == 0){//Agrega mensaje inicial a la lectura de conjuntos
                    this.emit(':ask',this.t('LIST_OF_SETS',{conjunto:conjunto}),this.t('LIST_OF_SETS',{conjunto:conjunto}));
                }else{
                    this.emit(':ask',conjunto,conjunto);//Lee de a uno
                }
            }            
        }else{
            this.emitWithState('IncorrectIntent')             
        }
    },
    'Okintent': function() { //Utterance:ok
        var listaConjuntos = this.attributes['Conjuntos']
        console.log("Okintent  ",this.attributes['PrevRequest'])
        if( this.attributes['PrevRequest'] == 'SetsIntent'){
            this.handler.state = 'orderedMode'
            //console.log("---state :",this.handler.state)
            var conj = listaConjuntos[this.attributes['ActualIndex']].nombreConjunto;
            var pattern = listaConjuntos[this.attributes['ActualIndex']].pattern
            this.attributes['ActualPattern'] = pattern
            //console.log("---conj :",conj,pattern)
            this.emitWithState('ReadInOrder',conj,pattern)
        }else{
            this.emitWithState('IncorrectIntent') 
        }

    },
    'AMAZON.HelpIntent':function(){//Utterance Which are my options?
        index.returnOptions(this.attributes['OPTIONS'],this,(options)=>{
            this.emit(':ask',this.t('READ_OPTIONS',{options:options}),this.t('READ_OPTIONS',{options:options}));
        });
    },
    'IncorrectIntent':function(){ 
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
    'ReturnMenu':function(){ //Utterance : Back to start menu
        this.attributes['PrevRequest'] = 'ReturnMenu'
        this.emitWithState('ReadContents')
    },
    'Unhandled': function() {
        console.log("--entra al unhandled set")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    }
}