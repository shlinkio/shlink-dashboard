import { Card, CloseButton, SearchInput, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { FC } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Server } from '../../entities/Server';

export type MinimalServer = Pick<Server, 'publicId' | 'name' | 'baseUrl'>;

export type UserServersProps = {
  initialServers: MinimalServer[];
  onSearch: (searchTerm: string) => void;
  searchResults?: MinimalServer[];
};

export const UserServers: FC<UserServersProps> = ({ initialServers, onSearch, searchResults }) => {
  const searchInputRef = useRef<HTMLInputElement>();

  const [serversList, setServersList] = useState(initialServers);
  const orderedServers = useMemo(() => [...serversList].sort((a, b) => a.name.localeCompare(b.name)), [serversList]);
  const removeServer = useCallback(
    (serverPublicId: string) => setServersList((prev) => prev.filter((s) => s.publicId !== serverPublicId)),
    [],
  );
  const addServer = useCallback((server: MinimalServer) => {
    setServersList((prev) => [...prev, server]);
    onSearch('');
    searchInputRef.current!.value = '';
  }, [onSearch]);

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      <div className="tw:relative">
        <SearchInput
          size="md"
          onChange={onSearch}
          placeholder="Search servers to add..."
          ref={searchInputRef as any}
        />
        {searchResults && (
          <Card className="tw:absolute tw:top-full tw:min-w-60 tw:max-w-full tw:mt-1 tw:py-1 tw:flex tw:flex-col">
            {searchResults.length === 0 && (
              <i className="tw:px-2 tw:py-1">No servers found matching search</i>
            )}
            {searchResults.map((serverFromList) => (
              <button
                key={serverFromList.publicId}
                type="button"
                className={clsx(
                  'tw:px-2 tw:py-1 tw:text-left tw:truncate',
                  'tw:highlight:bg-lm-secondary tw:dark:highlight:bg-dm-secondary',
                )}
                tabIndex={-1}
                onClick={() => addServer(serverFromList)}
              >
                <b>{serverFromList.name}</b> ({serverFromList.baseUrl})
              </button>
            ))}
          </Card>
        )}
      </div>
      <Table header={(
        <Table.Row>
          <Table.Cell>Name</Table.Cell>
          <Table.Cell>Base URL</Table.Cell>
          <Table.Cell aria-hidden />
        </Table.Row>
      )}>
        {orderedServers.length === 0 && (
          <Table.Row>
            <Table.Cell colSpan={3} className="tw:text-center">This user has no servers</Table.Cell>
          </Table.Row>
        )}
        {orderedServers.map(({ name, publicId, baseUrl }) => (
          <Table.Row key={publicId}>
            <Table.Cell className="tw:font-bold">{name}</Table.Cell>
            <Table.Cell>{baseUrl}</Table.Cell>
            <Table.Cell>
              <div className="tw:text-danger tw:flex tw:flex-row-reverse" title="Remove server">
                <CloseButton onClick={() => removeServer(publicId)} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
      {orderedServers.map(({ publicId }) => <input key={publicId} type="hidden" name="servers" value={publicId} />)}
    </div>
  );
};
