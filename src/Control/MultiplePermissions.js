import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, StyleSheet, Platform, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { Image, Text, Button } from '@rneui/themed';
import { PermissionsList, PermissionResult } from '../Controller/PermissionController';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Permissions, { RESULTS, PERMISSIONS } from 'react-native-permissions';
import { ACTION } from '../Redux/types';;
import LoginWhirlPool from '../Component/WhirlPool/LoginWhirlPool';

const MultiplePermissions = ({ navigation }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [dataPermission, setDataPermission] = useState([])
    const [indexPage, setIndexPage] = useState(0)
    const [mutate, setMutate] = useState(false)
    const dispatch = useDispatch()

    const LoadData = async () => {
        await PermissionResult()
        await console.log(PermissionsList.ios, "PermissionResult");
        await setDataPermission(Platform.OS == 'ios' ? PermissionsList.ios : PermissionsList.android)
        await setMutate(e => !e)
    }
    const handlerSettingPermission = async (type) => {
        switch (type) {
            case 'Camera':
                await Permissions.request(Platform.OS == 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA, RESULTS.GRANTED)
                break
            case 'Location':
                await Permissions.request(Platform.OS == 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, RESULTS.GRANTED)
                break
            case 'Contacts':
                await Permissions.request(Platform.OS == 'ios' ? PERMISSIONS.IOS.CONTACTS : PERMISSIONS.ANDROID.READ_CONTACTS, RESULTS.GRANTED)
                break
            case 'Storage':
                await Permissions.request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, RESULTS.GRANTED)
                break
        }
        await setIndexPage(indexPage + 1)
        await dispatch({ type: ACTION.SET_PERMISSION, statusPermission: 1 })
        await setMutate(e => !e)
    }
    useEffect(() => {
        LoadData()
    }, [mutate])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemView: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { flex: 1, backgroundColor: appcolor.light, borderRadius: 16 },
        titleView: { width: '100%', textAlign: 'center', fontSize: 24, color: appcolor.dark, fontWeight: '600', paddingTop: 16 },
        contentView: { width: '100%', textAlign: 'center', fontSize: 14, color: appcolor.greydark, fontWeight: '500', padding: 16 }
    })
    const RenderItemPermission = () => {
        let uiView = []
        dataPermission.map((item, index) => {
            if (item.isResult !== RESULTS.GRANTED) {
                switch (item.name) {
                    case "Camera":
                        uiView.push(
                            <View key={index} style={styles.itemView}>
                                <View style={styles.itemContainer}>
                                    {/* <Image
                                        style={{ maxHeight: 500, minHeight: 320, marginTop: 82 }}
                                        source={require('../Themes/Images/logo_spiral.png')}
                                        resizeMode='cover' /> */}
                                    <Text style={styles.titleView}>Máy ảnh</Text>
                                    <Text style={styles.contentView}>Vui lòng cho phép quyền truy cập máy ảnh để sử dụng chức năng chấm công và chụp hình báo cáo</Text>
                                    {item.isResult !== RESULTS.GRANTED ?
                                        <Button
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            titleStyle={{ color: appcolor.light, fontSize: 14, fontWeight: '600' }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            buttonStyle={{ borderColor: appcolor.transparent }}
                                            title='Cho phép' onPress={() => handlerSettingPermission(item.name)} />
                                        :
                                        <Button
                                            disabled={true}
                                            type='outline'
                                            disabledStyle={{ borderWidth: 0 }}
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            icon={< Icon name='check-circle' solid size={20} color={appcolor.light} />}
                                            buttonStyle={{ borderColor: appcolor.transparent }} />
                                    }
                                </View>
                            </View>
                        )
                        break;
                    case "Location":
                        uiView.push(
                            <View key={index} style={styles.itemView}>
                                <View style={styles.itemContainer}>
                                    {/* <Image
                                        style={{ maxHeight: 500, minHeight: 320, marginTop: 82 }}
                                        source={require('../Themes/Images/logo_spiral.png')}
                                        resizeMode='cover' /> */}
                                    <Text style={styles.titleView}>Vị trí</Text>
                                    <Text style={styles.contentView}>Vui lòng cho phép quyền truy cập vị trí để sử dụng chức năng chấm công</Text>
                                    {item.isResult !== RESULTS.GRANTED ?
                                        <Button
                                            type='outline'
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            titleStyle={{ color: appcolor.light, fontSize: 14, fontWeight: '600' }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            buttonStyle={{ borderColor: appcolor.transparent }}
                                            title='Cho phép' onPress={() => handlerSettingPermission(item.name)} />
                                        :
                                        <Button
                                            disabled={true}
                                            type='outline'
                                            disabledStyle={{ borderWidth: 0 }}
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            icon={< Icon name='check-circle' solid size={20} color={appcolor.light} />}
                                            buttonStyle={{ borderColor: appcolor.transparent }} />}
                                </View>
                            </View>
                        )
                        break;
                    case "Storage":
                        uiView.push(
                            <View key={index} style={styles.itemView}>
                                <View style={styles.itemContainer}>
                                    {/* <Image
                                        style={{ maxHeight: 500, minHeight: 320, marginTop: 82 }}
                                        source={require('../Themes/Images/logo_spiral.png')}
                                        resizeMode='cover' /> */}
                                    <Text style={styles.titleView}>Truy cập Bộ nhớ</Text>
                                    <Text style={styles.contentView}>Vui lòng cho phép quyền truy cập bộ nhớ</Text>
                                    {item.isResult !== RESULTS.GRANTED ?
                                        <Button
                                            type='outline'
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            titleStyle={{ color: appcolor.light, fontSize: 14, fontWeight: '600' }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            buttonStyle={{ borderColor: appcolor.transparent }}
                                            title='Cho phép' onPress={() => handlerSettingPermission(item.name)} />
                                        :
                                        <Button
                                            disabled={true}
                                            type='outline'
                                            disabledStyle={{ borderWidth: 0 }}
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            icon={< Icon name='check-circle' solid size={20} color={appcolor.light} />}
                                            buttonStyle={{ borderColor: appcolor.transparent }} />}
                                </View>
                            </View>
                        )
                        break;
                    case "Contacts":
                        uiView.push(
                            <View key={index} style={styles.itemView}>
                                <View style={styles.itemContainer}>
                                    <Text style={styles.titleView}>Danh bạ</Text>
                                    <Text style={styles.contentView}>Vui lòng cho phép quyền truy cập danh bạ để sử dụng số điện thoại liên hệ</Text>
                                    {item.isResult !== RESULTS.GRANTED ?
                                        <Button
                                            type='outline'
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            titleStyle={{ color: appcolor.light, fontSize: 14, fontWeight: '600' }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            buttonStyle={{ borderColor: appcolor.transparent }}
                                            title='Cho phép' onPress={() => handlerSettingPermission(item.name)} />
                                        :
                                        <Button
                                            disabled={true}
                                            type='outline'
                                            disabledStyle={{ borderWidth: 0 }}
                                            containerStyle={{ alignSelf: 'center', width: '50%', padding: 5, position: 'absolute', bottom: 50 }}
                                            style={{ borderRadius: 20, backgroundColor: appcolor.primary }}
                                            icon={< Icon name='check-circle' solid size={20} color={appcolor.light} />}
                                            buttonStyle={{ borderColor: appcolor.transparent }} />}
                                </View>
                            </View>
                        )
                        break;
                }
            } else
                console.log(item.isResult, "RenderItemPermission")
        })
        if (uiView.length === 0)
            return <LoginWhirlPool />
        else return uiView;
    }
    return (
        <SafeAreaView style={styles.mainContainer}>
            <Swiper
                pagingEnabled={true}
                index={indexPage}
                onIndexChanged={(idx) => setIndexPage(idx)}
                loop={false}>
                {RenderItemPermission()}
            </Swiper>
        </SafeAreaView >
    )
}

export default MultiplePermissions;
