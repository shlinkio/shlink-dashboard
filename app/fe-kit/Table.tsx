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
    <thead className={className}>{children}</thead>
  </TableSectionContext.Provider>
);

const TableBody: FC<TableElementProps> = ({ children, className }) => (
  <TableSectionContext.Provider value={{ section: 'body' }}>
    <tbody className={className}>{children}</tbody>
  </TableSectionContext.Provider>
);

const Row: FC<HTMLProps<HTMLTableRowElement>> = ({ children, className, ...rest }) => {
  const sectionContext = useContext(TableSectionContext);
  return (
    <tr
      className={clsx('tw:group',
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
        'tw:p-2 tw:border-(--border-color)!',
        {
          // For non-header cells, add a bottom border only when not part of the last row
          'tw:group-[&:not(:last-child)]:border-b-1!': Tag === 'td',
          'tw:border-b-1!': Tag === 'th',
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
};

const BaseTable: FC<TableProps> = ({ header, children, ...rest }) => {
  return (
    <table className="tw:w-full" {...rest}>
      <TableHead>
        {header}
      </TableHead>
      <TableBody>
        {children}
      </TableBody>
    </table>
  );
};

export const Table = Object.assign(BaseTable, { Row, Cell });
