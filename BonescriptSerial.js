var util = require ("util");
var fs = require ("fs");
var serialPort = require ("serialport");

var UART0_PATH = "/dev/ttyO0";
var UART1_PATH = "/dev/ttyO1";
var UART2_PATH = "/dev/ttyO2";
var UART3_PATH = "/dev/ttyO3";
var UART4_PATH = "/dev/ttyO4";
var UART5_PATH = "/dev/ttyO5";

var MUX_PATH = "/sys/kernel/debug/omap_mux/";

var UART_CONFIG = {
	uart0 : {
		muxTx : {
			path : "uart0_txd",
			config : "0",
		},
		muxRx : {
			path : "uart0_rxd",
			config : "" + (0 | 1 << 5),
		},
		path : "/dev/ttyO0",
	},
	uart1 : {
		muxTx : {
			path : "uart1_txd",
			config : "0",
		},
		muxRx : {
			path : "uart1_rxd",
			config : "" + (0 | 1 << 5),
		},
		path : "/dev/ttyO1",	
	},	
};

var setMuxForUart = function (uart, next) {
    var txFd, rxFd;
    var txBuf = new Buffer(uart.muxTx.config, 'ascii');
    var rxBuf = new Buffer(uart.muxRx.config, 'ascii');
    var txBytesWritten, rxBytesWritten;

    console.log ("Configuring UART MUX for " + uart.path);
    
    txFd = fs.openSync (MUX_PATH + uart.muxTx.path, 'w');
    rxFd = fs.openSync (MUX_PATH + uart.muxRx.path, 'w');

    if (txFd && rxFd) {
        try {
            txBytesWritten = fs.writeSync (txFd, txBuf, 0, txBuf.length, 0);
        }
        catch (e) {
            fs.closeSync (txFd);
            console.log ('Error Writing to file: '+ MUX_PATH + uart.muxTx.path + ' | ' + util.inspect (e));            
            return;
        }

        try {
            rxBytesWritten = fs.writeSync (rxFd, rxBuf, 0, rxBuf.length, 0);
        }
        catch (e) {
            fs.closeSync (rxFd);
            console.log ('Error Writing to file: ' + MUX_PATH + uart.muxRx.path + ' | ' + util.inspect(e));            
            return;
        }

        fs.closeSync (txFd);
        fs.closeSync (rxFd);

        if (txBytesWritten && rxBytesWritten) {
            console.log ("Uart MUX finished configuration");
            next ();
        }
        else {
            console.log ("An error occured writing to the UART MUX.");
        }
    }
    else {
        console.log ("An error occured while opening the UART MUX files.");
    }
};

var port;

var openSerialPort = function () {
	port = new serialPort.SerialPort (UART_CONFIG.uart1.path, {
		baudRate : 9600,
		parser : serialPort.parsers.raw
	});
	console.log ("Serial Port setup and running...");
	port.on ("data", function (data) {
		port.write (data);	
		console.log (data);
	});
    port.on ('close', function (data) {
        console.log ('serialport closed');
    });
};


console.log ("Opening Serial Port for: " + UART_CONFIG.uart1.path);
setMuxForUart (UART_CONFIG.uart1, function () {
    console.log ("Uart mux setup finished");
    openSerialPort ();
});
