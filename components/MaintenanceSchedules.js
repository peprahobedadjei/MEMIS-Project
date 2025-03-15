import React, { useState, useEffect } from 'react';
import { authenticatedRequest } from '@/utils/api';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

// Main component
const MaintenanceSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('Monthly');
    const [formData, setFormData] = useState({
        id: null,
        equipment: null,
        for_all_equipment: false,
        technician: null,
        title: '',
        description: '',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        frequency: 'once',
        interval: 1,
        recurring_end: null
    });
    const [equipmentList, setEquipmentList] = useState([]);
    const [technicianList, setTechnicianList] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch all schedules
    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const response = await authenticatedRequest('get', '/maintenance-schedules/');
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch equipment and technicians
    const fetchEquipmentAndTechnicians = async () => {
        try {
            const equipmentResponse = await authenticatedRequest('get', '/equipment/');
            setEquipmentList(equipmentResponse.data);

            const techniciansResponse = await authenticatedRequest('get', '/users/');
            setTechnicianList(techniciansResponse.data);
        } catch (error) {
            console.error('Error fetching equipment or technicians:', error);
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchEquipmentAndTechnicians();
    }, []);

    // Handle month navigation
    const handlePrevMonth = () => {
        setCurrentMonth(prevMonth => {
            const newMonth = new Date(prevMonth);
            newMonth.setMonth(newMonth.getMonth() - 1);
            return newMonth;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prevMonth => {
            const newMonth = new Date(prevMonth);
            newMonth.setMonth(newMonth.getMonth() + 1);
            return newMonth;
        });
    };

    // Modal handlers
    const handleOpenModal = (schedule = null) => {
        if (schedule) {
            // Edit mode
            setFormData({
                ...schedule,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
                recurring_end: schedule.recurring_end
            });
            setIsEditMode(true);
        } else {
            // Create mode
            setFormData({
                id: null,
                equipment: null,
                for_all_equipment: false,
                technician: null,
                title: '',
                description: '',
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString(),
                frequency: 'once',
                interval: 1,
                recurring_end: null
            });
            setIsEditMode(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            let response;
            const payload = { ...formData };
            
            // Remove equipment field when for_all_equipment is true
            if (payload.for_all_equipment) {
                delete payload.equipment;
            }
    
            if (isEditMode) {
                response = await authenticatedRequest('put', `/maintenance-schedules/${formData.id}/`, payload);
            } else {
                response = await authenticatedRequest('post', '/maintenance-schedules/', payload);
            }
    
            fetchSchedules();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    };

    const handleDelete = async () => {
        if (!formData.id) return;

        try {
            await authenticatedRequest('delete', `/maintenance-schedules/${formData.id}/`);
            fetchSchedules();
            handleCloseModal();
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    // Calendar rendering
    const renderCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Render the days of week headers
        const weekdayHeaders = (
            <div className="grid grid-cols-7">
                {daysOfWeek.map(day => (
                    <div key={day} className="p-2 text-center font-medium border-b">
                        {day}
                    </div>
                ))}
            </div>
        );

        // Group days into weeks
        const weeks = [];
        let week = [];

        days.forEach(day => {
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }

            // Format the day for display
            const dayNum = format(day, 'dd');
            const formattedDay = format(day, 'yyyy-MM-dd');

            // Find schedules for this day
            const daySchedules = schedules.filter(schedule => {
                const scheduleStart = new Date(schedule.start_date);
                return isSameDay(scheduleStart, day);
            });

            week.push(
                <div key={formattedDay} className="p-2 border min-h-24 relative">
                    <div className="text-sm">{dayNum}</div>
                    {daySchedules.map(schedule => (
                        <div
                            key={schedule.id}
                            className={`text-xs p-1 my-1 rounded cursor-pointer ${schedule.for_all_equipment ? 'bg-orange-200' : 'bg-green-200'}`}
                            onClick={() => handleOpenModal(schedule)}
                        >
                            <div className="truncate">{schedule.title}</div>
                            <div className="truncate text-xs text-gray-600">
                                {schedule.equipment_name || 'All Equipment'}
                            </div>
                        </div>
                    ))}
                </div>
            );
        });

        // Add the last week
        if (week.length > 0) {
            // Fill in empty cells at the end of the last week
            while (week.length < 7) {
                week.push(<div key={`empty-${week.length}`} className="p-2 border bg-gray-100"></div>);
            }
            weeks.push(week);
        }

        // Render all weeks
        return (
            <div>
                {weekdayHeaders}
                <div className="grid grid-cols-7">
                    {weeks.flat()}
                </div>
            </div>
        );
    };
    return (
        <div className="bg-gray-100 min-h-screen p-4 text-xs">
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-sm font-bold">Schedules</h1>
                    <button
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md flex items-center"
                        onClick={() => handleOpenModal()}
                    >
                        <span className="mr-1">+</span> Add New
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <button
                            className="p-2 border rounded-l hover:bg-gray-100"
                            onClick={handlePrevMonth}
                        >
                            &lt;
                        </button>
                        <div className="px-4 py-2 font-medium">
                            {format(currentMonth, 'MMMM, yyyy')}
                        </div>
                        <button
                            className="p-2 border rounded-r hover:bg-gray-100"
                            onClick={handleNextMonth}
                        >
                            &gt;
                        </button>
                    </div>

                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    renderCalendarDays()
                )}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-xs">
                    <div className="bg-white p-6 w-full max-w-md h-[97%] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold">
                                {isEditMode ? 'Edit Schedule' : 'Schedule Form'}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                            Enter the accurate details to {isEditMode ? 'update' : 'create'} a maintenance schedule.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1">
                                    Frequency <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="once">Once</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1">
                                    Is it for all Equipment? <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="for_all_equipment"
                                            className="mr-2"
                                            checked={formData.for_all_equipment}
                                            onChange={handleInputChange}
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="for_all_equipment"
                                            className="mr-2"
                                            checked={!formData.for_all_equipment}
                                            onChange={(e) => setFormData(prev => ({ ...prev, for_all_equipment: !e.target.checked }))}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            {!formData.for_all_equipment && (
                                <div className="mb-4">
                                    <label className="block text-xs font-medium mb-1">
                                        Equipment Name <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="equipment"
                                        value={formData.equipment || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required={!formData.for_all_equipment}
                                    >
                                        <option value="">Select Equipment</option>
                                        {equipmentList.map(equipment => (
                                            <option key={equipment.id} value={equipment.id}>
                                                {equipment.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1">
                                    Technician
                                </label>
                                <select
                                    name="technician"
                                    value={formData.technician || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Select Technician</option>
                                    {technicianList.map(technician => (
                                        <option key={technician.id} value={technician.id}>
                                            {technician.first_name} {technician.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="start_date"
                                        value={formData.start_date ? formData.start_date.slice(0, 16) : ''}
                                        onChange={(e) => handleDateChange('start_date', e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="end_date"
                                        value={formData.end_date ? formData.end_date.slice(0, 16) : ''}
                                        onChange={(e) => handleDateChange('end_date', e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>

                            {formData.frequency !== 'once' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">
                                        Recurring End <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="recurring_end"
                                        value={formData.recurring_end ? formData.recurring_end.slice(0, 10) : ''}
                                        onChange={(e) => handleDateChange('recurring_end', e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required={formData.frequency !== 'once'}
                                    />
                                </div>
                            )}

                            {formData.frequency !== 'once' && (
                                <div className="mb-4">
                                    <label className="block text-xs font-medium mb-1">
                                        Interval
                                    </label>
                                    <input
                                        type="number"
                                        name="interval"
                                        value={formData.interval}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full p-2 border rounded"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Number of {formData.frequency} intervals between occurrences
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="flex justify-between">
                                {isEditMode ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                        >
                                            Update
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="submit"
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded ml-auto"
                                    >
                                        Save
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>


    );
}
export default MaintenanceSchedules;