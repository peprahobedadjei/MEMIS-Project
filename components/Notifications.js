import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Eye, Bell, CheckSquare, X, Calendar, Clock, User, Monitor } from 'lucide-react';
import { authenticatedRequest } from '@/utils/api';

// Modal component to display schedule details
const ScheduleModal = ({ isOpen, onClose, scheduleData }) => {
  if (!isOpen) return null;
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-xs">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-brandColor text-white px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-sm">{scheduleData.title}</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 text-xs">{scheduleData.description}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Monitor className="text-brandColor mr-3 mt-1" size={18} />
              <div>
                <p className="font-medium text-xs text-gray-800">Equipment</p>
                <p className="text-gray-600">{scheduleData.equipment_name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <User className="text-brandColor mr-3 mt-1" size={18} />
              <div>
                <p className="font-medium text-gray-800">Technician</p>
                <p className="text-gray-600">{scheduleData.technician_name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="text-brandColor mr-3 mt-1" size={18} />
              <div>
                <p className="font-medium text-gray-800">Schedule</p>
                <p className="text-gray-600">
                  {formatDateTime(scheduleData.start_date)} - {formatDateTime(scheduleData.end_date)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="text-brandColor mr-3 mt-1" size={18} />
              <div>
                <p className="font-medium text-gray-800">Frequency</p>
                <p className="text-gray-600 capitalize">
                  {scheduleData.frequency} 
                  {scheduleData.frequency !== "once" && ` (every ${scheduleData.interval} ${scheduleData.frequency === "daily" ? "day(s)" : 
                    scheduleData.frequency === "weekly" ? "week(s)" : 
                    scheduleData.frequency === "monthly" ? "month(s)" : "year(s)"})`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-right">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Notification = ({ 
  notification, 
  refreshNotifications, 
  isOpen, 
  onToggle 
}) => {
  const [isRead, setIsRead] = useState(notification.is_read);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingSchedule, setFetchingSchedule] = useState(false);
  const wasOpenRef = useRef(false);
  
  // Track when notification changes from open to closed
  useEffect(() => {
    if (wasOpenRef.current && !isOpen && !isRead) {
      markAsRead();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, isRead]);

  const markAsRead = async () => {
    try {
      setLoading(true);
      await authenticatedRequest('put', `/notifications/${notification.id}/`, {
        is_read: true
      });
      setIsRead(true);
      refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchScheduleDetails = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fetchingSchedule) return;
    
    try {
      setFetchingSchedule(true);
      // Extract the relative path from the link
      const relativePath = notification.link.replace('/api', '');
      // Construct the full URL
      const url = `http://memis-90605b282646.herokuapp.com${relativePath}`;
      
      const response = await authenticatedRequest('get', relativePath);
      console.log(response.data);
      setScheduleData(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    } finally {
      setFetchingSchedule(false);
    }
  };

  const messageParts = notification.message.split(': ');
  const title = messageParts[0];
  const description = messageParts.length > 1 ? messageParts[1] : '';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden mb-4 text-xs">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => onToggle(notification.id)}
        >
          <div className="flex items-center space-x-3">
            {!isRead && <div className="w-2 h-2 bg-brandActive rounded-full"></div>}
            <h3 className="font-medium text-gray-800">{title}</h3>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-4">{formatDate(notification.created)}</span>
            {isOpen ? 
              <ChevronUp className="text-gray-400" size={20} /> : 
              <ChevronDown className="text-gray-400" size={20} />
            }
          </div>
        </div>
        
        {isOpen && (
          <div className="p-4 pt-0 bg-gray-50">
            <p className="mb-3 text-gray-700">{description}</p>
            <div className="flex justify-between items-center">
              <button 
                onClick={fetchScheduleDetails}
                disabled={fetchingSchedule}
                className="inline-flex items-center text-brandActive"
              >
                {fetchingSchedule ? 'Loading...' : 'View Schedule'}
              </button>
              {!isRead && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    markAsRead();
                  }} 
                  disabled={loading}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <Eye size={16} className="mr-1" />
                  {loading ? 'Marking...' : 'Mark as read'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {scheduleData && (
        <ScheduleModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          scheduleData={scheduleData}
        />
      )}
    </>
  );
};

const Notifications = ({ notifications, refreshNotifications }) => {
  const [categorizedNotifications, setCategorizedNotifications] = useState({
    unread: [],
    read: []
  });
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [openNotificationId, setOpenNotificationId] = useState(null);
  const [activeTab, setActiveTab] = useState('unread');

  // Categorize notifications whenever they change
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unread = notifications.filter(notif => !notif.is_read);
      const read = notifications.filter(notif => notif.is_read);
      
      setCategorizedNotifications({
        unread,
        read
      });
    }
  }, [notifications]);

  const handleToggleNotification = (notificationId) => {
    setOpenNotificationId(prevId => prevId === notificationId ? null : notificationId);
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      
      // Process all unread notifications sequentially
      for (const notification of categorizedNotifications.unread) {
        await authenticatedRequest('put', `/notifications/${notification.id}/`, {
          is_read: true
        });
      }
      
      // Refresh notifications list after all are marked as read
      refreshNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  return (
    <div className="h-full flex flex-col text-xs">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`flex items-center px-4 py-3 font-medium ${
            activeTab === 'unread'
              ? 'border-b-2 border-brandActive text-brandActive'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('unread')}
        >
          <Bell className="mr-2" size={16} />
          Unread Notifications
          {categorizedNotifications.unread.length > 0 && (
            <span className="ml-2 bg-brandActive text-white text-xs px-2 py-0.5 rounded-full">
              {categorizedNotifications.unread.length}
            </span>
          )}
        </button>
        
        <button
          className={`flex items-center px-4 py-3 font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-brandActive text-brandActive'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Notifications
          {categorizedNotifications.read.length > 0 && (
            <span className="ml-2 bg-gray-300 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {categorizedNotifications.read.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-grow overflow-hidden">
        {activeTab === 'unread' && (
          <div className="h-full flex flex-col">
            {/* Action Bar */}
            {categorizedNotifications.unread.length > 0 && (
              <div className="py-3 px-4 flex justify-end">
                <button
                  onClick={markAllAsRead}
                  disabled={markingAllAsRead}
                  className="flex items-center text-sm px-3 py-1 bg-blue-50 text-brandColor rounded-md hover:bg-blue-100"
                >
                  <CheckSquare size={16} className="mr-1" />
                  {markingAllAsRead ? 'Marking...' : 'Mark All as Read'}
                </button>
              </div>
            )}
            
            {/* Notification List */}
            <div className="flex-grow overflow-y-auto px-4">
              {categorizedNotifications.unread.length > 0 ? (
                categorizedNotifications.unread.map((notification) => (
                  <Notification 
                    key={notification.id} 
                    notification={notification} 
                    refreshNotifications={refreshNotifications}
                    isOpen={openNotificationId === notification.id}
                    onToggle={handleToggleNotification}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg mt-4">No unread notifications</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'all' && (
          <div className="h-full overflow-y-auto px-4 py-4">
            {categorizedNotifications.read.length > 0 ? (
              categorizedNotifications.read.map((notification) => (
                <Notification 
                  key={notification.id} 
                  notification={notification} 
                  refreshNotifications={refreshNotifications}
                  isOpen={openNotificationId === notification.id}
                  onToggle={handleToggleNotification}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">No read notifications</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;