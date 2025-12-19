/**
 * Utility function để convert relative media URL thành full URL
 * Backend trả về /media/xxx.jpg và serve static files ở /media/ (KHÔNG có /api)
 * Endpoint upload là /api/media/upload (public) nhưng files được serve ở /media/
 */
export const convertMediaUrl = (url) => {
  if (!url) return url;
  
  // Nếu đã là full URL (http/https), return nguyên
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Nếu là relative path
  if (url.startsWith('/')) {
    const backendBaseUrl = 'http://localhost:8080';
    
    // Backend trả về /media/xxx.jpg
    // Static files được serve ở /media/ (KHÔNG có /api)
    return backendBaseUrl + url;
  }
  
  return url;
};

