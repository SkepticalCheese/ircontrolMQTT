/*
   Receives code coming from I2C and sends it through IR

   Thanks to:
   - Ken Shirriff (http://arcfn.com) for IRsendDemo (Arduino-IRRemote)
   - Nicholas Zambetti (http://www.zambetti.com) for Wire Slave Receiver (Wire library)

   An IR LED must be directly or indirectly connected to pin 3 (PWM).
*/

#include <IRremote.h>
#include <Wire.h>

// Remove coments to debug code through Serial when connected to the computer
//#define MONITOR

IRsend irsend;

unsigned long buffer [4]; // could be using bytes and casting later but I'm lazy
byte bufferLen = 0;
int codeOnBuffer = 0;
unsigned long timestamp = 0;

// Initialize Wire library
void setup()
{
  // join i2c bus with address #8, sets rate to 100 kHz
  Wire.begin(8);                
  Wire.setClock (100000L); // Probably not required. 100 kHz is supposed to be the default.
  Wire.onReceive(receiveEvent); // register event to reveive bytes

  Serial.begin(9600);
#ifdef MONITOR
  Serial.println(F("Listening to the I2C bus..."));
#endif
}

// Loop waiting for an I2C message from the master
void loop() {
  delay(10);

  if (codeOnBuffer) {
    // Complete message is on the buffer. Blast it to the device
    sendIR ( (buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | (buffer[3]));
    codeOnBuffer = 0;
    bufferLen = 0;
  }
  else {
    // Clears buffer after 1s if an incomplete message was received
    if (bufferLen > 0 && (millis() - timestamp) >= 1000) { 
      codeOnBuffer = 0;
      bufferLen = 0;
    }
  }
}

// function that executes whenever data is received from master
// this function is registered as an event, see setup()
void receiveEvent(int howMany) {
  while (Wire.available()) {
    byte c = Wire.read();

    if (bufferLen >= 4) {
      bufferLen = 0;
      codeOnBuffer = 0;
    }
    buffer [bufferLen] = c;
    bufferLen ++;

    if (!codeOnBuffer && bufferLen == 4) {
      codeOnBuffer = 1;
    }
#ifdef MONITOR
    Serial.print(F("Received:"));
    Serial.println((int) c);
#endif
  }
  
  timestamp = millis();
}

// Just sends the code down IR
void sendIR(unsigned long OutgoingCode) {
#ifdef MONITOR
  Serial.print(F("Outgoing:"));
  Serial.println(OutgoingCode);
#endif

  if (OutgoingCode != 0) {
    irsend.sendNEC (OutgoingCode, 32);

#ifdef MONITOR
    Serial.println(F("Sent signal."));
#endif
  }

}
