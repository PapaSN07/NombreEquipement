export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  email: string;
}

export interface Utilisateur {
  id: number;
  email: string;
}
export interface Utilisateur {
  id: number;
  email: string;
  role: 'admin' | 'utilisateur';
  actif: boolean;
}
