import { DepartmentDto } from '../types/department';

export const getChildren = async (deptId: number): Promise<DepartmentDto[]> => {
  const response = await fetch(`http://localhost:8080/api/departments/children/${deptId}`);
  if (!response.ok) throw new Error('Failed to fetch children');
  return response.json();
};
