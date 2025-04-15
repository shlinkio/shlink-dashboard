import { EntityRepository } from '@mikro-orm/core';

export abstract class BaseEntityRepository<Entity extends object> extends EntityRepository<Entity> {
  async flush(): Promise<void> {
    await this.em.flush();
  }
}
