# Epinio Docker/Rancher Desktop Extension

For more information on Epinio, please visit https://epinio.io

## Install Extension

    docker extension install splatform/epinio-docker-desktop

    # backup on ghcr.io/epinio/extension-docker-desktop

## Dev

### Build Image locally

    make

### Install/Update

#### Install on Rancher Desktop

To install on Rancher Desktop, use the Rancher Desktop CLI `rdctl`.

    rdctl extension install splatform/epinio-docker-desktop
    rdctl extension update splatform/epinio-docker-desktop

#### Install on Docker Desktop

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

### Troubleshooting

If having trouble installing Epinio, you may need to install it manually.

```
helm upgrade --install epinio --create-namespace --namespace epinio --atomic --set global.domain=localtest.me https://github.com/epinio/helm-charts/releases/download/epinio-1.11.1/epinio-1.11.1.tgz
```

If you receive a "Error: no cached repo found (try 'helm repo update')" error, you may need to try `helm repo update` first.
