var http = require('http');
var func = require('./db_connection');
//var common = require('./commonfunction');
var hostname = 'http://52.88.43.163/radiyo/routes/uploads/news/';
exports.create_playlist = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var playlist_name 	= 	req.body.playlist_name;
	var news_id 		= 	req.body.news_id;
	var playlist_id 	= 	req.body.playlist_id;
	var user_info_query = "SELECT id,username,access_token,password FROM users where access_token= ?";
	connection.query(user_info_query,[access_token], function (err, user_info) {
		if (err) {
			error.push("Something wrong")
			var response = {
				"error": error
			};
			res.type('json');
			res.jsonp(response);
		}else{
			var typeLength = user_info.length;
			if(typeLength >0){
				var playlist_name_query = "SELECT id from `playlist` where playlist_name = ?";
				if(playlist_id !=''){
					playlist_name_query += " and id !=" +playlist_id
				}
				connection.query(playlist_name_query,[playlist_name], function (err, playlist_name_info) {
					if (err) {
						console.log(err);
						error.push("Something wrong...")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var playlistLength = playlist_name_info.length;
						if(playlistLength ==0){
							if(playlist_id ==''){
								var created 			= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
								var playlist_query = "Insert into `playlist` (`user_id`,`playlist_name`,`news_id`,`created`) values (?,?,?,?)";
								connection.query(playlist_query,[user_info[0].id,playlist_name,news_id,created], function (err, result) {
									if (err) {
										error.push("Something wrong..")
										var response = {
											"error": error
										};
										res.type('json');
										res.jsonp(response);
									}else{						
										var value = {
											"playlist_id": result.insertId,
											"playlist_name" : playlist_name
										};
										var response = {
											"response": value
										};
										res.type('json');
										res.jsonp(response);
									}
								})
							}else{
								var delete_playlist_query = "Update `playlist` set `playlist_name` =? ,`news_id` =? where id =?";
								connection.query(delete_playlist_query,[playlist_name,news_id,playlist_id], function (err, result) {
									if (err) {
										error.push("Something wrong..")
										var response = {
											"error": error
										};
										res.type('json');
										res.jsonp(response);
									}else{						
										var value = {
											"playlist_id": playlist_id,
											"playlist_name" : playlist_name
										};
										var response = {
											"response": value
										};
										res.type('json');
										res.jsonp(response);
									}
								})					
							}
						}else{
							error.push("Playlist name already exist")
							var response = {
								"error": error
							};
							res.type('json');
							res.jsonp(response);
						}
					}
				});
			}else{
				error.push("Access token is invalid")
				var response = {
					"error": error
				};
				res.type('json');
				res.jsonp(response);
			}
		}
	});
}


///////////////////////////////////////////////////////////////////////////////////
exports.view_all_playlist = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var user_info_query = "SELECT id,username,access_token,password FROM users where access_token= ?";
	connection.query(user_info_query,[access_token], function (err, user_info) {
		if (err) {
			error.push("Something wrong")
			var response = {
				"error": error
			};
			res.type('json');
			res.jsonp(response);
		}else{
			var typeLength = user_info.length;
			if(typeLength >0){
				var playlist_query = "SELECT playlist_name,id as playlist_id FROM `playlist` where user_id = ?";
				connection.query(playlist_query,[user_info[0].id], function (err, playlist_info) {
					if (err) {
						console.log(err);
						error.push("Something wrong...")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var response = {
							"response": playlist_info
						};
						res.type('json');
						res.jsonp(response);
					}
				});
			}else{
				error.push("Access token is invalid")
				var response = {
					"error": error
				};
				res.type('json');
				res.jsonp(response);
			}
		}
	});
}

///////////////////////////////////////////////////////////////////////
exports.view_playlist_by_id = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var playlist_id 	= 	req.body.playlist_id;
	var user_info_query = "SELECT users.id,playlist.news_id FROM users  JOIN `playlist` on users.id = playlist .user_id where users.access_token= ? and playlist.id=?";
	connection.query(user_info_query,[access_token,playlist_id], function (err, user_info) {
		if (err) {
			error.push("Something wrong")
			var response = {
				"error": error
			};
			res.type('json');
			res.jsonp(response);
		}else{
			var typeLength = user_info.length;
			if(typeLength >0){
				var news_id		=	user_info[0].news_id
				var arr =news_id.split(",")
				var playlist_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username FROM `news` JOIN `users` on news.user_id = `users`.id where news.id IN(?)";
				connection.query(playlist_query,[arr], function (err, news_info) {
					if (err) {
						console.log(err);
						error.push("Something wrong...")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var newsinfoLength = news_info.length;
						newsArray = [];
						for(i=0; i<newsinfoLength;i++){
							/*vote_count_function(news_info[i].id, function(data){
								console.log("result from db is : ",data); 
							});*/
							newsArray.push({
								'news_id':news_info[i].id,
								'user_id':news_info[i].user_id,
								'headline':news_info[i].headline,
								'news':hostname+news_info[i].news,
								'length':news_info[i].length,
								'play_count':0,
								'vote_count':0,
								'vote_status':0,
								'username':news_info[i].username
								
							});
						}
						var response = {
							"response": newsArray
						};
						res.type('json');
						res.jsonp(response);
					}
				});
			}else{
				error.push("Access token is invalid")
				var response = {
					"error": error
				};
				res.type('json');
				res.jsonp(response);
			}
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
exports.delete_playlist = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var playlist_id 	= 	req.body.playlist_id;
	var user_info_query = "SELECT users.id,playlist.id FROM users  JOIN `playlist` on users.id = playlist .user_id where users.access_token= ? and playlist.id=?";
	connection.query(user_info_query,[access_token,playlist_id], function (err, user_info) {
		if (err) {
			error.push("Something wrong")
			var response = {
				"error": error
			};
			res.type('json');
			res.jsonp(response);
		}else{
			var typeLength = user_info.length;
			if(typeLength >0){
				var delete_playlist_query = "Delete from `playlist` where id =?";
				connection.query(delete_playlist_query,[playlist_id], function (err, delete_info) {
					if (err) {
						console.log(err);
						error.push("Something wrong...")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var response = {
							"response": "Playlist delete successfully"
						};
						res.type('json');
						res.jsonp(response);
					}
				});
			}else{
				error.push("Access token is invalid")
				var response = {
					"error": error
				};
				res.type('json');
				res.jsonp(response);
			}
		}
	});	
}