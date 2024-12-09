// Value Objects
export type MessageStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type PhoneNumber = string;
export type MessageContent = string;

// Base Message Interface
export interface Message {
  to: PhoneNumber;
  message: MessageContent;
}

// Entities
export interface ScheduledMessage extends Message {
  id: string;
  scheduledTime: Date;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateScheduledMessageDto extends Message {
  scheduledTime: string; // ISO string format
}

export interface BulkScheduleMessageDto {
  messages: CreateScheduledMessageDto[];
}

// Repository Interface
export interface IScheduledMessageRepository {
  save(message: ScheduledMessage): Promise<void>;
  findById(id: string): Promise<ScheduledMessage | null>;
  findAll(): Promise<ScheduledMessage[]>;
  update(id: string, message: Partial<ScheduledMessage>): Promise<void>;
  delete(id: string): Promise<void>;
}

// Use Cases
export interface IScheduleMessageUseCase {
  schedule(dto: CreateScheduledMessageDto): Promise<ScheduledMessage>;
  cancel(id: string): Promise<boolean>;
  get(id: string): Promise<ScheduledMessage | null>;
  getAll(): Promise<ScheduledMessage[]>;
} 