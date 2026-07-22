import React, { useEffect } from 'react';
import { Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AdhocNow } from './AdhocNow';
import { SetFormNow } from '../../Redux/action';
import { GetDataFormNow } from '../../Controller/AdhocController';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AdhocModal = () => {
    const dispatch = useDispatch();
    const { formstatus, formdata } = useSelector(state => state.GAppState);

    const LoadData = async () => {
        const result = await GetDataFormNow();
        if (result.length > 0)
            await dispatch(SetFormNow(result[0]));
    }

    useEffect(() => {
        LoadData()
    }, []);

    if (!formstatus || !formdata?.publicUrl) return null;

    return (
        <Modal
            visible={formstatus}
            animationType="fade"
            statusBarTranslucent>
            <SafeAreaProvider>
                <AdhocNow data={formdata} />
            </SafeAreaProvider>
        </Modal>
    );
};

export default AdhocModal;
