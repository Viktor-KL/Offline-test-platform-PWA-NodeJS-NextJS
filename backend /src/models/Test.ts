export interface Test {
    id: number,
    title: string,
    description: string,
    created_at: Date
}

export interface Question {
    id: number;
    test_id: number;
    text: string;
    options: string[];
    correct_answer: string;
    order_index: number;
}

export interface CreateTestDto {
    title: string;
    description?: string;
}