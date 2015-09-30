var express = require('express');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var app = express();
var basic = require(__dirname+'/routes/basic');
var news = require('./routes/news');
var playlist = require('./routes/playlist');
/////////////////////////server connection///////////////////
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})

app.use(urlencodedParser);
app.post('/sign_up', basic.sign_up);
app.post('/sign_in', basic.sign_in);
app.use('/edit_profile', multipartMiddleware);
app.post('/edit_profile', basic.edit_profile);
app.post('/change_password', basic.change_password);
app.post('/forgot_password', basic.forgot_password);
app.post('/logout', basic.logout);
app.post('/delete_account', basic.delete_account);
///////////////////////////////////////////////
app.use('/create_news', multipartMiddleware);
app.post('/create_news', news.create_news);
app.post('/delete_news', news.delete_news);
app.post('/vote_news', news.vote_news);
app.post('/play_news', news.play_news);
app.post('/news_feed', news.news_feed);
/////////////////////////////////////////////////

app.post('/create_playlist', playlist.create_playlist);
app.post('/view_all_playlist', playlist.view_all_playlist);
app.post('/view_playlist_by_id', playlist.view_playlist_by_id);
app.post('/delete_playlist', playlist.delete_playlist);