export interface User {
  id: string;
  roleId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  county: string | null;
  postcode: string | null;
  emailVerified: boolean;
  nrlaMember: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserData {
  roleId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
}

export interface UpdateUserData {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
}
