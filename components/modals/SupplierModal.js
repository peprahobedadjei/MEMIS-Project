import { useState, useEffect } from 'react';
import Modal from './Modals';
import { createSupplier, updateSupplier } from '../../utils/api';

const SupplierModal = ({ isOpen, onClose, refreshSuppliers, editingSupplier = null }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    contact: '',
    website: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Populate form when editing a supplier
  useEffect(() => {
    if (editingSupplier) {
      setIsEditing(true);
      // Format the website URL for the form input (remove https:// if present)
      let website = editingSupplier.website || '';
      if (website.startsWith('https://')) {
        website = website.substring(8);
      } else if (website.startsWith('http://')) {
        website = website.substring(7);
      }
      
      setFormData({
        company_name: editingSupplier.company_name || '',
        company_email: editingSupplier.company_email || '',
        contact: editingSupplier.contact || '',
        website: website,
      });
    } else {
      // Reset form for new supplier
      setIsEditing(false);
      setFormData({
        company_name: '',
        company_email: '',
        contact: '',
        website: '',
      });
    }
    // Clear any previous errors
    setErrors({});
  }, [editingSupplier, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Format website to include https:// if not already present
      let formattedData = { ...formData };
      if (formData.website && !formData.website.startsWith('http')) {
        formattedData.website = `https://${formData.website}`;
      }
      
      let response;
      
      if (isEditing && editingSupplier) {
        // Update existing supplier
        // When updating, we only need to send the fields that have changed
        const changedData = {};
        
        Object.keys(formattedData).forEach(key => {
          let originalValue = editingSupplier[key];
          let newValue = formattedData[key];
          
          // Special handling for website
          if (key === 'website') {
            if (originalValue && originalValue.startsWith('https://')) {
              originalValue = originalValue.substring(8);
            } else if (originalValue && originalValue.startsWith('http://')) {
              originalValue = originalValue.substring(7);
            }
            
            if (newValue && !newValue.startsWith('http')) {
              newValue = `https://${newValue}`;
            }
          }
          
          if (newValue !== originalValue) {
            changedData[key] = formattedData[key];
          }
        });
        
        // If no changes, just close the modal
        if (Object.keys(changedData).length === 0) {
          onClose();
          return;
        }
        
        // Include the ID in the data to help backend identify this is an update
        changedData.id = editingSupplier.id;
        
        response = await updateSupplier(editingSupplier.id, changedData);
      } else {
        // Create new supplier
        response = await createSupplier(formattedData);
      }
      
      if (response.success) {
        // Reset form
        setFormData({
          company_name: '',
          company_email: '',
          contact: '',
          website: '',
        });
        
        // Close modal and refresh table
        onClose();
        refreshSuppliers();
      } else {
        // Handle API validation errors
        if (response.status === 400) {
          setErrors(response.error);
        } else {
          setErrors({ general: `Failed to ${isEditing ? 'update' : 'create'} supplier. Please try again.` });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Supplier" : "New Supplier"}>
      <p className="mb-4 text-center text-xs">
        {isEditing 
          ? "Update the supplier information below." 
          : "Enter the accurate details to register a new supplier."}
      </p>
      
      {errors.general && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded ${errors.company_name ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.company_name && (
            <p className="text-red-500 text-xs mt-1">
              {Array.isArray(errors.company_name) 
                ? errors.company_name[0] 
                : errors.company_name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">
            Company Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="company_email"
            value={formData.company_email}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded ${errors.company_email ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.company_email && (
            <p className="text-red-500 text-xs mt-1">
              {Array.isArray(errors.company_email) 
                ? errors.company_email[0] 
                : errors.company_email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">
            Contact <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className={`w-full p-2 border rounded ${errors.contact ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.contact && (
            <p className="text-red-500 text-xs mt-1">
              {Array.isArray(errors.contact) 
                ? errors.contact[0] 
                : errors.contact}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">
            Website Link (Optional)
          </label>
          <div className="flex">
            <div className="bg-gray-100 p-2 rounded-l border border-r-0">
              https://
            </div>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={`w-full p-2 border rounded-r ${errors.website ? 'border-red-500' : ''}`}
              disabled={loading}
            />
          </div>
          {errors.website && (
            <p className="text-red-500 text-xs mt-1">
              {Array.isArray(errors.website) ? errors.website[0] : errors.website}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-900 text-white rounded hover:bg-indigo-800 disabled:bg-indigo-300"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : isEditing ? "Update" : "Save"}
        </button>
      </form>
    </Modal>
  );
};

export default SupplierModal;
