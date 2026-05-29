export class Player {
  constructor(
    public readonly id: string,
    public nickname: string,
    public avatarId: string,
    public isGuest: boolean,
    public email: string | null,
    public passwordHash: string | null,
    public readonly createdAt: Date,
  ) {}
}
