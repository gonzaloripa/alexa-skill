//Usar dynamoose
var request = require('request');

function obtener_datos_conf(loggedName,user_id,category,callback){ 
  request({ method: 'GET', 
            uri: 'https://alexa-apirest.herokuapp.com/users/notices/'+category+'/'+user_id+'/'+loggedName,
            headers:{'Content-type': 'application/json'}
          }, function (error, response, body) {
              if (error) {console.log('error:', error)} // Print the error if one occurred
              console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
              if(response.statusCode == 200){
                var res = JSON.parse(body);
                console.log('body:', res); 
                callback(res) //res.url,res.xpath
              }else{
                callback(null)
              }
            }
        );
}

function getCategories(loggedName,user_id,callback){
    request({ method: 'GET', 
            uri: 'https://alexa-apirest.herokuapp.com/users/categories/'+user_id+'/'+loggedName,
            headers:{'Content-type': 'application/json'}
          }, function (error, response, body) {
              if (error) {console.log('error:', error)} // Print the error if one occurred
              console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
              if(response.statusCode == 200){
                var res = JSON.parse(body);
                console.log('body:', res); //res=[{"category":"value"},{}]
                callback(res) //res.url,res.xpath
              }else{
                callback(null)
              }
            }
        );

}
//request to get a username from database
function busqueda_usuario(loggedName,user_id,callback){
  request({method: 'GET',
           uri:'https://alexa-apirest.herokuapp.com/users/'+user_id+'/'+loggedName,
           headers:{'Content-type': 'application/json'}
          },(error, response, body) => { 
            if(error){
              console.log('error: '+ error)
            }else{
              console.log(body,Object.keys(response))
              if(response.statusCode == 200){
                console.log("usuario retornado: ",body)
                callback(body)
              } else {
                console.log('error: '+ response.statusCode)
                console.log(body)
                callback(null)
              }
            }
          }
        );
}

function registrar_usuario(username,user_id){ //HACER

  request({method: 'POST',
           uri:'https://alexa-apirest.herokuapp.com/users/',
           headers:{'Content-type': 'application/json'},
           body:{'name':username,'userId':user_id},
           json: true
          },(error, response, body) => { 
            if(error){
              console.log('error: '+ error)
            }else{
              console.log(response,Object.keys(response))
              if(response.statusCode == 200){
                console.log("usuario retornado: ",username)
              } else {
                console.log('error: '+ response.statusCode)
                console.log(body)
              }
            }
          }
        );        
}

exports.busqueda_usuario = busqueda_usuario;
exports.registrar_usuario = registrar_usuario;
exports.obtener_datos_conf = obtener_datos_conf;
exports.getCategories = getCategories;
