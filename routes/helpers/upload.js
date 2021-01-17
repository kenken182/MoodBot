require('dotenv').config()
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require('fs')

const uploadFile = (buffer, name, type, s3) => {
    const params = {
      ACL: 'public-read',
      Body: buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: type.mime,
      Key: `${name}.${type.ext}`,
    };
    return s3.upload(params).promise();
};

module.exports = {
  uploadFile 
}