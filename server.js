var config = require('./config');
var restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')

const dialogflow = require('dialogflow');
const uuid = require('uuid');

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*']
});

process.env.GOOGLE_APPLICATION_CREDENTIALS=config.appCredentials;

var server = restify.createServer({
    name: config.name,
    version: '1.0.0'
});


server.pre(cors.preflight);  
server.use(restify.plugins.bodyParser({"params":true})); server.use(cors.actual);

var endpoint = '/gdf/';


server.post(endpoint + "intent", function (req, resMain, next) {

  if (req.body.query) {
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(config.projectId, sessionId);
    let promise;
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: req.body.query,
          languageCode: 'en-US',
        },
      },
    };
    console.log('Sending query: ' + req.body.query);
    promise = sessionClient.detectIntent(request);

    promise
      .then(responses => {
        console.log('Detected intent');
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        if (result.intent) {
          console.log(`  Intent: ${result.intent.displayName}`);
        } else {
          console.log(`  No intent matched.`);
        }
        resMain.send({ response: "OK",
          query: result.queryText,
          response: result.fulfillmentText,
          intent: result.intent.displayName,
          confidence: result.intentDetectionConfidence
        });

      })
      .catch(err => {
        console.error('ERROR:', err);
      });

  } else {
      resMain.send(400, { response: "Incorrect JSON structure" });
  }
  return next();
});

server.get(/\/?.*/, restify.plugins.serveStatic({
  directory: './public',
  default: 'index.html'
}))

// Start the server:
server.listen(config.port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
