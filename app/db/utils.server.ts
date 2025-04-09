import type { ObjectQuery } from '@mikro-orm/core';
import type { BaseEntity } from '../entities/Base';

export type ExpandSearchTermOptions<T extends BaseEntity> = {
  searchableFields: Array<keyof T>;
  baseFilter?: ObjectQuery<T>;
};

export function expandSearchTerm<T extends BaseEntity>(
  searchTerm: string | undefined,
  { searchableFields, baseFilter = {} }: ExpandSearchTermOptions<T>,
):  ObjectQuery<T> {
  if (!searchTerm) {
    return baseFilter;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  return {
    ...baseFilter,
    $or: searchableFields.flatMap((field) => [
      {
        [field]: {
          $like: `%${lowerSearchTerm}%`,
        },
      },
      {
        [field]: {
          $like: `%${searchTerm}%`,
        },
      },
    ]),
  };
}

export type LimitAndOffset = {
  limit?: number;
  offset?: number;
};

export function paginationToLimitAndOffset(page: number, itemsPerPage: number): Required<LimitAndOffset>;
export function paginationToLimitAndOffset(page: number, itemsPerPage?: number): LimitAndOffset;
export function paginationToLimitAndOffset(page: number, itemsPerPage?: number): LimitAndOffset {
  if (!itemsPerPage) {
    return {};
  }

  const positivePage = Math.max(1, page);
  const offset = (positivePage - 1) * itemsPerPage;
  return {
    limit: itemsPerPage,
    offset,
  };
}
