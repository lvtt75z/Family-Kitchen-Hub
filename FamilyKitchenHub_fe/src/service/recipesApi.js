import axios from "../hooks/axios";

// ============================
// Recipes & Similar Recipes
// ============================

export const getRecipeById = async (id) => {
  const res = await axios.get(`/recipes/${id}`);
  return res.data;
};

// 7.2 – Đề xuất món tương tự
// GET /api/recipes/{recipeId}/similar
export const getSimilarRecipes = async (recipeId) => {
  const res = await axios.get(`/recipes/${recipeId}/similar`);
  // Backend trả similarityScore, FE có thể sort thêm nếu cần
  return res.data;
};

// ============================
// Popular Recipes & Analytics (Search + Bookmark scoring)
// ============================

// Log search keyword & clicked recipe
// Backend: POST /api/recipes/search-log
export const logRecipeSearch = async (payload) => {
  // payload: RecipeSearchLogRequest { userId, keyword, recipeId? }
  const res = await axios.post("/recipes/search-log", payload);
  return res.data;
};

// Add bookmark for a recipe
// Backend: POST /api/recipes/{recipeId}/bookmarks
export const addRecipeBookmark = async (recipeId, payload) => {
  // payload: RecipeBookmarkRequest { userId }
  const res = await axios.post(`/recipes/${recipeId}/bookmarks`, payload);
  return res.data;
};

// Remove bookmark for a recipe
// Backend: DELETE /api/recipes/{recipeId}/bookmarks?userId={userId}
export const removeRecipeBookmark = async (recipeId, userId) => {
  const res = await axios.delete(`/recipes/${recipeId}/bookmarks`, {
    params: { userId },
  });
  return res.data;
};

// 7.3 – GET /api/recipes/popular?limit=20
export const getPopularRecipes = async (limit = 20) => {
  const res = await axios.get("/recipes/popular", {
    params: { limit },
  });
  return res.data;
};

// GET /api/recipes/top-bookmarked?limit=5
// Trả về danh sách công thức được bookmark nhiều nhất
export const getTopBookmarkedRecipes = async (limit = 5) => {
  const res = await axios.get("/recipes/top-bookmarked", {
    params: { limit },
  });
  return res.data;
};

// ============================
// Comments & Media
// ============================

// GET /api/recipes/{id}/comments?status=&page=&size=
// Backend: optional CommentStatus filter, pagination support
export const getRecipeComments = async (recipeId, { status, page, size } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  
  const res = await axios.get(`/recipes/${recipeId}/comments`, { params });
  return res.data;
};

// POST /api/recipes/{id}/comments
// payload: { content, mediaIds?: [] }
export const createRecipeComment = async (recipeId, payload) => {
  const res = await axios.post(`/recipes/${recipeId}/comments`, payload);
  return res.data;
};

// POST /api/media – upload ảnh/video, backend trả về { url, type, id? }
export const uploadCommentMedia = async (file) => {
  if (!file) {
    throw new Error("File không hợp lệ");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post("/media", formData, {
      headers: {
        // Không set Content-Type để browser tự động set với boundary
        // Nếu set thủ công sẽ thiếu boundary và gây lỗi
      },
      // Thêm timeout để tránh chờ quá lâu
      timeout: 30000, // 30 giây
    });

    return res.data;
  } catch (error) {
    // Log chi tiết lỗi để debug
    console.error("Upload media error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    // Re-throw để component có thể xử lý
    throw error;
  }
};

// ============================
// Posts sorted by engagement
// ============================

// 7.5 – GET /api/posts?sort=engagement&page=1
export const getPostsByEngagement = async ({ page = 1 } = {}) => {
  const res = await axios.get("/posts", {
    params: {
      sort: "engagement",
      page,
    },
  });
  return res.data;
};

// ============================
// Cook Recipe - Trừ nguyên liệu từ tủ lạnh
// ============================

// POST /api/recipes/{id}/cook?userId={userId} (optional)
// Nấu/đặt recipe và trừ nguyên liệu từ tủ lạnh ảo
// userId là optional - nếu có authentication token thì userId sẽ tự động lấy từ token
export const cookRecipe = async (recipeId, userId = null) => {
  const config = {};
  
  // Chỉ thêm userId vào params nếu được cung cấp
  // Nếu không có userId, backend sẽ tự động lấy từ authentication token
  if (userId) {
    config.params = { userId };
  }
  
  const res = await axios.post(`/recipes/${recipeId}/cook`, null, config);
  return res.data;
};

export default {
  getRecipeById,
  getSimilarRecipes,
  logRecipeSearch,
  addRecipeBookmark,
  removeRecipeBookmark,
  getPopularRecipes,
  getTopBookmarkedRecipes,
  getRecipeComments,
  createRecipeComment,
  uploadCommentMedia,
  getPostsByEngagement,
  cookRecipe,
};



