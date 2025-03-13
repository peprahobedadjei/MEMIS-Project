import { useState, useEffect } from 'react';
import Modal from './Modals';
import { getSuppliersList, createEquipment , updateEquipment} from '../../utils/api';

const EquipmentModal = ({ isOpen, onClose, onSave, equipment }) => {
    const CLOUDINARY_CLOUD_NAME = "dr8uzgh5e";
    const CLOUDINARY_UPLOAD_PRESET = "memis_project";
    const [suppliers, setSuppliers] = useState([]);
    const [uploading, setUploading] = useState({ image: false, manual: false });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        device_type: '',
        department: '',
        operational_status: '',
        serial_number: '',
        manufacturer: '',
        model: '',
        supplier: 0,
        description: '',
        image: '',
        manual: '',
        manufacturing_date: '',
        location: '',
    });
    useEffect(() => {
        if (equipment) {
            // Properly handle the supplier value for the form
            let supplierValue = '';
            
            if (equipment.supplier) {
                // If supplier is an object with an id property
                if (typeof equipment.supplier === 'object' && equipment.supplier) {
                    supplierValue = equipment.supplier.id.toString();
                }
                // If supplier is already an ID (string or number)
                else {
                    supplierValue = equipment.supplier.toString();
                }
            }
            
            setFormData({
                name: equipment.name || '',
                device_type: equipment.device_type || '',
                department: equipment.department || '',
                operational_status: equipment.operational_status || '',
                serial_number: equipment.serial_number || '',
                manufacturer: equipment.manufacturer || '',
                model: equipment.model || '',
                supplier: supplierValue,
                description: equipment.description || '',
                image: equipment.image || '',
                manual: equipment.manual || '',
                manufacturing_date: equipment.manufacturing_date || '',
                location: equipment.location || '',
            });
        }
    }, [equipment]);

    const [fileData, setFileData] = useState({
        image: null,
        manual: null
    });

    const [fileErrors, setFileErrors] = useState({
        image: '',
        manual: ''
    });

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await getSuppliersList();
                if (response.success && Array.isArray(response.data)) {
                    setSuppliers(response.data);
                    console.log("Suppliers List:", response.data);
                } else {
                    console.error('Unexpected supplier response:', response);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };

        fetchSuppliers();
    }, []);

    const deviceTypes = [
        { value: 'diagnostic', label: 'Diagnostic Device' },
        { value: 'therapeutic', label: 'Therapeutic Device' },
        { value: 'life_support', label: 'Life-support' },
        { value: 'lab', label: 'Laboratory Analytic Device' },
        { value: 'monitoring', label: 'Monitoring Device' },
        { value: 'hospital_industrial', label: 'Hospital Industrial Equipment' },
        { value: 'safety_equipment', label: 'Safety Equipment' },
        { value: 'other', label: 'Others' }
    ];

    const operationalStatuses = [
        { value: 'functional', label: 'Functional' },
        { value: 'non_functional', label: 'Non-functional' },
        { value: 'under_maintenance', label: 'Under maintenance' },
        { value: 'decommissioned', label: 'Decommissioned' }
    ];

    const departments = [
        { value: 'emergency', label: 'Emergency' },
        { value: 'opd', label: 'OPD' },
        { value: 'inpatient', label: 'Inpatient' },
        { value: 'maternity', label: 'Maternity' },
        { value: 'laboratory', label: 'Laboratory' },
        { value: 'pediatric', label: 'Pediatric' },
        { value: 'icu', label: 'ICU' },
        { value: 'radiology', label: 'Radiology' },
        { value: 'oncology', label: 'Oncology' },
        { value: 'physiotherapy', label: 'Physiotherapy' },
        { value: 'surgical', label: 'Surgical' },
        { value: 'dental', label: 'Dental' },
        { value: 'cardiology', label: 'Cardiology' },
        { value: 'orthopedic', label: 'Orthopedic' },
        { value: 'urology', label: 'Urology' },
        { value: 'neurology', label: 'Neurology' },
        { value: 'gynecology', label: 'Gynecology' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        // Clear the error for this field when the user makes changes
        setErrors(prev => ({ ...prev, [name]: '' }));
    
        // Parse supplier ID as integer if supplier field is changed
        if (name === 'supplier' && value) {
            setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, fileType) => {
        if (e.target.files && e.target.files[0]) {
            setFileData((prev) => ({ ...prev, [fileType]: e.target.files[0] }));
            // Clear file errors
            setFileErrors(prev => ({ ...prev, [fileType]: '' }));
            // Reset the URL when a new file is selected
            setFormData((prev) => ({ ...prev, [fileType]: '' }));
        }
    };

    const uploadFile = async (file, fileType) => {
        if (!file) {
            setFileErrors(prev => ({ ...prev, [fileType]: 'Please select a file to upload' }));
            return null;
        }

        setUploading((prev) => ({ ...prev, [fileType]: true }));

        const formDataForUpload = new FormData();
        formDataForUpload.append("file", file);
        formDataForUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${fileType === "image" ? "image" : "raw"}/upload`,
                {
                    method: "POST",
                    body: formDataForUpload,
                }
            );

            const data = await response.json();
            console.log(`${fileType} upload response:`, data);

            if (data.secure_url) {
                setFormData((prev) => ({ ...prev, [fileType]: data.secure_url }));
                console.log(`${fileType} URL:`, data.secure_url);
                return data.secure_url;
            } else if (data.error) {
                setFileErrors(prev => ({ ...prev, [fileType]: `Upload failed: ${data.error.message}` }));
            }
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
            setFileErrors(prev => ({ ...prev, [fileType]: `Upload failed: ${error.message}` }));
        } finally {
            setUploading((prev) => ({ ...prev, [fileType]: false }));
        }

        return null;
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'name', 'device_type', 'department', 'operational_status',
            'serial_number', 'manufacturer', 'model', 'supplier',
            'description', 'manufacturing_date', 'location'
        ];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required.';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Modify the handleSubmit function to handle updates
    const handleSubmit = async (e) => {
        e.preventDefault();

        // First validate the form
        if (!validateForm()) {
            console.log("Validation failed", errors);
            return;
        }

        // Upload any files that haven't been uploaded yet
        const uploadTasks = [];

        if (fileData.image && !formData.image) {
            uploadTasks.push(uploadFile(fileData.image, 'image'));
        }

        if (fileData.manual && !formData.manual) {
            uploadTasks.push(uploadFile(fileData.manual, 'manual'));
        }

        if (uploadTasks.length > 0) {
            setUploading({ image: true, manual: true });
            try {
                await Promise.all(uploadTasks);
                console.log("All files uploaded successfully");
            } catch (error) {
                console.error("Error uploading files:", error);
                setUploading({ image: false, manual: false });
                return;
            }
            setUploading({ image: false, manual: false });
        }

        // Log the final data being saved
        console.log(`${equipment ? 'Updating' : 'Saving'} equipment with data:`, formData);
        const finalFormData = {
            ...formData,
            supplier: formData.supplier ? parseInt(formData.supplier, 10) : ''
        };

        setSubmitting(true);
        try {
            // Determine whether to create or update
            let response;
            if (equipment) {
                // Call an update API function (you'll need to create this)
                response = await updateEquipment(equipment.id, finalFormData);
                console.log(equipment.id ,finalFormData)
            } else {
                // Create equipment via existing API call
                response = await createEquipment(finalFormData);
            }
            
            console.log(`${equipment ? 'Update' : 'Create'} equipment response:`, response);

            if (response.success) {
                if (onSave) {
                    onSave(response.data);
                }
                onClose();

                // Reset form
                setFormData({
                    name: '',
                    device_type: '',
                    department: '',
                    operational_status: '',
                    serial_number: '',
                    manufacturer: '',
                    model: '',
                    supplier: '',
                    description: '',
                    image: '',
                    manual: '',
                    manufacturing_date: '',
                    location: '',
                });

                setFileData({
                    image: null,
                    manual: null
                });

                setErrors({});
                setFileErrors({ image: '', manual: '' });
            } else {
                console.error("API Error:", response.error);
                // If the API returns validation errors, set them
                if (response.error && typeof response.error === 'object') {
                    setErrors(response.error);
                }
            }
        } catch (error) {
            console.error(`Error ${equipment ? 'updating' : 'creating'} equipment:`, error);
            // Handle different error responses
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Check if all required fields are filled
    const isFormComplete = () => {
        const requiredFields = [
            'name', 'device_type', 'department', 'operational_status',
            'serial_number', 'manufacturer', 'model', 'supplier',
            'description', 'manufacturing_date', 'location'
        ];

        return requiredFields.every(field => formData[field]);
    };

    // Check if we're currently uploading any files
    const isUploading = uploading.image || uploading.manual;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Equipment">
            <p className="mb-4 text-center text-xs">Enter the necessary details to register new equipment.</p>

            {/* Add a fixed height container with overflow-y-auto for scrolling */}
            <div className="overflow-y-auto max-h-[60vh] max-w-[100vh] text-xs">
                <form onSubmit={handleSubmit} className="space-y-4 px-1">
                    <div className="grid grid-cols-2 gap-4 ">
                        <div>
                            <label className="block mb-1">Equipment Image (Optional)</label>
                            <div
                                className={`border border-dashed rounded p-4 text-center cursor-pointer hover:bg-gray-50 transition ${fileErrors.image ? 'border-red-500' : ''}`}
                                onClick={() => document.getElementById('image')?.click()}
                            >
                                <div className="flex flex-col items-center justify-center h-24">
                                    {fileData.image ? (
                                        <>
                                            <p className="text-green-600 font-medium">{fileData.image.name}</p>
                                            {formData.image && (
                                                <p className="text-xs text-green-500 mt-1">✓ Uploaded successfully</p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className=" mt-1">Click to upload an image</p>
                                            <p className="text-xs text-gray-500">Max: 50MB</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="image"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'image')}
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                            </div>
                            {fileErrors.image && (
                                <p className="text-red-500 text-xs mt-1">{fileErrors.image}</p>
                            )}
                            {fileData.image && !formData.image && (
                                <button
                                    type="button"
                                    onClick={() => uploadFile(fileData.image, 'image')}
                                    disabled={uploading.image}
                                    className={`mt-2 w-full py-2 text-white rounded ${uploading.image ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"}`}
                                >
                                    {uploading.image ? "Uploading..." : "Upload Image"}
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1">Equipment Manual (Optional)</label>
                            <div
                                className={`border border-dashed rounded p-4 text-center cursor-pointer hover:bg-gray-50 transition ${fileErrors.manual ? 'border-red-500' : ''}`}
                                onClick={() => document.getElementById('manual')?.click()}
                            >
                                <div className="flex flex-col items-center justify-center h-24">
                                    {fileData.manual ? (
                                        <>
                                            <p className="text-green-600 font-medium">{fileData.manual.name}</p>
                                            {formData.manual && (
                                                <p className="text-xs text-green-500 mt-1">✓ Uploaded successfully</p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className=" mt-1">Click to upload a manual</p>
                                            <p className="text-xs text-gray-500">Max: 50MB</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="manual"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'manual')}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            {fileErrors.manual && (
                                <p className="text-red-500 text-xs mt-1">{fileErrors.manual}</p>
                            )}
                            {fileData.manual && !formData.manual && (
                                <button
                                    type="button"
                                    onClick={() => uploadFile(fileData.manual, 'manual')}
                                    disabled={uploading.manual}
                                    className={`mt-2 w-full py-2 text-white rounded ${uploading.manual ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"}`}
                                >
                                    {uploading.manual ? "Uploading..." : "Upload Manual"}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">
                                Equipment Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.location ? 'border-red-500' : ''}`}
                            />
                            {errors.location && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.location) ? errors.location[0] : errors.location}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">
                                Device Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="device_type"
                                value={formData.device_type}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.device_type ? 'border-red-500' : ''}`}
                            >
                                <option value="" disabled>Select device type</option>
                                {deviceTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            {errors.device_type && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.device_type) ? errors.device_type[0] : errors.device_type}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1">
                                Operational Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="operational_status"
                                value={formData.operational_status}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.operational_status ? 'border-red-500' : ''}`}
                            >
                                <option value="" disabled>Select status</option>
                                {operationalStatuses.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                            {errors.operational_status && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.operational_status) ? errors.operational_status[0] : errors.operational_status}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.department ? 'border-red-500' : ''}`}
                            >
                                <option value="" disabled>Select department</option>
                                {departments.map(dept => (
                                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                                ))}
                            </select>
                            {errors.department && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.department) ? errors.department[0] : errors.department}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1">
                                Serial Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.serial_number ? 'border-red-500' : ''}`}
                            />
                            {errors.serial_number && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.serial_number) ? errors.serial_number[0] : errors.serial_number}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">
                                Model <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.model ? 'border-red-500' : ''}`}
                            />
                            {errors.model && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.model) ? errors.model[0] : errors.model}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1">
                                Manufacturer <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.manufacturer ? 'border-red-500' : ''}`}
                            />
                            {errors.manufacturer && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.manufacturer) ? errors.manufacturer[0] : errors.manufacturer}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">
                                Manufacturing Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="manufacturing_date"
                                value={formData.manufacturing_date}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 border rounded ${errors.manufacturing_date ? 'border-red-500' : ''}`}
                            />
                            {errors.manufacturing_date && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.manufacturing_date) ? errors.manufacturing_date[0] : errors.manufacturing_date}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1">
                                Supplier <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.supplier ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">Select supplier</option>
                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.company_name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No suppliers available</option>
                                )}
                            </select>
                            {errors.supplier && (
                                <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.supplier) ? errors.supplier[0] : errors.supplier}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : ''}`}
                        ></textarea>
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.description) ? errors.description[0] : errors.description}</p>
                        )}
                    </div>
                </form>
            </div>

            {/* Put the submit button outside of the scrollable area */}
            <div className="mt-4 pt-4 border-t text-xs">
                <button
                    onClick={handleSubmit}
                    disabled={isUploading || submitting}
                    className={`w-full py-3 ${isUploading || submitting ? "bg-gray-500" : "bg-indigo-900 hover:bg-indigo-700"} text-white rounded`}
                >
                    {isUploading ? "Uploading..." : submitting ? "Saving..." : "Save Equipment"}
                </button>
            </div>
        </Modal>
    );
};

export default EquipmentModal;