import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { META_ROLES, RoleProtected } from './role-protected.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn().mockImplementation((key, value) => ({
    key,
    value,
  })),
}));

describe('RoleProtected decorator', () => {
  it('should set metadata with the correct roles', async () => {
    const roles = [ValidRoles.admin, ValidRoles.user];

    const result = RoleProtected(...roles);

    expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);
    expect(result).toEqual({
      key: META_ROLES,
      value: roles,
    });
  });
});
