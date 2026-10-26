import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type Service = Tables<'services'>;

// Presets are seeded by migration and rarely change, so cache them for the session.
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });
}
