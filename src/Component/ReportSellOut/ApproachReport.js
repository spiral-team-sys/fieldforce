import React from "react"
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import NumberFormat from "react-number-format"
import { useSelector } from "react-redux"
import { GetByListCode } from "../../Controller/MasterController"
import { NumPad } from '../../Control/NumPad'
import { useEffect, useState } from "react"
import { HeaderCustom } from "../../Content/HeaderCustom"
import AsyncStorage from "@react-native-async-storage/async-storage"
import UploadController from "../../Controller/UploadController"
import { NumPad_V2 } from "../../Control/NumPad_V2"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import { Icon } from '@rneui/themed'
import { deviceHeight } from "../Home"
import _ from 'lodash';
import { Message, ToastError, ToastSuccess } from "../../Core/Helper"
import { checkNetwork } from "../../Core/Utility"
import { fontWeightBold } from "../../Themes/AppsStyle"

export const ApproachReport = ({ navigation }) => {
    const [data, setData] = useState([])
    const [lock, setLock] = useState(false);
    const [loading, setLoading] = useState(false)
    const [menu, _setMenu] = useState({ isOpenCamera: false, isOpen: false, type: null, title: null })

    const { appcolor, shopinfo, kpiinfo, workinfo } = useSelector(state => state.GAppState)
    const KeyStore = `${shopinfo.shopId || 0}APPROACH${shopinfo.auditDate}`
    const onLoad = async () => {
        !loading && await setLoading(true)
        const localStore = await AsyncStorage.getItem(KeyStore)
        if (localStore === null) {
            const result = await GetByListCode(`"APPROACH"`)
            await setData(result)
            await AsyncStorage.setItem(KeyStore, JSON.stringify(result))
        } else {//local store
            var local = await JSON.parse(localStore)
            await setLock(local[0]?.isLock === true ? true : false)
            await setData(local)
        }
        await setLoading(true)
    }
    const onSummit = () => {
        const checkData = checkValidate()
        if (checkData) {
            Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData());
        }
    }
    const UploadData = async () => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        UploadController.uploadServer({ ...work }, data, async (result) => {
            if (result.statusId === 200) {
                setLock(true);
                data.map(a => a.isLock = true)
                await AsyncStorage.setItem(KeyStore, JSON.stringify(data))
                await ToastSuccess("Đã gửi", result.messager, "top")
            } else {
                ToastError("Lỗi gửi", result.messager, "top")
            }
        }, (error) => {
            ToastError("Lỗi kết nối", error.messager, "top")
        })
    }
    const checkValidate = () => {
        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            if (item.isRequired == 1) {

                if (item.numberValue === null || item.numberValue === '' || item.numberValue === undefined) {
                    ToastError(`Ban phải nhập đầy đủ thông tin bắt buộc: ${item.name}`, 'Thông báo', 'top')
                    return false
                }
                if (item.ref_Id > 0 && item.numberValue == 0) {
                    ToastError(`Ban phải nhập thông tin : ${item.name} lớn hơn 0`, 'Thông báo', 'top')
                    return false
                }
            }
        }
        return true
    }
    const handerNumberChange = async (item, e) => {
        const _temp = await [...data]
        const index = await _temp.findIndex(a => a.id === item.id)
        const _row = await { ...item }
        _row.numberValue = e
        _temp[index] = await _row;
        await setData(_temp)
        await AsyncStorage.setItem(KeyStore, JSON.stringify(_temp))
    }
    const handlerChangeFAB = async (type, titleAction) => {
        // let optionReset = [{ text: 'Hủy' }, { text: 'Xác nhận', onPress: onResetData }]
        switch (type) {
            case "DELETE":
                ClearDataAll()
                break
            case "RESET_DATA":
                // setClearAll()
                ResetDataAll()
                break
        }
    }
    const ClearDataAll = async () => {
        Message('Chú ý', 'Bạn có chắc chắn muốn xóa hết dữ liệu đã nhập ?',
            async () => {
                let result = [...data]
                result.map(it => {
                    it.numberValue = 0
                })
                await setData(result)
                await AsyncStorage.setItem(KeyStore, JSON.stringify(result))
            })
    }
    const ResetDataAll = async () => {
        let result = await GetByListCode(`"APPROACH"`)
        result.map(it => {
            const itemFilter = _.filter(data, (e) => { return (e.id == it.id) })
            it.numberValue = itemFilter.length > 0 ? itemFilter[0].numberValue : null
        })
        await setData(result)
        await AsyncStorage.setItem(KeyStore, JSON.stringify(result))
    }
    const rowItem = ({ item, index }) => {
        return (<View key={`${index}`} style={{ padding: 8, backgroundColor: appcolor.surface, borderRadius: 8, marginBottom: 4 }}>
            <View style={{ marginBottom: 7 }}>
                <Text style={{ padding: 7, color: appcolor.dark }}>{item.name}
                    {item?.isRequired == 1 && <Text style={{ color: appcolor.danger }}>(*)</Text>}
                </Text>
                <UIControl key={item.id} value={item.numberValue} placeholderText="SL" editable={!lock}
                    handerNumberChange={handerNumberChange} item={item} index={index} showIcon={!lock}
                    containerStyle={{ width: '40%' }} TypeControl={item.ref_Code} />
            </View>
        </View>)
    }
    useEffect(() => {
        onLoad()
        return () => loading
    }, [])
    return (<View style={{ backgroundColor: appcolor.light, flex: 1 }}>
        <HeaderCustom leftFunc={() => navigation.goBack()}
            iconRight="cloud-upload-alt"
            rightFunc={lock ? null : () => onSummit()}
            title={kpiinfo.menuNameVN} />
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
                style={{ padding: 8 }}
                keyExtractor={(_, index) => `${index}dak9`}
                renderItem={rowItem}
            />
            <MenuButton
                info={menu}
                visible={!lock}
                handlerChange={handlerChangeFAB}
            />
        </View>
    </View>)
}
const UIControl = ({ TypeControl, handerNumberChange, containerStyle, item, index, value, placeholderText, editable, showIcon }) => {
    const { appcolor } = useSelector(state => state.GAppState);

    const props = { containerStyle, handerNumberChange, item, index, value, placeholderText, editable, showIcon }
    switch (TypeControl) {
        case "NUMBER":
            return (
                <View style={{ alignItems: 'flex-end', width: '100%' }}>
                    <NumPad_V2 {...props} />
                </View>
            )
        case "DECIMAIL":
            return (
                <View>
                    <NumberFormat
                        renderText={(value) => {
                            <TextInput />
                        }}
                    />
                </View>
            )
        default:
            return (
                <View>
                    <TextInput />
                </View>
            )
    }
}
const MenuButton = ({ visible = true, info, Status, handlerChange }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const _fadeInDown = FadeInDown.duration(500).withInitialValues({ transform: [{ translateY: 420 }] })
    const _fadeOutDown = FadeOutDown.duration(100).withInitialValues({ transform: [{ translateY: 420 }] })
    const [_mutate, setMutate] = useState(false)
    const handleSelectMenu = () => {
        info.isOpen = (info.isOpen ? false : true)
        setMutate(e => !e)
        // showMenu()
    }
    const handlerSelectAction = (typeAction, title) => {
        handlerChange(typeAction, title)
        info.isOpen = (info.isOpen ? false : true)
        setMutate(e => !e)
    }
    // 
    useEffect(() => {
        return () => false
    }, [info])
    // View
    const styles = StyleSheet.create({
        mainContainer: { alignItems: 'flex-end', position: 'absolute', bottom: deviceHeight / 8, end: 8, zIndex: 1000 },
        viewActionMain: { width: 50, height: 50, justifyContent: 'center', margin: 8, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, shadowColor: appcolor.dark, elevation: 3, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, borderRadius: 50 },
        titleName: { width: '100%', fontSize: 13, color: appcolor.light, fontWeight: fontWeightBold, textAlign: 'center' },
        contentAction: {},
        contentMenu: { alignItems: 'flex-end' }
    })
    const renderItemMenu = () => {
        return (
            <Animated.View entering={_fadeInDown} exiting={_fadeOutDown} style={styles.contentMenu}>
                {
                    Status !== 1 &&
                    <ActionItem
                        typeAction='DELETE'
                        title='Xóa tất cả dữ liệu'
                        iconName='trash-outline'
                        onPress={handlerSelectAction} />
                }
                <ActionItem
                    typeAction='RESET_DATA'
                    title='Cập nhật dữ liệu'
                    iconName='sync-outline'
                    onPress={handlerSelectAction} />
            </Animated.View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            {visible && info.isOpen && renderItemMenu()}
            <View style={styles.contentAction}>
                {visible &&
                    <ActionItem
                        isMain
                        typeAction='MAIN'
                        title={info.title}
                        iconName={info.isOpen ? 'chevron-down-outline' : info.type !== null && info.type.length > 0 ? 'close' : 'settings'}
                        onPress={() => handleSelectMenu()} />
                }
            </View>
        </View>
    )
}
const ActionItem = ({ isMain = false, type, typeAction, title, iconName, onPress }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    //
    const onPressMenu = () => {
        onPress(typeAction, title)
    }
    useEffect(() => {
        return () => false
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        viewActionMain: { width: 50, height: 50, justifyContent: 'center', margin: 5, padding: 8, borderWidth: 0.5, borderColor: appcolor.surface, backgroundColor: appcolor.light, shadowColor: appcolor.dark, elevation: 3, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, borderRadius: 50 },
        viewTitleName: { backgroundColor: appcolor.light, padding: 8, paddingHorizontal: 16, borderRadius: 50, shadowColor: appcolor.dark, elevation: 3, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2 },
        titleName: { fontSize: 13, color: isMain ? appcolor.red : appcolor.dark, fontWeight: fontWeightBold }
    })
    return (
        <View style={styles.mainContainer}>
            {title &&
                <View style={styles.viewTitleName}>
                    <Text style={styles.titleName}>{title || ''}</Text>
                </View>
            }
            <TouchableOpacity style={styles.viewActionMain} onPress={onPressMenu}>
                <Icon type={type || 'ionicon'} name={iconName || ''} size={24} color={isMain && title ? appcolor.red : appcolor.primary} />
            </TouchableOpacity>
        </View>
    )
}