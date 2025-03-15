import { useEffect, useState } from 'react';
import { authenticatedRequest } from '@/utils/api';
import React from 'react'
import Image from 'next/image';
import { PencilIcon, Trash2 } from 'lucide-react';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    user_role: 'User'
  });

  const itemsPerPage = 10;

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedRequest('get', '/users/');
      if (response && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone_number.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open modal for adding new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      user_role: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      user_role: user.user_role
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  // Submit form for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedUser) {
        // Update existing user
        await authenticatedRequest('put', `/users/${selectedUser.id}/`, formData);
      } else {
        // Create new user
        await authenticatedRequest('post', '/register/', formData);
      }

      // Refresh users list
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      setError(selectedUser ? 'Failed to update user' : 'Failed to create user');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await authenticatedRequest('delete', `/users/${selectedUser.id}/`);
      await fetchUsers();
      setIsDeleteConfirmOpen(false);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && users.length === 0) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  if (error && users.length === 0) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-sm font-bold">Users Management</h1>
        <button
          onClick={handleAddUser}
          className="bg-brandActive hover:bg-brandActive text-brandColor px-4 py-2 rounded text-xs"
        >
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 text-xs">
        <input
          type="text"
          placeholder="Search users by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full bg-white ">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Phone Number</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border px-4 py-2 text-left">Date Joined</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className=" px-4 py-2">{`${user.first_name} ${user.last_name}`}</td>
                  <td className=" px-4 py-2">{user.email}</td>
                  <td className=" px-4 py-2">{user.phone_number}</td>
                  <td className=" px-4 py-2">{user.user_role}</td>
                  <td className=" px-4 py-2">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </td>
                  
                  <td className=" px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400  p-1 rounded"
                      >
                        <PencilIcon
                          size={20}
                          className="cursor-pointer" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-500  p-1 rounded"
                      >
                        <Trash2 size={18}
                          className="cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border px-4 py-2 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            Previous
          </button>

          <span className="mx-4 py-1">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            Next
          </button>
        </div>
      )}

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-xs">
            <h2 className="text-sm font-bold mb-4 text-center items center justify-center ">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </h2>
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/logo.svg"
                alt="MEMIS Logo"
                width={150}
                height={40}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Role</label>
                <select
                  name="user_role"
                  value={formData.user_role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-xs">
            <h2 className="text-sm font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete user {selectedUser?.first_name} {selectedUser?.last_name}?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default Users