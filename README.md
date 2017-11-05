# ircontrolMQTT
Node application to control appliances through Amazon Alexa and Amazon IoT. The IR communication is handled by an Arduino board.

## Target hardware: 
- The Next Thing Co C.H.I.P. (probably easily portable to Raspberry Pi and similars)
- Arduino Pro Micro (3.3V)

## Arduino
See arduino/IR_I2C_ProMini for the Arduino code

## Connections & set up
- See frizting diagram under the fritzing folder for the electronic connections
- Sample Alexa interaction model under the AlexaSkills folder
- AWS Lambda function example under the AWSLambda folder
- Add IR codes for your devices to the intent2ircode.yaml file in a way that matches the Alexa intents
- Optionally connect a switch between XIO-P1 and 3v3. The node app will shut C.H.I.P down gracefully when that pin is brought to 3.3V
- Set up AWS IoT 

## Installing node modules
```
npm install init
npm install aws-iot-device-sdk --save
npm install chip-io johnny-five --save
npm install child_process --save
```	
Obtain certificates (best way is to download and run AWS IoT kit).


## Running the app
```
sudo node app.js
```

## Troubleshooting the I2C connection
```
sudo i2cdetect -y 2
sudo i2cset -y 2 8 0x20
sudo i2cset -y 2 8 0xDF
sudo i2cset -y 2 8 0x90
sudo i2cset -y 2 8 0x6F
```
## Optional: Setting up forever on boot and rotate log
[Install forever](https://github.com/foreverjs/forever) 

You may need to install logrotate too (I don't remember if I did).

as root:
```
cp ./init/ircontrolMQTT /etc/init.d 
chmod 755 /etc/init.d/ircontrolMQTT 
sh /etc/init.d/ircontrolMQTT start
update-rc.d ircontrolMQTT defaults
cp ./logrotate/ircontrolMQTT /etc/logrotate.d/
```
To revert the steps above:
```
rm  /etc/logrotate.d/ircontrolMQTT
update-rc.d -f ircontrolMQTT remove
sh /etc/init.d/ircontrolMQTT stop
rm /etc/init.d/ircontrolMQTT
```