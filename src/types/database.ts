// Mirrors supabase/migrations. Regenerate with the Supabase MCP `generate_typescript_types`
// (or `npx supabase gen types typescript --project-id wdcedxshfbhuouoiamac`) after schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          base_currency: string;
          default_reminder_days: number;
          timezone: string;
          expo_push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          base_currency?: string;
          default_reminder_days?: number;
          timezone?: string;
          expo_push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          base_currency?: string;
          default_reminder_days?: number;
          timezone?: string;
          expo_push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          logo_url: string | null;
          default_currency: string;
          cancel_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          logo_url?: string | null;
          default_currency?: string;
          cancel_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          logo_url?: string | null;
          default_currency?: string;
          cancel_url?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          service_id: string | null;
          name: string;
          amount: number;
          currency: string;
          cycle_unit: Database['public']['Enums']['cycle_unit'];
          cycle_count: number;
          start_date: string;
          next_billing_date: string;
          payment_method: Database['public']['Enums']['payment_method'] | null;
          category: string | null;
          is_trial: boolean;
          trial_ends_at: string | null;
          trial_price: number | null;
          reminder_days: number | null;
          status: Database['public']['Enums']['subscription_status'];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          service_id?: string | null;
          name: string;
          amount: number;
          currency?: string;
          cycle_unit?: Database['public']['Enums']['cycle_unit'];
          cycle_count?: number;
          start_date?: string;
          next_billing_date: string;
          payment_method?: Database['public']['Enums']['payment_method'] | null;
          category?: string | null;
          is_trial?: boolean;
          trial_ends_at?: string | null;
          trial_price?: number | null;
          reminder_days?: number | null;
          status?: Database['public']['Enums']['subscription_status'];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string | null;
          name?: string;
          amount?: number;
          currency?: string;
          cycle_unit?: Database['public']['Enums']['cycle_unit'];
          cycle_count?: number;
          start_date?: string;
          next_billing_date?: string;
          payment_method?: Database['public']['Enums']['payment_method'] | null;
          category?: string | null;
          is_trial?: boolean;
          trial_ends_at?: string | null;
          trial_price?: number | null;
          reminder_days?: number | null;
          status?: Database['public']['Enums']['subscription_status'];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
      fx_rates: {
        Row: {
          date: string;
          base: string;
          currency: string;
          rate: number;
        };
        Insert: {
          date: string;
          base?: string;
          currency: string;
          rate: number;
        };
        Update: {
          date?: string;
          base?: string;
          currency?: string;
          rate?: number;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      cycle_unit: 'day' | 'week' | 'month' | 'year';
      payment_method: 'mpesa' | 'card' | 'carrier_billing' | 'bank';
      subscription_status: 'active' | 'paused' | 'cancelled';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
