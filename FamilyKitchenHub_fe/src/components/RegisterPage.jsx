import React, { useState } from "react"
import { CheckCircle } from "lucide-react"

import { useAuth } from "../hooks/useAuth"
import "../styles/RegisterForm.css"
export function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth()

  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    familyName: "",
    familySize: "",
    householdRole: "",
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    notificationPreferences: {
      email: true,
      push: true,
      weeklyMenu: true,
      expirationAlerts: true,
      shoppingReminders: true
    },
    acceptTerms: false,
    acceptPrivacy: false,
    subscribeNewsletter: false
  }

  const [formData, setFormData] = useState(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = step => {
    switch (step) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        )
      case 2:
        return (
          formData.familyName &&
          formData.familySize &&
          formData.householdRole
        )
      case 3:
        return true
      case 4:
        return formData.acceptTerms && formData.acceptPrivacy
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    } else {
      toast.error("Vui lòng điền đầy đủ và chính xác các trường bắt buộc.")
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Bạn cần chấp nhận điều khoản và chính sách bảo mật.")
      return
    }

    setIsSubmitting(true)

    try {
      await register(formData)
      localStorage.setItem("userRegistration", JSON.stringify(formData))
      toast.success("Đăng ký thành công! Chào mừng bạn đến với Family Menu Manager!")
      setFormData(initialFormData)
      setCurrentStep(1)
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(step => (
        <React.Fragment key={step}>
          <div className={`step-circle ${step === currentStep ? "active" : ""}`}>
            {step < currentStep ? <CheckCircle size={16} /> : step}
          </div>
          {step < 4 && <div className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStepFields = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <input type="text" placeholder="Họ" value={formData.firstName} onChange={e => updateFormData("firstName", e.target.value)} />
            <input type="text" placeholder="Tên" value={formData.lastName} onChange={e => updateFormData("lastName", e.target.value)} />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => updateFormData("email", e.target.value)} />
            <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={formData.password} onChange={e => updateFormData("password", e.target.value)} />
            <input type={showConfirmPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={e => updateFormData("confirmPassword", e.target.value)} />
          </>
        )
      case 2:
        return (
          <>
            <input type="text" placeholder="Tên gia đình" value={formData.familyName} onChange={e => updateFormData("familyName", e.target.value)} />
            <input type="number" placeholder="Số thành viên" value={formData.familySize} onChange={e => updateFormData("familySize", e.target.value)} />
            <select value={formData.householdRole} onChange={e => updateFormData("householdRole", e.target.value)}>
              <option value="">Vai trò trong gia đình</option>
              <option value="parent">Phụ huynh</option>
              <option value="child">Con cái</option>
              <option value="other">Khác</option>
            </select>
          </>
        )
      case 3:
        return (
          <>
            <input type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={e => updateFormData("phone", e.target.value)} />
            <input type="date" placeholder="Ngày sinh" value={formData.dateOfBirth} onChange={e => updateFormData("dateOfBirth", e.target.value)} />
            <input type="text" placeholder="Dị ứng (phân cách bằng dấu phẩy)" value={formData.allergies.join(", ")} onChange={e => updateFormData("allergies", e.target.value.split(",").map(i => i.trim()))} />
            <input type="text" placeholder="Hạn chế ăn uống" value={formData.dietaryRestrictions.join(", ")} onChange={e => updateFormData("dietaryRestrictions", e.target.value.split(",").map(i => i.trim()))} />
            <input type="text" placeholder="Ẩm thực yêu thích" value={formData.cuisinePreferences.join(", ")} onChange={e => updateFormData("cuisinePreferences", e.target.value.split(",").map(i => i.trim()))} />
          </>
        )
      case 4:
        return (
          <>
            <label><input type="checkbox" checked={formData.acceptTerms} onChange={e => updateFormData("acceptTerms", e.target.checked)} /> Tôi đồng ý với Điều khoản sử dụng</label>
            <label><input type="checkbox" checked={formData.acceptPrivacy} onChange={e => updateFormData("acceptPrivacy", e.target.checked)} /> Tôi đồng ý với Chính sách bảo mật</label>
            <label><input type="checkbox" checked={formData.subscribeNewsletter} onChange={e => updateFormData("subscribeNewsletter", e.target.checked)} /> Đăng ký nhận bản tin</label>
          </>
        )
      default:
        return null
    }
  }

  return (
    <form className="form-container">
      {renderStepIndicator()}
      <div className="form-fields">{renderStepFields()}</div>
      <div className="button-group">
        {currentStep > 1 && <button type="button" onClick={prevStep}>Quay lại</button>}
        {currentStep < 4 && <button type="button" onClick={nextStep}>Tiếp tục</button>}
        {currentStep === 4 && <button type="button" onClick={handleSubmit} disabled={isSubmitting}>Hoàn tất đăng ký</button>}
      </div>
      <p className="login-switch">
        Đã có tài khoản? <button type="button" onClick={onSwitchToLogin}>Đăng nhập</button>
      </p>
    </form>
  )
}
