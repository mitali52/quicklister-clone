export interface JwtPayload {
  sub: string;       // user.id
  email: string;
  roleId: string;
  roleName: string;
  tokenType: 'access' | 'refresh';
  jti?: string;
  familyId?: string;
  iat?: number;
  exp?: number;
}
