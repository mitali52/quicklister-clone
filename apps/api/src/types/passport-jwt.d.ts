import type { Request } from 'express';

declare module 'passport-jwt' {
  export interface StrategyOptions {
    jwtFromRequest: (request: Request | null) => string | null;
    secretOrKey: string | Buffer;
    algorithms?: string[];
    ignoreExpiration?: boolean;
  }

  export class Strategy {
    constructor(
      options: StrategyOptions,
      verify?: (...args: unknown[]) => unknown,
    );
  }
}
