import { AppException } from '../../../../common/exceptions/app.exception';

export class EmailAlreadyInUseException extends AppException {
  constructor() {
    super('Email already in use', 'EMAIL_ALREADY_IN_USE');
  }
}

export class InvalidCredentialsException extends AppException {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS');
  }
}

export class InvalidTokenException extends AppException {
  constructor(reason = 'Invalid token') {
    super(reason, 'INVALID_TOKEN');
  }
}

export class GuestSessionExpiredException extends AppException {
  constructor() {
    super('Guest session expired', 'GUEST_SESSION_EXPIRED');
  }
}
