import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class GuestLoginDto {
  @ApiProperty({ example: 'Phu' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname!: string;

  @ApiProperty({ example: 'avatar_1' })
  @IsString()
  avatarId!: string;
}
