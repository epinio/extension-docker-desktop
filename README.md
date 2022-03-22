# Epinio

https://epinio.io

## Build Image

    make

## Install/Update Extension

    bin/docker-extension extension install epinio/extension-docker-desktop
    bin/docker-extension extension update epinio/extension-docker-desktop

## Dev

    # serve ui from local server
    docker-extension extension dev ui-source epinio/extension-docker-desktop http://localhost:3000

    # debug console
    docker-extension extension dev debug epinio/extension-docker-desktop
