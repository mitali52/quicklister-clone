export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateOrganizationData {
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}
