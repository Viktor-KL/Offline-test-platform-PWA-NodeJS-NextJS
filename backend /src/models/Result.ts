export interface Result {
    id: number;
    user_id: number;
    test_id: number;
    score: number;
    answers: Record<string, string>;
    created_at: Date;
    synced_at: Date | null;
  }
  
  export interface CreateResultDto {
    user_id: number;
    test_id: number;
    score: number;
    answers: Record<string, string>;
  }