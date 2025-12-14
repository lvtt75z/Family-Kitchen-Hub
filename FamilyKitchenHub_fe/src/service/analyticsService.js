import axios from '../hooks/axios';

// Get dashboard statistics
export const getDashboardStats = async () => {
    try {
        // Fetch all required data in parallel
        const [users, recipes, ingredients, categories] = await Promise.all([
            axios.get('/users'),
            axios.get('/recipes'),
            axios.get('/ingredients'),
            axios.get('/categories')
        ]);

        return {
            totalUsers: users.data.length,
            totalRecipes: recipes.data.length,
            totalIngredients: ingredients.data.length,
            totalCategories: categories.data.length
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Get popular recipes
export const getPopularRecipes = async (limit = 10) => {
    try {
        const response = await axios.get(`/analytics/popular?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching popular recipes:', error);
        throw error;
    }
};

// Get hot search keywords for dashboard
export const getHotSearches = async (limit = 10) => {
    try {
        const response = await axios.get(`/dashboard/hot-searches?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hot searches:', error);
        throw error;
    }
};

// Get user growth trends
export const getUserGrowth = async (months = 6) => {
    try {
        const response = await axios.get(`/dashboard/user-growth?months=${months}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user growth:', error);
        throw error;
    }
};

// Get top popular recipes for dashboard
export const getTopRecipes = async (limit = 10) => {
    try {
        const response = await axios.get(`/dashboard/popular-recipes?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching top recipes:', error);
        throw error;
    }
};

export default {
    getDashboardStats,
    getPopularRecipes,
    getUserGrowth,
    getHotSearches,
    getTopRecipes
};
