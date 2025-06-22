# Shlink Dashboard

[![Build Status](https://img.shields.io/github/actions/workflow/status/shlinkio/shlink-dashboard/ci.yml?branch=develop&logo=github&style=flat-square)](https://github.com/shlinkio/shlink-dashboard/actions/workflows/ci.yml?query=workflow%3A%22Continuous+integration%22)
[![Code Coverage](https://img.shields.io/codecov/c/gh/shlinkio/shlink-dashboard/develop?style=flat-square)](https://app.codecov.io/gh/shlinkio/shlink-dashboard)
[![GitHub release](https://img.shields.io/github/release/shlinkio/shlink-dashboard.svg?style=flat-square)](https://github.com/shlinkio/shlink-dashboard/releases/latest)
[![Docker pulls](https://img.shields.io/docker/pulls/shlinkio/shlink-dashboard.svg?logo=docker&style=flat-square)](https://hub.docker.com/r/shlinkio/shlink-dashboard/)
[![GitHub license](https://img.shields.io/github/license/shlinkio/shlink-dashboard.svg?style=flat-square)](https://github.com/shlinkio/shlink-dashboard/blob/main/LICENSE)

[![Mastodon](https://img.shields.io/mastodon/follow/109329425426175098?color=%236364ff&domain=https%3A%2F%2Ffosstodon.org&label=follow&logo=mastodon&logoColor=white&style=flat-square)](https://fosstodon.org/@shlinkio)
[![Bluesky](https://img.shields.io/badge/follow-shlinkio-0285FF.svg?style=flat-square&logo=bluesky&logoColor=white)](https://bsky.app/profile/shlink.io)
[![Paypal Donate](https://img.shields.io/badge/Donate-paypal-blue.svg?style=flat-square&logo=paypal&colorA=cccccc)](https://slnk.to/donate)

Shlink Dashboard is the next generation web application for Shlink.

It allows you to configure your users and their permissions, and then define how those users can interact with every individual Shlink server.

https://github.com/user-attachments/assets/7473fc22-d3c3-4236-b88a-4bf218e1b018

## Capabilities

Shlink Dashboard provides all the capabilities from [shlink-web-client](https://github.com/shlinkio/shlink-web-client?tab=readme-ov-file#shlink-web-client), but with the next differences:

- User authentication is supported, with three main roles:
  - Advanced users: they can set up and manage their own Shlink servers.
  - Managed users: they can log in and interact with a set pf pre-configured Shlink servers.
  - Admins: they can create other users of any role, manage their own Shlink servers, and configure servers for managed users.
- All settings are saved on a per-user basis in the server. If they log in a different device, they will have access to the same settings.
- Server info (including API keys) is saved server-side and never leaked to the browser, making it more secure. Interactions with the Shlink server are proxied through Shlink Dashboard's backend, so you can even hide all `/rest` endpoints from your server/s.
- Storage of servers and settings is done in a database. Same database engines supported by Shlink can be used with Shlink Dashboard (except SQLite), so you can re-use the same database server if desired.
- Since Shlink Dashboard requires a backend, no hosted version is provided. It needs to be self-hosted.

## Installation

The easiest way to use Shlink Dashboard is by using the official docker image, but it is also possible to download a dist file and place it in the server of your choice with Node.JS >=22.0.

### Docker image

If you want to deploy shlink-web-client in a container-based cluster (kubernetes, docker swarm, etc), just pick the [shlinkio/shlink-dashboard](https://hub.docker.com/r/shlinkio/shlink-dashboard/) image and do it.

It runs Node.JS server in port 3000, but this can be configured.

### Dist file

To self-host Shlink Dashboard in any kind of server running Node.JS, get the [latest release](https://github.com/shlinkio/shlink-dashboard/releases/latest) and download the distributable zip file attached to it (`shlink-dashboard_X.X.X_dist.zip`).

Unzip that file wherever you want and then:

1. Copy the uncompressed directory in the location of your choice, then `cd` into it.
2. Run migrations: `node --run migration:run`
3. Start the server: `node ./server.js`

> [!IMPORTANT]
> The commands above need to have access to the configuration env vars. See the section below to know what can be configured.

## Configuration

Configuration is provided via env vars. These are the ones currently supported:

1. Database
    - `SHLINK_DASHBOARD_DB_DRIVER`: The database driver to be used. Can be `postgres`, `mysql`, `mariadb` or `mssql`.
    - `SHLINK_DASHBOARD_DB_HOST`: The database server host name.
    - `SHLINK_DASHBOARD_DB_PORT`: The database server port. If not provided it defaults to the usual database engine default port:
        - `mysql` and `mariadb`: 3306,
        - `postgres`: 5432,
        - `mssql`: 1433,
    - `SHLINK_DASHBOARD_DB_USER`: Username credential for the database server connection.
    - `SHLINK_DASHBOARD_DB_PASSWORD`: Password credential for the database server connection.
    - `SHLINK_DASHBOARD_DB_NAME`: Database name. Defaults to `shlink_dashboard`.
2. Other
    - `SHLINK_DASHBOARD_SESSION_SECRETS`: A comma separated list of secrets used to sign session tokens. Make sure to provide something as complex and hard to guess as possible. Ideally long auto-generated random strings.

