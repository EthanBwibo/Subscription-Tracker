import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { TablesInsert } from '@/types/database';

export type SubscriptionInput = Omit<TablesInsert<'subscriptions'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Includes the preset's logo and cancel link for display.
const SELECT = '*, service:services(logo_url, cancel_url)';

function useUserId() {
  return useAuth().session?.user.id;
}

export function useSubscriptions() {
  const userId = useUserId();

  return useQuery({
    queryKey: ['subscriptions', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select(SELECT).order('next_billing_date');
      if (error) throw error;
      return data;
    },
  });
}

export type SubscriptionWithService = NonNullable<ReturnType<typeof useSubscriptions>['data']>[number];

export function useSubscription(id: string | undefined) {
  const userId = useUserId();

  return useQuery({
    queryKey: ['subscriptions', userId, id],
    enabled: !!userId && !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select(SELECT).eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });
}

// Inserts when id is undefined, otherwise updates. Returns the saved row's id.
export function useSaveSubscription(id?: string) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    mutationFn: async (input: SubscriptionInput) => {
      const query = id
        ? supabase.from('subscriptions').update(input).eq('id', id)
        : supabase.from('subscriptions').insert(input);
      const { data, error } = await query.select('id').single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] }),
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['subscriptions', userId, id] });
      return queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
    },
  });
}
