import serial, os
import sys

txFd = open ('/sys/kernel/debug/omap_mux/uart1_txd', 'wb')
txFd.write ("0")
txFd.close ()

rxFd = open ('/sys/kernel/debug/omap_mux/uart1_rxd', 'wb')
rxFd.write ("%X" % (0 | (1<<5)))
rxFd.close ()

ser = serial.Serial ('/dev/ttyO1', 9600)

while True:
	ser.write (ser.read())
