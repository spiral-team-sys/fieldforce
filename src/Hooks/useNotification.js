import { useContext } from 'react';
import { NotificationContext } from '../Context/NotificationContext';

const useNotification = () => {
    const { countNotification, handlerCountNotification } = useContext(NotificationContext);
    return { countNotification, handlerCountNotification }
};

export default useNotification;
