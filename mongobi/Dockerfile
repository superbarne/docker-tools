FROM ubuntu:bionic
WORKDIR /tmp
RUN apt-get update
RUN apt-get install -y openssl libssl1.0.0 libssl-dev curl
RUN curl -fsSLO --compressed https://info-mongodb-com.s3.amazonaws.com/mongodb-bi/v2/mongodb-bi-linux-x86_64-ubuntu1604-v2.11.1.tgz \
      && tar -xf "mongodb-bi-linux-x86_64-ubuntu1604-v2.11.1.tgz" \
      && cp mongodb-bi-linux-x86_64-ubuntu1604-v2.11.1/bin/* /usr/local/bin
RUN openssl version
ADD . /usr/local/bin
RUN chmod -R 755 /usr/local/bin
ENTRYPOINT [ "entrypoint.sh" ]
EXPOSE 3307