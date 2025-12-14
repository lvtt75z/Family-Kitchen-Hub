import axios from '../hooks/axios';

// Get all tags
export const getAllTags = async () => {
    const response = await axios.get('/tags');
    return response.data;
};

// Get tag by ID
export const getTagById = async (id) => {
    const response = await axios.get(`/tags/${id}`);
    return response.data;
};

// Create new tag
export const createTag = async (tagData) => {
    const response = await axios.post('/tags', tagData);
    return response.data;
};

// Update tag
export const updateTag = async (id, tagData) => {
    const response = await axios.put(`/tags/${id}`, tagData);
    return response.data;
};

// Delete tag
export const deleteTag = async (id) => {
    await axios.delete(`/tags/${id}`);
};

// Search tags
export const searchTags = async (searchTerm) => {
    const response = await axios.get(`/tags/search?name=${searchTerm}`);
    return response.data;
};

export default {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    searchTags
};
