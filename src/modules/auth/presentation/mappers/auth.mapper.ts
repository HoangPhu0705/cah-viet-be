import { Injectable } from '@nestjs/common';
import { Player } from '../../domain/entities/player.entity';
import { PlayerResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthMapper {
  toPlayerResponseDto(player: Player): PlayerResponseDto {
    const dto = new PlayerResponseDto();
    dto.id = player.id;
    dto.nickname = player.nickname;
    dto.avatarId = player.avatarId;
    dto.isGuest = player.isGuest;
    dto.email = player.email;
    return dto;
  }
}
