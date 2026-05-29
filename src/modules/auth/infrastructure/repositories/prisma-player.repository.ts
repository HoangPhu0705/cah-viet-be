import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import {
  IPlayerRepository,
  CreatePlayerData,
} from '../../domain/repositories/player.repository.interface';
import { Player } from '../../domain/entities/player.entity';

@Injectable()
export class PrismaPlayerRepository extends IPlayerRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { email } });
  }

  async create(data: CreatePlayerData): Promise<Player> {
    return this.prisma.player.create({ data });
  }
}
