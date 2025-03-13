// components/modals/EquipmentModal.js
import { useState, useEffect } from 'react';
import Modal from './Modals';
import { uploadImageToCloudinary, uploadPDFToCloudinary, getSuppliersList } from '../../utils/api';

const EquipmentModal = ({ isOpen, onClose, onSave }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
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

  const [fileNames, setFileNames] = useState({
    image: null,
    manual: null
  });

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getSuppliersList();
        if (response.success) {
          setSuppliers(response.data);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Save the file name to display to the user
      setFileNames(prev => ({ ...prev, [fileType]: file.name }));
      
      setIsUploading(true);
      
      try {
        let uploadResponse;
        
        if (fileType === 'image') {
          uploadResponse = await uploadImageToCloudinary(file);
        } else if (fileType === 'manual') {
          uploadResponse = await uploadPDFToCloudinary(file);
        }
        
        if (uploadResponse.success) {
          setFormData(prev => ({ 
            ...prev, 
            [fileType]: uploadResponse.data.url 
          }));
        } else {
          alert(`Failed to upload ${fileType}: ${uploadResponse.error}`);
          // Reset the file name if upload failed
          setFileNames(prev => ({ ...prev, [fileType]: null }));
        }
      } catch (error) {
        console.error(`Error uploading ${fileType}:`, error);
        alert(`Error uploading ${fileType}`);
        // Reset the file name if upload failed
        setFileNames(prev => ({ ...prev, [fileType]: null }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert supplier to number if it's not already
    const submissionData = {
      ...formData,
      supplier: formData.supplier ? parseInt(formData.supplier, 10) : null
    };
    
    onSave(submissionData);
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
    
    setFileNames({
      image: null,
      manual: null
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Equipment">
      <p className="mb-4 text-center">Enter the necessary details to register new equipment.</p>
      
      {/* Add a fixed height container with overflow-y-auto for scrolling */}
      <div className="overflow-y-auto max-h-[60vh]">
        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            {/* File Upload Section */}
            <div>
              <label className="block mb-1">Equipment Image (Optional)</label>
              <div className="border border-dashed rounded p-4 text-center cursor-pointer" 
                  onClick={() => document.getElementById('image')?.click()}>
                <div className="flex flex-col items-center justify-center h-24">
                  {fileNames.image ? (
                    <div className="text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>{fileNames.image}</p>
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      <p className="text-sm mt-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">Equipment image (maximum size of 50MB)</p>
                    </>
                  )}
                </div>
                <input 
                  id="image" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'image')} 
                  accept="image/*"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1">Equipment Manual (Optional)</label>
              <div className="border border-dashed rounded p-4 text-center cursor-pointer"
                  onClick={() => document.getElementById('manual')?.click()}>
                <div className="flex flex-col items-center justify-center h-24">
                  {fileNames.manual ? (
                    <div className="text-sm text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>{fileNames.manual}</p>
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      <p className="text-sm mt-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">Equipment manual (maximum file size of 50MB)</p>
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
                className="w-full p-2 border rounded"
              />
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
                className="w-full p-2 border rounded"
              />
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
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select device type</option>
                {deviceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
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
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select status</option>
                {operationalStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
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
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select department</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
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
                className="w-full p-2 border rounded"
              />
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
                className="w-full p-2 border rounded"
              />
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
                className="w-full p-2 border rounded"
              />
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
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Supplier</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
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
              className="w-full p-2 border rounded"
            ></textarea>
          </div>
        </form>
      </div>

      {/* Put the submit button outside of the scrollable area */}
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className={`w-full py-3 ${isUploading ? 'bg-gray-400' : 'bg-indigo-900 hover:bg-indigo-800'} text-white rounded`}
        >
          {isUploading ? 'Uploading...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
};

export default EquipmentModal;