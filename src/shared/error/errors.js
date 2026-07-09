export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed or timed out.', details = null) {
    super(message, 'NETWORK_ERROR', 503, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation checks failed.', details = null) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication request failed.', code = 'AUTH_FAILED', details = null) {
    super(message, code, 401, details);
  }
}

export class FirestoreError extends AppError {
  constructor(message = 'Database operation failed.', code = 'FIRESTORE_ERROR', details = null) {
    super(message, code, 500, details);
  }
}

export class UnknownError extends AppError {
  constructor(message = 'An unexpected error occurred.', details = null) {
    super(message, 'UNKNOWN_ERROR', 500, details);
  }
}
