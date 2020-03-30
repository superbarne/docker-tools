#!/bin/sh

echo $MONGO_URI
mongodrdl --uri $MONGO_URI > schema.drdl
mongoSQLDParams="--addr 0.0.0.0 --schema schema.drdl --mongo-uri $MONGO_URI_WITHOUT_DATABASE"

if [ -n "$MONGO_AUTH" ]; then
    mongoSQLDParams="${mongoSQLDParams} --auth"
fi

if [ -n "$MONGO_SSL" ]; then
    mongoSQLDParams="${mongoSQLDParams} --mongo-ssl"
fi



`/usr/local/bin/mongosqld ${mongoSQLDParams}`