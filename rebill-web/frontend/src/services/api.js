// ReBill Web Mock API Service

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
    auth: {
        login: async (credentials) => {
            await delay(1000); // Simulate network latency
            if (credentials.email === 'error@example.com') {
                throw new Error('Invalid credentials');
            }
            return {
                token: 'mock-jwt-token-12345',
                user: {
                    id: 1,
                    name: 'Demo User',
                    email: credentials.email,
                    role: 'owner'
                }
            };
        },
        register: async (data) => {
            await delay(1500);
            return {
                token: 'mock-jwt-token-new-user',
                user: {
                    id: 2,
                    name: data.name,
                    email: data.email,
                    role: 'owner'
                }
            };
        }
    },
    shops: {
        list: async () => {
            await delay(800);
            return [
                { id: 101, name: 'Downtown Coffee', city: 'Mumbai', status: 'active' },
                { id: 102, name: 'Tech Spares', city: 'Bangalore', status: 'inactive' }
            ];
        },
        subscription: async (shopId) => {
            await delay(500);
            return {
                plan: 'Pro Plan',
                status: 'active',
                renewalDate: '2026-03-01'
            };
        }
    },
    stats: {
        get: async () => {
            await delay(1200);
            return {
                totalSales: 45200,
                totalBills: 1250,
                growth: 12.5
            };
        }
    }
};
