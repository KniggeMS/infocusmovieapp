export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string;
          id: string;
          payload: Json;
          read_at: string | null;
          type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payload?: Json;
          read_at?: string | null;
          type?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          payload?: Json;
          read_at?: string | null;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      custom_lists: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      diary_entries: {
        Row: {
          created_at: string | null;
          episode_number: number | null;
          id: string;
          imdb_rating: number | null;
          media_type: string;
          movie_poster_path: string | null;
          movie_title: string;
          movie_year: string | null;
          rating: number | null;
          review: string | null;
          rotten_tomatoes_rating: number | null;
          season_number: number | null;
          tmdb_movie_id: number;
          user_id: string;
          watched_on: string | null;
        };
        Insert: {
          created_at?: string | null;
          episode_number?: number | null;
          id?: string;
          imdb_rating?: number | null;
          media_type?: string;
          movie_poster_path?: string | null;
          movie_title: string;
          movie_year?: string | null;
          rating?: number | null;
          review?: string | null;
          rotten_tomatoes_rating?: number | null;
          season_number?: number | null;
          tmdb_movie_id: number;
          user_id: string;
          watched_on?: string | null;
        };
        Update: {
          created_at?: string | null;
          episode_number?: number | null;
          id?: string;
          imdb_rating?: number | null;
          media_type?: string;
          movie_poster_path?: string | null;
          movie_title?: string;
          movie_year?: string | null;
          rating?: number | null;
          review?: string | null;
          rotten_tomatoes_rating?: number | null;
          season_number?: number | null;
          tmdb_movie_id?: number;
          user_id?: string;
          watched_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'diary_entries_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      external_ratings: {
        Row: {
          id: string;
          imdb_id: string | null;
          imdb_rating: number | null;
          imdb_vote_count: number | null;
          last_updated: string | null;
          media_type: string;
          metacritic_score: number | null;
          rotten_tomatoes_fresh: number | null;
          rotten_tomatoes_rating: number | null;
          rotten_tomatoes_rotten: number | null;
          tmdb_id: number;
        };
        Insert: {
          id?: string;
          imdb_id?: string | null;
          imdb_rating?: number | null;
          imdb_vote_count?: number | null;
          last_updated?: string | null;
          media_type: string;
          metacritic_score?: number | null;
          rotten_tomatoes_fresh?: number | null;
          rotten_tomatoes_rating?: number | null;
          rotten_tomatoes_rotten?: number | null;
          tmdb_id: number;
        };
        Update: {
          id?: string;
          imdb_id?: string | null;
          imdb_rating?: number | null;
          imdb_vote_count?: number | null;
          last_updated?: string | null;
          media_type?: string;
          metacritic_score?: number | null;
          rotten_tomatoes_fresh?: number | null;
          rotten_tomatoes_rating?: number | null;
          rotten_tomatoes_rotten?: number | null;
          tmdb_id?: number;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          created_at: string | null;
          diary_entry_id: string;
          id: string;
          media_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          diary_entry_id: string;
          id?: string;
          media_type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          diary_entry_id?: string;
          id?: string;
          media_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'likes_diary_entry_id_fkey';
            columns: ['diary_entry_id'];
            isOneToOne: false;
            referencedRelation: 'diary_entries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      list_items: {
        Row: {
          added_at: string | null;
          episode_number: number | null;
          id: string;
          list_id: string;
          media_type: string;
          movie_poster_path: string | null;
          movie_title: string;
          movie_year: string | null;
          position: number | null;
          season_number: number | null;
          tmdb_movie_id: number;
        };
        Insert: {
          added_at?: string | null;
          episode_number?: number | null;
          id?: string;
          list_id: string;
          media_type?: string;
          movie_poster_path?: string | null;
          movie_title: string;
          movie_year?: string | null;
          position?: number | null;
          season_number?: number | null;
          tmdb_movie_id: number;
        };
        Update: {
          added_at?: string | null;
          episode_number?: number | null;
          id?: string;
          list_id?: string;
          media_type?: string;
          movie_poster_path?: string | null;
          movie_title?: string;
          movie_year?: string | null;
          position?: number | null;
          season_number?: number | null;
          tmdb_movie_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'list_items_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      list_shares: {
        Row: {
          can_edit: boolean | null;
          created_at: string | null;
          id: string;
          list_id: string;
          owner_id: string;
          shared_with: string;
        };
        Insert: {
          can_edit?: boolean | null;
          created_at?: string | null;
          id?: string;
          list_id: string;
          owner_id: string;
          shared_with: string;
        };
        Update: {
          can_edit?: boolean | null;
          created_at?: string | null;
          id?: string;
          list_id?: string;
          owner_id?: string;
          shared_with?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'list_shares_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_shares_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_shares_shared_with_fkey';
            columns: ['shared_with'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lists: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_public: boolean | null;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      movies: {
        Row: {
          created_at: string | null;
          favorite: boolean | null;
          genres: string[] | null;
          id: string;
          media_type: string | null;
          notes: string | null;
          overview: string | null;
          poster_path: string | null;
          release_date: string | null;
          runtime: number | null;
          tags: string[] | null;
          title: string;
          tmdb_id: number | null;
          total_episodes: number | null;
          total_seasons: number | null;
          user_id: string | null;
          user_rating: number | null;
          vote_average: number | null;
          watched: boolean | null;
          watched_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          favorite?: boolean | null;
          genres?: string[] | null;
          id?: string;
          media_type?: string | null;
          notes?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          release_date?: string | null;
          runtime?: number | null;
          tags?: string[] | null;
          title: string;
          tmdb_id?: number | null;
          total_episodes?: number | null;
          total_seasons?: number | null;
          user_id?: string | null;
          user_rating?: number | null;
          vote_average?: number | null;
          watched?: boolean | null;
          watched_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          favorite?: boolean | null;
          genres?: string[] | null;
          id?: string;
          media_type?: string | null;
          notes?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          release_date?: string | null;
          runtime?: number | null;
          tags?: string[] | null;
          title?: string;
          tmdb_id?: number | null;
          total_episodes?: number | null;
          total_seasons?: number | null;
          user_id?: string | null;
          user_rating?: number | null;
          vote_average?: number | null;
          watched?: boolean | null;
          watched_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          payload: Json | null;
          read_at: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          payload?: Json | null;
          read_at?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          payload?: Json | null;
          read_at?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          display_name: string | null;
          email: string | null;
          id: string;
          last_login_at: string | null;
          role: string;
          theme: string | null;
          ui_style: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id: string;
          last_login_at?: string | null;
          role?: string;
          theme?: string | null;
          ui_style?: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          last_login_at?: string | null;
          role?: string;
          theme?: string | null;
          ui_style?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      tv_progress: {
        Row: {
          created_at: string | null;
          episode_number: number;
          id: string;
          season_number: number;
          title: string;
          tmdb_id: number;
          user_id: string | null;
          watched: boolean | null;
          watched_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          episode_number: number;
          id?: string;
          season_number: number;
          title: string;
          tmdb_id: number;
          user_id?: string | null;
          watched?: boolean | null;
          watched_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          episode_number?: number;
          id?: string;
          season_number?: number;
          title?: string;
          tmdb_id?: number;
          user_id?: string | null;
          watched?: boolean | null;
          watched_at?: string | null;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          achievement_id: string;
          id: string;
          unlocked_at: string;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          id?: string;
          unlocked_at?: string;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          id?: string;
          unlocked_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_achievements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      watchlist: {
        Row: {
          added_at: string | null;
          episode_number: number | null;
          id: string;
          media_type: string;
          movie_poster_path: string | null;
          movie_title: string;
          movie_year: string | null;
          season_number: number | null;
          tmdb_movie_id: number;
          user_id: string;
        };
        Insert: {
          added_at?: string | null;
          episode_number?: number | null;
          id?: string;
          media_type?: string;
          movie_poster_path?: string | null;
          movie_title: string;
          movie_year?: string | null;
          season_number?: number | null;
          tmdb_movie_id: number;
          user_id: string;
        };
        Update: {
          added_at?: string | null;
          episode_number?: number | null;
          id?: string;
          media_type?: string;
          movie_poster_path?: string | null;
          movie_title?: string;
          movie_year?: string | null;
          season_number?: number | null;
          tmdb_movie_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlist_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_change_password: {
        Args: { new_password: string; target_user_id: string };
        Returns: undefined;
      };
      admin_delete_user: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      admin_get_all_users: { Args: never; Returns: Json };
      admin_update_user_role: {
        Args: { new_role: string; target_user_id: string };
        Returns: undefined;
      };
      get_email_by_username: { Args: { p_username: string }; Returns: string };
      get_profile_by_identifier: {
        Args: { p_identifier: string };
        Returns: {
          created_at: string;
          email: string;
          id: string;
          last_login_at: string;
          role: string;
          username: string;
        }[];
      };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
