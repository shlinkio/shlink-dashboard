import { faSearch as searchIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useTimeout } from './use-timeout';

export type SearchInputProps = {
  onChange: (searchTerm: string) => void;
  borderless?: boolean;
  defaultValue?: string;
  containerClassName?: string;
  inputClassName?: string;
};

export const SearchInput: FC<SearchInputProps> = ({
  onChange,
  borderless = false,
  defaultValue,
  containerClassName,
  inputClassName,
}) => {
  const { setTimeout, clearCurrentTimeout } = useTimeout(500);
  const searchTermChanged = useCallback((newSearchTerm: string) => {
    if (!newSearchTerm) {
      // When setting an empty value, do it immediately
      clearCurrentTimeout();
      onChange(newSearchTerm);
    } else {
      setTimeout(() => onChange(newSearchTerm));
    }
  }, [clearCurrentTimeout, onChange, setTimeout]);

  return (
    <div className={clsx('tw:relative tw:focus-within:z-10', containerClassName)}>
      <FontAwesomeIcon icon={searchIcon} className="tw:absolute tw:top-[50%] tw:translate-y-[-50%] tw:left-3" />
      <input
        type="search"
        className={clsx(
          'tw:w-full tw:bg-(--primary-color) tw:pl-9 tw:pr-3 tw:py-2',
          'tw:outline-none tw:focus-visible:ring-3 tw:focus-visible:ring-shlink-brand/75',
          {
            'tw:rounded-md tw:border tw:border-(--input-border-color)': !borderless,
          },
          inputClassName,
        )}
        placeholder="Search..."
        onChange={(e) => searchTermChanged(e.target.value)}
        defaultValue={defaultValue}
      />
    </div>
  );
};
