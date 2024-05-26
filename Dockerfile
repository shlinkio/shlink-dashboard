FROM node:22.2-alpine as builder
COPY . /shlink-dashboard
ARG VERSION="latest"
ENV VERSION ${VERSION}
# Install dev dependencies and build project
RUN cd /shlink-dashboard && npm ci && node --run build


FROM node:22.2-alpine
ARG UID=101
ARG VERSION="latest"
ENV VERSION ${VERSION}
LABEL maintainer="Alejandro Celaya <alejandro@alejandrocelaya.com>"
ENV NODE_ENV "production"

USER root
COPY --from=builder /shlink-dashboard/build /shlink-dashboard
COPY package.json /shlink-dashboard/package.json
COPY package-lock.json /shlink-dashboard/package-lock.json
COPY LICENSE /shlink-dashboard/LICENSE
COPY README.md /shlink-dashboard/README.md

WORKDIR /shlink-dashboard
RUN npm ci --omit dev
RUN mkdir data && chown $UID:0 data

# Expose default port
EXPOSE 3005

# Switch to non-privileged UID as the last step
USER $UID

ENTRYPOINT ["node", "./server.js"]
