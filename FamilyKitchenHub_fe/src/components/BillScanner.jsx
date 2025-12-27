import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Camera, Upload, XCircle, Plus, Trash2, CheckCircle } from 'lucide-react';
import './BillScanner.css';

const BillScanner = ({ onClose, onSuccess, userId }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detectedItems, setDetectedItems] = useState([]);
    const [showReview, setShowReview] = useState(false);
    const [allIngredients, setAllIngredients] = useState([]);

    // Extract userId - same approach as Fridge.jsx
    const getUserIdFromToken = () => {
        if (userId) return userId; // Use prop if provided

        try {
            const userDataString = localStorage.getItem("user");
            if (!userDataString) {
                console.error('❌ No user found in localStorage');
                return null;
            }

            const userData = JSON.parse(userDataString);
            const extractedId = userData.user?.id || userData.id;

            console.log('👤 Extracted user ID from localStorage:', extractedId);
            return extractedId;
        } catch (error) {
            console.error('Error extracting userId:', error);
            return null;
        }
    };

    const currentUserId = getUserIdFromToken();

    // Fetch all ingredients for the dropdown when adding new items
    React.useEffect(() => {
        fetchAllIngredients();
    }, []);

    const fetchAllIngredients = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/ingredients');
            setAllIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select an image first');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            console.log('Uploading to:', 'http://localhost:8080/api/inventory/detect-from-image');

            // Get auth token
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'multipart/form-data'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(
                'http://localhost:8080/api/inventory/detect-from-image',
                formData,
                {
                    headers,
                    timeout: 60000 // 60 second timeout
                }
            );

            console.log('Detection response:', response.data);

            if (response.data.success) {
                if (!response.data.detectedItems || response.data.detectedItems.length === 0) {
                    alert('⚠️ No ingredients detected in this image.\n\nTips:\n- Make sure the image is clear\n- Check that ingredient text is visible\n- Try a different image');
                    setLoading(false);
                    return;
                }

                // Add temporary IDs and default values for frontend manipulation
                const itemsWithDefaults = response.data.detectedItems.map((item, index) => ({
                    ...item,
                    tempId: `item-${Date.now()}-${index}`,
                    expirationDate: '',
                    selected: true, // Selected by default
                }));

                setDetectedItems(itemsWithDefaults);
                setShowReview(true);
            }
        } catch (error) {
            console.error('Detection error:', error);

            let errorMessage = '❌ Failed to detect ingredients.\n\n';

            if (error.code === 'ECONNABORTED') {
                errorMessage += 'Request timed out. The AI service might be slow.\nPlease try again.';
            } else if (error.response) {
                // Server responded with error
                errorMessage += `Server error: ${error.response.status}\n`;
                errorMessage += error.response.data?.message || error.response.statusText;
            } else if (error.request) {
                // No response received
                errorMessage += 'Cannot connect to server.\n\n';
                errorMessage += 'Please check:\n';
                errorMessage += '1. Backend is running (port 8080)\n';
                errorMessage += '2. AI service is running (port 5001)\n';
                errorMessage += '3. Check console for details';
            } else {
                errorMessage += error.message;
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (tempId, newQuantity) => {
        setDetectedItems(items =>
            items.map(item =>
                item.tempId === tempId
                    ? { ...item, quantity: parseFloat(newQuantity) || 0 }
                    : item
            )
        );
    };

    const handleUnitChange = (tempId, newUnit) => {
        setDetectedItems(items =>
            items.map(item =>
                item.tempId === tempId ? { ...item, unit: newUnit } : item
            )
        );
    };

    const handleExpirationChange = (tempId, newDate) => {
        setDetectedItems(items =>
            items.map(item =>
                item.tempId === tempId ? {
                    ...item,
                    expirationDate: newDate ? formatDateLocal(newDate) : ''
                } : item
            )
        );
    };

    // Helper function to format date without timezone issues
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleToggleSelect = (tempId) => {
        setDetectedItems(items =>
            items.map(item =>
                item.tempId === tempId ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const handleDeleteItem = (tempId) => {
        setDetectedItems(items => items.filter(item => item.tempId !== tempId));
    };

    const handleAddNewItem = () => {
        const newItem = {
            tempId: `item-new-${Date.now()}`,
            ingredientId: null,
            ingredientName: '',
            quantity: 0,
            unit: 'g',
            expirationDate: '',
            selected: true,
            matched: false,
            confidence: 1.0,
            rawText: 'Manual entry'
        };
        setDetectedItems([...detectedItems, newItem]);
    };

    const handleIngredientSelect = (tempId, ingredientId) => {
        const selectedIngredient = allIngredients.find(ing => ing.id === parseInt(ingredientId));
        if (selectedIngredient) {
            setDetectedItems(items =>
                items.map(item =>
                    item.tempId === tempId
                        ? {
                            ...item,
                            ingredientId: selectedIngredient.id,
                            ingredientName: selectedIngredient.name,
                            unit: selectedIngredient.unit || item.unit,
                            matched: true
                        }
                        : item
                )
            );
        }
    };

    const handleConfirmAndAdd = async () => {
        const selectedItems = detectedItems.filter(item => item.selected && item.ingredientId);

        if (selectedItems.length === 0) {
            alert('Please select at least one ingredient');
            return;
        }

        // Validate all items have valid ingredient IDs
        const invalidItems = selectedItems.filter(item => !item.ingredientId || item.ingredientId === null);
        if (invalidItems.length > 0) {
            console.error('Invalid items without ingredient ID:', invalidItems);
            alert('Some items are missing ingredient information. Please make sure all selected items have an ingredient selected.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        const batchRequest = {
            userId: currentUserId,
            purchasedAt: today,
            items: selectedItems.map(item => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                expirationDate: item.expirationDate || null
            }))
        };

        // DEBUG: Log the request
        console.log('📤 Batch add request:', JSON.stringify(batchRequest, null, 2));

        setLoading(true);
        try {
            // Get auth token
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(
                'http://localhost:8080/api/inventory/batch-add',
                batchRequest,
                { headers }
            );

            console.log('✅ Batch add response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });

            // Success if we get a 2xx status code
            if (response.status >= 200 && response.status < 300) {
                const count = response.data.addedCount || response.data.items?.length || selectedItems.length;
                alert(`✅ Successfully added ${count} items to inventory!`);

                // Call onSuccess to refresh the Fridge page
                if (onSuccess) {
                    console.log('🔄 Calling onSuccess to refresh inventory list');
                    onSuccess();
                }

                // Close the scanner
                if (onClose) onClose();
            } else {
                console.error('Unexpected response status:', response.status);
                throw new Error('Unexpected response status: ' + response.status);
            }
        } catch (error) {
            console.error('Batch add error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to add items to inventory';
            alert(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked) => {
        setDetectedItems(items =>
            items.map(item => ({ ...item, selected: checked }))
        );
    };

    if (!showReview) {
        // Upload view
        return (
            <div className="bill-scanner-modal">
                <div className="bill-scanner-content">
                    <div className="bill-scanner-header">
                        <h2><Camera size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Scan Bill / Receipt</h2>
                        <button onClick={onClose} className="close-btn"><XCircle size={24} /></button>
                    </div>

                    <div className="upload-area">
                        {previewUrl ? (
                            <div className="image-preview">
                                <img src={previewUrl} alt="Preview" />
                                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>
                                    Change Image
                                </button>
                            </div>
                        ) : (
                            <div className="upload-zone">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    id="file-input"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-input" className="upload-label">
                                    <div className="upload-icon"><Upload size={64} strokeWidth={1.5} /></div>
                                    <p>Click to select bill/receipt image</p>
                                    <p className="upload-hint">Supports: JPG, PNG</p>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="scanner-actions">
                        <button onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            className="btn-detect"
                        >
                            {loading ? 'Detecting...' : <><Camera size={18} /> Detect Ingredients</>}
                        </button>
                    </div>

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">🔍 AI is analyzing your image...</p>
                            <p className="loading-subtext">This may take a few seconds</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Review view
    return (
        <div className="bill-scanner-modal">
            <div className="bill-scanner-content review-mode">
                <div className="bill-scanner-header">
                    <h2><CheckCircle size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Review Detected Ingredients</h2>
                    <button onClick={onClose} className="close-btn"><XCircle size={24} /></button>
                </div>

                <div className="review-stats">
                    <span><CheckCircle size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Detected: {detectedItems.length}</span>
                    <span><CheckCircle size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Selected: {detectedItems.filter(i => i.selected).length}</span>
                </div>

                <div className="review-table-container">
                    <table className="ingredients-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={detectedItems.every(i => i.selected)}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th>Ingredient</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Expiration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detectedItems.map(item => (
                                <tr key={item.tempId} className={!item.selected ? 'deselected' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => handleToggleSelect(item.tempId)}
                                        />
                                    </td>
                                    <td>
                                        {item.ingredientId ? (
                                            <span className="ingredient-name">{item.ingredientName}</span>
                                        ) : (
                                            <select
                                                className="ingredient-select"
                                                value={item.ingredientId || ''}
                                                onChange={(e) => handleIngredientSelect(item.tempId, e.target.value)}
                                            >
                                                <option value="">Select ingredient...</option>
                                                {allIngredients.map(ing => (
                                                    <option key={ing.id} value={ing.id}>
                                                        {ing.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.tempId, e.target.value)}
                                            className="qty-input"
                                            step="0.01"
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={item.unit}
                                            onChange={(e) => handleUnitChange(item.tempId, e.target.value)}
                                            className="unit-input"
                                        />
                                    </td>
                                    <td>
                                        <DatePicker
                                            selected={item.expirationDate ? new Date(item.expirationDate) : null}
                                            onChange={(date) => handleExpirationChange(item.tempId, date)}
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="Select date"
                                            className="date-input"
                                            minDate={new Date()}
                                            showYearDropdown
                                            scrollableYearDropdown
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteItem(item.tempId)}
                                            className="btn-delete"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="review-actions">
                    <button onClick={handleAddNewItem} className="btn-add-new">
                        <Plus size={18} /> Add Item
                    </button>
                    <div className="right-actions">
                        <button onClick={() => setShowReview(false)} className="btn-back">
                            ← Back
                        </button>
                        <button
                            onClick={handleConfirmAndAdd}
                            disabled={loading || detectedItems.filter(i => i.selected).length === 0}
                            className="btn-confirm"
                        >
                            {loading ? 'Adding...' : <><CheckCircle size={18} /> Add {detectedItems.filter(i => i.selected).length} Items</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillScanner;
