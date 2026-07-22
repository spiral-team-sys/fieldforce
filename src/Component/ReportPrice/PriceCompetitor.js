import React, { useState, useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, Text, StyleSheet, View, TextInput, TouchableOpacity, ScrollView, } from "react-native";
import { FlatList } from "react-native";
import { updateItemPrice, getListUpload_MarketPrice, uploadMarketPrice, GetOnlyCompetitor, getHistoryMarketPrice, getListPriceCompetitor, dataCompetitorMarketPrice, } from "../../Controller/PriceController";
import { _competitorId } from "../../Core/URLs";
////import { NumericFormat } from "react-number-format";;
import Icon from '@react-native-vector-icons/fontawesome6';
import moment from "moment";
import { alertWarning, alertNotify, alertConfirm, checkNetwork, ConvertToInt, minWidthTab, } from "../../Core/Utility";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { groupDataByKey, ToastError } from "../../Core/Helper";
import ActionSheet from "react-native-actions-sheet";
import { scaleSize } from "../../Themes/AppsStyle";
import { Tabs, MaterialTabBar } from "react-native-collapsible-tab-view";
import { deviceHeight, deviceWidth } from "../Home";
import FormGroup from "../../Content/FormGroup";
import { debounce } from "lodash";
import { LoadingView } from "../../Control/ItemLoading";

