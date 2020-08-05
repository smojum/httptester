#!/bin/bash
while true
do
  cd /www/httptester
  node httptester.js
  echo "finished running. sleeping..."
  sleep $1
done
