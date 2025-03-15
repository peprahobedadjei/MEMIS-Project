import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { authenticatedRequest, formatOperationalStatus } from '../utils/api';
import { EyeIcon } from 'lucide-react';
import MaintenanceReportModal from './modals/ReportModal';

function Reports() {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Add these state variables
    const [currentPage, setCurrentPage] = useState(1);
    const [reportsPerPage] = useState(10);

    // Date range filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Add this function to calculate pagination
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
    const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

    // Function to change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // For filtering
    const [equipmentList, setEquipmentList] = useState([]);
    const [technicianList, setTechnicianList] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState('');

    // For modal
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Handle date range input changes
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

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

    // Fetch reports, equipment, and technicians on component mount
    useEffect(() => {
        fetchReports();
        fetchEquipmentList();
        fetchTechnicianList();
    }, []);

    // Filter reports based on search term and selected filters
    useEffect(() => {
        if (!reports.length) return;

        let filtered = [...reports];

        // Apply search filter if search term exists
        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply equipment filter if selected
        if (selectedEquipment) {
            filtered = filtered.filter(report => report.equipment === parseInt(selectedEquipment));
        }

        // Apply technician filter if selected
        if (selectedTechnician) {
            filtered = filtered.filter(report => report.technician === parseInt(selectedTechnician));
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            // Add one day to end date to include the end date in range
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);

            filtered = filtered.filter(report => {
                const reportDate = new Date(report.date_time);
                return reportDate >= start && reportDate < end;
            });
        } else if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(report => {
                const reportDate = new Date(report.date_time);
                return reportDate >= start;
            });
        } else if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            filtered = filtered.filter(report => {
                const reportDate = new Date(report.date_time);
                return reportDate < end;
            });
        }

        setFilteredReports(filtered);
    }, [searchTerm, selectedEquipment, selectedTechnician, startDate, endDate, reports]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedEquipment('');
        setSelectedTechnician('');
        setStartDate('');
        setEndDate('');
    };
    // Enhanced print preview function with better design
    const printReport = () => {
        if (!selectedReport) return;

        const equipmentName = equipmentList.find(e => e.id === parseInt(formFields.equipment))?.name || 'Equipment';
        const technicianName = getTechnicianName(parseInt(formFields.technician));
        const reportDate = format(new Date(formFields.date), 'dd MMM, yyyy');
        const preStatus = formatOperationalStatus(formFields.pre_status).text;
        const postStatus = formFields.post_status
            ? formatOperationalStatus(formFields.post_status).text
            : 'null';


        const printWindow = window.open('', '_blank');
        const openAddModal = () => {
            setViewMode(false);
            setShowModal(true);
        };

        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Maintenance Report - ${equipmentName}</title>
            <style>
                @page {
                    size: A4;
                    margin: 15mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .report-container {
                    background-color: white;
                    border: 1px solid #ddd;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    padding: 30px;
                    margin-bottom: 20px;
                }
                .report-header {
                    border-bottom: 1px solid #eee;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .timestamp {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .title {
                    font-size: 22px;
                    font-weight: bold;
                    margin: 10px 0;
                    color: #000;
                }
                .subtitle {
                    font-size: 14px;
                    color: #555;
                    margin-bottom: 15px;
                }
                .status-section {
                    margin-bottom: 25px;
                }
                .status-label {
                    font-weight: bold;
                    display: inline-block;
                    width: 100px;
                }
                .status-value {
                    display: inline-block;
                }
                .notes-section {
                    margin-top: 25px;
                }
                .notes-label {
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .notes-content {
                    background-color: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    padding: 10px 15px;
                    border-radius: 4px;
                    white-space: pre-wrap;
                }
                .header-info {
                    display: flex;
                    justify-content: space-between;
                }
                .system-info {
                    font-size: 12px;
                    color: #888;
                }
                @media print {
                    body {
                        background-color: white;
                        padding: 0;
                    }
                    .report-container {
                        box-shadow: none;
                        border: none;
                        padding: 0;
                    }
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header-info">
                    <div class="system-info">
                        ${format(new Date(), 'M/d/yy, h:mm a')}
                    </div>
                    <div class="system-info">
                        MEMS | Reports
                    </div>
                </div>
                
                <div class="report-header">
                    <div class="timestamp">${reportDate} Maintenance Report on</div>
                    <div class="title">${equipmentName}</div>
                    <div class="subtitle">by ${technicianName}</div>
                </div>
                
                <div class="status-section">
                    <div>
                        <span class="status-label">Pre-status:</span>
                        <span class="status-value">${preStatus}</span>
                    </div>
                    <div>
                        <span class="status-label">Post-status:</span>
                        <span class="status-value">${postStatus}</span>
                    </div>
                </div>
                
                <div class="notes-section">
                    <div class="notes-label">Note:</div>
                    <div class="notes-content">${formFields.notes || 'No notes provided.'}</div>
                </div>
            </div>
            
            <script>

                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `;

        // Write content to the new window
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const renderViewModal = () => {
        if (!showModal || !viewMode) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                    <div className="flex justify-end mb-2">
                        <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                        <div className="rounded-lg">
                            <h2 className="text-xs">
                                {format(new Date(formFields.date), 'dd MMM, yyyy')} Maintenance Report on
                            </h2>
                            <h1 className="text-sm font-semibold">
                                {equipmentList.find(e => e.id === parseInt(formFields.equipment))?.name || 'Equipment'}
                            </h1>
                            <p className="text-xs text-gray-600">
                                by {getTechnicianName(parseInt(formFields.technician))}
                            </p>
                            <div className='text-xs'>
                                <span className="font-medium mr-2">Pre - status:</span>
                                <span>{formatOperationalStatus(formFields.pre_status).text}</span>
                            </div>
                            <div className="flex mb-4 text-xs">
                                <span className="font-medium mr-2">Post - status:</span>
                                <span>{formatOperationalStatus(formFields.post_status).text}</span>
                            </div>
                            <button
                                onClick={printReport}
                                className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-xs"
                            >
                                <span className="mr-2">Download</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="rounded-lg">
                            <h3 className="text-sm mb-1 text-gray-500">Note:</h3>
                            <p className="text-xs">{formFields.notes}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await authenticatedRequest('get', '/maintenance-reports/');
            if (response && response.data) {
                setReports(response.data);
                setFilteredReports(response.data);
            }
        } catch (err) {
            setError('Failed to fetch maintenance reports');
            console.error('Error fetching reports:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEquipmentList = async () => {
        try {
            const response = await authenticatedRequest('get', '/equipment/');
            if (response && response.data) {
                // Create a unique list of equipment
                const uniqueEquipment = [];
                const equipmentIds = new Set();

                response.data.forEach(item => {
                    if (!equipmentIds.has(item.id)) {
                        equipmentIds.add(item.id);
                        uniqueEquipment.push(item);
                    }
                });

                setEquipmentList(uniqueEquipment);
            }
        } catch (err) {
            console.error('Error fetching equipment list:', err);
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
            console.log(technicianList)
        } catch (err) {
            console.error('Error fetching technician list:', err);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEquipmentFilter = (e) => {
        setSelectedEquipment(e.target.value);
    };

    const handleTechnicianFilter = (e) => {
        setSelectedTechnician(e.target.value);
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
        setViewMode(false);
        setShowModal(true);
    };

    const openViewModal = (report) => {
        // Format the date and time for the form
        const dateTime = new Date(report.date_time);
        const formattedDate = format(dateTime, 'yyyy-MM-dd');
        const formattedTime = format(dateTime, 'HH:mm');

        setFormFields({
            equipment: report.equipment,
            activity_type: report.activity_type,
            date: formattedDate,
            time: formattedTime,
            technician: report.technician,
            pre_status: report.pre_status,
            post_status: report.post_status,
            notes: report.notes
        });

        setSelectedReport(report);
        setViewMode(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedReport(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormFields({
            ...formFields,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine date and time into ISO format
        const dateTime = new Date(`${formFields.date}T${formFields.time}`);
        const isoDateTime = dateTime.toISOString();

        const reportData = {
            equipment: parseInt(formFields.equipment),
            activity_type: formFields.activity_type,
            date_time: isoDateTime,
            technician: parseInt(formFields.technician),
            pre_status: formFields.pre_status,
            post_status: formFields.post_status,
            notes: formFields.notes
        };

        try {
            const response = await authenticatedRequest('post', '/maintenance-reports/', reportData);
            if (response && response.status === 201) {
                // Success! Close modal and refresh reports
                closeModal();
                fetchReports();
            }
        } catch (err) {
            console.error('Error creating maintenance report:', err);
            alert('Failed to create maintenance report. Please try again.');
        }
    };

    const formatDateTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        return format(dateTime, 'dd-MM-yyyy/h:mm a');
    };

    // Find technician name by ID
    const getTechnicianName = (technicianId) => {
        const technician = technicianList.find(tech => tech.id === technicianId);
        if (technician) {
            return `${technician.first_name} ${technician.last_name}`;
        }
        return 'Unknown';
    };

    return (
        <div>
            <div className="p-4">
                <h1 className="text-sm font-bold mb-4">Report</h1>

                <div className="bg-white rounded-lg p-6 text-xs">
                    {/* Search and filter bar */}
                    <div className="flex flex-wrap gap-4 mb-6">


                        <div className="flex gap-2 items-center">
                            <div>
                                <input
                                    type="date"
                                    className="px-4 py-2 border rounded-md"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                />
                            </div>
                            <span>to</span>
                            <div>
                                <input
                                    type="date"
                                    className="px-4 py-2 border rounded-md"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative">
                                <select
                                    className="px-4 py-2 border rounded-md appearance-none pr-8 bg-white"
                                    value={selectedTechnician}
                                    onChange={handleTechnicianFilter}
                                >
                                    <option value="">Technician</option>
                                    {technicianList.map(tech => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.first_name} {tech.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <select
                                    className="px-4 py-2 border rounded-md appearance-none pr-8 bg-white"
                                    value={selectedEquipment}
                                    onChange={handleEquipmentFilter}
                                >
                                    <option value="">Equipment</option>
                                    {equipmentList.map(equip => (
                                        <option key={equip.id} value={equip.id}>
                                            {equip.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={openAddModal}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                        >
                            + Add New
                        </button>
                    </div>

                    {/* Reports Table */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="flex justify-center items-center h-64">Loading  Reports... </div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white ">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 border-b text-left">Date</th>
                                        <th className="py-2 px-4 border-b text-left">Equipment</th>
                                        <th className="py-2 px-4 border-b text-left">Activity type</th>
                                        <th className="py-2 px-4 border-b text-left">Technician</th>
                                        <th className="py-2 px-4 border-b text-left">Pre-Status</th>
                                        <th className="py-2 px-4 border-b text-left">Post-Status</th>
                                        <th className="py-2 px-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentReports.length > 0 ? (
                                        currentReports.map(report => {
                                            const preStatus = formatOperationalStatus(report.pre_status);
                                            const postStatus = report.post_status
                                                ? formatOperationalStatus(report.post_status)
                                                : { text: 'Not Set', className: 'bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs' };

                                            return (
                                                <tr key={report.id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-4 border-b">{formatDateTime(report.date_time)}</td>
                                                    <td className="py-4 px-4 border-b">{report.equipment_name}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        {report.activity_type === 'preventive maintenance'
                                                            ? 'Preventive maintenance'
                                                            : report.activity_type.charAt(0).toUpperCase() + report.activity_type.slice(1)}
                                                    </td>
                                                    <td className="py-2 px-4 border-b">{getTechnicianName(report.technician)}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className={preStatus.className}>{preStatus.text}</span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b">
                                                        <span className={postStatus.className}>{postStatus.text}</span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b text-center">
                                                        <button
                                                            onClick={() => openViewModal(report)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <EyeIcon size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-4 text-center text-gray-500">
                                                No reports found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="mt-4 flex justify-between items-center">
                                <div>
                                    Showing {indexOfFirstReport + 1} to {Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length} entries
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => paginate(i + 1)}
                                            className={`px-3 py-1 ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white border'} rounded`}
                                        >
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Add/View Modal */}
                {viewMode ?
                    renderViewModal() :
                    <MaintenanceReportModal
                        showModal={showModal && !viewMode}
                        closeModal={closeModal}
                        onSuccess={fetchReports}
                    />
                }

            </div>
        </div>
    )
}

export default Reports