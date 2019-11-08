var Alexa = require('alexa-sdk');
var request_db = require('./request-db');
var index = require('./index');
var Content = require('./Classes/Content')
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')

//Controlar en cada intent si viene del correcto, sino redireccionar
module.exports = {
    'ReturnNoticeIntent':function(selectedCategory=""){ //Utterance:read my notice
        console.log("selected category",selectedCategory)
        this.attributes['PrevState'] = "categoryMode"
        var pattern = "Leer introduccion y contenido"
        var usuarioLogueado = this.attributes['logueado'];
        var index = this.attributes['ActualIndex'];
        if(this.attributes['logueado'] && selectedCategory != ""){              
                request_db.obtener_contenidos(usuarioLogueado,selectedCategory)    //,this.event.session.user.userId
                .then(contenidos => {
                    console.log("---contenidos",contenidos)
                    this.attributes['Contenidos'] = contenidos
                    this.attributes['ActualIndex'] = 0
                    this.attributes['ContentsToRead'] = []
                    var contenido = contenidos[0].content.dataContent
                    console.log("antes del contents ready",contenido)
                    var cont = new Content(contenido,pattern);
                    cont.getTextFromDom(contenido,usuarioLogueado)
                        .then(resJson => {
                            var textoJson = JSON.parse(resJson)
                            cont.setText(textoJson)
                            this.handler.state = cont.getState()
                            if(this.attributes['Contenidos'][index + 1]){
                                var nextContenido = this.attributes['Contenidos'][index + 1].content.dataContent                        
                                var nextCont = new Content(nextContenido,pattern)
                                this.attributes['NextState'] = nextCont.sendNextRequest(nextContenido)
                            }
                            this.emitWithState('Confirmation',cont)
                        })
                        .catch(error => {
                                console.log(error)
                                this.emit(
                                ':ask',
                                this.t('XPATH_CHANGED',{url:contenido.info.url}),
                                this.t('XPATH_CHANGED',{url:contenido.info.url})
                            )                    
                        })
                })
                .catch(err => {
                    console.log("--No se pudieron obtener los contenidos ",err)
                });
        }                   
    },
    'Confirmation':function(content){
        let myThis = this
        this.attributes['PrevRequest'] = "Confirmation"
        this.attributes['PrevState'] = "contentMode"
        var pattern = (this.event.request.locale == "es-ES") ? content.getSpanishPattern() : content.getEnglishPattern() 
        //console.log("Pattern ",pattern,this.event.request.locale)
        index.setAttributes(this,content,this.attributes['ActualIndex'])//res.json()={contenido,host,title,intro}
        .then(() =>{
            myThis.emitWithState(
                this.t('CONTENTS_READY_PATTERN',{pattern:pattern}),
                this.t('CONTENTS_READY_PATTERN',{pattern:pattern})
            )    
        })
        .catch(err =>{
            //console.log("Error Confirmation Content mode - ",err)
        })
    },
    'AMAZON.StopIntent': function () {
        this.emit(':ask',this.t('STOP_MESSAGE'),this.t('REP_STOP'));
    },
    'Retry': function(){
        var currentIndex = this.attributes['ActualIndex']
                    
        var contenido = this.attributes['Contenidos'][currentIndex].content.dataContent
        var content = new Content(contenido,this.attributes['ActualPattern'])

        getNextContent(contenido,content,currentIndex,this)  

    },
    'ConfirmationProcess':function(){ //Next utterance
        console.log("Siguiente Content - ",this.attributes['PrevRequest'])
        if(this.attributes['PrevRequest'] != 'ReadTitle' ){
            this.emitWithState('IncorrectIntent');
        }
        else{
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['si','no'] : ['yes','no']      
            var currentIndex = this.attributes['ActualIndex']
            //console.log("---Entro al next ",currentIndex,this.attributes['ContentsToRead'].length,this.attributes['Contenidos'])

            if(currentIndex == (this.attributes['Contenidos'].length - 1) ){//Si leyó toda la lista 
                if(this.attributes['PrevState'] == "categoryMode"){
                    this.handler.state = 'categoryMode'
                    this.emitWithState('CategoriesIntent')
                }
                else{
                    this.handler.state = 'flowMode'
                    this.emitWithState('ReadContents')
                }
            }
            else{ 
                if( this.attributes['Contenidos'].length > this.attributes['ContentsToRead'].length ){ //Si todavia quedan contenidos por leer, va a recuperar los que obtuvo en paralelo
                    this.attributes['ActualIndex'] += 1
                    var currentIndex = this.attributes['ActualIndex']
                                     
                    var contenido = this.attributes['Contenidos'][currentIndex].content.dataContent
                    var content = new Content(contenido,this.attributes['ActualPattern'])
                    //console.log("--Entra al tercer if content mode - ",content)

                    getNextContent(contenido,content,currentIndex,this)  
                }                 
            }
        }
    },
    'ReadTitle':function(){ 
            var index = this.attributes['ActualIndex'];
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['si','no'] : ['yes','no']
            this.attributes['PrevRequest'] = 'ReadTitle';

            var contenido = this.attributes['Contenidos'][index].content.dataContent
            var content = this.attributes['ContentsToRead'][index].texto
            //console.log("--Entra al read title ",index,contenido,this.attributes['ContentsToRead']) 

            var speechOutput = content.speechOutput;            
            
            var title = content.title;
            var url = contenido.info.url
            this.attributes['ActualTitle'] = title;
            this.attributes['Intro'] = content.intro
            this.attributes['ActualUrl'] = url
            this.attributes['ActualPath'] = contenido.info.xpath
            var host = content.host
            var metainfo = ""
                
            if(contenido.metadata)
                metainfo = (contenido.metadata.metaInfo != null) ? contenido.metadata.metaInfo : ""
            
            if(index == (this.attributes['Contenidos'].length - 1)){
                metainfo = this.t('PREV_METAINFO') + metainfo
            }

            if(index == 0){//Agrega mensaje inicial a la lectura de titulos
                //console.log("--Con mensaje inicial - ",this.t('LIST_OF_TITLES',{metainfo:metainfo,title:title,url:host}))
                this.emit(':ask',this.t('LIST_OF_TITLES',{metainfo:metainfo,title:title,url:host}),this.t('LIST_OF_TITLES',{metainfo:metainfo,title:title,url:host}));//Lee los titulos de a uno
            }else{
                //console.log("--Titulo directo ",this.t('READ_TITLE',{metainfo:metainfo,title:title,url:host}))
                this.emit(':ask',this.t('READ_TITLE',{metainfo:metainfo,title:title,url:host}),this.t('LAST_TITLE',{metainfo:metainfo,title:title,url:host}));//Lee los titulos de a uno
            }
            //this.handler.state = 'introMode'

    },    
    'Okintent': function() { //Utterance:ok
        console.log("-------OkIntent - ",this.attributes['PrevRequest'])
        if(this.attributes['PrevRequest'] != 'ReadTitle' || this.attributes['PrevState'] == 'orderedMode' ){
            this.emitWithState('IncorrectIntent');
        }
        else{
            //console.log("--Entra al ok - Content mode")
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['si','no'] : ['yes','no']
            this.attributes['PrevRequest'] = this.event.request.intent.name;
            this.emit(':ask',this.t('ASK_FOR_INTRO'),this.t('ASK_FOR_INTRO'))
        }
    },
    'AMAZON.YesIntent':function(){//Utterance yes
        console.log("--Entra al yes Content mode - ",(this.attributes['Contenidos'].length - 1),this.attributes['ActualIndex'])
        try{
            if(this.attributes['PrevRequest'] == 'Confirmation' || this.attributes['PrevRequest'] == 'Categories'){
                //let pattern = this.attributes['ActualPattern']
                //let indice = this.attributes['ActualIndex']
                this.emitWithState('ReadTitle')

            }else{
                if(this.attributes['PrevRequest'] != 'OkIntent'){
                    //console.log("Intent incorrecto - Yes Content mode")
                    this.emitWithState('IncorrectIntent');
                }else{
                    this.handler.state = 'introMode'
                    this.emitWithState('ProcessIntro', this.attributes['Intro']);
                }
            }
        }catch(err){
            //console.log("Error en el Yes ContentMode - ",err)
            //-------volver al menu--------
        }
    },
    'AMAZON.NoIntent':function(){//Utterance no
        //console.log("Entra la NoIntent - ",this.attributes['PrevRequest'])
        if(this.attributes['PrevRequest'] == 'Confirmation'){
            this.emitWithState('ReturnMenu');
        }else{
            if(this.attributes['PrevRequest'] != 'OkIntent'){
                //console.log("entra al no")
                this.emitWithState('IncorrectIntent');
            }else{
                this.attributes['PrevRequest'] = 'ReadTitle'
                this.emitWithState('ConfirmationProcess');
            }
        }
    },
    'ReadContent':function(){
        var index = this.attributes['ActualIndex']
        var content = this.attributes['ContentsToRead'][index].texto
        this.attributes['PrevRequest'] = 'ReadContent';
        //console.log("--Entra al read Content mode - ",content.speechOutput)
        this.emit(':ask', content.speechOutput ,this.t('REPROMPT_TEXT'));                
        //this.attributes['ActualIndex'] +=1    
    },
    'IncorrectIntent':function(){
        console.log("--Entra al incorrect - ",this.attributes['OPTIONS'])
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            console.log("--vuelve del callback",message)
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    },
    'ReturnMenu':function(){ //Utterance : Back to start menu
                if(this.attributes['PrevState'] == "categoryMode"){
                    this.handler.state = 'categoryMode'
                    this.emitWithState('CategoriesIntent')
                }
                else{
                    this.handler.state = 'flowMode'
                    this.emitWithState('ReadContents')
                }
    },
    'AMAZON.HelpIntent':function(){//Utterance Which are my options?
        index.returnOptions(this.attributes['OPTIONS'],this,(options)=>{
            this.emit(':ask',this.t('READ_OPTIONS',{options:options}),this.t('READ_OPTIONS',{options:options}));
        });
    },
    'Logout': function(){
        this.handler.state = 'validationMode';
        this.emitWithState('Logout')
    },
    'Unhandled': function() {
        console.log("--entra al unhandled content mode")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    }
}


