import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, LayoutAnimation, Modal, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Icon, Text } from '@rneui/themed';
import _ from 'lodash';
import { MessageInfo, getPhotoUri, groupDataByKey, onShareLocalFile } from "../../../../Core/Helper";
import { deviceHeight, deviceWidth } from "../../../Home";
import CacheImage from "../../../../Core/CacheImage";
import { APPNAME } from "../../../../Core/URLs";
import { FlashList } from "@shopify/flash-list";
import { MultipleShowImage } from "../../../../Control/MultipleShowImage";
import RNFS from 'react-native-fs'
import { ModalNotify } from "../../../../Control/ModalNotify";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { ACTION } from "../../../../Redux/types";
import FormGroup from "../../../../Content/FormGroup";
import { dataAll } from "../../../../Themes/DataTest";
import { toastError, toastSuccess } from "../../../../Utils/configToast";

export const ViewByGroup = ({ dataMain, handleShowMenu }) => {
    const { appcolor, selectData, userinfo } = useSelector(state => state.GAppState)
    const [dataGroup, setDataGroup] = useState({ dataGroup: [], dataAll: [] })
    const [filter, setFilter] = useState({ keyFilter: 'shopName', keyFilter2: 'photoDate' })
    const [isLoading, setLoading] = useState(false)
    const [isLongPress, setLongPresss] = useState(false)
    const [_mutate, setMutate] = useState(false)
    const [dataSelect, setDataSelect] = useState({ dataSelectItem: [], dataUrlShare: [] })
    const [isVisible, setVisible] = useState(false)
    const [messager, setMessager] = useState()
    const [search, setSearch] = useState('')
    const titleNotify = 'Lưu hình'
    const ref_ListImage = useRef()

    const dispatch = useDispatch()

    const LoadData = async () => {
        await setLoading(true)
        dataSelect.dataSelectItem = []
        dataSelect.dataUrlShare = []
        await dispatch({ type: ACTION.SELECT_DATA, select: dataSelect })
        const dataByGroup = _.filter(dataMain, it => it.isChooseTag == 1)
        const dataArr = JSON.parse(dataByGroup[0]?.DataByGroup || '[]')
        // photoDate
        const { arr } = groupDataByKey({
            arr: dataArr,
            key: 'shopName',
            keyLayer2: 'photoDate'
        })
        const dataGroupByFilter = groupData(arr)
        await setLongPresss(false)
        await setSearch('')
        await setDataGroup({ dataGroup: dataGroupByFilter, dataAll: arr })
        await setLoading(false)
    }

    const groupData = (arr) => {
        const arrGroup = _.uniqBy(arr, filter.keyFilter)
        return arrGroup
    }
    //
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            LoadData();
        }
        return () => {
            isMounted = false;
        };
    }, [dataMain])

    // View
    const styles = StyleSheet.create({
        mainContainer: { flex: 1 },
        itemMain: { minWidth: 80, margin: 8, marginTop: 5, padding: 8, borderWidth: 1, borderColor: appcolor.primary, borderRadius: 20, backgroundColor: appcolor.primary, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
        titleView: { paddingHorizontal: 8, paddingEnd: 16, fontSize: 13, fontWeight: Platform.OS == 'ios' ? '600' : '700', color: appcolor.light, textAlign: 'center' },
        viewSumValue: { borderWidth: 1.5, backgroundColor: appcolor.light, borderColor: appcolor.primary, borderRadius: 20, minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
        titleSumValue: { fontSize: 12, fontWeight: 'bold', color: appcolor.dark },
        viewGroupTag: { flexDirection: 'row', alignItems: 'center' },
        viewCloseTag: { backgroundColor: appcolor.primary, minWidth: 30, minHeight: 30, borderRadius: 50, justifyContent: 'center', marginHorizontal: 8 }
    })
    const handleLongPressPhoto = async (itemSelect) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const pathFile = itemSelect.photoPath
        await dataSelect.dataSelectItem.push(itemSelect)
        await dataSelect.dataUrlShare.push(pathFile)
        await dispatch({ type: ACTION.SELECT_DATA, select: dataSelect })
        await setLongPresss(true)
        await handleShowMenu()
    }
    const handleCloseLongPress = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dataSelect.dataSelectItem = []
        dataSelect.dataUrlShare = []
        dataGroup.dataAll.map(it => it.isCheck = false)
        await dispatch({ type: ACTION.SELECT_DATA, select: dataSelect })
        await setLongPresss(false)
        await handleShowMenu()
    }
    const handleSaveImage = async () => {
        await saveImage()
        dataGroup.dataAll.map(it => it.isCheck = false)
        dataSelect.dataSelectItem = []
        dataSelect.dataUrlShare = []
        await dispatch({ type: ACTION.SELECT_DATA, select: dataSelect })
        await setMutate(e => !e)
    }
    const saveImage = async () => {
        const listSelect = dataSelect.dataSelectItem
        try {
            if (Platform.OS === "android") {
                toastSuccess("Thông báo", "Đang tiến hành...");
                if (Platform.Version < 33) {
                    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: "Yêu cầu quyền",
                            message: "Vui lòng cấp quyền truy cập bộ nhớ để tiếp tục",
                        }
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.OS === "android") {
                        alert("Lỗi, Bạn đã từ chỗi cấp quyền truy cập bộ nhớ!!");
                        return;
                    }
                }
            }
            await handleSaveImageProgress(listSelect)
            await handleVisibleModal(false)
        } catch (err) {
            toastError("Lỗi", "Ứng dụng chưa được cấp quyền");
        }
    }
    const handleSaveImageProgress = async (listSelect) => {
        listSelect.map(async it => {
            let photoPath = getPhotoUri(it.photoPath)
            if (!photoPath) return
            if (photoPath.indexOf('https://') > -1 || photoPath.includes('uploaded')) {
                const name = photoPath.substring(photoPath.lastIndexOf('/') + 1, photoPath?.length);
                const extension = (Platform.OS === 'android') ? 'file://' : ''
                const path = `${extension}${RNFS.CachesDirectoryPath}/Camera/`;
                photoPath = `${path}${name}`
            }
            await CameraRoll.save(photoPath, { type: 'photo', album: APPNAME })
                .then(res => {
                    console.log(res);
                    toastSuccess("thông báo", 'Lưu ảnh thành công!!')
                })
                .catch(error => {
                    console.log(error);
                    console.log('check');
                    toastError("Lỗi", 'Lưu ảnh không thành công!!!')
                    return
                });
        })
    }
    const handleSelectSave = async () => {
        await setMessager(<View style={{ height: 100 }}>
            <View key={'ViewSaveImage'} style={{ width: deviceWidth * 0.8 }} >
                <View style={{ height: 100, backgroundColor: appcolor.light, borderTopEndRadius: 20, borderTopStartRadius: 20 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontWeight: '300', fontSize: 14, color: appcolor.dark }}>Lưu {dataSelect.dataSelectItem.length || 0} hình?</Text>
                    </View>
                    <View style={{ flexDirection: 'row', height: 60, justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            onPress={() => handleVisibleModal()}
                            style={{ height: 40, width: '30%', marginLeft: 40, backgroundColor: appcolor.surface, padding: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ fontWeight: '400', fontSize: 16, color: appcolor.dark }}>Huỷ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSaveImage()}
                            style={{ height: 40, width: '30%', marginRight: 40, backgroundColor: appcolor.info, padding: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={{ fontWeight: '400', fontSize: 16, color: appcolor.light }}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>)
        await handleVisibleModal(true)
    }
    const handleVisibleModal = async (visible) => {
        await setVisible(visible)
    }

    const shareScreen = async () => {
        const arrUrlNew = []
        if (Platform.OS === "android") {
            if (Platform.Version < 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Yêu cầu quyền",
                        message: "Vui lòng cấp quyền truy cập bộ nhớ để tiếp tục",
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.OS === "android") {
                    MessageInfo("Lỗi, Bạn đã từ chỗi cấp quyền truy cập bộ nhớ!!");
                    return;
                }
            }
        }

        for (let index = 0; index < dataSelect.dataSelectItem?.length; index++) {
            const it = dataSelect.dataSelectItem[index];
            const photoPath = getPhotoUri(it.photoPath)
            if (!photoPath) continue
            const name = photoPath.substring(photoPath.lastIndexOf('/') + 1, photoPath?.length);
            const downloadDest = `${RNFS.CachesDirectoryPath}/${name}`;
            const response = await RNFS.downloadFile({
                fromUrl: photoPath,
                toFile: downloadDest,
            }).promise;
            arrUrlNew.push(`file://${downloadDest}`)
        }
        if (arrUrlNew.length == 0) {
            MessageInfo("Không có hình ảnh hợp lệ để chia sẻ");
            return
        }

        const url = arrUrlNew.length > 1 ? 'urls' : 'url'
        const option = await {
            title: "Tin nhắn",
            message: userinfo.employeeName + ' chia sẻ hình ảnh',
            [url]: arrUrlNew.length > 1 ? arrUrlNew : arrUrlNew[0]
        }
        await onShareLocalFile(option);

        for (let indexShare = 0; indexShare < arrUrlNew.length; indexShare++) {
            const itemShare = arrUrlNew[indexShare]
            await setTimeout(async () => {
                await RNFS.unlink(itemShare);
            }, 10000);
        }
    }

    const filterPhoto = async (text) => {
        // if (isLongPress && type !== 'task') {
        //     await handleCloseSelect()
        // }
        if (text) {
            dataGroup.dataAll.map(it => {
                const itemName = `${it[filter.keyFilter]}_${it.shopCode}`.toString().toUpperCase()
                const textSearch = text.toUpperCase()
                if (itemName.indexOf(textSearch) == -1) {
                    it.isHide = true
                } else {
                    it.isHide = false
                }
            })
            // setMutate(e => !e)
            // setArrDataShow(newDataShow)
            setSearch(text)
        } else {
            dataGroup.dataAll.map(it => {
                it.isHide = false
            })
            setSearch(text)
            // setMutate(e => !e)
            // setArrDataShow(arrDataShowF)
            // setDone(false)

        }
    }

    return (
        <View style={styles.mainContainer}>
            {
                isLongPress &&
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => handleCloseLongPress()} style={{ padding: 8, width: '15%', justifyContent: 'space-between', justifyContent: 'center' }}>
                        <Icon type='font-awesome-5' name='times' size={25} color={appcolor.dark} />
                    </TouchableOpacity>
                    <View style={{ padding: 8, width: '70%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: Platform.OS == 'iso' ? '600' : '700', fontSize: 16, color: appcolor.dark }}>{selectData?.dataSelectItem?.length == 0 ? 'Chọn hình' : `Đã chọn ${selectData?.dataSelectItem?.length || 0} hình`}</Text>
                    </View>
                    <View style={{ backgroundColor: appcolor.transparent, padding: 8, width: '15%' }}></View>
                </View>
            }
            {
                !isLongPress &&
                <FormGroup
                    containerStyle={{ backgroundColor: appcolor.light, marginBottom: 8, alignSelf: 'center' }}
                    inputStyle={{ fontSize: 13, color: appcolor.dark }}
                    placeholder='Tìm kiếm hình ảnh' editable
                    onClearTextAndroid={filterPhoto}
                    iconName='search' value={search}
                    handleChangeForm={filterPhoto}
                />
            }
            {
                !isLoading && dataGroup.dataGroup.length > 0 &&
                <FlashList
                    ref={ref_ListImage}
                    key={`photoGroupScreen`}
                    keyExtractor={(_item, index) => index.toString()}
                    data={dataGroup.dataGroup}
                    estimatedItemSize={100}
                    extraData={[isLongPress, dataGroup.dataAll]}
                    renderItem={({ item, index }) =>
                        <RenderItem item={item}
                            index={index} filter={filter}
                            dataGroup={dataGroup} dataSelect={dataSelect}
                            isLongPress={isLongPress}
                            handleLongPressPhoto={handleLongPressPhoto}
                        />}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 8 }} />}
                />
            }
            {
                isLongPress &&
                <View style={{
                    position: 'absolute', bottom: 0, height: 70, borderTopStartRadius: 10, borderTopEndRadius: 10, width: '100%',
                    backgroundColor: appcolor.surface, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'
                }}>
                    <View style={{ padding: 5, flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => handleSelectSave()}
                            style={{ width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Icon type='feather' name='save' size={20} color={appcolor.dark} />
                            <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>lưu</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ padding: 5, flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => shareScreen()}
                            style={{ width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Icon type='fontawe-some' name='share' size={20} color={appcolor.dark} />
                            <Text style={{ fontWeight: '500', fontSize: 12, color: appcolor.dark }}>Chia sẻ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            {isVisible &&
                <ModalNotify messager={messager} visible={isVisible} handleVisibleModal={handleVisibleModal} titleNotify={titleNotify} isUseButton={false} />
            }
        </View>
    )
}

const RenderItem = ({ item, index, filter, dataGroup, dataSelect, dataUrlShare, isLongPress, handleLongPressPhoto }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const dataPhotoFilter = dataGroup.dataAll.filter((it) => it[filter.keyFilter] == item[filter.keyFilter] && !it.isHide && !!getPhotoUri(it.photoPath))
    const [dataModal, setDataModal] = useState({ mode: '', imageIndex: 0, visibleModal: false, listByGroup: [] })
    const [_mutate, setMutate] = useState(false)
    const [isShowPhotobyGroup, setShowPhotobyGroup] = useState(true)
    const dispatch = useDispatch()

    const pressItem = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowPhotobyGroup(e => !e)
    }

    // useEffect(() => {
    //     let isMounted = true;
    //     if (isMounted) {
    //         setMutate(e => !e)
    //     }
    //     return () => { isMounted = false; };
    // }, [isLongPress])

    const handleSelectPhoto = async (type, itemSelect) => {
        if (type === 'photo') {
            const indexItem = dataPhotoFilter.findIndex(it => it.photoPath === itemSelect.photoPath)
            await setDataModal({ mode: type, imageIndex: indexItem, visibleModal: true, listByGroup: dataPhotoFilter })
        } else if (type === 'select') {
            handleSelectItem(itemSelect)
        }
    }
    const handleSelectItem = (itemSelect) => {
        itemSelect.isCheck = !itemSelect.isCheck
        let arrUrl = itemSelect.photoPath
        let arrItemSelect = dataSelect.dataSelectItem
        dataPhotoFilter.map(it => {
            if (it.photoPath === itemSelect.photoPath) {
                it.isCheck = itemSelect.isCheck
            }
        })
        const pathFile = itemSelect.photoPath
        const indexUrl = dataSelect.dataUrlShare.findIndex(it => it === pathFile)
        if (indexUrl !== -1) {
            arrUrl = dataSelect.dataUrlShare.filter((it, idx) => idx !== indexUrl)
            arrItemSelect = dataSelect.dataSelectItem.filter(it => it.photoPath !== itemSelect.photoPath)
            dataSelect.dataSelectItem = arrItemSelect
        } else {
            arrUrl = [...dataSelect.dataUrlShare, pathFile]
            dataSelect.dataSelectItem.push(itemSelect)
        }
        dataSelect.dataUrlShare = [...arrUrl]
        dispatch({ type: ACTION.SELECT_DATA, select: dataSelect })
        setMutate(e => !e)
    }
    const handleLongSelect = async (itemSelect) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        itemSelect.isCheck = true
        handleLongPressPhoto(itemSelect)
    }

    const handlerCloseModal = async (isDelete) => {
        await setDataModal({ mode: '', imageIndex: 0, visibleModal: false, listByGroup: [] })
    }

    return (
        <View key={`${item.shopId}_${index}`} style={{ marginTop: 5, borderRadius: 4, backgroundColor: appcolor.light, overflow: 'hidden' }}>
            <TouchableOpacity key={`ShopName_${item.shopId}_${index}`}
                style={{
                    marginTop: 8, borderRadius: 8,
                    flex: 1, flexDirection: 'row',
                    borderBottomWidth: 3,
                    backgroundColor: appcolor.surface,
                    borderColor: appcolor.primary, padding: 8,
                    shadowColor: appcolor.black, elevation: 3, // Cho Android
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4,
                    shadowRadius: 5,
                }} onPress={pressItem}>
                <View style={{ justifyContent: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={{ width: '80%', fontSize: 12, fontWeight: 'bold', color: appcolor.dark }}>{item[filter.keyFilter || 'shopName']}_{`${item.shopCode}`} {`(${dataPhotoFilter.length})`}</Text>
                </View>
            </TouchableOpacity>
            {
                isShowPhotobyGroup &&
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', width: '100%' }}>
                        {
                            dataPhotoFilter.length > 0 &&
                            dataPhotoFilter.map((itemPhoto, indexPhoto) => {

                                const photopath = getPhotoUri(itemPhoto.photoPath)
                                if (!photopath) return null
                                return (
                                    <TouchableOpacity
                                        key={`${itemPhoto.shopId}_${indexPhoto}`}
                                        onPress={() => handleSelectPhoto(isLongPress ? 'select' : 'photo', itemPhoto)}
                                        onLongPress={() => !isLongPress ? handleLongSelect(itemPhoto) : null}
                                        style={{ margin: 1 }}>
                                        <View style={{ width: (deviceWidth - 20) / 4, borderRadius: 10, height: 130, backgroundColor: appcolor.surface }}>
                                            {
                                                photopath.includes('uploaded') ?
                                                    <CacheImage
                                                        containerStyle={{ borderRadius: 10 }}
                                                        resizeMode={'cover'}
                                                        source={{ uri: photopath }} />
                                                    :
                                                    <ImageBackground
                                                        imageStyle={{ borderRadius: 5, backgroundColor: appcolor.surface }} style={{ height: '100%', width: '100%' }}
                                                        source={{ uri: photopath }}
                                                    />
                                            }
                                        </View>
                                        {
                                            isLongPress &&
                                            <Icon type='feather' name={itemPhoto.isCheck ? 'check-circle' : 'circle'} size={20} containerStyle={{ position: 'absolute', bottom: 5, right: 5, width: 20, height: 20 }} color={itemPhoto.isCheck ? appcolor.success : appcolor.white} />
                                        }
                                        <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', width: '100%', top: 0, left: 0, borderRadius: 10, height: 25, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: appcolor.white }}>{itemPhoto.imageTitle}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            }

            <Modal key={`${item.shopId}_${item.photoID}`} visible={dataModal.visibleModal} style={{ flex: 1 }}>
                {dataModal.mode == 'photo' &&
                    <MultipleShowImage
                        key={index + '_ShowItemImage'}
                        listItem={dataModal.listByGroup}
                        closeShowImage={(value) => handlerCloseModal(value)}
                        indexItem={dataModal.imageIndex} isUseTool={true}
                        useEditImage={false} useDeleteTool={false}
                        isShowText={true} sortFeild={filter.keyFilter} />}
            </Modal>
        </View>
    )
}
