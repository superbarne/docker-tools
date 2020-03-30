FROM ubuntu:bionic
WORKDIR /tmp
RUN apt-get update
RUN apt-get install -y openssl libssl1.0.0 libssl-dev curl
RUN curl -fsSLO --compressed https://info-mongodb-com.s3.amazonaws.com/mongodb-bi/v2/mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4.tgz -4 \
      && tar -xf "mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4.tgz" \
      && cp mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4/bin/* /usr/local/bin
RUN openssl version
ADD . /usr/local/bin
RUN chmod -R 755 /usr/local/bin
ENTRYPOINT [ "entrypoint.sh" ]
EXPOSE 3307