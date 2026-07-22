
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
// import NumberFormat from "react-number-format";
import { useSelector } from "react-redux";
import { REPORT } from "../../../API/ReportAPI";
import FormGroup from "../../../Content/FormGroup";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { displayTabData } from "../../../Controller/DisplayController";
import { getCategoryPromotion } from "../../../Controller/ProductController";
import { checkRawReport, getDataPhotoByReport, insertRawReport, itemUploaded, saveJsonData } from "../../../Controller/ReportController";
import { formatPhone, groupDataByKey, isPhone, MessageAction, MessageInfo, ToastError, ToastSuccess, UUIDGenerator } from "../../../Core/Helper";
import { alertConfirm, checkNetwork, deviceHeight, deviceWidth, minWidthTab, TODAY } from "../../../Core/Utility";
import RNFS, { stat } from 'react-native-fs'
import { Badge, Icon } from '@rneui/themed';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { ModalNotify } from "../../../Control/ModalNotify";
;
import moment from "moment";
import NativeCamera from "../../../Control/NativeCamera";
import { useFocusEffect } from "@react-navigation/native";
import { getPhotosByGuiId } from "../../../Controller/WorkController";
import { deletePhoto } from "../../../Controller/PhotoController"
import { GetDataIssueReport, IssueReportUpload } from "../../../Controller/IssueController";
import { URLDEFAULT } from "../../../Core/URLs";
import ViewListComment from "./ViewListComment";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const IssueReport = ({ navigation, route }) => {
    const { appcolor, shopinfo, workinfo, userinfo, kpiinfo } = useSelector(state => state.GAppState);
    const [data, setData] = useState({ dataTab: [], dataMain: [], dataShow: [], listIssueType: [], dataHashtag: [] })
    const [loading, setLoading] = useState(false)
    const [isUploaded, setUploaded] = useState(false)
    const [currentTab, setCurrentTab] = useState({})
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id }
    const tabRef = useRef()
    const [isVisible, setVisible] = useState(false)
    const [itemSelectEdit, setItemSelectEdit] = useState({ itemEdit: {}, indexTab: 0 })
    const [messager, setMessager] = useState()
    const lstReport = JSON.parse(kpiinfo?.reportItem || '[]')
    const [listPhoto, setListPhoto] = useState([])
    const [visibleModal, setVisibleModal] = useState(false)
    const [guiIdItem, setGuiIdItem] = useState('')
    const [itemSelect, setItemSelect] = useState({ itemIssue: {}, indexSelect: 0, type: '' })
    const [showTab, setShowTab] = useState(true)
    const [dataImage, setDataImage] = useState({ isShowPhoto: false, itemPhoto: [], indexPhoto: 0 })
    const [_, setMutate] = useState()

    const loadData = async () => {
        await setLoading(true)
        await GetDataIssueReport(dataFilter, async (mData, mesager) => {
            const listTab = JSON.parse(mData.dataTab || '[]')
            const listIssue = JSON.parse(mData.dataIssue || '[]')
            const listHashtag = JSON.parse(mData.dataHashtag || '[]')
            await setData({ dataTab: listTab, dataMain: listIssue, dataShow: listIssue, listIssueType: listHashtag })
            await setCurrentTab(listTab[0])
        })
        const itemUpdate = await itemUploaded(shopinfo, kpiinfo.id)
        await setUploaded(itemUpdate.isUploaded == 1)
        await setLoading(false)
    }

    useEffect(() => {
        loadData()
        return () => false
    }, [])

    const handleSelectQuestion = async (type, dataItem) => {
        if (type == 'CREATE') {
            const guiIdNew = UUIDGenerator()
            itemSelect.type = type
            await setGuiIdItem(guiIdNew)
            await setVisibleModal(true)
        } else if (type == 'CLOSE') {
            const listPhotoByGuiid = await getPhotosByGuiId(guiIdItem, workinfo.shopId)
            listPhotoByGuiid.forEach(it => {
                if (it.dataUpload != 1) {
                    deletePhoto(it)
                }
            })
            await setVisibleModal(false)
        } else if (type == 'CLOSENEW') {
            const listDataNew = [dataItem, ...data.dataMain]
            data.dataMain = listDataNew
            data.dataShow = listDataNew
            await setVisibleModal(false)
        } else if (type == 'CLOSEEDIT') {
            const indexDataM = data.dataMain.findIndex(it => it.guiid === dataItem.guiid)
            const indexDataS = data.dataShow.findIndex(it => it.guiid === dataItem.guiid)
            data.dataMain[indexDataM] = dataItem
            data.dataShow[indexDataS] = dataItem
            await setVisibleModal(false)
        } else if (type == 'EDIT') {
            await checkHashTag(dataItem)
            await SheetManager.hide('sheetItemSetting')
            itemSelect.type = type
            const guiIdNew = dataItem.guiid
            SheetManager.hide('sheetItemSetting')
            await setGuiIdItem(guiIdNew)
            await setVisibleModal(true)
        }
    }
    const checkHashTag = (dataItem) => {
        if (dataItem.issueType != undefined && itemSelect.itemIssue?.issueType?.length > 0) {
            const hashtagArr = dataItem.issueType.split(',')
            data.listIssueType.map(it => {
                const check = hashtagArr.filter(item => item == it.nameVN)
                if (check.length > 0) {
                    it.isCheck = true
                } else { it.isCheck = false }
            })
        }
    }

    const ViewInputIssues = () => {
        return (
            <View style={{}}>
                <TouchableOpacity
                    onPress={() => handleSelectQuestion('CREATE')}
                    style={{ flexDirection: 'row', justifyContent: 'center', margin: 5 }}>
                    <View style={{ width: '15%', alignItems: 'center' }}>
                        <View style={{ height: 40, width: 40, backgroundColor: appcolor.surface, borderRadius: 40, justifyContent: "center", alignItems: 'center' }}>
                            <Icon name="cogs" type="font-awesome-5" size={25} color={appcolor.primary} />
                        </View>
                    </View>
                    <View style={{ width: '75%', justifyContent: 'center', paddingHorizontal: 10, }}>
                        <Text style={{ fontWeight: '500', fontSize: 14, color: appcolor.dark }}>Vấn đề của bạn là gì?</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '10%', justifyContent: "center", alignItems: 'center' }}>
                        <View style={{ backgroundColor: appcolor.surface, borderRadius: 40, justifyContent: 'center', alignItems: 'center', width: 30, height: 30 }} >
                            <Icon name="images" type="font-awesome-5" size={16} color={appcolor.primary} />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{ height: 5, width: deviceWidth, backgroundColor: appcolor.grayLight }} />
            </View>
        )
    }

    const handleSelectTab = (item) => {
        setCurrentTab(item)
    }

    const renderItemTab = ({ item, index }) => {


        const countList = data.dataShow.filter(it => it.issueStatus == item.id)?.length
        return (
            <TouchableOpacity
                key={'itemTab_' + index}
                onPress={() => handleSelectTab(item)}
                style={{ padding: 5, borderRadius: 5, borderWidth: 0.6, borderColor: currentTab.id == item.id ? appcolor.white : appcolor.dark, backgroundColor: currentTab.id == item.id ? appcolor.primary : appcolor.light, marginHorizontal: 3 }}>
                <Text style={{ fontWeight: '400', fontSize: 13, color: currentTab.id == item.id ? appcolor.white : appcolor.dark }}>{item.nameVN}{countList > 0 ? `(${countList})` : ''}</Text>
            </TouchableOpacity>
        )
    }

    const handleSelectArrow = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowTab(e => !e)
    }
    const updateStatus = () => {
        setMutate(e => !e)
    }

    const ViewListTab = ({ listByTab }) => {
        return (
            <View style={{ padding: 5, justifyContent: showTab ? 'space-between' : 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ display: showTab ? 'flex' : 'none', width: deviceWidth - 40 }}>
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        key={'listTabIssue'}
                        data={data.dataTab}
                        renderItem={renderItemTab}
                    />
                </View>
                <View style={{ display: showTab ? 'none' : 'flex' }}>
                    <TouchableOpacity
                        key={'itemCurrentTab' + currentTab.id}
                        onPress={() => handleSelectTab(item)}
                        style={{ padding: 5, borderRadius: 5, borderWidth: 0.6, borderColor: appcolor.white, marginHorizontal: 3, backgroundColor: appcolor.primary }}>
                        <Text style={{ fontWeight: '400', fontSize: 13, color: appcolor.white }}>{currentTab.nameVN}{listByTab.length > 0 ? `(${listByTab.length})` : ''}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: 40 }}>
                    <TouchableOpacity
                        key={'itemCurrentTab' + currentTab.id}
                        onPress={() => handleSelectArrow()}
                        style={{ justifyContent: 'center', alignItems: 'center', padding: 6, paddingHorizontal: 8 }}>
                        <Icon color={appcolor.primary} name={showTab ? 'caret-left' : 'caret-right'} type='font-awesome-5' size={14} />

                    </TouchableOpacity>
                </View>

            </View>
        )
    }
    const handleSelectDecription = (item, index) => {
        setItemSelect({ ...itemSelect, itemIssue: item, indexSelect: index })
        SheetManager.show('sheetItemComment')
    }
    const countComment = (listComment) => {
        let count = 0
        for (let i = 0; i < listComment.length; i++) {
            const item = listComment[i]
            count = count + 1
            if (JSON.parse(item.noteFeedBack || '[]').length > 0) {
                count = count + 1
            }
        }
        return count
    }

    const handleSelectSetting = (item, index) => {
        setItemSelect({ ...itemSelect, itemIssue: item, indexSelect: index })
        SheetManager.show('sheetItemSetting')
    }

    const handleDoneIssue = (item) => {

        const dataUpload = {
            ...item,
            issueStatus: 3,
            typeSend: 'ANSWER',
        }
        MessageAction(`Bạn xác nhận vấn đề này đã được giải quyết?`, async () => {
            let isNetwork = await checkNetwork();
            if (!isNetwork) {
                MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                return
            }
            await setLoading(true)
            await IssueReportUpload([dataUpload], { ...workinfo, reportId: kpiinfo.id }, guiIdItem, async (result) => {
                if (result.statusId === 200) {
                    handleSelectQuestion('CLOSEEDIT', { ...dataUpload })
                    // updateStatus()
                    ToastSuccess(`Thay đổi trạng thái thành công!`, 'Thông báo', 'top')
                } else {
                    MessageInfo(`Xảy ra lỗi khi thay đổi trạng thái vấn đề!` + result.messager, 'Lỗi', 'top')
                }
                setLoading(false)
            })
        })
    }

    const renderItemIssue = ({ item, index }) => {
        const hashtagArr = item.issueType != undefined ? item.issueType.split(',') : []
        let numComment = countComment(JSON.parse(item.issueComments || '[]'))
        return (
            <View style={{
                backgroundColor: appcolor.light, borderRadius: 16, marginHorizontal: 8, marginTop: 12,
                shadowColor: appcolor.black, elevation: 3, // Cho Android
                shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, alignItems: "center" }}>
                    <View style={{ paddingTop: 10, paddingLeft: 10, flexDirection: 'row', alignItems: 'center', width: item.isEditItem == 1 ? '90%' : '100%' }}>
                        <Text style={{ color: appcolor.primary, fontWeight: '600', fontSize: 16 }}>{moment(item.reportDate?.toString() || new Date()).format("YYYY-MM-DD")}{hashtagArr.length > 0 ? ' - ' : ''}</Text>
                        {
                            hashtagArr.length > 0 &&
                            <ScrollView horizontal showsHorizontalScrollIndicator>
                                <View style={{ flexDirection: 'row', flexWrap: "wrap", }}>
                                    {
                                        hashtagArr.map((item, index) => {
                                            return (
                                                <View
                                                    key={index}
                                                    style={{
                                                        padding: 2, borderRadius: 4, borderWidth: 0.6, borderColor: appcolor.primary, minWidth: 60,
                                                        justifyContent: "center", alignItems: "center", backgroundColor: appcolor.light, margin: 5
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 12, color: appcolor.primary, fontWeight: '500' }}>{item}</Text>
                                                </View>
                                            )

                                        })
                                    }
                                </View>
                            </ScrollView>
                        }
                    </View>
                    {
                        (item.isEditItem == 1 && item.issueStatus !== 3 && item.issueStatus !== 4) &&
                        <TouchableOpacity
                            onPress={() => handleSelectSetting(item, index)}
                            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center', }}>
                            <Icon color={appcolor.primary} name='ellipsis-h' type='font-awesome-5' size={18} />
                        </TouchableOpacity>
                    }
                </View>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text style={{ fontWeight: '400', fontSize: 13, color: appcolor.dark, paddingHorizontal: 5, }}>{<Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>Vấn dề : </Text>}{item.noteIssue}</Text>
                    {(item.noteSolution !== undefined && item.noteSolution !== null && item.noteSolution.length > 0)
                        && <Text style={{ fontWeight: '400', fontSize: 13, color: appcolor.dark, paddingHorizontal: 5, }}>{<Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark, paddingHorizontal: 10, }}>Giải pháp : </Text>}{item.noteSolution}</Text>}
                </View>

                <ListPhotoByItem item={item} index={index} handleShowImage={handleShowImage} />
                {/* {
                    numComment > 0 &&
                    <TouchableOpacity onPress={() => handleSelectDecription(item, index)} style={{ flexDirection: "row", justifyContent: 'flex-end' }}>
                        <Text style={{ padding: 10, fontWeight: '400', fontSize: 12, color: appcolor.dark }}>{numComment} Phản hồi</Text>
                    </TouchableOpacity>
                } */}
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <TouchableOpacity
                        onPress={() => handleSelectDecription(item, index)}
                        style={{ alignItems: 'center', flexDirection: 'row', padding: 10, width: 80 }}>
                        <Icon color={appcolor.primary} name='comment-dots' type='font-awesome-5' size={20} style={{ padding: 5 }} />
                        <Text style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}>{numComment}</Text>
                    </TouchableOpacity>
                    {
                        item.issueStatus !== 3 &&
                        <TouchableOpacity
                            onPress={() => handleDoneIssue(item)}
                            style={{ alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', padding: 10, width: 80 }}>
                            <Icon color={appcolor.primary} name='check' type='font-awesome-5' size={20} style={{ padding: 5 }} />
                        </TouchableOpacity>
                    }

                </View>
            </View>
        )
    }

    const handleCancelIssue = () => {
        const dataFilter = data.dataMain.filter(it => it.guiid !== itemSelect.itemIssue.guiid)
        data.dataMain = dataFilter
        data.dataShow = dataFilter

    }

    const onCancelIssue = () => {
        const dataUpload = [{
            ...itemSelect.itemIssue,
            typeSend: 'CANCEL'
        }]
        MessageAction('Bạn chắc chắn muốn huỷ bỏ vấn đề này?', async () => {
            let isNetwork = await checkNetwork();
            if (!isNetwork) {
                MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                return
            }
            await IssueReportUpload(dataUpload, workinfo, null, async (result) => {
                if (result.statusId === 200) {
                    handleCancelIssue()
                    ToastSuccess('Huỷ bỏ vấn đề thành công!', 'Thông báo', 'top')
                    setItemSelect({ ...itemSelect, itemIssue: {}, indexSelect: 0 })
                } else {
                    MessageInfo(result.messager, 'Lỗi', 'top')
                }
            })
        })
    }

    const handleShowImage = async (itemImage, listImage, indexImage) => {
        dataImage.itemPhoto = itemImage
        dataImage.indexPhoto = indexImage
        SheetManager.show('imageSheet')
    }

    const handleVisible = async () => {
        // dataImage.isShowPhoto ? (dataImage.isShowPhoto = false) : null
        // await setVisibleModalPhoto(e => !e)
        SheetManager.hide('imageSheet')
    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                leftFunc={() => navigation.goBack()}
                iconRight='plus'
                rightFunc={() => handleSelectQuestion('CREATE')}
            />
            <View style={{ flex: 1, backgroundColor: appcolor.light }}>
                {
                    data.dataTab?.length > 0 && !loading &&
                    <Tabs.Container
                        pagerProps={{
                            scrollEnabled: true
                        }}
                        renderTabBar={props =>
                        (
                            <MaterialTabBar
                                {...props}
                                labelStyle={{ fontSize: 13, fontWeight: '700' }}
                                indicatorStyle={{ backgroundColor: appcolor.primary }}
                                inactiveColor={appcolor.greylight}
                                activeColor={appcolor.primary}
                                tabStyle={{ backgroundColor: appcolor.light, minWidth: minWidthTab(data.dataTab), height: 36 }}
                                scrollEnabled={true}
                            />
                        )}
                        headerContainerStyle={{ backgroundColor: appcolor.light, shadowColor: appcolor.transparent }}
                    >

                        {data.dataTab?.map((item, index) => {
                            const listByTab = data.dataShow?.filter(it => it.issueStatus == item.id)
                            return (
                                <Tabs.Tab
                                    key={`bill_${index}`}
                                    label={`${item.nameVN}${listByTab.length > 0 ? ` (${listByTab.length})` : ''}`}
                                    name={`${item.nameVN}${listByTab.length > 0 ? ` (${listByTab.length})` : ''}`}>
                                    <View style={{ flex: 1, paddingTop: 44, width: deviceWidth, backgroundColor: appcolor.surface }}>
                                        <FlatList
                                            data={listByTab}
                                            renderItem={renderItemIssue}
                                            refreshControl={
                                                <RefreshControl
                                                    refreshing={false}
                                                    onRefresh={loadData} />
                                            }
                                            ListFooterComponent={<View style={{ height: 300 }} />}
                                        />
                                    </View>
                                </Tabs.Tab>
                            )
                        })}
                    </Tabs.Container>
                }

            </View>
            <Modal visible={visibleModal} style={{ width: '100%', height: deviceHeight }} transparent animationType={"slide"} >
                <SafeAreaView style={{ height: deviceHeight, backgroundColor: 'rgba(0,0,0,0.2)' }} >
                    <TouchableOpacity
                        style={{ height: deviceHeight * 0.4 }}
                        onPress={() => handleSelectQuestion('CLOSE')}
                    >
                    </TouchableOpacity>
                    <View style={{ width: deviceWidth, height: deviceHeight * 0.6, backgroundColor: appcolor.light, borderTopEndRadius: 16, borderTopStartRadius: 16 }}>
                        <ViewCreateIssue guiIdItem={guiIdItem} handleSelectQuestion={handleSelectQuestion} lstReport={lstReport} data={data} itemSelect={itemSelect} handleShowImage={handleShowImage} />
                    </View>
                </SafeAreaView>
                {/* <ViewCreateIssue guiIdItem={guiIdItem} handleSelectQuestion={handleSelectQuestion} lstReport={lstReport} data={data} itemSelect={itemSelect} handleShowImage={handleShowImage} /> */}
            </Modal>

            <ActionSheet
                onClose={updateStatus}
                id="sheetItemComment"
                statusBarTranslucent
                gestureEnabled
                containerStyle={{ backgroundColor: appcolor.light }}
                drawUnderStatusBar={Platform.OS == 'ios'}
                closable={true}
            >
                <ViewListComment itemSelect={itemSelect} data={data} />
            </ActionSheet>
            <ActionSheet
                id="sheetItemSetting"
                containerStyle={{ backgroundColor: appcolor.light }}
            >
                <View style={{ height: 250, width: '100%', marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => handleSelectQuestion('EDIT', itemSelect.itemIssue)}
                        style={{ flexDirection: 'row', padding: 5, alignItems: 'center' }}>
                        <Icon color={appcolor.primary} name='edit' type='font-awesome-5' size={25} style={{ paddingHorizontal: 10 }} />
                        <Text style={{ fontWeight: '400', fontSize: 18, color: appcolor.dark }}>Chỉnh sửa vấn đề</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onCancelIssue()}
                        style={{ flexDirection: 'row', padding: 5, alignItems: 'center' }}>
                        <Icon color={appcolor.danger} name='trash-alt' type='font-awesome-5' size={25} style={{ paddingHorizontal: 10 }} />
                        <Text style={{ fontWeight: '400', fontSize: 18, color: appcolor.dark, paddingHorizontal: 10 }}>Bỏ vấn đề</Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
            <ActionSheet
                id={'imageSheet'}
                containerStyle={{ height: deviceHeight, width: deviceWidth, backgroundColor: appcolor.light }}
            >
                <ViewImageSheet dataImage={dataImage} handleVisible={handleVisible} />
            </ActionSheet>
        </View>
    )
}

