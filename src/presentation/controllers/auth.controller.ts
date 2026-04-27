import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuestLoginUseCase } from '../../use-cases/auth/guest-login.use-case';
import { RegisterUseCase } from '../../use-cases/auth/register.use-case';
import { LoginUseCase } from '../../use-cases/auth/login.use-case';
import { GuestLoginDto } from '../../shared/dto/auth/guest-login.dto';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import { LoginDto } from '../../shared/dto/auth/login.dto';
import { AuthResponseDto } from '../../shared/dto/auth/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtPayload } from '../../shared/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly guestLoginUseCase: GuestLoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('guest')
  @ApiOperation({ summary: 'Login as guest' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  loginAsGuest(@Body() dto: GuestLoginDto): Promise<AuthResponseDto> {
    return this.guestLoginUseCase.execute(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new player' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current player' })
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
