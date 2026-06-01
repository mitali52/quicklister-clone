'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  getMyProfileApi,
  updateMyProfileApi,
  updateMyAvatarApi,
  changeMyPasswordApi,
  deleteMyAccountApi,
  type UpdateProfileData,
  type ChangePasswordData,
  type UserProfile,
} from '@/lib/api/users.api';

const PROFILE_KEY = ['user', 'me'] as const;

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: PROFILE_KEY,
    queryFn: getMyProfileApi,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateMyProfileApi(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatarUrl: string) => updateMyAvatarApi(avatarUrl),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => changeMyPasswordApi(data),
  });
}

export function useDeleteAccount() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return useMutation({
    mutationFn: deleteMyAccountApi,
    onSuccess: () => {
      clearAuth();
      router.replace('/login');
    },
  });
}
