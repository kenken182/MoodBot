# MoodBot
MoodBot analyzes audio to break down the emotions of the speaker to help get a scope of their speaker's mental health.

# Images
![Picture1](https://imgur.com/MHoUog9)
![Picture2](https://imgur.com/ExBs5LJ)
![Picture3](https://imgur.com/tfapLKG)
![Picture4](https://imgur.com/hybltwd)

# Requirements 
In order to use this, you need to get AWS S3, Azure Coginitive API and IBM Watson credentials:

```.env
AZURE_ENDPOINT=''
AZURE_API_KEY=''
PORT='3001'
AWS_ACCESS_KEY_ID=''
AWS_SECRET_KEY=''
AWS_BUCKET_NAME=""
AZURE_COGNITIVE_KEY=''
AZURE_COGNITIVE_ENDPOINT=''
AZURE_COGNITIVE_REGION=''
IBM_API_KEY=''
IBM_URL=''
```

# How To Start
```
git clone https://github.com/kenken182/moodBot
npm install
npm run dev
cd ..
cd client
yarn
yarn start
```
