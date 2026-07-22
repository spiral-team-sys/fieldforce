import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import useNotificationModal from '../../../Hooks/useNotificationModal';
import { fontWeightBold } from '../../../Themes/AppsStyle';
import { useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from '@rneui/themed';
import { getNotificationKey } from '../../../Utils/notificationStorage';
import LinkView from './Page/LinkView';
import DefaultView from './Page/DefaultView';
import InAppView from './Page/InAppView';

const NotificationModal = () => {
    const { appcolor } = useSelector(state => state.GAppState)
    const { visible, notifyData, hideNotificationModal } = useNotificationModal();

    if (!visible || !notifyData) {
        return null;
    }

    const title = notifyData?.notification?.title || 'Thông báo';
    const body = notifyData?.notification?.body || '';
    const type = notifyData?.data?.messageType || notifyData?.data?.type;
    const link = notifyData?.data?.link;
    const inAppId = notifyData?.data?.newsId || notifyData?.data?.messengerId || null;
    const modalKey = getNotificationKey(notifyData);

    const styles = StyleSheet.create({
        tilteName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 12, fontWeight: '500', color: appcolor.placeholderText },
        viewContent: { flex: 1, marginVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: appcolor.surface, overflow: 'hidden' },
        buttonContainer: { width: 120, alignSelf: 'center', borderRadius: 8, overflow: 'hidden', marginVertical: 8 },
        buttonClose: { width: 120, alignSelf: 'center', borderRadius: 8, borderWidth: 1, borderColor: appcolor.red, padding: 6, paddingHorizontal: 24 },
        titleButtonClose: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.red },
    })

    let InfoComponent = null;
    switch (type) {
        case 'InApp':
            InfoComponent = InAppView;
            break;
        case 'LINK':
            InfoComponent = LinkView;
            break;
        default:
            InfoComponent = DefaultView;
            break;
    }

    return (
        <Modal
            key={modalKey}
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent>
            <SafeAreaProvider>
                <InfoComponent
                    title={title}
                    body={body}
                    link={link}
                    modalKey={modalKey}
                    inAppId={inAppId}
                    onClose={hideNotificationModal}
                />
                {type !== 'InApp' &&
                    <Button
                        type='outline'
                        title='Đóng'
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.buttonClose}
                        titleStyle={styles.titleButtonClose}
                        onPress={hideNotificationModal}
                    />
                }
            </SafeAreaProvider>
        </Modal>
    );
};

export default React.memo(NotificationModal);
