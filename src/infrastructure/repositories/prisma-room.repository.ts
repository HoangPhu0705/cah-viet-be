import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IRoomRepository, CreateRoomData, Room } from '../../core';

@Injectable()
export class PrismaRoomRepository extends IRoomRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: { id },
    }) as Promise<Room | null>;
  }

  async findByCode(code: string): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: { code },
    }) as Promise<Room | null>;
  }

  async create(data: CreateRoomData): Promise<Room> {
    return this.prisma.room.create({
      data: { ...data, settings: data.settings as object },
    }) as Promise<Room>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.room.delete({ where: { id } });
  }
}
