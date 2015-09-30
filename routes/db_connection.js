var mysql = require('mysql');
var db_config = {
    host: 'localhost',
    user: 'root',
    password: 'N0d3!n$tanc3',
    database: 'radiyoo',
    charset:'utf8mb4'
};
function handleDisconnect() {
    connection = mysql.createConnection(db_config); 
   
    connection.connect(function(err) {  
        if(err) {                          
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 
        }                                    
    });                              
   
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
            handleDisconnect();                        
        } else {                                     
            throw err;                                
        }
    });
    var sql1 = "SET CHARACTER SET utf8mb4";
    connection.query(sql1, function (err, result) {
    });
    var sql1 = "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci";
    connection.query(sql1, function (err, result) {
    });
}
handleDisconnect();

////////////////////////////////////////////////////


