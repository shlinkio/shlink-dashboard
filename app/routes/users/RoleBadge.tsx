import clsx from 'clsx';
import type { FC } from 'react';
import type { Role } from '../../entities/User';

export type RoleBadgeProps = {
  role: Role;
};

export const RoleBadge: FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div
      className={clsx(
        'tw:rounded-sm tw:px-1 tw:inline-block tw:font-bold tw:whitespace-nowrap',
        {
          'tw:bg-green-600 tw:text-white': role === 'admin',
          'tw:bg-gray-500 tw:text-white': role !== 'admin',
        },
      )}
    >
      {role.replaceAll('-', ' ')}
    </div>
  );
};
