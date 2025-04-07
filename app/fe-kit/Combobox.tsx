import type { Size } from '@shlinkio/shlink-frontend-kit/tailwind';
import { SearchInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useCallback, useId, useRef } from 'react';
import { Listbox } from './Listbox';

export type ComboboxProps<Item> = {
  /** If not null, it will display a listbox with the results of last search. */
  searchResults?: Map<string, Item>;
  /** Invoked when the input value changes */
  onSearch: (searchTerm: string) => void;
  /** Invoked when the active item is selected */
  onSelectSearchResult: (item: Item) => void;
  /** To customize the shape of a search result */
  renderSearchResult: (item: Item) => ReactNode;
  /** TODO */
  loading?: boolean;

  size?: Size;
  listboxSpan?: 'auto' | 'full';
  placeholder?: string;
};

export function Combobox<Item>({
  searchResults,
  onSearch,
  onSelectSearchResult,
  renderSearchResult,
  placeholder = 'Search items...',
  size = 'md',
  listboxSpan = 'full',
}: ComboboxProps<Item>) {
  const searchInputRef = useRef<HTMLInputElement>();
  const listboxId = useId();

  const applySearchResult = useCallback((item: Item) => {
    onSelectSearchResult(item);
    onSearch('');
    searchInputRef.current!.value = '';
  }, [onSearch, onSelectSearchResult]);

  return (
    <div className="tw:relative">
      <SearchInput
        size={size}
        onChange={onSearch}
        placeholder={placeholder}
        ref={searchInputRef as any}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={!!searchResults}
        aria-controls={listboxId}
        onKeyDown={(e) => {
          // Avoid the form to be sent when pressing enter
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      />
      {searchResults && (
        <Listbox
          items={searchResults}
          anchor={searchInputRef as any}
          onSelectItem={applySearchResult}
          renderItem={renderSearchResult}
          id={listboxId}
          className={clsx({
            'tw:min-w-60 tw:max-w-full': listboxSpan === 'auto',
            'tw:w-full': listboxSpan === 'full',
          })}
          aria-label="Matching items"
          noItemsMessage="No results found matching search"
        />
      )}
    </div>
  );
}
