import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

describe('UserRole Guard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('should return true if not roles are provided', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext)).toBeTruthy();
  });

  it('should return true if roles length is 0', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue([]);

    expect(guard.canActivate(mockContext)).toBeTruthy();
  });

  it('should throw BadRequestException if user is no found in the request', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({});

    expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    expect(() => guard.canActivate(mockContext)).toThrow('User not found');
  });

  it('should return true if user has a valid role', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user: { roles: ['admin'], fullName: 'John Doe' },
    });

    expect(guard.canActivate(mockContext)).toBeTruthy();
  });

  it('should throw ForbiddenException if user lacks required role', async () => {
    const user = { roles: ['user'], fullName: 'Jane Doe' };
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    jest.spyOn(mockContext.switchToHttp(), 'getRequest').mockReturnValue({
      user,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      `User Jane Doe need a valid role: [admin]`,
    );
  });
});
