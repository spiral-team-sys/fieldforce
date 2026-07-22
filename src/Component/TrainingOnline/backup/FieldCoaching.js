import React, { useState, useEffect } from 'react'
import { FlatList, View, StyleSheet, Text, Modal, TextInput, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5';
import FormGroup from '../../Content/FormGroup'
import { getListImageAudit, getPhotoAudit, updateFSMValue, UploadPhotoTraining, UploadDataTraining } from '../../Controller/TrainingController'
import { Image } from '@rneui/themed';
// import NumberFormat from "react-number-format";
import Geolocation from '@react-native-community/geolocation';
import { alertNotify, checkNetwork } from '../../Core/Utility';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { Message, ToastError, ToastSuccess } from '../../Core/Helper';

const FieldCoaching = ({ navigation, route }) => {
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [itemFilter, setItemFiler] = useState('Tất cả')
    const [dataList, setDataList] = useState([])
    const [dataMain, setDataMain] = useState([])
    const [dataPhoto, setDataPhoto] = useState([])
    const [isModalVisible, setModalVisible] = useState(false)
    const [dataModalBS, setDataModalBS] = useState({ 'data': [] })
    const [dataLocation, setDataLocation] = useState({ 'Latitude': 0, 'Longitude': 0, 'Accuracy': 0 })
    const [_, setMutate] = useState(false)

    const getLocation = async () => {
        Geolocation.getCurrentPosition(info => {
            const latitude = info.coords.latitude;
            const longitude = info.coords.longitude;
            const accuracy = info.coords.accuracy;
            setDataLocation({ 'Latitude': latitude, 'Longitude': longitude, 'Accuracy': accuracy })
        }, (error) => console.log(error.message));
    }
    const LoadData = async () => {
        await getLocation()
        const dataAudit = await getListImageAudit();
        const dataPhoto = await getPhotoAudit(workinfo)

        await setDataModalBS({ 'data': dataAudit })
        await setDataList(dataAudit.filter(i => i.Id > 0))
        await setDataMain(dataAudit.filter(i => i.Id > 0))
        await setDataPhoto(dataPhoto)
    }
    const uploadData = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', async () => {
            await UploadDataTraining({ ...workinfo, reportId: kpiinfo.id }, async (message) => {
                ToastSuccess(message)
                await UploadPhotoTraining(workinfo)
            })
        });
    }

    const handlerCallBack = async () => {
        await LoadData()
    }
    const handlerFilter = async () => {
        setModalVisible(true)
    }
    const onSelectItem = async (itemChoose) => {
        await setItemFiler(itemChoose.name)
        await setModalVisible(false)
        if (itemChoose.name === 'Tất cả') {
            await setDataList(dataMain)
        } else {
            await setDataList(dataMain.filter(i => i.name === itemChoose.name))
        }
    }
    const addTextChanged = async (value) => {
        await updateFSMValue(workinfo, value)
        workinfo.fsmValue = value
        await setMutate(e => !e)
    }
    const takePictureAudit = (item) => {
        let photoType = item.code;
        let itemPhoto = {
            "guid": workinfo.guiid,
            "reportId": workinfo.reportId,
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "photoType": photoType,
            "photoDate": workinfo.workDate,
            "latitude": dataLocation.Latitude,
            "longitude": dataLocation.Longitude,
            "accuracy": dataLocation.Accuracy
        }
        navigation.navigate('Camera', { ...itemPhoto, callBackReport: handlerCallBack });
    }
    const renderItemPhoto = ({ item, index }) => {
        return (
            <View key={index} style={{ width: '100%', alignSelf: 'center', alignItems: 'center' }}>
                {item.photoPath !== null &&
                    <Image
                        source={{ uri: item.photoPath }}
                        style={{ margin: 3, width: 380, height: 380 }}
                    />
                }
            </View>
        )
    }
    const renderItem = ({ item, index }) => {
        const photoList = dataPhoto.filter(i => i.photoType == item.code)
        const onPressItem = () => {
            takePictureAudit(item)
        }
        return (
            <View style={{ width: '100%' }} key={index.toString()} >
                <TouchableOpacity onPress={onPressItem}>
                    <View style={{ width: '100%', flexDirection: 'row', backgroundColor: appcolor.yellowdark, borderRadius: 5, padding: 8, marginBottom: 3, alignItems: 'center' }}>
                        <Icon name='camera' size={21} style={{ textAlign: 'center' }} color={appcolor.black} />
                        <Text style={styles.itemAudit}>{item.name}</Text>
                    </View>
                </TouchableOpacity>

                <View style={{ justifyContent: 'center' }} >
                    <FlatList
                        keyExtractor={(_, i) => i.toString()}
                        data={photoList}
                        renderItem={renderItemPhoto}
                    />
                </View>
            </View>
        )
    }

    const renderItemSelect = ({ item, index }) => {
        const selectItem = () => {
            onSelectItem(item)
        }
        return (
            <TouchableOpacity onPress={selectItem}>
                <View style={{ borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight }}>
                    <Text style={{ padding: 8, fontSize: 15, color: appcolor.dark }} >{(index + 1)}. {item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        selectStyle: { flexDirection: 'row', width: '95%', height: 'auto', alignSelf: 'center', alignItems: "center", backgroundColor: appcolor.homebackground, padding: 8, borderRadius: 8 },
        bottomContainer: { width: '98%', height: 'auto', alignSelf: 'center', backgroundColor: appcolor.light },
        modalStyle: { width: '100%', height: '100%', padding: 32, backgroundColor: appcolor.light },
        fsmStyle: { width: '95%', height: 'auto', flexDirection: 'row', alignItems: 'center', margin: 8 },
        inputStyle: { width: '15%', height: 'auto', alignSelf: 'center', padding: 8, margin: 3, borderRadius: 8, borderWidth: 0.5, borderColor: appcolor.dark },
        itemAudit: { width: '95%', paddingStart: 8, paddingEnd: 8, fontSize: 15, color: appcolor.black, textAlignVertical: 'center' }
    })
    useEffect(() => { LoadData() }, [])
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                title={route?.params.titlePage}
                iconRight='cloud-upload-alt'
                rightFunc={uploadData}
            />
            <View style={styles.fsmStyle} >
                <Text style={{ marginStart: 8, fontSize: 13, color: appcolor.dark, fontWeight: '500' }}>Số lượng FSM tham gia đào tạo</Text>
                <View style={styles.inputStyle}>
                    <NumberFormat
                        value={workinfo.fsmValue}
                        displayType="text"
                        renderText={values => <TextInput
                            keyboardType="numeric"
                            style={{ textAlign: 'center', color: appcolor.dark }}
                            value={values} onChangeText={addTextChanged} />} />
                </View>
            </View>
            <RenderSelectItem styles={styles} onPress={handlerFilter} selectValue={itemFilter} appcolor={appcolor} />
            <FlatList
                style={{ margin: 8 }}
                key='FieldCoaching'
                showsVerticalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                data={dataList}
                renderItem={renderItem} />
            <View style={styles.bottomContainer} >
                <Modal visible={isModalVisible} >
                    <View style={styles.modalStyle}>
                        {/* Header */}
                        <View style={{ width: '100%', height: '8%', alignContent: 'center' }}>
                            <Text style={{ position: 'absolute', top: 20, start: 0, fontSize: 24, fontWeight: '700', color: appcolor.dark }} >
                                Tìm kiếm hình ảnh
                            </Text>
                            <Icon
                                style={{ position: 'absolute', top: 16, end: 0 }}
                                solid name='times' size={28} color={appcolor.dark} onPress={() => setModalVisible(false)} />
                        </View>
                        {/* Content */}
                        {dataModalBS.data.length > 5 &&
                            <FormGroup containerStyle={styles.filterStyle} placeholder={"Tìm kiếm..."} editable handleChangeForm={handlerFilterProduct} multiline iconName='search' />}
                        <FlatList
                            key="dataSelect"
                            keyExtractor={(_, index) => index.toString()}
                            data={dataModalBS.data}
                            renderItem={renderItemSelect}
                        />
                    </View>
                </Modal>
            </View>
        </View>
    )
}
const RenderSelectItem = ({ typeView, styles, selectValue, onPress, appcolor }) => {
    const eventPress = () => {
        onPress(typeView, selectValue)
    }
    return (
        <TouchableOpacity onPress={eventPress}>
            <View style={styles.selectStyle}>
                <Text style={{ fontSize: 15, color: appcolor.dark, fontWeight: '500' }} >{selectValue !== undefined ? selectValue : 'Tìm kiếm ...'}</Text>
                <Icon
                    style={{ position: 'absolute', end: 8 }}
                    name='chevron-down' size={13} color={appcolor.dark} />
            </View>
        </TouchableOpacity>
    )
}

export default FieldCoaching