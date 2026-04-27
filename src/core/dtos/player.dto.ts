export interface CreatePlayerData {
  nickname: string;
  avatarId: string;
  isGuest: boolean;
  email?: string;
  passwordHash?: string;
}
