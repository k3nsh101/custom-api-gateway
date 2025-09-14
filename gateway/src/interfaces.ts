export interface Route {
  path: string;
  upstream: string;
  protected: boolean;
}

export interface UserTokenBucket {
  tokens: number;
  last: number;
}
