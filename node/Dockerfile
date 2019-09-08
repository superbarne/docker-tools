FROM astefanutti/scratch-node:12.6.0 as node
FROM alpine as alpine
RUN apk add upx

COPY --from=node /bin/node /bin/node
RUN upx /bin/node

FROM scratch
COPY --from=alpine /bin/node /bin/node
COPY --from=node /lib/ld-musl-*.so.1 /lib/
COPY --from=node /etc/passwd /etc/passwd
USER node

ENTRYPOINT ["node"]