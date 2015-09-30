var url = require('url');
var http = require('http');
var md5 = require('md5');
var func = require('./db_connection');
var fs = require('fs');
var hostname = 'http://52.88.43.163/radiyo/routes/uploads/profile_pic/';
////////////////////////////sign up ///////////////////////////////////////////////
exports.sign_up = function (req, res) {
	error = [];
	if(req.body.username != ''){
		var username 	= 	req.body.username;
	}else{
		error.push("Name is required")
	}
	if(req.body.password != ''){
		var password 	= 	md5(req.body.password);
	}else{
		error.push("Password is required.")
	}
	if(req.body.user_type != ''){
		var user_type 	= 	req.body.user_type;
	}else{
		error.push("User type is required.")
	}
	if(req.body.email != ''){
		var email 		= 	req.body.email;
	}else{
		error.push("Email is required.")
	}
	if(req.body.device_id !=''){
		var device_id	=	req.body.device_id;
	}else{
		var device_id	=	'123';
	}
	if(req.body.lattitude !=''){
		var lattitude 	= 	req.body.lattitude;
	}else{
		var lattitude 	=	'';
	}
	if(req.body.longitude !=''){
		var longitude 	= 	req.body.longitude;
	}else{
		var longitude 	=	'';
	}
	if(req.body.platform_status !=''){
		var platform_status 	= 	req.body.platform_status;
	}else{
		error.push("Platform status is required.")
	}
	var errorLength = error.length;
	if(errorLength == 0){
		var user_info_query = "SELECT id FROM users where email = ? and user_type= ? and delete_account=0";
		connection.query(user_info_query,[email,user_type], function (err, user_info) {
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
					error.push("Email already exist.")
					var response = {
						"error": error
					};
					res.type('json');
					res.jsonp(response);
				}else{
					var created 			= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
					var access_token 	= md5(created);
					var sql = 'INSERT INTO `users`(`username`,`password`,email,user_type,longitude,lattitude,access_token,created) VALUES (?,?,?,?,?,?,?,?)';
					connection.query(sql, [username, password,email,user_type,longitude,lattitude,access_token,created], function (err, result) {
						if (err) {
							var response = {
								"error": 'User not registered'
							};
							res.type('json');
							res.jsonp(response);
						}
						else {
							updatedeviceid(result.insertId,device_id,access_token,platform_status);
							var value = {
								"username": username,
								'user_access_token':access_token,
								'user_id':result.insertId,
								'user_type':user_type,
								'profile_pic':""
							};
							var response = {
								"response": value
							};
							res.type('json');
							res.jsonp(response);
						}
					});
				}
			}
        });
		
	}else{
		var response = {
			"error": error
		};
		res.type('json');
		res.jsonp(response);
	}
}

