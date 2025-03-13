import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  checkUserSession,
  fetchDashboardData,
  filterMaintenanceActivity,
  formatDateForDisplay,
  logoutUser,
} from '../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 3 months');

  // Dashboard data states
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [equipmentStatus, setEquipmentStatus] = useState({
    functional: 0,
    under_maintenance: 0,
    non_functional: 0
  });
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [maintenanceActivity, setMaintenanceActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [totalInventory, setTotalInventory] = useState(0);

  // Function to get the appropriate badge color based on activity type
  const getBadgeColor = (activityType) => {
    switch (activityType.toLowerCase()) {
      case 'repair':
        return 'bg-blue-100 text-blue-800';
      case 'calibration':
        return 'bg-yellow-100 text-yellow-800';
      case 'preventive maintenance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Authentication check and data fetching
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if user is authenticated
        const sessionStatus = await checkUserSession();
        if (!sessionStatus.success) {
          router.push('/login');
          return;
        }

        // Fetch dashboard data
        const result = await fetchDashboardData();
        if (result.success) {
          // Update state with fetched data
          setTotalEquipment(result.data.totalEquipment);
          setEquipmentStatus(result.data.equipmentStatus);
          setEquipmentTypes(result.data.formattedEquipmentTypes);
          setTotalInventory(result.data.totalInventory);

          // Store raw maintenance activity data
          setMaintenanceActivity(result.data.maintenanceActivity);

          // Filter and format activity data based on selected time range
          const filtered = filterMaintenanceActivity(
            result.data.maintenanceActivity,
            timeRange
          );

          // Format the filtered data for the chart
          const formattedData = filtered.map(item => ({
            date: formatDateForDisplay(item.date),
            preventive: item.preventive_maintenance,
            repair: item.repair,
            calibration: item.calibration
          }));

          setFilteredActivity(formattedData);

          // Store and log upcoming maintenance schedules
          setUpcomingSchedules(result.data.formattedUpcomingSchedules);
          console.log('Upcoming Maintenance Schedules:', result.data.formattedUpcomingSchedules);

          setIsLoading(false);
        } else {
          setError(result.error);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError('Failed to load dashboard data. Please try again.');
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  // Handle time range change
  useEffect(() => {
    if (maintenanceActivity && maintenanceActivity.length > 0) {
      // Re-filter activity data when time range changes
      const filtered = filterMaintenanceActivity(
        maintenanceActivity,
        timeRange
      );

      // Format the filtered data for the chart
      const formattedData = filtered.map(item => ({
        date: formatDateForDisplay(item.date),
        preventive: item.preventive_maintenance,
        repair: item.repair,
        calibration: item.calibration
      }));

      setFilteredActivity(formattedData);
    }
  }, [timeRange, maintenanceActivity]);

  // Handle logout
  const handleLogout = () => {
    logoutUser();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brandColor border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brandColor">Loading Dashboard data...</p>
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
              onClick={handleLogout}
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

      {/* Header with logout */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="text-blue-900 font-medium">Total Equipment</h2>
              <p className="text-2xl font-bold">{totalEquipment}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-purple-100 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="text-purple-900 font-medium">Total Inventory Items</h2>
              <p className="text-2xl font-bold">{totalInventory}</p>
            </div>
            <div className="bg-purple-900 p-3 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <div className="bg-amber-100 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="text-amber-900 font-medium">Total Under Maintenance</h2>
              <p className="text-2xl font-bold">{equipmentStatus.under_maintenance}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-green-100 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="text-green-900 font-medium">Total Functional Equipment</h2>
              <p className="text-2xl font-bold">{equipmentStatus.functional}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        {/* Main Content Area - 2 rows */}
        <div className="flex flex-col gap-6">
          {/* First row - 2 columns with 2/3 and 1/3 proportions */}
  
            {/* Maintenance Activity Chart - 2/3 width */}
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Maintenance Report Overview</h2>
                <select
                  className="border rounded p-1 text-sm"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option>Last 3 months</option>
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                </select>
              </div>

              <div className="h-64">
                {filteredActivity && filteredActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filteredActivity}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border rounded shadow">
                                <p className="font-bold">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }}>
                                    {`${entry.name}: ${entry.value}`}
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="preventive"
                        stroke="#10b981"
                        name="Preventive Maintenance"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="repair"
                        stroke="#3b82f6"
                        name="Repair"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="calibration"
                        stroke="#f97316"
                        name="Calibration"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No maintenance activity data available for the selected time range</p>
                  </div>
                )}
              </div>
            </div>

          

          {/* Second row - 2 equal columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Types */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Equipment Types Overview</h2>

              <div className="space-y-4">
                {equipmentTypes.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{item.type}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{ width: `${(item.count / totalEquipment) * 100}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Maintenance Schedule</h2>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm font-semibold">
                      <th className="border border-gray-200 px-4 py-2 text-left">Title</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Activity Type</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {upcomingSchedules.length > 0 ? (
                      upcomingSchedules.map((item, index) => (
                        <tr key={index} className="border-t text-sm text-gray-700 hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            <div className="text-gray-500">{item.title}</div>
                            <div className="font-medium">{item.equipment
                            }</div>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 ">
                            <span className={`p-1 text-xs ${getBadgeColor(item.activityType)}`}>
                              {item.activityType}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">{item.formattedDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-gray-500 py-4">
                          No upcoming schedules
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}