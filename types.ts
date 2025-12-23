
export enum Role {
  CIVILIAN = 'Dân',
  SPY = 'Gián điệp',
  WHITE_HAT = 'Mũ Trắng'
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  keyword: string | null;
  hasViewed: boolean;
  joinedAt: number;
}

export interface GameConfig {
  civilianKeyword: string;
  spyKeyword: string;
  totalPlayers: number;
  spyCount: number;
  whiteHatCount: number;
  cloudUrl?: string; // Link Google Apps Script
}

export interface GameState {
  gameId: string;
  config: GameConfig;
  players: Player[];
  status: 'SETUP' | 'PLAYING';
}
