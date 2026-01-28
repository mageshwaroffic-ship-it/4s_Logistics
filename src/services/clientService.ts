import { API_URL } from '../config';

export interface Client {
    id: number;
    name: string;
    address?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    created_at?: string;
}

export interface ClientCreate {
    name: string;
    address?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
}

export const clientService = {
    // Get all clients
    getAll: async (): Promise<Client[]> => {
        const response = await fetch(`${API_URL}/api/clients`);
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        return data.clients;
    },

    // Create new client
    create: async (client: ClientCreate): Promise<Client> => {
        const response = await fetch(`${API_URL}/api/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create client');
        }
        return response.json();
    },

    // Update client
    update: async (id: number, client: Partial<ClientCreate>): Promise<Client> => {
        const response = await fetch(`${API_URL}/api/clients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update client');
        }
        return response.json();
    },

    // Delete client
    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/api/clients/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete client');
        }
    }
};
