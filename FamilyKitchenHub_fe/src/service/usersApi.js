import axios from "../hooks/axios";

// GET /api/users/{id}/username - PUBLIC: get username only
export const getUsernameById = async (id) => {
  const res = await axios.get(`/users/${id}/username`);
  return res.data; // string username
};

export default {
  getUsernameById,
};


