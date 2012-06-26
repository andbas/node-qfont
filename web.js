var express = require('express'),
    app = express.createServer(express.logger()),
    format = require('util').format,
    fs = require('fs'),
    dropbox  = require("dbox").app({"app_key": process.env['dbox_app_key'], "app_secret": process.env['dbox_app_secret'] }),
    client = dropbox.createClient({oauth_token_secret: process.env['dbox_oauth_token_secret'], oauth_token: process.env['dbox_oauth_token'], uid: process.env['dbox_uid']});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.bodyParser());
app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res) {
  res.render('pindex', {
    title: 'qfont - check your font quick'
  });
});

app.get('/demos/:name', function(req, res) {
  var name = req.params.name;
  res.render('font-face', {
    font: name
  });
});

app.post('/fonts/add', function (req, res, next) {

  var fileName = req.files['file-input'].name,
      filePath = req.files['file-input'].path;

  console.log('controller (POST): /fonts/add');
  console.log('fileName='+fileName);
  console.log('filePath='+filePath);

  var inp = fs.createReadStream(filePath);

  fs.readFile(filePath, function (err, data) {
    if (err) throw err;
    client.put(fileName, data, function(status, reply){
      console.log(fileName+' have been saved');
      res.redirect('/demos/'+fileName);
    });
  });
});

app.get('/fonts/:name', function(req, res){
  var name = req.params.name;
  client.get(name,function(status, reply, metadata){
    res.send(reply);
  });
});


var port = process.env['app_port'] || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});