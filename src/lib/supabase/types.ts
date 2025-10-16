export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      exam_results: {
        Row: {
          created_at: string;
          detailed_breakdown: Json | null;
          exam_id: string;
          id: string;
          incorrect_count: number;
          score: number;
          session_id: string;
          total_questions: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          detailed_breakdown?: Json | null;
          exam_id: string;
          id?: string;
          incorrect_count?: number;
          score: number;
          session_id: string;
          total_questions: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          detailed_breakdown?: Json | null;
          exam_id?: string;
          id?: string;
          incorrect_count?: number;
          score?: number;
          session_id?: string;
          total_questions?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ["exam_id"];
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
          {
            columns: ["session_id"];
            referencedRelation: "exam_sessions";
            referencedColumns: ["id"];
          },
          {
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      exam_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          started_at: string;
          status: "in_progress" | "completed" | "expired";
          updated_at: string;
          user_answers: Json | null;
          user_id: string;
          exam_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          started_at?: string;
          status?: "in_progress" | "completed" | "expired";
          updated_at?: string;
          user_answers?: Json | null;
          user_id: string;
          exam_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          started_at?: string;
          status?: "in_progress" | "completed" | "expired";
          updated_at?: string;
          user_answers?: Json | null;
          user_id?: string;
          exam_id?: string;
        };
        Relationships: [
          {
            columns: ["exam_id"];
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
          {
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      exams: {
        Row: {
          author_id: string | null;
          created_at: string;
          description: string | null;
          duration_in_minutes: number;
          id: string;
          is_published: boolean;
          max_attempts: number | null;
          package_id: string | null;
          passing_score: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_in_minutes: number;
          id?: string;
          is_published?: boolean;
          max_attempts?: number | null;
          package_id?: string | null;
          passing_score?: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_in_minutes?: number;
          id?: string;
          is_published?: boolean;
          max_attempts?: number | null;
          package_id?: string | null;
          passing_score?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          purchased_packages: string[] | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
          username: string | null;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          purchased_packages?: string[] | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          purchased_packages?: string[] | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [
          {
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      question_options: {
        Row: {
          created_at: string;
          id: string;
          is_correct: boolean;
          option_text: string;
          question_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_correct: boolean;
          option_text: string;
          question_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          option_text?: string;
          question_id?: string;
        };
        Relationships: [
          {
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      questions: {
        Row: {
          created_at: string;
          exam_id: string;
          explanation: string | null;
          id: string;
          order: number | null;
          question_text: string;
        };
        Insert: {
          created_at?: string;
          exam_id: string;
          explanation?: string | null;
          id?: string;
          order?: number | null;
          question_text: string;
        };
        Update: {
          created_at?: string;
          exam_id?: string;
          explanation?: string | null;
          id?: string;
          order?: number | null;
          question_text?: string;
        };
        Relationships: [
          {
            columns: ["exam_id"];
            referencedRelation: "exams";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_question_with_options: {
        Args: {
          exam_id_in: string;
          question_text_in: string;
          explanation_in: string | null;
          options_in: Database["public"]["CompositeTypes"]["option_input"][];
        };
        Returns: string;
      };
      delete_question: {
        Args: {
          question_id_in: string;
        };
        Returns: null;
      };
      finalize_exam_session: {
        Args: {
          session_id_in: string;
        };
        Returns: number;
      };
      complete_exam_session: {
        Args: {
          session_id_in: string;
        };
        Returns: Database["public"]["Tables"]["exam_results"]["Row"];
      };
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      record_exam_answer: {
        Args: {
          session_id_in: string;
          question_id_in: string;
          option_id_in: string | null;
        };
        Returns: Database["public"]["Tables"]["exam_sessions"]["Row"];
      };
      start_exam_session: {
        Args: {
          exam_id_in: string;
        };
        Returns: Database["public"]["Tables"]["exam_sessions"]["Row"];
      };
      update_question_with_options: {
        Args: {
          question_id_in: string;
          question_text_in: string;
          explanation_in: string | null;
          options_in: Database["public"]["CompositeTypes"]["option_input"][];
        };
        Returns: null;
      };
    };
    Enums: {
      user_role: "admin" | "user";
    };
    CompositeTypes: {
      option_input: {
        option_text: string;
        is_correct: boolean;
      };
    };
  };
}

export type ExamRow = Database["public"]["Tables"]["exams"]["Row"];
export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionOptionRow =
  Database["public"]["Tables"]["question_options"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
