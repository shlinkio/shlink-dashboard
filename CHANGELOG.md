# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]
### Added
- *Nothing*

### Changed
- [#558](https://github.com/shlinkio/shlink-dashboard/issues/558) Migrated away from `useLoaderData` hook in route components, and use `loaderData` prop instead.

### Deprecated
- *Nothing*

### Removed
- *Nothing*

### Fixed
- *Nothing*


## [0.1.1] - 2025-08-08
### Added
- [#663](https://github.com/shlinkio/shlink-dashboard/issues/663) Add new `SHLINK_DASHBOARD_DB_USE_ENCRYPTION` env var to allow enabling encrypted database connections
- [shlink-web-component#755](https://github.com/shlinkio/shlink-web-component/issues/755) Add support for `any-value-query-param` and `valueless-query-param` redirect conditions when using Shlink >=4.5.0.
- [shlink-web-component#756](https://github.com/shlinkio/shlink-web-component/issues/756) Add support for desktop device types on device redirect conditions, when using Shlink >=4.5.0.
- [shlink-web-component#657](https://github.com/shlinkio/shlink-web-component/issues/657) Allow visits table columns to be customized via settings, and add a new optional "Region" column.

  As a side effect, the "Show user agent" toggle has been removed from the list, as this can now be globally configured in the settings.

### Changed
- Update to FontAwesome 7
- Update to Recharts 3
- Update to `@shlinkio/shlink-web-component` 0.16.1

### Deprecated
- *Nothing*

### Removed
- *Nothing*

### Fixed
- [shlink-web-component#698](https://github.com/shlinkio/shlink-web-component/issues/698) Fix line chart selection triggering after clicking a dot in the chart. It now works only when dragging while the mouse is clicked.


## [0.1.0] - 2025-06-22
### Added
- First release

### Changed
- *Nothing*

### Deprecated
- *Nothing*

### Removed
- *Nothing*

### Fixed
- *Nothing*
