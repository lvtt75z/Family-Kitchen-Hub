// src/hooks/useAuth.js
import { useCallback } from "react"

export function useAuth() {
  const register = useCallback(async (formData) => {
    // Giả lập đăng ký (bạn có thể thay bằng gọi API thật)
    console.log("Registering user:", formData)
    return new Promise((resolve) => setTimeout(resolve, 1000))
  })

  return { register }
}
