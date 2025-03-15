import { useState, useEffect } from 'react';
import { authenticatedRequest } from '@/utils/api';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  useEffect(() => {
    // Get user data from cookie
    const getUserData = () => {
      try {
        const cookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('memis-u='));
        
        if (cookie) {
          const userDataJson = decodeURIComponent(cookie.split('=')[1]);
          const parsedUserData = JSON.parse(userDataJson);
          setUserData(parsedUserData);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate passwords
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      const payload = {
        old_password: formData.old_password,
        new_password: formData.new_password
      };

      const response = await authenticatedRequest('put', 'password-change/', payload);
      
      if (response) {
        setSuccessMessage('Password changed successfully');
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to change password');
    }
  };
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'old_password':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new_password':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm_password':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-sm font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        {/* User Information Panel */}
        <div className="bg-white rounded-lg  p-6 text-xs">
          <h2 className="text-sm font-semibold mb-4">User Information</h2>
          
          {isLoading ? (
            <p className="text-gray-500">Loading user data...</p>
          ) : userData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs font-medium text-gray-600">Email</label>
                <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.email}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs font-medium text-gray-600">First Name</label>
                <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.first_name}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs font-medium text-gray-600">Last Name</label>
                <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.last_name}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs font-medium text-gray-600">Role</label>
                <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.user_role}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Unable to load user data</p>
          )}
        </div>
        
        {/* Password Change Panel */}
        <div className="bg-white rounded-lg  p-6">
          <h2 className="text-sm font-semibold mb-4">Change Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-2 text-xs">
              <label htmlFor="old_password" className="text-xs font-medium text-gray-600">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="old_password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleInputChange}
                  className="border border-gray-300 text-xs rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => togglePasswordVisibility('old_password')}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="new_password" className="text-xs font-medium text-gray-600">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="border border-gray-300 text-xs rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => togglePasswordVisibility('new_password')}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="confirm_password" className="text-xs font-medium text-gray-600">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="border border-gray-300 text-xs rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => togglePasswordVisibility('confirm_password')}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {successMessage && <p className="text-green-500 text-xs">{successMessage}</p>}
            
            <button
              type="submit"
              className="bg-brandColor text-xs hover:bg-brandColor text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}