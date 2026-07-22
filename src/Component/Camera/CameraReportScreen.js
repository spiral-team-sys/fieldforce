import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/base';
import { useSelector } from 'react-redux';
import { CAMERA_PERMISSION, checkAndRequestPermission } from '../../Utils/permissions';
import CameraReportPage from '../../Control/Camera/report';
import { insets } from '../../Core/Utility';

const CameraReportScreen = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const LoadData = async () => {
        await checkAndRequestPermission(CAMERA_PERMISSION)
    }

    const onBack = () => {
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.dark },
        buttonBack: { position: 'absolute', top: insets().top, left: 8, zIndex: 20 }
    })

    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity onPress={onBack} style={styles.buttonBack}>
                <Icon
                    raised
                    type='ionicon'
                    name='arrow-back'
                    size={21}
                    containerStyle={{ elevation: 0 }}
                    color={appcolor.blacklight} />
            </TouchableOpacity>
            <CameraReportPage
                callBackData={onBack}
                templateInfo={JSON.stringify(route?.params?.templateInfo || {})}
            />
        </View>
    );
};
export default CameraReportScreen;
