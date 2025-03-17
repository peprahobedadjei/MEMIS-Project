import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getEquipmentDetails, getEquipmentReport, authenticatedRequest } from '@/utils/api';
import Details from '@/components/Details';

function EquipmentReport() {
  const router = useRouter();
  const { id } = router.query;
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [equipmentReports, setEquipmentReports] = useState(null);
  const [users, setUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id) {
      fetchEquipmentDetails(id);
      fetchEquipmentReports(id);
      fetchUsers();
    }
  }, [id]);
  
  const fetchEquipmentDetails = async (equipmentId) => {
    try {
      const response = await getEquipmentDetails(equipmentId);
      setEquipmentDetails(response.data);
      console.log("Equipment details:", response);
    } catch (err) {
      setError('An error occurred while fetching equipment details');
      console.error(err);
    }
  };
  
  const fetchEquipmentReports = async (equipmentId) => {
    try {
      const response = await getEquipmentReport(equipmentId);
      setEquipmentReports(response.data);
      console.log("Equipment reports:", response);
    } catch (err) {
      setError('An error occurred while fetching equipment reports');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
    
  const fetchUsers = async () => {
    try {
      const response = await authenticatedRequest('get', '/users/');
      if (response && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    }
  };
  
  return (
    <Details 
      equipmentDetails={equipmentDetails} 
      equipmentReports={equipmentReports} 
      users={users}
      isLoading={isLoading} 
      error={error} 
    />
  );
}

export default EquipmentReport;