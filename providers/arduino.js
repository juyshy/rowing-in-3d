var fs = require("fs");
var serial = require("serialport");
var SerialPort = serial.SerialPort;

// Replace with the device name in your machine.
var portName = "COM5"; // /dev/cu.usbmodem1421

var sp = new SerialPort(portName, {
	baudrate: 9600,
	parser: serial.parsers.readline("\n")
});

var scriptStartTime = Date.now();
var prevTime = scriptStartTime;

module.exports = {

	init: function (socket, params) {
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
};

