import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TextInput, FlatList, Keyboard, KeyboardAvoidingView } from "react-native";
import { getUploadDisplayCompetitorResult, getStatusCompetitorResult, uploadDataDisplayCompe } from '../../../Controller/WorkController'
import { checkNetwork, ConvertToInt } from "../../../Core/Utility";
import { groupDataByKey, Message, ToastError } from '../../../Core/Helper';
import { _competitorId } from '../../../Core/URLs';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
// import NumberFormat from "react-number-format";
import { getListByCompetitorMD, updateDisplayCompetitor } from '../../../Controller/DisplayController'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
import { PhotoItems } from '../../EPSON/PhotoItems';
import { deviceWidth } from '../../Home';

const DisplayCompetitorReport_MD = ({ navigation, route }) => {
    const { appcolor, workinfo, kpiinfo, userinfo } = useSelector(state => state.GAppState);
    const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
    const [reload, setReload] = useState(false)
    const [Status, setStatus] = useState(false);
    const [lstShow, setLstShow] = useState();
    const [_, setMutate] = useState(false);

    const loadDataShow = async () => {
        let lstRes = await getStatusCompetitorResult(workinfo);
        let isUpload = lstRes.length > 0 ? lstRes[0].upload : 0
        await setStatus(isUpload)

        await setLstShow([])
        let dataCompetitor = await getListByCompetitorMD(workinfo);
        const { arr } = await groupDataByKey({
            arr: dataCompetitor,
            key: 'divisionId',
            keyLayer2: 'categoryName'
        })
        await setLstShow(arr)
    }

    useEffect(() => {
        loadDataShow();
        return () => false;
    }, [reload])


    const uploadAction = async () => {
        Keyboard.dismiss();
        let competitorRes = await getUploadDisplayCompetitorResult(workinfo);
        let lstDataUpload = competitorRes.filter(it => it.quantity === null)

        // console.log('up: ', itemsUpload)
        if (lstDataUpload.length > 0) {
            ToastError('Vui lòng làm hết báo cáo, trước khi gửi.');
            return;
        }
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(competitorRes));
    }

    const UploadData = async (competitorRes) => {
        const work = { ...workinfo, reportId: kpiinfo.kpiId };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        await uploadDataDisplayCompe(competitorRes, work, async () => {
            await setReload(e => !e)
        }, async () => {
        })
    }

    const onChangeTextValue = async (item, index, text) => {
        let mPrice = 0
        if (text == '') {
            mPrice = null
        } else {
            let value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : null
            mPrice = (value === '' || value === null) ? null : parseInt(value);
        }
        lstShow[index].quantity = mPrice
        await setMutate(e => !e)
        await updateDisplayCompetitor(item, workinfo);
    }

    const sumQuantityByCate = (competitorId) => {
        let totalItem = 0;
        lstShow.map(i => {
            i.divisionId == competitorId ? (totalItem += (ConvertToInt(i.quantity) || 0)) : 0
        })
        return totalItem;
    }

    const renderItem = ({ item, index }) => {
        const totalRow = lstShow.length || 0
        const totalByCate = sumQuantityByCate(item.divisionId)
        const keyLayer2 = item[`${item.divisionId}${item.categoryName}`]
        const changeTextItem = async (text) => {
            await onChangeTextValue(item, index, text)
        }
        return (
            <View key={index} style={{ flex: 1 }}>
                {item.isParent &&
                    <Text style={{ padding: 8, color: appcolor.primary, fontSize: 15, fontWeight: '700', backgroundColor: appcolor.surface }}>
                        {item.division} - Total: {totalByCate}
                    </Text>
                }
                {keyLayer2 &&
                    <View style={{ flex: 1, padding: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.grayLight, }}>
                        <Icon name='tags' style={{ color: appcolor.primary }} />
                        <Text style={{ color: appcolor.dark, fontSize: 14, paddingLeft: 8, fontWeight: '600' }}>{item?.categoryName}</Text>
                    </View>
                }
                <View style={{ flex: 1, backgroundColor: appcolor.light, flexDirection: 'row', padding: 5 }}>
                    <Text style={{ flex: 1, padding: 8, color: appcolor.dark, fontSize: 14, fontWeight: '600' }}>
                        {item.subCategory}
                    </Text>
                    <NumberFormat
                        value={item.quantity === 0 ? 0 : (item.quantity || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={{
                                    fontSize: 12, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500',
                                    width: '25%', textAlign: 'center', borderWidth: 0.5, borderRadius: 7, borderColor: appcolor.greydark, height: 35
                                }}
                                keyboardType='numeric'
                                placeholder='Số lượng'
                                placeholderTextColor={appcolor.greydark}
                                editable={item.upload === 1 ? false : true} selectTextOnFocus={item.upload === 1 ? false : true}
                                onChangeText={changeTextItem}
                            >
                            </TextInput>
                        }
                    />
                </View>
                {
                    index === totalRow - 1 && index > 8 && <View>
                        <Text style={{ width: '100%', textAlign: 'center', color: appcolor.primary, padding: 8, paddingBottom: 10 }}>{'Đã xem hết'}</Text>
                    </View>
                }
            </View>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.light }}>
            <HeaderCustom
                title={kpiinfo.menuNameVN}
                iconRight='cloud-upload-alt'
                rightFunc={Status === 0 ? () => uploadAction() : null}
                leftFunc={() => navigation.goBack()}
            />
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS == "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                <Tabs.Container
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            inactiveColor={appcolor.light}
                            activeColor={appcolor.light}
                            indicatorStyle={{ backgroundColor: appcolor.light }}
                            tabStyle={{ minWidth: deviceWidth / 2, height: 42 }}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.primary, bottom: 0 }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}>
                    <Tabs.Tab key={1} label={"Nhập liệu"} name={"Nhập liệu"} >
                        <View key={"Nhập liệu"} style={{ backgroundColor: appcolor.light, marginTop: 40, width: deviceWidth }}>
                            {/* <View tabLabel="Nhập liệu" style={{ flex: 1, margin: 5, marginTop: 5, backgroundColor: appcolor.light, }}> */}
                            <FlatList
                                keyExtractor={(_, index) => index.toString()}
                                data={lstShow}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={<View style={{ height: deviceWidth / 2 }} />}
                                nestedScrollEnabled={true}
                            />
                        </View>
                    </Tabs.Tab>
                    <Tabs.Tab key={2} label={"Hình ảnh"} name={"Hình ảnh"} >
                        <View key={"Hình ảnh"} style={{ backgroundColor: appcolor.light, marginTop: 40, padding: 6, width: deviceWidth }}>
                            {Status == 0 ?
                                <PhotoItems
                                    usedHeader={false} navigation={navigation}
                                    route={{ params: { Photos: reportItem.ImageByList || [], Status: Status } }} />
                                :
                                <View>
                                    <PhotoItems
                                        usedHeader={false} navigation={navigation}
                                        route={{ params: { Photos: reportItem.ImageByList || [], Status: Status } }} />
                                </View>
                            }
                        </View>
                    </Tabs.Tab>
                </Tabs.Container>
            </KeyboardAvoidingView>
        </View>
    )
}

export default DisplayCompetitorReport_MD;
