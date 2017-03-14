
var SerialPort = require('serialport');
var portNames = ["COM5", "COM6", "COM1", "COM2", "COM3", "COM4"];
var portName = portNames[0]; // 
// process.exit();
console.log("configuring serial port");
var sp;

var portIterateCount = 0;

function initSerial(portName) {

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
            console.log('Error opening port: ', err.message);
            portIterateCount++;
            console.log("trying with " + portNames[portIterateCount]);
            portName = portNames[portIterateCount]
            initSerial(portName);
        } else {

            console.log('port opened ');
            startPollingSerial(sp);
        }
    });

}

initSerial(portName);

function startPollingSerial(sp) {
    console.log("start polling");
    /* When we get a new line from the arduino, send it to the browser via this socket */
    sp.on("data", function (data) {
        var nowtime = Date.now();
        var datatoCollect = Date.now() + ":" + data;
        console.log(datatoCollect);

    });
}










