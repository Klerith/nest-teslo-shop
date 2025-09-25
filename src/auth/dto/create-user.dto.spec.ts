import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDTO', () => {
  it('should have the correct properties', async () => {
    const createUserDto = new CreateUserDto();

    createUserDto.email = 'e@e.com';
    createUserDto.password = 'Password123';
    createUserDto.fullName = 'John Doe';

    const errors = await validate(createUserDto);

    expect(errors.length).toBe(0);
  });

  it('should throw errors if password is not valid', async () => {
    const createUserDto = new CreateUserDto();

    createUserDto.email = 'e@e.com';
    createUserDto.password = 'password'; // Invalid password
    createUserDto.fullName = 'John Doe';

    const errors = await validate(createUserDto);
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
