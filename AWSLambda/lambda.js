//Environment Configuration
var config = {};
// Update URL below with your end point
config.IOT_BROKER_ENDPOINT      = "XXXXX.us-east-1.amazonaws.com".toLowerCase();
config.IOT_BROKER_REGION        = "us-east-1";
config.IOT_THING_NAME           = "ircontrol";

//Loading AWS SDK libraries
var AWS = require('aws-sdk');
AWS.config.region = config.IOT_BROKER_REGION;

//Initializing client for IoT
var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});


exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION");
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`);
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Please specify the device and command you wish to execute", true),
            {}
          )
        );
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`);

        var repromptText = null;
        var sessionAttributes = {};
        var shouldEndSession = true;
        var payloadObj= {command: event.request.intent.name};
        
        //Prepare the parameters of the update call
        var paramsUpdate = {
            topic:"command",
            payload: JSON.stringify(payloadObj),
            qos:0
        };
        
        iotData.publish(paramsUpdate, function(err, data) {
    
            var speechOutput = "OK!";

            if (err){
                //Handle the error here
                speechOutput = "Sorry! There was a problem executing your command.";
                console.log("MQTT Error:" + data);
            }
            else {
                console.log(data);
                //callback(sessionAttributes,buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
            }    

            context.succeed(
              generateResponse(
                buildSpeechletResponse(speechOutput, true),
                {}
              )
            );
        });

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

};

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  };

};

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };

};