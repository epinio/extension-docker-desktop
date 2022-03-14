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

# TODO multi-arch build
FROM alpine as downloader
ARG HELM_VERSION=3.7.2
ARG HELM_CHECKSUM_LINUX_AMD64=4ae30e48966aba5f807a4e140dad6736ee1a392940101e4d79ffb4ee86200a9e
ARG HELM_CHECKSUM_DARWIN_ARM64=260d4b8bffcebc6562ea344dfe88efe252cf9511dd6da3cccebf783773d42aec
ARG HELM_CHECKSUM_DARWIN_AMD64=5a0738afb1e194853aab00258453be8624e0a1d34fcc3c779989ac8dbcd59436
ARG HELM_CHECKSUM_WINDOWS=299165f0af46bece9a61b41305cca8e8d5ec5319a4b694589cd71e6b75aca77e

RUN apk add --no-cache wget coreutils unzip

RUN wget https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_LINUX_AMD64} helm-v${HELM_VERSION}-linux-amd64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-linux-amd64.tar.gz linux-amd64/helm && \
    chmod +x /linux-amd64/helm
RUN wget https://get.helm.sh/helm-v${HELM_VERSION}-darwin-arm64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_DARWIN_ARM64} helm-v${HELM_VERSION}-darwin-arm64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-darwin-arm64.tar.gz darwin-arm64/helm && \
    chmod +x /darwin-arm64/helm
RUN wget https://get.helm.sh/helm-v${HELM_VERSION}-darwin-amd64.tar.gz && \
    sh -c 'echo "${HELM_CHECKSUM_DARWIN_AMD64} helm-v${HELM_VERSION}-darwin-amd64.tar.gz" | sha256sum -w -c' && \
    tar xfz helm-v${HELM_VERSION}-darwin-amd64.tar.gz darwin-amd64/helm && \
    chmod +x /darwin-amd64/helm
RUN wget https://get.helm.sh/helm-v${HELM_VERSION}-windows-amd64.zip && \
    sh -c 'echo "${HELM_CHECKSUM_WINDOWS} helm-v${HELM_VERSION}-windows-amd64.zip" | sha256sum -w -c' && \
    unzip helm-v${HELM_VERSION}-windows-amd64.zip

FROM alpine
LABEL org.opencontainers.image.title="epinio-docker" \
    org.opencontainers.image.description="Epinio" \
    org.opencontainers.image.vendor="SUSE" \
    com.docker.desktop.extension.api.version=">= 0.2.0"

# binaries, to be copied onto the host
COPY --from=downloader /linux-amd64 /linux-amd64
COPY --from=downloader /darwin-amd64 /darwin-amd64
COPY --from=downloader /darwin-arm64 /darwin-arm64
COPY --from=downloader /windows-amd64/helm.exe /windows-amd64/

# the extension, UI and such
COPY metadata.json .
COPY epinio.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/extension-epinio-docker.sock
