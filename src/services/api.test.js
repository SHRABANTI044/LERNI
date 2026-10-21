import { login, register } from './api';

describe('authentication API', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  const expectAuthenticationSession = async (authenticate, args) => {
    const account = {
      id: 'user-1',
      name: 'Taylor Learner',
      email: 'taylor@example.com',
    };
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'session-token', user: account }),
    });

    await authenticate(...args);

    expect(localStorage.getItem('token')).toBe('session-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(account);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  };

  test('registration stores the session for dashboard access', async () => {
    await expectAuthenticationSession(register, ['Taylor Learner', 'taylor@example.com', 'password123']);
  });

  test('sign-in stores the session for dashboard access', async () => {
    await expectAuthenticationSession(login, ['taylor@example.com', 'password123']);
  });
});
