#!/bin/bash

/usr/local/bin/wait-for-it.sh -t 0 $MONGO_HOST:$MONGO_PORT -- run.sh