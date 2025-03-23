import clsx from 'clsx';
import type { FC, HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';

export type SectionType = 'head' | 'body' | 'footer';

const TableSectionContext = createContext<{ section: SectionType } | undefined>(undefined);

export type TableElementProps = PropsWithChildren & {
  className?: string;
};

const TableHead: FC<TableElementProps> = ({ children, className }) => (
  <TableSectionContext.Provider value={{ section: 'head' }}>
    <thead className={clsx('tw:hidden tw:lg:table-header-group', className)}>{children}</thead>
  </TableSectionContext.Provider>
);

const TableBody: FC<TableElementProps> = ({ children, className }) => (
  <TableSectionContext.Provider value={{ section: 'body' }}>
    <tbody className={clsx('tw:lg:table-row-group tw:flex tw:flex-col tw:gap-y-3', className)}>{children}</tbody>
  </TableSectionContext.Provider>
);

const TableFooter: FC<TableElementProps> = ({ children, className }) => (
  <TableSectionContext.Provider value={{ section: 'footer' }}>
    <tfoot className={className}>{children}</tfoot>
  </TableSectionContext.Provider>
);

const Row: FC<HTMLProps<HTMLTableRowElement>> = ({ children, className, ...rest }) => {
  const sectionContext = useContext(TableSectionContext);
  return (
    <tr
      className={clsx(
        'tw:group',
        'tw:lg:table-row tw:flex tw:flex-col',
        'tw:lg:border-0 tw:border-y-2 tw:border-(--border-color)',
        {
          'tw:hover:bg-(--secondary-color)': sectionContext?.section === 'body',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
};

const Cell: FC<HTMLProps<HTMLTableCellElement>> = ({ children, className, ...rest }) => {
  const sectionContext = useContext(TableSectionContext);
  const Tag = sectionContext?.section === 'head' ? 'th' : 'td';

  return (
    <Tag
      className={clsx(
        'tw:p-2 tw:block tw:lg:table-cell tw:border-b-1 tw:border-(--border-color)',
        {
          // For md and lower, display the content in data-column attribute as before
          'tw:before:lg:hidden tw:before:content-[attr(data-column)] tw:before:font-bold tw:before:mr-1': Tag === 'td',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export type TableProps = HTMLProps<HTMLTableElement> & {
  header: ReactNode;
  footer?: ReactNode;
};

const BaseTable: FC<TableProps> = ({ header, footer, children, ...rest }) => {
  return (
    <table className="tw:w-full" {...rest}>
      <TableHead>
        {header}
      </TableHead>
      <TableBody>
        {children}
      </TableBody>
      {footer && (
        <TableFooter>
          {footer}
        </TableFooter>
      )}
    </table>
  );
};

export const Table = Object.assign(BaseTable, { Row, Cell });
