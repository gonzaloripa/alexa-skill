var ExtractionStrategy = require('./ExtractionStrategy')
var axios = require('axios')

module.exports = class Onlytitle extends ExtractionStrategy {
  constructor(){
    super()
  }
  
  sendNextRequest(content){
      console.log("SendNextRequest Clase Only Title - ", content) 

      axios.post('https://alexa-apirest.herokuapp.com/users/nextTitle', {
          contenidos:content.info 
      })
      .catch(function (error) {
          console.log("Error al volver del nextTitle - ",error);
      });
      return this.getState()
  }

  getState(){
    return "titleMode"
  }


  async getText(contenido){
    console.log("Clase OnlyTitle - getTitle solicita:", contenido.info.url)
    return await axios({
        method:'get',
        url:"https://headless-chrome-alexa.herokuapp.com/getTitle?url="+contenido.info.url+"&path="+contenido.info.xpath
    })
    .then(function(res) {
        if(res.statusText == 'OK')
          console.log("Resultado de getTitle: ",res.data)
          return res.data
    })
    .catch((error)=>{
        console.log("Error al volver de getTitle - ",error)
    	  return null
    })  
  }
}
