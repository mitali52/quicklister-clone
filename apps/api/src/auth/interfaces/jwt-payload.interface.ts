export interface JwtPayload {
  sub: string;       // user.id
  email: string;
  roleId: string;
  roleName: string;
  iat?: number;
  exp?: number;
}
