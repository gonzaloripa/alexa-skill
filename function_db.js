
// --------------- Functions for obtain data from database -----------------------

function busqueda_usuario(loggedName,user_id,callback){ //CAMBIAR!!!

    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-east-1'});
    var params = {
          TableName : 'User',
          ProjectionExpression: "#name",
          FilterExpression : '#name = :n',
          ExpressionAttributeNames: {'#name':'name'},
          ExpressionAttributeValues : {':n' : loggedName}
    };

    var documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

    console.log('Buscando un item en la tabla user por: userId,name ');

    documentClient.scan(params, function(err, data) {
       if (err) console.log(err);
       else{ 
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        if(data.Items.length != 0){ //si encontró el nombre
            data.Items.forEach(function(row){
                //console.log("----entro al for each " + row.name);
                callback(row.name); //retorna el nombre del usuario 
            });
        } else{
           callback(null); 
        }
       }
    });
    
 
}

function registrar_usuario(username,user_id){ 

    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-east-1'});
    var params = {
      TableName : 'User',
      Item: {
         userId: user_id,
         name:username
      }
    };

    var documentClient = new AWS.DynamoDB.DocumentClient();

    documentClient.put(params, function(err, data) {
      if (err) console.log(err);
      else console.log("PutItem succeeded:", JSON.stringify(data, null, 2));

    });
        
 
}

function obtener_datos_conf(loggedName,user_id,callback){ //CAMBIAR!!!

    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-east-1'});
    

    var params = {
          TableName : 'User',
          ProjectionExpression: "#url, xpath",
          FilterExpression : '#name = :n',
          ExpressionAttributeNames: {'#name':'name','#url':'url'},
          ExpressionAttributeValues : {':n' : loggedName}
    };

    var documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

    console.log('Buscando un item en la tabla user por: userId,name ');

    documentClient.scan(params, function(err, data) {
       if (err) console.log(err);
       else{ 
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        if(data.Items.length != 0){ //si encontró el nombre
            data.Items.forEach(function(row){
                //console.log("----entro al for each " + row.name);
                callback(row.url,row.xpath); //retorna la url y el xpath obtenidas de la configuracion del usuario 
            });
        } else{
           callback(null,null); 
        }
       }
    });
}

exports.busqueda_usuario = busqueda_usuario;
exports.registrar_usuario = registrar_usuario;
exports.obtener_datos_conf = obtener_datos_conf;



/*            var params = {
        TableName: 'User',
        Key:{
            'userId': user_id,
            'name':loggedName
        }
        };
        console.log('------ params'+ params.Key.userId + params.Key.name);
     var params = {
          ExpressionAttributeNames: {
           "AT": "AlbumTitle", 
           "ST": "SongTitle"
          }, 
          ExpressionAttributeValues: {
           ":a": {
             S: "No One You Know"
            }
          }, 
          FilterExpression: "Artist = :a", 
          ProjectionExpression: "#ST, #AT", 
          TableName: "Music"
         }; 
*/

/*
    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

            callback(data.Item.nuevo);  //retorna el nombre del usuario si es que está

        }
    });
*/