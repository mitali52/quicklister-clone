import { apiGet, apiPatch, apiDelete } from './client';

export interface UserProfile {
  id: string;
  roleId: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const getMyProfileApi = (): Promise<UserProfile> => apiGet<UserProfile>('/users/me');

export const updateMyProfileApi = (data: UpdateProfileData): Promise<UserProfile> =>
  apiPatch<UserProfile>('/users/me', data);

export const updateMyAvatarApi = (avatarUrl: string): Promise<UserProfile> =>
  apiPatch<UserProfile>('/users/me/avatar', { avatarUrl });

export const changeMyPasswordApi = (data: ChangePasswordData): Promise<void> =>
  apiPatch<void>('/users/me/password', data);

export const deleteMyAccountApi = (): Promise<void> => apiDelete<void>('/users/me');
