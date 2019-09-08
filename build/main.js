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
      gitUri,
      imageTag,
      beforeScript,
      dockerRegistry,
      dockerRepository,
      dockerUsername,
      dockerPassword,
      kubernetesKey,
      kubernetesCertificate,
      kubernetesHost,
      kubernetesNamespace,
      subdirectory
    } = argv


    let kubernetes;

    if(kubernetesKey && kubernetesCertificate && kubernetesHost) {
      const config = {
        apiVersion: 'v1',
        clusters: [
          {
            cluster: {
              'insecure-skip-tls-verify': true,
              server: kubernetesHost
            },
            name: 'cluster'
          }
        ],
        contexts: [
          {
            context: {
              cluster: 'cluster',
              user: 'cluster'
            },
            name: 'cluster'
          }
        ],
        'current-context': 'cluster',
        kind: 'Config',
        preferences: {},
        users: [
          {
            name: 'cluster',
            user: {
              'client-certificate-data': kubernetesCertificate,
              'client-key-data': kubernetesKey
            }
          }
        ]
      }

      const kubeconfig = new KubeConfig()
      kubeconfig.loadFromString(JSON.stringify(config))
      const backend = new Request({ kubeconfig })
      kubernetes = new Client({ backend })
    } else kubernetes = new Client()
    await kubernetes.loadSpec()


    const jobName = `build-${imageTag}-${crypto.randomBytes(64).toString('hex').substring(0,8)}`
    const manifest = yaml.load(readFileSync('./jobTemplate.yaml'))

    manifest.metadata.name = jobName
    manifest.metadata.namespace = kubernetesNamespace;
    manifest.spec.template.spec.initContainers[0].args[1] = gitUri

    const makisu = manifest.spec.template.spec.containers[0];
    makisu.args = [
      'build',
      '--modifyfs=true',
      `--push=${dockerRegistry}`,
      `-t=${dockerRegistry}/${dockerRepository}:${imageTag}`,
      '--registry-config=/registry-config/registry.yaml',
      '--redis-cache-addr=cache-redis-svc.redis.svc.cluster.local:6379',
      `/makisu-context/${subdirectory}`
    ]

    if (beforeScript) {
      manifest.spec.template.spec.initContainers.push({
        name: 'before-script',
        image: 'busybox:1.31.0',
        command: ["/bin/ash"],
        args: ['-c', `cd /makisu-context && ${beforeScript}`],
        volumeMounts: [
          {
            name: 'context',
            mountPath: '/makisu-context'
          }
        ],
      })
    }

    await kubernetes.apis.batch.v1.namespaces(kubernetesNamespace).jobs.post({ body: manifest })

    const podName = (
      await kubernetes.api.v1.pods.get({
        qs: { labelSelector: `job-name=${jobName}`}
      })
    ).body.items[0].metadata.name;

    await waitForPodInit(kubernetes, kubernetesNamespace, podName)
    
    const stream = kubernetes.api.v1
      .namespaces(kubernetesNamespace)
      .pods(podName)
      .log.getStream({
        qs: { follow: true },
      });

    stream.on('data', data => {
      console.log(data.toString('utf8').replace(/\n/g, ''));
    });
    await waitForJobCompletion(kubernetes, kubernetesNamespace, jobName);

  } catch(error) {
    console.error(error);
    process.exit(1)
  }
}

function waitForJobCompletion(kubernetes, namespace, jobName) {
  return new Promise((resolve, reject) => {
    const stream = kubernetes.apis.batch.v1.watch.namespaces(namespace).jobs(jobName).getStream();
    const jsonStream = new JSONStream()
    stream.pipe(jsonStream)

    jsonStream.on('data', event => {
      if( event.type == 'MODIFIED'){
        if( event.object.status.hasOwnProperty('completionTime')  ){
          stream.abort()
          resolve(event.object);
        }
        if(event.object.status.failed) {
          stream.abort()
          reject(new Error('Job failed'))
        }
      }
    })
  })
}

function waitForPodInit(kubernetes, namespace, podName) {
  return new Promise((resolve, reject) => {
    const stream = kubernetes.api.v1.watch.namespaces(namespace).pods(podName).getStream();
    const jsonStream = new JSONStream()
    stream.pipe(jsonStream)

    jsonStream.on('data', event => {
      if( event.type == 'MODIFIED'){
        if( event.object.status.hasOwnProperty('phase') && event.object.status.phase === 'Running'  ){
          stream.abort()
          resolve(event.object);
        }
        if( event.object.status.hasOwnProperty('phase') && event.object.status.phase === 'Failed'  ){
          stream.abort()
          reject(new Error('Pod failed'))
        }
      }
    })
  })
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1)
  })