"use client";
import { useState, useRef, useEffect } from 'react';
import { faBars, faSearch, faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import axios from 'axios';

interface User {
  name: string;
  email: string;
  myUsername: string;
  role: string;
  avatar: string;
}

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    myUsername: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          return {
            name: parsedUser.name || "Guest",
            email: parsedUser.email || "guest@example.com",
            myUsername: parsedUser.myUsername || "guest",
            role: parsedUser.role || "Unknown",
            avatar: parsedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name || parsedUser.email.split('@')[0])}&background=3c8dbc&color=fff`
          };
        } catch (err) {
          console.error('Failed to parse user data', err);
          return {
            name: "Guest",
            email: "guest@example.com",
            myUsername: "guest",
            role: "Unknown",
            avatar: "https://ui-avatars.com/api/?name=Guest&background=3c8dbc&color=fff"
          };
        }
      }
    }
    return {
      name: "Guest",
      email: "guest@example.com",
      myUsername: "guest",
      role: "Unknown",
      avatar: "https://ui-avatars.com/api/?name=Guest&background=3c8dbc&color=fff"
    };
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      await Swal.fire({
        title: 'Error',
        text: 'New passwords do not match',
        icon: 'error',
        confirmButtonColor: '#3c8dbc'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/adminuser/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 200) {
        await Swal.fire({
          title: 'Success!',
          text: 'Password changed successfully',
          icon: 'success',
          confirmButtonColor: '#3c8dbc'
        });
        setIsChangePasswordModalOpen(false);
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (error: any) {
      await Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to change password',
        icon: 'error',
        confirmButtonColor: '#3c8dbc'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshedToken');
    window.location.href = '/hr-module';
  };

  // Animation Variants
  const modalVariants: Variants = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5
      } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.98,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      } 
    }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 0.5,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <div className="text-xl font-bold mr-8">INSA ERP</div>
        <button 
          className="mr-4 p-2 rounded-lg hover:bg-gray-700"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-gray-800"
          />
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User menu"
          >
            <div className="w-10 h-10 rounded-full bg-[#3c8dbc] flex items-center justify-center text-white text-xl font-medium">
              <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-3 text-[#3c8dbc]" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsSettingsModalOpen(true);
                    setFormData({
                      myUsername: currentUser.myUsername,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="w-full text-left flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faCog} className="mr-3 text-[#3c8dbc]" />
                  <span>Settings</span>
                </button>
                <button 
                  className="w-full text-left flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 text-[#3c8dbc]" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="fixed inset-0 bg-black" 
              variants={backdropVariants}
              onClick={() => setIsProfileModalOpen(false)}
            />
            
            <motion.div 
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#3c8dbc] mx-auto mb-4 flex items-center justify-center text-white text-4xl">
                    <FontAwesomeIcon icon={faUser} className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                  <p className="text-gray-500">{currentUser.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">User Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="text-gray-800">{currentUser.myUsername}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{currentUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="text-gray-800 capitalize">{currentUser.role.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="fixed inset-0 bg-black" 
              variants={backdropVariants}
              onClick={() => setIsSettingsModalOpen(false)}
            />
            
            <motion.div 
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Settings</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Update Username</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          name="myUsername"
                          value={formData.myUsername}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const token = localStorage.getItem('token');
                            if (!token) throw new Error('No authentication token found');
                            
                            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/adminuser/update-profile`, {
                              myUsername: formData.myUsername
                            }, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });

                            if (response.data.status === 200) {
                              const updatedUser = {
                                ...currentUser,
                                myUsername: formData.myUsername
                              };
                              localStorage.setItem('user', JSON.stringify(updatedUser));
                              setCurrentUser(updatedUser);
                              
                              await Swal.fire({
                                title: 'Success!',
                                text: 'Username updated successfully',
                                icon: 'success',
                                confirmButtonColor: '#3c8dbc'
                              });
                            }
                          } catch (error: any) {
                            await Swal.fire({
                              title: 'Error',
                              text: error.response?.data?.message || 'Failed to update username',
                              icon: 'error',
                              confirmButtonColor: '#3c8dbc'
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="w-full py-2 px-4 bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium rounded-lg shadow-md transition duration-300"
                      >
                        {loading ? 'Updating...' : 'Update Username'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(false);
                        setIsChangePasswordModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-[#3c8dbc] text-white mr-3">
                          <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-gray-800">Change Password</h3>
                          <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangePasswordModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="fixed inset-0 bg-black" 
              variants={backdropVariants}
              onClick={() => setIsChangePasswordModalOpen(false)}
            />
            
            <motion.div 
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Change Password</h2>
                
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium rounded-lg shadow-md transition duration-300 flex justify-center items-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}