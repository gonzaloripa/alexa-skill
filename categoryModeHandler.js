var Alexa = require('alexa-sdk');
var request_db = require('./request-db');
var index = require('./index');
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')

module.exports = {
    'SessionEndedRequest' : function() {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':ask',this.t('STOP_MESSAGE'),this.t('REP_STOP'));
    }, 
    'CategoriesIntent':function(){ //Utterance: by categories,categories
        var usuarioLogueado = this.attributes['logueado'];
        request_db.getCategories(usuarioLogueado) //categories=[{},{}]    ,this.event.session.user.userId
        .then(categories =>{
            this.attributes['ActualIndex'] = -1 
            console.log("---Categories",categories)
            this.attributes['Categories'] = categories
            this.emitWithState('ConfirmationProcess')
        })
        .catch(e=>{
            console.log("--No se encontraron categorias ",e)
        })    
    },    
    'ConfirmationProcess':function(){ //Utterance:Next
        this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['ok','siguiente'] : ['ok','next']
        var listaCategorias = this.attributes['Categories'] 
        if(this.attributes['ActualIndex'] == (listaCategorias.length - 1)){//Si leyó toda la lista 
            this.handler.state = ''
            this.emitWithState(':ask',this.t('START_POINT'),this.t('START_POINT'))
        }else{ 
                this.attributes['ActualIndex']+=1
                var index = this.attributes['ActualIndex'];
                var category = listaCategorias[index];
                if(index == 0){//Agrega mensaje inicial a la lectura de categorias
                    this.emit(':ask',this.t('LIST_OF_CATEGORIES',{category:category}),this.t('LIST_OF_CATEGORIES',{category:category}));
                }else{
                    this.emit(':ask',category,category);//Lee los titulos de a uno
                }            
        }
    },
    'Okintent': function() { //Utterance:ok
        var listaCategorias = this.attributes['Categories']
        this.handler.state = 'contentMode'
        this.attributes['PrevRequest'] = 'Categories'
        console.log("---state :",this.handler.state)
        var cate = listaCategorias[this.attributes['ActualIndex']];
        console.log("---cate :",cate)
        this.emitWithState('ReturnNoticeIntent',cate)
        //Fijarse como volver de nuevo a la lista de categorias                
    },
    'ReturnMenu':function(){ //Utterance : Back to start menu
        console.log("Entra al back CategoryMode")
        this.handler.state = 'flowMode';
        this.emitWithState('ReadContents');
    },
    'Logout': function(){
        this.handler.state = 'validationMode';
        this.emitWithState('Logout')
    },
    'Unhandled': function() {
    	console.log("--entra al unhandled categories")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });      
    }
}