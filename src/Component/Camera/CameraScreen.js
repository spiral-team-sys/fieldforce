import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Icon } from "@rneui/base";
import { CAMERA_PERMISSION, checkMultiplePermission, LOCATION_PERMISSION, STORAGE_PERMISSION } from "../../Utils/permissions";
import CameraPage from "../../Control/Camera/default";
import { SheetManager } from "react-native-actions-sheet";
import { isNumber } from "lodash";

const CameraScreen = ({ navigation }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const LoadData = async () => {
        await checkMultiplePermission([CAMERA_PERMISSION, LOCATION_PERMISSION, STORAGE_PERMISSION])
    }

    const onBack = (typeAction = null) => {
        if (typeAction !== null && isNumber(typeAction) && typeAction % 2 == 0) {
            SheetManager.show('kpi-sheet')
        }
        navigation.goBack()
    }

    useEffect(() => {
        LoadData()
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.black },
        buttonBack: { position: 'absolute', top: 48, left: 8, zIndex: 20 }
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
            <CameraPage callBackData={onBack} />
        </View>
    )
}

export default CameraScreen;