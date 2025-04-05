import { Button, Card, CloseButton, SearchInput, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Server } from '../../entities/Server';

export type MinimalServer = Pick<Server, 'id' | 'name' | 'baseUrl'>;

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
    (serverId: string) => setServersList((prev) => prev.filter((s) => s.id !== serverId)),
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
                key={serverFromList.id}
                type="button"
                className="tw:px-2 tw:py-1 tw:text-left tw:truncate"
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
        {orderedServers.map(({ name, id, baseUrl }) => (
          <Table.Row key={id}>
            <Table.Cell className="tw:font-bold">{name}</Table.Cell>
            <Table.Cell>{baseUrl}</Table.Cell>
            <Table.Cell>
              <div className="tw:text-danger tw:flex tw:flex-row-reverse" title="Remove server">
                <CloseButton onClick={() => removeServer(id)} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </div>
  );
};
