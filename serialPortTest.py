import serial

ser = serial.Serial ('/dev/ttyO1', 9600)

while True:
	ser.write (ser.read())
