import axios from '../hooks/axios';

// Get all allergies
export const getAllAllergies = async () => {
    const response = await axios.get('/allergies');
    return response.data;
};

// Get allergy by ID
export const getAllergyById = async (id) => {
    const response = await axios.get(`/allergies/${id}`);
    return response.data;
};

// Create new allergy
export const createAllergy = async (allergyData) => {
    const response = await axios.post('/allergies', allergyData);
    return response.data;
};

// Update allergy
export const updateAllergy = async (id, allergyData) => {
    const response = await axios.put(`/allergies/${id}`, allergyData);
    return response.data;
};

// Delete allergy
export const deleteAllergy = async (id) => {
    await axios.delete(`/allergies/${id}`);
};

export default {
    getAllAllergies,
    getAllergyById,
    createAllergy,
    updateAllergy,
    deleteAllergy
};
