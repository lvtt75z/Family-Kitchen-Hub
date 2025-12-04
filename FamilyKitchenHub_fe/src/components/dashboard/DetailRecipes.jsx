import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import {
  getSimilarRecipes,
  getRecipeComments,
  createRecipeComment,
  uploadCommentMedia,
} from "../../service/recipesApi";
import { getUsernameById } from "../../service/usersApi";
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
      const missingIds = Array.from(
        new Set(
          comments
            .filter((c) => c.userId && !c.userName && !usernames[c.userId])
            .map((c) => c.userId)
        )
      );

      if (missingIds.length === 0) return;

      try {
        const results = await Promise.all(
          missingIds.map(async (uid) => {
            try {
              const name = await getUsernameById(uid);
              return { uid, name };
            } catch {
              return { uid, name: null };
            }
          })
        );

        setUsernames((prev) => {
          const next = { ...prev };
          results.forEach(({ uid, name }) => {
            if (name) next[uid] = name;
          });
          return next;
        });
      } catch (err) {
        console.error("Failed to load usernames", err);
      }
    };

    if (comments.length > 0) {
      loadUsernames();
    }
  }, [comments, usernames]);

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

          <p className="subtitle">Perfect For All Soup Bases</p>

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
          <img src={recipe.imageUrl} alt={recipe.title} />
        </div>
        <div className="instructions-section">
          <h2 className="instruction-title">Instructions</h2>
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
                  src={item.imageUrl || "/placeholder-recipe.jpg"}
                  alt={item.title}
                />
                <div className="similar-content">
                  <div className="similar-header">
                    <h3>{item.title}</h3>
                    {typeof item.similarityScore === "number" && (
                      <span className="similar-badge">
                        Gợi ý • {(item.similarityScore * 100).toFixed(0)}%
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
            </div>
          </div>

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
                          usernames[c.userId] ||
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
                      className={`pagination-btn pagination-number ${
                        currentPage === pageNum ? "active" : ""
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
