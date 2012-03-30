#BonescriptSerial#

Enable using the serial ports (/dev/ttyO1-5) on the BeagleBone.
The actual communication will be handled by the SerialPort node
module, however this will wrap that up. This will also properly
mux uart pins when needed.

##Dependencies##
- SerialPort
