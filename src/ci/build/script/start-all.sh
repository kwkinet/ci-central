#!/bin/bash

cd ../ai-verify-apigw
node app.mjs &

cd ../ai-verify-portal
npm run start

