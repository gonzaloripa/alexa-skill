var OnlyTitle = require('./OnlyTitle')
var TitleAndContent = require('./TitleAndContent')

module.exports = class Content {

  constructor(contenido,pattern){

  	this.info = contenido
  	this.pattern = pattern
  	this.texto = null
    this.assignStrategy()
  }

  assignStrategy(){
    var getOnlyTitle = false
    try{
      getOnlyTitle = (this.pattern == "Read only titles" || this.pattern == "Leer solo titulos" ||  
      this.info.metadata.pattern == "OnlyTitle" || this.info.navegable != true)
    }catch(e){
      //console.log("Entra por el catch---", getOnlyTitle)
      getOnlyTitle = (this.pattern == "Read only titles" || this.pattern == "Leer solo titulos"|| this.info.navegable != true)
    }
    
	  let extractionStrategy = (getOnlyTitle) ? new OnlyTitle() : new TitleAndContent()
    console.log("Clase Content Strategy- ",getOnlyTitle,extractionStrategy, this.pattern, this.info)
  	this.setStrategy(extractionStrategy)
    this.state = this.extractionStrategy.getState() 
  }

  async getTextFromDom(usuario){
    return new Promise(async (resolve) => {
      //let content = this.getInfo()
      //this.setText(this.extractionStrategy.getText(infoContent,usuario))
      let text = await this.extractionStrategy.getText(this.info,usuario)
      console.log("Get text from Dom in Content - ",text)
      resolve(JSON.stringify(text))
    })
  }

  sendNextRequest(nextContent){
    return this.getStrategy().sendNextRequest(nextContent)               
  }

  getPattern(){
    return this.pattern
  }

  getState(){
    return this.state
  }

  getStrategy(){
  	return this.extractionStrategy
  }

  getSpanishPattern(){
    return (this.pattern == "Leer solo titulos") ?
      "Leer solo titulos"
    :
      "Leer introduccion y contenido"  
  }

  getEnglishPattern(){
    console.log(this.pattern)
    return (this.pattern == "Leer introduccion y contenido") ?
      "Read introduction and content" 
    :
      "Read only title"
    }

  setStrategy(strategy){
  	this.extractionStrategy = strategy
  }

  getInfo(){
    return this.info
  }

  setInfo(info){
    this.info = info 
  }

  getText(){
    return this.texto
  }

  setText(textJson){
  	this.texto = textJson
  }

}
