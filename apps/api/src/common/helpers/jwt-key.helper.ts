export function decodeJwtKey(rawValue: string | undefined): string {
  const value = rawValue?.trim();
  if (!value) return '';

  if (value.includes('BEGIN')) {
    return value;
  }

  try {
    return Buffer.from(value, 'base64').toString('utf8');
  } catch {
    return value;
  }
}
