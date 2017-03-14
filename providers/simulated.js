var rowsession = require("./rowsession.js");
var rowSessionData = rowsession.rowSessionData;
var printvalues = false;
module.exports = {

	init: function (socket) {
		console.log("Starting simulated session ");
		// console.log(rowSessionData.length);

		var rowsessionDataLength = rowSessionData.length;

		function emitSimulatedOarPosition(i) {
			if (printvalues)
				console.log(i + ":" + rowSessionData[i][0] + ":" + rowSessionData[i][1].toString());
			socket.emit("message", rowSessionData[i][1].toString());
			i++;
			if (i < rowsessionDataLength)
				setTimeout(emitSimulatedOarPosition, rowSessionData[i][0], i);
			else
				emitSimulatedOarPosition(0);
		}
		emitSimulatedOarPosition(0);
	}
};