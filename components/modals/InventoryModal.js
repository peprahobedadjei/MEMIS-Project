// components/InventoryModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createInventoryItem, updateInventoryItem } from '@/utils/api';

const InventoryModal = ({ isOpen, onClose, item, onSave }) => {
  const isEditing = !!item?.id;
  const [formData, setFormData] = useState({
    name: '',
    item_code: '',
    category: '',
    quantity: 0,
    location: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        item_code: item.item_code || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        location: item.location || '',
        description: item.description || ''
      });
    } else {
      setFormData({
        name: '',
        item_code: '',
        category: '',
        quantity: 0,
        location: '',
        description: ''
      });
    }
    setErrors({});
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.item_code.trim()) newErrors.item_code = 'Item code is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (isEditing) {
        response = await updateInventoryItem(item.id, formData);
      } else {
        response = await createInventoryItem(formData);
      }
      
      if (response.success) {
        onSave();
        onClose();
      } else {
        // Handle API validation errors
        if (response.error && typeof response.error === 'object') {
          setErrors(response.error);
        } else {
          setErrors({ general: response.error || 'An error occurred while saving' });
        }
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['replacement', 'maintenance', 'critical', 'surgical_equipment', 'miscellaneous'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 text-xs">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold">{isEditing ? 'Update Inventory' : 'New Inventory'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Enter the accurate details to {isEditing ? 'update' : 'add a new'} inventory
        </p>
        
        {errors.general && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Item Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="item_code"
              value={formData.item_code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.item_code ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.item_code && (
              <p className="mt-1 text-xs text-red-500">{errors.item_code}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-500">{errors.location}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;