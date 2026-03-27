import api from './api';

export const expensesAPI = {
    // Get all expenses (with optional limit)
    getExpenses: async (limit = 100) => {
        try {
            const response = await api.get(`/api/expenses`, { params: { limit } });
            return response.data;
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    // Get specific expense by ID
    getExpense: async (id) => {
        try {
            const response = await api.get(`/api/expenses/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching expense ${id}:`, error);
            throw error;
        }
    },

    // Create a new expense
    createExpense: async (expenseData) => {
        try {
            const response = await api.post(`/api/expenses`, expenseData);
            return response.data;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    // Update an existing expense
    updateExpense: async (id, expenseData) => {
        try {
            const response = await api.put(`/api/expenses/${id}`, expenseData);
            return response.data;
        } catch (error) {
            console.error(`Error updating expense ${id}:`, error);
            throw error;
        }
    },

    // Delete an expense
    deleteExpense: async (id) => {
        try {
            const response = await api.delete(`/api/expenses/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting expense ${id}:`, error);
            throw error;
        }
    }
};
