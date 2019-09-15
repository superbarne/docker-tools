#!/bin/sh

echo $MONGO_URI

mongodrdl -h $MONGO_URI -d $MONGO_DB > schema.drdl

mongoSQLDParams="--addr 0.0.0.0 --schema schema.drdl --mongo-uri $MONGO_URI"

if [ -n "$MONGO_AUTH" ]; then
    mongoSQLDParams="${mongoSQLDParams} --auth"
fi

if [ -n "$MONGO_SSL" ]; then
    mongoSQLDParams="${mongoSQLDParams} --mongo-ssl"
fi



`/usr/local/bin/mongosqld ${mongoSQLDParams}`