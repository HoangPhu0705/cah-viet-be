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
