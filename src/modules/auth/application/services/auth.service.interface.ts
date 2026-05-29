import { GuestLoginDto } from '../../presentation/dto/guest-login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { LoginDto } from '../../presentation/dto/login.dto';
import { AuthResponseDto } from '../../presentation/dto/auth-response.dto';

export abstract class IAuthService {
  abstract guestLogin(dto: GuestLoginDto): Promise<AuthResponseDto>;
  abstract register(dto: RegisterDto): Promise<AuthResponseDto>;
  abstract login(dto: LoginDto): Promise<AuthResponseDto>;
}
