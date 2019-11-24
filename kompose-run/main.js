const { Client, KubeConfig } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request')
const argv = require('argh').argv;
const yaml = require('js-yaml');
const { readFileSync } = require('fs')
const util = require('util')
const crypto = require('crypto')
const JSONStream = require('json-stream')

async function main() {
  try {
      
    const {
      file
    } = argv

    let kubernetes = new Client()
    await kubernetes.loadSpec()



  } catch(error) {
    console.error(error);
    process.exit(1)
  }
}


main()
  .catch(err => {
    console.error(err);
    process.exit(1)
  })