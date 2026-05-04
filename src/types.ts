export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  status?: 'sending' | 'error';
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}
