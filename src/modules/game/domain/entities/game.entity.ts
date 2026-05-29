export type GameStatus = 'IN_PROGRESS' | 'FINISHED';

export class Game {
  constructor(
    public readonly id: string,
    public roomId: string,
    public round: number,
    public status: GameStatus,
    public readonly createdAt: Date,
  ) {}
}
