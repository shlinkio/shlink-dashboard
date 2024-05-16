import { createSessionStorage } from '../../app/auth/session.server';

describe('createSessionStorage', () => {
  it('creates a session storage', () => {
    const storage = createSessionStorage();

    expect(storage.destroySession).toEqual(expect.any(Function));
    expect(storage.commitSession).toEqual(expect.any(Function));
    expect(storage.getSession).toEqual(expect.any(Function));
  });
});
