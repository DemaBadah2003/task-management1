/**
 * Exact request body expected by POST .
 */
export interface SignUpRequest {
  email: string;
  password: string;
  data: {
    name: string;
    job_title?: string;
  };
}

export interface SignUpSuccessResponse {
  id: string;
  email: string;
}

/**
 * Exact request body expected by POST /auth/v1/token?grant_type=password.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
  };
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  error_description?: string;
}

