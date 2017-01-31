var compression = require('compression');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var app = express();
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if(env === 'development'){
	mongoose.connect('mongodb://127.0.0.1:27017/test');

}else {
	mongoose.connect('mongodb://Anuarbek:14nur97@ds137759.mlab.com:37759/clocklp');

}
// Middlewares

//Compress our responses
app.use(cors());
app.use(compression());

app.set('port', process.env.PORT || 3000);
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 846000 }));
app.use(session({ secret: 'your secret here',
	resave:  true,
	saveUninitialized: true,
	key: 'some key',
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




app.post('http://clocklp2.herokuapp.com/endpoint',function (req,res) {
	var transport = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'anuarbekzakirianov97@gmail.com',
			pass: 'a********'
		}
	});

	var mailOptions = {
		from: 'anuarbekzakirianov97@gmail.com', // sender address
		to: 'anuarbekzakirianov97@gmail.com', // list of receivers
		subject: 'Часы', // Subject line
		text: "Пришел заказ на часы от " + req.body.name + ". Номер " + req.body.phone
	};

	transport.sendMail(mailOptions, function (error) {
		if (error) {
			console.log('Error occured');
			console.log(error.message);
			return;
		}
		res.send({"success": "success"});
	});
});

// Start server

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
