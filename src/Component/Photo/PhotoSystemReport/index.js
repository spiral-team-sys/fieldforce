
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { REPORT } from "../../../API/ReportAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { ViewListImage } from "./Page/ViewListImage";
import ActionSheet, { ScrollView, SheetManager } from "react-native-actions-sheet";
import { YearMonthSelected } from "../../../Control/YearMonthSelected";
import { FloatActionButton } from "./Control/FloatActionButton"
import { deviceHeight, deviceWidth } from "../../Home";
import RNFS from 'react-native-fs'

const DATE = new Date()

export const PhotoSystemReport = ({ navigation, route }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState({ dataConfig: {}, dataView: [], dataMain: [] })
    const [_mutate, setMutate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [configFilter, setConfigFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const [newConfigFilter, setNewConfigFilter] = useState({ "year": DATE.getFullYear(), "yearname": `Năm ${DATE.getFullYear()}`, "month": DATE.getMonth() + 1, "monthname": `Tháng ${DATE.getMonth() + 1}` })
    const [menu, _setMenu] = useState({ isOpenCamera: false, isOpen: false, type: null, title: null })
    const [isShowMenu, setShowMenu] = useState(true)


    const loadData = async () => {
        !loading && await setLoading(true)
        const dataFilter = { shopId: 0, reportId: kpiinfo.id, month: configFilter.month, year: configFilter.year }
        await REPORT.GetDataConfigReport(dataFilter, async (mData) => {
            const _item = mData[0] || {}
            let dataView = JSON.parse(_item.dataView || '[]')
            data.dataConfig = JSON.parse(_item?.dataConfig || '{}')
            data.dataMain = [...dataView]
            dataView[0].isChooseTag = 1
            data.dataView = [...dataView]
            await setMutate(e => !e)
        })
        await setLoading(true)
    }

    useEffect(() => {
        let isMounted = true;
        // thực hiện tác vụ bất đồng bộ
        if (isMounted) {
            loadData();
        }
        return () => {
            isMounted = false;
        };
    }, [])

    const filterPhoto = async (text, type) => {
        if (isLongPress && type !== 'task') {
            await handleCloseSelect()
        }
        if (text) {

            const dataFilter = []
            data.groupPhotoF.map(it => {
                const newDataShow = it.dataGroup.filter(item => {
                    const nameFilter = item[itemSortFeild.sortFeild === 'shopId' ? 'photoDate' : 'shopName'] ? item[itemSortFeild.sortFeild === 'shopId' ? 'photoDate' : 'shopName'].toString().toUpperCase() : ''.toUpperCase()
                    const textSearch = text.toUpperCase()
                    return nameFilter.indexOf(textSearch) > -1
                })
                dataFilter.push({ ...it, dataGroup: newDataShow })
            })
            data.groupPhoto = dataFilter
            // setArrDataShow(newDataShow)
            setSearch(text)
        } else {
            data.groupPhoto = data.groupPhotoF
            // setArrDataShow(arrDataShowF)
            // setDone(false)
            setSearch(text)
        }
    }

    const onSelectYear = (searchInfo) => {
        setNewConfigFilter({ ...newConfigFilter, ...searchInfo })
    }
    const handleAcceptFilter = async () => {
        configFilter.year = newConfigFilter.year
        configFilter.yearname = newConfigFilter.yearname
        configFilter.month = newConfigFilter.month
        configFilter.monthname = newConfigFilter.monthname
        await loadData()
        SheetManager.hide('sheetFitlerDataPhoto')
    }

    const onActionMenuFAB = async () => {
        menu.isOpen = !menu.isOpen
        setMutate(e => !e)
    }
    const handlerChangeFAB = async (type) => {
        switch (type) {
            case "SORT":
                // navigation.navigate('qrcode', { onSuccess: onGetInformation })
                break;
            case "SEARCH":
                SheetManager.show('sheetFitlerDataPhoto')
                break;
        }
        onActionMenuFAB()
    }

    const handleCloseSheet = () => {
        setNewConfigFilter({ ...configFilter })
    }
    const handleShowMenu = () => {
        setShowMenu(e => !e)
    }

    const handleGoBack = async () => {
        const extension = (Platform.OS === 'android') ? 'file://' : ''
        const path = `${extension}${RNFS.CachesDirectoryPath}/`;
        try {
            const files = await RNFS.readDir(path);
            // Lọc các file hình ảnh
            const imageFiles = files.filter(file =>
                file.isFile() && /\.(jpg|jpeg|png|gif)$/.test(file.name)
            );
            // Xoá từng file hình ảnh
            const deletePromises = imageFiles.map(file => RNFS.unlink(file.path));
            await Promise.all(deletePromises);
            console.log(imageFiles, 'imageFiles');
            navigation.goBack()
        } catch (error) {
            navigation.goBack()
        }

    }

    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                leftFunc={() => handleGoBack()}
                iconRight={"sort"}
                title={kpiinfo?.menuNameVN || "Danh sách hình ảnh báo cáo"}
                rightFunc={() => SheetManager.show("sheetSearch")}
            />
            <View style={{ flex: 1, padding: 4, backgroundColor: appcolor.light }}>
                {
                    data.dataMain?.length > 0 &&
                    <ViewListImage navigation={navigation} data={data} handleShowMenu={handleShowMenu} />
                }
                {menu.isOpen && <View style={{ position: 'absolute', width: deviceWidth, height: deviceHeight, top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <TouchableOpacity onPress={() => onActionMenuFAB()} style={{ flex: 1 }} />
                </View>}
                {isShowMenu && <FloatActionButton
                    info={menu}
                    showMenu={onActionMenuFAB}
                    handlerChange={handlerChangeFAB}
                />}
                <ActionSheet
                    onClose={() => handleCloseSheet()}
                    containerStyle={{ backgroundColor: appcolor.light }}
                    id="sheetFitlerDataPhoto"
                >
                    <ScrollView>
                        <View style={{}}>
                            <YearMonthSelected option={newConfigFilter} onYearMonth={(search) => onSelectYear(search)} numMonth={4} />
                            <TouchableOpacity onPress={() => handleAcceptFilter()} style={{ borderTopColor: appcolor.surface, borderTopWidth: 1, alignItems: 'center' }}>
                                <Text style={{ color: appcolor.primary, padding: 7, marginBottom: 12 }}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </ActionSheet>

            </View>
        </View>
    )
}

