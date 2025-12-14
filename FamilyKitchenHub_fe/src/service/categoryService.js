import axios from '../hooks/axios';

// Get all categories
export const getAllCategories = async () => {
    const response = await axios.get('/categories');
    return response.data;
};

// Get category by ID
export const getCategoryById = async (id) => {
    const response = await axios.get(`/categories/${id}`);
    return response.data;
};

// Create new category
export const createCategory = async (categoryData) => {
    const response = await axios.post('/categories', categoryData);
    return response.data;
};

// Update category
export const updateCategory = async (id, categoryData) => {
    const response = await axios.put(`/categories/${id}`, categoryData);
    return response.data;
};

// Delete category
export const deleteCategory = async (id) => {
    await axios.delete(`/categories/${id}`);
};

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
