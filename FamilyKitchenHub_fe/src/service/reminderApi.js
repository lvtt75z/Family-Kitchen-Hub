import axios from "../hooks/axios";

// ============================
// Recipe Reminders
// ============================

/**
 * Create a new reminder for a recipe
 * @param {number} userId - User ID
 * @param {Object} reminderData - { recipeId, reminderAt, note? }
 * @returns {Promise} Created reminder DTO
 */
export const createReminder = async (userId, reminderData) => {
    const res = await axios.post(`/users/${userId}/reminders`, reminderData);
    return res.data;
};

/**
 * Get all reminders for a user
 * @param {number} userId - User ID
 * @param {string} filter - Optional filter: 'upcoming' or 'past'
 * @returns {Promise} Array of reminder DTOs
 */
export const getUserReminders = async (userId, filter = null) => {
    const params = {};
    if (filter) {
        params.filter = filter;
    }
    const res = await axios.get(`/users/${userId}/reminders`, { params });
    return res.data;
};

/**
 * Delete a reminder (cancel reminder)
 * @param {number} userId - User ID
 * @param {number} reminderId - Reminder ID
 * @returns {Promise}
 */
export const deleteReminder = async (userId, reminderId) => {
    const res = await axios.delete(`/users/${userId}/reminders/${reminderId}`);
    return res.data;
};

/**
 * Get reminders for a specific recipe
 * @param {number} userId - User ID
 * @param {number} recipeId - Recipe ID
 * @returns {Promise} Array of reminders for the recipe
 */
export const getRecipeReminders = async (userId, recipeId) => {
    const allReminders = await getUserReminders(userId, 'upcoming');
    return allReminders.filter(r => r.recipeId === recipeId);
};

export default {
    createReminder,
    getUserReminders,
    deleteReminder,
    getRecipeReminders,
};
