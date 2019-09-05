#!/usr/bin/env bash
set -Eeo pipefail

set -e
export KUBECONFIG="/config"
cat << EOF > /config
apiVersion: v1
clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: https://$HOST
  name: cluster
contexts:
- context:
    cluster: cluster
    user: cluster
  name: cluster
current-context: cluster
kind: Config
preferences: {}
users:
- name: cluster
  user:
    client-certificate-data: $CLIENT_CERTIFICATE
    client-key-data: $CLIENT_KEY
EOF

exec "$@