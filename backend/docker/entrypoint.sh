#!/bin/sh

cd /opt/highscore

# Wait for MySQL to start.
./wait-for-it.sh -h "${DB_HOST}" -p 3306 -t 120

HSBACKEND=`ls /opt/highscore/hsbackend*.jar`
export CLASSPATH=${HSBACKEND}:`cat ./CLASSPATH`

java -cp "$CLASSPATH" se.yrgo.highscore.App
