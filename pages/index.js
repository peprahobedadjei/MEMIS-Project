import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { checkUserSession, logoutUser, authenticatedRequest } from '@/utils/api';
import {
  ChevronDown,
  Bell,
  Search,
  LogOutIcon,
  LayoutDashboard,
  Briefcase,
  Archive,
  ChartNoAxesColumnIncreasing,
  CalendarCheck,
  Users2Icon,
  BellIcon,
  GitGraph,
  File
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import EquipmentAndSuppliers from '@/components/Equipment';
import Inventory from '@/components/Inventory';
import Reports from '@/components/Reports';
import Users from '@/components/Users';
import Notifications from '@/components/Notifications';
import MaintenanceSchedules from '@/components/MaintenanceSchedules';
import Settings from '@/components/Settings';



function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);


  // Determine active page based on URL pathname
  const getActivePage = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/equipments') return 'Equipments';
    if (pathname === '/inventory') return 'Inventory';
    if (pathname === '/reports') return 'Reports';
    if (pathname === '/schedules') return 'Schedules';
    if (pathname === '/users') return 'Users';
    if (pathname === '/notifications') return 'Notifications';
    if (pathname === '/settings') return 'Settings';
    return 'Dashboard'; // Default
  };

  const activePage = getActivePage();

  // Check session on component mount
  useEffect(() => {
    const verifySession = async () => {
      setLoading(true);
      const sessionStatus = await checkUserSession();

      if (sessionStatus.success) {
        const userData = Cookies.get('memis-u');
        if (userData) {
          setUser(JSON.parse(decodeURIComponent(userData)));
        }

        // Redirect to dashboard if on the root path
        if (pathname === '/') {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  // Define the function outside useEffect so it can be used elsewhere
  const fetchAndUpdateNotifications = async () => {
    try {
      const response = await authenticatedRequest('get', '/notifications/');
      const allNotifications = response.data;
      setNotifications(allNotifications);
      const unreadCount = allNotifications.filter(notif => !notif.is_read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // useEffect now just handles the initial fetch and interval
  useEffect(() => {
    if (user) {
      fetchAndUpdateNotifications(); // Initial fetch
      const interval = setInterval(fetchAndUpdateNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle navigation
  const handleNavigation = (page) => {
    const route = `/${page.toLowerCase()}`;
    router.push(route);
  };

  // Handle logout
  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-brandColor border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-border-brandColor font-semibold text-lg">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>MEMIS | {activePage}</title>
      </Head>

      {/* Main Container */}
      <div className="flex h-screen">
        {/* Sidebar - Fixed 20% */}
        <div className="w-1/5 bg-white flex flex-col justify-between fixed h-full">
          {/* Logo */}
          <div className="p-4">
            <Link className="block text-teal-600 text-center mb-4" href="/dashboard">
              <Image src="/assets/logo.svg" alt="logo" width={100} height={100} className="w-32 mx-auto" />
            </Link>

            {/* Menu */}
            <nav className="mt-4 flex flex-col gap-2 text-xs">
              <button
                onClick={() => handleNavigation("Dashboard")}
                className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Dashboard" ? "bg-brandActive text-brandColor font-semibold" : "bg-white text-brandColor"
                  }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>

              <button
                onClick={() => handleNavigation("Equipments")}
                className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Equipments" ? "bg-brandActive text-brandColor font-semibold" : "bg-white text-brandColor"
                  }`}
              >
                <Briefcase className="w-5 h-5" />
                Equipments
              </button>

              <button
                onClick={() => handleNavigation("Inventory")}
                className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Inventory" ? "bg-brandActive text-brandColor font-semibold" : "bg-white text-brandColor"
                  }`}
              >
                <Archive className="w-5 h-5" />
                Inventory
              </button>

              <button
                onClick={() => handleNavigation("Reports")}
                className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Reports" ? "bg-brandActive text-brandColor font-semibold" : "bg-white text-brandColor"
                  }`}
              >
                <File className="w-5 h-5" />
                Report
              </button>

              <button
                onClick={() => handleNavigation("Schedules")}
                className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Schedules" ? "bg-brandActive text-brandColor font-semibold" : "bg-white text-brandColor"
                  }`}
              >
                <CalendarCheck className="w-5 h-5" />
                Schedules
              </button>
              {user?.user_role === "Admin" && (

                <button
                  onClick={() => handleNavigation("Users")}
                  className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Users" ? "bg-brandActive tex-brandColor font-semibold" : "bg-white text-brandColor"
                    }`}
                >
                  <Users2Icon className="w-5 h-5" />
                  Users
                </button>
              )}
              <button
                onClick={() => handleNavigation("Notifications")}
                className={`flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium ${activePage === "Notifications" ? "bg-brandActive text-brandColor font-semibold" : "bg-white text-brandColor"
                  }`}
              >
                <BellIcon className="w-5 h-5" />
                Notifications
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-3 rounded-lg text-left w-full text-xs font-medium bg-white text-brandColor"
              >
                <LogOutIcon className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content - 80% */}
        <div className="w-4/5 ml-auto flex flex-col bg-gray-50">
          {/* Top Header with Search and User Info */}
          <div className="bg-white p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center w-1/3">
              <div className="relative w-full">
                {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div> */}
                {/* <input
                  type="text"
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                /> */}
              </div>
            </div>

            {/* User profile and notifications */}
            <div className="flex items-center space-x-4">
              {/* Notification bell */}
              <div className="relative">
                <Bell
                  className="w-6 h-6 text-gray-600 cursor-pointer"
                  onClick={() => router.push('/notifications')}
                />
                {notificationCount > 0 && (
                  <span className=" cursor-pointer absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>

              {/* User profile */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
                  <Image
                    src={user?.avatar || "/assets/avatar.png"}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div  onClick={() => router.push('/settings')} className="flex flex-col cursor-pointer ">
                  <span className=" text-xs text-gray-700">{user?.first_name} {user?.last_name}</span>
                  <span className=" text-xs text-gray-500">{user?.email}</span>
                  <span className="text-xs text-gray-500">{user?.user_role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6 flex-1 overflow-auto">
            {activePage === "Dashboard" && <Dashboard />}
            {activePage === "Equipments" && <EquipmentAndSuppliers />}
            {activePage === "Inventory" && <Inventory />}
            {activePage === "Reports" && (
              <Reports />
            )}
            {activePage === "Schedules" && (
              <MaintenanceSchedules />
            )}
            {activePage === "Users" && (
              <Users />

            )}
            {activePage === "Notifications" && (
              <Notifications
                notifications={notifications}
                refreshNotifications={fetchAndUpdateNotifications}
              />
            )}
            {activePage === "Settings" && (
              <Settings/>

            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;