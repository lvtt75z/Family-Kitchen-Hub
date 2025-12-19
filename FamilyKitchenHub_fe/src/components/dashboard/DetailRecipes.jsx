import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import {
  getSimilarRecipes,
  getRecipeComments,
  createRecipeComment,
  uploadCommentMedia,
} from "../../service/recipesApi";
import { cookRecipe } from "../../service/recipesApi";
import { getUsernameById } from "../../service/usersApi";
import { convertMediaUrl } from "../../utils/mediaUtils";
import { CookingPot } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../../styles/DetailRecipes.css";

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
      // Gọi API với pagination params
      const data = await getRecipeComments(id, { page, size: 5 });
      const allComments = Array.isArray(data) ? data : [];

      // Nếu backend trả về nhiều hơn 5 comments (không hỗ trợ pagination),
      // FE tự phân trang: chỉ lấy 5 comments cho trang hiện tại
      const startIndex = page * 5;
      const endIndex = startIndex + 5;
      const displayedComments = allComments.slice(startIndex, endIndex);

      setComments(displayedComments);
      setCurrentPage(page);

      // Kiểm tra xem còn comment nào sau trang hiện tại không
      const hasMore = allComments.length > endIndex;
      setHasMorePages(hasMore);

      // Tính tổng số trang dựa trên tổng số comments
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

  if (!recipe) return <div>Loading...</div>;

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
              <CookingPot size={20} /> Nấu món này
            </button>
          </div>
          <span>{recipe.instructions}</span>
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
            comments.map((c) => (
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
                  </div>
                  <p className="comment-content">{c.content}</p>

                  {Array.isArray(c.media) && c.media.length > 0 && (
                    <div className="comment-media-list">
                      {c.media.map((m) => (
                        <div key={m.id || m.url} className="comment-media-thumb">
                          {m.type?.startsWith("video") ? (
                            <video src={m.url} controls />
                          ) : (
                            <img src={m.url} alt="" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {comments.length > 0 && totalPages > 1 && (
            <div className="comment-pagination">
              <button
                onClick={() => loadCommentsForPage(currentPage - 1)}
                disabled={currentPage === 0 || loadingComments}
                className="pagination-btn pagination-nav"
                aria-label="Previous page"
              >
                &lt;
              </button>

              {getPageNumbers().map((pageNum, index) => {
                const pageNumbers = getPageNumbers();
                const showEllipsisBefore = index === 0 && pageNum > 0;
                const showEllipsisAfter =
                  index === pageNumbers.length - 1 &&
                  pageNum < totalPages - 1 &&
                  hasMorePages;

                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsisBefore && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      onClick={() => loadCommentsForPage(pageNum)}
                      disabled={loadingComments}
                      className={`pagination-btn pagination-number ${currentPage === pageNum ? "active" : ""
                        }`}
                    >
                      {pageNum + 1}
                    </button>
                    {showEllipsisAfter && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                  </React.Fragment>
                );
              })}

              <button
                onClick={() => loadCommentsForPage(currentPage + 1)}
                disabled={!hasMorePages || loadingComments}
                className="pagination-btn pagination-nav"
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
