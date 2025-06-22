import { clsx } from 'clsx';
import type { FC } from 'react';
import type { Role } from '../../entities/User';

export type RoleBadgeProps = {
  role: Role;
};

export const RoleBadge: FC<RoleBadgeProps> = ({ role }) => {
  return (
    <div
      className={clsx(
        'rounded-sm px-1 inline-block font-bold whitespace-nowrap',
        {
          'bg-green-600 text-white': role === 'admin',
          'bg-gray-500 text-white': role !== 'admin',
        },
      )}
    >
      {role.replaceAll('-', ' ')}
    </div>
  );
};
