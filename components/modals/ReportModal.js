import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { authenticatedRequest } from '@/utils/api';
import { XIcon } from 'lucide-react';

function MaintenanceReportModal({ showModal, closeModal, onSuccess }) {
    const [equipmentList, setEquipmentList] = useState([]);
    const [technicianList, setTechnicianList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // Field-specific validation errors
    const [fieldErrors, setFieldErrors] = useState({
        equipment: null,
        date_time: null,
        technician: null,
        activity_type: null,
        pre_status: null,
        post_status: null,
        notes: null
    });
    
    // Form fields
    const [formFields, setFormFields] = useState({
        equipment: '',
        activity_type: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        technician: '',
        pre_status: '',
        post_status: '',
        notes: ''
    });

    // Activity type options
    const activityTypes = [
        { value: 'preventive maintenance', label: 'Preventive Maintenance' },
        { value: 'repair', label: 'Repair' },
        { value: 'calibration', label: 'Calibration' }
    ];

    // Status options
    const statusOptions = [
        { value: 'functional', label: 'Functional' },
        { value: 'non_functional', label: 'Non-Functional' },
        { value: 'under_maintenance', label: 'Under Maintenance' },
        { value: 'decommissioned', label: 'Decommissioned' }
    ];

    // Reset form when modal is opened/closed
    useEffect(() => {
        if (showModal) {
            fetchEquipmentList();
            fetchTechnicianList();
            setFieldErrors({
                equipment: null,
                date_time: null,
                technician: null,
                activity_type: null,
                pre_status: null,
                post_status: null,
                notes: null
            });
            setError(null);
        }
    }, [showModal]);

    const fetchEquipmentList = async () => {
        try {
            const response = await authenticatedRequest('get', '/equipment/');
            if (response && response.data) {
                setEquipmentList(response.data);
            }
        } catch (err) {
            console.error('Error fetching equipment list:', err);
            setError('Failed to load equipment data');
        }
    };

    const fetchTechnicianList = async () => {
        try {
            const response = await authenticatedRequest('get', '/users/');
            if (response && response.data) {
                // Filter only technicians
                const technicians = response.data.filter(user => user.user_role === 'Technician');
                setTechnicianList(technicians);
            }
        } catch (err) {
            console.error('Error fetching technician list:', err);
            setError('Failed to load technician data');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormFields({
            ...formFields,
            [name]: value
        });
        
        // Clear field error when user updates the field
        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: null
            });
        }
        
        // Special handling for date/time to clear date_time error
        if (name === 'date' || name === 'time') {
            setFieldErrors({
                ...fieldErrors,
                date_time: null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setFieldErrors({
            equipment: null,
            date_time: null,
            technician: null,
            activity_type: null,
            pre_status: null,
            post_status: null,
            notes: null
        });

        try {
            // Combine date and time into ISO format
            const dateTime = new Date(`${formFields.date}T${formFields.time}`);
            const isoDateTime = dateTime.toISOString();

            const reportData = {
                equipment: formFields.equipment ? parseInt(formFields.equipment) : '',
                activity_type: formFields.activity_type,
                date_time: isoDateTime,
                technician: formFields.technician ? parseInt(formFields.technician) : '',
                pre_status: formFields.pre_status,
                post_status: formFields.post_status || null, // Handle empty post status as null
                notes: formFields.notes
            };

            const response = await authenticatedRequest('post', '/maintenance-reports/', reportData);
            
            if (response && response.status === 201) {
                // Success! Close modal and notify parent component
                if (onSuccess) onSuccess();
                closeModal();
            }
        } catch (err) {
            console.error('Error creating maintenance report:', err);
            
            // Handle validation errors from API
            if (err.response && err.response.data) {
                const apiErrors = err.response.data;
                
                // Update field-specific errors
                const newFieldErrors = { ...fieldErrors };
                
                Object.keys(apiErrors).forEach(field => {
                    if (Array.isArray(apiErrors[field])) {
                        newFieldErrors[field] = apiErrors[field][0];
                    } else {
                        newFieldErrors[field] = apiErrors[field];
                    }
                });
                
                setFieldErrors(newFieldErrors);
            } else {
                setError('Failed to create maintenance report. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showModal) return null;

    // Helper function to render form field with error
    const renderFormField = (label, name, type, options = null, required = true) => {
        const errorMessage = fieldErrors[name];
        
        return (
            <div>
                <label className="block text-xs font-medium mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                
                {type === 'select' ? (
                    <select
                        name={name}
                        value={formFields[name]}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${errorMessage ? 'border-red-500' : ''}`}
                        required={required}
                    >
                        <option value="">Select {label}</option>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        name={name}
                        value={formFields[name]}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${errorMessage ? 'border-red-500' : ''}`}
                        rows="4"
                        required={required}
                    ></textarea>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={formFields[name]}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${errorMessage ? 'border-red-500' : ''}`}
                        required={required}
                    />
                )}
                
                {errorMessage && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold">New Maintenance Report</h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                        <XIcon size={20} />
                    </button>
                </div>
                
                <p className="text-xs text-gray-600 mb-6">Enter the necessary details to add new maintenance report.</p>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Equipment Name */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Equipment Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="equipment"
                                value={formFields.equipment}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.equipment ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">Select Equipment</option>
                                {equipmentList.map(equipment => (
                                    <option key={equipment.id} value={equipment.id}>
                                        {equipment.name}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.equipment && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.equipment}</p>
                            )}
                        </div>
                        
                        {/* Activity Type */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Activity Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="activity_type"
                                value={formFields.activity_type}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.activity_type ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">Select Activity Type</option>
                                {activityTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.activity_type && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.activity_type}</p>
                            )}
                        </div>
                        
                        {/* Date */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formFields.date}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.date_time ? 'border-red-500' : ''}`}
                                required
                            />
                            {fieldErrors.date_time && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.date_time}</p>
                            )}
                        </div>
                        
                        {/* Time */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formFields.time}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.date_time ? 'border-red-500' : ''}`}
                                required
                            />
                        </div>
                        
                        {/* Technician */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Technician <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="technician"
                                value={formFields.technician}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.technician ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">Select Technician</option>
                                {technicianList.map(tech => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.first_name} {tech.last_name}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.technician && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.technician}</p>
                            )}
                        </div>
                        
                        {/* Pre-Status */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Pre - Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="pre_status"
                                value={formFields.pre_status}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.pre_status ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">Select Status</option>
                                {statusOptions.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.pre_status && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.pre_status}</p>
                            )}
                        </div>
                        
                        {/* Post-Status */}
                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Post - Status
                            </label>
                            <select
                                name="post_status"
                                value={formFields.post_status}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded-md ${fieldErrors.post_status ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Status</option>
                                {statusOptions.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.post_status && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.post_status}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Notes */}
                    <div className="mt-4">
                        <label className="block text-xs font-medium mb-1">
                            Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="notes"
                            value={formFields.notes}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md text-xs"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="text-sm w-full py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MaintenanceReportModal;