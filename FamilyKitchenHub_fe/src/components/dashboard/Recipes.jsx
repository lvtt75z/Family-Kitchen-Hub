import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import "./../../styles/Recipes.css";
import RecipesBook from "../../assets/recipe-book.png";
import bgFooter from "../../assets/bgfooter.png";
import {
  Heart,
  X,
  Search,
  ChevronDown,
  ChefHat,
  CookingPot,
  Bell
} from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { convertMediaUrl } from "../../utils/mediaUtils";
import { getCookableRecipes, getBookmarkedRecipes, addRecipeBookmark, removeRecipeBookmark } from "../../service/recipesApi";
import { createReminder, getUserReminders, deleteReminder } from "../../service/reminderApi";

export default function RecipeDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // =========================
  //  FORM DEFAULT – LUÔN ĐỒNG BỘ
  // =========================
  const defaultForm = {
    title: "",
    instructions: "",
    cookingTimeMinutes: "",
    servings: "",
    mealType: "",
    imageUrl: "",
    ingredients: [],
    categoryIds: [],
  };

  const [recipes, setRecipes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null); // Track recipe đang được edit
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    itemId: null,
    itemTitle: ''
  });
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [allIngredients, setAllIngredients] = useState([]);
  const [search, setSearch] = useState(""); // Recipe search
  const [searchResults, setSearchResults] = useState([]); // Recipe search results
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Recipe filtering states
  const [filterCookable, setFilterCookable] = useState(false);
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [filterReminders, setFilterReminders] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Bookmark states
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState(new Set());
  const [bookmarking, setBookmarking] = useState({});

  // Reminder states
  const [recipesWithReminders, setRecipesWithReminders] = useState(new Map()); // Map of recipeId -> [reminders]
  const [reminderModal, setReminderModal] = useState({
    isOpen: false,
    recipeId: null,
    recipeTitle: "",
  });
  const [reminderForm, setReminderForm] = useState({
    reminderAt: "",
    note: "",
  });

  // Ingredient search states for each ingredient row
  const [ingredientSearches, setIngredientSearches] = useState({}); // { index: keyword }
  const [ingredientDropdowns, setIngredientDropdowns] = useState({}); // { index: boolean }
  const [ingredientSearching, setIngredientSearching] = useState({}); // { index: boolean }
  const searchTimeoutsRef = useRef({}); // { index: timeoutId }

  // =========================
  //   LOAD INGREDIENTS (1 LẦN)
  // =========================
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await axios.get("/ingredients");
        setAllIngredients(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(" Lỗi khi tải ingredients:", err);
      }
    };

    fetchIngredients();

    // Fetch Categories
    axios
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // =========================
  //   SEARCH INGREDIENTS WITH DEBOUNCE
  // =========================
  const handleIngredientSearch = (index, keyword) => {
    // Update search keyword
    setIngredientSearches((prev) => ({ ...prev, [index]: keyword }));
    setIngredientDropdowns((prev) => ({ ...prev, [index]: true }));

    // Clear previous timeout
    if (searchTimeoutsRef.current[index]) {
      clearTimeout(searchTimeoutsRef.current[index]);
    }

    // If empty, load all ingredients
    if (!keyword.trim()) {
      const loadAll = async () => {
        try {
          const res = await axios.get("/ingredients");
          setAllIngredients(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Error loading ingredients:", err);
        }
      };
      loadAll();
      return;
    }

    // Set debounce timeout
    searchTimeoutsRef.current[index] = setTimeout(async () => {
      try {
        setIngredientSearching((prev) => ({ ...prev, [index]: true }));
        const res = await axios.get("/ingredients/search", {
          params: { keyword: keyword.trim() },
        });
        setAllIngredients(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error searching ingredients:", err);
      } finally {
        setIngredientSearching((prev) => ({ ...prev, [index]: false }));
      }
    }, 300);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ingredient-search-container')) {
        setIngredientDropdowns({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // =========================
  //   LOAD RECIPES
  // =========================
  // =========================
  //   LOAD RECIPES
  // =========================
  useEffect(() => {
    // If searching text not empty, skip category fetch to avoid conflict
    if (search.trim()) return;

    const fetchRecipes = async () => {
      try {
        let url = "/recipes";
        if (selectedCategory) {
          url = `/categories/${selectedCategory}/recipes`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data);
        setSearchResults(res.data); //  INIT SEARCH RESULTS
      } catch (err) {
        console.error("Lỗi khi tải recipes:", err);
      }
    };
    fetchRecipes();
  }, [token, selectedCategory]);

  const handleCategoryClick = (id) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
    setSearch(""); // Reset search text when choosing category
  };

  // =========================
  //   SEARCH RECIPES
  // =========================
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.trim()) {
      setSelectedCategory(null);
    } else {
      setSearchResults(recipes);
      return;
    }

    try {
      const res = await axios.get(`/recipes/search`, {
        params: { name: query },
      });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error(" Lỗi khi tìm kiếm recipes:", err);
      setSearchResults([]);
    }
  };

  // =========================
  //   RECIPE FILTERS
  // =========================
  const handleFilterToggle = async (filterType) => {
    try {
      // Get userId from localStorage
      const userDataString = localStorage.getItem("user");
      let userId = null;
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userId = userData.user?.id || userData.id;
        } catch (e) {
          console.warn("Cannot parse user data:", e);
        }
      }

      if (!userId) {
        toast.error("Vui lòng đăng nhập để sử dụng bộ lọc", { autoClose: 2000 });
        return;
      }

      setLoadingFilters(true);

      // Helper function to apply filter intersection
      const applyFilters = async (currentFilters) => {
        let result = recipes;

        if (currentFilters.cookable) {
          try {
            const cookableRecipes = await getCookableRecipes(userId);
            result = cookableRecipes;
          } catch (error) {
            // Silently handle 500 errors - backend may not have this endpoint implemented yet
            if (error.response?.status !== 500) {
              console.error("Error fetching cookable recipes:", error);
            }
            // Fallback to all recipes if endpoint fails
            result = recipes;
          }
        }

        if (currentFilters.bookmarked) {
          try {
            const bookmarkedRecipes = await getBookmarkedRecipes(userId);
            const bookmarkedIds = new Set(bookmarkedRecipes.map(r => r.id));

            if (currentFilters.cookable) {
              result = result.filter(r => bookmarkedIds.has(r.id));
            } else {
              result = bookmarkedRecipes;
            }
          } catch (error) {
            // Silently handle 500 errors - backend may not have this endpoint implemented yet
            if (error.response?.status !== 500) {
              console.error("Error fetching bookmarked recipes:", error);
            }
            // Fallback: if cookable filter is active, keep current result; otherwise use all recipes
            if (!currentFilters.cookable) {
              result = recipes;
            }
          }
        }

        if (currentFilters.reminders) {
          const reminderRecipeIds = Array.from(recipesWithReminders.keys());

          if (currentFilters.cookable || currentFilters.bookmarked) {
            result = result.filter(r => reminderRecipeIds.includes(r.id));
          } else {
            result = recipes.filter(r => reminderRecipeIds.includes(r.id));
          }
        }

        return result;
      };

      if (filterType === "cookable") {
        const newValue = !filterCookable;
        setFilterCookable(newValue);

        const filtered = await applyFilters({
          cookable: newValue,
          bookmarked: filterBookmarked,
          reminders: filterReminders,
        });
        setSearchResults(filtered);
      } else if (filterType === "bookmarked") {
        const newValue = !filterBookmarked;
        setFilterBookmarked(newValue);

        const filtered = await applyFilters({
          cookable: filterCookable,
          bookmarked: newValue,
          reminders: filterReminders,
        });
        setSearchResults(filtered);
      } else if (filterType === "reminders") {
        const newValue = !filterReminders;
        setFilterReminders(newValue);

        const filtered = await applyFilters({
          cookable: filterCookable,
          bookmarked: filterBookmarked,
          reminders: newValue,
        });
        setSearchResults(filtered);
      }

      // Clear search and category when using filters
      setSearch("");
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error applying filter:", error);
      toast.error("Không thể áp dụng bộ lọc. Vui lòng thử lại.", { autoClose: 2000 });
    } finally {
      setLoadingFilters(false);
    }
  };

  const clearAllFilters = () => {
    setFilterCookable(false);
    setFilterBookmarked(false);
    setFilterReminders(false);
    setSearchResults(recipes);
    setSearch("");
    setSelectedCategory(null);
  };

  // =========================
  //   BOOKMARK HANDLING
  // =========================
  const handleBookmark = async (e, recipeId) => {
    e.stopPropagation();

    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id || localStorage.getItem("userId");

    if (!userId) {
      toast.error("Please login to bookmark recipes", { autoClose: 2000 });
      return;
    }

    const isBookmarked = bookmarkedRecipes.has(recipeId);
    setBookmarking(prev => ({ ...prev, [recipeId]: true }));

    try {
      if (isBookmarked) {
        await removeRecipeBookmark(recipeId, Number(userId));
        setBookmarkedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        await addRecipeBookmark(recipeId, { userId: Number(userId) });
        setBookmarkedRecipes(prev => new Set(prev).add(recipeId));
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Error bookmarking recipe", { autoClose: 2000 });
    } finally {
      setBookmarking(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  // Fetch bookmarked recipes and reminders on load
  useEffect(() => {
    const fetchBookmarkedStatus = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const userId = userData?.user?.id || userData?.id;

        if (userId) {
          const bookmarked = await getBookmarkedRecipes(userId);
          const bookmarkedIds = new Set(bookmarked.map(r => r.id));
          setBookmarkedRecipes(bookmarkedIds);
        }
      } catch (error) {
        // Silently handle 500 errors - backend may not have these endpoints implemented yet
        if (error.response?.status !== 500) {
          console.error("Error fetching bookmarked recipes:", error);
        }
      }
    };

    const fetchReminders = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const userId = userData?.user?.id || userData?.id;

        if (userId) {
          const reminders = await getUserReminders(userId, "upcoming");
          // Group reminders by recipeId
          const reminderMap = new Map();
          reminders.forEach(reminder => {
            if (!reminderMap.has(reminder.recipeId)) {
              reminderMap.set(reminder.recipeId, []);
            }
            reminderMap.get(reminder.recipeId).push(reminder);
          });
          setRecipesWithReminders(reminderMap);
        }
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };

    fetchBookmarkedStatus();
    fetchReminders();
  }, []);

  // =========================
  //   REMINDER HANDLING
  // =========================
  const handleReminderClick = async (e, recipeId, recipeTitle) => {
    e.stopPropagation();

    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id;

    if (!userId) {
      toast.error("Vui lòng đăng nhập để đặt nhắc nhở", { autoClose: 2000 });
      return;
    }

    // Check if reminder exists for this recipe
    const hasReminder = recipesWithReminders.has(recipeId);

    if (hasReminder) {
      // Cancel reminder with confirmation
      const confirmed = window.confirm(`Bạn có muốn hủy nhắc nhở cho món "${recipeTitle}"?`);
      if (confirmed) {
        await handleCancelReminder(recipeId, userId);
      }
    } else {
      // Check if recipe is cookable (has enough ingredients) before allowing reminder
      try {
        const cookableRecipes = await getCookableRecipes(userId);
        const isCookable = cookableRecipes.some(r => r.id === recipeId);

        if (!isCookable) {
          toast.error(
            "Bạn không thể đặt nhắc nhở cho món này vì không đủ nguyên liệu trong tủ lạnh. Vui lòng thêm nguyên liệu trước khi đặt nhắc nhở.",
            { autoClose: 4000 }
          );
          return;
        }

        // Open modal to set reminder
        setReminderModal({
          isOpen: true,
          recipeId,
          recipeTitle,
        });
        // Set default reminder time to tomorrow at 9 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const defaultTime = tomorrow.toISOString().slice(0, 16);
        setReminderForm({
          reminderAt: defaultTime,
          note: "",
        });
      } catch (error) {
        console.error("Error checking if recipe is cookable:", error);
        toast.error("Không thể kiểm tra nguyên liệu. Vui lòng thử lại.", { autoClose: 2000 });
      }
    }
  };

  const handleCancelReminder = async (recipeId, userId) => {
    try {
      const remindersForRecipe = recipesWithReminders.get(recipeId) || [];

      if (remindersForRecipe.length === 0) {
        toast.error("Không tìm thấy nhắc nhở để hủy", { autoClose: 2000 });
        return;
      }

      // Cancel all reminders for this recipe
      for (const reminder of remindersForRecipe) {
        await deleteReminder(userId, reminder.id);
      }

      // Update state
      setRecipesWithReminders(prev => {
        const newMap = new Map(prev);
        newMap.delete(recipeId);
        return newMap;
      });

      toast.success("Đã hủy nhắc nhở thành công!", { autoClose: 2000 });
    } catch (error) {
      console.error("Error canceling reminder:", error);
      toast.error("Không thể hủy nhắc nhở. Vui lòng thử lại.", { autoClose: 2000 });
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();

    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id;

    if (!userId) {
      toast.error("Vui lòng đăng nhập để đặt nhắc nhở", { autoClose: 2000 });
      return;
    }

    try {
      const reminderData = {
        recipeId: reminderModal.recipeId,
        reminderAt: reminderForm.reminderAt,
        note: reminderForm.note || null,
      };

      const createdReminder = await createReminder(userId, reminderData);

      // Update state
      setRecipesWithReminders(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(reminderModal.recipeId) || [];
        newMap.set(reminderModal.recipeId, [...existing, createdReminder]);
        return newMap;
      });

      toast.success("Đã đặt nhắc nhở thành công!", { autoClose: 2000 });

      // Close modal
      setReminderModal({
        isOpen: false,
        recipeId: null,
        recipeTitle: "",
      });
      setReminderForm({
        reminderAt: "",
        note: "",
      });
    } catch (error) {
      console.error("Error creating reminder:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Không thể đặt nhắc nhở. Vui lòng thử lại.";
      toast.error(errorMsg, { autoClose: 3000 });
    }
  };

  const closeReminderModal = () => {
    setReminderModal({
      isOpen: false,
      recipeId: null,
      recipeTitle: "",
    });
    setReminderForm({
      reminderAt: "",
      note: "",
    });
  };

  // =========================
  //   MODAL OPEN/CLOSE
  // =========================
  const openModal = () => {
    setEditingRecipeId(null);
    setForm(defaultForm);
    setPreview(null);
    setSelectedImageFile(null);
    setIsOpen(true);
    // Reset ingredient search states
    setIngredientSearches({});
    setIngredientDropdowns({});
    setIngredientSearching({});
    setEditingId(null);
    setShowCategoryDropdown(false);
  };

  const openEditModal = async (recipeId) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipe = res.data;

      // Load recipe data into form
      const mappedIngredients = recipe.ingredients?.map((ing) => {
        const ingredientId = ing.ingredientId || ing.ingredient?.id || "";
        const unit = ing.unit || ing.ingredient?.unit || "";

        return {
          ingredientId: ingredientId ? String(ingredientId) : "",
          quantity: ing.quantity ? String(ing.quantity) : "",
          unit: unit || "",
        };
      }) || [];

      setForm({
        title: recipe.title || "",
        instructions: recipe.instructions || "",
        cookingTimeMinutes: recipe.cookingTimeMinutes ? String(recipe.cookingTimeMinutes) : "",
        servings: recipe.servings ? String(recipe.servings) : "",
        mealType: recipe.mealType || "",
        imageUrl: recipe.imageUrl || "",
        ingredients: mappedIngredients,
      });

      // Set ingredient search keywords for display
      const searchKeywords = {};
      recipe.ingredients?.forEach((ing, index) => {
        const ingredientName = ing.ingredientName || ing.ingredient?.name || "";
        const unit = ing.unit || ing.ingredient?.unit || "";
        if (ingredientName) {
          searchKeywords[index] = `${ingredientName}${unit ? ` (${unit})` : ""}`;
        }
      });
      setIngredientSearches(searchKeywords);

      // Set preview image
      if (recipe.imageUrl) {
        const previewUrl = convertMediaUrl(recipe.imageUrl);
        setPreview(previewUrl);
      } else {
        setPreview(null);
      }

      setSelectedImageFile(null);
      setEditingRecipeId(recipeId);
      setIsOpen(true);

      // Reset ingredient search states
      setIngredientSearches({});
      setIngredientDropdowns({});
      setIngredientSearching({});
    } catch (err) {
      console.error("Lỗi khi tải recipe để edit:", err);
      toast.error("Không thể tải thông tin recipe.", { autoClose: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingRecipeId(null);
    setForm(defaultForm);
    setPreview(null);
    setSelectedImageFile(null);
  };

  // =========================
  //   HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "cookingTimeMinutes" || name === "servings") && Number(value) < 0) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "imageUrl") {
      // Convert URL để preview
      const previewUrl = value ? convertMediaUrl(value) : null;
      setPreview(previewUrl);
    }
  };

  // =========================
  //   HANDLE IMAGE FILE SELECTION
  // =========================
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ', { autoClose: 2000 });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB', { autoClose: 2000 });
      return;
    }

    // Lưu file và tạo preview
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload ảnh lên /api/media/upload ngay khi chọn file
    try {
      setUploadingImage(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Bạn cần đăng nhập để upload ảnh.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "IMAGE");

      console.log("Uploading image to /api/media/upload:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const uploadRes = await axios.post("/media/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Không set Content-Type để browser tự động set với boundary
        },
      });

      console.log("Upload response:", uploadRes.data);

      if (uploadRes.data?.url) {
        const imageUrl = convertMediaUrl(uploadRes.data.url);

        console.log("Original URL:", uploadRes.data.url);
        console.log("Final imageUrl:", imageUrl);

        setForm((prev) => ({ ...prev, imageUrl }));
        toast.success("Upload ảnh thành công!", { autoClose: 2000 });
      } else {
        throw new Error("Không nhận được URL từ server. Response: " + JSON.stringify(uploadRes.data));
      }
    } catch (err) {
      console.error("Lỗi khi upload ảnh:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = "Không thể upload ảnh. Vui lòng thử lại.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 500) {
          const backendMessage = data?.message || data?.error || "";
          errorMessage = `Lỗi server khi upload ảnh (500). ${backendMessage ? `Chi tiết: ${backendMessage}` : "Vui lòng thử lại sau hoặc sử dụng URL ảnh thay thế."}`;
        } else if (status === 413) {
          errorMessage = "File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
        } else if (status === 400) {
          errorMessage = data?.message || "Định dạng file không hợp lệ. Vui lòng chọn file ảnh.";
        } else if (status === 401) {
          errorMessage = "Bạn cần đăng nhập để upload ảnh.";
        } else if (status === 404) {
          errorMessage = "Endpoint upload không tồn tại. Vui lòng liên hệ admin.";
        } else {
          errorMessage = data?.message || data?.error || `Lỗi ${status}: Không thể upload ảnh.`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, { autoClose: 5000 });

      // Giữ preview để user có thể thử lại với URL thủ công
      // Chỉ reset nếu lỗi nghiêm trọng
      if (err.response?.status === 500 || err.response?.status === 413 || err.response?.status === 404 || !err.response) {
        // Cleanup preview URL để tránh memory leak
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreview(null);
        setSelectedImageFile(null);
        setForm((prev) => ({ ...prev, imageUrl: "" }));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  // =========================
  //   ADD/UPDATE RECIPE
  // =========================
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     // Fetch categories for this recipe
  //     const res = await axios.get(`/recipes/${recipe.id}/categories`);
  //     const catIds = res.data.map((c) => c.id);
  //     setForm((prev) => ({ ...prev, categoryIds: catIds }));
  //   } catch (err) {
  //     console.error("Error fetching recipe categories:", err);
  //   }
  // };

  // =========================
  //   SUBMIT (ADD / UPDATE)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Missing auth token");

    try {
      const payload = {
        title: form.title,
        instructions: form.instructions,
        cookingTimeMinutes: form.cookingTimeMinutes
          ? Number(form.cookingTimeMinutes)
          : undefined,
        servings: form.servings ? Number(form.servings) : undefined,
        mealType: form.mealType || null,
        imageUrl: form.imageUrl || null,
        ingredients: form.ingredients.map((i) => ({
          ingredientId: Number(i.ingredientId),
          quantity: Number(i.quantity) || 0,
          unit: i.unit || "phần",
        })),
      };

      let updatedRecipe;
      if (editingRecipeId) {
        // UPDATE existing recipe
        const res = await axios.put(`/recipes/${editingRecipeId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        updatedRecipe = res.data;

        // Update in recipes list
        setRecipes((prev) =>
          prev.map((r) => (r.id === editingRecipeId ? updatedRecipe : r))
        );
        setSearchResults((prev) =>
          prev.map((r) => (r.id === editingRecipeId ? updatedRecipe : r))
        );

        toast.success("Cập nhật công thức thành công!", { autoClose: 2000 });
      } else {
        // CREATE new recipe
        const res = await axios.post("/recipes", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        updatedRecipe = res.data;

        setRecipes((prev) => [updatedRecipe, ...prev]);
        setSearchResults((prev) => [updatedRecipe, ...prev]);

        toast.success("Thêm công thức thành công!", { autoClose: 2000 });
      }

      setForm(defaultForm);
      setPreview(null);
      setSelectedImageFile(null);
      closeModal();
    } catch (err) {
      console.error("Lỗi khi lưu recipe:", err.response || err);
      toast.error(
        err.response?.data?.message ||
        (editingRecipeId ? "Không thể cập nhật công thức." : "Không thể thêm công thức."),
        { autoClose: 3000 }
      );
    }
  };

  // =========================
  //   DELETE RECIPE
  // =========================
  const handleDeleteClick = (recipe) => {

    setConfirmModal({
      isOpen: true,
      itemId: recipe.id,
      itemTitle: recipe.title
    });
  };

  const executeDelete = async () => {
    const id = confirmModal.itemId;
    console.log("Executing delete for ID:", id);
    if (!id) {
      console.error("No ID found for delete");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calling API delete:", `/recipes/${id}`);
      await axios.delete(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTimeout(() => {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        setSearchResults((prev) => prev.filter((r) => r.id !== id));
        setIsLoading(false);
        setConfirmModal({ isOpen: false, itemId: null, itemTitle: '' });
        toast.success("Xóa công thức thành công!", { autoClose: 2000 });
      }, 2000);
    } catch (err) {
      setTimeout(() => {
        console.error("Lỗi khi xóa recipe:", err);
        setIsLoading(false);
        toast.error("Không thể xóa công thức.", { autoClose: 2000 });
        setConfirmModal({ isOpen: false, itemId: null, itemTitle: '' });
      }, 2000);
    }
  };

  const handleEditClick = (recipe) => {
    openEditModal(recipe.id);
  };

  const handleCardClick = (id) => {
    navigate(`/manage/recipes/${id}`);
  };

  // =========================
  //   COOK RECIPE - Đã chuyển vào DetailRecipes.jsx
  //   Các hàm handleCookRecipe và showCookSuccessMessage đã được di chuyển
  // =========================

  return (
    <div className="recipe-dashboard">
      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Xóa công thức"
        message={`Bạn có chắc muốn xóa công thức "${confirmModal.itemTitle}"?`}
        isLoading={isLoading}
      />
      {/* HEADER */}
      <header className="recipe-header">
        {/* Welcome Section */}
        <div className="welcome-section_recipe">
          <div className="welcome-recipe-text">
            <h1>Make a recipe just for you</h1>
          </div>
        </div>
      </header>


      {/* SEARCH SECTION */}
      <div className="search-recipes">
        <Search size={18} className="ai-search-icon" />
        <input
          type="text"
          className="search-recipe-input"
          placeholder="Search recipe..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Category Chips */}
      <div className="category-filters">
        <button
          className={`category-chip ${!selectedCategory ? "active" : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          All Recipes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* RECIPES GRID */}
      <div className="recipes-heading" style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 className="all-recipes">All Recipes</h2>
      </div>

      {/* Recipe Filter Buttons - Below "All Recipes" heading */}
      <div style={{ display: 'flex', gap: '22px', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <button
          className={`category-chip ${filterCookable ? 'active' : ''}`}
          onClick={() => handleFilterToggle("cookable")}
          disabled={loadingFilters}
          style={{
            backgroundColor: filterCookable ? '#10b981' : 'transparent',
            color: filterCookable ? 'white' : '#666',
            border: filterCookable ? 'none' : '1px solid #ddd',
          }}
        >
          <CookingPot size={16} /> I Can Cook
        </button>
        <button
          className={`category-chip ${filterBookmarked ? 'active' : ''}`}
          onClick={() => handleFilterToggle("bookmarked")}
          disabled={loadingFilters}
          style={{
            backgroundColor: filterBookmarked ? '#f97316' : 'transparent',
            color: filterBookmarked ? 'white' : '#666',
            border: filterBookmarked ? 'none' : '1px solid #ddd',
          }}
        >
          <Heart size={16} /> Bookmarked
        </button>
        <button
          className={`category-chip ${filterReminders ? 'active' : ''}`}
          onClick={() => handleFilterToggle("reminders")}
          disabled={loadingFilters}
          style={{
            backgroundColor: filterReminders ? '#f59e0b' : 'transparent',
            color: filterReminders ? 'white' : '#666',
            border: filterReminders ? 'none' : '1px solid #ddd',
          }}
        >
          <Bell size={16} /> Reminders
        </button>
        {(filterCookable || filterBookmarked || filterReminders) && (
          <button
            className="category-chip"
            onClick={clearAllFilters}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
            }}
          >
            <X size={16} /> Clear Filters
          </button>
        )}
      </div>

      <div className="recipe-grid">
        {searchResults.length === 0 ? (
          <div className="empty">
            {search ? "No recipes found." : "No recipes yet. Create one!"}
          </div>
        ) : (
          searchResults.map((r, index) => (
            <div
              key={r.id}
              className="recipe-card"
              onClick={() => handleCardClick(r.id)}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* IMAGE */}
              <div className="card-image-side">
                <img
                  src={convertMediaUrl(r.imageUrl) || "/placeholder-recipe.jpg"}
                  alt={r.title}
                />
              </div>
              <div className="line-middle">
                <ChefHat size={16} />
              </div>
              {/* CONTENT */}
              <div className="card-content-side">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{r.title}</h3>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={(e) => handleBookmark(e, r.id)}
                      disabled={bookmarking[r.id]}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: bookmarking[r.id] ? 'wait' : 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {bookmarkedRecipes.has(r.id) ? (
                        <Heart size={18} fill="#ff6b6b" color="#ff6b6b" />
                      ) : (
                        <Heart size={18} color="gray" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleReminderClick(e, r.id, r.title)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={recipesWithReminders.has(r.id) ? "Hủy nhắc nhở" : "Đặt nhắc nhở"}
                    >
                      {recipesWithReminders.has(r.id) ? (
                        <Bell size={18} fill="#f59e0b" color="#f59e0b" />
                      ) : (
                        <Bell size={18} color="gray" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="card-meta">
                  <span>⏱ {r.cookingTimeMinutes} min</span>
                  {r.servings && <span>{r.servings} servings</span>}
                </div>
                <p className="card-desc">{r.instructions}</p>

                {/* Nút Nấu đã được chuyển vào trang DetailRecipes */}
                
                {/* Reminder Information */}
                {recipesWithReminders.has(r.id) && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                  }}>
                    <Bell size={16} color="#f59e0b" />
                    <div style={{ flex: 1 }}>
                      {recipesWithReminders.get(r.id).map((reminder, idx) => (
                        <div key={idx} style={{ marginBottom: idx < recipesWithReminders.get(r.id).length - 1 ? '4px' : '0' }}>
                          <strong style={{ color: '#92400e' }}>
                            Nhắc nhở: {new Date(reminder.reminderAt).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </strong>
                          {reminder.note && (
                            <div style={{ color: '#78350f', fontSize: '12px', marginTop: '2px' }}>
                              {reminder.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  {/* <button
                    className="btn-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(r.id);
                    }}
                    style={{ flex: 1, backgroundColor: "#f3f4f6", color: "#374151" }}
                  >
                    👁️ Xem
                  </button> */}
                  {/* <button
                    className="btn-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(r.id);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "#3b82f6",
                      color: "white"
                    }}
                  >
                    ✏️ Cập nhật
                  </button> */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* =============================
            MODAL ADD RECIPE
      ============================== */}
      {isOpen && (
        <div className={`fh-modal-overlay ${isOpen ? "fh-active" : ""}`}>
          <div
            className="fh-modal"
            style={{
              backgroundImage: `url(${bgFooter})`,
              backgroundPosition: "bottom",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% auto",
            }}
          >
            <div className="fh-modal-header">
              <img className="fh-recipesBook" src={RecipesBook} alt="" />
              <h3 className="fh-modal-title">
                {editingRecipeId ? "Update Recipe" : "Add Recipe"}
              </h3>
            </div>
            <form className="fh-modal-form" onSubmit={handleSubmit}>
              <label className="fh-recipe-label">
                Title
                <input
                  placeholder=""
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="fh-recipe-input"
                />
              </label>

              <label className="fh-recipe-label">
                Instructions
                <textarea
                  placeholder=""
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  required
                  className="fh-recipe-textarea"
                />
              </label>

              <div className="fh-recipe-form-grid">
                <label className="fh-recipe-label">
                  Time (minutes)
                  <input
                    placeholder="30 minutes"
                    type="number"
                    min="0"
                    name="cookingTimeMinutes"
                    value={form.cookingTimeMinutes}
                    onChange={handleChange}
                    className="fh-recipe-input"
                  />
                </label>

                <label className="fh-recipe-label">
                  Servings
                  <input
                    type="number"
                    min="0"
                    name="servings"
                    value={form.servings}
                    onChange={handleChange}
                    className="fh-recipe-input"
                  />
                </label>
              </div>

              <label className="fh-recipe-label">
                Meal Type
                <select
                  name="mealType"
                  value={form.mealType}
                  onChange={handleChange}
                  className="fh-recipe-input"
                >
                  <option value="">-- Select Meal Type --</option>
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </label>

              <label className="fh-recipe-label">
                Recipe Image
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="fh-recipe-input"
                    style={{ padding: "8px" }}
                  />
                  {selectedImageFile && !uploadingImage && !form.imageUrl && (
                    <span style={{ fontSize: "12px", color: "#3b82f6" }}>
                      📎 {selectedImageFile.name} - Đang chờ upload...
                    </span>
                  )}
                  {uploadingImage && (
                    <span style={{ fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                      Đang upload ảnh...
                    </span>
                  )}
                  {form.imageUrl && !uploadingImage && (
                    <span style={{ fontSize: "12px", color: "#10b981" }}>
                      ✓ Ảnh đã được upload thành công
                    </span>
                  )}
                </div>
                {/* Fallback: vẫn cho phép nhập URL nếu muốn */}
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="Hoặc nhập URL ảnh (https://example.com/image.jpg)"
                  className="fh-recipe-input"
                  style={{ marginTop: "8px" }}
                />
              </label>

              {preview && (
                <div className="fh-recipe-image-preview">
                  <img
                    src={preview}
                    alt="Preview"
                    className="fh-recipe-image"
                    onError={(e) => {
                      console.error("Lỗi khi load ảnh preview:", preview);
                      // Nếu URL có /api/media/, thử remove /api để dùng /media/ (static files được serve ở /media/)
                      if (preview.includes('/api/media/')) {
                        const fallbackUrl = preview.replace('/api/media/', '/media/');
                        console.log("Thử fallback URL (remove /api):", fallbackUrl);
                        e.target.src = fallbackUrl;
                      } else {
                        e.target.style.display = 'none';
                        toast.error("Không thể hiển thị ảnh preview. Vui lòng kiểm tra lại URL.", { autoClose: 2000 });
                      }
                    }}
                    onLoad={() => {
                      console.log("Ảnh preview đã load thành công:", preview);
                    }}
                  />
                </div>
              )}

              {/* INGREDIENTS */}
              <div className="fh-ingredients-section">
                <div className="fh-ingredients-header">
                  <h4 className="fh-ingredients-title">Ingredients</h4>

                  <button
                    type="button"
                    className="fh-add-ingredient-btn"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        ingredients: [
                          ...prev.ingredients,
                          { ingredientId: "", quantity: "", unit: "" },
                        ],
                      }))
                    }
                  >
                    + Add Ingredient
                  </button>
                </div>

                {form.ingredients.map((ing, index) => {
                  // Ensure searchKeyword is always a string
                  const searchKeywordValue = ingredientSearches[index];
                  const searchKeyword = typeof searchKeywordValue === 'string' ? searchKeywordValue : "";
                  const showDropdown = ingredientDropdowns[index] || false;
                  const isSearching = ingredientSearching[index] || false;
                  const selectedIngredient = allIngredients.find(
                    (opt) => opt.id === Number(ing.ingredientId)
                  );

                  return (
                    <div key={index} className="fh-ingredient-row">
                      <div className="ingredient-search-container" style={{ position: "relative", flex: 1 }}>
                        <input
                          type="text"
                          placeholder={selectedIngredient ? selectedIngredient.name : ""}
                          value={searchKeyword || selectedIngredient?.name}
                          onChange={(e) => handleIngredientSearch(index, e.target.value)}
                          onClick={() => setIngredientDropdowns((prev) => ({ ...prev, [index]: true }))}
                          onFocus={() => setIngredientDropdowns((prev) => ({ ...prev, [index]: true }))}
                          className="fh-recipe-input fh-small"
                          required
                          style={{ width: "100%" }}
                        />
                        {isSearching && (
                          <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#666" }}>
                            Đang tìm...
                          </span>
                        )}
                        {showDropdown && allIngredients.length > 0 && (
                          <div className="fh-dropdown">
                            {allIngredients.map((opt) => (
                              <div
                                key={opt.id}
                                className="fh-dropdown-item"
                                onClick={() => {
                                  const newList = [...form.ingredients];
                                  newList[index] = {
                                    ingredientId: opt.id,
                                    quantity: newList[index].quantity || "",
                                    unit: opt.unit || "",
                                  };
                                  setForm((prev) => ({
                                    ...prev,
                                    ingredients: newList,
                                  }));
                                  setIngredientSearches((prev) => ({
                                    ...prev,
                                    [index]: `${opt.name} (${opt.unit})`,
                                  }));
                                  setIngredientDropdowns((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  }));
                                }}
                              >
                                {opt.name} <span>{opt.unit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedIngredient && (
                        <input
                          type="text"
                          placeholder="Unit"
                          value={selectedIngredient.unit || ""}
                          readOnly
                          className="fh-recipe-input fh-small"
                          style={{
                            backgroundColor: "#f5f5f5",
                            cursor: "not-allowed",
                            color: "#666",
                            width: "100px",
                          }}
                        />
                      )}

                      <input
                        type="number"
                        placeholder="Quantity"
                        value={ing.quantity}
                        onChange={(e) => {
                          const newList = [...form.ingredients];
                          newList[index].quantity = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            ingredients: newList,
                          }));
                        }}
                        className="fh-recipe-input fh-small"
                        required
                        style={{ width: "100px" }}
                      />

                      <button
                        type="button"
                        className="fh-remove-ingredient-btn"
                        onClick={() => {
                          const newList = form.ingredients.filter(
                            (_, i) => i !== index
                          );
                          setForm((prev) => ({
                            ...prev,
                            ingredients: newList,
                          }));
                          // Clean up search states
                          setIngredientSearches((prev) => {
                            const next = { ...prev };
                            delete next[index];
                            return next;
                          });
                          setIngredientDropdowns((prev) => {
                            const next = { ...prev };
                            delete next[index];
                            return next;
                          });
                          if (searchTimeoutsRef.current[index]) {
                            clearTimeout(searchTimeoutsRef.current[index]);
                            delete searchTimeoutsRef.current[index];
                          }
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="fh-modal-actions">
                <button
                  type="button"
                  className="fh-recipe-btn fh-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="fh-recipe-btn fh-primary">
                  {editingRecipeId ? "Update Recipe" : "Save Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }

      {/* =============================
            REMINDER MODAL
      ============================== */}
      {reminderModal.isOpen && (
        <div className={`fh-modal-overlay ${reminderModal.isOpen ? "fh-active" : ""}`}>
          <div
            className="fh-modal"
            style={{
              maxWidth: "500px",
              padding: "30px",
            }}
          >
            <div className="fh-modal-header" style={{ marginBottom: "20px" }}>
              <Bell size={32} color="#f59e0b" style={{ marginBottom: "10px" }} />
              <h3 className="fh-modal-title">
                Đặt Nhắc Nhở
              </h3>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
                {reminderModal.recipeTitle}
              </p>
            </div>
            <form className="fh-modal-form" onSubmit={handleReminderSubmit}>
              <label className="fh-recipe-label">
                Thời gian nhắc nhở
                <input
                  type="datetime-local"
                  value={reminderForm.reminderAt}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, reminderAt: e.target.value }))}
                  required
                  className="fh-recipe-input"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </label>

              <label className="fh-recipe-label">
                Ghi chú (tùy chọn)
                <textarea
                  placeholder="Thêm ghi chú cho nhắc nhở..."
                  value={reminderForm.note}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, note: e.target.value }))}
                  className="fh-recipe-textarea"
                  rows={3}
                />
              </label>

              <div className="fh-modal-actions">
                <button
                  type="button"
                  className="fh-recipe-btn fh-ghost"
                  onClick={closeReminderModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="fh-recipe-btn fh-primary"
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  Đặt Nhắc Nhở
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div >
  );
}
