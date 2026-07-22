import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Text, StyleSheet, View, TextInput, Modal, TouchableOpacity } from 'react-native';
import PageHeader from '../Content/PageHeader';
import { FlatList } from 'react-native';
import { getListMarketPrice, dataTabMarketPrice, updateItemPrice, getListUpload_MarketPrice, uploadMarketPrice, dataCompetitorMarketPrice, checkDataUpload, getHistoryMarketPrice } from '../Controller/ReportController';
// import ScrollableTabView, { ScrollableTabBar } from "react-native-scrollable-tab-view"
import { DEFAULT_COLOR, _competitorId } from '../Core/URLs';
////import { NumericFormat } from "react-number-format";;
import Icon from 'react-native-vector-icons/FontAwesome5'
import moment from 'moment';
import { SearchBar, CheckBox, Divider } from '@rneui/themed';
import { alertWarning, alertNotify, alertConfirm, checkNetwork, ConvertToInt, minWidthTab, deviceWidth } from '../Core/Utility';
import { useSelector } from 'react-redux';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'

const delay = ms => new Promise(res => setTimeout(res, ms));
const PRICE_VALUE = 1
const NET_VALUE = 2
const FSM_VALUE = 3
const MarketPriceReport = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [mWork, setWork] = useState({})
    const [filterVisible, setVisibleFilter] = useState(false)
    const [isOldDay, setIsOldDay] = useState(false)
    const [isUpload, setIsUpload] = useState(false)
    const [isCheckViewInput, setCheckViewInput] = useState(false)
    const [searchValue, _] = useState(null)
    const [dataTabView, setDataTab] = useState([])
    const [mData, setData] = useState([])
    const [mDataMain, setDataMain] = useState([])
    const [dataCompetitor, setDataCompetitor] = useState([])
    const [__, setMutate] = useState(false)

    const LoadData = async () => {
        await setWork(route?.params?.workinfo)
        await getHistoryMarketPrice(route?.params?.workinfo.shopId)
        const lstData = await getListByCompetitor(_competitorId)
        const lstTabList = await dataTabMarketPrice()
        const lstCompetitor = await dataCompetitorMarketPrice()
        await setIsUpload(lstData[0].isUploaded)
        await setData(lstData)
        await setDataMain(lstData)
        await setDataTab(lstTabList)
        await setDataCompetitor(lstCompetitor.map(i => i.competitorId === _competitorId ? { ...i, isSelect: 1 } : i))
        await setIsOldDay(ConvertToInt(moment(new Date()).format('YYYYMMDD').toString()) !== route?.params?.workinfo.workDate ? true : false)
    }
    const getListByCompetitor = async (competitorId) => {
        const lstData = await getListMarketPrice(route.params.workinfo, competitorId);
        let subCategoryId = 0;
        await lstData.map((item, index) => {
            if (item.subCatId === subCategoryId) {
                subCategoryId = item.subCatId;
                lstData[index].groupName = null;
            } else {
                subCategoryId = item.subCatId;
                lstData[index].groupName = item.subCategory;
            }
        });
        return lstData;
    }
    const UploadData = async () => {
        const checkData = await checkDataUpload(mWork.workId)
        if (checkData !== null && checkData.length > 0) {
            alertWarning(checkData)
        } else {
            const lstUpload = await getListUpload_MarketPrice(mWork);
            if (lstUpload.length > 0) {
                let isNetwork = await checkNetwork();
                if (!isNetwork) {
                    alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                    return
                }
                alertConfirm("Chú ý", "Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?",
                    async () => {
                        await uploadMarketPrice(mWork.workId, JSON.stringify(lstUpload), async (message) => {
                            alertNotify(message)
                            await LoadData()
                        });

                    })
            } else {
                alertWarning("Vui lòng hoàn thành đầy đủ dữ liệu báo cáo trước khi gửi lên hệ thống")
            }
        }
    }
    const saveItem = async (item, value, type) => {
        let mPrice = value !== null && value.length > 0 ? value.toString().replace(/,/g, '') : 'null'
        let itemInsert = {}
        switch (type) {
            case PRICE_VALUE:
                itemInsert = {
                    workId: mWork.workId,
                    productId: item.productId,
                    priceValue: mPrice,
                    netValue: item.netValue,
                    fsmValue: item.fsmValue
                }
                mData[item.indexMain].priceValue = mPrice
                mDataMain[item.indexMain].priceValue = mPrice
                break;
            case NET_VALUE:
                itemInsert = {
                    workId: mWork.workId,
                    productId: item.productId,
                    priceValue: item.priceValue,
                    netValue: mPrice,
                    fsmValue: item.fsmValue
                }
                mData[item.indexMain].netValue = mPrice
                mDataMain[item.indexMain].netValue = mPrice
                break;
            case FSM_VALUE:
                itemInsert = {
                    workId: mWork.workId,
                    productId: item.productId,
                    priceValue: item.priceValue,
                    netValue: item.netValue,
                    fsmValue: mPrice
                }
                mData[item.indexMain].fsmValue = mPrice
                mDataMain[item.indexMain].fsmValue = mPrice
                break;
        }
        setMutate(e => !e)
        await updateItemPrice(item.id, itemInsert)
    }
    const filterProduct = async (str) => {
        let ROW_NUMBER = 0
        let mDataFilter = [];
        if (str !== null && str !== undefined && str.length > 0) {
            mDataFilter = mDataMain.filter(i => i.productName.toLowerCase().match(str.toLowerCase()))
        } else {
            mDataFilter = mDataMain;
        }
        await mDataFilter.forEach(i => {
            i.indexMain = ROW_NUMBER
            ROW_NUMBER++
        })
        await setData(mDataFilter)
    }
    const viewItemInput = async () => {
        if (!isCheckViewInput) {
            let ROW_NUMBER = 0
            let dataChange = await mDataMain.filter(i => i.priceValue > 0 || i.netValue > 0 || i.fsmValue > 0)
            dataChange.forEach(i => {
                i.indexMain = ROW_NUMBER
                ROW_NUMBER++
            })
            await setData(dataChange)
        } else {
            let ROW_NUMBER = 0
            let dataChange = mDataMain
            dataChange.forEach(i => {
                i.indexMain = ROW_NUMBER
                ROW_NUMBER++
            })
            await setData(dataChange)
        }
        await setCheckViewInput(!isCheckViewInput);
    }
    const competitorSelected = async (item) => {
        let productFilter = []
        const selected = item.isSelect === 0 ? 1 : 0
        let dataFilter = dataCompetitor.map(i => i.competitorId === item.competitorId ? { ...i, isSelect: selected } : { ...i, isSelect: 0 })

        if (selected == 1) {
            productFilter = await getListByCompetitor(item.competitorId);
        } else {
            productFilter = await getListByCompetitor(_competitorId);
        }
        await setData(productFilter)
        await setDataMain(productFilter)
        await setDataCompetitor(dataFilter)
        await setCheckViewInput(false)
        setVisibleFilter(false)

        await delay(500)
    }
    useEffect(() => {
        LoadData();
    }, [])
    const styles = StyleSheet.create({
        viewHeaderTab: { backgroundColor: '#004d40', width: '100%', height: '5%' },
        viewProduct: { backgroundColor: 'white', borderRadius: 5, margin: 5, padding: 5 },
        titleSubCategory: { color: DEFAULT_COLOR, fontSize: 16, fontWeight: '700' },
        titleProduct: { fontWeight: '500', color: 'black', fontSize: 14, padding: 8 },
        viewInputPrice: { width: '100%', flexDirection: 'row', justifyContent: "center" },
        inputNumber: { backgroundColor: appcolor.greylight, width: '100%', borderBottomWidth: 1, borderBottomColor: 'black', padding: 5, textAlign: 'center' },
        ViewInput: { width: '30%', margin: 5 },
        styleModal: { flex: 1, backgroundColor: appcolor.white, padding: 16, paddingTop: 50, overflow: 'hidden' },
        modalHeader: { padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
    })
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1 }}>
                {item.groupName !== null &&
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name='tags' style={{ padding: 8 }} />
                        <Text style={styles.titleSubCategory}>{item.groupName}</Text>
                    </View>
                }
                <View style={styles.viewProduct}>
                    <Text style={styles.titleProduct}>{(index + 1) + ". " + item.productName}</Text>
                    <View style={styles.viewInputPrice}>
                        <RenderInputNumber type={PRICE_VALUE} styles={styles} itemInput={item} valueInput={item.priceValue} placeholder={"Niêm yết"} editable={isOldDay ? false : !isUpload} onChangeText={saveItem} />
                        <RenderInputNumber type={NET_VALUE} styles={styles} itemInput={item} valueInput={item.netValue} placeholder={"Net"} editable={isOldDay ? false : !isUpload} onChangeText={saveItem} />
                        <RenderInputNumber type={FSM_VALUE} styles={styles} itemInput={item} valueInput={item.fsmValue} placeholder={"FSM Incentive"} editable={isOldDay ? false : !isUpload} onChangeText={saveItem} />
                    </View>
                </View>
            </View>
        )
    }
    const renderTabView = () => {
        let dataByCategoryId = []
        return (
            dataTabView.map(tab => {
                dataByCategoryId = mData.filter(i => i.categoryId === tab.tabId)
                return (
                    dataByCategoryId.length > 0 ?
                        <Tabs.Tab key={tab.tabName} label={tab.tabName} name={tab.tabName} >
                            <View style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                                {/* <View style={{ flex: 1, flexDirection: 'column' }} tabLabel={tab.tabName}> */}
                                <KeyboardAvoidingView
                                    style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                                    behavior={Platform.OS == "ios" ? "padding" : null}
                                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} >
                                    <FlatList
                                        scrollEnabled
                                        style={{ flex: 1, padding: 5, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}
                                        keyExtractor={(_, index) => index.toString()}
                                        data={dataByCategoryId}
                                        renderItem={renderItem}
                                    />
                                </KeyboardAvoidingView>
                                {/* </View> */}
                            </View>
                        </Tabs.Tab>
                        : null
                )
            })
        )
    }
    const renderItemCompetitor = ({ item, index }) => {
        return (
            <View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', borderBottomWidth: 0.5, borderBottomColor: '#e3e3e3' }}>
                <TouchableOpacity style={{ width: '90%', padding: 5 }} onPress={() => competitorSelected(item)} >
                    <Text h4 style={{ color: appcolor.black, fontWeight: '500', fontSize: 16, padding: 5 }}>{(index + 1) + ". " + item.competitorName}</Text>
                </TouchableOpacity>
                <Icon style={{ padding: 13, textAlignVertical: 'center' }} name={item.isSelect == 1 ? 'check' : ''} size={15} color={appcolor.black} />
            </View>
        )
    }
    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }} >
            <PageHeader
                Title={route?.params?.itemMenu?.name} leftclick={() => navigation.goBack()} rightclick={isOldDay ? null : !isUpload ? UploadData : null}
                righticon={isOldDay ? '' : !isUpload ? 'cloud-upload-alt' : 'check'} />
            <View style={{ backgroundColor: appcolor.black, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <SearchBar
                    containerStyle={{ width: '90%', borderTopColor: appcolor.transparent, backgroundColor: appcolor.transparent, borderBottomColor: appcolor.transparent }}
                    inputContainerStyle={{ backgroundColor: '#e2e2e2', height: 35 }}
                    inputStyle={{ fontSize: 14, color: 'black' }}
                    placeholder='Tìm kiếm sản phẩm' lightTheme round clearIcon
                    value={searchValue} onChangeText={filterProduct}
                />
                <TouchableOpacity style={{ width: '10%' }} onPress={() => setVisibleFilter(true)} >
                    <Icon style={{ textAlign: 'center' }} name='filter' solid size={21} color={appcolor.greylight} />
                </TouchableOpacity>
            </View>
            <Tabs.Container
                renderTabBar={props => (
                    <MaterialTabBar
                        {...props}
                        labelStyle={{ fontSize: 14, fontWeight: '600' }}
                        indicatorStyle={{ backgroundColor: appcolor.primary }}
                        inactiveColor={appcolor.dark}
                        activeColor={appcolor.dark}
                        scrollEnabled={true}
                        style={{ backgroundColor: appcolor.light }}
                        tabStyle={{ minWidth: minWidthTab(dataTabView), height: 36 }}
                    />
                )}>
                {renderTabView()}
            </Tabs.Container>
            {/* <ScrollableTabView
                initialPage={0}
                tabBarBackgroundColor={appcolor.black}
                tabBarTextStyle={{ fontSize: 15, color: 'white' }}
                tabBarUnderlineStyle={{ height: 2, backgroundColor: 'white' }}
                renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}>
                {renderTabView()}
            </ScrollableTabView> */}
            <Modal animationType='slide' visible={filterVisible} >
                <View style={styles.styleModal}>
                    <View style={styles.modalHeader}>
                        <Text h4 style={{ color: DEFAULT_COLOR, fontWeight: 'bold', fontSize: 20 }}> Tìm kiếm sản phẩm </Text>
                        <TouchableOpacity style={{ padding: 16 }} onPress={() => setVisibleFilter(false)}>
                            <Icon name="times" size={25} color={appcolor.grey} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <CheckBox
                            title='Sản phẩm đã nhập thông tin'
                            containerStyle={{ padding: 0, margin: 0, backgroundColor: appcolor.transparent, borderColor: appcolor.transparent }}
                            textStyle={{ fontSize: 14, color: appcolor.black }}
                            checked={isCheckViewInput}
                            onPress={viewItemInput}
                        />
                        <View style={{ borderColor: appcolor.surface, borderWidth: 1, width: '100%', marginVertical: 8 }} />
                        <Text h4 style={{ color: appcolor.black, fontWeight: 'bold', fontSize: 18, padding: 5 }}>Hãng</Text>
                        <FlatList
                            data={dataCompetitor}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderItemCompetitor}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
}
const RenderInputNumber = ({ styles, valueInput, itemInput, placeholder, type, onChangeText, editable }) => {
    const onChange = async (item, text, type) => {
        await onChangeText(item, text, type)
    }
    return (
        <View style={styles.ViewInput} >
            <NumericFormat
                value={valueInput} displayType='text' thousandSeparator={true} allowedDecimalSeparators={['.', ',']} maxLength={50}
                renderText={values => <TextInput
                    value={values}
                    editable={editable}
                    keyboardType='numeric' backgroundColor='white'
                    onChangeText={text => onChange(itemInput, text, type)}
                    style={styles.inputNumber}
                    placeholder={type == FSM_VALUE ? 'Tiền thưởng' : 'Giá'} />}
            />
            <Text style={{ textAlign: 'center', color: '#424242', fontSize: 13, marginTop: 5 }} >{placeholder}</Text>
        </View>
    )
}
export default MarketPriceReport;