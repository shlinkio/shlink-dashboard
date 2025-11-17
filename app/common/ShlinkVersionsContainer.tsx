import { clsx } from 'clsx';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';

const SHLINK_DASHBOARD_VERSION = '%_VERSION_%';

type SemVer = `${bigint}.${bigint}.${bigint}`;

const versionIsValidSemVer = (version: string): version is SemVer => /^v?\d+\.\d+\.\d+$/.test(version);

const versionToPrintable = (version: string) => (!versionIsValidSemVer(version) ? version : `v${version}`);

const versionToSemVer = (version: string): SemVer | 'latest' => (versionIsValidSemVer(version) ? version : 'latest');

const normalizeVersion = (version: string) => versionToPrintable(versionToSemVer(version));

const VersionLink = ({ project, version }: { project: 'shlink' | 'shlink-dashboard'; version: string }) => (
  <ExternalLink href={`https://github.com/shlinkio/${project}/releases/${version}`} className="text-gray-500">
    <b>{version}</b>
  </ExternalLink>
);

export type ShlinkVersionsContainerProps = {
  dashboardVersion?: string;
  serverVersion?: string;
};

export const ShlinkVersionsContainer: FC<ShlinkVersionsContainerProps> = ({
  dashboardVersion = SHLINK_DASHBOARD_VERSION,
  serverVersion,
}) => (
  <small className={clsx('text-center text-gray-500 p-4', { 'md:ml-(--aside-menu-width)': serverVersion })}>
    <span>Dashboard: <VersionLink project="shlink-dashboard" version={normalizeVersion(dashboardVersion)} /></span>
    {serverVersion && (
      <span> - Server: <VersionLink project="shlink" version={normalizeVersion(serverVersion)} /></span>
    )}
  </small>
);
