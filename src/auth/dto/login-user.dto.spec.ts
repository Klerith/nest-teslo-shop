import 'reflect-metadata';
import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { plainToClass } from 'class-transformer';

describe('LoginUserDto', () => {
  it('should have the correct properties', async () => {
    const loginUserDto = plainToClass(LoginUserDto, {
      email: 'e@e.com',
      password: 'Password123',
    });

    const errors = await validate(loginUserDto);

    expect(errors.length).toBe(0);
  });

  it('should throw errors if password is not valid', async () => {
    const loginUserDto = plainToClass(LoginUserDto, {
      email: 'e@e.com',
      password: 'password',
    });

    const errors = await validate(loginUserDto);
    const passwordErrors = errors.find(
      (error) => error.property === 'password',
    );
    const constraints = passwordErrors.constraints;

    expect(passwordErrors).toBeDefined();
    expect(passwordErrors.property).toBe('password');
    expect(constraints).toEqual({
      matches:
        'The password must have a Uppercase, lowercase letter and a number',
    });
  });
});
