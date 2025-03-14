// components/InventoryTable.jsx
import React, { useState, useEffect } from 'react';
import { Trash, Pencil, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { getInventoryItems, deleteInventoryItem } from '../utils/api';
import DeleteConfirmationModal from './modals/DeleteModal';
import InventoryModal from './modals/InventoryModal';

const InventoryTable = ({ onEdit, onInventoryChange }) => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockStatusFilter, setStockStatusFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [stockStatuses, setStockStatuses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);


      const handleSave = () => {
        fetchInventoryItems();
      };

    const fetchInventoryItems = async () => {
        setIsLoading(true);
        try {
            const response = await getInventoryItems();
            if (response.success) {
                setInventoryItems(response.data);
                setTotalItems(response.data.length);

                // Extract unique categories and stock statuses
                const uniqueCategories = [...new Set(response.data.map(item => item.category))];
                const uniqueStockStatuses = [...new Set(response.data.map(item => item.stock_status))];

                setCategories(uniqueCategories);
                setStockStatuses(uniqueStockStatuses);
            } else {
                setError(response.error || 'Failed to fetch inventory items');
            }
        } catch (err) {
            setError('An error occurred while fetching inventory items');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, [onInventoryChange]);

    const handleDelete = async (id) => {
        const item = inventoryItems.find(item => item.id === id);
        if (item) {
            setItemToDelete(item);
            setShowDeleteModal(true);
        }
    };
    const handleAddNew = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
      };
    
      const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
      };
    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await deleteInventoryItem(itemToDelete.id);
            if (response.success) {
                await fetchInventoryItems();
                setShowDeleteModal(false);
                setItemToDelete(null);
            } else {
                setError(response.error || 'Failed to delete inventory item');
            }
        } catch (err) {
            setError('An error occurred while deleting inventory item');
            console.error(err);
        }
    };


    const handleCategoryFilter = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleStockStatusFilter = (e) => {
        setStockStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const filteredItems = inventoryItems.filter(item => {
        const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
        const matchesStockStatus = stockStatusFilter ? item.stock_status === stockStatusFilter : true;
        return matchesCategory && matchesStockStatus;
    });

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading inventory items...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
            <div className="flex justify-between items-center mb-6 text-xs">
                <h2 className="font-bold">Inventory</h2>
                <div className="flex space-x-4">


                    <div>
                        <select
                            value={categoryFilter}
                            onChange={handleCategoryFilter}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={stockStatusFilter}
                            onChange={handleStockStatusFilter}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="">All Stock Status</option>
                            {stockStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleAddNew()}
                        className="inline-flex items-center rounded-md bg-amber-500 px-3 py-2  font-medium text-white shadow-sm hover:bg-amber-600"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-xs">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No inventory items found
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap  font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap  text-gray-500">{item.item_code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap  text-gray-500">
                                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap  text-gray-500">{item.quantity}</td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td> */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.stock_status === 'In Stock' ? 'bg-green-100 text-green-800' :
                                            item.stock_status === 'Low in stock' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {item.stock_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                    Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, filteredItems.length)} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="px-2 py-1 border rounded-md text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map(page => (
                            <React.Fragment key={page}>
                                {page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1 && (
                                    <span className="px-2 py-1">...</span>
                                )}
                                <button
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                itemName={itemToDelete ? itemToDelete.name : ''}
            />

<InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={currentItem}
        onSave={handleSave}
      />
        </div>
    );
};

export default InventoryTable;