################################
#          UI Builder           #
#################################
FROM node:14.17-alpine3.13 AS client-builder

WORKDIR /ui

# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci

# build
COPY ui /ui
RUN npm run build


#################################
# Downloader for AMD64 binaries #
#################################
FROM alpine as downloader-amd64

RUN apk add --no-cache wget coreutils unzip

# https://github.com/helm/helm/releases
ARG HELM_VERSION=3.11.1

# https://get.helm.sh/helm-v3.11.1-darwin-amd64.tar.gz.sha256sum
ARG HELM_CHECKSUM_DARWIN_AMD64=2548a90e5cc957ccc5016b47060665a9d2cd4d5b4d61dcc32f5de3144d103826
# https://get.helm.sh/helm-v3.11.1-linux-amd64.tar.gz.sha256sum
ARG HELM_CHECKSUM_LINUX_AMD64=0b1be96b66fab4770526f136f5f1a385a47c41923d33aab0dcb500e0f6c1bf7c
# https://get.helm.sh/helm-v3.11.1-windows-amd64.zip.sha256sum
ARG HELM_CHECKSUM_WINDOWS_AMD64=bc37d5d283e57c5dfa94f92ff704c8e273599ff8df3f8132cef5ca73f6a23d0a

# https://www.downloadkubernetes.com/
ARG KUBECTL_VERSION=1.25.9

# https://dl.k8s.io/v1.25.9/bin/darwin/amd64/kubectl.sha256
ARG KUBECTL_CHECKSUM_DARWIN_AMD64=a7a8af548747a6a059b0351a6b8af2ccd2c9726c650732e69059c0635cee5c6b
# https://dl.k8s.io/v1.23.4/bin/linux/amd64/kubectl.sha256
ARG KUBECTL_CHECKSUM_LINUX_AMD64=aaa5ea3b3630730d2b8a8ef3cccb14b47754602c7207c7b0717158ae83c7cb10
# https://dl.k8s.io/v1.25.9/bin/windows/amd64/kubectl.exe.sha256
ARG KUBECTL_CHECKSUM_WINDOWS_AMD64=ed404eb0c3b74341d2ff799e78f9c0352e2bbd5c1b645652de2725ec77c0a78e

# https://github.com/epinio/epinio/releases
ARG EPINIO_VERSION=1.8.0

# /darwin amd64
RUN wget -nv https://get.helm.sh/helm-v${HELM_VERSION}-darwin-amd64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_DARWIN_AMD64} helm-v${HELM_VERSION}-darwin-amd64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-darwin-amd64.tar.gz darwin-amd64/helm && \
    mkdir -p /darwin && \
    mv darwin-amd64/helm /darwin/helm && \
    chmod +x /darwin/helm
RUN wget -nv https://dl.k8s.io/v${KUBECTL_VERSION}/bin/darwin/amd64/kubectl &&\
    sh -c 'echo "${KUBECTL_CHECKSUM_DARWIN_AMD64} kubectl" | sha256sum -w -c' && \
    mv kubectl darwin/kubectl && \
    chmod +x /darwin/kubectl
RUN wget -nv https://github.com/epinio/epinio/releases/download/v${EPINIO_VERSION}/epinio-darwin-x86_64 -O /darwin/epinio && \
    chmod +x /darwin/epinio

# /linux amd64
RUN wget -nv https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_LINUX_AMD64} helm-v${HELM_VERSION}-linux-amd64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-linux-amd64.tar.gz linux-amd64/helm && \
    mkdir -p /linux && \
    mv linux-amd64/helm /linux/helm && \
    chmod +x /linux/helm
RUN wget -nv https://dl.k8s.io/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl &&\
    sh -c 'echo "${KUBECTL_CHECKSUM_LINUX_AMD64} kubectl" | sha256sum -w -c' && \
    mv kubectl linux/kubectl && \
    chmod +x /linux/kubectl
RUN wget -nv https://github.com/epinio/epinio/releases/download/v${EPINIO_VERSION}/epinio-linux-x86_64 -O /linux/epinio && \
    chmod +x /linux/epinio

# /windows amd64
RUN wget -nv https://get.helm.sh/helm-v${HELM_VERSION}-windows-amd64.zip && \
    sh -c 'echo "${HELM_CHECKSUM_WINDOWS_AMD64} helm-v${HELM_VERSION}-windows-amd64.zip" | sha256sum -w -c' && \
    unzip helm-v${HELM_VERSION}-windows-amd64.zip && \
    mkdir /windows && \
    mv windows-amd64/helm.exe /windows/helm.exe
RUN wget -nv https://dl.k8s.io/v${KUBECTL_VERSION}/bin/windows/amd64/kubectl.exe &&\
    sh -c 'echo "${KUBECTL_CHECKSUM_WINDOWS_AMD64} kubectl.exe" | sha256sum -w -c' && \
    mv kubectl.exe /windows/kubectl.exe
RUN wget -nv https://github.com/epinio/epinio/releases/download/v${EPINIO_VERSION}/epinio-windows-x86_64.zip && \
    unzip epinio-windows-x86_64.zip && \
    mv epinio.exe /windows/epinio.exe


