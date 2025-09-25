import { User } from './user.entity';

describe('User Entity', () => {
  it('should create an User Instance', async () => {
    const user = new User();

    expect(user).toBeInstanceOf(User);
  });

  it('should clear email before insert', async () => {
    const user = new User();
    user.email = 'Email@Gmail.Com';
    user.checkFieldsBeforeInsert();

    expect(user.email).toBe('Email@Gmail.Com'.toLowerCase());
  });

  it('should clear email before update', async () => {
    const user = new User();
    user.email = 'Test@Gmail.Com';
    user.checkFieldsBeforeUpdate();
    expect(user.email).toBe('Test@Gmail.Com'.toLowerCase());
  });
});
