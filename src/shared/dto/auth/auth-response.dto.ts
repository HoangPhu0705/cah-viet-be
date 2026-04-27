import { ApiProperty } from '@nestjs/swagger';

export class PlayerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty()
  avatarId!: string;

  @ApiProperty()
  isGuest!: boolean;

  @ApiProperty({ required: false, nullable: true })
  email?: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: () => PlayerResponseDto })
  player!: PlayerResponseDto;
}
