FROM adoptopenjdk:11-jre-hotspot

RUN apt update && apt install -y netcat

RUN mkdir -p /opt/highscore/dependency

COPY docker/wait-for-it.sh /opt/highscore/
COPY docker/entrypoint.sh /opt/highscore/
COPY target/hsbackend-*.jar /opt/highscore/
COPY target/dependency/* /opt/highscore/dependency/
COPY target/CLASSPATH /opt/highscore/

RUN chmod +x /opt/highscore/*.sh

EXPOSE 4567/tcp

ENV DB_HOST=mysql
ENV DB_USER=root
ENV DB_PASSWORD=

ENTRYPOINT ["/opt/highscore/entrypoint.sh"]
