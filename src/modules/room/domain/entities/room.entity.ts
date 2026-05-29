export type RoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export class Room {
  constructor(
    public readonly id: string,
    public code: string,
    public hostId: string,
    public status: RoomStatus,
    public settings: Record<string, unknown>,
    public readonly createdAt: Date,
  ) {}
}
