import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));

describe('GetUser decorator', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: {
          id: '123',
          name: 'Test User',
        },
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return user from the request', async () => {
    expect(getUser(null, mockExecutionContext)).toEqual({
      id: '123',
      name: 'Test User',
    });
  });

  it('should return the user name from the request', async () => {
    expect(getUser('name', mockExecutionContext)).toEqual('Test User');
  });

  it('should throw error if user not in the request', async () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => getUser(null, mockExecutionContext)).toThrow(
      InternalServerErrorException,
    );
    expect(() => getUser(null, mockExecutionContext)).toThrow(
      'User not found (request)',
    );
  });
});
