import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    country: '',
    shippingAddress: {
      street: '',
      postalCode: ''
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('https://www.w3schools.com/howto/img_avatar.png');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Profile data received:', response.data);
        
        if (response.data) {
          // Format the data to match our state structure
          const user = response.data;
          setUserData({
            name: user.name || '',
            email: user.email || '',
            age: user.age || '',
            gender: user.gender || '',
            country: user.country || '',
            shippingAddress: {
              street: user.shippingAddress?.street || '',
              postalCode: user.shippingAddress?.postalCode || ''
            },
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          // Set profile image if available
          if (user.profileImage) {
            setImagePreview(user.profileImage);
          }
        } else {
          setError('No user data returned from server');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        if (error.response) {
          if (error.response.status === 404) {
            setError('API endpoint not found. Please check server configuration.');
          } else if (error.response.status === 401) {
            setError('Your session has expired. Please login again.');
            setTimeout(() => navigate('/login'), 2000);
          } else {
            setError(`Server error: ${error.response.data.message || 'Unknown error'}`);
          }
        } else if (error.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError('Error setting up request: ' + error.message);
        }
        
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested shippingAddress object
    if (name.startsWith('shipping')) {
      const addressField = name.split('.')[1];
      setUserData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password if user is trying to change it
    if (userData.newPassword) {
      if (!userData.currentPassword) {
        setError('Current password is required to set a new password');
        return;
      }
      if (userData.newPassword !== userData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      // Create FormData if there's a profile image to upload
      let formData = null;
      let response = null;

      if (profileImage) {
        formData = new FormData();
        formData.append('profileImage', profileImage);
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('age', userData.age);
        formData.append('gender', userData.gender);
        formData.append('country', userData.country);
        formData.append('shippingAddress.street', userData.shippingAddress.street);
        formData.append('shippingAddress.postalCode', userData.shippingAddress.postalCode);
        
        if (userData.currentPassword) {
          formData.append('currentPassword', userData.currentPassword);
          formData.append('newPassword', userData.newPassword);
        }
        
        response = await axios.put('/api/users/profile', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // If no image to upload, send regular JSON
        response = await axios.put('/api/users/profile', {
          name: userData.name,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          country: userData.country,
          shippingAddress: userData.shippingAddress,
          currentPassword: userData.currentPassword || undefined,
          newPassword: userData.newPassword || undefined
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      console.log('Update response:', response.data);
      
      // Reset password fields
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile data:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Your session has expired. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.status === 400) {
          setError(error.response.data.message || 'Invalid information provided');
        } else {
          setError(error.response.data.message || 'Failed to update profile');
        }
      } else {
        setError('Failed to connect to server. Please try again.');
      }
      
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-white shadow-md p-6 rounded-lg mb-4 md:mb-0">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            <img 
              src={imagePreview} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover"
            />
            {isEditing && (
              <button 
                type="button" 
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                📷
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h2 className="text-xl font-bold">{userData.name || 'User'}</h2>
          <p className="text-gray-500">{userData.email || 'No email'}</p>
        </div>
        <div className="mt-8">
          <ul>
            <li className="mb-2">
              <a href="#personal" className="flex items-center text-red-500 font-medium">
                <span className="mr-2">👤</span> Personal Information
              </a>
            </li>
            <li className="mb-2">
              <a href="#address" className="flex items-center text-gray-600 hover:text-red-500">
                <span className="mr-2">📍</span> Address
              </a>
            </li>
            <li className="mb-2">
              <a href="#password" className="flex items-center text-gray-600 hover:text-red-500">
                <span className="mr-2">🔒</span> Security
              </a>
            </li>
            <li className="mb-2">
              <a href="#orders" className="flex items-center text-gray-600 hover:text-red-500">
                <span className="mr-2">📦</span> My Orders
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Profile Content */}
      <div className="w-full md:w-3/4 p-4 md:p-8 bg-white shadow-md rounded-lg md:ml-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <h1 className="text-xl text-red-500 font-bold mb-6" id="personal">Edit Your Profile</h1>

        <form onSubmit={handleSaveChanges}>
          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  type="text"
                  name="name"
                  value={userData.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  type="email"
                  name="email"
                  value={userData.email || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Age</label>
                <input
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  type="number"
                  name="age"
                  value={userData.age || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your age"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Gender</label>
                <select
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  name="gender"
                  value={userData.gender || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Country</label>
                <input
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  type="text"
                  name="country"
                  value={userData.country || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your country"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-8" id="address">
            <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">Street Address</label>
                <input
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  type="text"
                  name="shipping.street"
                  value={userData.shippingAddress.street || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your street address"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Postal Code</label>
                <input
                  className={`w-full border border-gray-300 h-10 rounded-lg px-4 ${
                    !isEditing ? 'bg-gray-100' : 'bg-white'
                  } focus:ring-2 focus:ring-red-300 outline-none`}
                  type="text"
                  name="shipping.postalCode"
                  value={userData.shippingAddress.postalCode || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your postal code"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          {isEditing && (
            <div className="mb-8" id="password">
              <h2 className="text-lg font-medium mb-4">Change Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Current Password</label>
                  <input
                    className="w-full border border-gray-300 h-10 rounded-lg px-4 bg-white focus:ring-2 focus:ring-red-300 outline-none"
                    type="password"
                    name="currentPassword"
                    value={userData.currentPassword || ''}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">New Password</label>
                      <input
                        className="w-full border border-gray-300 h-10 rounded-lg px-4 bg-white focus:ring-2 focus:ring-red-300 outline-none"
                        type="password"
                        name="newPassword"
                        value={userData.newPassword || ''}
                        onChange={handleChange}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
                      <input
                        className="w-full border border-gray-300 h-10 rounded-lg px-4 bg-white focus:ring-2 focus:ring-red-300 outline-none"
                        type="password"
                        name="confirmPassword"
                        value={userData.confirmPassword || ''}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Edit Profile
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form values to original
                    setImagePreview(userData.profileImage || 'https://www.w3schools.com/howto/img_avatar.png');
                    setProfileImage(null);
                    setUserData(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 shadow-md ml-4"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;