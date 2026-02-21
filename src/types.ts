// Reamaze API response types

export const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "Responded",
  2: "Done",
  3: "Spam",
  4: "Archived",
  5: "On Hold",
  6: "Auto-Done",
  7: "AI Agent Assigned",
  8: "AI Agent Done",
  9: "Spam (AI)",
};

export const STATUS_NAMES_TO_VALUES: Record<string, number> = {
  open: 0,
  responded: 1,
  done: 2,
  spam: 3,
  archived: 4,
  "on hold": 5,
};

export interface ReamazeConversation {
  slug: string;
  subject: string;
  status: number;
  category: {
    name: string;
    slug: string;
    channel: number;
  } | null;
  created_at: string;
  updated_at: string;
  last_customer_message_at: string | null;
  message: {
    body: string;
    created_at: string;
  };
  author: {
    name: string;
    email: string;
  };
  assignee: {
    name: string;
    email: string;
  } | null;
  tag_list: string[];
  data: Record<string, unknown>;
}

export interface ReamazeMessage {
  body: string;
  created_at: string;
  visibility: number; // 0 = public, 1 = internal
  user: {
    name: string;
    email: string;
  };
  attachments: Array<{
    url: string;
    name: string;
  }>;
}

export interface ReamazeContact {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
  mobile: string | null;
  data: Record<string, unknown>;
  external_avatar_url: string | null;
  notes: Array<{
    body: string;
    created_at: string;
  }>;
}

export interface ReamazeResponseTemplate {
  id: number;
  title: string;
  body: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

// List response wrappers
export interface ReamazeConversationListResponse {
  conversations: ReamazeConversation[];
  page_size: number;
  page_count: number;
  total_count: number;
}

export interface ReamazeMessageListResponse {
  messages: ReamazeMessage[];
}

export interface ReamazeContactListResponse {
  contacts: ReamazeContact[];
  page_size: number;
  page_count: number;
  total_count: number;
}

export interface ReamazeResponseTemplateListResponse {
  response_templates: ReamazeResponseTemplate[];
  page_size: number;
  page_count: number;
  total_count: number;
}
