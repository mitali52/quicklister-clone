'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/schemas/auth.schemas';
import {
  getMyListingsApi,
  getListingApi,
  getPendingReviewListingsApi,
  getAllListingsApi,
  createListingApi,
  updateListingApi,
  submitListingForReviewApi,
  publishListingApi,
  archiveListingApi,
  deleteListingApi,
  type CreateListingData,
  type UpdateListingData,
} from '@/lib/api/listings.api';

const MY_LISTINGS_KEY = ['listings', 'me'] as const;
const PENDING_REVIEW_KEY = ['listings', 'pending-review'] as const;
const ALL_LISTINGS_KEY = ['listings', 'all'] as const;
const listingKey = (id: string) => ['listings', id] as const;

function isStaff(roleName: AuthUser['roleName'] | undefined): boolean {
  return roleName === 'moderator' || roleName === 'admin';
}

export function useMyListings(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...MY_LISTINGS_KEY, page, limit],
    queryFn: () => getMyListingsApi(page, limit),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: listingKey(id),
    queryFn: () => getListingApi(id),
  });
}

export function usePendingReviewListings(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...PENDING_REVIEW_KEY, page, limit],
    queryFn: () => getPendingReviewListingsApi(page, limit),
  });
}

export function useAllListings(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...ALL_LISTINGS_KEY, page, limit],
    queryFn: () => getAllListingsApi(page, limit),
  });
}

export function useListingDirectory(roleName: AuthUser['roleName'] | undefined, page = 1, limit = 20) {
  const staffView = isStaff(roleName);

  return useQuery({
    queryKey: [...(staffView ? ALL_LISTINGS_KEY : MY_LISTINGS_KEY), page, limit],
    queryFn: () => (staffView ? getAllListingsApi(page, limit) : getMyListingsApi(page, limit)),
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateListingData) => createListingApi(data),
    onSuccess: (listing) => {
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
      router.push(`/listings/${listing.id}`);
    },
  });
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateListingData) => updateListingApi(id, data),
    onSuccess: (listing) => {
      queryClient.setQueryData(listingKey(id), listing);
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
    },
  });
}

export function useSubmitForReview(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitListingForReviewApi(id),
    onSuccess: (listing) => {
      queryClient.setQueryData(listingKey(id), listing);
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
    },
  });
}

export function usePublishListing(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishListingApi(id),
    onSuccess: (listing) => {
      queryClient.setQueryData(listingKey(id), listing);
      void queryClient.invalidateQueries({ queryKey: PENDING_REVIEW_KEY });
      void queryClient.invalidateQueries({ queryKey: ALL_LISTINGS_KEY });
    },
  });
}

export function useArchiveListing(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => archiveListingApi(id),
    onSuccess: (listing) => {
      queryClient.setQueryData(listingKey(id), listing);
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteListingApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
      router.push('/listings');
    },
  });
}
