import { useProfile } from '@/hooks/useProfile';
import { todayIn } from '@/lib/dates';

// Today's date in the user's timezone (profile default Africa/Nairobi).
export function useToday(): string {
  const { data: profile } = useProfile();
  return todayIn(profile?.timezone);
}
