import type { EntitySchemaColumnOptions } from 'typeorm';

export type Base = {
  id: number;
};

export const BaseColumnSchema: Record<keyof Base, EntitySchemaColumnOptions> = {
  id: {
    type: Number,
    primary: true,
    generated: true,
  },
};
