FROM mcr.microsoft.com/playwright:v1.62.0-noble

ENV TINI_VERSION v0.19.0

# Install python build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 python3-dev python3-venv build-essential pkg-config libsqlite3-dev curl \
  && ln -s /usr/bin/python3 /usr/bin/python || true \
  && rm -rf /var/lib/apt/lists/*

# Install tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /sbin/tini
RUN chmod +x /sbin/tini
# Set tini as the entry point, as node does not properly handle signals
ENTRYPOINT ["/sbin/tini", "--"]