const PRICE_VALUE = 1;
const NET_VALUE = 2;
const FSM_VALUE = 3;
const PriceComperitor = ({ navigation }) => {
    const { appcolor, kpiinfo, workinfo, userinfo } = useSelector((state) => state.GAppState);
    const [statusReport, setStatusReport] = useState({ isOldDay: false, isUpload: 0 })
    const [dataAll, setDataAll] = useState({ dataProduct: [], mDataProduct: [], dataCompetitor: [] })
    const [__, setMutate] = useState(false);
    const [colorInput, setColorInput] = useState([]);
    const [taskDone, setDone] = useState([]);
    const _sheet = useRef();
    const [isLoading, setLoading] = useState(false)
    const listConfig = JSON.parse(kpiinfo.reportItem || '{}')
    //
    const LoadData = async () => {
        await setLoading(true)
        await getHistoryMarketPrice(workinfo.shopId)
        const lstCompetitor = listConfig?.isAllCompetitor == 1 ?
            await dataCompetitorMarketPrice() :
            await GetOnlyCompetitor()
        const lstData = await getListByCompetitor()
        await setDataAll({ dataProduct: lstData, mDataProduct: lstData, dataCompetitor: lstCompetitor })
        await setStatusReport({
            isOldDay: ConvertToInt(moment(new Date()).format("YYYYMMDD").toString()) !== workinfo.workDate ? true : false,
            isUpload: lstData[0]?.isUploaded || 0
        })
        await setLoading(false)
    }
    const getListByCompetitor = async () => {
        const lstData = await getListPriceCompetitor(workinfo, listConfig?.isAllCompetitor == 1);
        return lstData;
    }
    // Handler
    const UploadData = async () => {
        const lstUpload = await getListUpload_MarketPrice(workinfo, listConfig);
        let data = [];
        let uiTask = [];
        let isDone = true;
        lstUpload.forEach((it) => {
            dataAll.dataProduct?.forEach((i) => {
                if (i.productId === it.productId) {
                    data.push(i);
                }
            });
        });
        await dataAll.dataCompetitor.forEach(async (it) => {
            let countCompetitor = 0;
            let countPriceFalse = 0;
            let countNetFalse = 0;
            let countFsmFalse = 0;
            await data?.forEach(async (i) => {
                if (i.competitorId === it.competitorId) {
                    countCompetitor += 1;
                    (i.priceValue === null || i.priceValue % 1000 > 0) && (countPriceFalse += 1);
                    (i.netValue === null || i.netValue % 1000 > 0) && (countNetFalse += 1);
                    (i.fsmValue === null || i.fsmValue % 1000 > 0) && (countFsmFalse += 1);
                }
            })
            const dataMainById = dataAll.dataProduct?.filter((i) => i.competitorId === it.competitorId)
            let totalData = dataMainById.length;
            isDone === true && countCompetitor !== 0 ? (isDone = false) : null;
            //
            await uiTask.push(
                <View key={it.competitorId} style={{ justifyContent: "center", alignItems: "center", borderRadius: 10, margin: 5, backgroundColor: appcolor.grayLight, }}>
                    <View style={{ width: "95%", flexDirection: "row", justifyContent: "space-between", padding: 5, }}>
                        <Text style={{ color: countCompetitor === 0 ? appcolor.success : appcolor.danger, }}>{it.competitorName}</Text>
                        <Text style={{ color: countCompetitor === 0 ? appcolor.success : appcolor.danger, }}>{totalData - countCompetitor}/{totalData}</Text>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", borderColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, borderWidth: 0.3, borderRadius: 5, backgroundColor: appcolor.surface, }}>
                        {listConfig.priceValue == 1 && <View style={{ width: "30%", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
                            <Text style={{ color: countPriceFalse === 0 ? appcolor.success : appcolor.danger, }}>Niêm yết</Text>
                            <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, height: 0.5, margin: 2, width: "100%", flexDirection: "row", }}></View>
                            <Text style={{ color: countPriceFalse === 0 ? appcolor.success : appcolor.danger, }}>{totalData - countPriceFalse}/{totalData}</Text>
                        </View>
                        }
                        <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, width: 0.3, margin: 4, flexDirection: "row", }}></View>
                        {listConfig.netValue == 1 && <View style={{ width: "30%", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
                            <Text style={{ color: countNetFalse === 0 ? appcolor.success : appcolor.danger, }}>Thực bán</Text>
                            <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, height: 0.5, margin: 2, width: "100%", flexDirection: "row", }}></View>
                            <Text style={{ color: countNetFalse === 0 ? appcolor.success : appcolor.danger, }}>{totalData - countNetFalse}/{totalData}</Text>
                        </View>
                        }
                        <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, width: 0.3, margin: 4, flexDirection: "row", }}></View>
                        {listConfig.fsmValue == 1 && <View style={{ width: "30%", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
                            <Text style={{ color: countFsmFalse === 0 ? appcolor.success : appcolor.danger, }}>FSM Incentive</Text>
                            <View style={{ backgroundColor: countCompetitor === 0 ? appcolor.success : appcolor.danger, height: 0.5, margin: 2, width: "100%", }}></View>
                            <Text style={{ color: countFsmFalse === 0 ? appcolor.success : appcolor.danger, }}>{totalData - countFsmFalse}/{totalData}</Text>
                        </View>
                        }
                    </View>
                </View>
            );
        });
        await setDone(uiTask);
        if (listConfig.notCheckAll == 1) {
            await _sheet.current.show();
        } else {
            if ((await isDone) === false || statusReport.isUpload) {
                //chua nhap xong du lieu
                await _sheet.current.show();
            } else {
                let isNetwork = await checkNetwork();
                if (!isNetwork) {
                    alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                    return;
                }
                await alertConfirm("Chú ý", "Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?", async () => {
                    await uploadMarketPrice({ ...workinfo, reportId: kpiinfo.kpiId }, async (message) => {
                        alertNotify(message);
                        await LoadData();
                    }
                    );
                }
                );
            }
        }
    }
    const saveItem = async (item, value, type) => {
        let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, "") : null;
        let mPrice = text === null || text === "" ? null : parseInt(text);

        let itemInsert = {};
        switch (type) {
            case PRICE_VALUE:
                itemInsert = {
                    workId: workinfo.workId,
                    productId: item.productId,
                    priceValue: mPrice,
                    netValue: item.netValue,
                    fsmValue: item.fsmValue,
                };
                dataAll.dataProduct[item.indexMain].priceValue = mPrice;
                dataAll.mDataProduct[item.indexMain].priceValue = mPrice;
                break;
            case NET_VALUE:
                itemInsert = {
                    workId: workinfo.workId,
                    productId: item.productId,
                    priceValue: item.priceValue,
                    netValue: mPrice,
                    fsmValue: item.fsmValue,
                };
                dataAll.dataProduct[item.indexMain].netValue = mPrice;
                dataAll.mDataProduct[item.indexMain].netValue = mPrice;
                break;
            case FSM_VALUE:
                itemInsert = {
                    workId: workinfo.workId,
                    productId: item.productId,
                    priceValue: item.priceValue,
                    netValue: item.netValue,
                    fsmValue: mPrice,
                };
                dataAll.dataProduct[item.indexMain].fsmValue = mPrice;
                dataAll.mDataProduct[item.indexMain].fsmValue = mPrice;
                break;
        }
        setMutate((e) => !e);
        await updateItemPrice(item.id, itemInsert);
    }
    const checkFormatNumber = async (event, index, type, item) => {
        let mPrice = 0;
        let value = event.nativeEvent.text;
        if (value == "") {
            mPrice = null;
        } else {
            let text = value !== null && value.length > 0 ? value.toString().replace(/,/g, "") : null;
            mPrice = text === "" || text === null ? null : parseInt(text);
        }
        let foundValue = colorInput.filter((obj) => obj.index === index && obj.type === type && obj.categoryName === item.categoryName && obj.competitorId === item.competitorId);

        if (mPrice % 1000 > 0 || mPrice == null) {
            let textAlert = "";
            let itemInsert = {};
            switch (type) {
                case PRICE_VALUE:
                    itemInsert = {
                        ...item,
                        priceValue: null,
                    };
                    dataAll.dataProduct[item.indexMain].priceValue = null;
                    dataAll.mDataProduct[item.indexMain].priceValue = null;
                    textAlert = "Niêm yết";
                    break;
                case NET_VALUE:
                    itemInsert = {
                        ...item,
                        netValue: null,
                    };
                    dataAll.dataProduct[item.indexMain].netValue = null;
                    dataAll.mDataProduct[item.indexMain].netValue = null;
                    textAlert = "Thực bán";
                    break;
                case FSM_VALUE:
                    itemInsert = {
                        ...item,
                        fsmValue: null,
                    };
                    dataAll.dataProduct[item.indexMain].fsmValue = null;
                    dataAll.mDataProduct[item.indexMain].fsmValue = null;
                    textAlert = "Tiền thưởng";
                    break;
            }
            if (foundValue.length === 0)
                setColorInput((data) => [
                    ...data,
                    {
                        type: type,
                        index: index,
                        categoryName: item.categoryName,
                        competitorId: item.competitorId,
                    },
                ]);
            setMutate((e) => !e);
            await updateItemPrice(item.id, itemInsert);
            if (mPrice == null) {
                ToastError(`${index + 1}. ${item.productName}: Chưa nhập ${textAlert}`, "Chưa nhập liệu", "top");
            } else if (mPrice >= 1000) {
                ToastError(`${index + 1}. ${item.productName}: ${textAlert} không được nhập số lẻ`, "Lỗi nhập số lẻ", "top");
            } else {
                ToastError(`${index + 1}. ${item.productName}: ${textAlert} nhập sai định dạng`, "Sai định dạng", "top");
            }
        } else {
            let foundValue = colorInput.filter((obj) => obj.index !== index || obj.type !== type || obj.categoryName !== item.categoryName || obj.competitorId !== item.competitorId); setColorInput(foundValue);
        }
    }
    const filterProduct = debounce(async (str) => {
        let ROW_NUMBER = 0;
        let mDataFilter = [];
        if (str !== null && str !== undefined && str.length > 0)
            mDataFilter = dataAll.mDataProduct.filter((i) => i.productName.toLowerCase().match(str.toLowerCase()));
        else
            mDataFilter = dataAll.mDataProduct;

        await mDataFilter.forEach((i) => { i.indexMain = ROW_NUMBER; ROW_NUMBER++; });
        // await setData(mDataFilter);
        dataAll.dataProduct = mDataFilter
        await setMutate(e => !e)
    }, 500)
    useEffect(() => {
        LoadData();
        return () => false
    }, [])
    // View
    const styles = StyleSheet.create({
        viewProduct: { backgroundColor: appcolor.surface, borderRadius: 5, marginTop: 6 },
        titleSubCategory: { color: appcolor.info, fontSize: 14, fontWeight: '600', fontStyle: 'italic' },
        titleGroupCategory: { fontSize: 15, color: appcolor.primary, fontWeight: '700', margin: 8, marginBottom: 0, paddingTop: 5 },
        titleProduct: { fontWeight: "500", color: appcolor.dark, fontSize: 14, padding: 8, },
        viewInputPrice: { width: "100%", flexDirection: "row", },
        inputNumber: { color: appcolor.dark, width: "100%", borderBottomWidth: 0.6, borderBottomColor: appcolor.placeholderText, padding: 5, borderRadius: 6, textAlign: "center", },
        ViewInput: { width: "30%", margin: 5, },
        styleModal: { flex: 1, backgroundColor: appcolor.light, padding: 16, paddingTop: 50, overflow: "hidden", },
        modalHeader: { padding: 5, flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
    })
    const renderItem = ({ item, index, totalRow }) => {
        const keyLayer2 = item[`${item.categoryId}${item.subCatId}`];
        return (
            <View key={"k" + index} style={{ width: '100%', borderRadius: 5 }}>
                {item.isParent && <Text style={styles.titleGroupCategory}>{item?.categoryName}</Text>}
                <View style={{ flex: 1 }}>
                    {(keyLayer2 && item.subCatId !== 0 && item.subCatId !== null) && (
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                            <Icon name="tags" style={{ padding: 8, color: appcolor.info }} />
                            <Text style={styles.titleSubCategory}>{`${item?.subCategory}`}</Text>
                        </View>
                    )}
                    <View style={styles.viewProduct}>
                        <Text style={styles.titleProduct}>{index + 1 + ". " + item.productName}</Text>
                        <View style={styles.viewInputPrice}>
                            {listConfig.priceValue == 1 && <RenderInputNumber
                                appcolor={appcolor}
                                type={PRICE_VALUE}
                                styles={styles}
                                itemInput={item}
                                valueInput={item.priceValue}
                                placeholder={"Niêm yết"}
                                editable={statusReport.isOldDay ? false : !statusReport.isUpload}
                                onChangeText={saveItem}
                                onEndEdit={checkFormatNumber}
                                itemIndex={index}
                                colorInput={colorInput}
                            />
                            }
                            {listConfig.netValue == 1 && <RenderInputNumber
                                appcolor={appcolor}
                                type={NET_VALUE}
                                styles={styles}
                                itemInput={item}
                                valueInput={item.netValue}
                                placeholder={"Thực bán"}
                                editable={statusReport.isOldDay ? false : !statusReport.isUpload}
                                onChangeText={saveItem}
                                onEndEdit={checkFormatNumber}
                                itemIndex={index}
                                colorInput={colorInput}
                            />
                            }
                            {listConfig.fsmValue == 1 && <RenderInputNumber
                                appcolor={appcolor}
                                type={FSM_VALUE}
                                styles={styles}
                                itemInput={item}
                                valueInput={item.fsmValue}
                                placeholder={"FSM Incentive"}
                                editable={statusReport.isOldDay ? false : !statusReport.isUpload}
                                onChangeText={saveItem}
                                onEndEdit={checkFormatNumber}
                                itemIndex={index}
                                colorInput={colorInput}
                            />
                            }
                        </View>
                    </View>
                </View>
                {index === totalRow - 1 && index >= 3 && (
                    <Text style={{ width: "100%", textAlign: "center", color: appcolor.dark, padding: 8, }}>{"Đã xem hết"}</Text>
                )}
            </View>
        );
    };
    const renderTabView = () => {
        let dataByCategoryId = [];
        return dataAll.dataCompetitor?.map((itemTab, indexTab) => {
            // if (itemTab.competitorId != _competitorId) {
            dataByCategoryId = dataAll.dataProduct?.filter((i) => i.competitorId === itemTab.competitorId);
            // }
            const { arr } = groupDataByKey({
                arr: dataByCategoryId,
                key: "categoryId",
                keyLayer2: "subCatId",
            });
            const totalRow = arr.length;

            return (
                <Tabs.Tab key={itemTab.competitorId} label={`${itemTab.competitorName} (${totalRow}) `} name={`${itemTab.competitorName} (${totalRow}) `}>
                    <View key={indexTab.toString()} style={{ backgroundColor: appcolor.light, marginTop: 35, width: deviceWidth, }}>
                        <FlatList
                            scrollEnabled
                            key={'listProduct_' + indexTab}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingHorizontal: 5 }}
                            keyExtractor={(_, index) => index.toString()}
                            data={arr}
                            ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
                            renderItem={(item, index) => {
                                const info = { ...item, totalRow: totalRow };
                                return renderItem(info, index, totalRow);
                            }}
                        />
                    </View>
                </Tabs.Tab>
            );
        });
    };
    const handleSendReport = async () => {
        const lstUpload = await getListUpload_MarketPrice(workinfo);
        const listFilter = lstUpload.filter(it => it.netValue !== null && it.netValue !== undefined && it.netValue !== '')
        if (listFilter.length == 0) {
            alertWarning("Bạn chưa nhập giá của đối thủ. Vui lòng nhập giá của đối thủ trước khi gửi báo cáo.");
            return;
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return;
        }
        await alertConfirm("Chú ý", "Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?", async () => {
            await uploadMarketPrice({ ...workinfo, reportId: kpiinfo.kpiId }, async (message) => {
                alertNotify(message);
                await LoadData();
            }
            );
            setDone([]);
            _sheet.current.hide();
        }
        );
        setDone([]);
        _sheet.current.hide();
    }
    return (
        <View style={{ flex: 1, flexDirection: "column", justifyContent: "center", backgroundColor: appcolor.light, }}>
            <HeaderCustom
                title={kpiinfo.name}
                leftFunc={() => navigation.goBack()}
                rightFunc={statusReport.isOldDay ? null : !statusReport.isUpload ? UploadData : null}
                iconRight={statusReport.isOldDay ? "" : !statusReport.isUpload ? "cloud-upload-alt" : "check"}
            />
            <FormGroup
                editable
                placeholder='Tìm kiếm sản phẩm'
                iconName='search'
                handleChangeForm={filterProduct}
                containerStyle={{ margin: 8, padding: 3, backgroundColor: appcolor.light, borderRadius: 30, borderColor: appcolor.grey }}
                inputStyle={{ fontSize: 13, color: appcolor.dark }}
            />
            <LoadingView isLoading={isLoading} title='Đang cập nhật dữ liệu' />
            <KeyboardAvoidingView
                style={{ flex: 1, justifyContent: "center", paddingBottom: 10, backgroundColor: "transparent", }}
                behavior={Platform.OS == "ios" ? "padding" : "height"} enabled
                keyboardVerticalOffset={0}>
                <Tabs.Container
                    renderTabBar={(props) => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled={true}
                            tabStyle={{ backgroundColor: appcolor.light, minWidth: minWidthTab(dataAll.dataCompetitor), height: 38 }}
                            labelStyle={{ fontSize: 14, fontWeight: "600" }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.greydark}
                            activeColor={appcolor.dark}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    headerContainerStyle={{ backgroundColor: appcolor.transparent, shadowColor: appcolor.transparent }}
                    containerStyle={{ backgroundColor: appcolor.surface }}
                >
                    {renderTabView()}
                </Tabs.Container>
            </KeyboardAvoidingView>
            <ActionSheet
                gestureEnabled
                // drawUnderStatusBar={Platform.OS == 'ios'}
                initialOffsetFromBottom={0.5}
                containerStyle={{ backgroundColor: appcolor.light }}
                onClose={() => { setDone([]); }}
                closable={true}
                ref={_sheet}>
                {taskDone.length > 0 && (
                    <View style={{ height: deviceHeight * 0.95 }}>
                        <Text key={"dasda"} style={{ padding: 12, color: appcolor.dark, fontSize: scaleSize(18), }}>
                            {statusReport.isUpload ? "Báo cáo đã gửi lên hệ thống" : "Bạn chưa hoàn thành các mục màu đỏ bên dưới"}</Text>
                        <View style={{ width: '100%', height: '80%' }}>
                            <ScrollView nestedScrollEnabled style={{ width: '100%', height: '100%' }}>
                                <View>{taskDone}</View>
                            </ScrollView>
                        </View>

                        <View style={{ flexDirection: 'row', width: '100%', padding: 8, justifyContent: 'center', marginTop: 16 }}>
                            <TouchableOpacity
                                style={{ padding: 8, borderWidth: 0.5, borderColor: appcolor.primary, borderRadius: 8, minWidth: 100, marginEnd: 8, }}
                                onPress={() => {
                                    setDone([])
                                    _sheet.current.hide()
                                }}>
                                <Text style={{ color: appcolor.primary, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>Đã biết</Text>
                            </TouchableOpacity>
                            {listConfig.notCheckAll == 1 &&
                                <TouchableOpacity onPress={handleSendReport}
                                    style={{ backgroundColor: appcolor.primary, borderRadius: 8, padding: 8, minWidth: 100 }}>
                                    <Text style={{ color: appcolor.light, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>Gửi</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                )}
            </ActionSheet>
        </View>
    );
};
const RenderInputNumber = ({ styles, valueInput, itemInput, placeholder, type, onChangeText, editable, appcolor, onEndEdit, itemIndex, colorInput, }) => {
    const onChange = async (item, text, type) => {
        await onChangeText(item, text, type);
    };
    const formatNumber = async (event, index, type, item) => {
        await onEndEdit(event, index, type, item);
    };
    const dataColor = colorInput.find(
        (obj) =>
            obj.index === itemIndex &&
            obj.type === type &&
            obj.categoryName === itemInput.categoryName &&
            obj.competitorId === itemInput.competitorId
    );
    return (
        <View key={itemIndex + "I"} style={styles.ViewInput}>
            <NumericFormat
                value={valueInput?.toString() || ""}
                displayType="text"
                thousandSeparator={true}
                allowedDecimalSeparators={['.', ',']}
                maxLength={50}
                renderText={(values) => (
                    <TextInput
                        onEndEditing={(event) =>
                            formatNumber(event, itemIndex, type, itemInput)
                        }
                        value={values}
                        editable={editable}
                        selectTextOnFocus
                        keyboardType="numeric"
                        onChangeText={(text) => onChange(itemInput, text, type)}
                        style={[
                            styles.inputNumber,
                            {
                                backgroundColor:
                                    dataColor === undefined ||
                                        (dataColor.type !== type &&
                                            dataColor.index !== itemIndex &&
                                            dataColor.categoryName !==
                                            itemInput.categoryName && dataColor.competitorId !== itemInput.competitorId)
                                        ? appcolor.light
                                        : appcolor.warningLight,
                            },
                        ]}
                        placeholder={type === FSM_VALUE ? "Tiền thưởng" : "Giá"}
                        placeholderTextColor={appcolor.greydark}
                    />
                )}
            />
            <Text style={{ textAlign: "center", color: appcolor.dark, fontSize: 13, marginTop: 5, }}>{placeholder}</Text>
        </View>
    );
};
export default PriceComperitor;
