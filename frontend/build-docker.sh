#!/bin/sh

if [ -z "${DOCKER_REGISTRY}" ]; then
    echo "You must set the environment variable DOCKER_REGISTRY"
    exit 1
fi

TAGNAME=hsfrontend:latest

npm run build
docker build -t ${TAGNAME} .
docker tag ${TAGNAME} ${DOCKER_REGISTRY}/${TAGNAME}
docker push ${DOCKER_REGISTRY}/${TAGNAME}
