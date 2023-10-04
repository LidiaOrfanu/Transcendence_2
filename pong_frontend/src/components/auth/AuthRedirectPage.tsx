import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserByToken } from '../../api/userApi';
import { useUserContext } from '../context/UserContext';
import { postUserStatus } from '../../api/statusUpdateAPI.api';

const AuthRedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { setUser } = useUserContext();

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        console.error('No token provided.');
        return;
      }

      try {
        // Fetch the user with the token.
        const newUser = await getUserByToken(token);

		if (!newUser) {
			console.error('Error fetching user with token');
			return;
		}

		// Store the user and update userContext
		localStorage.setItem('user', JSON.stringify(newUser));
		setUser(newUser);


        // Check user fields and redirect accordingly.
		if (newUser.is2FAEnabled) {
			navigate('/verify-2fa', { replace: true });
		} else {
			if (await postUserStatus("Online", newUser) === true) {
				newUser.status = "Online";
				localStorage.setItem('user', JSON.stringify(newUser));
				setUser(newUser);
			}
			navigate('/', { replace: true });
		}

      } catch (error) {
        console.error('Error fetching user: ', error);
      }
    };

    fetchUserAndRedirect();
  }, [navigate, location.search]);

  return null; // This component does not render anything.
};

export default AuthRedirectPage;