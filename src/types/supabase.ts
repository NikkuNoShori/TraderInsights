export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
} 