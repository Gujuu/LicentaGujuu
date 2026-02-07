import { apiClient } from '@/lib/api';

// Types for contact API
export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Contact service
class ContactService {
  async sendMessage(contactData: ContactData) {
    try {
      return await apiClient.sendContactMessage(contactData);
    } catch (error) {
      console.error('Failed to send contact message:', error);
      throw error;
    }
  }

  async getMessages(params?: { limit?: number; offset?: number; is_read?: boolean }): Promise<{ messages: ApiContactMessage[] }> {
    try {
      return await apiClient.getContactMessages(params);
    } catch (error) {
      console.warn('Failed to fetch contact messages:', error);
      return { messages: [] };
    }
  }

  async markAsRead(id: number) {
    return apiClient.markMessageAsRead(id);
  }

  async deleteMessage(id: number) {
    return apiClient.deleteContactMessage(id);
  }
}

export const contactService = new ContactService();