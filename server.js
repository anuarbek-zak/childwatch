var compression = require('compression');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var app = express();
// Middlewares

//Compress our responses
app.use(cors());
app.use(compression());

app.set('port', process.env.PORT || 8000);
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 846000 }));

app.use(logger('dev'));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/endpoint',function (req,res) {
	var transport = nodemailer.createTransport(smtpTransport({
		service: 'gmail',
		auth: {
			user: 'watchbabykz@gmail.com',
			pass: 'watchbabykzsdu'
		}
	}));

	var mailOptions = {
		from: 'watchbabykz@gmail.com', // sender address
		to: 'watchbaby111@gmail.com', // list of receivers
		subject: 'Часы', // Subject line
		text: "Пришел заказ на часы "+req.body.currentClock+" от " + req.body.name + ". Номер " + req.body.phone
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
