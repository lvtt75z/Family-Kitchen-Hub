
import React from 'react';
import './../styles/ConfirmModal.css';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <button className="confirm-modal-close" onClick={onClose} disabled={isLoading}>
                    <X size={20} />
                </button>

                <div className="confirm-modal-header">
                    <div className="confirm-icon-wrapper">
                        <AlertTriangle size={32} className="confirm-icon" />
                    </div>
                    <h3 className="confirm-title">{title || "Xác nhận hành động"}</h3>
                </div>

                <p className="confirm-message">
                    {message || "Bạn có chắc chắn muốn thực hiện hành động này không?"}
                </p>

                <div className="confirm-actions">
                    <button
                        className="confirm-btn confirm-btn-cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className="confirm-btn confirm-btn-delete"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
