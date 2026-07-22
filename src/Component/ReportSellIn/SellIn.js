import React, { Fragment, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, RefreshControl, TouchableOpacity } from "react-native";
import { Badge } from '@rneui/themed';
import Icon from '@react-native-vector-icons/fontawesome6';
import CreateItemSellIn from "./CreateItemSellIn";
import { getDataSellIn, deleteItemSellIn, dataUploadSellIn, uploadSellIn } from '../../Controller/SellInController';
import { alertWarning, alertConfirm, alertNotify } from "../../Core/Utility";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { useSelector } from "react-redux";
import { scaleSize } from "../../Themes/AppsStyle";
import { formatNumber, ToastSuccess } from "../../Core/Helper";
import { checkLockReport } from "../../Controller/ShopController";
import moment from "moment";

const SellIn = ({ navigation }) => {
    const { appcolor, workinfo, kpiinfo, shopinfo } = useSelector(state => state.GAppState)
    const [data, setData] = useState([])
    const [visibleOption, setVisibleOption] = useState(false)
    const [isDelete, setDelete] = useState(0)
    const [isLockReport, setLockReport] = useState(false)

    const [isCreateView, setCreateView] = useState(false)
    const [itemSellIn, setItemSellIn] = useState()
    const [loading, setLoading] = useState(false)
    const [_, setMutate] = useState(false)
    const [status, setStatus] = useState(false)

    const loadData = async () => {
        await setLoading(true)
        const checkLock = await checkLockReport(shopinfo)
        await setLockReport(checkLock)
        let dataSellIn = await getDataSellIn(workinfo)
        let strgroup = ''
        dataSellIn?.forEach(a => {
            strgroup.includes(a.dealerId) ? a.groupName = null :
                a.groupName = a.dealerName
            strgroup = strgroup.concat(strgroup, a.dealerId, ";")
        });
        let day = parseInt(moment(new Date()).format('YYYYMMDD'))
        if (workinfo.workDate !== day) {
            await setStatus(true)
        }
        await setData(dataSellIn)
        await setLoading(false)
    }


    const uploadData = async () => {
        const dataUpload = await dataUploadSellIn(workinfo)
        if (dataUpload.length == 0) {
            alertWarning("Không có dữ liệu SellIn, Vui lòng thêm dữ liệu số bán trước khi gửi dữ liệu")
            return;
        }
        alertConfirm("Gửi báo cáo", "Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không?", async () => {
            await uploadSellIn({ ...workinfo, reportId: kpiinfo.kpiId }, dataUpload, async (message) => {
                ToastSuccess(message, 'Thông báo', 'top');
                await loadData()
            });
        })
    }
    const moveToCreateSellIn = async () => {
        await setItemSellIn()
        await setCreateView(true)
    }
    const resultEventCreate = async () => {
        await setCreateView(false)
        await loadData()
    }
    const handlerDeleteItem = async () => {
        let dataDelete = await data.filter(i => i.isChoose == 1)
        await setDelete(0)
        await dataDelete.forEach(e => {
            deleteItemSellIn(e.id)
        })
        await loadData()
    }
    const onPressDel = (index) => {
        if (visibleOption === false) {
            setVisibleOption(true)
            setDelete(1)
            data[index].isChoose = 1
            setMutate(e => !e)
        } else {
            setVisibleOption(false)
            setDelete(0)
            data.map(it => it.isChoose === 1 ? it.isChoose = 0 : '')
            setMutate(e => !e)
        }
    }
    const onSelectItemDel = (item, index) => {
        if (item.isChoose == 0) {
            setDelete(isDelete + 1)
        } else {
            setDelete(isDelete - 1)
        }
        data[index].isChoose = item.isChoose == 1 ? 0 : 1
        setMutate(e => !e)
    }

    const detailItemSellIn = async (item) => {
        await setItemSellIn(item)
        await setCreateView(true)
    }

    const openSellinDetail = () => {
        navigation.navigate('confirmsellin');
    }

    const renderItem = ({ item, index }) => {
        const totalRow = data.length
        const onPressItem = () => {
            if (item.isUploaded === 0) {
                onSelectItemDel(item, index)
            }
        }
        const detailItem = () => {
            detailItemSellIn(item)
        }
        const onLongPressItem = () => {
            if (item.isUploaded === 0) {
                onPressDel(index)
            }
        }
        return (
            <Fragment>
                {item.groupName !== null &&
                    < View style={{ padding: 8, flexDirection: 'row', alignItems: "center" }}>
                        <Icon name='tags' style={{ color: appcolor.primary }} />
                        <Text style={{ fontSize: scaleSize(16), fontWeight: 'bold', color: appcolor.primary, marginLeft: 5 }}>{item.groupName}</Text>
                    </View>
                }
                <TouchableOpacity onLongPress={onLongPressItem}
                    onPress={visibleOption ? onPressItem : detailItem} >
                    <View style={{
                        flexDirection: 'row', alignSelf: 'center', borderRadius: 5,
                        backgroundColor: appcolor.grayLight, marginHorizontal: 10, marginBottom: 7
                    }}>
                        <View style={styles.itemStyle} key={index}>

                            <RenderItemText type="OrderNo" titleName="Số hóa đơn: " itemValue={item.orderNo} appcolor={appcolor} />
                            <RenderItemText type="Info"
                                titleName="Sản phẩm: "
                                itemValue={`${item.competitorName ? item.competitorName + (item.categoryName ? ' / ' : '') : ''}${item.categoryName ? (item.categoryName + (item.productName ? ' / ' : '')) : ''}${item.productName ? item.productName : ''}`}
                                appcolor={appcolor} />
                            {item.priceNPP > 0 && <RenderItemText type="PriceNPP" titleName="Giá nhà phân phối : " itemValue={`${item.priceNPP}`} appcolor={appcolor} />}
                            {item.priceValue > 0 && <RenderItemText type="Price" titleName="Giá sản phẩm : " itemValue={`${item.priceValue}`} appcolor={appcolor} />}
                        </View>
                        {item.isChoose === 0 ?
                            <Badge
                                containerStyle={{ alignSelf: 'center', marginRight: 10, }}
                                status={appcolor.red}
                                textStyle={{ fontSize: 15, fontWeight: '500', color: appcolor.dark }}
                                badgeStyle={{ backgroundColor: item.isUploaded === 1 ? appcolor.success : appcolor.yellowdark, height: 38, width: 38, borderRadius: 20 }}
                                value={item.quantityValue} />
                            :
                            <View style={{
                                backgroundColor: appcolor.danger, borderRadius: 20, marginRight: 10,
                                alignSelf: 'center', justifyContent: 'center', height: 38, width: 38
                            }}>
                                <Icon name='check' style={{ textAlign: 'center' }}
                                    color={appcolor.white} size={18} />
                            </View>
                        }
                    </View>
                </TouchableOpacity >
                {
                    index === totalRow - 1 && index > 6 && <View>
                        <Text style={{ width: '100%', textAlign: 'center', color: appcolor.dark, padding: 8 }}>{'Đã xem hết'}</Text>
                    </View>
                }
            </Fragment>
        )
    }
    useEffect(() => {
        loadData()
        return () => loading
    }, [])

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        buttonContainer: { borderRadius: 10, position: 'absolute', top: 0, right: 0, width: '30%' },
        btnDeleteStyle: { position: 'absolute', top: 5, start: 12, width: '30%' },
        contentStyles: { width: '100%', height: '100%', backgroundColor: appcolor.info },
        itemStyle: { alignSelf: 'center', width: '90%', height: 'auto', borderRadius: 8, margin: 3, padding: 5, backgroundColor: appcolor.surface },
        badgeStyle: { textAlign: 'center', fontSize: 15, fontWeight: "600", color: appcolor.dark }
    })
    return (
        !isCreateView ?
            <View style={styles.mainContainer}>
                <HeaderCustom
                    title={visibleOption === true ? `Đã chọn (${isDelete})` : kpiinfo.menuName}
                    leftFunc={() => visibleOption === true ? onPressDel(null) : navigation.goBack()}
                    iconLeft={visibleOption === true ? 'times' : 'chevron-left'}
                    middleFunc={!isLockReport && moveToCreateSellIn}
                    iconMiddle="plus"
                    iconRight={!isLockReport ? (status ? null : (visibleOption === true ? 'trash' : 'cloud-upload-alt')) : 'user-lock'}
                    rightFunc={!isLockReport ? (status ? null : (visibleOption === true ? handlerDeleteItem : uploadData)) : () => { ToastSuccess('Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo') }}
                />
                <View style={{ flex: 1, backgroundColor: appcolor.light, padding: 7, marginBottom: 10 }}>

                    <FlatList
                        style={{ width: '100%', padding: 8 }}
                        key='dataSellIn'
                        keyExtractor={(_, index) => index.toString()}
                        data={data}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl
                                progressBackgroundColor={appcolor.warning}
                                colors={[appcolor.info, appcolor.danger, appcolor.warning]}
                                titleColor={appcolor.black}
                                tintColor={appcolor.black}
                                refreshing={loading}
                                title="Đang tải dữ liệu"
                                onRefresh={loadData} />
                        }
                    />

                    <TouchableOpacity
                        onPress={() => openSellinDetail()}
                        style={{ position: 'absolute', right: 20, bottom: 40, height: 45, width: 45, padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 50, borderWidth: 2, borderColor: appcolor.primary }}
                    >
                        <Icon
                            size={28}
                            color={appcolor.primary}
                            name='clipboard-list'
                            type='font-awesome-5'
                        />
                    </TouchableOpacity>

                </View>
            </View >
            :
            <CreateItemSellIn resultEvent={resultEventCreate} dataWork={workinfo} itemSellIn={itemSellIn} />
    )
}
const RenderItemText = ({ type, titleName, itemValue, appcolor }) => {
    const colorItem = type == 'OrderNo' ? appcolor.danger : appcolor.dark
    return (
        <View style={{ width: '100%', height: 'auto' }}>
            <View style={{ width: '90%', padding: 3 }}>
                {type == "OrderNo" && <Text style={{ width: '100%', fontSize: 15, fontWeight: "700", color: colorItem }}>{titleName}{itemValue}</Text>}
                {type == "Info" && <Text style={{ width: '100%', fontSize: scaleSize(12), fontStyle: 'italic', color: colorItem }}>{titleName}{itemValue}</Text>}
                {type == "PriceNPP" && <Text style={{ width: '100%', fontSize: scaleSize(12), fontStyle: 'italic', color: colorItem }}>{titleName}{formatNumber(itemValue, ',')}</Text>}
                {type == "Price" && <Text style={{ width: '100%', fontSize: scaleSize(12), fontStyle: 'italic', color: colorItem }}>{titleName}{formatNumber(itemValue, ',')}</Text>}
            </View>
        </View>
    )
}
export default SellIn;