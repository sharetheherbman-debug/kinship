import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kinship_token'));
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/me`);
        setUser(response.data);
        
        // Fetch family if user has one
        if (response.data.family_id) {
          const familyRes = await axios.get(`${API_URL}/api/families/my`);
          setFamily(familyRes.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('kinship_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('kinship_token', newToken);
    setToken(newToken);
    setUser(userData);
    
    // Fetch family if user has one
    if (userData.family_id) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      const familyRes = await axios.get(`${API_URL}/api/families/my`);
      setFamily(familyRes.data);
    }
    
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('kinship_token', newToken);
    setToken(newToken);
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('kinship_token');
    setToken(null);
    setUser(null);
    setFamily(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const createFamily = async (name, description) => {
    const response = await axios.post(`${API_URL}/api/families`, { name, description });
    setFamily(response.data);
    setUser(prev => ({ ...prev, family_id: response.data.id, role: 'admin' }));
    return response.data;
  };

  const joinFamily = async (inviteCode) => {
    const response = await axios.post(`${API_URL}/api/families/join`, { invite_code: inviteCode });
    
    // Refresh family data
    const familyRes = await axios.get(`${API_URL}/api/families/my`);
    setFamily(familyRes.data);
    setUser(prev => ({ ...prev, family_id: response.data.family_id }));
    
    return response.data;
  };

  const refreshFamily = async () => {
    if (user?.family_id) {
      const familyRes = await axios.get(`${API_URL}/api/families/my`);
      setFamily(familyRes.data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      family,
      loading,
      login,
      register,
      logout,
      createFamily,
      joinFamily,
      refreshFamily,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
