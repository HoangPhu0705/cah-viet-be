import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IAuthService } from '../../application/services/auth.service.interface';
import { GuestLoginDto } from '../dto/guest-login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../../shared/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @Post('guest')
  @ApiOperation({ summary: 'Login as guest' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  loginAsGuest(@Body() dto: GuestLoginDto): Promise<AuthResponseDto> {
    return this.authService.guestLogin(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new player' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current player' })
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
