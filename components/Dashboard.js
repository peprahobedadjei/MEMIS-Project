// Dashboard.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // Sample data for the line chart
  const maintenanceData = [
    { month: 'Jan', preventive: 3, repair: 4, calibration: 9 },
    { month: 'Feb', preventive: 7, repair: 8, calibration: 15 },
    { month: 'Mar', preventive: 12, repair: 10, calibration: 7 },
    { month: 'Apr', preventive: 5, repair: 14, calibration: 13 },
    { month: 'May', preventive: 8, repair: 7, calibration: 16 },
    { month: 'Jun', preventive: 11, repair: 8, calibration: 8 },
    { month: 'Jul', preventive: 6, repair: 11, calibration: 15 },
    { month: 'Aug', preventive: 9, repair: 14, calibration: 12 },
    { month: 'Sep', preventive: 4, repair: 12, calibration: 8 },
    { month: 'Oct', preventive: 8, repair: 15, calibration: 10 },
    { month: 'Nov', preventive: 10, repair: 11, calibration: 13 },
    { month: 'Dec', preventive: 12, repair: 9, calibration: 11 },
  ];

  const equipment = [
    { id: 1, name: 'Tonometer', icon: '🔬' },
    { id: 2, name: 'Pulse Oximeter', icon: '📱' },
    { id: 3, name: 'Heart Rate Monitor', icon: '📟' },
    { id: 4, name: 'Glucometer', icon: '💉' },
    { id: 5, name: 'Thermometer', icon: '🌡️' },
    { id: 6, name: 'Endoscope', icon: '⚕️' },
  ];

  const departments = [
    'Out Patient Department (OPD)',
    'Accident & Emergency Department',
    'Maternity Department',
    'Female Ward',
    'Male Ward',
  ];

  const recentActivities = [
    {
      id: 1,
      time: 'Yesterday',
      description: '10 boxes of Surgicare Nitrile Exam Gloves (size Medium) received from MediPlus at 10:30 AM. Order #12345. Received at Main Ward.',
    },
    {
      id: 2,
      time: '5 Days Ago',
      description: '10 boxes of Surgicare Nitrile Exam Gloves (size Medium) received from MediPlus at 10:30 AM. Order #12345. Received at Main Ward.',
    },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Equipments</span>
            <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white">🔬</div>
          </div>
          <span className="text-2xl font-bold mt-2">20</span>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg shadow flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Departments</span>
            <div className="bg-purple-800 rounded-full w-8 h-8 flex items-center justify-center text-white">🏥</div>
          </div>
          <span className="text-2xl font-bold mt-2">15</span>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg shadow flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Under Maintenance</span>
            <div className="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-white">🔧</div>
          </div>
          <span className="text-2xl font-bold mt-2">10</span>
        </div>

        <div className="bg-green-100 p-4 rounded-lg shadow flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Active Equipments</span>
            <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white">✅</div>
          </div>
          <span className="text-2xl font-bold mt-2">20</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Activity Overview */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Maintenance Activity Overview</h2>
            <div className="relative">
              <select 
                className="appearance-none bg-gray-50 border border-gray-300 rounded px-3 py-1 pr-8 text-sm"
                defaultValue="2024"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative h-64">

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="preventive" stroke="#2DD4BF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Preventive Maintenance" />
                <Line type="monotone" dataKey="repair" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Repair" />
                <Line type="monotone" dataKey="calibration" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Calibration" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center mt-2 space-x-6">
            <div className="flex items-center">
              <span className="h-3 w-3 bg-teal-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-600">Preventive Maintenance</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 bg-blue-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-600">Repair</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 bg-yellow-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-600">Calibration</span>
            </div>
          </div>
        </div>

        {/* Equipments Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Equipments</h2>
            <button className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-sm">
              <span className="mr-1">+</span> Add Equipment
            </button>
          </div>
          
          <div className="space-y-3">
            {equipment.map((item) => (
              <div key={item.id} className="flex items-center">
                <div className="mr-3 text-xl">{item.icon}</div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-right mt-4">
            <a href="#" className="text-blue-600 text-sm">See all...</a>
          </div>
        </div>
      </div>

      {/* Recent Activities & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          
          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="relative pl-6">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-0 w-4 h-4 rounded-full ${index === 0 ? 'bg-indigo-900' : 'bg-orange-500'}`}></div>
                
                {/* Timeline line */}
                {index < recentActivities.length - 1 && (
                  <div className="absolute left-2 top-4 w-0.5 h-24 bg-gray-200"></div>
                )}
                
                <div className="font-medium">{activity.time}</div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <a href="#" className="block text-sm text-blue-600 mt-1">Read more...</a>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Departments</h2>
            <button className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-sm">
              <span className="mr-1">+</span> Add Department
            </button>
          </div>
          
          <div className="space-y-3">
            {departments.map((department, index) => (
              <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                <span>{department}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;