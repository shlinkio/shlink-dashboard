FROM node:24.10-slim AS builder
ARG VERSION="latest"
ENV VERSION=${VERSION}

COPY . /shlink-dashboard
WORKDIR /shlink-dashboard
# Install dev dependencies and build project
RUN npm ci && node --run build


FROM node:24.10-slim
ARG UID=101
ARG VERSION="latest"
ENV VERSION=${VERSION}
LABEL maintainer="Alejandro Celaya <alejandro@alejandrocelaya.com>"
ENV NODE_ENV="production"

# This is set by Docker BuildKit based on the value passed to `--platform`
ARG TARGETARCH
ENV TINI_NAME="tini-${TARGETARCH}"
ENV TINI_VERSION="v0.19.0"

USER root
COPY --from=builder /shlink-dashboard/build /shlink-dashboard
COPY package.json /shlink-dashboard/package.json
COPY package-lock.json /shlink-dashboard/package-lock.json
COPY LICENSE /shlink-dashboard/LICENSE
COPY README.md /shlink-dashboard/README.md

WORKDIR /shlink-dashboard
RUN npm ci --omit dev && npm cache clean --force
RUN mkdir data && chown $UID:0 data

# Install tini
ADD --chmod=755 https://github.com/krallin/tini/releases/download/${TINI_VERSION}/${TINI_NAME} /sbin/tini

# Expose default port
EXPOSE 3005

COPY docker/docker-entrypoint.sh docker-entrypoint.sh

# Switch to non-privileged UID as the last step
USER $UID

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