const ViewImageSheet = ({ dataImage, handleVisible }) => {
    const [itemPhoto, setItemPhoto] = useState({})
    const appcolor = useSelector(state => state.GAppState.appcolor)

    useEffect(() => {
        loadData()
        return () => false
    }, [])
    const loadData = () => {
        const itemImage = dataImage.itemPhoto
        setItemPhoto(itemImage)
    }
    return (
        <View style={{ width: '100%', height: '100%' }}>
            <TouchableOpacity onPress={() => handleVisible()}
                style={{ position: 'absolute', right: 20, top: Platform.OS == 'ios' ? 40 : 20, zIndex: 100, borderRadius: 5, borderWidth: 1, padding: 3, paddingHorizontal: 10, borderColor: appcolor.primary }}>
                <Text style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}>Đóng</Text>
            </TouchableOpacity>
            {
                itemPhoto?.photoPath !== undefined &&
                <Image source={{ uri: itemPhoto.photoPath.includes('uploaded') ? (URLDEFAULT + itemPhoto.photoPath) : (itemPhoto.photoPath || '') }} resizeMode={'contain'} style={{ width: '100%', height: '100%' }} />
            }
        </View>

    )
}

const ListPhotoByItem = ({ item, index, handleShowImage }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const listImage = JSON.parse(item.imageIssues || '[]')

    const renderItemImage = ({ item, index }) => {
        return (
            // <View style={{ flex: 1, borderRadius: 12, marginHorizontal: 5, marginTop: 5 }}>
            index < 2 ?
                <TouchableOpacity
                    onPress={() => handleShowImage(item, listImage, index)}
                    style={{ borderRadius: 12, flex: 1, marginRight: index == 0 ? 4 : 0, marginLeft: index == 1 ? 4 : 0 }}
                >
                    <Image resizeMode="cover" source={{ uri: URLDEFAULT + item.photoPath }}
                        style={{ width: '100%', height: deviceWidth / 2 - 36, borderRadius: 10 }} />
                    {
                        (index == 1 && listImage.length > 2) &&
                        <View style={{ borderRadius: 12, position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <Text style={{ fontSize: 30, color: appcolor.white, fontWeight: '500' }}> + {listImage.length - 1}</Text>
                        </View>
                    }
                </TouchableOpacity>
                : null

        )
    }

    return (
        <View>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                {
                    listImage.length == 1 ?
                        <TouchableOpacity
                            onPress={() => handleShowImage(listImage[0], listImage, 0)}
                            style={{ width: '100%', height: deviceWidth / 1.8, alignItems: 'center', padding: 8 }}>
                            <Image source={{ uri: listImage[0].photoPath?.includes('uploaded') ? (URLDEFAULT + listImage[0]?.photoPath) : (listImage[0].photoPath || '') }}
                                style={{ width: '100%', height: '100%', backgroundColor: appcolor.surface, borderRadius: 10 }} />
                        </TouchableOpacity>
                        :
                        <View style={{ flex: 1, padding: listImage.length > 0 ? 8 : 1 }}>

                            <FlatList
                                style={{ justifyContent: 'space-between' }}
                                data={listImage}
                                scrollEnabled={false}
                                renderItem={renderItemImage}
                                numColumns={2}
                            />
                        </View>
                }
            </View>
        </View>
    )
}

const ViewCreateIssue = ({ guiIdItem, handleSelectQuestion, lstReport, data, itemSelect }) => {
    const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState)
    const [listPhoto, setListPhoto] = useState([])
    const [dataIssue, setDataIssue] = useState({ issueText: '', solutionText: '' })
    let listIssueType = data.listIssueType
    const [dataImage, setDataImage] = useState({ itemPhoto: [], indexPhoto: 0 })
    const [itemHashtag, setItemHashtag] = useState({ textHashtag: '' })
    const [_, setMutate] = useState(false)

    const loadData = async () => {
        const imageList = JSON.parse(itemSelect.itemIssue.imageIssues || '[]')
        dataIssue.issueText = itemSelect.itemIssue?.noteIssue || ''
        dataIssue.solutionText = itemSelect.itemIssue?.noteSolution || ''
        await setListPhoto(imageList)
    }

    useEffect(() => {
        if (itemSelect.type == 'EDIT') {
            loadData()
        }
        return () => false
    }, [])

    const handleShowImage = async (itemImage, indexImage) => {
        dataImage.itemPhoto = itemImage
        dataImage.indexPhoto = indexImage
        SheetManager.show('imageSheetModal')
    }
    const handleVisibleImage = async () => {
        // dataImage.isShowPhoto ? (dataImage.isShowPhoto = false) : null
        // await setVisibleModalPhoto(e => !e)
        SheetManager.hide('imageSheetModal')
    }

    const takePhoto = async () => {
        const photoinfo = {
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "reportId": kpiinfo.kpiId,
            "photoDate": workinfo.workDate,
            "photoTime": new Date().getTime(),
            "photoType": 'ISSUE_REPORT',
            "dataUpload": 0,
            "fileUpload": 0,
            "photoPath": null,
            "shopLat": null,
            "shopLong": null,
            "guid": guiIdItem,
            "photoFullTime": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await NativeCamera.cameraStart(photoinfo, countNumPhoto);
    }
    const uploadFilePhoto = async () => {
        const photoinfo = {
            shopId: workinfo.shopId,
            shopCode: workinfo.shopCode,
            reportId: kpiinfo.kpiId,
            photoDate: workinfo.workDate,
            photoTime: new Date().getTime(),
            fileUpload: 0,
            dataUpload: 0,
            photoPath: null,
            photoType: "ISSUE_REPORT",
            guid: guiIdItem,
            photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
        }
        await NativeCamera.imageGalleryLaunch(photoinfo, countNumPhoto);
    }
    const countNumPhoto = async () => {
        const dataPhoto = await getPhotosByGuiId(guiIdItem, workinfo.shopId)
        listPhoto.length !== dataPhoto.length ? await setListPhoto(dataPhoto) : []
        if (itemSelect.type == 'EDIT') {
            let editPhoto = [...listPhoto]
            dataPhoto?.forEach(element => {
                let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
                let fileName = '/uploaded/' + element.photoDate + '/' + ImgName
                let itemPhoto = listPhoto.find(it => it.photoPath == fileName || it.photoPath == element.photoPath)
                if (itemPhoto?.photoPath == undefined) {
                    editPhoto.push({ ...element, photoPath: element.photoPath });
                }
            })
            setListPhoto(editPhoto)
        } else {
            setListPhoto(dataPhoto)
        }
    }
    const handleDeletePhoto = async (itemPhoto) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        !itemPhoto.photoPath.includes('uploaded') && await deletePhoto(itemPhoto)
        const listAfterDelete = await listPhoto.filter(it => it.photoPath !== itemPhoto.photoPath)
        await setListPhoto(listAfterDelete)
    }
    const renderItemPhoto = ({ item, index }) => {
        const onSelectImage = () => {
            handleShowImage(item, index)

        }
        const onDeletePhoto = () => {
            handleDeletePhoto(item)
        }
        return (
            <TouchableOpacity key={index}
                onPress={() => onSelectImage()}
                style={{ width: deviceWidth / 3, height: deviceWidth / 3, borderRadius: 12, justifyContent: 'center', alignItems: "center" }}  >
                <Image source={{ uri: item.photoPath.includes('uploaded') ? (URLDEFAULT + item.photoPath) : (item.photoPath || '') }} style={{ width: '95%', height: '95%', borderRadius: 12, backgroundColor: appcolor.surface }} />
                <TouchableOpacity
                    style={{ width: 25, height: 25, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 8, right: 8, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onPress={() => onDeletePhoto()}>
                    <Icon color={appcolor.white} name='trash-alt' type='font-awesome-5' size={14} />
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }
    const onChangeText = (text, type) => {
        setDataIssue({ ...dataIssue, [type]: text })
    }
    const handleCreateIssue = () => {
        if (lstReport.limitPhoto !== undefined && lstReport.limitPhoto > 0 && listPhoto.length < lstReport.limitPhoto) {
            MessageInfo('Bạn chưa chụp đủ số hình cần thiết!')
            return
        }
        if (dataIssue.issueText?.length === 0 || dataIssue.issueText?.length === '' || dataIssue.issueText?.length === null) {
            MessageInfo('Bạn chưa nhập vấn đề cần giải quyết!')
            return
        }
        if (dataIssue.issueText?.length < 5) {
            MessageInfo('Vấn đề cần giải quyết phải tối thiểu 5 ký tự!')
            return
        }
        if (itemHashtag.textHashtag == '' || itemHashtag.textHashtag.length == 0) {
            MessageInfo('Bạn chưa chọn loại vấn đề!')
            return
        }
        if (lstReport.isNeedSolution == 1) {
            if (dataIssue.solutionText?.length === 0 || dataIssue.solutionText?.length === '' || dataIssue.solutionText?.length === null) {
                MessageInfo('Bạn chưa nhập giải pháp cho vấn đề đã đưa ra!')
                return
            }
            if (dataIssue.solutionText?.length < 5) {
                MessageInfo('Giải pháp nhập vào phải tối thiểu 5 ký tự!')
                return
            }
        }

        let jphoto = [];
        listPhoto?.forEach(element => {
            let ImgName = element.photoPath.substring(element.photoPath.lastIndexOf('/') + 1, element.photoPath.length);
            let fileName = '/uploaded/' + element.photoDate + '/' + ImgName
            jphoto.push({ ...element, photoPath: fileName });
        });

        const dataUpload = {
            shopId: workinfo.shopId,
            noteIssue: dataIssue.issueText,
            noteSolution: dataIssue.solutionText,
            guiid: guiIdItem,
            issueType: itemHashtag.textHashtag !== '' ? itemHashtag.textHashtag : null,
            issueStatus: 1,
            typeSend: itemSelect.type == 'EDIT' ? 'EDIT' : 'CREATE',
            reportDate: workinfo.workDate,
            imageIssues: JSON.stringify(jphoto || '[]'),
            isEditItem: 1
        }
        MessageAction(`Bạn chắc chắn muốn ${itemSelect.type == 'EDIT' ? 'sửa' : 'tạo'} vấn đề này?`, async () => {
            let isNetwork = await checkNetwork();
            if (!isNetwork) {
                MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                return
            }
            await IssueReportUpload([dataUpload], { ...workinfo, reportId: kpiinfo.id }, guiIdItem, async (result) => {
                if (result.statusId === 200) {
                    handleSelectQuestion(itemSelect.type == 'EDIT' ? 'CLOSEEDIT' : 'CLOSENEW', { ...dataUpload, imageIssues: JSON.stringify(listPhoto || '[]') })
                    ToastSuccess(`${itemSelect.type == 'EDIT' ? 'Sửa' : 'Tạo'} thành công!`, 'Thông báo', 'top')
                } else {
                    MessageInfo(`Xảy ra lỗi khi ${itemSelect.type == 'EDIT' ? 'Sửa' : 'Tạo'} vấn đề!` + result.messager, 'Lỗi', 'top')
                }
            })
        })
    }
    const onSelectItemSheet = (itemSelect) => {
        if (!itemHashtag.textHashtag?.includes(itemSelect.nameVN)) {
            (itemHashtag.textHashtag !== '' && itemHashtag.textHashtag !== 'null' && itemHashtag.textHashtag)
                ? itemHashtag.textHashtag += `, ${itemSelect.nameVN}`
                : itemHashtag.textHashtag = `${itemSelect.nameVN}`
            itemSelect.isCheck = true
        } else {
            if (itemHashtag.textHashtag?.includes(`, ${itemSelect.nameVN}`)) {
                itemHashtag.textHashtag = itemHashtag.textHashtag.replace(`, ${itemSelect.nameVN}`, '')
            } else if (itemHashtag.textHashtag?.includes(`${itemSelect.nameVN}, `)) {
                itemHashtag.textHashtag = itemHashtag.textHashtag.replace(`${itemSelect.nameVN}, `, '')
            } else {
                itemHashtag.textHashtag = itemHashtag.textHashtag.replace(`${itemSelect.nameVN}`, '')
            }
            itemSelect.isCheck = false
        }

        // updateDisplaySurvey(item)
        setMutate(e => !e)

    }

    return (
        <SafeAreaView style={{ backgroundColor: appcolor.light, borderTopStartRadius: 16, borderTopRightRadius: 16 }} >
            <View style={{ flexDirection: 'row', padding: 12 }}>
                <View style={{ width: '10%', justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => handleSelectQuestion('CLOSE', { guiid: guiIdItem })} style={{ height: 30, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name="arrow-left" type="font-awesome-5" size={20} color={appcolor.primary} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 5, width: '75%' }}>
                    <Text style={{ fontWeight: '600', fontSize: 18, color: appcolor.primary }}>Tạo vấn đề</Text>
                </View>
                <View style={{ width: '15%' }}>
                    <TouchableOpacity onPress={() => handleCreateIssue()}
                        style={{ height: 30, width: 50, backgroundColor: appcolor.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}
                    >
                        <Text style={{ fontWeight: '600', fontSize: 16, color: appcolor.white }}>{itemSelect.type == 'EDIT' ? 'Sửa' : 'Tạo'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{}}>
                <FormGroup
                    multiline={true} selectTextOnFocus={true}
                    containerStyle={{ backgroundColor: appcolor.light, width: '100%', minHeight: 60, padding: 3, borderRadius: 0, marginBottom: 0, borderWidth: 0.5, borderColor: appcolor.transparent, borderBottomColor: appcolor.grayLight }}
                    inputStyle={{ fontSize: 16, color: appcolor.dark, borderColor: appcolor.transparent, }}
                    placeholder='Vấn đề của bạn là gì?'
                    editable={true}
                    onClearTextAndroid={() => onChangeText('', 'issueText')}
                    handleChangeForm={(text) => onChangeText(text, 'issueText')}
                    defaultValue={dataIssue.issueText || ''}
                />
                <FormGroup
                    // iconName={'comment-alt'}
                    multiline={true} selectTextOnFocus={true}
                    containerStyle={{ backgroundColor: appcolor.light, width: '100%', minHeight: 60, padding: 3, marginBottom: 0, borderRadius: 0, borderColor: appcolor.transparent, borderWidth: 0.5, borderBottomColor: appcolor.grayLight }}
                    inputStyle={{ fontSize: 16, color: appcolor.dark, borderColor: appcolor.grayLight }}
                    placeholder='Đề xuất giải pháp xử lí'
                    editable={true}
                    onClearTextAndroid={() => onChangeText('', 'solutionText')}
                    handleChangeForm={(text) => onChangeText(text, 'solutionText')}
                    defaultValue={dataIssue.solutionText || ''}
                />
                <View style={{ flexDirection: 'row', padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => uploadFilePhoto()}
                        style={{ borderRadius: 5, padding: 5, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}
                    >
                        <Icon name="image" type="font-awesome-5" size={15} color={appcolor.primary} />
                        <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '300', paddingHorizontal: 10 }}>{'Ảnh'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => takePhoto()}
                        style={{ borderRadius: 5, padding: 5, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}
                    >
                        <Icon name="camera" type="font-awesome-5" size={15} color={appcolor.primary} />
                        <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '300', paddingHorizontal: 10 }}>{'Camera'}</Text>
                    </TouchableOpacity>


                </View>
                {
                    listIssueType?.length > 0 &&
                    <View
                        onPress={() => SheetManager.show('hashtagSheet')}
                        style={{ padding: 5, flexDirection: 'row', alignItems: "center" }}
                    >
                        <Text style={{ fontSize: 13, color: appcolor.dark, fontWeight: '300', paddingHorizontal: 10 }}>{'Loại vấn đề'}</Text>
                    </View>
                }
                {
                    listIssueType?.length > 0 &&
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View style={{ flexDirection: 'row', flexWrap: "wrap", }}>
                            {
                                listIssueType.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => onSelectItemSheet(item)}
                                            style={{
                                                padding: 4, borderRadius: 4, borderWidth: 0.6, borderColor: item.isCheck == true ? appcolor.primary : appcolor.grey, minWidth: 80, justifyContent: "center", alignItems: "center",
                                                backgroundColor: appcolor.light, margin: 5
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, color: item.isCheck == true ? appcolor.primary : appcolor.dark, fontWeight: '500' }}>{item.nameVN}</Text>
                                        </TouchableOpacity>
                                    )

                                })
                            }
                        </View>
                    </ScrollView>
                }
                <View style={{}}>
                    <FlatList
                        // numColumns={3}
                        data={listPhoto}
                        horizontal
                        renderItem={renderItemPhoto}
                    />
                </View>
            </View>
            <ActionSheet
                id='hashtagSheet'
                gestureEnabled={true}
            >
                <View style={{ height: deviceWidth / 1.4, width: deviceWidth }}>
                    <Text style={{ fontSize: 20, fontWeight: '500', color: appcolor.primary, padding: 8 }}>Danh sách hashtag</Text>
                    <View style={{ flexDirection: 'row', flexWrap: "wrap", }}>
                        {
                            listIssueType.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => onSelectItemSheet(item)}
                                        style={{
                                            padding: 12, borderRadius: 10, minWidth: 80, justifyContent: "center", alignItems: "center",
                                            backgroundColor: appcolor.light,
                                            borderColor: item.isCheck == true ? appcolor.primary : appcolor.grey, borderWidth: 1, margin: 5
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, color: item.isCheck == true ? appcolor.primary : appcolor.dark, fontWeight: '500' }}>{item.nameVN}</Text>
                                    </TouchableOpacity>
                                )

                            })
                        }
                    </View>
                </View>
            </ActionSheet>
            <ActionSheet
                id={'imageSheetModal'}
                containerStyle={{ height: deviceHeight, width: deviceWidth, backgroundColor: appcolor.light }}
            >
                <ViewImageSheet dataImage={dataImage} handleVisible={handleVisibleImage} />
            </ActionSheet>
        </SafeAreaView>
    )
}


