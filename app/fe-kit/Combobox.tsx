import type { SearchInputProps } from '@shlinkio/shlink-frontend-kit/tailwind';
import { SearchInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useCallback, useId, useRef } from 'react';
import { Listbox } from './Listbox';

type BaseInputProps = Omit<
  SearchInputProps,
  'role' | 'aria-autocomplete' | 'aria-expanded' | 'aria-controls' | 'onChange'
>;

export type ComboboxProps<Item> = BaseInputProps & {
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

  listboxSpan?: 'auto' | 'full';
};

export function Combobox<Item>({
  searchResults,
  onSearch,
  onSelectSearchResult,
  renderSearchResult,
  size = 'md',
  listboxSpan = 'full',
  ...rest
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
        onChange={onSearch}
        size={size}
        ref={searchInputRef as any}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={!!searchResults}
        aria-controls={listboxId}
        {...rest}
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
