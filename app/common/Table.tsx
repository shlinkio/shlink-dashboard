import clsx from 'clsx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
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

const Row: FC<TableElementProps> = ({ children, className }) => {
  const sectionContext = useContext(TableSectionContext);
  return (
    <tr
      className={clsx(
        {
          'tw:hover:bg-(--secondary-color)': sectionContext?.section === 'body',
        },
        className,
      )}
    >
      {children}
    </tr>
  );
};

export type CellProps = TableElementProps & {
  sectionType?: SectionType;
};

const Cell: FC<CellProps> = ({ children, className, sectionType }) => {
  const sectionContext = useContext(TableSectionContext);
  const Tag = (sectionType ?? sectionContext?.section) === 'head' ? 'th' : 'td';

  return (
    <Tag className={clsx('tw:p-2 tw:border-b-1', className)}>
      {children}
    </Tag>
  );
};

export type TableProps = PropsWithChildren & {
  header: ReactNode;
};

const BaseTable: FC<TableProps> = ({ header, children }) => {
  return (
    <table className="tw:w-full">
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
