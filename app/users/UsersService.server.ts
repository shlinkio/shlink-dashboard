import type { EntityManager } from '@mikro-orm/core';
import { verifyPassword } from '../auth/passwords.server';
import type { User } from '../entities/User';
import { User as UserEntity } from '../entities/User';

export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async getUserByCredentials(username: string, password: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { username });
    if (!user) {
      throw new Error(`User not found with username ${username}`);
    }

    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error(`Incorrect password for user ${username}`);
    }

    return user;
  }
}
