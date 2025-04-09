import { CloseButton, SearchCombobox, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { Server } from '../../entities/Server';

export type MinimalServer = Pick<Server, 'publicId' | 'name' | 'baseUrl'>;

export type UserServersProps = {
  initialServers: MinimalServer[];
  onSearch: (searchTerm: string) => void;
  searchResults?: MinimalServer[];
  loading: boolean;
};

export const UserServers: FC<UserServersProps> = ({ initialServers, onSearch, searchResults, loading }) => {
  const [serversList, setServersList] = useState(initialServers);
  const orderedServers = useMemo(() => [...serversList].sort((a, b) => a.name.localeCompare(b.name)), [serversList]);
  const removeServer = useCallback(
    (serverPublicId: string) => setServersList((prev) => prev.filter((s) => s.publicId !== serverPublicId)),
    [],
  );
  const addServer = useCallback((server: MinimalServer) => setServersList((prev) => {
    if (prev.some((s) => s.publicId === server.publicId)) {
      return prev;
    }

    return [...prev, server];
  }), []);
  const searchResultsMap = useMemo(
    () => searchResults ? new Map(searchResults.map((s) => [s.publicId, s])) : undefined,
    [searchResults],
  );

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      <SearchCombobox
        onSearch={onSearch}
        onSelectSearchResult={addServer}
        searchResults={searchResultsMap}
        renderSearchResult={(server) => <><b className="tw:mr-2">{server.name}</b> {server.baseUrl}</>}
        placeholder="Search servers to add..."
        aria-label="Search servers to add"
        loading={loading}
        onKeyDown={(e) => {
          // Avoid the form to be sent when pressing enter
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      />
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
              <div className="tw:text-danger tw:flex tw:flex-row-reverse" title={`Remove ${name}`}>
                <CloseButton label={`Remove ${name}`} onClick={() => removeServer(publicId)} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
      {orderedServers.map(({ publicId }) => <input key={publicId} type="hidden" name="servers" value={publicId} />)}
    </div>
  );
};
