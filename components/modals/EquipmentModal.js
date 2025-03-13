// components/modals/EquipmentModal.js
import { useState } from 'react';
import Modal from './Modals';

const EquipmentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    equipmentName: '',
    equipmentId: '',
    deviceType: '',
    operationalStatus: '',
    department: '',
    location: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    manufacturedDate: '',
    supplier: '',
    description: '',
    equipmentImage: null,
    equipmentManual: null,
  });

  const deviceTypes = [
    'Diagnostic Device',
    'Therapeutic Device',
    'Life-support',
    'Laboratory Analytic Device',
    'Monitoring Device',
    'Hospital Industrial Equipment',
    'Safety Equipment',
    'Others'
  ];

  const operationalStatuses = [
    'Functional',
    'Non-functional',
    'Under maintenance',
    'Decommissioned'
  ];

  const departments = [
    'Emergency',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Radiology'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [fileType]: e.target.files[0] || null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    // Reset form
    setFormData({
      equipmentName: '',
      equipmentId: '',
      deviceType: '',
      operationalStatus: '',
      department: '',
      location: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      manufacturedDate: '',
      supplier: '',
      description: '',
      equipmentImage: null,
      equipmentManual: null,
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
                  onClick={() => document.getElementById('equipmentImage')?.click()}>
                <div className="flex flex-col items-center justify-center h-24">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  <p className="text-sm mt-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Equipment image (maximum size of 50MB)</p>
                </div>
                <input 
                  id="equipmentImage" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'equipmentImage')} 
                  accept="image/*"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1">Equipment Manual (Optional)</label>
              <div className="border border-dashed rounded p-4 text-center cursor-pointer"
                  onClick={() => document.getElementById('equipmentManual')?.click()}>
                <div className="flex flex-col items-center justify-center h-24">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  <p className="text-sm mt-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Equipment manual (maximum file size of 50MB)</p>
                </div>
                <input 
                  id="equipmentManual" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'equipmentManual')} 
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
                name="equipmentName"
                value={formData.equipmentName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Equipment ID</label>
              <input
                type="text"
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                placeholder="XXX - YYY - 000"
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
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select device type</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">
                Operational Status <span className="text-red-500">*</span>
              </label>
              <select
                name="operationalStatus"
                value={formData.operationalStatus}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select status</option>
                {operationalStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
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
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
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
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block mb-1">
                Manufactured Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="manufacturedDate"
                value={formData.manufacturedDate}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Supplier</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Select supplier</option>
                {/* This would be populated from your supplier list */}
                <option value="supplier1">Supplier 1</option>
                <option value="supplier2">Supplier 2</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Put the submit button outside of the scrollable area */}
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-indigo-900 text-white rounded hover:bg-indigo-800"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default EquipmentModal;