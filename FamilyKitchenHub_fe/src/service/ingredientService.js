import axios from '../hooks/axios';

// Get all ingredients
export const getAllIngredients = async () => {
    const response = await axios.get('/ingredients');
    return response.data;
};

// Get ingredient by ID
export const getIngredientById = async (id) => {
    const response = await axios.get(`/ingredients/${id}`);
    return response.data;
};

// Create new ingredient
export const createIngredient = async (ingredientData) => {
    const response = await axios.post('/ingredients', ingredientData);
    return response.data;
};

// Update ingredient
export const updateIngredient = async (id, ingredientData) => {
    const response = await axios.put(`/ingredients/${id}`, ingredientData);
    return response.data;
};

// Delete ingredient
export const deleteIngredient = async (id) => {
    await axios.delete(`/ingredients/${id}`);
};

// Search ingredients
export const searchIngredients = async (keyword) => {
    const response = await axios.get(`/ingredients/search?keyword=${keyword}`);
    return response.data;
};

// Get tags for an ingredient
export const getIngredientTags = async (ingredientId) => {
    const response = await axios.get(`/tags/ingredients/${ingredientId}/tags`);
    return response.data;
};

// Add tags to ingredient
export const addTagsToIngredient = async (ingredientId, tagIds) => {
    const response = await axios.post(`/tags/ingredients/${ingredientId}/tags`, { tagIds });
    return response.data;
};

// Remove tag from ingredient
export const removeTagFromIngredient = async (ingredientId, tagId) => {
    await axios.delete(`/tags/ingredients/${ingredientId}/tags/${tagId}`);
};

export default {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    searchIngredients,
    getIngredientTags,
    addTagsToIngredient,
    removeTagFromIngredient
};
