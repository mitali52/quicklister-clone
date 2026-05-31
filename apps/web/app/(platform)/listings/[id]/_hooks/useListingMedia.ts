'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListingMediaApi,
  uploadListingMediaApi,
  reorderListingMediaApi,
  deleteListingMediaApi,
  type ListingMedia,
  type ReorderMediaItem,
} from '@/lib/api/listing-media.api';

export function useListingMedia(listingId: string) {
  return useQuery({
    queryKey: ['listings', listingId, 'media'],
    queryFn: () => getListingMediaApi(listingId),
  });
}

export function useUploadListingMedia(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadListingMediaApi(listingId, file),
    onSuccess: (newMedia) => {
      queryClient.setQueryData<ListingMedia[]>(
        ['listings', listingId, 'media'],
        (prev) => (prev ? [...prev, newMedia] : [newMedia]),
      );
    },
  });
}

export function useReorderListingMedia(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderMediaItem[]) => reorderListingMediaApi(listingId, items),
    onSuccess: (reordered) => {
      queryClient.setQueryData<ListingMedia[]>(['listings', listingId, 'media'], reordered);
    },
  });
}

export function useDeleteListingMedia(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => deleteListingMediaApi(listingId, mediaId),
    onSuccess: (_data, mediaId) => {
      queryClient.setQueryData<ListingMedia[]>(
        ['listings', listingId, 'media'],
        (prev) => (prev ? prev.filter((m) => m.id !== mediaId) : []),
      );
    },
  });
}
