//app deps
const exec = require('child_process').exec;
const five = require('johnny-five');
const chipio = require('chip-io');

// Alexa intent to IR code mapping file stored in a YAML file. 
// Support for hexadecimals on JSON files sucks
const YAML = require('yamljs');
var irmap;

// Helpers to execute shell comands
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
}

function shutDownChip () {
	execute('sudo shutdown -h now', function(callback){
		console.log('shutting down...');
	});
};

// Initialize jonny-five
var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
	this.i2cConfig({address: 0x08});

	// Creates an button on the XIO-P1 pin
	var button = new five.Button('XIO-P1');

	// add event listeners for 'up' events
	button.on('press', function() {
		console.log('button pressed');
		shutDownChip();
	});
});


// Connect to AWS IoT
var awsIot = require('aws-iot-device-sdk');

var device = awsIot.device({
   keyPath: 'ircontrol.private.key',
  certPath: 'ircontrol.cert.pem',
    caPath: 'root-CA.crt',
  clientId: 'chip',
    host: 'auvnln1bqccz9.iot.us-east-1.amazonaws.com' 
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
  .on('connect', function() {
	irmap = YAML.load('intent2ircode.yaml');  // loads intent -> IR code mapping table 
    console.log('connect');
    device.subscribe('command');
//    device.publish('command', JSON.stringify({ command: 'TV_MUTE'}));
    });

device
  .on('message', function(topic, payload) {
	  
    console.log('message', topic, payload.toString());

	var command  = JSON.parse(payload).command;
	var response = "Sorry, I can't recognize the command...";  
	var code = 0;
	var i = 0;
	
	console.log('command', command);
	
	if (command == 'CHIP_OFF') { 
		// Shuts C.H.I.P. down
		shutDownChip();
		response = 'OK!';
	}
	else {
		// Otherwise, look for code
		for (i=0; i<irmap.length; i++) {
			if (irmap[i].intent == command) {
				code = parseInt(irmap[i].code); // not really sure parseInt is required
				break;
			}
		}
		if (code > 0){
			board.i2cWrite(0x08, (code >> 24) & 0xFF);
			board.i2cWrite(0x08, (code >> 16) & 0xFF);
			board.i2cWrite(0x08, (code >> 8) & 0xFF);
			board.i2cWrite(0x08, code & 0xFF);

			response = 'OK!';
		};
	}	

	// Sends code down I2C

	console.log (response);
	//res.json({ response: `${response}` });
 
});
