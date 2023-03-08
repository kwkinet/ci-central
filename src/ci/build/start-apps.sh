#!/bin/bash
cd /app/repo1 && npm start &
cd /app/repo2 && npm start &
cd /app/repo3 && npm start
