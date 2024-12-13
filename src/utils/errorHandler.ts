import { PostgrestError } from '@supabase/supabase-js';

export class TradeImportError extends Error {
  constructor(
    message: string,
    public readonly row?: number,
    public readonly column?: string
  ) {
    super(message);
    this.name = 'TradeImportError';
  }
}

export function handleDatabaseError(error: PostgrestError) {
  // Map database errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'A trade with this information already exists',
    '23503': 'Referenced portfolio does not exist',
    '23514': 'Invalid trade data provided'
  };

  return errorMessages[error.code] || 'An unexpected error occurred';
} 