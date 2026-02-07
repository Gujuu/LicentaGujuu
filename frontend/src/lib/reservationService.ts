import { apiClient } from '@/lib/api';

// Types for reservation API
export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
}

export interface ApiReservation {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

// Reservation service
class ReservationService {
  async createReservation(reservation: ReservationData) {
    try {
      return await apiClient.createReservation(reservation);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      throw error;
    }
  }

  async getMyReservations(params?: { limit?: number; offset?: number; status?: string }): Promise<{ reservations: ApiReservation[] }> {
    try {
      return await apiClient.getMyReservations(params);
    } catch (error) {
      console.warn('Failed to fetch reservations:', error);
      return { reservations: [] };
    }
  }

  async getAllReservations(params?: { limit?: number; offset?: number; status?: string }): Promise<{ reservations: ApiReservation[] }> {
    try {
      return await apiClient.getReservations(params);
    } catch (error) {
      console.warn('Failed to fetch all reservations:', error);
      return { reservations: [] };
    }
  }

  async updateReservationStatus(id: number, status: 'pending' | 'confirmed' | 'cancelled') {
    return apiClient.updateReservationStatus(id, status);
  }

  async cancelReservation(id: number) {
    return apiClient.cancelReservation(id);
  }
}

export const reservationService = new ReservationService();