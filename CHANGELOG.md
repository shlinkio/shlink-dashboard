# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org).

## [0.3.1] - 2026-08-07
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* Fix migrations in docker image by adding tsconfig.json file.


## [0.3.0] - 2026-08-07
### Added
* [shlink-web-component] Add support for Shlink 5.1.0, by supporting browser redirect conditions.

### Changed
* [#559](https://github.com/shlinkio/shlink-dashboard/issues/559) Run client tests in an actual browser with vitest browser mode.
* Migrate from ESLint to Oxlint and Oxfmt
* Update dependencies, including major version updates to React Router and MikroORM

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [shlink-web-component#1024](https://github.com/shlinkio/shlink-web-component/issues/1024) Fix incorrect colSpan calculated in visits table depending on what columns have been enabled.
* [shlink-web-component#982](https://github.com/shlinkio/shlink-web-component/issues/982) Fix ability to select any domain from the dropdown when creating a short URL, when the list of domains is long.
* [shlink-web-component#913](https://github.com/shlinkio/shlink-web-component/issues/913) Fix rendering of maps due to missing leaflet stylesheet import.


## [0.2.3] - 2026-02-04
### Added
* [shlink-web-component] Add support for Shlink 5.0.0, by supporting date-based redirect conditions.

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*


## [0.2.2] - 2026-01-17
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#841](https://github.com/shlinkio/shlink-dashboard/issues/841) Fix 500 error when creating new servers.


## [0.2.1] - 2026-01-16
### Added
* *Nothing*

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#838](https://github.com/shlinkio/shlink-dashboard/issues/838) Fix domains page erroring out if any of the domains is not reachable when checking its status.


## [0.2.0] - 2025-12-12
### Added
* [shlink-web-component#839](https://github.com/shlinkio/shlink-web-component/issues/839) Allow filtering short URLs by excluded tags when using Shlink >=4.6.0
* [shlink-web-component#838](https://github.com/shlinkio/shlink-web-component/issues/838) Allow filtering tag, orphan and non-orphan visits by domain, when using Shlink >=4.6.0
* [shlink-web-component#784](https://github.com/shlinkio/shlink-web-component/issues/784) Add optional `long-url` query parameter to short URL creation to prefill the long URL programmatically.
* [#679](https://github.com/shlinkio/shlink-dashboard/issues/679) Add footer with the version of the dashboard and selected server (if any).

### Changed
* [#675](https://github.com/shlinkio/shlink-dashboard/issues/675) Vertically center home and login page content.

### Deprecated
* *Nothing*

### Removed
* Drop support for Shlink older than 4.0.0

### Fixed
* *Nothing*


## [0.1.2] - 2025-09-16
### Added
* *Nothing*

### Changed
* [#558](https://github.com/shlinkio/shlink-dashboard/issues/558) Migrated away from `useLoaderData` hook in route components, and use `loaderData` prop instead.

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [#726](https://github.com/shlinkio/shlink-dashboard/issues/726) Fix tini downloaded with the wrong architecture in the ARM docker image.


## [0.1.1] - 2025-08-08
### Added
* [#663](https://github.com/shlinkio/shlink-dashboard/issues/663) Add new `SHLINK_DASHBOARD_DB_USE_ENCRYPTION` env var to allow enabling encrypted database connections
* [shlink-web-component#755](https://github.com/shlinkio/shlink-web-component/issues/755) Add support for `any-value-query-param` and `valueless-query-param` redirect conditions when using Shlink >=4.5.0.
* [shlink-web-component#756](https://github.com/shlinkio/shlink-web-component/issues/756) Add support for desktop device types on device redirect conditions, when using Shlink >=4.5.0.
* [shlink-web-component#657](https://github.com/shlinkio/shlink-web-component/issues/657) Allow visits table columns to be customized via settings, and add a new optional "Region" column.

  As a side effect, the "Show user agent" toggle has been removed from the list, as this can now be globally configured in the settings.

### Changed
* Update to FontAwesome 7
* Update to Recharts 3
* Update to `@shlinkio/shlink-web-component` 0.16.1

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* [shlink-web-component#698](https://github.com/shlinkio/shlink-web-component/issues/698) Fix line chart selection triggering after clicking a dot in the chart. It now works only when dragging while the mouse is clicked.


## [0.1.0] - 2025-06-22
### Added
* First release

### Changed
* *Nothing*

### Deprecated
* *Nothing*

### Removed
* *Nothing*

### Fixed
* *Nothing*
