import type { CardProps } from '@shlinkio/shlink-frontend-kit/tailwind';
import { Card } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { ReactNode, RefObject } from 'react';
import { useEffect, useMemo , useState } from 'react';

export type ListboxProps<Item> = Omit<CardProps, 'id' | 'role' | 'aria-orientation'> & {
  /** List of items in the listbox */
  items: Map<string, Item>;
  /** Invoked when the active item is selected via click or `Enter` */
  onSelectItem: (item: Item) => void;
  /** To customize the shape of an item */
  renderItem: (item: Item) => ReactNode;
  /** Ref to the element to which this listbox is anchored */
  anchor: RefObject<HTMLElement>;
  /** Used to link with the element controlling this listbox */
  id: string;

  /**
   * Message to display when the list of items is empty.
   * Defaults to 'No items'.
   */
  noItemsMessage?: string;
};

export function Listbox<Item>(
  { id, items, onSelectItem, renderItem, className, noItemsMessage = 'No items', anchor, ...rest }: ListboxProps<Item>,
) {
  const [activeItem, setActiveItem] = useState(0);

  useEffect(() => {
    const anchorEl = anchor.current;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveItem((prev) => Math.min(prev + 1, items.size - 1));
      } else if (e.key === 'ArrowUp') {
        setActiveItem((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        onSelectItem([...items.values()][activeItem]);
      }
    };

    anchorEl?.addEventListener('keydown', handler);
    return () => anchorEl?.removeEventListener('keydown', handler);
  }, [activeItem, anchor, items, onSelectItem]);

  return (
    <Card
      id={id}
      className={clsx(
        'tw:absolute tw:top-full tw:mt-1 tw:z-10',
        'tw:py-1 tw:flex tw:flex-col',
        className,
      )}
      role="listbox"
      aria-orientation="vertical"
      {...rest}
    >
      {items.size === 0 && <i className="tw:px-2 tw:py-1">{noItemsMessage}</i>}
      {[...items.entries()].map(([key, item], index) => (
        <button
          key={key}
          type="button"
          role="option"
          aria-selected={index === activeItem}
          className={clsx(
            'tw:px-2 tw:py-1 tw:text-left tw:truncate',
            { 'tw:bg-lm-secondary tw:dark:bg-dm-secondary': index === activeItem },
          )}
          tabIndex={-1}
          onClick={() => onSelectItem(item)}
          // We are setting tabIndex -1 so that this element cannot be focused
          // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
          onMouseOver={() => setActiveItem(index)}
        >
          {renderItem(item)}
        </button>
      ))}
    </Card>
  );
}
