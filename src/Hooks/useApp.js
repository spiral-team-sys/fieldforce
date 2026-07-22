import { useContext } from 'react';
import { AppContext } from '../Context/AppContext';

const useApp = () => {
    const { userinfo, isLoggedIn, toggleTheme, logout } = useContext(AppContext);
    return { userinfo, isLoggedIn, toggleTheme, logout }
};

export default useApp;
