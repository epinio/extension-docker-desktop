# Epinio

https://epinio.io

## Install Extension

    docker-extension extension install ghcr.io/epinio/extension-docker-desktop:v0.0.1-3

## Dev

### Build Image

    make

### Install/Update

    docker-extension extension install epinio/extension-docker-desktop
    docker-extension extension update epinio/extension-docker-desktop

### Debug

    # serve ui from local server
    docker-extension extension dev ui-source epinio/extension-docker-desktop http://localhost:3000

    # debug console
    docker-extension extension dev debug epinio/extension-docker-desktop
