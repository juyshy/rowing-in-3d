var fs = require("fs");
var SerialPort = require('serialport');
var portNames = ["COM5", "COM6", "COM1", "COM2", "COM3", "COM7", "COM8", "COM9"];
var portName = portNames[0]; // 
// process.exit();

console.log("configuring serial port");
var sp;

var scriptStartTime = Date.now();
var prevTime = scriptStartTime;
var arduinoSuccess = false;
module.exports = {

	init: function (socket, params, successCallback) {
		var portIterateCount = 0;
		if (sp && sp.isOpen()) {
			sp.close();
		}
		console.log("arduino init");

		function initSerial(portName) {
			console.log("trying with " + portNames[portIterateCount]);
			sp = new SerialPort(portName, {
				baudrate: 9600,
				parser: SerialPort.parsers.readline("\n"),
				autoOpen: false
			});
			sp.on('error', function (err) {
				console.log('Error1: ', err.message);

			});

			sp.open(function (err) {
				if (err) {
					// console.log('Error opening port: ', err.message);
					portIterateCount++;
					if (portIterateCount < portNames.length) {
						portName = portNames[portIterateCount];
						initSerial(portName);
					} else {
						console.log("no success opening serial ports " + portNames);
						console.log("make sure arduino is connected. ");
						successCallback(false);
						// process.exit();
					}
				} else {
					arduinoSuccess = true;
					console.log(portName + ' port opened ');
					successCallback(true);
					var log2file = params.logging;
					if (params.oarsActive) {

						/* When we get a new line from the arduino, send it to the browser via this socket */
						sp.on("data", function (data) {
							var nowtime = Date.now();

							if (prevTime != nowtime) {
								var datatoCollect = Date.now() + ":" + data;
								console.log(datatoCollect);
								if (log2file) {
									fs.appendFile('logs/rowsessions/rowlog_' + scriptStartTime + ".txt", datatoCollect, function (err) {
										//console.log(err);
									});
								}
							}
							prevTime = nowtime;
							// console.log(data);
							socket.emit("message", data.toString());
						});
					}
				}
			});
		}

		initSerial(portName);

	}
};