//////////////////////////////////////sign in///////////////////////////////////////////
exports.sign_in = function (req, res) {
	error = [];
	if(req.body.username != ''){
		var username 	= 	req.body.username;
	}else{
		var username 	= 	'';
	}
	if(req.body.password != ''){
		var password 	= 	md5(req.body.password);
	}else{
		var password 	=	'';
	}
	if(req.body.email != ''){
		var email 		= 	req.body.email;
	}else{
		var email		=	'';
	}
	if(req.body.user_type != ''){
		var user_type 	= 	req.body.user_type;
	}else{
		error.push("User type is required.")
	}
	if(req.body.device_id !=''){
		var device_id	=	req.body.device_id;
	}else{
		var device_id	=	'123';
	}
	if(req.body.profile_pic !=''){
		var profile_pic 	= 	req.body.profile_pic;
	}else{
		var profile_pic 	=	'';
	}
	if(req.body.lattitude !=''){
		var lattitude 	= 	req.body.lattitude;
	}else{
		var lattitude 	=	'';
	}
	if(req.body.longitude !=''){
		var longitude 	= 	req.body.longitude;
	}else{
		var longitude 	=	'';
	}
	if(req.body.facebook_id !=''){
		var facebook_id 	= 	req.body.facebook_id;
	}else{
		var facebook_id 	=	'';
	}
	if(req.body.platform_status !=''){
		var platform_status 	= 	req.body.platform_status;
	}else{
		error.push("Platform status is required.")
	}
	var errorLength = error.length;
	if(errorLength == 0){
		 
		if(user_type ==1){
			var user_info_query = "SELECT id,username,access_token,profile_pic FROM users where user_type= ? and delete_account=0 and (email = ? OR facebook_id = ?)";
			connection.query(user_info_query,[user_type,email,facebook_id], function (err, user_info) {
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
						updatedeviceid(user_info[0].id,device_id,user_info[0].access_token,platform_status);
						var user_update_query = "Update `users` SET `longitude`=? ,`lattitude`=? WHERE `id`=?";
						connection.query(user_update_query,[longitude,lattitude,user_info[0].id], function (err, device_info) {
							if (err) {
								error.push("Something wrong")
								var response = {
									"error": error
								};
								res.type('json');
								res.jsonp(response);
							}
						})
						//console.log(user_info[0].profile_pic);
						var value = {
							"username": user_info[0].username,
							'user_access_token':user_info[0].access_token,
							'user_id':user_info[0].id,
							'user_type':user_type,
							'profile_pic':hostname +user_info[0].profile_pic
						};
						var response = {
							"response": value
						};
						res.type('json');
						res.jsonp(response);						
					}else{
						var request = require('request');
						var created 			= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
						var access_token 	= md5(created);
						var new_file		=	md5(created)+'.png';
						var file = __dirname + "/uploads/profile_pic/" +  new_file;
						request(profile_pic).pipe(fs.createWriteStream(file));
						var sql = 'INSERT INTO `users`(`username`,`password`,email,user_type,longitude,lattitude,access_token,created,facebook_id,profile_pic) VALUES (?,?,?,?,?,?,?,?,?,?)';
						connection.query(sql, [username, password,email,user_type,longitude,lattitude,access_token,created,facebook_id,new_file], function (err, result) {
							if (err) {
								var response = {
									"error": 'User not registered'
								};
								res.type('json');
								res.jsonp(response);
							}
							else {
								updatedeviceid(result.insertId,device_id,access_token,platform_status);
								var value = {
									"username": username,
									'user_access_token':access_token,
									'user_id':result.insertId,
									'user_type':user_type,
									'profile_pic':hostname +new_file
								};
								var response = {
									"response": value
								};
								res.type('json');
								res.jsonp(response);
							}
						});
					}
				}
			});
		}else if(user_type == 2){
			//console.log(password)
			var user_info_query = "SELECT id,username,access_token,profile_pic FROM users where user_type= ? and email = ? and password = ? and delete_account=0";
			connection.query(user_info_query,[user_type,email,password], function (err, user_info) {
				if (err) {
					error.push("Something wrong")
					var response = {
						"error": error
					};
					res.type('json');
					res.jsonp(response);
				}else{
					var typeLength = user_info.length;
					//console.log(longitude,lattitude)
					if(typeLength >0){
						updatedeviceid(user_info[0].id,device_id,user_info[0].access_token,platform_status);
						//console.log("UPDATE `users` SET `longitude`='22222' and `lattitude`='22222' WHERE `id`=2");
						var user_update_query = "UPDATE `users` SET `longitude`=? ,`lattitude`=? WHERE `id`=? ";
						connection.query(user_update_query,[longitude,lattitude,user_info[0].id], function (err, result) {
							if (err) {
								error.push("Something wrong")
								var response = {
									"error": error
								};
								res.type('json');
								res.jsonp(response);
							}else{
								if(user_info[0].profile_pic !=''){
									user_profile_pic		=	hostname +user_info[0].profile_pic
								}else{
									user_profile_pic		=	'';
								}
								var value = {
									"username": user_info[0].username,
									'user_access_token':user_info[0].access_token,
									'user_id':user_info[0].id,
									'user_type':user_type,
									'profile_pic':user_profile_pic
								};
								var response = {
									"response": value
								};
								//console.log(response)
								res.type('json');
								res.jsonp(response);
							}
						})
						
					}else{
						error.push("Invalid email or password")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}
				}
			});
		}else{
			var created 		= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 
			var access_token 	= md5(created);
			var sql = 'INSERT INTO `users`(user_type,longitude,lattitude,access_token,created) VALUES (?,?,?,?,?)';
			connection.query(sql, [user_type,longitude,lattitude,access_token,created], function (err, result) {
				if (err) {
					var response = {
						"error": 'User not registered'
					};
					res.type('json');
					res.jsonp(response);
				}
				else {
					updatedeviceid(result.insertId,device_id,access_token,platform_status);
					var value = {
						"username": username,
						'user_access_token':access_token,
						'user_id':result.insertId,
						'user_type':user_type,
						'profile_pic':""
					};
					var response = {
						"response": value
					};
					res.type('json');
					res.jsonp(response);
				}
			});
		}
	}else{
		var response = {
			"error": error
		};
		res.type('json');
		res.jsonp(response);
	}
}

///////////////////////////////////edit profile/////////////////////////////////////

