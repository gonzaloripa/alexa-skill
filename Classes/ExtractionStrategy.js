
module.exports = class ExtractionStrategy {

  constructor(){
  	
  }

  // Implementation required
  getText(){
    throw new Error('You have to implement the method getText!');

  }
  
  sendNextRequest(){
    throw new Error('You have to implement the method sendNewRequest!');
  }
}