#################################
# Downloader for ARM64 binaries #
#################################
FROM alpine as downloader-arm64

RUN apk add --no-cache wget coreutils unzip

# https://github.com/helm/helm/releases
ARG HELM_VERSION=3.11.1

# https://get.helm.sh/helm-v3.11.1-darwin-arm64.tar.gz.sha256sum
ARG HELM_CHECKSUM_DARWIN_ARM64=43d0198a7a2ea2639caafa81bb0596c97bee2d4e40df50b36202343eb4d5c46b
# https://get.helm.sh/helm-v3.11.1-linux-arm64.tar.gz.sha256sum
ARG HELM_CHECKSUM_LINUX_ARM64=919173e8fb7a3b54d76af9feb92e49e86d5a80c5185020bae8c393fa0f0de1e8

# https://www.downloadkubernetes.com/
ARG KUBECTL_VERSION=1.25.9

# https://dl.k8s.io/v1.25.9/bin/darwin/arm64/kubectl.sha256
ARG KUBECTL_CHECKSUM_DARWIN_ARM64=4166d293b4f58e5293363f1f91a285d929a54557bf0c1a1ae22243ef24a0f58a
# https://dl.k8s.io/v1.25.9/bin/linux/arm64/kubectl.sha256
ARG KUBECTL_CHECKSUM_LINUX_ARM64=741e65b681a22074aaf9459b57dbcef6a9e993472b3019a87f57c191bc68575f

# https://github.com/epinio/epinio/releases
ARG EPINIO_VERSION=1.8.0

# /darwin arm64
RUN wget -nv https://get.helm.sh/helm-v${HELM_VERSION}-darwin-arm64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_DARWIN_ARM64} helm-v${HELM_VERSION}-darwin-arm64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-darwin-arm64.tar.gz darwin-arm64/helm && \
    mkdir -p /darwin && \
    mv darwin-arm64/helm /darwin/helm && \
    chmod +x /darwin/helm
RUN wget -nv https://dl.k8s.io/v${KUBECTL_VERSION}/bin/darwin/arm64/kubectl &&\
    sh -c 'echo "${KUBECTL_CHECKSUM_DARWIN_ARM64} kubectl" | sha256sum -w -c' && \
    mv kubectl darwin/kubectl && \
    chmod +x /darwin/kubectl
RUN wget -nv https://github.com/epinio/epinio/releases/download/v${EPINIO_VERSION}/epinio-darwin-arm64 -O /darwin/epinio && \
    chmod +x /darwin/epinio

# /linux arm64
RUN wget -nv https://get.helm.sh/helm-v${HELM_VERSION}-linux-arm64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_LINUX_ARM64} helm-v${HELM_VERSION}-linux-arm64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-linux-arm64.tar.gz linux-arm64/helm && \
    mkdir -p /linux && \
    mv linux-arm64/helm /linux/helm && \
    chmod +x /linux/helm
RUN wget -nv https://dl.k8s.io/v${KUBECTL_VERSION}/bin/linux/arm64/kubectl &&\
    sh -c 'echo "${KUBECTL_CHECKSUM_LINUX_ARM64} kubectl" | sha256sum -w -c' && \
    mv kubectl linux/kubectl && \
    chmod +x /linux/kubectl
RUN wget -nv https://github.com/epinio/epinio/releases/download/v${EPINIO_VERSION}/epinio-linux-arm64 -O /linux/epinio && \
    chmod +x /linux/epinio

FROM downloader-$TARGETARCH AS downloader


#################################
#          Final image          #
#################################
FROM scratch

LABEL org.opencontainers.image.title="Epinio" \
    org.opencontainers.image.description="Push from source to Kubernetes in one step" \
    org.opencontainers.image.vendor="Rancher by SUSE" \
    com.docker.desktop.extension.icon="https://epinio.io/images/icon-epinio.svg" \
    com.docker.extension.publisher-url="https://epinio.io" \
    com.docker.extension.screenshots='[{"alt": "Epinio after Installation", "url": "https://epinio.io/images/epinio-docker-desktop-screenshot.png"}]' \
    com.docker.extension.detailed-description="<h1>The Application Development Engine for Kubernetes</h1><h3>Tame your developer workflow to go from Code to URL in one step.</h3>Epinio installs into any Kubernetes cluster to bring your application from source code to deployment and allow for Developers and Operators to work better together!" \
    com.docker.extension.additional-urls='[{"title":"Documentation","url":"https://docs.epinio.io/"},{"title":"Issues","url":"https://github.com/epinio/epinio/issues"},{"title":"CLI","url":"https://github.com/epinio/epinio/releases"},{"title":"Slack","url":"https://rancher-users.slack.com/?redir=%2Fmessages%2Fepinio"}]' \
    com.docker.desktop.extension.api.version=">= 0.2.0"

# binaries, to be copied onto the host
COPY --from=downloader /darwin /darwin
COPY --from=downloader /linux /linux
# couldn't find helm binary for arm64, so always ship amd64 binaries
COPY --from=downloader-amd64 /windows /windows

# the extension, UI and such
COPY metadata.json .
COPY epinio.svg .
COPY --from=client-builder /ui/build ui
