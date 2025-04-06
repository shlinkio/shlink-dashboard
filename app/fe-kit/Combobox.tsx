import type { Size } from '@shlinkio/shlink-frontend-kit/tailwind';
import { Card, SearchInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useCallback, useId, useMemo , useRef, useState } from 'react';

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
  placeholder?: string;
};

export function Combobox<Item>({
  searchResults,
  onSearch,
  onSelectSearchResult,
  renderSearchResult,
  placeholder = 'Search items...',
  size = 'md',
}: ComboboxProps<Item>) {
  const searchInputRef = useRef<HTMLInputElement>();
  const listboxId = useId();

  const [activeSearchResult, setActiveSearchResult] = useState(0);
  const searchResultValues = useMemo(() => searchResults ? [...searchResults.values()] : undefined, [searchResults]);
  const updateSearchTerm = useCallback((searchTerm: string) => {
    onSearch(searchTerm);
    setActiveSearchResult(0);
  }, [onSearch]);
  const applySearchResult = useCallback((item: Item) => {
    onSelectSearchResult(item);
    onSearch('');
    searchInputRef.current!.value = '';
  }, [onSearch, onSelectSearchResult]);

  return (
    <div className="tw:relative">
      <SearchInput
        size={size}
        onChange={updateSearchTerm}
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

          if (!searchResultValues) {
            return;
          }

          if (e.key === 'ArrowDown') {
            setActiveSearchResult((prev) => Math.min(prev + 1, searchResultValues.length - 1));
          } else if (e.key === 'ArrowUp') {
            setActiveSearchResult((prev) => Math.max(prev - 1, 0));
          } else if (e.key === 'Enter') {
            applySearchResult(searchResultValues[activeSearchResult]);
          }
        }}
      />
      {searchResults && (
        <Card
          id={listboxId}
          className="tw:absolute tw:top-full tw:min-w-60 tw:max-w-full tw:mt-1 tw:py-1 tw:flex tw:flex-col"
          role="listbox"
          aria-orientation="vertical"
          aria-label="Matching items"
        >
          {searchResults.size === 0 && (
            <i className="tw:px-2 tw:py-1">No results found matching search</i>
          )}
          {[...searchResults.entries()].map(([key, searchResultItem], index) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={index === activeSearchResult}
              className={clsx(
                'tw:px-2 tw:py-1 tw:text-left tw:truncate',
                { 'tw:bg-lm-secondary tw:dark:bg-dm-secondary': index === activeSearchResult },
              )}
              tabIndex={-1}
              onClick={() => applySearchResult(searchResultItem)}
              // We are setting tabIndex -1 so that this element cannot be focused
              // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
              onMouseOver={() => setActiveSearchResult(index)}
            >
              {renderSearchResult(searchResultItem)}
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
