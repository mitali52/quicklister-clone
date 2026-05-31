'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getMyOrganizationsApi,
  getOrganizationApi,
  createOrganizationApi,
  updateOrganizationApi,
  deleteOrganizationApi,
  type CreateOrganizationData,
  type UpdateOrganizationData,
} from '@/lib/api/organizations.api';

const MY_ORGS_KEY = ['organizations', 'me'] as const;
const orgKey = (id: string) => ['organizations', id] as const;

export function useMyOrganizations(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...MY_ORGS_KEY, page, limit],
    queryFn: () => getMyOrganizationsApi(page, limit),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: orgKey(id),
    queryFn: () => getOrganizationApi(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateOrganizationData) => createOrganizationApi(data),
    onSuccess: (org) => {
      void queryClient.invalidateQueries({ queryKey: MY_ORGS_KEY });
      router.push(`/organizations/${org.id}`);
    },
  });
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationData) => updateOrganizationApi(id, data),
    onSuccess: (org) => {
      queryClient.setQueryData(orgKey(id), org);
      void queryClient.invalidateQueries({ queryKey: MY_ORGS_KEY });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteOrganizationApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_ORGS_KEY });
      router.push('/organizations');
    },
  });
}
