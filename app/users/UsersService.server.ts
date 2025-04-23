import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { generatePassword, hashPassword, verifyPassword } from '../auth/passwords.server';
import { paginationToLimitAndOffset } from '../db/utils.server';
import type { User } from '../entities/User';
import { formDataToRecord } from '../utils/form.server';
import { DuplicatedEntryError } from '../validation/DuplicatedEntryError.server';
import { NotFoundError } from '../validation/NotFoundError.server';
import { validateFormDataSchema, validateSchema } from '../validation/validator.server';
import { IncorrectPasswordError } from './IncorrectPasswordError.server';
import { CHANGE_PASSWORD_ACTION, PROFILE_ACTION } from './user-profile-actions';
import type { ChangePasswordData, EditUserData } from './user-schemas.server';
import { CHANGE_PASSWORD_SCHEMA, CREATE_USER_SCHEMA, EDIT_USER_SCHEMA } from './user-schemas.server';
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
    const user = await this.#usersRepository.findOne({ username });
    if (!user) {
      throw new NotFoundError(`User not found with username ${username}`);
    }

    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new IncorrectPasswordError(username);
    }

    return user;
  }

  async getUserById(publicId: string): Promise<User> {
    const user = await this.#usersRepository.findOne({ publicId });
    if (!user) {
      throw new NotFoundError(`User not found with public id ${publicId}`);
    }

    return user;
  }

  async listUsers({ page = 1, ...rest }: ListUsersOptions): Promise<UsersList> {
    const { limit, offset } = paginationToLimitAndOffset(page, 20);
    const [users, totalUsers] = await this.#usersRepository.findAndCountUsers({ limit, offset, ...rest });

    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  async createUser(data: FormData): Promise<[User, string]> {
    const userData = validateFormDataSchema(CREATE_USER_SCHEMA, data);
    const [password, plainTextPassword] = await this.#generatePassword();

    try {
      const user = await this.#usersRepository.createUser({ ...userData, password });
      return [user, plainTextPassword];
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new DuplicatedEntryError('username');
      }

      throw e;
    }
  }

  async editUser(publicId: string, data: FormData): Promise<User> {
    const userData = validateFormDataSchema(EDIT_USER_SCHEMA, data);
    return this.#editUserData(publicId, userData);
  }

  async editUserProfile(publicId: string, formData: FormData): Promise<User> {
    const { action, ...data } = formDataToRecord(formData);
    switch (action) {
      case PROFILE_ACTION:
        return this.#editUserData(publicId, validateSchema(EDIT_USER_SCHEMA, { displayName: data.displayName }));
      case CHANGE_PASSWORD_ACTION:
        return this.#editUserPassword(publicId, validateSchema(CHANGE_PASSWORD_SCHEMA, data));
    }

    throw new Error(`Invalid action ${action}`);
  }

  async #editUserData(publicId: string,  { displayName, role }: EditUserData): Promise<User> {
    const user = await this.getUserById(publicId);

    if (displayName !== undefined) {
      user.displayName = displayName;
    }
    if (role) {
      user.role = role;
    }

    await this.#usersRepository.flush();

    return user;
  }

  async #editUserPassword(publicId: string, passwords: ChangePasswordData): Promise<User> {
    if (passwords.newPassword !== passwords.repeatPassword) {
      // TODO Throw
    }

    const user = await this.getUserById(publicId);
    const currentPasswordMatches = await verifyPassword(passwords.currentPassword, user.password);
    if (!currentPasswordMatches) {
      // TODO Throw
    }

    user.password = await hashPassword(passwords.newPassword);
    await this.#usersRepository.flush();

    return user;
  }

  async resetUserPassword(publicId: string): Promise<[User, string]> {
    const user = await this.getUserById(publicId);
    const [password, plainTextPassword] = await this.#generatePassword();

    user.password = password;
    await this.#usersRepository.flush();

    return [user, plainTextPassword];
  }

  async #generatePassword(): Promise<[string, string]> {
    const plainTextPassword = generatePassword();
    const password = await hashPassword(plainTextPassword);

    return [password, plainTextPassword];
  }

  async deleteUser(publicId: string): Promise<void> {
    await this.#usersRepository.nativeDelete({ publicId });
  }
}
