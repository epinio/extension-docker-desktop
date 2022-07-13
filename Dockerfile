FROM node:14.17-alpine3.13 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine as downloader-amd64
RUN apk add --no-cache wget coreutils unzip
# https://github.com/helm/helm/releases
ARG HELM_VERSION=3.7.2
# https://www.downloadkubernetes.com/
ARG KUBECTL_VERSION=1.23.4
# https://get.helm.sh/helm-v3.8.1-darwin-amd64.tar.gz.sha256sum
ARG HELM_CHECKSUM_DARWIN_AMD64=5a0738afb1e194853aab00258453be8624e0a1d34fcc3c779989ac8dbcd59436
ARG HELM_CHECKSUM_LINUX_AMD64=4ae30e48966aba5f807a4e140dad6736ee1a392940101e4d79ffb4ee86200a9e
ARG HELM_CHECKSUM_WINDOWS_AMD64=299165f0af46bece9a61b41305cca8e8d5ec5319a4b694589cd71e6b75aca77e
# https://dl.k8s.io/v1.23.4/bin/linux/arm64/kubectl.sha256
ARG KUBECTL_CHECKSUM_DARWIN_AMD64=7bd22a5f9eec4a0d905ea00a20735d018e2c37977be2d8ec656fbbb631801492
ARG KUBECTL_CHECKSUM_LINUX_AMD64=3f0398d4c8a5ff633e09abd0764ed3b9091fafbe3044970108794b02731c72d6
ARG KUBECTL_CHECKSUM_WINDOWS_AMD64=2447e0af25842a1b546110e3beb76154998f660cf3d147314d9c7472b983fbcd
# https://github.com/epinio/epinio/releases
ARG EPINIO_VERSION=1.0.0

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

FROM alpine as downloader-arm64
RUN apk add --no-cache wget coreutils unzip
ARG HELM_VERSION=3.7.2
ARG KUBECTL_VERSION=1.23.4
ARG HELM_CHECKSUM_DARWIN_ARM64=260d4b8bffcebc6562ea344dfe88efe252cf9511dd6da3cccebf783773d42aec
ARG HELM_CHECKSUM_LINUX_ARM64=b0214eabbb64791f563bd222d17150ce39bf4e2f5de49f49fdb456ce9ae8162f
ARG KUBECTL_CHECKSUM_DARWIN_ARM64=f870cabdfd446b5217c1be255168edd99d8f015c974abe01f7b80a4e0ca11b2b
ARG KUBECTL_CHECKSUM_LINUX_ARM64=aa45dba48791eeb78a994a2723c462d155af4e39fdcfbcb39ce9c96f604a967a
ARG EPINIO_VERSION=1.0.0

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
