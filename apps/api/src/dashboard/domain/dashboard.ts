import type { User } from '../../users/domain/user';
import type { Listing } from '../../listings/domain/listing';

export interface ListingStats {
  totalListings: number;
  draftListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
}

export interface UserDashboard {
  profile: User;
  stats: ListingStats;
  recentListings: Listing[];
  unreadNotifications: number;
}
