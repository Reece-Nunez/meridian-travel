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
          itinerary: any[] | null
          images: string[] | null
          max_participants: number | null
          includes: string[] | null
          excludes: string[] | null
          luxury_highlights: string[] | null
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
          itinerary?: any[] | null
          images?: string[] | null
          max_participants?: number | null
          includes?: string[] | null
          excludes?: string[] | null
          luxury_highlights?: string[] | null
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
          itinerary?: any[] | null
          images?: string[] | null
          max_participants?: number | null
          includes?: string[] | null
          excludes?: string[] | null
          luxury_highlights?: string[] | null
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
          status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'booked' | null
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
          status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'booked' | null
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
          status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'booked' | null
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
      quote_tokens: {
        Row: {
          id: string
          created_at: string
          expires_at: string
          quote_id: string
          token: string
          email: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          expires_at?: string
          quote_id: string
          token: string
          email: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          expires_at?: string
          quote_id?: string
          token?: string
          email?: string
          used_at?: string | null
          user_id?: string | null
        }
      }
      itinerary_days: {
        Row: {
          id: string
          quote_id: string
          day_label: string
          start_date: string
          end_date: string | null
          city: string
          description: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          day_label: string
          start_date: string
          end_date?: string | null
          city: string
          description: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          day_label?: string
          start_date?: string
          end_date?: string | null
          city?: string
          description?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_activities: {
        Row: {
          id: string
          day_id: string
          activity_type: 'flight' | 'tour' | 'excursion' | 'activity' | 'custom'
          custom_type: string | null
          name: string
          description: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_id: string
          activity_type: 'flight' | 'tour' | 'excursion' | 'activity' | 'custom'
          custom_type?: string | null
          name: string
          description: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          activity_type?: 'flight' | 'tour' | 'excursion' | 'activity' | 'custom'
          custom_type?: string | null
          name?: string
          description?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_images: {
        Row: {
          id: string
          day_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          image_url?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          quote_id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          metadata: any | null
          completed_at: string | null
          booking_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          quote_id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          metadata?: any | null
          completed_at?: string | null
          booking_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          quote_id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          metadata?: any | null
          completed_at?: string | null
          booking_id?: string | null
        }
      }
      content_sections: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          section_key: string
          title: string
          content: string
          section_type: 'hero' | 'about' | 'services' | 'contact' | 'footer'
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          section_key: string
          title: string
          content: string
          section_type: 'hero' | 'about' | 'services' | 'contact' | 'footer'
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          section_key?: string
          title?: string
          content?: string
          section_type?: 'hero' | 'about' | 'services' | 'contact' | 'footer'
          is_active?: boolean
        }
      }
      site_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          setting_key: string
          setting_value: string
          setting_type: 'text' | 'email' | 'phone' | 'url' | 'textarea'
          description: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          setting_key: string
          setting_value: string
          setting_type: 'text' | 'email' | 'phone' | 'url' | 'textarea'
          description: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          setting_key?: string
          setting_value?: string
          setting_type?: 'text' | 'email' | 'phone' | 'url' | 'textarea'
          description?: string
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
export type ContentSection = Database['public']['Tables']['content_sections']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type ItineraryDay = Database['public']['Tables']['itinerary_days']['Row']
export type ItineraryActivity = Database['public']['Tables']['itinerary_activities']['Row']
export type ItineraryImage = Database['public']['Tables']['itinerary_images']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type QuoteToken = Database['public']['Tables']['quote_tokens']['Row']