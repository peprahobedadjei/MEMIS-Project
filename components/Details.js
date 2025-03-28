import React, { useState,useEffect } from 'react';
import { DownloadIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ImageModal from './modals/ImageModal';
import SingleReportModal from './modals/SingleReportModal';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { authenticatedRequest ,getEquipmentReport,getEquipmentDetails,formatOperationalStatus} from '../utils/api';
import { format } from 'date-fns';

const Details = () => {
    const [id, setId] = useState(null);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [equipmentReports, setEquipmentReports] = useState(null);

  const [users, setUsers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
  useEffect(() => {
    const storedId = sessionStorage.getItem('selectedEquipmentId');
    if (storedId) {
      setId(storedId); 
      fetchEquipmentDetails(storedId);
      fetchEquipmentReports(storedId);
      fetchUsers();
    }
  }, []); 
    // Form fields
    const [formFields, setFormFields] = useState({
        equipment: '',
        activity_type: '',
        date_time: '',
        technician: '',
        pre_status: '',
        post_status: '',
        notes: ''
    });
  const [isModalOpen, setIsModalOpen] = useState(false);
 const [showModal, setShowModal] = useState(false);
  const handleImageClick = () => {
    setIsModalOpen(true);
  };
    const openAddModal = () => {
        setFormFields({
            equipment: '',
            activity_type: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm'),
            technician: '',
            pre_status: '',
            post_status: '',
            notes: ''
        });
        setShowModal(true);
    };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const closeModal = () => {
    setShowModal(false);
  };
      
      const fetchEquipmentDetails = async (equipmentId) => {
        try {
          const response = await getEquipmentDetails(equipmentId);
          setEquipmentDetails(response.data);
        } catch (err) {
          setError('An error occurred while fetching equipment details');
          console.error(err);
        }
      };
      
      const fetchEquipmentReports = async (equipmentId) => {
        try {
          const response = await getEquipmentReport(equipmentId);
          setEquipmentReports(response.data);
        } catch (err) {
          setError('An error occurred while fetching equipment reports');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
        
      const fetchUsers = async () => {
        try {
          const response = await authenticatedRequest('get', '/users/');
          if (response && response.data) {
            setUsers(response.data);
          }
        } catch (err) {
          setError('Failed to fetch users');
          console.error('Error fetching users:', err);
        }
      };
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedTechnician, setSelectedTechnician] = useState('all');
    const filteredReports = Array.isArray(equipmentReports)
        ? selectedTechnician === 'all'
            ? equipmentReports
            : equipmentReports.filter(report => {
                // Convert both to strings to ensure proper comparison
                return String(report.technician) === String(selectedTechnician);
            })
        : [];


    const formatDeviceType = (type) => {
        // Convert snake_case to Title Case
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') + ' Device';
    };
    const indexOfLastReport = currentPage * itemsPerPage;
    const indexOfFirstReport = indexOfLastReport - itemsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const formatOperationalStatus = (status) => {
        switch (status) {
            case 'functional':
                return { text: 'Functional', className: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs' };
            case 'non_functional':
                return { text: 'Non-Functional', className: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs' };
            case 'under_maintenance':
                return { text: 'Under Maintenance', className: 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs' };
            case 'decommissioned':
                return { text: 'Decommissioned', className: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs' };
            default:
                return { text: status, className: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs' };
        }
    };
    const getUniqueTechnicians = () => {
        if (!Array.isArray(equipmentReports) || !users) return [];

        // Get unique technician IDs from reports
        const technicianIds = [...new Set(equipmentReports.map(report => report.technician))];

        // Map IDs to user objects
        return technicianIds.map(id => {
            const user = users.find(user => user.id === id);
            return {
                id,
                name: user ? `${user.first_name} ${user.last_name}` : `Unknown (ID: ${id})`
            };
        });
    };

    // Create a function to handle page changes
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    if (!equipmentDetails || !equipmentReports) return <div className="flex justify-center items-center h-screen">No data available</div>;

    // Format dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Format time
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}/${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Format department
    const formatDepartment = (dept) => {
        const deptMap = {
            "inpatient": "Inpatient",
            "outpatient": "Outpatient",
            "emergency": "Emergency",
            "laboratory": "Laboratory",
            "radiology": "Radiology",
            "pharmacy": "Pharmacy",
            "surgery": "Surgery",
            "icu": "ICU",
            "other": "Other"
        };
        return deptMap[dept] || dept;
    };

    // Get technician full name from user ID
    const getTechnicianName = (technicianId) => {
        if (!users || !Array.isArray(users)) return `Unknown (ID: ${technicianId})`;

        const user = users.find(user => user.id === technicianId);
        if (user && user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return `Unknown (ID: ${technicianId})`;
    };

    // Prepare chart data
    const prepareChartData = () => {
        if (!equipmentReports || !Array.isArray(equipmentReports)) return [];

        const filteredReports = equipmentReports.filter(report => {
            const reportDate = new Date(report.date_time);
            return reportDate.getFullYear() === currentYear;
        });

        // Group by month and activity type
        const monthlyData = {};

        filteredReports.forEach(report => {
            const date = new Date(report.date_time);
            const month = date.toLocaleString('default', { month: 'short' });

            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month,
                    preventive: 0,
                    repair: 0,
                    calibration: 0
                };
            }

            if (report.activity_type === 'preventive') {
                monthlyData[month].preventive += 1;
            } else if (report.activity_type === 'repair') {
                monthlyData[month].repair += 1;
            } else if (report.activity_type === 'calibration') {
                monthlyData[month].calibration += 1;
            }
        });

        // Convert to array and sort by month
        return Object.values(monthlyData).sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.indexOf(a.month) - months.indexOf(b.month);
        });
    };

    const chartData = prepareChartData();


    const printEquipmentDetails = () => {
        const equipmentName = equipmentDetails?.name || 'Equipment Details';
        const equipmentId = equipmentDetails?.equipment_id || '';
        
        // Create a new window/tab
        const printWindow = window.open('', '_blank');
        
        // Generate HTML content for printing
        const printContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Print - ${equipmentName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #ccc;
                    }
                    .equipment-image {
                        width: 100px;
                        height: 100px;
                        background-color: #fde68a;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        margin: 0 auto 10px;
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .detail-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .detail-table td {
                        padding: 8px;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-table td:first-child {
                        width: 40%;
                        color: #666;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                    }
                    .status-functional {
                        background-color: #d1fae5;
                        color: #065f46;
                    }
                    .status-non-functional {
                        background-color: #fee2e2;
                        color: #b91c1c;
                    }
                    .status-maintenance {
                        background-color: #fef3c7;
                        color: #92400e;
                    }
                    .reports-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    .reports-table th, .reports-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .reports-table th {
                        background-color: #f2f2f2;
                    }
                    .print-footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    @media print {
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="equipment-image">📊</div>
                    <h1>${equipmentName}</h1>
                    <p>${equipmentId}</p>
                </div>
                
                <div class="section">
                    <h2>Description</h2>
                    <p>${equipmentDetails?.description || 'No description available'}</p>
                </div>
                
                <div class="section">
                    <h2>Equipment Details</h2>
                    <table class="detail-table">
                        <tr>
                            <td>Device Type:</td>
                            <td>${equipmentDetails?.device_type === 'other' ? 'Other' : formatDeviceType(equipmentDetails?.device_type || '')}</td>
                        </tr>
                        <tr>
                            <td>Operational Status:</td>
                            <td>
                                <span class="status-badge ${
                                    equipmentDetails?.operational_status === 'functional' ? 'status-functional' :
                                    equipmentDetails?.operational_status === 'non_functional' ? 'status-non-functional' :
                                    'status-maintenance'
                                }">
                                    ${
                                        equipmentDetails?.operational_status === 'functional' ? 'Functional' :
                                        equipmentDetails?.operational_status === 'non_functional' ? 'Non-functional' :
                                        'Under Maintenance'
                                    }
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td>Department:</td>
                            <td>${formatDepartment(equipmentDetails?.department || '')}</td>
                        </tr>
                        <tr>
                            <td>Location:</td>
                            <td>${equipmentDetails?.location || ''}</td>
                        </tr>
                        <tr>
                            <td>Serial Number:</td>
                            <td>${equipmentDetails?.serial_number || ''}</td>
                        </tr>
                        <tr>
                            <td>Model:</td>
                            <td>${equipmentDetails?.model || ''}</td>
                        </tr>
                        <tr>
                            <td>Manufacturer:</td>
                            <td>${equipmentDetails?.manufacturer || ''}</td>
                        </tr>
                        <tr>
                            <td>Date Manufactured:</td>
                            <td>${equipmentDetails?.manufacturing_date || ''}</td>
                        </tr>
                        <tr>
                            <td>Supplier:</td>
                            <td>${equipmentDetails?.supplier_name || ''}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Maintenance Reports</h2>
                    <table class="reports-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Activity Type</th>
                                <th>Technician</th>
                                <th>Pre-Status</th>
                                <th>Post-Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.isArray(equipmentReports) ? equipmentReports.map(report => `
                                <tr>
                                    <td>${formatDateTime(report.date_time)}</td>
                                    <td>${report.activity_type}</td>
                                    <td>${getTechnicianName(report.technician)}</td>
                                    <td>${formatOperationalStatus(report.pre_status).text}</td>
                                    <td>${formatOperationalStatus(report.post_status || report.pre_status).text}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">No reports available</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                <div class="print-footer">
                    <p>Printed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Print Document</button>
                </div>
            </body>
            </html>
        `;
        
        // Write the content to the new window
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Focus on the new window
        printWindow.focus();
    };
    return (
        <div className="max-w-screen-xl mx-auto p-4 min-h-screen">
            <div className="bg-white rounded-lg  p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-bold">{equipmentDetails.name}</h1>
                    <button     onClick={printEquipmentDetails} className="bg-amber-500 text-white px-3 py-1 rounded-md flex items-center text-sm">
                        <DownloadIcon size={16} className="mr-1" /> Download
                    </button>
                </div>
                <div className="flex text-sm mb-4">
                    <Link href="/equipments" className="text-gray-500 hover:text-amber-500">Equipments</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{equipmentDetails.name}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg p-4 mb-6">
                        <div className="flex mb-4 cursor-pointer">
                            <div className=" p-2 rounded-lg mr-4">
                            {equipmentDetails.image ? (
          <>
            <div 
              className="cursor-pointer" 
              onClick={handleImageClick}
            >
              <Image
                src={equipmentDetails.image}
                alt={equipmentDetails.name}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>

            {/* Modal that appears when image is clicked */}
            {isModalOpen && (
                  <ImageModal 
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  imageUrl={equipmentDetails.image}
                  altText={equipmentDetails.name}
                />
            )}
          </>
        ) : (
          <div className="w-20 h-20 bg-amber-200 flex items-center justify-center text-amber-500 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
        )}
                            </div>
                            <div>
                                <h2 className="font-bold">{equipmentDetails.name}</h2>
                                <p className="text-xs text-gray-600">{equipmentDetails.equipment_id}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-semibold mb-2">Description</h3>
                            <p className="text-xs text-gray-600">{equipmentDetails.description}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-semibold mb-2">Equipment Details</h3>
                            <table className="w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-gray-500">Device Type:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.device_type === 'other' ? 'Other' : formatDeviceType(equipmentDetails.device_type)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Operational Status:</td>
                                        <td className="py-1 font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${equipmentDetails.operational_status === 'functional' ? 'bg-green-100 text-green-800' :
                                                equipmentDetails.operational_status === 'non_functional' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {equipmentDetails.operational_status === 'functional' ? 'Functional' :
                                                    equipmentDetails.operational_status === 'non_functional' ? 'Non-functional' :
                                                        'Under Maintenance'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Department:</td>
                                        <td className="py-1 font-medium">{formatDepartment(equipmentDetails.department)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Location:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.location}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2">Equipment Identification</h3>
                            <table className="w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-gray-500">Serial Number:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.serial_number}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Model:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.model}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Manufacturer:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.manufacturer}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Date Manufactured:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.manufacturing_date}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-gray-500">Supplier:</td>
                                        <td className="py-1 font-medium">{equipmentDetails.supplier_name}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {equipmentDetails.manual && (
                            <a
                                href={equipmentDetails.manual}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center w-full text-sm"
                            >
                                <span className="mr-2">Download Manual</span>
                                <DownloadIcon size={16} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg  p-4 mb-6">
                        <div className="mb-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Maintenance Report Overview</h3>
                                <div className="flex items-center">
                                    <span className="text-sm mr-2">{currentYear}</span>
                                    <button className="p-1" onClick={() => setCurrentYear(currentYear - 1)}>
                                        <ChevronLeftIcon size={16} />
                                    </button>
                                </div>
                            </div>


                            {/* Recharts BarChart */}
                            <div className="h-48 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Bar dataKey="preventive" name="Preventive" fill="#3b82f6" />
                                        <Bar dataKey="repair" name="Repair" fill="#f59e0b" />
                                        <Bar dataKey="calibration" name="Calibration" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white rounded-lg  p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold">Maintenance Reports</h3>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <select
                                        className="text-xs bg-gray-100 px-2 py-1 rounded-md mr-2"
                                        value={selectedTechnician}
                                        onChange={(e) => {
                                            setSelectedTechnician(e.target.value);
                                            setCurrentPage(1); // Reset to first page when filtering
                                        }}
                                    >
                                        <option value="all">All Technicians</option>
                                        {getUniqueTechnicians().map(tech => (
                                            <option key={tech.id} value={tech.id}>
                                                {tech.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button   onClick={openAddModal} className="bg-amber-500 text-white px-3 py-1 rounded-md flex items-center text-xs">
                                        <PlusIcon size={16} className="mr-1" /> Add New
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reports table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Equipment</th>
                                        <th scope="col" className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Activity type</th>
                                        <th scope="col" className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Technician</th>
                                        <th scope="col" className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Pre-Status</th>
                                        <th scope="col" className="px-4 py-2 text-left text-gray-500 uppercase tracking-wider">Post-Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentReports.map((report, index) => (
                                        <tr key={report.id || index}>
                                            <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(report.date_time)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{report.equipment_name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap capitalize">{report.activity_type}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getTechnicianName(report.technician)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={formatOperationalStatus(report.pre_status).className}>
                                                    {formatOperationalStatus(report.pre_status).text}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={formatOperationalStatus(report.pre_status).className}>
                                                        {formatOperationalStatus(report.pre_status).text}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-xs text-gray-500">
                                Showing {indexOfFirstReport + 1} to {Math.min(indexOfLastReport, equipmentReports?.length || 0)} of {equipmentReports?.length || 0} entries
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2 text-xs">Show</span>
                                <select
                                    className="border rounded px-2 py-1 text-xs"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset to first page when changing items per page
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <div className="ml-4 flex items-center space-x-1">
                                    <button
                                        className="px-2 py-1 border rounded text-xs"
                                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeftIcon size={14} />
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Show pages around current page
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                className={`px-2 py-1 border rounded text-xs ${currentPage === pageNum ? 'bg-amber-500 text-white' : ''}`}
                                                onClick={() => paginate(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        className="px-2 py-1 border rounded text-xs"
                                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRightIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SingleReportModal
                                    showModal={showModal}
                                    closeModal={closeModal}
                                />
        </div>
    );
};

export default Details;