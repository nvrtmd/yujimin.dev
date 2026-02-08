import { guestbookFormSchema } from './guestbook';

describe('guestbookFormSchema', () => {
  it('[nickname] should reject empty nickname', () => {
    // Arrange
    const data = { nickname: '', message: 'Hello' };

    // Act
    const result = guestbookFormSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Nickname requires at least 1 character.',
    );
  });

  it.each([
    [
      'nickname',
      { nickname: 'A'.repeat(51), message: 'Hi' },
      'Nickname must be less than 50 characters.',
    ],
    [
      'location',
      { nickname: 'User', location: 'A'.repeat(51), message: 'Hi' },
      'Location must be less than 50 characters.',
    ],
  ])('[%s] should reject exceeding max length', (_, data, expectedMsg) => {
    // Arrange & Act
    const result = guestbookFormSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(expectedMsg);
  });

  it('[website] should reject invalid URL', () => {
    // Arrange
    const data = { nickname: 'User', website: 'not-a-url', message: 'Hi' };

    // Act
    const result = guestbookFormSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Please enter a valid URL.');
  });

  it('[website] should accept empty string as optional', () => {
    // Arrange
    const data = { nickname: 'User', website: '', message: 'Hi' };

    // Act
    const result = guestbookFormSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.website).toBe('');
  });

  it('[message] should reject whitespace-only message', () => {
    // Arrange
    const data = { nickname: 'User', message: '     ' };

    // Act
    const result = guestbookFormSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Message requires at least 1 character.',
    );
  });

  it('[success] should validate form with required fields only', () => {
    // Arrange
    const data = { nickname: 'User', message: 'Hello' };

    // Act
    const result = guestbookFormSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.nickname).toBe('User');
    expect(result.data?.message).toBe('Hello');
    expect(result.data?.location).toBeUndefined();
    expect(result.data?.website).toBeUndefined();
  });
});
