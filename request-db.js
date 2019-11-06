
const fetch = require('node-fetch');

const obtener_contenidos = async(loggedName,category) => {  //,user_id
  const result = await fetch('https://alexa-apirest.herokuapp.com/users/contentsByCategory/'+category+'/'+loggedName) //+'/'+user_id
  .then(res => res.json())
  .then(json => {
    return json //json=[{"infocontents": [{"_id","url","xpath","__v"}]},{}]
  })
  return result
}
 
const obtener_contenidos_por_orden = async(loggedName,conjunto) => {  //,user_id
  const result = await fetch('https://alexa-apirest.herokuapp.com/users/contentsByOrder/'+conjunto+'/'+loggedName) //+'/'+user_id
  .then(res => res.json())
  .then(json => {
    return json //json=[{content:{idcontent,infocontent:{url","xpath"},data}},{}] 
  })
  return result
}

const getCategories = async(loggedName) => { //,user_id
    const result = await fetch('https://alexa-apirest.herokuapp.com/users/categories/'+loggedName) //+user_id+'/'
    .then(res => res.json())
    .then(json => {                
        console.log('body:', json); //json=[{"value"},{}]
        return json //json.url,json.xpath
    })
    return result
}

const getConjuntos = async(loggedName) => {
    const result = await fetch('https://alexa-apirest.herokuapp.com/users/flows/'+loggedName) //+user_id+'/'
    .then(res => res.json())
    .then(json => {                
        console.log('body:', json); //json=[{"nombreConjunto":"value","pattern":"value"},{}]
        return json 
    })
    return result  
}

//request to get a username from database
const busqueda_usuario = (loggedName) => {
  return new Promise((resolve,reject) => {
    const result = fetch('https://alexa-apirest.herokuapp.com/users/'+loggedName) //+user_id+'/'
    .then(res => res.json())
    .then(body => {
      console.log(body)
      resolve(body.name)
    })
    .catch(error => {
      console.log("Error ",error)
      reject(loggedName)
    })
  })
}

const registrar_usuario = async(username) => { //,user_id
  var body = { 'name':username}; //,'userId':user_id 
  const result = await fetch('https://alexa-apirest.herokuapp.com/users/', { 
      method: 'POST',
      body:    JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(json => {
    return json
  })
  return result
}
      
//request to get title of content
const getTitle = async(url,path) => { //,user_id
  const result = await fetch("https://alexa-nightmare.herokuapp.com/contents/getTitle?url="+url+"&path="+path)
  .then(res => res.text())
  .then(body => {
    console.log(body)
    return body
  })
  return result
}



exports.busqueda_usuario = busqueda_usuario;
exports.registrar_usuario = registrar_usuario;
exports.obtener_contenidos = obtener_contenidos;
exports.obtener_contenidos_por_orden = obtener_contenidos_por_orden;
exports.getCategories = getCategories;
exports.getConjuntos = getConjuntos;

exports.getTitle = getTitle;
