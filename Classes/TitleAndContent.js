var ExtractionStrategy = require('./ExtractionStrategy')
var axios = require('axios')

module.exports = class TitleAndContent extends ExtractionStrategy {
  
  constructor(){
    super()
  }

  sendNextRequest(content){
      console.log("Send next request Clase TitleAndContent -",content) 
      axios.post('https://alexa-apirest.herokuapp.com/users/nextRequest', {
          contenidos:content.info  
      })
      .catch(function (error) {
          console.log("Error al volver de nextRequest - ",error);
      });
      return this.getState()
  }
  
  getState(){
    return "contentMode"
  }

  async getText(contenido,usuario){
    console.log("Clase TitleAndContent getBodyContent - Solicita: ",contenido)
        return await axios({
            method:'get',
            url:"https://headless-chrome-alexa.herokuapp.com/getBodyContent?url="+contenido.info.url+"&path="+contenido.info.xpath
        })
        .then( res => {
          console.log(res.status,res.statusText);
          if(res.statusText == 'OK')
            return res.data
        })
        .then((body)=>{
            console.log("Resultado getBodyContent - ",body)
            return body
        })
        .catch((error)=>{
          console.log("Error al volver de getBodyContent - ",error)
          return null
        })
  }
}
