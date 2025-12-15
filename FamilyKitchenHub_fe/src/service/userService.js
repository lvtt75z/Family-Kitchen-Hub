import axios from '../hooks/axios';

// Get all users
export const getAllUsers = async () => {
    const response = await axios.get('/users');
    return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await axios.put(`/users/${id}`, userData);
    return response.data;
};

// Delete user
export const deleteUser = async (id) => {
    await axios.delete(`/users/${id}`);
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
