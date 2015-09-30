var url = require('url');
var http = require('http');
var func = require('./db_connection');
var fs = require('fs');
var md5 = require('md5');
var hostname = 'http://52.88.43.163/radiyo/routes/uploads/news/';
////////////////////////////////////////////////////////////////////////////
exports.create_news = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var headline 		= 	req.body.headline;
	var category 		= 	req.body.category;
	var language 		= 	req.body.language;
	var length 			= 	req.body.length;
	var longitude 		= 	req.body.longitude;
	var lattitude 		= 	req.body.lattitude;
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
			console.log(typeLength);
			if(typeLength >0){
				//console.log(req.files.news.name);
				if(req.files.news.originalFilename !=''){
						var created 			= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
						var file_name1	=	(req.files.news.name).replace(/["~!@#$%^&*\(\)_+=`{}\[\]\|\\:;'<>,\/?"\- \t\r\n]+/g, '_');
						file_name2	=	file_name1.split('.');
						file_name2[1]	=	file_name2[file_name2.length-1]; 
						
						var new_file		=	md5(created)+'.' +file_name2[1];
						var file = __dirname + "/uploads/news/" +  new_file;
						fs.readFile(req.files.news.path, function (err, data) {
							fs.writeFile(file, data, function (err) {
								if( err ){
									error.push("Something wrong...")
									var response = {
										"error": error
									};
									res.type('json');
									res.jsonp(response);
								}else{
									var news_query = "Insert into `news` (`user_id`,`headline`,`news`,`category`,`language`,`length`,`longitude`,`lattitude`,`created`) values (?,?,?,?,?,?,?,?,?)";
									connection.query(news_query,[user_info[0].id,headline,new_file,category,language,length,longitude,lattitude,created], function (err, result) {
										if (err) {
											error.push("Something wrong")
											var response = {
												"error": error
											};
											res.type('json');
											res.jsonp(response);
										}else{
											//var hostname = 'http://' +req.connection.remoteAddress+ '/radiyo/routes/uploads/news/'; 
											var value = {
												"news_id": result.insertId,
												"length" : length,
												"headline" : headline,
												"vote_count":0,
												"play_count":0,
												"news": hostname +new_file,
												"user_id":user_info[0].id,
												"vote_status":0,
												"username":user_info[0].username
											};
											var response = {
												"response": value
											};
											res.type('json');
											res.jsonp(response);
										}
									})
								}
							});
						});
					}
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
///////////////////////////////////////////////////////////////////////////////////////
exports.delete_news = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var news_id 		= 	req.body.news_id;
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
				var news_query = "SELECT news FROM news where id= ?";
				connection.query(news_query,[news_id], function (err, news_info) {
					if (err) {
						error.push("Something wrong")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var path = __dirname + "/uploads/news/" +  news_info[0].news;
						//console.log(path);
						fs.exists(path, function(exists) {
							if (exists) {
								fs.unlink(path);
							}
						});
						var news__delete_query = "Delete FROM news where id= ?";
						connection.query(news__delete_query,[news_id], function (err, result) {
							if (err) {
								error.push("Something wrong")
								var response = {
									"error": error
								};
								res.type('json');
								res.jsonp(response);
							}else{
								var response = {
									"response": "News deleted successfully"
								};
								res.type('json');
								res.jsonp(response);
							}
						});
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

///////////////////////////////////////////////////////////////////////////////////////
exports.vote_news = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var news_id 		= 	req.body.news_id;
	var status 			= 	req.body.status;
	var created 		= 	new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
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
				var vote_info_query = "SELECT id FROM vote_news where user_id= ? and news_id =?";
				connection.query(vote_info_query,[user_info[0].id,news_id], function (err, vote_info) {
					if (err) {
						error.push("Something wrong")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var voteLength = vote_info.length;
						console.log(voteLength)
						if(voteLength ==0){
							var news_query = "Insert into `vote_news`(`user_id`,`news_id`,`status`,`created`) values(?,?,?,?)";
							connection.query(news_query,[user_info[0].id,news_id,status,created], function (err, news_info) {
								if (err) {
									error.push("Something wrong....")
									var response = {
										"error": error
									};
									res.type('json');
									res.jsonp(response);
								}else{
									var response = {
										"response": "Voted successfully"
									};
									res.type('json');
									res.jsonp(response);
								}
							});
						}else{
							var news_query = "Update `vote_news` set status = ? where user_id =? and news_id =?";
							connection.query(news_query,[status,user_info[0].id,news_id], function (err, news_info) {
								if (err) {
									error.push("Something wrong....")
									var response = {
										"error": error
									};
									res.type('json');
									res.jsonp(response);
								}else{
									var response = {
										"response": "Voted successfully"
									};
									res.type('json');
									res.jsonp(response);
								}
							});
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
///////////////////////////////////////////////////////////////////////////////////////
exports.play_news = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var news_id 		= 	req.body.news_id;
	var created 		= 	new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
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
				var news_query = "Insert into `play_news`(`user_id`,`news_id`,`created`) values(?,?,?)";
				connection.query(news_query,[user_info[0].id,news_id,created], function (err, news_info) {
					if (err) {
						error.push("Something wrong....")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var response = {
							"response": "Play successfully"
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
////////////////////////////////////////////////////////////////////////////
exports.news_feed = function (req, res) {
	error = [];
	var access_token 	= 	req.body.access_token;
	var category 		= 	req.body.category;
	var language 		= 	req.body.language;
	var offset 			= 	req.body.offset;
	var status 			= 	req.body.status;
	
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
				var index = (offset*10)-10;
				if(status ==1){
					//var news_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username FROM `news` JOIN `users` on news.user_id = `users`.id where language =? and category =? LIMIT ?,10";
					var news_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username FROM `news` JOIN `users` on news.user_id = `users`.id ";
					if(language !='' && category !=''){
						news_query+="where language = '"+language +"' and category ='"+ category +"'";
					}else if(category !='' && language ==''){
						news_query+="where category ='"+category +"'";
					}else if(category =='' && language !=''){
						news_query+="where language ='"+language +"'";
					}
					news_query+=" LIMIT ?,10";
				}else if(status ==2){
					//var news_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username FROM `news` JOIN `users` on news.user_id = `users`.id where language =? and category =? ORDER BY `news`.created DESC LIMIT ?,10";
					var news_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username FROM `news` JOIN `users` on news.user_id = `users`.id ";
					if(language !='' && category !=''){
						news_query+="where language = '"+language +"' and category ='"+ category +"'";
					}else if(category !='' && language ==''){
						news_query+="where category ='"+category +"'";
					}else if(category =='' && language !=''){
						news_query+="where language ='"+language +"'";
					}
					news_query+=" ORDER BY `news`.created DESC LIMIT ?,10";
				}else if(status ==3){
					//var news_query = "SELECT `news`.id,`news`.lattitude,`news`.user_id,`news`.headline,`news`.news,`news`.length,users.username,3956 * 2 * ASIN(SQRT( POWER(SIN((30.733315 - `news`.lattitude) * pi()/180 / 2), 2) + COS(30.733315 * pi()/180) * COS(news.lattitude * pi()/180) *POWER(SIN((76.7327801 - `news`.longitude) * pi()/180 / 2), 2) )) as distance FROM `news` JOIN `users` on news.user_id = `users`.id where language =? and category =? ORDER by distance asc";
					var news_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username ,3956 * 2 * ASIN(SQRT( POWER(SIN((30.733315 - `news`.lattitude) * pi()/180 / 2), 2) + COS(30.733315 * pi()/180) * COS(news.lattitude * pi()/180) *POWER(SIN((76.7327801 - `news`.longitude) * pi()/180 / 2), 2) )) as distance FROM `news` JOIN `users` on news.user_id = `users`.id ";
					if(language !='' && category !=''){
						news_query+="where language = '"+language +"' and category ='"+ category +"'";
					}else if(category !='' && language ==''){
						news_query+="where category ='"+category +"'";
					}else if(category =='' && language !=''){
						news_query+="where language ='"+language +"'";
					}
					news_query+=" ORDER BY distance ASC LIMIT ?,10";
				}else{
					var news_query = "SELECT `news`.id,`news`.headline,`news`.user_id,`news`.news,`news`.length,users.username FROM `news` JOIN `users` on news.user_id = `users`.id  ORDER BY `news`.created DESC LIMIT ?,10";
				}
				connection.query(news_query,[index], function (err, news_info) {
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