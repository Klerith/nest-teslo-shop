import { JwtPayload } from './jwt-payload.interface';

describe('JWT Payload interface ', () => {
  it('should return true for a valid payload', async () => {
    const validPayload: JwtPayload = { id: '12345' };

    expect(validPayload.id).toBe('12345');
  });
});
