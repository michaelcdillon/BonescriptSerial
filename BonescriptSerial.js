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
    console.log ("Buffer: " + rxBuf.length + " Contents: " + rxBuf.toString ());

    console.log ("Setting up mux for " + uart.path);
    
    txFd = fs.openSync (MUX_PATH + uart.muxTx.path, 'a+');
    rxFd = fs.openSync (MUX_PATH + uart.muxRx.path, 'a+');
    if (txFd && rxFd) {
        fs.write (txFd, txBuf, 0, txBuf.length, 1, function (err) {
            if (!err) {
                fs.closeSync (txFd);
                fs.write (rxFd, rxBuf, 0, rxBuf.length, 1, function (err) {
                    if (!err) {
                        fs.closeSync (rxFd);
                        next ();
                    }
                    else {
                        fs.closeSync (rxFd);
                        console.log ('Error Writing to file: ' + MUX_PATH + uart.muxRx.path + ' | ' + err);            
                    }
                });
            }
            else {
                fs.closeSync (txFd);
                console.log ('Error Writing to file: '+ MUX_PATH + uart.muxTx.path + ' | ' + err);            
            }
        });  
    }
    else {
        if (txFd)
            fs.closeSync (txFd);
        if (rxFd)
            fs.closeSync (rxRd);
    }
};

var port;

var openSerialPort = function () {
	port = new serialPort.SerialPort (UART_CONFIG.uart1.path, {
		baudRate : 9600,
		//parser : serialPort.parsers.raw
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
