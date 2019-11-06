var Alexa = require('alexa-sdk');
var index = require('./index');
var Content = require('./Classes/Content')
var async = require("async");
const fetch = require('node-fetch');
var axios = require('axios')

module.exports = {
    Confirmation:function(content){
        this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['si','no'] : ['yes','no']
        this.attributes['PrevRequest'] = "ConfirmationTitle"
        //console.log("titleModeHandler -> Confirmation - ",content)
        var pattern = (this.event.request.locale == "es-ES") ? content.getSpanishPattern() : content.getEnglishPattern() 
        //console.log("Pattern ",pattern,this.event.request.locale)
        this.attributes['ActualPattern'] = pattern
        let myThis = this
        index.setAttributes(this,content,this.attributes['ActualIndex'])//res.json()={contenido,host,title,intro}
        .then(()=>{
            console.log("#Va al ReadTitle")
            myThis.emitWithState('ReadTitle')  
        })
        .catch(err =>{
            //console.log("Error Confirmation Title mode - ",err)
        })                             
    }, 
    'ReadTitle':function(){ 

            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['siguiente'] : ['next']
            var index = this.attributes['ActualIndex'];
            this.attributes['PrevRequest'] = "ReadTitle"
            var content = this.attributes['Contenidos'][index].content.dataContent
            var title = this.attributes['ContentsToRead'][index].texto
            console.log("Entra al read Title Mode - ",title) 

            var url = title.host
            this.attributes['ActualTitle'] = title.title;
            this.attributes['ActualUrl'] = url
            this.attributes['ActualPath'] = content.info.xpath
            var metainfo
            if(content.metadata)
                metainfo = (content.metadata.metaInfo != null) ? content.metadata.metaInfo : ""
            var host = url
            //console.log("entra3 ",url,host)
            //console.log("contenidoooo", this.attributes['Contenidos'][index].content)
            let nextContent = this.attributes['Contenidos'][index].content && this.attributes['Contenidos'][index].content.dataContent.metadata && this.attributes['Contenidos'][index].content.dataContent.metadata.next ? this.attributes['Contenidos'][index].content.dataContent.metadata.next : false

            /*if(index == (this.attributes['Contenidos'].length - 1)){
                metainfo = this.t('PREV_METAINFO') + metainfo
            }*/

            if(nextContent != false && nextContent != "Read directly"){

                if(index == 0){//Agrega mensaje inicial a la lectura de titulos
                    //console.log("entra4 ",this.t('NEXT_READ',{metainfo:metainfo,title:title.title,url:host}))
                    this.emit(':ask',this.t('NEXT_READ',{metainfo:metainfo,title:title.title,url:host}),this.t('NEXT_READ',{metainfo:metainfo,title:title.title,url:host}))
                }else{
                    //console.log("entra5 ",this.t('READ_TITLE',{metainfo:metainfo,title:title.title,url:host}))
                    this.emit(':ask',this.t('READ_TITLE_2',{metainfo:metainfo,title:title.title,url:host}),this.t('READ_TITLE',{metainfo:metainfo,title:title.title,url:host}));//Lee los titulos de a uno
                }
            }   
            else{
                if(index == 0){//Agrega mensaje inicial a la lectura de titulos
                   //console.log("entra6 ",this.t('NEXT_READ',{metainfo:metainfo,title:title.title,url:host}))
                    this.response.speak(this.t('NEXT_READ',{metainfo:metainfo,title:title.title,url:host}),this.t('NEXT_READ',{metainfo:metainfo,title:title.title,url:host}))
                    
                }else{
                    //console.log("entra7 ",this.t('READ_TITLE',{metainfo:metainfo,title:title.title,url:host}))
                    this.response.speak(this.t('READ_TITLE_2',{metainfo:metainfo,title:title.title,url:host}),this.t('READ_TITLE',{metainfo:metainfo,title:title,url:host}));//Lee los titulos de a uno
                }
                this.response.shouldEndSession(false)
                this.emit(':responseReady');                        
            }
    },
    'AMAZON.YesIntent':function(){//Utterance yes
        try{    
            if(this.attributes['PrevRequest'] == 'ReadTitle'){
                //let pattern = this.attributes['ActualPattern'];
                //let indice = this.attributes['ActualIndex'];
                //let contenido = this.attributes['Contenidos'][indice].content;
                //let content = new Content(contenido,pattern);
                //console.log("title mode yes intent content", content);
                // this.attributes['NextState'] = content.sendNextRequest(contenido);
                //this.attributes['ContentsToRead'][indice] = content;
                this.emitWithState('ConfirmationProcess');

            }else{
                //console.log("Intent incorrecto - Yes Title mode")
                this.emitWithState('IncorrectIntent');
            }
        }catch(err){
            //console.log("Error en el Yes TitleMode - ",err)
            //-------volver al menu-----
        }
    },
    'AMAZON.NoIntent':function(){//Utterance no
        if(this.attributes['PrevRequest'] != "ReadTitle"){
            //console.log("entra al no")
            this.emitWithState('IncorrectIntent');
        }else{
            this.emitWithState('ReturnMenu')
        }
    },
    'Retry': function(){
        if(this.attributes['PrevRequest'] != 'NotReady'){
            this.emitWithState('IncorrectIntent');
        }else{
            var currentIndex = this.attributes['ActualIndex']
                        
            var contenido = this.attributes['Contenidos'][currentIndex].content.dataContent
            var content = new Content(contenido,this.attributes['ActualPattern'])

            getNextContent(contenido,content,currentIndex,this)  
        }
    },
    'ConfirmationProcess':function(){ //Next utterance ------- CONTROLAR
        if(this.attributes['PrevRequest'] != 'ReadTitle'){
            this.emitWithState('IncorrectIntent');
        }
        else{
            console.log("Entra al else")
            let myThis = this;
            this.attributes['OPTIONS'] = (this.event.request.locale == "es-ES") ? ['siguiente'] : ['next']      
            var currentIndex = this.attributes['ActualIndex']
            if(currentIndex == (this.attributes['Contenidos'].length - 1) ){//Si leyó toda la lista 
                this.emit(':tell','No hay mas informacion del clima')

                /*if(this.attributes['PrevState'] == "categoryMode"){
                    this.handler.state = 'categoryMode'
                    this.emitWithState('CategoriesIntent')
                }
                else{
                    this.handler.state = 'flowMode'
                    this.emitWithState('ReadContents')
                }*/
            }
            else{
                if( this.attributes['Contenidos'].length > this.attributes['ContentsToRead'].length ){ //Si todavia quedan contenidos por leer, va a recuperar los que obtuvo en paralelo
                    this.attributes['ActualIndex'] += 1
                    var currentIndex = this.attributes['ActualIndex']
                    var contenido = this.attributes['Contenidos'][currentIndex].content.dataContent
                    var content = new Content(contenido,this.attributes['ActualPattern'])

                    getNextContent(contenido,content,currentIndex,this)     
                }
            }
        }
    },
    'ReturnMenu':function(){ 
        this.emit(':tell','Ok. Esa fue la informacion del clima')

        //Utterance : Back to start menu
        /*if(this.attributes['PrevState'] == "categoryMode"){
            this.handler.state = 'categoryMode'
            this.emitWithState('CategoriesIntent')
        }
        else{
            this.handler.state = 'flowMode'
            this.emitWithState('ReadContents')
        }*/
    },
    'IncorrectIntent':function(){ //Poner bien el mensaje
        console.log("--entra al incorrect")
        index.returnOptions(this.attributes['OPTIONS'],this,(message)=>{
            //console.log("--vuelve del callback",message)
            this.emit(':ask', this.t('CONTENT_REJ2_MESSAGE',{message:message}),this.t('REP_CONTENT_REJ2_MESSAGE',{message:message}));
        });
    },
    'Unhandled': function() {
        console.log("--entra al unhandled title")
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