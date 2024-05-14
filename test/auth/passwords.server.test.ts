import { hashPassword, verifyPassword } from '../../app/auth/passwords.server';

describe('passwords', () => {
  it('can hash and then verify a password', async () => {
    const password1 = 'the_password';
    const password2 = 'P4SSW0RD';

    const [password1hash1, password1hash2, password2hash1, password2hash2] = await Promise.all([
      hashPassword(password1),
      hashPassword(password1),
      hashPassword(password2),
      hashPassword(password2),
    ]);

    const [validChecks, invalidChecks] = await Promise.all([
      Promise.all([
        verifyPassword(password1, password1hash1),
        verifyPassword(password1, password1hash2),
        verifyPassword(password2, password2hash1),
        verifyPassword(password2, password2hash2),
      ]),
      Promise.all([
        verifyPassword(password2, password1hash1),
        verifyPassword(password2, password1hash2),
        verifyPassword(password1, password2hash1),
        verifyPassword(password1, password2hash2),
      ]),
    ]);

    expect(validChecks.every((isValid) => isValid)).toEqual(true);
    expect(invalidChecks.every((isValid) => !isValid)).toEqual(true);
  });
});
