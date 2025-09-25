import exp from 'constants';
import { ValidRoles } from './valid-roles';

describe('Valid roles enum', () => {
  it('should have correct values', async () => {
    const roles = { admin: 'admin', superUser: 'super-user', user: 'user' };

    expect(ValidRoles).toEqual(roles);
  });

  it('should contain all expected keys', async () => {
    const keysTohave = ['admin', 'super-user', 'user'];

    expect(Object.values(ValidRoles)).toEqual(
      expect.arrayContaining(keysTohave),
    );
  });
});
