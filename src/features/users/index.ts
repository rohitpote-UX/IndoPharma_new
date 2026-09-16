/**
 * ==============================================================================
 * INDOPHARM — USERS DOMAIN SLICE
 * ==============================================================================
 */

import { UserRole } from '@/types';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  twoFactorEnabled: boolean;
}
