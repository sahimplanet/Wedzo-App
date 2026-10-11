import React from 'react';
import { UserProfile } from '../types';

interface ReconciliationBannerProps {
  daysInactive?: number;
  user?: UserProfile;
  onOpenReconcileModal?: () => void;
}

// Upper banner emptied per user request
export const ReconciliationBanner: React.FC<ReconciliationBannerProps> = () => {
  return null;
};