exports.edit_profile = function (req, res) {
	error = [];
	if(req.body.username != ''){
		var username 	= 	req.body.username;
	}else{
		error.push("Username is required.")
	}
	if(req.body.profile_pic != ''){
		var profile_pic 	= 	req.body.profile_pic;
	}else{
		var profile_pic 	= 	'';
	}
	if(req.body.access_token != ''){
		var access_token 	= 	req.body.access_token;
	}else{
		error.push("Access token is required.")
	}
	var errorLength = error.length;
	if(errorLength == 0){
		var user_info_query = "SELECT id,username,access_token,profile_pic,user_type FROM users where access_token= ?";
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
					/*if(req.files.profile_pic.originalFilename !=''){*/
					if(profile_pic.indexOf('http:') == -1){
						var created 			= new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
						var new_file		=	md5(created)+'.png';
						var file = __dirname + "/uploads/profile_pic/" +  new_file;
						/*fs.readFile( req.files.profile_pic.path, function (err, data) {
							fs.writeFile(file, data, function (err) {
								if( err ){
									error.push("Something wrong")
									var response = {
										"error": error
									};
									res.type('json');
									res.jsonp(response);
								}else{
									var path = __dirname + "/uploads/profile_pic/" +  user_info[0].profile_pic;		
									//console.log(path)
									fs.exists(path, function(exists) {
										if (exists) {
											fs.unlink(path);
										}
									});
									var profile_update_query = "UPDATE `users` SET `username`=? ,`profile_pic`=? WHERE `id`=? ";
									connection.query(profile_update_query,[username,new_file,user_info[0].id], function (err, result) {
										if (err) {
											error.push("Something wrong")
											var response = {
												"error": error
											};
											res.type('json');
											res.jsonp(response);
										}else{
											var response = {
												"response": "Profile edited successfully"
											};
											res.type('json');
											res.jsonp(response);
										}
									})
								}
							});
						});*/
						fs.writeFile(file, profile_pic,'base64', function (err) {
							if( err ){
								error.push("Something wrong")
								var response = {
									"error": error
								};
								res.type('json');
								res.jsonp(response);
							}else{
								var path = __dirname + "/uploads/profile_pic/" +  user_info[0].profile_pic;	
								fs.exists(path, function(exists) {
									if (exists) {
										fs.unlink(path);
									}
								});
								var profile_update_query = "UPDATE `users` SET `username`=? ,`profile_pic`=? WHERE `id`=? ";
								connection.query(profile_update_query,[username,new_file,user_info[0].id], function (err, result) {
									if (err) {
										error.push("Something wrong")
										var response = {
											"error": error
										};
										res.type('json');
										res.jsonp(response);
									}else{
										var value = {
											"username": username,
											'user_access_token':access_token,
											'user_id':user_info[0].id,
											'user_type':user_info[0].user_type,
											'profile_pic':hostname +new_file
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
					}else{
						var profile_update_query = "UPDATE `users` SET `username`=?  WHERE `id`=? ";
						connection.query(profile_update_query,[username,user_info[0].id], function (err, result) {
							if (err) {
								error.push("Something wrong")
								var response = {
									"error": error
								};
								res.type('json');
								res.jsonp(response);
							}else{
								if(user_info[0].profile_pic !=''){
									user_profile_pic		=	hostname +user_info[0].profile_pic
								}else{
									user_profile_pic		=	'';
								}
								var value = {
									"username": username,
									'user_access_token':access_token,
									'user_id':user_info[0].id,
									'user_type':user_info[0].user_type,
									'profile_pic':user_profile_pic
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
					error.push("Access token is invalid")
					var response = {
						"error": error
					};
					res.type('json');
					res.jsonp(response);
				}
			}
		});
	}else{
		var response = {
			"error": error
		};
		res.type('json');
		res.jsonp(response);
	}
}

//////////////////////////////////////update device id////////////////////////////////


function updatedeviceid(user_id,device_id,access_token,platform_status){
	var device_query = "SELECT id FROM user_device_id where device_id= ? ";
	connection.query(device_query,[device_id], function (err, device_info) {
		if (err) {
			error.push("Something wrong")
			var response = {
				"error": error
			};
			res.type('json');
			res.jsonp(response);
		}else{
			var deviceinfoLength = device_info.length;
			if(deviceinfoLength == 0){
				var device_query = "INSERT INTO `user_device_id`(`user_id`,`device_id`,user_access_token,platform_status) VALUES (?,?,?,?)";
				connection.query(device_query,[user_id,device_id,access_token,platform_status], function (err, device_info) {
					if (err) {
						error.push("Something wrong")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
				}
				})
			}else{
				var device_query = "Update `user_device_id` SET `user_id` =?,`device_id`=?,user_access_token=?,platform_status =? WHERE `device_id`=?";
				connection.query(device_query,[user_id,device_id,access_token,platform_status,device_id], function (err, device_info) {
					if (err) {
						error.push("Something wrong")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}
				})
			}
			return 1;
		}
	});
}
///////////////////////////////////change password/////////////////////////////////////

exports.change_password = function (req, res) {
	error = [];
	if(req.body.old_password != ''){
		var old_password 	= 	md5(req.body.old_password);
	}else{
		error.push("Old password is required.")
	}
	if(req.body.new_password != ''){
		var new_password 	= 	md5(req.body.new_password);
	}else{
		error.push("New password is required.")
	}
	if(req.body.access_token != ''){
		var access_token 	= 	req.body.access_token;
	}else{
		error.push("Access token is required.")
	}
	var errorLength = error.length;
	if(errorLength == 0){
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
					if(user_info[0].password != old_password){
						error.push("Old password is invalid")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var password_query = "Update `users` SET `password` =? WHERE `id`=?";
						connection.query(password_query,[new_password,user_info[0].id], function (err, device_info) {
							if (err) {
								error.push("Something wrong")
								var response = {
									"error": error
								};
								res.type('json');
								res.jsonp(response);
							}else{
								var response = {
									"response": "Password change successfully"
								};
								res.type('json');
								res.jsonp(response);
							}
						})
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
	}else{
		var response = {
			"error": error
		};
		res.type('json');
		res.jsonp(response);
	}
}

///////////////////////////////////forgot password/////////////////////////////////////

exports.forgot_password = function (req, res) {
	var nodemailer = require('nodemailer');
	error = [];
	if(req.body.email != ''){
		var email 	= 	req.body.email;
	}else{
		error.push("Email is required.")
	}
	var errorLength = error.length;
	if(errorLength == 0){
		var user_info_query = "SELECT id,username,access_token,password FROM users where user_type= 2 and email= ?";
		connection.query(user_info_query,[email], function (err, user_info) {
			if (err) {
				error.push("Something wrong")
				var response = {
					"error": error
				};
				res.type('json');
				res.jsonp(response);
			}else{
				var typeLength = user_info.length;
				var min = 10000000;
				var max = 99999999;
				var code = Math.floor(Math.random() * (max - min + 1)) + min;
				//var code =12345678
				var code1 = ""+code+"";
				var new_code			= md5(code1)
				//console.log(new_code)
				//console.log(code1)
				if(typeLength >0){
					/////////////////////////send email/////////////////////////// 
					var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'akankshaagrawal@applify.co', 
						pass: '20121990@aka' 
					}
					});					
					var mailOptions = {
						from: 'Radiyoo',
						to: email,
						subject: 'New password of radiyoo',
						text: 'Your new password is ' + code,
						html: '<b>Your new password is ' + code +'</b>'
					};
					// send mail with defined transport object
					smtpTransport.sendMail(mailOptions, function(error, info) {
						if (error) {
							//console.log(error);
							var response = {
								"error": "Error occur in sending email"
							};
							res.type('json');
							res.jsonp(response);
						} else {
							var password_query = "Update `users` SET `password` =? WHERE `id`=?";
							connection.query(password_query,[new_code,user_info[0].id], function (err, device_info) {
								if (err) {
									error.push("Something wrong")
									var response = {
										"error": error
									};
									res.type('json');
									res.jsonp(response);
								}else{
									var response = {
										"response": "Password mail successfully"
									};
									res.type('json');
									res.jsonp(response);
								}
							})
						}
					});

				}else{
					error.push("Email is invalid")
					var response = {
						"error": error
					};
					res.type('json');
					res.jsonp(response);
				}
			}
		});
	}else{
		var response = {
			"error": error
		};
		res.type('json');
		res.jsonp(response);
	}
}

/////////////////////////////////////////////Logout//////////////////////////////
exports.logout = function (req, res) {
	var nodemailer = require('nodemailer');
	error = [];
	if(req.body.access_token != ''){
		var access_token 	= 	req.body.access_token;
	}else{
		error.push("Access token is required.")
	}
	if(req.body.device_id != ''){
		var device_id 	= 	req.body.device_id;
	}else{
		error.push("Device id is required.")
	}
	var errorLength = error.length;
	if(errorLength == 0){
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
					var user_query = "Delete FROM user_device_id where device_id= ?";
					connection.query(user_query,[device_id], function (err, result) {
						if (err) {
							error.push("Something wrong")
							var response = {
								"error": error
							};
							res.type('json');
							res.jsonp(response);
						}else{
							var response = {
								"response": "Logout successfully"
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
	}else{
		var response = {
			"error": error
		};
		res.type('json');
		res.jsonp(response);
	}
}
//////////////////////////////////////////////////////////////////////////////

exports.delete_account= function (req, res) {
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
				var user_delete_query = "Update `users` SET `delete_account` =1 WHERE `id`=?";
				connection.query(user_delete_query,[user_info[0].id], function (err, result) {
					if (err) {
						error.push("Something wrong")
						var response = {
							"error": error
						};
						res.type('json');
						res.jsonp(response);
					}else{
						var response = {
							"response": "User delete successfully"
						};
						res.type('json');
						res.jsonp(response);
					}
				})
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