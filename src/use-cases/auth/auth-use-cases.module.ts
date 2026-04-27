import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { GuestLoginUseCase } from './guest-login.use-case';
import { RegisterUseCase } from './register.use-case';
import { LoginUseCase } from './login.use-case';
import { AuthFactoryService } from './auth-factory.service';

@Module({
  imports: [
    InfrastructureModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    GuestLoginUseCase,
    RegisterUseCase,
    LoginUseCase,
    AuthFactoryService,
  ],
  exports: [
    JwtModule,
    PassportModule,
    GuestLoginUseCase,
    RegisterUseCase,
    LoginUseCase,
  ],
})
export class AuthUseCasesModule {}
