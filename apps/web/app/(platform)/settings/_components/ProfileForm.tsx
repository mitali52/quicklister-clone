'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileSchema, type UpdateProfile } from '@/lib/schemas/profile.schemas';
import { FormField } from '@/components/ui/FormField';
import { ApiError } from '@/lib/api/client';
import { useUpdateProfile } from '../_hooks/useProfile';
import { type UserProfile } from '@/lib/api/users.api';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: Readonly<ProfileFormProps>) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfile>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? '',
      addressLine1: profile.addressLine1 ?? '',
      addressLine2: profile.addressLine2 ?? '',
      city: profile.city ?? '',
      county: profile.county ?? '',
      postcode: profile.postcode ?? '',
    },
  });

  // Sync form when profile is refetched after a successful update
  useEffect(() => {
    reset({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? '',
      addressLine1: profile.addressLine1 ?? '',
      addressLine2: profile.addressLine2 ?? '',
      city: profile.city ?? '',
      county: profile.county ?? '',
      postcode: profile.postcode ?? '',
    });
  }, [profile, reset]);

  async function onSubmit(data: UpdateProfile) {
    // Normalise empty strings to undefined so the API uses COALESCE fallback
    await updateProfile.mutateAsync({
      fullName: data.fullName === '' ? undefined : data.fullName,
      phoneNumber: data.phoneNumber === '' ? undefined : data.phoneNumber,
      addressLine1: data.addressLine1 === '' ? undefined : data.addressLine1,
      addressLine2: data.addressLine2 === '' ? undefined : data.addressLine2,
      city: data.city === '' ? undefined : data.city,
      county: data.county === '' ? undefined : data.county,
      postcode: data.postcode === '' ? undefined : data.postcode,
    });
  }

  const apiErrorMessage =
    updateProfile.error instanceof ApiError ? updateProfile.error.message : null;
  const serverError =
    updateProfile.isError && apiErrorMessage === null
      ? 'Something went wrong. Please try again.'
      : apiErrorMessage;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Read-only email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Email address</label>
        <div className="flex items-center gap-2">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 flex-1">
            {profile.email}
          </p>
          {profile.emailVerified && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>

        <FormField
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="07700 900000"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />

        <div className="sm:col-span-2">
          <FormField
            label="Address line 1"
            type="text"
            autoComplete="address-line1"
            placeholder="12 Example Street"
            error={errors.addressLine1?.message}
            {...register('addressLine1')}
          />
        </div>

        <div className="sm:col-span-2">
          <FormField
            label="Address line 2"
            type="text"
            autoComplete="address-line2"
            placeholder="Flat 3 (optional)"
            error={errors.addressLine2?.message}
            {...register('addressLine2')}
          />
        </div>

        <FormField
          label="City"
          type="text"
          autoComplete="address-level2"
          placeholder="London"
          error={errors.city?.message}
          {...register('city')}
        />

        <FormField
          label="County"
          type="text"
          autoComplete="address-level1"
          placeholder="Greater London"
          error={errors.county?.message}
          {...register('county')}
        />

        <FormField
          label="Postcode"
          type="text"
          autoComplete="postal-code"
          placeholder="SW1A 1AA"
          error={errors.postcode?.message}
          {...register('postcode')}
        />
      </div>

      {serverError !== null && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}

      {updateProfile.isSuccess && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          Profile updated successfully.
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty || updateProfile.isPending}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors',
            isSubmitting || !isDirty || updateProfile.isPending
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-700 hover:bg-blue-800',
          )}
        >
          {isSubmitting || updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
