"use client";
import EmployeeProfile from "../Employee-Profile/components/profile";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LanguageSkillsTable from "../Employee-Profile/components/LanguageSkillsTable";
import EmployeeForm from "../Employee-Profile/components/EmployeeForm";
import FamilyTable from "./components/FamilyMembers";
import AddressTab from "../Employee-Profile/components/Address";
import TrainingTab from "../Employee-Profile/components/Training";
import CostSharingTab from "../Employee-Profile/components/CostSharing";
import EditExperienceTab from "../Employee-Profile/components/EditExperience";
import Education from '../Employee-Profile/components/Education';
import Experience from '../Employee-Profile/components/Experience';
import Promotion from '../Employee-Profile/components/Promotion';
import Upload from '../Employee-Profile/components/Upload';

import {
  FiUserPlus,
  FiRefreshCw,
  FiPrinter,
  FiEdit,
  FiMapPin,
  FiBook,
  FiUsers,
  FiActivity,
  FiGlobe,
  FiTrendingUp,
  FiUpload,
  FiDollarSign,
  FiUser,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";

type PositionDetail = {
  id: number;
  name: string;
  salary?: string | number;
};

type Department = {
  deptId: number;
  depName: string;
  parentDeptId?: number;
};

type NationalityDetail = {
  nationalityId: number;
  nationalityDescription?: string;
  nationalityName: string;
};

type Employee = {
  id: number;
  empId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  efirstName?: string;
  emiddleName?: string;
  elastName?: string;
  gender: string;
  dateOfBirth: string;
  nationality?: string | NationalityDetail | null;
  position: string | PositionDetail;
  department: string | Department;
  status: string | number | null;
  photo?: string;
  [key: string]: any;
};

// Maps backend HrEmployee to frontend Employee
const mapHrEmployeeToEmployee = (hrEmployee: any): Employee => ({
  id: hrEmployee.id || parseInt(hrEmployee.empId, 10),
  empId: hrEmployee.empId,
  firstName: hrEmployee.firstName || '',
  middleName: hrEmployee.middleName,
  lastName: hrEmployee.lastName || '',
  efirstName: hrEmployee.efirstName,
  emiddleName: hrEmployee.emiddleName,
  elastName: hrEmployee.elastName,
  gender: hrEmployee.sex || 'Unknown',
  dateOfBirth: hrEmployee.dateOfBirth || hrEmployee.birthDate || '',
  nationality: hrEmployee.nationality
    ? {
        nationalityId: hrEmployee.nationality.nationalityId,
        nationalityName: hrEmployee.nationality.nationalityName,
        nationalityDescription: hrEmployee.nationality.nationalityDescription,
      }
    : null,
  position: hrEmployee.position
    ? {
        id: hrEmployee.position.id,
        name: hrEmployee.position.positionName || hrEmployee.position.name,
        salary: hrEmployee.salary,
      }
    : hrEmployee.payGrade
    ? {
        id: hrEmployee.payGrade.payGradeId,
        name: hrEmployee.payGrade.payGradeName || 'Unknown',
        salary: hrEmployee.salary,
      }
    : hrEmployee.position || 'Unknown',
  department: hrEmployee.department
    ? {
        deptId: hrEmployee.department.deptId,
        depName: hrEmployee.department.depName || 'Unknown',
        parentDeptId: hrEmployee.department.parentDeptId,
      }
    : hrEmployee.department || 'Unknown',
  status: hrEmployee.empStatus != null ? hrEmployee.empStatus : hrEmployee.positionStatus || null,
  photo: hrEmployee.photo ? `data:image/jpeg;base64,${hrEmployee.photo}` : undefined,
});

const mockEmployees: Employee[] = [
  {
    id: 20005835,
    empId: '20005835',
    firstName: 'John',
    lastName: 'Doe',
    position: 'Senior Developer',
    department: 'Engineering',
    status: 'Active',
    photo: '/profile1.jpg',
    gender: 'Male',
    dateOfBirth: '1985-05-15',
    nationality: 'American',
  },
];

export default function EmployeeProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const tabs = [
    { id: "profile", name: "Profile", icon: <FiUser /> },
    { id: "new", name: "New", icon: <FiUserPlus /> },
    { id: "address", name: "Address", icon: <FiMapPin /> },
    { id: "education", name: "Education", icon: <FiBook /> },
    { id: "family", name: "Family", icon: <FiUsers /> },
    { id: "training", name: "Training", icon: <FiActivity /> },
    { id: "experience", name: "Ext Experience", icon: <FiGlobe /> },
    { id: "language", name: "Language", icon: <FiGlobe /> },
    { id: "cost-sharing", name: "Cost Sharing", icon: <FiDollarSign /> },
    { id: "promotion", name: "Promotion History", icon: <FiTrendingUp /> },
    { id: "edit", name: "Edit Experience", icon: <FiEdit /> },
    { id: "print", name: "Print Experience", icon: <FiPrinter /> },
    { id: "upload", name: "Upload", icon: <FiUpload /> },
    { id: "job-description", name: "Job Description", icon: <FiFileText /> },
    { id: "position-description", name: "Position Description", icon: <FiBriefcase /> },
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/employees');
        if (!response.ok) throw new Error(`Failed to fetch employees: ${response.statusText}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const mappedEmployees = data.map(mapHrEmployeeToEmployee);
          setEmployees(mappedEmployees);
          setCurrentEmployee(mappedEmployees[0]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees(mockEmployees);
        if (mockEmployees.length > 0) {
          setCurrentEmployee(mockEmployees[0]);
        }
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0 && !currentEmployee) {
      setCurrentEmployee(employees[0]);
    }
  }, [employees, currentEmployee]);

  const handleNewEmployee = () => {
    setIsEditMode(false);
    setCurrentEmployee(null);
    setActiveTab("new");
  };

  const handleEditEmployee = () => {
    setIsEditMode(true);
    setActiveTab("new");
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/employees');
      if (!response.ok) throw new Error(`Failed to fetch employees: ${response.statusText}`);
      const data = await response.json();
      const mappedEmployees = data.map(mapHrEmployeeToEmployee);
      setEmployees(mappedEmployees);
      setLastRefresh(new Date());
      alert("Employee data refreshed successfully!");
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert("Failed to refresh employee data");
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (isEditMode && currentEmployee) {
        const response = await fetch(`http://localhost:8080/api/employees/${formData.empId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update employee: ${response.statusText}`);
        }

        const updatedEmployee = mapHrEmployeeToEmployee(await response.json());
        const updatedEmployees = employees.map(emp =>
          emp.empId === updatedEmployee.empId ? updatedEmployee : emp
        );
        setEmployees(updatedEmployees);
        setCurrentEmployee(updatedEmployee);
        alert("Employee updated successfully!");
      } else {
        const response = await fetch('http://localhost:8080/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Failed to create employee. Server response:", response.status, errorBody);
          throw new Error(`Failed to create employee. Status: ${response.status}, Message: ${errorBody}`);
        }

        const newEmployee = mapHrEmployeeToEmployee(await response.json());
        setEmployees(prev => [...prev, newEmployee]);
        setCurrentEmployee(newEmployee);
        alert("Employee created successfully!");
      }
      setActiveTab("profile");
    } catch (error) {
      console.error('Error handling form submission:', error);
      alert('Error processing employee. Please try again.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          <div className="flex justify-end items-center mb-2">
            {lastRefresh && (
              <div className="text-xs text-gray-500 mr-2">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 bg-gray-500 text-white rounded-lg flex items-center gap-1 text-sm hover:bg-gray-600 transition-all shadow hover:shadow-md"
            >
              <FiRefreshCw size={14} />
              Refresh
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex overflow-x-auto border-b border-gray-200 pb-1 scrollbar-hide"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.id === "new" ? handleNewEmployee() : setActiveTab(tab.id)}
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {activeTab === "profile" && currentEmployee && (
          <EmployeeProfile
            employee={currentEmployee}
            onEdit={handleEditEmployee}
            allEmployees={employees}
            onEmployeeSelect={(employee) => setCurrentEmployee(employee)}
          />
        )}

        {activeTab === "language" && currentEmployee && (
          <div className="mt-4">
            <LanguageSkillsTable empId={currentEmployee.empId} />
          </div>
        )}

        {activeTab === "family" && currentEmployee && (
          <div className="mt-4">
            <FamilyTable empId={currentEmployee.empId} />
          </div>
        )}
          {activeTab === "address" && currentEmployee && (
          <div className="mt-10">
            <AddressTab empId={currentEmployee.empId} />
          </div>
        )}
        
        {activeTab === "training" && currentEmployee && (
          <div className="mt-10">
            <TrainingTab empId={currentEmployee.empId}/>
          </div>
        )}
           {activeTab === "cost-sharing" && currentEmployee && (
          <div className="mt-10">
            <CostSharingTab empId={currentEmployee.empId}/>
          </div>
        )}
           {activeTab === "edit" && currentEmployee && (
          <div className="mt-10">
            <EditExperienceTab empId={currentEmployee.empId}/>
          </div>
        )}
          {activeTab === "education" && currentEmployee &&( <div className="mt-10"> <Education empId={currentEmployee.empId}/></div>)}
        {activeTab === "experience" && currentEmployee && (<div className="mt-10"> <Experience empId={currentEmployee.empId}/></div>)}
        {activeTab === "promotion" && currentEmployee && (<div className="mt-10"> <Promotion empId={currentEmployee.empId}/></div>)}
        {activeTab === "upload" && currentEmployee && (<div className="mt-10"> <Upload empId={currentEmployee.empId}/></div>)}

        {activeTab === "new" && (
          <div className="bg-white rounded-lg shadow-md p-4 mt-3">
            <EmployeeForm
              employeeData={currentEmployee}
              isEditMode={isEditMode}
              onSubmit={handleFormSubmit}
              onCancel={() => setActiveTab("profile")}
            />
          </div>
        )}

        {activeTab !== "profile" &&
         activeTab !== "language" &&
         activeTab !== "family" &&
         activeTab !== "new" &&
         activeTab !== "address" &&
         activeTab !== "training" &&
         activeTab !== "cost-sharing" &&
         activeTab !== "edit" &&
         activeTab !== "print" &&
         activeTab !== "education" &&
         activeTab !=="experience" &&
         activeTab !== "promotion" &&
         activeTab !== "upload" && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>{tabs.find(t => t.id === activeTab)?.name} content will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}