#################################
# Downloader for AMD64 binaries #
#################################
FROM alpine as downloader-amd64

RUN apk add --no-cache wget coreutils unzip

# https://github.com/helm/helm/releases
ARG HELM_VERSION=3.17.1

# https://get.helm.sh/helm-v3.17.1-darwin-amd64.tar.gz.sha256sum
ARG HELM_CHECKSUM_DARWIN_AMD64=aba59ba9511971a71943b5c76f15d52ace1681197bb3f71ed1f0b15caceacb2c
# https://get.helm.sh/helm-v3.17.1-linux-amd64.tar.gz.sha256sum
ARG HELM_CHECKSUM_LINUX_AMD64=3b66f3cd28409f29832b1b35b43d9922959a32d795003149707fea84cbcd4469
# https://get.helm.sh/helm-v3.17.1-windows-amd64.zip.sha256sum
ARG HELM_CHECKSUM_WINDOWS_AMD64=08281ee6d4d272835ff10c510b8b39736d112d9cb89dfbc853fe83913fbe48d0

# https://www.downloadkubernetes.com/
ARG KUBECTL_VERSION=1.29.5

# https://dl.k8s.io/v1.29.5/bin/darwin/amd64/kubectl.sha256
ARG KUBECTL_CHECKSUM_DARWIN_AMD64=395082ef84594ea4cb170d599056406ed2cf39555b53e92e0caee013c1ed5cdf
# https://dl.k8s.io/v1.29.5/bin/linux/amd64/kubectl.sha256
ARG KUBECTL_CHECKSUM_LINUX_AMD64=603c8681fc0d8609c851f9cc58bcf55eeb97e2934896e858d0232aa8d1138366
# https://dl.k8s.io/v1.29.5/bin/windows/amd64/kubectl.exe.sha256
ARG KUBECTL_CHECKSUM_WINDOWS_AMD64=8de419ccecdde90172345e7d12a63de42c217d28768d84c2398d932b44d73489

# https://github.com/epinio/epinio/releases
ARG EPINIO_VERSION=1.11.0

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
ARG HELM_VERSION=3.17.1

# https://get.helm.sh/helm-v3.17.1-darwin-arm64.tar.gz.sha256sum
ARG HELM_CHECKSUM_DARWIN_ARM64=b823a213d8d7937222becc63d9c7bb3d15a090e7ecd1f70f3a583ed39657e21b
# https://get.helm.sh/helm-v3.17.1-linux-arm64.tar.gz.sha256sum
ARG HELM_CHECKSUM_LINUX_ARM64=c86c9b23602d4abbfae39d9634e25ab1d0ea6c4c16c5b154113efe316a402547

# https://www.downloadkubernetes.com/
ARG KUBECTL_VERSION=1.29.5

# https://dl.k8s.io/v1.29.5/bin/darwin/arm64/kubectl.sha256
ARG KUBECTL_CHECKSUM_DARWIN_ARM64=23b09c126c0a0b71b58cc725a32cf84f1753242b3892dfd762511f2da6cce165
# https://dl.k8s.io/v1.29.5/bin/linux/arm64/kubectl.sha256
ARG KUBECTL_CHECKSUM_LINUX_ARM64=9ee9168def12ac6a6c0c6430e0f73175e756ed262db6040f8aa2121ad2c1f62e

# https://github.com/epinio/epinio/releases
ARG EPINIO_VERSION=1.11.0

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
#          Final image          #
#################################
FROM scratch

LABEL org.opencontainers.image.title="Epinio" \
    org.opencontainers.image.description="Push from source to Kubernetes in one step" \
    org.opencontainers.image.vendor="Epinio by Krumware and SUSE" \
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
