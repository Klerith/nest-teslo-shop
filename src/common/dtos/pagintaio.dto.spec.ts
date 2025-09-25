import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { isIn, validate } from 'class-validator';

describe('PaginationDto', () => {
  it('should work with default values', async () => {
    const dto = plainToClass(PaginationDto, {});

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate limis as a positive number', async () => {
    const dto = plainToClass(PaginationDto, { limit: -5 });

    const errors = await validate(dto);
    const limitError = errors.find((error) => error.property === 'limit');

    expect(limitError).toBeDefined();
    expect(limitError.constraints).toEqual({
      isPositive: 'limit must be a positive number',
    });
  });

  it('should validate offset as a non-negative number', async () => {
    const dto = plainToClass(PaginationDto, { offset: -1 });

    const errors = await validate(dto);
    const offsetError = errors.find((error) => error.property === 'offset');

    expect(offsetError).toBeDefined();
    expect(offsetError.constraints).toEqual({
      min: 'offset must not be less than 0',
    });
  });

  it('should allow allow optional gender field with valid values', async () => {
    const validGenders = ['men', 'women', 'unisex', 'kid'];

    validGenders.forEach(async (gender) => {
      const dto = plainToClass(PaginationDto, { gender });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  it('should throw an error for invalid gender values', async () => {
    const dto = plainToClass(PaginationDto, {
      gender: 'invalid',
    });

    const errors = await validate(dto);
    const genderError = errors.find((error) => error.property === 'gender');

    expect(genderError).toBeDefined();
    expect(genderError.constraints).toEqual({
      isIn: 'gender must be one of the following values: men, women, unisex, kid',
    });
  });
});
