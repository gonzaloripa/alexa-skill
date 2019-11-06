var Alexa = require('alexa-sdk');
var request_db = require('./request-db');
var index = require('./index');

module.exports = {
    'Register': function(){
        //var myThis = this;
        index.obtainSlotValue(this,(objectIntent)=>{ 
            index.confirmSlotValue(this,(objectIntent)=>{
                var slotValue = objectIntent.slots.User.value;                                
                request_db.busqueda_usuario(slotValue) //,this.event.session.user.userId
                .then( username =>{
                    console.log("username ",username)
                    this.emit(':ask', this.t('REGISTER_REJ_MESSAGE',{slotValue:slotValue}),this.t('REP_REGISTER_REJ_MESSAGE'));
                })
                .catch( e =>{ //(no esta registrado)
                        request_db.registrar_usuario(slotValue)    //,this.event.session.user.userId    
                        .then(result=>{
                            console.log(result)
                            this.emit(':tell', this.t('REGISTER_SUC_MESSAGE', {slotValue:slotValue}));
                            this.emit('LaunchRequest')
                        })
                        .catch(e=>{
                            console.log("--No se pudo registrar al usuario ",e)
                        })
                })
            });
        });
    },
    'Login': function(){ 
        if(!this.attributes['logueado']){ //Si no ingresó nadie todavia
            this.handler.state = 'flowMode'
            this.emit('ReadContents')
            /*index.obtainSlotValue(this,(objectIntent)=>{//Funcion helper
                var slotValue = objectIntent.slots.User.value;//Almaceno el nombre dado por el usuario                
                request_db.busqueda_usuario(slotValue)//Voy a buscar el user a la base this.event.session.user.userId 
                .then(username =>{//Si el user ya está registrado en la base
                    this.attributes['logueado']= slotValue; //Se loguea: Asigna a prop.'logueado' de attributes de session el valor del slot(user)
                    this.handler.state = 'flowMode'
                    this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['leer mis contenidos','retornar mis contenidos'] : ['read my contents','return my contents']
                    var message = this.attributes['OPTIONS'][0]+this.t('CONECTOR')+this.attributes['OPTIONS'][1]
                    console.log(message)
                    this.emit(':ask', this.t('LOGIN_SUC_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_SUC_MESSAGE',{message:message}))
                })
                .catch(e =>{
                    console.log("---No se encontro el usuario ",e)
                    this.emit(':ask', this.t('LOGIN_REJ_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_REJ_MESSAGE'));                    
                })
            })*/    
        }
        else{
            var slotValue = this.attributes['logueado']
            this.emit(':ask', this.t('LOGIN_REJ2_MESSAGE',{slotValue:slotValue}),this.t('REP_LOGIN_REJ2_MESSAGE'));
        }
    },
    'Logout': function(){
        if(this.attributes['logueado']){
            index.obtainSlotValue(this,(objectIntent)=>{ //Funcion helper
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
    'AMAZON.HelpIntent':function(){//Utterance Which are my options?
        index.returnOptions(this.attributes['OPTIONS'],this,(options)=>{
            this.emit(':ask',this.t('READ_OPTIONS',{options:options}),this.t('READ_OPTIONS',{options:options}));
        });
    },
    'Unhandled': function() {
        console.log("--entra al unhandled validation")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    }
};