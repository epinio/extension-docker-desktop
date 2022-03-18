# Epinio

https://epinio.io

## Build Image

    make

## Install/Update Extension

    bin/docker-extension extension install epinio/docker-extension
    bin/docker-extension extension update epinio/docker-extension

## Dev

    # serve ui from local server
    docker-extension extension dev ui-source epinio/docker-extension http://localhost:3000

    # debug console
    docker-extension extension dev debug epinio/docker-extension