async function getNextContent(contenido,content,currentIndex,myThis){
                        console.log("Llama a /getContents - Title Mode")
                        await axios({
                            method:'get',
                            url:"https://alexa-apirest.herokuapp.com/users/getContents"
                        })
                        .then(function(res) {
                            return res.data
                        })
                        .then((json)=>{
                            content.setText(json)
                            myThis.handler.state = myThis.attributes["NextState"]
                            let nextContenido
                            if(myThis.attributes['Contenidos'] && myThis.attributes['Contenidos'][currentIndex + 1]){
                                nextContenido = myThis.attributes['Contenidos'][currentIndex + 1].content.dataContent
                                console.log("Va a buscar el siguiente Title Mode - ",nextContenido)
                                var nextCont = new Content(nextContenido,myThis.attributes['ActualPattern'])
                                myThis.attributes['NextState'] = nextCont.sendNextRequest(nextContenido)
                            }
                            
                            index.setAttributes(myThis,content,myThis.attributes['ActualIndex']) //cont= {contenido,host,title,intro}   
                            //myThis.handler.state = "contentMode";
                            myThis.emitWithState('ReadTitle')
                        })
                        .catch((error) => {
                            if(error.response){
                                if(error.response.status == 304){
                                    //Decirle al usuario que invoque retry para volver a intentar recuperar el contenido
                                    myThis.emit(':ask',myThis.t('CONTENTS_NOT_READY',{url:contenido.info.url}),myThis.t('CONTENTS_NOT_READY',{url:contenido.info.url}))
                                }else{
                            
                                    let nextContenido;
                                    myThis.handler.state = myThis.attributes["NextState"]
                                    if(myThis.attributes['Contenidos'] && myThis.attributes['Contenidos'][currentIndex + 1]){
                                        nextContenido = myThis.attributes['Contenidos'][currentIndex + 1].content.dataContent 
                                        var nextCont = new Content(nextContenido,myThis.attributes['ActualPattern'])
                                        myThis.attributes['NextState'] = nextCont.sendNextRequest(nextContenido)
                                        myThis.emit(':ask',myThis.t('XPATH_CHANGED',{url:contenido.info.url}),myThis.t('XPATH_CHANGED',{url:contenido.info.url}))                                          
                                    }else{
                                        myThis.emit(':ask',myThis.t('XPATH_CHANGED_LAST',{url:contenido.info.url}),myThis.t('XPATH_CHANGED_LAST',{url:contenido.info.url}))                                          
                                    }
                                    console.log("Va a buscar el siguiente Title Mode despues de dar error - ",nextContenido,error)
                                    myThis.attributes['PrevRequest'] = 'NotReady'
                                    /*this.attributes['Contenidos'].shift()
                                    
                                    axios.put('https://alexa-apirest.herokuapp.com/users/setContentUnavailable/'+this.attributes['logueado'], {
                                    contenidos:noticia
                                    })
                                    .then(function (response) {
                                        console.log(response);
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                    });
                                    */
                                }
                            }
                        })      
                    }