import axios from "../hooks/axios";

// GET /api/users/{id}/username - PUBLIC: get username only
export const getUsernameById = async (id) => {
  const res = await axios.get(`/users/${id}/username`);
  // Handle both string response and object response {username: "..."}
  if (typeof res.data === 'string') {
    return res.data;
  } else if (res.data && typeof res.data === 'object') {
    return res.data.username || res.data.userName || null;
  }
  return null;
};

export default {
  getUsernameById,
};


