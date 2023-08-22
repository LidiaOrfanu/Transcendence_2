// UserContext.tsx
import { createContext, useContext, useState } from 'react';
import { User } from '../../interfaces/user.interface';
import React from 'react';

interface UserContextValue {
	user: User;
	setUser: (user: User) => void;
  }

const emptyUserObject: User = {
	username: '',
	intraUsername: '',
	userID: 0,
	socketId: '',
	avatarPath: '',
	wins: 0,
	losses: 0,
	points: 0,
	status: '',
	achievementsCSV: '',
	passwordHash: '',
	friends: [],
	befriendedBy: [],
	blocked: [],
	blockedBy: [],
	adminChannels: [],
	blockedChannels: [],
	channels: [],
  };

const UserContext = createContext<UserContextValue>({
	user: emptyUserObject,
	setUser: () => {},
  });
  
  export function useUserContext() {
	return useContext(UserContext);
  }

  interface UserContextProviderProps {
	children: React.ReactNode;
  }
  
  export const UserContextProvider: React.FC<UserContextProviderProps> = ({children}) => {
	const storedUser = localStorage.getItem('user');
	const initialUser: User = storedUser ? JSON.parse(storedUser) : emptyUserObject;

	const [user, setUser] = useState<User>(initialUser);
  
	return (
	  <UserContext.Provider value={{ user, setUser }}>
		{children}
	  </UserContext.Provider>
	);
  };
