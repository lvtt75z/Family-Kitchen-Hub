import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import {
  getSimilarRecipes,
  getRecipeComments,
  createRecipeComment,
  uploadCommentMedia,
  updateRecipeComment,
  deleteRecipeComment,
  addCommentReaction,
  removeCommentReaction,
} from "../../service/recipesApi";
import { cookRecipe } from "../../service/recipesApi";
import { getUsernameById } from "../../service/usersApi";
import { convertMediaUrl } from "../../utils/mediaUtils";
import { CookingPot, Share2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../../styles/DetailRecipes.css";
import "./../../styles/reactions.css";
import "./../../styles/reactions-child.css";
import "./../../styles/nested-replies.css";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [usernames, setUsernames] = useState({});
  const [fetchingUsernames, setFetchingUsernames] = useState(new Set()); // Track các userId đang được fetch
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editMedia, setEditMedia] = useState([]);
  const [editMediaToDelete, setEditMediaToDelete] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editNewFilePreviews, setEditNewFilePreviews] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomGalleryImages, setZoomGalleryImages] = useState([]);
  const [zoomCurrentIndex, setZoomCurrentIndex] = useState(0);

  // Missing ingredients state
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [userInventory, setUserInventory] = useState({});
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedMissingIngredient, setSelectedMissingIngredient] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState("");
  const [buyExpirationDate, setBuyExpirationDate] = useState("");
  const [buyPurchaseDate, setBuyPurchaseDate] = useState("");

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, userName }
  const [replyContent, setReplyContent] = useState("");


  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitial = (name, fallbackId) => {
    if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
    if (fallbackId) return String(fallbackId).charAt(0).toUpperCase();
    return "U";
  };

  // =========================
  //   HELPER: Kiểm tra nguyên liệu quá hạn
  // =========================
  const checkExpiredIngredients = (expDate) => {
    if (!expDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const expiry = new Date(expDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today; // Quá hạn nếu expiry < today
  };

  // =========================
  //   COOK RECIPE - Trừ nguyên liệu từ tủ lạnh
  // =========================
  const handleCookRecipe = async (recipeId, recipeTitle) => {
    let loadingToast = null;

    try {
      // Lấy userId từ localStorage
      const userDataString = localStorage.getItem("user");
      let userId = null;
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userId = userData.user?.id || userData.id;
        } catch (e) {
          console.warn("Không thể parse user data:", e);
        }
      }

      // Kiểm tra authentication token
      const token = localStorage.getItem("token");
      if (!token && !userId) {
        toast.error("Vui lòng đăng nhập để nấu món ăn.", { autoClose: 3000 });
        return;
      }

      // Kiểm tra nguyên liệu quá hạn TRƯỚC KHI nấu
      loadingToast = toast.loading("Đang kiểm tra nguyên liệu...", { autoClose: false });

      try {
        // Lấy recipe details để có danh sách ingredients
        const recipeRes = await axios.get(`/recipes/${recipeId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const recipeData = recipeRes.data;
        const recipeIngredients = recipeData.ingredients || [];

        // Lấy inventory items của user
        if (!userId) {
          toast.dismiss(loadingToast);
          toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.", { autoClose: 3000 });
          return;
        }

        const inventoryRes = await axios.get(`/inventory/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const inventoryItems = inventoryRes.data || [];

        // Kiểm tra xem có nguyên liệu nào trong recipe mà trong inventory đã quá hạn không
        const expiredIngredients = [];
        recipeIngredients.forEach((recipeIng) => {
          const recipeIngredientId = recipeIng.ingredientId || recipeIng.ingredient?.id || recipeIng.id;
          if (!recipeIngredientId) return;

          // Tìm các inventory items có cùng ingredientId
          const matchingInventoryItems = inventoryItems.filter(
            (inv) => inv.ingredientId === recipeIngredientId || inv.ingredientId === String(recipeIngredientId)
          );

          // Kiểm tra xem có item nào quá hạn không
          const hasExpired = matchingInventoryItems.some((inv) => {
            if (!inv.expirationDate) return false;
            return checkExpiredIngredients(inv.expirationDate);
          });

          if (hasExpired) {
            const ingredientName = recipeIng.ingredientName || recipeIng.ingredient?.name || recipeIng.name || "Nguyên liệu không xác định";
            expiredIngredients.push(ingredientName);
          }
        });

        // Nếu có nguyên liệu quá hạn, không cho phép nấu
        if (expiredIngredients.length > 0) {
          toast.dismiss(loadingToast);
          const expiredList = expiredIngredients.join(", ");
          toast.error(
            `Không thể nấu món ăn này vì có nguyên liệu đã quá hạn: ${expiredList}. Vui lòng kiểm tra tủ lạnh và xóa các nguyên liệu quá hạn trước khi nấu.`,
            { autoClose: 6000 }
          );
          return;
        }
      } catch (checkError) {
        console.warn("Lỗi khi kiểm tra nguyên liệu quá hạn:", checkError);
        // Nếu không thể kiểm tra, vẫn cho phép nấu (backend sẽ kiểm tra lại)
        toast.dismiss(loadingToast);
        loadingToast = null;
      }

      // Nếu không có nguyên liệu quá hạn, tiếp tục nấu
      if (!token) {
        // Nếu không có token, cần userId từ localStorage
        if (!userId) {
          toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.", { autoClose: 3000 });
          return;
        }

        // Hiển thị loading toast
        if (!loadingToast) {
          loadingToast = toast.loading("Đang nấu món ăn...", { autoClose: false });
        }

        // Gọi API cook recipe với userId (vì không có token)
        const response = await cookRecipe(recipeId, userId);

        // Đóng loading toast
        toast.dismiss(loadingToast);
        loadingToast = null;

        // Hiển thị thông báo thành công
        showCookSuccessMessage(response, recipeTitle);
      } else {
        // Có token → userId sẽ tự động lấy từ token, không cần gửi userId
        // Nhưng nếu backend không parse được User từ token, sẽ cần userId fallback
        let userIdFallback = null;
        try {
          const userDataString = localStorage.getItem("user");
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            userIdFallback = userData.user?.id || userData.id;
          }
        } catch (e) {
          console.warn("Không thể lấy userId từ localStorage:", e);
        }

        // Hiển thị loading toast
        if (!loadingToast) {
          loadingToast = toast.loading("Đang nấu món ăn...", { autoClose: false });
        }

        try {
          // Thử gọi API cook recipe không cần userId (sẽ lấy từ token)
          const response = await cookRecipe(recipeId);

          // Đóng loading toast
          toast.dismiss(loadingToast);
          loadingToast = null;

          // Hiển thị thông báo thành công
          showCookSuccessMessage(response, recipeTitle);
        } catch (firstError) {
          // Nếu lỗi liên quan đến userId và có userId fallback, thử lại với userId
          const errorMsg = firstError.response?.data?.message || firstError.response?.data?.error || "";
          const isUserIdError = errorMsg.toLowerCase().includes("userid") ||
            errorMsg.toLowerCase().includes("user id") ||
            errorMsg.toLowerCase().includes("đăng nhập") ||
            errorMsg.toLowerCase().includes("authentication") ||
            (errorMsg.toLowerCase().includes("bắt buộc") && errorMsg.toLowerCase().includes("user"));

          if (isUserIdError && userIdFallback) {
            console.log("Token không hợp lệ, thử lại với userId:", userIdFallback);
            try {
              const response = await cookRecipe(recipeId, userIdFallback);

              // Đóng loading toast
              toast.dismiss(loadingToast);
              loadingToast = null;

              // Hiển thị thông báo thành công
              showCookSuccessMessage(response, recipeTitle);
              return; // Thành công, không cần throw error
            } catch {
              // Nếu retry cũng fail, throw error gốc
              throw firstError;
            }
          } else {
            // Không phải lỗi userId hoặc không có userId fallback, throw error gốc
            throw firstError;
          }
        }
      }
    } catch (err) {
      // Đóng loading toast nếu có
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      console.error("Lỗi khi nấu recipe:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        recipeId: recipeId,
        recipeTitle: recipeTitle
      });

      let errorMessage = "Không thể nấu món ăn. Vui lòng thử lại.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        // Ưu tiên hiển thị message từ backend nếu có
        const backendMessage = data?.message || data?.error || "";

        if (status === 400) {
          // Kiểm tra các loại lỗi 400 khác nhau
          const errorMsg = backendMessage.toLowerCase();

          // Kiểm tra message về userId trước (quan trọng nhất)
          if (errorMsg.includes("userid") ||
            errorMsg.includes("user id") ||
            errorMsg.includes("đăng nhập") ||
            errorMsg.includes("authentication") ||
            (errorMsg.includes("bắt buộc") && errorMsg.includes("user"))) {
            // Hiển thị message từ backend hoặc message mặc định
            errorMessage = backendMessage || "Vui lòng đăng nhập hoặc cung cấp userId để nấu món ăn.";
          } else if (errorMsg.includes("nullpointerexception") ||
            errorMsg.includes("null pointer") ||
            errorMsg.includes("null reference")) {
            errorMessage = backendMessage || "Dữ liệu không hợp lệ. Có thể công thức, nguyên liệu hoặc thông tin người dùng không tồn tại. Vui lòng thử lại hoặc liên hệ hỗ trợ.";
          } else if (errorMsg.includes("query did not return a unique result") ||
            errorMsg.includes("2 results were returned") ||
            errorMsg.includes("multiple results")) {
            errorMessage = "Có nhiều nguyên liệu cùng loại trong tủ lạnh. Vui lòng kiểm tra và xóa các nguyên liệu trùng lặp trước khi nấu.";
          } else if (errorMsg.includes("không đủ nguyên liệu") ||
            errorMsg.includes("không có trong tủ lạnh")) {
            errorMessage = backendMessage;
          } else if (errorMsg.includes("recipe") || errorMsg.includes("công thức")) {
            errorMessage = backendMessage || "Không tìm thấy công thức. Vui lòng thử lại.";
          } else {
            // Nếu có message từ backend, ưu tiên hiển thị nó
            errorMessage = backendMessage || "Không đủ nguyên liệu để nấu món ăn này.";
          }
        } else if (status === 404) {
          errorMessage = backendMessage || "Không tìm thấy công thức hoặc người dùng.";
        } else if (status === 401) {
          errorMessage = backendMessage || "Bạn cần đăng nhập để nấu món ăn.";
        } else if (status === 500) {
          const errorMsg = backendMessage.toLowerCase();
          if (errorMsg.includes("nullpointerexception") ||
            errorMsg.includes("null pointer") ||
            errorMsg.includes("null reference")) {
            errorMessage = backendMessage || "Lỗi server: Dữ liệu không hợp lệ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
          } else if (errorMsg.includes("query did not return a unique result")) {
            errorMessage = "Có nhiều nguyên liệu cùng loại trong tủ lạnh. Vui lòng kiểm tra và xóa các nguyên liệu trùng lặp trước khi nấu.";
          } else {
            errorMessage = backendMessage || "Lỗi server: Vui lòng thử lại sau.";
          }
        } else {
          errorMessage = backendMessage || `Lỗi ${status}: Không thể nấu món ăn.`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, { autoClose: 6000 });
    }
  };

  // Helper function để hiển thị thông báo thành công
  const showCookSuccessMessage = (response, recipeTitle) => {
    // Hiển thị thông báo thành công với chi tiết
    const ingredientsList = response.deductedIngredients
      ?.map((ing) => {
        const status = ing.removedFromInventory ? " (đã hết)" : ` (còn lại: ${ing.remainingQuantity} ${ing.unit})`;
        return `• ${ing.ingredientName}: -${ing.deductedQuantity} ${ing.unit}${status}`;
      })
      .join("\n") || "";

    toast.success(
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          {response.message || `Đã nấu món "${recipeTitle}" thành công!`}
        </div>
        {ingredientsList && (
          <div style={{ fontSize: "12px", whiteSpace: "pre-line", textAlign: "left" }}>
            {ingredientsList}
          </div>
        )}
      </div>,
      { autoClose: 3000 }
    );

    // Reload trang để cập nhật thông tin recipe và inventory
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // =========================
  //   SUBMIT RECIPE FOR SHARING
  // =========================
  const handleSubmitForSharing = async () => {
    const userDataString = localStorage.getItem("user");
    let userId = null;
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        userId = userData?.user?.id || userData?.id;
      } catch (e) {
        console.warn("Cannot parse user data:", e);
      }
    }

    if (!userId) {
      toast.error("Please login to submit recipe", { autoClose: 2000 });
      return;
    }

    const confirmed = window.confirm(
      `Submit "${recipe?.title}" for admin approval to share publicly?`
    );
    if (!confirmed) return;

    try {
      await axios.put(`/user-recipes/${id}/submit`, null, {
        params: { userId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Recipe submitted for approval!", { autoClose: 2000 });

      // Refresh recipe data
      const res = await axios.get(`/recipes/${id}`);
      setRecipe(res.data);
    } catch (error) {
      console.error("Error submitting recipe:", error);
      const errorMsg = error.response?.data?.message || "Cannot submit recipe";
      toast.error(errorMsg, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipe(res.data);
    };
    fetchRecipe();
  }, [id]);

  // Load comments for a specific page
  const loadCommentsForPage = useCallback(async (page) => {
    if (!id) return;

    try {
      setLoadingComments(true);

      // Get current userId from localStorage
      const userDataString = localStorage.getItem("user");
      let userId = null;
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userId = userData?.user?.id || userData?.id;
        } catch (e) {
          console.warn("Failed to parse user data:", e);
        }
      }

      // Call API with pagination and userId params
      const data = await getRecipeComments(id, { page, size: 5, userId });
      const allComments = Array.isArray(data) ? data : [];

      // If backend returns more than 5 comments (no pagination support),
      // FE handles pagination: only get 5 comments for current page
      const startIndex = page * 5;
      const endIndex = startIndex + 5;
      const displayedComments = allComments.slice(startIndex, endIndex);

      setComments(displayedComments);
      setCurrentPage(page);

      // Check if there are more comments after current page
      const hasMore = allComments.length > endIndex;
      setHasMorePages(hasMore);

      // Calculate total pages based on total comments
      const calculatedTotalPages = Math.ceil(allComments.length / 5) || 1;
      setTotalPages(calculatedTotalPages);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  // Load comments for this recipe - trang đầu tiên
  useEffect(() => {
    if (!id) return;
    loadCommentsForPage(0);
  }, [id, loadCommentsForPage]);

  // Tính toán các số trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Hiển thị tối đa 5 số trang

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= 5, hiển thị tất cả
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu nhiều hơn 5 trang, hiển thị logic thông minh
      if (currentPage < 3) {
        // Ở đầu: 0, 1, 2, 3, 4, ...
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
      } else if (currentPage > totalPages - 4) {
        // Ở cuối: ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa: ..., currentPage-1, currentPage, currentPage+1, ...
        for (let i = currentPage - 1; i <= currentPage + 3; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Fetch username cho các comment chỉ có userId
  useEffect(() => {
    const loadUsernames = async () => {
      // Lọc các userId cần fetch: có userId, không có userName trong comment, chưa có trong usernames state, và chưa đang được fetch
      const missingIds = Array.from(
        new Set(
          comments
            .filter((c) => {
              if (!c.userId || c.userName) return false;
              // Đã có trong state (kể cả null - đã thử fetch nhưng fail)
              if (c.userId in usernames) return false;
              // Đang được fetch
              if (fetchingUsernames.has(c.userId)) return false;
              return true;
            })
            .map((c) => c.userId)
        )
      );

      if (missingIds.length === 0) return;

      // Đánh dấu các userId đang được fetch
      setFetchingUsernames((prev) => {
        const next = new Set(prev);
        missingIds.forEach((uid) => next.add(uid));
        return next;
      });

      try {
        const results = await Promise.all(
          missingIds.map(async (uid) => {
            try {
              const name = await getUsernameById(uid);
              return { uid, name, success: true };
            } catch (err) {
              // Log error nhưng không throw để không làm gián đoạn các request khác
              console.warn(`Failed to load username for user ${uid}:`, err.response?.status || err.message);
              return { uid, name: null, success: false };
            }
          })
        );

        // Cập nhật usernames state và xóa khỏi fetching set
        setUsernames((prev) => {
          const next = { ...prev };
          results.forEach(({ uid, name }) => {
            // Chỉ set nếu có name và đảm bảo name là string
            if (name && typeof name === 'string') {
              next[uid] = name;
            } else if (name && typeof name === 'object' && name.username) {
              // Nếu name là object, extract username
              next[uid] = String(name.username || name.userName || '');
            } else {
              // Đánh dấu đã thử fetch nhưng fail để không fetch lại
              next[uid] = null;
            }
          });
          return next;
        });

        // Xóa khỏi fetching set
        setFetchingUsernames((prev) => {
          const next = new Set(prev);
          missingIds.forEach((uid) => next.delete(uid));
          return next;
        });
      } catch (err) {
        console.error("Failed to load usernames", err);
        // Xóa khỏi fetching set khi có lỗi
        setFetchingUsernames((prev) => {
          const next = new Set(prev);
          missingIds.forEach((uid) => next.delete(uid));
          return next;
        });
      }
    };

    if (comments.length > 0) {
      loadUsernames();
    }
    // Chỉ phụ thuộc vào comments, không phụ thuộc vào usernames hoặc fetchingUsernames để tránh vòng lặp vô hạn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);

      // Lấy userId từ localStorage (cùng convention với Fridge / EditProfile)
      const userDataString = localStorage.getItem("user");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.user?.id || userData?.id;

      // Upload media nếu có – backend trả về CommentMediaResponseDTO { url, type, ... }
      let mediaPayload = [];
      if (selectedFiles.length > 0) {
        try {
          setUploadingMedia(true);
          const uploaded = await Promise.all(
            selectedFiles.map((file) => uploadCommentMedia(file))
          );
          mediaPayload = uploaded
            .map((m) => (m?.url && m?.type ? { url: m.url, type: m.type } : null))
            .filter(Boolean);
        } finally {
          setUploadingMedia(false);
        }
      }

      const payload = {
        content: newComment.trim(),
        userId,
        ...(mediaPayload.length ? { media: mediaPayload } : {}),
      };

      await createRecipeComment(id, payload);
      // Reload về trang đầu tiên để đảm bảo comment mới hiển thị đúng
      await loadCommentsForPage(0);
      setNewComment("");
      setSelectedFiles([]);
      setMediaPreviews([]);
    } catch (err) {
      console.error("Failed to submit comment", err);
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditMedia(comment.media || []);
    setEditMediaToDelete([]);
    setEditNewFiles([]);
    setEditNewFilePreviews([]);
  };

  const handleSaveEdit = async (commentId) => {
    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id;

    try {
      // Upload new files if any
      let newMediaUploaded = [];
      if (editNewFiles.length > 0) {
        try {
          setUploadingMedia(true);
          const uploaded = await Promise.all(
            editNewFiles.map((file) => uploadCommentMedia(file))
          );
          newMediaUploaded = uploaded
            .map((m) => (m?.url && m?.type ? { url: m.url, type: m.type } : null))
            .filter(Boolean);
        } finally {
          setUploadingMedia(false);
        }
      }

      // Filter out deleted media from existing media
      const remainingMedia = editMedia.filter(
        (m) => !editMediaToDelete.includes(m.id || m.url)
      );

      // Merge remaining media with newly uploaded media
      const finalMedia = [...remainingMedia, ...newMediaUploaded];

      const payload = {
        content: editContent.trim(),
        userId,
        media: finalMedia,
      };

      await updateRecipeComment(commentId, payload);
      await loadCommentsForPage(currentPage); // Reload current page
      setEditingCommentId(null);
      setEditContent("");
      setEditMedia([]);
      setEditMediaToDelete([]);
      setEditNewFiles([]);
      setEditNewFilePreviews([]);
    } catch (err) {
      console.error("Failed to update comment", err);
      alert("Không thể cập nhật bình luận. Vui lòng thử lại.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditMedia([]);
    setEditMediaToDelete([]);
    setEditNewFiles([]);
    setEditNewFilePreviews([]);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      return;
    }

    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id;

    try {
      await deleteRecipeComment(commentId, userId);
      await loadCommentsForPage(currentPage); // Reload current page
    } catch (err) {
      console.error("Failed to delete comment", err);
      alert("Không thể xóa bình luận. Vui lòng thử lại.");
    }
  };

  // Handle reaction toggle
  const handleReactionToggle = async (commentId, reactionType, currentUserReaction) => {
    try {
      if (currentUserReaction === reactionType) {
        // Remove reaction if clicking the same type
        await removeCommentReaction(commentId);
      } else {
        // Add or update reaction
        await addCommentReaction(commentId, reactionType);
      }
      // Reload comments to update reaction counts
      await loadCommentsForPage(currentPage);
    } catch (err) {
      console.error("Failed to toggle reaction", err);
    }
  };

  // Handle reply
  const handleReplyClick = (comment) => {
    setReplyingTo({
      commentId: comment.id,
      userName: comment.username || comment.userFullName || `User #${comment.userId}`
    });
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    try {
      setSubmittingComment(true);

      const userDataString = localStorage.getItem("user");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.user?.id || userData?.id;

      const payload = {
        content: replyContent.trim(),
        userId,
        parentCommentId: replyingTo.commentId,
      };

      await createRecipeComment(id, payload);
      await loadCommentsForPage(currentPage);
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to submit reply", err);
      alert("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmittingComment(false);
    }
  };


  // Zoom modal handlers
  const handleImageClick = (imageUrl, allImages, currentIndex) => {
    setZoomImage(imageUrl);
    setZoomGalleryImages(allImages);
    setZoomCurrentIndex(currentIndex);
  };

  const handleCloseZoom = () => {
    setZoomImage(null);
    setZoomGalleryImages([]);
    setZoomCurrentIndex(0);
  };

  const handleZoomPrev = () => {
    if (zoomCurrentIndex > 0) {
      const newIndex = zoomCurrentIndex - 1;
      setZoomCurrentIndex(newIndex);
      setZoomImage(zoomGalleryImages[newIndex]);
    }
  };

  const handleZoomNext = () => {
    if (zoomCurrentIndex < zoomGalleryImages.length - 1) {
      const newIndex = zoomCurrentIndex + 1;
      setZoomCurrentIndex(newIndex);
      setZoomImage(zoomGalleryImages[newIndex]);
    }
  };

  // Keyboard navigation for zoom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!zoomImage) return;

      if (e.key === "Escape") {
        handleCloseZoom();
      } else if (e.key === "ArrowLeft") {
        handleZoomPrev();
      } else if (e.key === "ArrowRight") {
        handleZoomNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomImage, zoomCurrentIndex, zoomGalleryImages]);

  // =========================
  //   MISSING INGREDIENTS: Fetch user inventory
  // =========================
  const fetchUserInventory = async () => {
    const userDataString = localStorage.getItem("user");
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const userId = userData?.user?.id || userData?.id;
    if (!userId) return;

    try {
      setLoadingInventory(true);
      const res = await axios.get(`/inventory/user/${userId}`);
      const inventoryMap = {};
      res.data.forEach(item => {
        inventoryMap[item.ingredientId] = item;
      });
      setUserInventory(inventoryMap);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoadingInventory(false);
    }
  };

  // =========================
  //   MISSING INGREDIENTS: Calculate missing items
  // =========================
  const calculateMissingIngredients = () => {
    if (!recipe?.ingredients) return;

    const missing = [];
    recipe.ingredients.forEach(recipeIng => {
      const inventoryItem = userInventory[recipeIng.ingredientId];

      // Check if missing or insufficient
      if (!inventoryItem) {
        // Completely missing
        missing.push({
          ...recipeIng,
          currentQuantity: 0,
          deficit: recipeIng.quantity
        });
      } else {
        // Check if expired
        const isExpired = inventoryItem.expirationDate &&
          new Date(inventoryItem.expirationDate) < new Date();

        if (isExpired || inventoryItem.quantity < recipeIng.quantity) {
          missing.push({
            ...recipeIng,
            currentQuantity: isExpired ? 0 : inventoryItem.quantity,
            deficit: recipeIng.quantity - (isExpired ? 0 : inventoryItem.quantity)
          });
        }
      }
    });

    setMissingIngredients(missing);
  };

  // =========================
  //   MISSING INGREDIENTS: Handle buy ingredient
  // =========================
  const handleBuyIngredient = (ingredient) => {
    setSelectedMissingIngredient(ingredient);
    setBuyQuantity(ingredient.deficit.toString());
    const today = new Date().toISOString().split('T')[0];
    setBuyPurchaseDate(today);
    setShowBuyModal(true);
  };

  // =========================
  //   MISSING INGREDIENTS: Confirm buy and add to inventory
  // =========================
  const handleConfirmBuy = async () => {
    const userDataString = localStorage.getItem("user");
    if (!userDataString) {
      toast.error("Please log in.");
      return;
    }

    const userData = JSON.parse(userDataString);
    const userId = userData?.user?.id || userData?.id;

    try {
      const payload = {
        userId: Number(userId),
        ingredientId: Number(selectedMissingIngredient.ingredientId),
        quantity: parseFloat(buyQuantity),
      };

      if (buyExpirationDate) {
        payload.expirationDate = buyExpirationDate;
      }

      if (buyPurchaseDate) {
        payload.purchasedAt = buyPurchaseDate;
      } else {
        payload.purchasedAt = new Date().toISOString().split('T')[0];
      }

      await axios.post("/inventory", payload);

      // Refresh inventory and recalculate
      await fetchUserInventory();

      // Close modal
      setShowBuyModal(false);
      setBuyQuantity("");
      setBuyExpirationDate("");
      setBuyPurchaseDate("");
      setSelectedMissingIngredient(null);

      toast.success("Ingredient added to fridge!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error adding ingredient:", error);
      const errorMessage = error.response?.data?.message || "Cannot add ingredient. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Load recipe
  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error("Failed to load recipe", err);
      }
    };

    fetchRecipe();
  }, [id]);

  // Load similar recipes – 7.2 Đề xuất món tương tự
  useEffect(() => {
    if (!id) return;

    const fetchSimilar = async () => {
      try {
        setLoadingSimilar(true);
        const data = await getSimilarRecipes(id);
        // Nếu backend chưa sort thì sort theo similarityScore giảm dần
        const sorted =
          Array.isArray(data)
            ? [...data].sort(
              (a, b) => (b.similarityScore || 0) - (a.similarityScore || 0)
            )
            : [];
        setSimilarRecipes(sorted);
      } catch (err) {
        console.error("Failed to load similar recipes", err);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [id]);

  // Fetch user inventory on mount
  useEffect(() => {
    if (id) {
      fetchUserInventory();
    }
  }, [id]);

  // Recalculate missing ingredients when recipe or inventory changes
  useEffect(() => {
    calculateMissingIngredients();
  }, [recipe, userInventory]);

  if (!recipe) return <div>Loading...</div>;


  // Recursive function to render nested replies
  const renderReplies = (parentId) => {
    const replies = comments.filter(reply => reply.parentId === parentId);
    if (replies.length === 0) return null;

    return replies.map(reply => {
      const userDataString = localStorage.getItem("user");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const currentUserId = userData?.user?.id || userData?.id;
      const isReplyOwner = currentUserId && reply.userId && Number(currentUserId) === Number(reply.userId);
      const hasChildren = comments.some(c => c.parentId === reply.id);

      return (
        <div key={reply.id} className="comment-reply-wrapper">
          <div className="comment-reply-item">
            <div className="comment-avatar">
              <span>{getUserInitial(reply.username || reply.userFullName, reply.userId)}</span>
            </div>
            <div className="comment-body">
              <div className="comment-header">
                <div className="comment-meta-left">
                  <span className="comment-author">
                    {reply.username || reply.userFullName || `User #${reply.userId}`}
                  </span>
                  {reply.createdAt && (
                    <span className="comment-date">{formatDateTime(reply.createdAt)}</span>
                  )}
                </div>
                {isReplyOwner && (
                  <div className="comment-actions-topright">
                    <button
                      className="btn-icon btn-edit-icon"
                      onClick={() => handleEditComment(reply)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                        <path d="M15 5l4 4"></path>
                      </svg>
                    </button>
                    <button
                      className="btn-icon btn-delete-icon"
                      onClick={() => handleDeleteComment(reply.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Edit mode or display mode */}
              {editingCommentId === reply.id ? (
                <div className="comment-edit-mode">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="edit-textarea"
                  />
                  <div className="edit-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleSaveEdit(reply.id)}
                      disabled={!editContent.trim()}
                    >
                      💾 Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      ✖ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-content">{reply.content}</p>

                  {/* Reactions and Reply */}
                  <div className="comment-reactions-section">
                    <div className="comment-reaction-buttons">
                      {['LIKE', 'HELPFUL', 'HAHA', 'LOVE', 'SAD'].map((reactionType) => {
                        const reactionEmojis = { LIKE: '👍', HELPFUL: '💡', HAHA: '😂', LOVE: '❤️', SAD: '😢' };
                        const count = reply.reactionCounts?.[reactionType] || 0;
                        const isActive = reply.currentUserReaction === reactionType;

                        return (
                          <button
                            key={reactionType}
                            className={`reaction-btn reaction-btn-small ${isActive ? 'active' : ''}`}
                            onClick={() => handleReactionToggle(reply.id, reactionType, reply.currentUserReaction)}
                            title={reactionType}
                          >
                            <span className="reaction-emoji">{reactionEmojis[reactionType]}</span>
                            {count > 0 && <span className="reaction-count">{count}</span>}
                          </button>
                        );
                      })}

                      <button
                        className="reply-btn reply-btn-small"
                        onClick={() => handleReplyClick(reply)}
                        title="Reply"
                      >
                        💬 Reply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recursively render children of this reply */}
          {hasChildren && (
            <div className="comment-nested-replies">
              {renderReplies(reply.id)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="recipe-detail-hl">
      <ToastContainer />
      <div className="top-nav">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="detail-container">
        {/* LEFT SIDE */}
        <div className="left-content">
          <div className="signature-tag">
            <span>Signature</span>
          </div>

          <h1 className="title_recipe">{recipe.title}</h1>

          {/* Submit for Sharing Button - For DRAFT Recipes */}
          {(() => {
            const userDataString = localStorage.getItem("user");
            const userData = userDataString ? JSON.parse(userDataString) : null;
            const currentUserId = userData?.user?.id || userData?.id;

            // Only show for DRAFT recipes owned by current user
            if (recipe?.status === 'DRAFT' && recipe?.submittedByUserId === currentUserId) {
              return (
                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={handleSubmitForSharing}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <Share2 size={20} /> Submit for Sharing
                  </button>

                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: '#64748b',
                    color: 'white'
                  }}>
                    📝 DRAFT
                  </span>
                </div>
              );
            }

            // Show status badge for non-DRAFT user recipes
            if (recipe?.status && recipe.status !== 'ADMIN_CREATED' && recipe?.submittedByUserId === currentUserId) {
              return (
                <div style={{ margin: '16px 0' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: recipe.status === 'PENDING_APPROVAL' ? '#f59e0b' :
                      recipe.status === 'APPROVED' ? '#10b981' : '#ef4444',
                    color: 'white'
                  }}>
                    {recipe.status === 'PENDING_APPROVAL' ? '⏳ PENDING APPROVAL' :
                      recipe.status === 'APPROVED' ? '✅ APPROVED' : '❌ REJECTED'}
                  </span>
                </div>
              );
            }

            return null;
          })()}

          {/* <p className="subtitle">Perfect For All Soup Bases</p> */}

          <div className="ingredients-table">
            {recipe.ingredients?.map((item, i) => (
              <div key={i} className="row">
                <span className="ingredient-name">{item.ingredientName}</span>
                <span className="ingredient-quantity">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="right-image">
          <img src={convertMediaUrl(recipe.imageUrl)} alt={recipe.title} />
          <div className="badge top-left">
            {recipe.mealType && <span>{recipe.mealType}</span>}
          </div>
          <div className="badge bottom-right">
            {recipe.cookingTimeMinutes && <span>{recipe.cookingTimeMinutes} phút</span>}
          </div>
        </div>

        {/* RIGHT COLUMN - Instructions + Lack of Ingredient */}
        <div className="right-content">
          <div className="instructions-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="instruction-title" style={{ margin: 0 }}>Instructions</h2>
              <button
                onClick={() => handleCookRecipe(recipe.id, recipe.title)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  backgroundColor: "#f97316",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ea580c";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f97316";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <CookingPot size={20} /> Cook
              </button>
            </div>
            <span>{recipe.instructions}</span>
          </div>

          {/* Lack of Ingredient Section - Below Instructions */}
          {!loadingInventory && missingIngredients.length > 0 ? (
            <div style={{ marginTop: "24px", padding: "20px", background: "linear-gradient(135deg, #fff5f0, #ffedd5)", borderRadius: "16px", border: "2px solid #f97316" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#c2410c", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                🛒 Lack of Ingredient
              </h3>
              <p style={{ fontSize: "14px", color: "#9a3412", marginBottom: "16px" }}>
                You need {missingIngredients.length} more ingredient{missingIngredients.length > 1 ? 's' : ''}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
                {missingIngredients.map((item, idx) => (
                  <div key={idx} style={{ padding: "12px 14px", background: "white", borderRadius: "8px", border: "1px solid #fed7aa", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div>
                      <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "15px" }}>{item.ingredientName}</div>
                      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                        Need: <strong style={{ color: "#ea580c" }}>{item.deficit} {item.unit}</strong>
                        {item.currentQuantity > 0 && <span style={{ color: "#fb923c", fontStyle: "italic", fontSize: "12px" }}> (Current: {item.currentQuantity} {item.unit})</span>}
                      </div>
                    </div>
                    <button onClick={() => handleBuyIngredient(item)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px", boxShadow: "0 2px 4px rgba(249, 115, 22, 0.25)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #ea580c, #c2410c)"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #f97316, #ea580c)"; e.currentTarget.style.transform = "translateY(0)"; }}>Buy Now</button>
                  </div>
                ))}
              </div>
            </div>
          ) : !loadingInventory && (
            <div style={{ marginTop: "24px", textAlign: "center", padding: "20px", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: "12px", border: "2px solid #86efac" }}>
              <h3 style={{ color: "#059669", fontSize: "16px", marginBottom: "4px" }}>✅ All Set!</h3>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>You have all ingredients</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar recipes suggestion */}
      <div className="similar-recipes-section">
        <h2 className="similar-title">Gợi ý món tương tự</h2>
        {loadingSimilar ? (
          <p>Đang tải gợi ý...</p>
        ) : similarRecipes.length === 0 ? (
          <p>Chưa có gợi ý phù hợp.</p>
        ) : (
          <div className="similar-grid">
            {similarRecipes.map((item) => (
              <div
                key={item.id}
                className="similar-card"
                onClick={() => navigate(`/manage/recipes/${item.id}`)}
              >
                <img
                  src={convertMediaUrl(item.imageUrl) || "/placeholder-recipe.jpg"}
                  alt={item.title}
                />
                <div className="similar-content">
                  <div className="similar-header">
                    <h3>{item.title}</h3>
                    {typeof item.similarityScore === "number" && (
                      <span className="similar-badge">
                        Gợi ý cho bạn
                      </span>
                    )}
                  </div>
                  <p className="similar-meta">
                    ⏱ {item.cookingTimeMinutes} min • {item.servings} servings
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments section */}
      <div className="comments-section">
        <h2 className="comments-title">Bình luận</h2>

        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-input-wrapper">
            <textarea
              placeholder="Chia sẻ cảm nhận hoặc mẹo nấu món này..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />

            <div className="comment-attachments">
              <label className="comment-attach-label">
                <span>📎 Ảnh / Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                    setMediaPreviews(
                      files.map((file) => ({
                        name: file.name,
                        type: file.type,
                        url: URL.createObjectURL(file),
                      }))
                    );
                  }}
                />
              </label>

              {mediaPreviews.length > 0 && (
                <div className="comment-media-preview">
                  {mediaPreviews.map((m, idx) => (
                    <div key={idx} className="comment-media-thumb">
                      {m.type.startsWith("image") ? (
                        <img src={m.url} alt={m.name} />
                      ) : (
                        <video src={m.url} />
                      )}

                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={
                  submittingComment || uploadingMedia || !newComment.trim()
                }
              >
                {submittingComment || uploadingMedia
                  ? "Đang gửi..."
                  : "Gửi bình luận"}
              </button>

            </div>
          </div>

        </form>

        <div className="comments-list">
          {loadingComments ? (
            <p>Đang tải bình luận...</p>
          ) : comments.length === 0 ? (
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          ) : (
            comments
              .filter(c => !c.parentId) // Only show parent comments, not replies
              .map((c) => {
                const userDataString = localStorage.getItem("user");
                const userData = userDataString ? JSON.parse(userDataString) : null;
                const currentUserId = userData?.user?.id || userData?.id;
                const isOwner = currentUserId && c.userId && Number(currentUserId) === Number(c.userId);

                return (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">
                      <span>
                        {getUserInitial(c.userName, c.userId)}
                      </span>
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <div className="comment-meta-left">
                          <span className="comment-author">
                            {c.userName ||
                              (typeof usernames[c.userId] === 'string' ? usernames[c.userId] : null) ||
                              `User #${c.userId || ""}`}
                          </span>
                          {c.createdAt && (
                            <span className="comment-date">
                              {formatDateTime(c.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Action buttons in top right - SVG icons */}
                        {isOwner && !editingCommentId && (
                          <div className="comment-actions-topright">
                            <button
                              className="btn-icon btn-edit-icon"
                              onClick={() => handleEditComment(c)}
                              title="Sửa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                                <path d="M15 5l4 4"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-delete-icon"
                              onClick={() => handleDeleteComment(c.id)}
                              title="Xóa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <path d="M10 11v6"></path>
                                <path d="M14 11v6"></path>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Edit mode or display mode */}
                      {editingCommentId === c.id ? (
                        <div className="comment-edit-mode">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="edit-textarea"
                          />

                          {/* Existing Media Management */}
                          {editMedia.length > 0 && (
                            <div className="edit-existing-media">
                              <h4 className="edit-media-label">Ảnh hiện tại:</h4>
                              <div className="edit-media-grid">
                                {editMedia
                                  .filter((m) => !editMediaToDelete.includes(m.id || m.url))
                                  .map((m) => (
                                    <div key={m.id || m.url} className="edit-media-item">
                                      {m.type?.startsWith("video") ? (
                                        <video src={convertMediaUrl(m.url)} />
                                      ) : (
                                        <img src={convertMediaUrl(m.url)} alt="" />
                                      )}
                                      <button
                                        type="button"
                                        className="btn-remove-media"
                                        onClick={() => {
                                          setEditMediaToDelete([...editMediaToDelete, m.id || m.url]);
                                        }}
                                        title="Xóa ảnh này"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* New Media Upload */}
                          <div className="edit-new-media">
                            <label className="edit-upload-label">
                              <span>📎 Thêm ảnh/video mới</span>
                              <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  setEditNewFiles([...editNewFiles, ...files]);
                                  setEditNewFilePreviews([
                                    ...editNewFilePreviews,
                                    ...files.map((file) => ({
                                      name: file.name,
                                      type: file.type,
                                      url: URL.createObjectURL(file),
                                    })),
                                  ]);
                                }}
                              />
                            </label>

                            {/* Preview new files */}
                            {editNewFilePreviews.length > 0 && (
                              <div className="edit-new-preview">
                                <h4 className="edit-media-label">Ảnh mới sẽ được thêm:</h4>
                                <div className="edit-media-grid">
                                  {editNewFilePreviews.map((preview, idx) => (
                                    <div key={idx} className="edit-media-item">
                                      {preview.type.startsWith("image") ? (
                                        <img src={preview.url} alt={preview.name} />
                                      ) : (
                                        <video src={preview.url} />
                                      )}
                                      <button
                                        type="button"
                                        className="btn-remove-media"
                                        onClick={() => {
                                          const newFiles = [...editNewFiles];
                                          const newPreviews = [...editNewFilePreviews];
                                          newFiles.splice(idx, 1);
                                          newPreviews.splice(idx, 1);
                                          setEditNewFiles(newFiles);
                                          setEditNewFilePreviews(newPreviews);
                                        }}
                                        title="Xóa ảnh này"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="edit-actions">
                            <button
                              className="btn-save"
                              onClick={() => handleSaveEdit(c.id)}
                              disabled={!editContent.trim() || uploadingMedia}
                            >
                              {uploadingMedia ? "⏳ Đang tải..." : "💾 Lưu"}
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={handleCancelEdit}
                            >
                              ✖ Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-content">{c.content}</p>
                      )}

                      {/* Media thumbnails - clickable for zoom */}
                      {!editingCommentId && Array.isArray(c.media) && c.media.length > 0 && (
                        <div className="comment-media-list">
                          {c.media.map((m, idx) => (
                            <div
                              key={m.id || m.url}
                              className="comment-media-thumb"
                              onClick={() => {
                                if (!m.type?.startsWith("video")) {
                                  const allImages = c.media
                                    .filter((media) => !media.type?.startsWith("video"))
                                    .map((media) => convertMediaUrl(media.url));
                                  const imageIndex = c.media
                                    .filter((media) => !media.type?.startsWith("video"))
                                    .findIndex((media) => media.id === m.id || media.url === m.url);
                                  handleImageClick(convertMediaUrl(m.url), allImages, imageIndex);
                                }
                              }}
                              style={{ cursor: m.type?.startsWith("video") ? "default" : "pointer" }}
                            >
                              {m.type?.startsWith("video") ? (
                                <video src={convertMediaUrl(m.url)} controls />
                              ) : (
                                <img src={convertMediaUrl(m.url)} alt="" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reactions and Reply Section */}
                      {!editingCommentId && (
                        <div className="comment-reactions-section">
                          <div className="comment-reaction-buttons">
                            {['LIKE', 'HELPFUL', 'HAHA', 'LOVE', 'SAD'].map((reactionType) => {
                              const reactionEmojis = {
                                LIKE: '👍',
                                HELPFUL: '💡',
                                HAHA: '😂',
                                LOVE: '❤️',
                                SAD: '😢'
                              };
                              const count = c.reactionCounts?.[reactionType] || 0;
                              const isActive = c.currentUserReaction === reactionType;

                              return (
                                <button
                                  key={reactionType}
                                  className={`reaction-btn ${isActive ? 'active' : ''}`}
                                  onClick={() => handleReactionToggle(c.id, reactionType, c.currentUserReaction)}
                                  title={reactionType}
                                >
                                  <span className="reaction-emoji">{reactionEmojis[reactionType]}</span>
                                  {count > 0 && <span className="reaction-count">{count}</span>}
                                </button>
                              );
                            })}

                            <button
                              className="reply-btn"
                              onClick={() => handleReplyClick(c)}
                              title="Phản hồi"
                            >
                              💬 Reply {c.replyCount > 0 && `(${c.replyCount})`}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies - Recursive */}
                      {!c.parentId && c.replyCount > 0 && (
                        <div className="comment-replies">
                          {renderReplies(c.id)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}

          {/* Reply Form - shown when replying */}
          {replyingTo && (
            <div className="reply-form-container">
              <div className="reply-form-header">
                <span>Reply to <strong>{replyingTo.userName}</strong></span>
                <button className="btn-cancel-reply" onClick={handleCancelReply}>✕</button>
              </div>
              <form onSubmit={handleSubmitReply} className="reply-form">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !replyContent.trim()}
                >
                  {submittingComment ? "Sending..." : "Send Reply"}
                </button>
              </form>
            </div>
          )}


          {/* Simple Load More Pagination */}
          {hasMorePages && (
            <div className="comment-load-more">
              <button
                onClick={() => loadCommentsForPage(currentPage + 1)}
                disabled={loadingComments}
                className="btn-load-more"
              >
                {loadingComments ? "Đang tải..." : "Tải thêm bình luận"}
              </button>
              <span className="page-info">Trang {currentPage + 1} / {totalPages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="zoom-modal-overlay" onClick={handleCloseZoom}>
          <button className="zoom-close-btn" onClick={handleCloseZoom} title="Đóng (ESC)">
            ✕
          </button>

          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed" className="zoom-image" />

            {zoomGalleryImages.length > 1 && (
              <>
                <button
                  className="zoom-nav-btn zoom-prev-btn"
                  onClick={handleZoomPrev}
                  disabled={zoomCurrentIndex === 0}
                  title="Ảnh trước (←)"
                >
                  ‹
                </button>
                <button
                  className="zoom-nav-btn zoom-next-btn"
                  onClick={handleZoomNext}
                  disabled={zoomCurrentIndex === zoomGalleryImages.length - 1}
                  title="Ảnh sau (→)"
                >
                  ›
                </button>
                <div className="zoom-counter">
                  {zoomCurrentIndex + 1} / {zoomGalleryImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedMissingIngredient && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Ingredient to Fridge</h3>
              <button className="icon-btn" onClick={() => setShowBuyModal(false)}>
                ✖
              </button>
            </div>
            <form className="modal-form" onSubmit={(e) => {
              e.preventDefault();
              handleConfirmBuy();
            }}>
              <label>
                Ingredient
                <input
                  type="text"
                  value={selectedMissingIngredient.ingredientName}
                  readOnly
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </label>

              <label>
                Quantity ({selectedMissingIngredient.unit})
                <input
                  type="number"
                  step="any"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  required
                  placeholder={`Suggested: ${selectedMissingIngredient.deficit}`}
                />
                <small style={{ color: "#666", display: "block", marginTop: "4px" }}>
                  Recommended: {selectedMissingIngredient.deficit} {selectedMissingIngredient.unit}
                </small>
              </label>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div style={{ marginTop: "10px" }}>
                  <DatePicker
                    label="Expiration Date"
                    value={buyExpirationDate ? dayjs(buyExpirationDate) : null}
                    onChange={(newValue) => setBuyExpirationDate(newValue ? newValue.format('YYYY-MM-DD') : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>

                <div style={{ marginTop: "10px" }}>
                  <DatePicker
                    label="Purchase Date"
                    maxDate={dayjs()}
                    value={buyPurchaseDate ? dayjs(buyPurchaseDate) : dayjs()}
                    onChange={(newValue) => setBuyPurchaseDate(newValue ? newValue.format('YYYY-MM-DD') : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>
              </LocalizationProvider>

              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setShowBuyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Add to Fridge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
