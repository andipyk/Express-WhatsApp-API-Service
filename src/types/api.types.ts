// Base Response Types
export interface BaseResponse {
  status: 'success' | 'error';
  message?: string;
}

export interface SuccessResponse<T> extends BaseResponse {
  status: 'success';
  data?: T;
}

export interface ErrorResponse extends BaseResponse {
  status: 'error';
  message: string;
  code?: number;
}

// Helper function to create consistent responses
export const createSuccessResponse = <T>(data?: T, message?: string): SuccessResponse<T> => ({
  status: 'success',
  ...(data && { data }),
  ...(message && { message }),
});

export const createErrorResponse = (message: string, code?: number): ErrorResponse => ({
  status: 'error',
  message,
  ...(code && { code }),
}); 