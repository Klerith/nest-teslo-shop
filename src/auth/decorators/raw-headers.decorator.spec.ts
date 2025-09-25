import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRawHeaders } from './raw-headers.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('RawHeaders decorators', () => {
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        rawHeaders: [
          'Authorization',
          'bearer token',
          'Content-Type',
          'application/json',
        ],
      }),
    }),
  } as unknown as ExecutionContext;

  it('should return the raw headers from the request', async () => {
    const result = getRawHeaders(null, mockExecutionContext);

    expect(result).toEqual(
      expect.objectContaining([
        'Authorization',
        'bearer token',
        'Content-Type',
        'application/json',
      ]),
    );
  });

  it('should call createParamDecorator with getRawHeaders', async () => {
    expect(createParamDecorator).toHaveBeenCalledWith(getRawHeaders);
  });
});
