FROM node:23.11-slim AS builder
ARG VERSION="latest"
ENV VERSION=${VERSION}

COPY . /shlink-dashboard
WORKDIR /shlink-dashboard
# Install dev dependencies and build project
RUN npm ci && node --run build


FROM node:23.11-slim
ARG UID=101
ARG VERSION="latest"
ENV VERSION=${VERSION}
LABEL maintainer="Alejandro Celaya <alejandro@alejandrocelaya.com>"
ENV NODE_ENV="production"

USER root
COPY --from=builder /shlink-dashboard/build /shlink-dashboard
COPY package.json /shlink-dashboard/package.json
COPY package-lock.json /shlink-dashboard/package-lock.json
COPY LICENSE /shlink-dashboard/LICENSE
COPY README.md /shlink-dashboard/README.md

WORKDIR /shlink-dashboard
RUN npm ci --omit dev && npm cache clean --force
RUN mkdir data && chown $UID:0 data

# Expose default port
EXPOSE 3005

# Switch to non-privileged UID as the last step
USER $UID

ENTRYPOINT ["node", "./server.js"]
