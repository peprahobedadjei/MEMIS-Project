import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import SupplierModal from './modals/SupplierModal';
import EquipmentModal from './modals/EquipmentModal';
import DeleteConfirmationModal from './modals/DeleteModal';
import {
    deleteSupplier,
    checkUserSession,
    getEquipmentList,
    getSuppliersList,
    formatOperationalStatus,
    formatDeviceType,
    formatDepartment,
    logoutUser,
    deleteEquipment
} from '../utils/api';
import { PencilIcon, Trash2 } from 'lucide-react';

export default function EquipmentAndSuppliers() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('equipment');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteItemType, setDeleteItemType] = useState('');
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // Data states
    const [equipmentList, setEquipmentList] = useState([]);
    const [suppliersList, setSuppliersList] = useState([]);

    // Filter states
    const [equipmentFilter, setEquipmentFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    // Dropdown visibility states
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    // Dropdown refs for click outside handling
    const statusDropdownRef = useRef(null);
    const typeDropdownRef = useRef(null);
    const departmentDropdownRef = useRef(null);

    // Pagination states
    const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
    const [currentSupplierPage, setCurrentSupplierPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Define fetchData outside of useEffect so it can be reused
    const fetchData = async () => {
        try {
            // Check if user is authenticated
            const sessionStatus = await checkUserSession();
            if (!sessionStatus.success) {
                router.push('/login');
                return;
            }

            setIsLoading(true);

            if (activeTab === 'equipment') {
                const equipmentResponse = await getEquipmentList();
                if (equipmentResponse.success) {
                    setEquipmentList(equipmentResponse.data);
                } else {
                    setError(equipmentResponse.error);
                }
            } else if (activeTab === 'suppliers') {
                const suppliersResponse = await getSuppliersList();
                if (suppliersResponse.success) {
                    setSuppliersList(suppliersResponse.data);
                } else {
                    setError(suppliersResponse.error);
                }
            }

            setIsLoading(false);
        } catch (error) {
            console.error(`Error fetching ${activeTab} data:`, error);
            setError(`Failed to load ${activeTab} data. Please try again.`);
            setIsLoading(false);
        }
    };

    // Use fetchData in the useEffect
    useEffect(() => {
        fetchData();
    }, [activeTab, router]);

    // Now this function can call fetchData properly
    const handleAddSupplier = () => {
        fetchData();
        setCurrentSupplierPage(1);
    };
    // Handle clicks outside of dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setShowStatusDropdown(false);
            }
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
                setShowTypeDropdown(false);
            }
            if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
                setShowDepartmentDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Reset filters
    const resetFilters = () => {
        setStatusFilter('');
        setDeviceTypeFilter('');
        setDepartmentFilter('');
    };

    // Get unique values for filters from equipment list
    const uniqueStatuses = [...new Set(equipmentList.map(item => item.operational_status))];
    const uniqueTypes = [...new Set(equipmentList.map(item => item.device_type))];
    const uniqueDepartments = [...new Set(equipmentList.map(item => item.department))];

    // Handle equipment filtering
    const filteredEquipment = equipmentList.filter(item => {
        const nameMatch =
            item.name.toLowerCase().includes(equipmentFilter.toLowerCase()) ||
            item.equipment_id.toLowerCase().includes(equipmentFilter.toLowerCase()) ||
            item.serial_number.toLowerCase().includes(equipmentFilter.toLowerCase());

        const statusMatch = statusFilter === '' || item.operational_status === statusFilter;
        const typeMatch = deviceTypeFilter === '' || item.device_type === deviceTypeFilter;
        const departmentMatch = departmentFilter === '' || item.department === departmentFilter;

        return nameMatch && statusMatch && typeMatch && departmentMatch;
    });

    // Handle supplier filtering
    const filteredSuppliers = suppliersList.filter(item =>
        item.company_name.toLowerCase().includes(supplierFilter.toLowerCase()) ||
        item.company_email.toLowerCase().includes(supplierFilter.toLowerCase())
    );

    // Pagination for equipment
    const indexOfLastEquipment = currentEquipmentPage * itemsPerPage;
    const indexOfFirstEquipment = indexOfLastEquipment - itemsPerPage;
    const currentEquipment = filteredEquipment.slice(indexOfFirstEquipment, indexOfLastEquipment);
    const totalEquipmentPages = Math.ceil(filteredEquipment.length / itemsPerPage);

    // Pagination for suppliers
    const indexOfLastSupplier = currentSupplierPage * itemsPerPage;
    const indexOfFirstSupplier = indexOfLastSupplier - itemsPerPage;
    const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);
    const totalSupplierPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

    // Pagination controls
    const renderPagination = (currentPage, totalPages, setCurrentPage) => {
        return (
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    &lt;
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                        pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                    } else {
                        pageNumber = currentPage - 2 + index;
                    }

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-amber-400 text-white' : 'hover:bg-gray-200'}`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    &gt;
                </button>
            </div>
        );
    };

    // Dropdown toggle functions
    const toggleStatusDropdown = () => {
        setShowStatusDropdown(!showStatusDropdown);
        setShowTypeDropdown(false);
        setShowDepartmentDropdown(false);
    };

    const toggleTypeDropdown = () => {
        setShowTypeDropdown(!showTypeDropdown);
        setShowStatusDropdown(false);
        setShowDepartmentDropdown(false);
    };

    const toggleDepartmentDropdown = () => {
        setShowDepartmentDropdown(!showDepartmentDropdown);
        setShowStatusDropdown(false);
        setShowTypeDropdown(false);
    };



    const handleDeleteItem = async () => {
        if (!itemToDelete) return;

        let response;

        if (deleteItemType === 'supplier') {
            response = await deleteSupplier(itemToDelete.id);

            if (response.success) {

                setIsDeleteModalOpen(false);
                setSupplierToDelete(null);
                fetchData()
            }

        } else if (deleteItemType === 'equipment') {
            response = await deleteEquipment(itemToDelete.id);

            if (response.success) {
                setIsDeleteModalOpen(false);
                setSupplierToDelete(null);
                fetchData()
            }
        }

        if (response && response.success) {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);

        } else {

            console.error('Delete failed:', response?.error);
        }
    };


    const openDeleteModal = (item, type) => {
        setItemToDelete(item);
        setDeleteItemType(type);
        setIsDeleteModalOpen(true);
    };


    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        setIsSupplierModalOpen(true);
      };

    const closeSupplierModal = () => {
        setIsSupplierModalOpen(false);
        setEditingSupplier(null);
      };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brandColor border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brandColor">Loading {activeTab} data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <div className="flex justify-between">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={logoutUser}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tab Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto">
                    <div className="flex">
                        <button
                            className={`px-4 py-4 font-medium text-sm ${activeTab === 'equipment'
                                ? 'border-b-2 border-amber-500 text-amber-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => handleTabChange('equipment')}
                        >
                            Equipment
                        </button>
                        <button
                            className={`px-4 py-4 font-medium text-sm ${activeTab === 'suppliers'
                                ? 'border-b-2 border-amber-500 text-amber-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => handleTabChange('suppliers')}
                        >
                            Suppliers
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Equipment Content */}
                {activeTab === 'equipment' && (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Equipments</h1>

                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="p-4 flex justify-between items-center">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Filter by equipment name..."
                                        className="border rounded-lg px-3 py-2 pl-10 w-72"
                                        value={equipmentFilter}
                                        onChange={(e) => setEquipmentFilter(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    {/* Status Filter Dropdown */}
                                    <div className="relative" ref={statusDropdownRef}>
                                        <button
                                            onClick={toggleStatusDropdown}
                                            className={`inline-flex items-center rounded-md ${statusFilter ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'bg-white'} px-3 py-2 text-sm font-medium text-gray-700 shadow-sm`}
                                        >
                                            <span className="mr-2">{statusFilter ? formatOperationalStatus(statusFilter).text : 'Status'}</span>
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showStatusDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1" role="menu" aria-orientation="vertical">
                                                    <button
                                                        onClick={() => {
                                                            setStatusFilter('');
                                                            setShowStatusDropdown(false);
                                                            setCurrentEquipmentPage(1);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        All Statuses
                                                    </button>

                                                    {uniqueStatuses.map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => {
                                                                setStatusFilter(status);
                                                                setShowStatusDropdown(false);
                                                                setCurrentEquipmentPage(1);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            role="menuitem"
                                                        >
                                                            {formatOperationalStatus(status).text}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Device Type Filter Dropdown */}
                                    <div className="relative" ref={typeDropdownRef}>
                                        <button
                                            onClick={toggleTypeDropdown}
                                            className={`inline-flex items-center rounded-md ${deviceTypeFilter ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'bg-white'} px-3 py-2 text-sm font-medium text-gray-700 shadow-sm`}
                                        >
                                            <span className="mr-2">{deviceTypeFilter ? formatDeviceType(deviceTypeFilter) : 'Device Type'}</span>
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showTypeDropdown && (
                                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                                                    <button
                                                        onClick={() => {
                                                            setDeviceTypeFilter('');
                                                            setShowTypeDropdown(false);
                                                            setCurrentEquipmentPage(1);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        All Device Types
                                                    </button>

                                                    {uniqueTypes.map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                setDeviceTypeFilter(type);
                                                                setShowTypeDropdown(false);
                                                                setCurrentEquipmentPage(1);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            role="menuitem"
                                                        >
                                                            {formatDeviceType(type)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Department Filter Dropdown */}
                                    <div className="relative" ref={departmentDropdownRef}>
                                        <button
                                            onClick={toggleDepartmentDropdown}
                                            className={`inline-flex items-center rounded-md ${departmentFilter ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'bg-white'} px-3 py-2 text-sm font-medium text-gray-700 shadow-sm`}
                                        >
                                            <span className="mr-2">{departmentFilter ? formatDepartment(departmentFilter) : 'Department'}</span>
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showDepartmentDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                                                    <button
                                                        onClick={() => {
                                                            setDepartmentFilter('');
                                                            setShowDepartmentDropdown(false);
                                                            setCurrentEquipmentPage(1);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        All Departments
                                                    </button>

                                                    {uniqueDepartments.map(dept => (
                                                        <button
                                                            key={dept}
                                                            onClick={() => {
                                                                setDepartmentFilter(dept);
                                                                setShowDepartmentDropdown(false);
                                                                setCurrentEquipmentPage(1);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            role="menuitem"
                                                        >
                                                            {formatDepartment(dept)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reset Filters Button - Only show when filters are active */}
                                    {(statusFilter || deviceTypeFilter || departmentFilter) && (
                                        <button
                                            onClick={resetFilters}
                                            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
                                        >
                                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reset Filters
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setIsEquipmentModalOpen(true)}
                                        className="inline-flex items-center rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add New
                                    </button>
                                </div>
                            </div>

                            {/* Active filter indicators */}
                            {(statusFilter || deviceTypeFilter || departmentFilter) && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-b">
                                    <div className="flex flex-wrap gap-2">
                                        {statusFilter && (
                                            <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                                                <span className="mr-1">Status: {formatOperationalStatus(statusFilter).text}</span>
                                                <button
                                                    onClick={() => setStatusFilter('')}
                                                    className="text-amber-700 hover:text-amber-900"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {deviceTypeFilter && (
                                            <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                                                <span className="mr-1">Type: {formatDeviceType(deviceTypeFilter)}</span>
                                                <button
                                                    onClick={() => setDeviceTypeFilter('')}
                                                    className="text-amber-700 hover:text-amber-900"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {departmentFilter && (
                                            <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                                                <span className="mr-1">Department: {formatDepartment(departmentFilter)}</span>
                                                <button
                                                    onClick={() => setDepartmentFilter('')}
                                                    className="text-amber-700 hover:text-amber-900"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Equipment Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Equipment ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Serial Number
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Device Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 ">
                                        {currentEquipment.map((equipment) => {
                                            const status = formatOperationalStatus(equipment.operational_status);

                                            return (
                                                <tr key={equipment.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {equipment.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {equipment.equipment_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {equipment.serial_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDepartment(equipment.department)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={status.className}>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDeviceType(equipment.device_type)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                                                        <div className='flex space-x-4 cursor-pointer'>
                                                            <PencilIcon size={20} />
                                                            <Trash2
                                                                size={20}
                                                                className='text-red-600'
                                                                onClick={() => openDeleteModal(equipment, 'equipment')}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination for Equipment */}
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentEquipmentPage(Math.max(1, currentEquipmentPage - 1))}
                                        disabled={currentEquipmentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentEquipmentPage(Math.min(totalEquipmentPages, currentEquipmentPage + 1))}
                                        disabled={currentEquipmentPage === totalEquipmentPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{indexOfFirstEquipment + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(indexOfLastEquipment, filteredEquipment.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredEquipment.length}</span> results
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">Show</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm"
                                            value={itemsPerPage}
                                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                        <div>
                                            {renderPagination(
                                                currentEquipmentPage,
                                                totalEquipmentPages,
                                                setCurrentEquipmentPage
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={handleDeleteItem}
                            itemName={
                                itemToDelete
                                    ? `${deleteItemType} "${deleteItemType === 'supplier'
                                        ? itemToDelete.company_name
                                        : itemToDelete.name}"`
                                    : `this ${deleteItemType}`
                            }
                        />
                        <EquipmentModal
                            isOpen={isEquipmentModalOpen}
                            onClose={() => setIsEquipmentModalOpen(false)}
                        // onSave={handleAddSupplier}
                        />
                    </div>
                )}

                {/* Suppliers Content */}
                {activeTab === 'suppliers' && (
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Suppliers</h1>

                        <div className="bg-white rounded-lg  overflow-hidden">
                            <div className="p-4 flex justify-between items-center">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Filter by supplier name..."
                                        className="border rounded-lg px-3 py-2 pl-10 w-72"
                                        value={supplierFilter}
                                        onChange={(e) => setSupplierFilter(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsSupplierModalOpen(true)}
                                    className="inline-flex items-center rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
                                >
                                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add New
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company Email
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Phone Number
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Website Link
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentSuppliers.map((supplier) => (
                                            <tr key={supplier.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {supplier.company_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supplier.company_email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {supplier.contact}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                                                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        website
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className='flex space-x-4 cursor-pointer'>
                                                   
    <PencilIcon 
      size={20} 
      onClick={() => openEditModal(supplier)}
    />
                                                        <Trash2
                                                            size={20}
                                                            className='text-red-600'
                                                            onClick={() => openDeleteModal(supplier, 'supplier')}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination for Suppliers */}
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentSupplierPage(Math.max(1, currentSupplierPage - 1))}
                                        disabled={currentSupplierPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentSupplierPage(Math.min(totalSupplierPages, currentSupplierPage + 1))}
                                        disabled={currentSupplierPage === totalSupplierPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{indexOfFirstSupplier + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(indexOfLastSupplier, filteredSuppliers.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredSuppliers.length}</span> results
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">Show</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm"
                                            value={itemsPerPage}
                                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                        <div>
                                            {renderPagination(
                                                currentSupplierPage,
                                                totalSupplierPages,
                                                setCurrentSupplierPage
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={handleDeleteItem}
                            itemName={
                                itemToDelete
                                    ? `${deleteItemType} "${deleteItemType === 'supplier'
                                        ? itemToDelete.company_name
                                        : itemToDelete.name}"`
                                    : `this ${deleteItemType}`
                            }
                        />

                        <SupplierModal
                            isOpen={isSupplierModalOpen}
                            editingSupplier={editingSupplier}
                            onClose={() => setIsSupplierModalOpen(false)}
                            refreshSuppliers={handleAddSupplier}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}