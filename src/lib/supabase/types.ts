/**
 * Hand-maintained DB types aligned with supabase/schema.sql.
 * Replace with `supabase gen types typescript` after the project is linked if preferred.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type InquiryRow = {
  id: string;
  number: string;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  guest_count: number;
  venue_preference: string;
  venue_name: string;
  venue_address: string;
  package_id: string | null;
  service_ids: string[];
  budget: number;
  theme: string;
  special_requests: string;
  status: string;
  assigned_staff: string;
  source: string;
  client_id: string | null;
  created_at: string;
};

type InquiryInsert = {
  id?: string;
  number?: string;
  full_name: string;
  company?: string;
  email: string;
  phone?: string;
  event_type?: string;
  event_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  guest_count?: number;
  venue_preference?: string;
  venue_name?: string;
  venue_address?: string;
  package_id?: string | null;
  service_ids?: string[];
  budget?: number;
  theme?: string;
  special_requests?: string;
  status?: string;
  assigned_staff?: string;
  source?: string;
  client_id?: string | null;
  created_at?: string;
};

type StaffProfileRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          company: string;
          email: string;
          phone: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string;
          email: string;
          phone?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string;
          email?: string;
          phone?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: InquiryInsert;
        Update: Partial<InquiryInsert>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          subject?: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          subject?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          slug: string;
          images: string[];
          short_description: string;
          description: string;
          location: string;
          starting_price: number;
          min_capacity: number;
          max_capacity: number;
          amenities: string[];
          facilities: string[];
          event_types: string[];
          featured: boolean;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          images?: string[];
          short_description?: string;
          description?: string;
          location?: string;
          starting_price?: number;
          min_capacity?: number;
          max_capacity?: number;
          amenities?: string[];
          facilities?: string[];
          event_types?: string[];
          featured?: boolean;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          images?: string[];
          short_description?: string;
          description?: string;
          location?: string;
          starting_price?: number;
          min_capacity?: number;
          max_capacity?: number;
          amenities?: string[];
          facilities?: string[];
          event_types?: string[];
          featured?: boolean;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image: string;
          price: number;
          pricing_type: string;
          category: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          image?: string;
          price?: number;
          pricing_type?: string;
          category?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image?: string;
          price?: number;
          pricing_type?: string;
          category?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      packages: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image: string;
          price: number;
          sale_price: number | null;
          guest_capacity: number;
          inclusions: string[];
          exclusions: string[];
          venue_ids: string[];
          service_ids: string[];
          event_type: string;
          featured: boolean;
          published: boolean;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          image?: string;
          price?: number;
          sale_price?: number | null;
          guest_capacity?: number;
          inclusions?: string[];
          exclusions?: string[];
          venue_ids?: string[];
          service_ids?: string[];
          event_type?: string;
          featured?: boolean;
          published?: boolean;
          archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image?: string;
          price?: number;
          sale_price?: number | null;
          guest_capacity?: number;
          inclusions?: string[];
          exclusions?: string[];
          venue_ids?: string[];
          service_ids?: string[];
          event_type?: string;
          featured?: boolean;
          published?: boolean;
          archived?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          id: string;
          number: string;
          inquiry_id: string | null;
          client_id: string | null;
          status: string;
          items: Json;
          notes: string;
          valid_until: string | null;
          deposit_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          number?: string;
          inquiry_id?: string | null;
          client_id?: string | null;
          status?: string;
          items?: Json;
          notes?: string;
          valid_until?: string | null;
          deposit_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          inquiry_id?: string | null;
          client_id?: string | null;
          status?: string;
          items?: Json;
          notes?: string;
          valid_until?: string | null;
          deposit_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          number: string;
          client_id: string | null;
          proposal_id: string | null;
          inquiry_id: string | null;
          event_name: string;
          event_type: string;
          venue_id: string | null;
          venue_name: string;
          event_date: string | null;
          start_time: string | null;
          end_time: string | null;
          guest_count: number;
          total: number;
          paid: number;
          payment_status: string;
          status: string;
          service_ids: string[];
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          number?: string;
          client_id?: string | null;
          proposal_id?: string | null;
          inquiry_id?: string | null;
          event_name: string;
          event_type?: string;
          venue_id?: string | null;
          venue_name?: string;
          event_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          guest_count?: number;
          total?: number;
          paid?: number;
          payment_status?: string;
          status?: string;
          service_ids?: string[];
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          client_id?: string | null;
          proposal_id?: string | null;
          inquiry_id?: string | null;
          event_name?: string;
          event_type?: string;
          venue_id?: string | null;
          venue_name?: string;
          event_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          guest_count?: number;
          total?: number;
          paid?: number;
          payment_status?: string;
          status?: string;
          service_ids?: string[];
          notes?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          number: string;
          booking_id: string;
          client_id: string | null;
          amount: number;
          method: string;
          reference: string;
          date: string;
          notes: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          number?: string;
          booking_id: string;
          client_id?: string | null;
          amount: number;
          method?: string;
          reference?: string;
          date?: string;
          notes?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          booking_id?: string;
          client_id?: string | null;
          amount?: number;
          method?: string;
          reference?: string;
          date?: string;
          notes?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      staff_profiles: {
        Row: StaffProfileRow;
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      website_settings: {
        Row: {
          id: number;
          company_name: string;
          company_description: string;
          email: string;
          phone: string;
          address: string;
          facebook: string;
          instagram: string;
          tiktok: string;
          youtube: string;
          website: string;
          business_hours: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          company_name?: string;
          company_description?: string;
          email?: string;
          phone?: string;
          address?: string;
          facebook?: string;
          instagram?: string;
          tiktok?: string;
          youtube?: string;
          website?: string;
          business_hours?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_name?: string;
          company_description?: string;
          email?: string;
          phone?: string;
          address?: string;
          facebook?: string;
          instagram?: string;
          tiktok?: string;
          youtube?: string;
          website?: string;
          business_hours?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          action: string;
          actor: string;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          actor?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          actor?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      next_document_number: {
        Args: { prefix: string };
        Returns: string;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
