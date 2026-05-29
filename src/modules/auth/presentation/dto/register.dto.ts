import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'phu@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Phu' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname!: string;

  @ApiProperty({ example: 'avatar_1' })
  @IsString()
  avatarId!: string;
}
