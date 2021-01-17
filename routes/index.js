require('dotenv').config()
var express = require('express');
var router = express.Router();
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const fs = require('fs')
const AWS = require('aws-sdk')
const FileType = require('file-type');
const multiparty = require('multiparty');
const helpers = require('./helpers/upload.js')
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// create S3 instance
const s3 = new AWS.S3({httpOptions: {timeout: 3000}});
const toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  authenticator: new IamAuthenticator({
    apikey: process.env.IBM_API_KEY,
  }),
  serviceUrl: process.env.IBM_URL
});

router.post('/sentiment', async function(req, res, next) {
  const textAnalyticsClient = new TextAnalyticsClient(process.env.AZURE_ENDPOINT,  new AzureKeyCredential(process.env.AZURE_API_KEY));
  let response = {
    sentiment:{'total': 0, 'opinions': []},
    tone:{'document':[], 'sentence': []}
  }
  async function sentimentAnalysisWithOpinionMining(client){
    let object = {'text':req.body.body.data, 'id': '0', 'language': 'en'}
    const sentimentInput = [object]
    const sentimentResult = await client.analyzeSentiment(sentimentInput, { includeOpinionMining: true });

    sentimentResult.forEach(document => {
        response.sentiment.overall = document.sentiment
        response.sentiment.length = document.sentences.length
        document.sentences.forEach(sentence => {
            response.sentiment.total += parseFloat(sentence.confidenceScores.positive.toFixed(2))
            for (const { aspect, opinions } of sentence.minedOpinions) {
              let object = {}
              object.text = aspect.text
              object.sentiment = aspect.sentiment
              object.positive = aspect.confidenceScores.positive.toFixed(2)
              object.negative = aspect.confidenceScores.negative.toFixed(2)
                for (const { text, sentiment, confidenceScores } of opinions) {
                  object.opinionText = text
                }
                response.sentiment.opinions.push(object)
            }
          });
      });
  }
  const toneParams = {
    toneInput: { 'text': req.body.body.data },
    contentType: 'application/json',
  };
  await sentimentAnalysisWithOpinionMining(textAnalyticsClient)
  await toneAnalyzer.tone(toneParams).then(toneAnalysis => {
    toneAnalysis.result.document_tone.tones.forEach((doc) => {
      response.tone.document.push(doc)
    })
    toneAnalysis.result.sentences_tone.forEach((doc) => {
      response.tone.sentence.push(doc)
    })
  })
  console.log(response)
  res.send(response)
});

router.post('/upload', function(req, res, next) {
  const form = new multiparty.Form();
  form.parse(req, async (error, fields, files) => {
    if (error) {
      console.log("error1", error)
      return res.status(500).send(error);
    };
    try {
      const path = files.file[0].path;
      const buffer = fs.readFileSync(path);
      const type = await FileType.fromBuffer(buffer);
      const fileName = `bucketFolder/${Date.now().toString()}`;
      const data = await helpers.uploadFile(buffer, fileName, type, s3);
      return res.status(200).send(data);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }
  });
})

function fromFile(name) {
  let pushStream = sdk.AudioInputStream.createPushStream();

  fs.createReadStream(name).on('data', function(arrayBuffer) {
      pushStream.write(arrayBuffer.slice());
  }).on('end', function() {
      pushStream.close();
  });

  let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
  let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  recognizer.recognizeOnceAsync(result => {
      console.log(`RECOGNIZED: Text=${result.text}`);
      recognizer.close();
  });
}
router.post('/analyze', async function(req, res, next) {
  const directory = __dirname
  const filename = `${directory}/tmp/temp.wav`
  var s3Params = {
    Bucket: req.body.body.data.Bucket,
    Key: req.body.body.data.key
  };
  s3.getObject(s3Params, function(err, data) {
    if (err) {
        throw err
    }
    fs.writeFileSync(filename, data.Body)
  })
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURE_COGNITIVE_KEY, process.env.AZURE_COGNITIVE_REGION);
  var pushStream = sdk.AudioInputStream.createPushStream();
  fs.createReadStream(filename).on('data', function(arrayBuffer) {
    pushStream.write(arrayBuffer.slice());
  }).on('end', function() {
    pushStream.close();
  });

  var audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
  speechConfig.speechRecognitionLanguage = "en-US";
  var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  
  recognizer.recognizeOnceAsync(result => {
      console.log(`RECOGNIZED1: Text=${result.text}`);
      if (result.text) {
        res.send(result.text)
      } else {
        res.send("This program sucks and is not working.")
      }
  });
})

module.exports = router;
