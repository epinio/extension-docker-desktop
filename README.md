# Epinio

https://epinio.io

## Install Extension

    docker extension install splatform/epinio-docker-desktop

    # backup on ghcr.io/epinio/extension-docker-desktop

## Dev

### Build Image locally

    make

### Install/Update

    docker extension install splatform/epinio-docker-desktop
    docker extension update splatform/epinio-docker-desktop

### Debug

    # serve ui from local server
    docker extension dev ui-source splatform/epinio-docker-desktop http://localhost:3000

    # debug console
    docker extension dev debug splatform/epinio-docker-desktop

## Release

### Update Nginx/CertManager Charts

* `ui/src/epinio/Installer.js` (helm charts)

### Update Helm/Kubectl Binaries

* `Dockerfile `(download)
* `metadata`.json (host folder)

### Update Epinio

* `Dockerfile `(download CLI, 2x `ARG EPINIO_VERSION`)
* `ui/src/epinio/Installer.js` (helm chart, 1x `epinio/helm-charts/releases`)
* `ui/src/App.js` (download endpoint, 2nd `DownloadIcon`)
