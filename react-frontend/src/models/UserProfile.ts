export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid';
export type PlanTier = 'free' | 'basic' | 'premium';

export interface UserProfile {
    id?: number;
    keycloaksubject: string;
    roninWalletAddress: string;
    verified: boolean;
    verifiedTime: Date;
    preferredUsername: string;
    givenName: string;
    emailVerified: boolean;
    familyName: string;
    email: string;
    name: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: Date;
    planTier?: string;
    gptAPIQuota?: number;
    gptAPIQuotaRemaining?: number;
  }
  