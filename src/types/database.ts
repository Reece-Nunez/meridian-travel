export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          emergency_contact: string | null
          dietary_restrictions: string | null
          travel_preferences: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          emergency_contact?: string | null
          dietary_restrictions?: string | null
          travel_preferences?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          emergency_contact?: string | null
          dietary_restrictions?: string | null
          travel_preferences?: string | null
        }
      }
      trip_packages: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          destination: string
          duration: number
          price_usd: number
          price_eur: number | null
          price_gbp: number | null
          itinerary: ItineraryDay[] | null
          images: string[] | null
          max_participants: number | null
          difficulty_level: 'easy' | 'moderate' | 'challenging' | null
          includes: string[] | null
          excludes: string[] | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          destination: string
          duration: number
          price_usd: number
          price_eur?: number | null
          price_gbp?: number | null
          itinerary?: ItineraryDay[] | null
          images?: string[] | null
          max_participants?: number | null
          difficulty_level?: 'easy' | 'moderate' | 'challenging' | null
          includes?: string[] | null
          excludes?: string[] | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          destination?: string
          duration?: number
          price_usd?: number
          price_eur?: number | null
          price_gbp?: number | null
          itinerary?: ItineraryDay[] | null
          images?: string[] | null
          max_participants?: number | null
          difficulty_level?: 'easy' | 'moderate' | 'challenging' | null
          includes?: string[] | null
          excludes?: string[] | null
          is_active?: boolean | null
        }
      }
      custom_quotes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          destination: string
          duration: number
          participants: number
          budget_range: string | null
          travel_dates_start: string | null
          travel_dates_end: string | null
          special_requirements: string | null
          contact_email: string
          contact_phone: string | null
          status: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'rejected' | null
          quoted_price: number | null
          quoted_currency: string | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          destination: string
          duration: number
          participants: number
          budget_range?: string | null
          travel_dates_start?: string | null
          travel_dates_end?: string | null
          special_requirements?: string | null
          contact_email: string
          contact_phone?: string | null
          status?: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'rejected' | null
          quoted_price?: number | null
          quoted_currency?: string | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          destination?: string
          duration?: number
          participants?: number
          budget_range?: string | null
          travel_dates_start?: string | null
          travel_dates_end?: string | null
          special_requirements?: string | null
          contact_email?: string
          contact_phone?: string | null
          status?: 'pending' | 'reviewing' | 'quoted' | 'approved' | 'rejected' | null
          quoted_price?: number | null
          quoted_currency?: string | null
          admin_notes?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          package_id: string | null
          custom_quote_id: string | null
          booking_reference: string
          status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | null
          total_amount: number
          currency: string | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          full_payment_paid: boolean | null
          stripe_payment_intent_id: string | null
          stripe_deposit_intent_id: string | null
          travel_date_start: string | null
          travel_date_end: string | null
          participants: number
          participant_details: ParticipantDetail[] | null
          special_requests: string | null
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          package_id?: string | null
          custom_quote_id?: string | null
          booking_reference?: string
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled' | null
          total_amount: number
          currency?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          full_payment_paid?: boolean | null
          stripe_payment_intent_id?: string | null
          stripe_deposit_intent_id?: string | null
          travel_date_start?: string | null
          travel_date_end?: string | null
          participants: number
          participant_details?: ParticipantDetail[] | null
          special_requests?: string | null
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          package_id?: string | null
          custom_quote_id?: string | null
          booking_reference?: string
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled' | null
          total_amount?: number
          currency?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          full_payment_paid?: boolean | null
          stripe_payment_intent_id?: string | null
          stripe_deposit_intent_id?: string | null
          travel_date_start?: string | null
          travel_date_end?: string | null
          participants?: number
          participant_details?: ParticipantDetail[] | null
          special_requests?: string | null
          cancellation_reason?: string | null
        }
      }
      payment_history: {
        Row: {
          id: string
          created_at: string
          booking_id: string | null
          stripe_payment_intent_id: string
          amount: number
          currency: string
          payment_type: 'deposit' | 'full_payment' | 'refund' | null
          status: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          stripe_charge_id: string | null
          refund_amount: number | null
          refund_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id?: string | null
          stripe_payment_intent_id: string
          amount: number
          currency: string
          payment_type?: 'deposit' | 'full_payment' | 'refund' | null
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          stripe_charge_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string | null
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          payment_type?: 'deposit' | 'full_payment' | 'refund' | null
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          stripe_charge_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export interface ItineraryDay {
  day: number
  title: string
  activities: string[]
  accommodation?: string | null
}

export interface ParticipantDetail {
  name: string
  email: string
  phone?: string
  dietary_restrictions?: string
  emergency_contact?: string
}

// Convenient type aliases
export type TripPackage = Database['public']['Tables']['trip_packages']['Row']
export type CustomQuote = Database['public']['Tables']['custom_quotes']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type PaymentHistory = Database['public']['Tables']['payment_history']['Row']