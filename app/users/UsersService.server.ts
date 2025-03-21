import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { generatePassword, hashPassword, verifyPassword } from '../auth/passwords.server';
import type { User } from '../entities/User';
import { DuplicatedEntryError } from '../validation/DuplicatedEntryError.server';
import { validateFormDataSchema } from '../validation/validator.server';
import { USER_CREATION_SCHEMA } from './user-schemas.server';
import type { FindAndCountUsersOptions, UsersRepository } from './UsersRepository.server';

export type UserOrderableFields = keyof Omit<User, 'id' | 'password'>;

export type ListUsersOptions = Pick<FindAndCountUsersOptions, 'orderBy' | 'searchTerm'> & {
  page?: number;
};

export type UsersList = {
  users: User[];
  totalUsers: number;
  totalPages: number;
};

export class UsersService {
  readonly #usersRepository: UsersRepository;

  constructor(usersListRepository: UsersRepository) {
    this.#usersRepository = usersListRepository;
  }

  async getUserByCredentials(username: string, password: string): Promise<User> {
    const user = await this.#usersRepository.findOneByUsername(username);
    if (!user) {
      throw new Error(`User not found with username ${username}`);
    }

    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error(`Incorrect password for user ${username}`);
    }

    return user;
  }

  async listUsers({ page = 1, ...rest }: ListUsersOptions): Promise<UsersList> {
    const positivePage = Math.max(1, page);
    const limit = 20;
    const offset = (positivePage - 1) * limit;

    const [users, totalUsers] = await this.#usersRepository.findAndCountUsers({
      limit,
      offset,
      ...rest,
    });

    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  async createUser(data: FormData): Promise<[User, string]> {
    const userData = validateFormDataSchema(USER_CREATION_SCHEMA, data);
    const plainTextTempPassword = generatePassword();
    const password = await hashPassword(plainTextTempPassword);

    try {
      const user = await this.#usersRepository.createUser({ ...userData, password });
      return [user, plainTextTempPassword];
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new DuplicatedEntryError('username');
      }

      throw e;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await this.#usersRepository.deleteUser(userId);
  }
}
