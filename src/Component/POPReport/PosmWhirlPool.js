
import { useSelector, } from "react-redux"
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { View, Text, FlatList, Keyboard, ScrollView, TouchableOpacity, StyleSheet, } from "react-native"
import { POSMContext } from "../../Controller/POSMController";
import { alertConfirm, alertError, alertToast, deviceHeight, deviceWidth, TODAY, } from "../../Core/Utility";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { Divider, Icon } from '@rneui/themed';
import { scaleSize } from "../../Themes/AppsStyle";
import FormGroup from "../../Content/FormGroup";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { PhotoItems } from "../EPSON/PhotoItems";
import { groupDataByKey, ToastSuccess } from "../../Core/Helper";
import filter from "lodash";
import { SceneMap } from "react-native-tab-view";
import { TabForm } from "../../Control/TabForm";
import { InputPosm } from "./InputPosm";
import moment from "moment";
import { ModalNotify } from "../../Control/ModalNotify";


export const PosmWhirlPool = ({ navigation }) => {
    const { appcolor, kpiinfo, workinfo } = useSelector((state) => state.GAppState);
    const reportItem = JSON.parse(kpiinfo?.reportItem || "{}");
    const [upload, setUpload] = useState(workinfo.workDate !== TODAY ? true : false);
    const [reload, setReload] = useState(0)
    const [routes, setRoutes] = useState([
        { key: "first", title: "Nhập Liệu" },
        { key: "second", title: "Hình Ảnh" },
    ]);

    //end search product

    const uploadForm = async (info) => {
        await setUpload(info.upload === 1 ? true : false);
    }

    const Styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor.surface },
        taskDoneStyle: { width: "100%", padding: 12, textAlign: "center", fontWeight: "bold", fontSize: scaleSize(20), },
        taskDoneBottomStyle: { flexDirection: "row", width: "100%", position: "absolute", padding: 7, bottom: 0, backgroundColor: appcolor.surface, },
        buttonSendStyle: { display: upload ? "none" : "flex", padding: 7, flexGrow: 1, alignItems: "center", },
        closeViewStyle: { display: upload ? "none" : "flex", flexGrow: 0.05, backgroundColor: appcolor.light, height: "100%", },
        textBottomTask: { color: appcolor.primary, fontSize: scaleSize(18), },
        viewBottomAdd: { alignItems: "center", width: "100%", backgroundColor: appcolor.primary, padding: 12, },
        viewRowProduct: { alignItems: "center", padding: 7, flexDirection: "row", marginEnd: 7, },
    })
    const ViewItemTabInput = () => {
        return (
            <InputPosm upload={upload} reload={reload} reportItem={reportItem} />
        );
    };
    const ViewItemPhoto = () => {
        return (
            <PhotoItems
                usedHeader={false}
                navigation={navigation}
                route={{
                    params: {
                        Photos: reportItem?.ImageByList || [],
                        Status: upload ? 1 : 0,
                    },
                }}
            />
        );
    };
    const renderScene = SceneMap({
        first: ViewItemTabInput,
        second: ViewItemPhoto,
    });

    const reloadItem = () => {
        setReload(reload + 1)
    }

    return (

        <View style={Styles.container}>
            <ViewHeaderPOSM appcolor={appcolor} navigation={navigation} uploadForm={uploadForm} kpiinfo={kpiinfo} workinfo={workinfo} reloadItem={reloadItem} reportItem={reportItem} Styles={Styles} />
            {routes.length > 0 && (
                <TabForm
                    renderScene={renderScene}
                    initialPage={0}
                    routes={routes}
                    positionTabBar={"bottom"}
                    swipeEnabled={false}
                />
            )}
        </View>
    );
};
const ViewHeaderPOSM = ({ navigation, appcolor, kpiinfo, uploadForm, workinfo, reloadItem, Styles, reportItem }) => {
    const _sheet = useRef()
    const _sheetAddMore = useRef()

    const [taskDone, setDone] = useState(false);
    const [note, setNote] = useState(null);
    const [count, setCount] = useState(0);
    const [reloadPhoto, setLoadPhoto] = useState(0);
    const [result, setResult] = useState([]);
    //search product
    const [product, setListProduct] = useState([]);
    const [_filterProduct, setFilterProduct] = useState([]);
    const [Status, setStatus] = useState(workinfo.workDate !== TODAY ? true : false)
    const [listData, setListData] = useState([])
    const [isVisible, setVisible] = useState(false)
    const [messager, setMessager] = useState()
    const titleNotify = 'Danh sách sản phẩm cần hoàn thiện'
    //end search product

    const loadData = async () => {
        const result = await POSMContext.PosmTargetGetList(workinfo);
        if ((await result.length) > 0) {
            const info = await result[0];
            await uploadForm(info)
            let day = parseInt(moment(new Date()).format('YYYYMMDD'))
            if (workinfo.workDate === day) {
                await setStatus(info.upload === 1 ? true : false)
            } else {
                await setStatus(true)
            }
            await setNote(info.posmNote);
            await setLoadPhoto(reloadPhoto + 1);
        }
        await onLoadProduct()

    };
    useEffect(() => {
        loadData();
        return () => false;
    }, []);

    const onShowReport = async () => {
        await Keyboard.dismiss();
        const res = await POSMContext.ShowResult({
            ...workinfo,
            reportId: kpiinfo.id,
        });
        const dataPosm = await POSMContext.PosmTargetGetList(workinfo);
        await setListData(dataPosm)
        await setResult(res);
        await setDone(true);
        SheetManager.show('_sheet')
        // _sheet.current.show();
    };
    const onSendReport = async () => {
        const noteProduct = listData.filter(it => (it.posmNote == '' || it.posmNote == null || it.posmNote == 'null') && it.defaultValue > 0 && it.defaultValue !== null && (it.defaultValue !== (it.displayValue || 0)))
        const taskdone = result.filter(
            (a) =>
                (a.countInput === 0 && a.code === 0) ||
                (a.countInput > 0 && a.code === 1)
        );
        if (noteProduct.length > 0 && reportItem.isDisplayTarget == 1) {
            const { arr } = groupDataByKey({
                arr: noteProduct,
                key: 'categoryId'
            })
            let errorView = []
            errorView.push(
                <View key={'titleItem'} style={{ padding: 5, flexDirection: 'row', width: deviceWidth * 0.8 }}>
                    <View style={{ width: '60%' }}>
                        <Text style={{ fontWeight: '500', fontSize: 13, color: appcolor.dark }}>Sản phẩm</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontWeight: '500', fontSize: 13, color: appcolor.dark }}>Chỉ tiêu</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontWeight: '500', fontSize: 13, color: appcolor.dark }}>Thực tế</Text>
                    </View>
                </View>
            )

            for (let index = 0; index < arr.length; index++) {
                const element = arr[index];
                errorView.push(
                    <View key={element.productId} style={{ width: deviceWidth * 0.8 }}>
                        {element.isParent &&
                            <View key={'title_' + element.productId} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.secondary, padding: 5, borderRadius: 5, marginBottom: 8 }}>
                                <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.white, }}>Ngành hàng: {element.categoryName}</Text>
                            </View>
                        }
                        <View style={{ padding: 5, flexDirection: 'row' }}>
                            <View style={{ width: '60%' }}>
                                <Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>{element.productName}</Text>
                            </View>
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>{element.defaultValue}</Text>
                            </View>
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: '300', fontSize: 11, color: appcolor.dark }}>{element.displayValue || 0}</Text>
                            </View>

                        </View>
                    </View>
                )
            }
            // _sheet.current.hide()
            await SheetManager.hide('_sheet')
            await setMessager(<View style={{ height: deviceHeight * 0.4 }}>
                <ScrollView style={{ flex: 1 }} >
                    {errorView}
                </ScrollView>
                <View key={'noteView'} style={{ justifyContent: 'center', alignItems: 'center', padding: 5, width: deviceWidth * 0.8 }}>
                    <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.tomato, textAlign: 'center' }}>Cần ghi chú các sản phẩm không đúng chỉ tiêu trưng bày</Text>
                </View>
            </View>)
            await handleVisibleModal(true)
        } else if (taskdone !== null && taskdone.length > 0) {
            alertError(`Lỗi ${taskdone[0].title} ${taskdone[0].countInput}`);
            return;
        } else {
            alertConfirm(
                "Gửi báo cáo",
                "Bạn muốn gửi báo lên hệ thống? ",
                async () => {
                    await POSMContext.PosmUpload(
                        { ...workinfo, reportId: kpiinfo.id },
                        (result) => {
                            if (result.statusId === 200) {
                                setStatus(true)
                                ToastSuccess(result.messager, "Đã gửi", "top");
                                SheetManager.hide('_sheet')
                                // _sheet.current.hide();
                            } else {
                                alertToast(result.messager);
                            }
                        }
                    );
                }
            );
        }
    };
    const handleVisibleModal = async (visible) => {
        await setVisible(visible)
    }

    const onLoadProduct = async () => {
        const list = await POSMContext.GetProductMore(workinfo);
        await setListProduct(list);
        await setFilterProduct(list);
    };
    const onSelected = (item, index) => {
        let edit = item;
        edit.addMore = !item.addMore;
        let updatelist = [...product];
        updatelist[index] = edit;
        const _data = updatelist.filter((e) => e.addMore === true);
        setCount(_data.length);
        setListProduct(updatelist);
    };
    const onAddMore = async () => {
        if (count > 0) {
            const addlist = product.filter((v) => v.addMore === true);
            await POSMContext.AddMoreProduct(addlist);
            await loadData();
            await reloadItem()

        }
        await setCount(0);
        // await _sheetAddMore.current.hide();
        await SheetManager.hide('_sheetAddMore')
    };
    const rowProduct = (item, index) => {
        return (
            <TouchableOpacity onPress={() => onSelected(item, index)} key={"hig" + index}>
                <View key={"rs" + index} style={[Styles.viewRowProduct, { backgroundColor: item.addMore ? appcolor.primary : appcolor.light, }]}                >
                    <View style={{ flexGrow: 1 }}>
                        <Text style={{ color: appcolor.dark, fontSize: scaleSize(16), }} > {item.productName}  </Text>
                        <Text style={{ color: appcolor.dark, fontSize: scaleSize(12), marginBottom: 7, }}   >  {item.categoryName} </Text>
                    </View>
                    {item.addMore ? (<Icon size={30} name="playlist-add-check" color={appcolor.light} />) : null}
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            </TouchableOpacity>
        );
    };
    // search area
    const contains = (item, query) => {
        const { productCode, productName, categoryName } = item;
        let SCate = categoryName === null ? categoryName : categoryName.toLowerCase();
        let SCode = productCode === null ? productCode : productCode.toLowerCase();
        let SName = productName === null ? productName : productName.toLowerCase();
        if (SCate.includes(query) || SCode.includes(query) || SName.includes(query)) {
            return true;
        }
        return false;
    };
    const handleSearch = (text) => {
        const formattedQuery = text.toLowerCase();
        const filteredData = filter(_filterProduct, (item) => {
            return contains(item, formattedQuery);
        });
        if (formattedQuery === undefined || formattedQuery === "") {
            setListProduct(product);
        } else setListProduct(filteredData);
    };

    const onChangeNoted = (e) => {
        setNote(e);
        POSMContext.PosmNote(workinfo, e);
    };
    const rowError = ({ item, index }) => {
        const errorCode = (item.countInput === 0 && item.code === 0) || (item.countInput > 0 && item.code === 1);
        return (
            <Fragment key={`nkajda${index}`}>
                <View style={{ flexDirection: "row", padding: 12 }}>
                    <Text style={{
                        textDecorationLine: errorCode ? "line-through" : "none", color: errorCode ? appcolor.danger : appcolor.dark, flexGrow: 1,
                        padding: 7, fontSize: scaleSize(14), fontWeight: "700",
                    }}  > {item.title} </Text>
                    <Text style={{ padding: 7, color: appcolor.dark, fontSize: scaleSize(14), fontWeight: "700", }} >{item.countInput}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            </Fragment>
        );
    };

    return (
        <View>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                rightFunc={onShowReport}
                iconRight={Status === true ? "poll" : "cloud-upload-alt"}
                iconMiddle="search"
                middleFunc={Status === true ? null : () => SheetManager.show('_sheetAddMore')}
                title={kpiinfo.name}
            />
            {isVisible &&
                <ModalNotify messager={messager} visible={isVisible} handleVisibleModal={handleVisibleModal} titleNotify={titleNotify} />
            }
            <ActionSheet
                // headerAlwaysVisible gestureEnabled
                containerStyle={{ backgroundColor: appcolor.light }}
                onClose={() => { setDone(false) }}
                // ref={_sheet}
                id={'_sheet'}
            >
                {taskDone === true && (
                    <View>
                        <Text style={Styles.taskDoneStyle} >Kết quả</Text>
                        {
                            reportItem?.isUseNoteProduct !== 1 &&
                            <FormGroup
                                editable={!Status}
                                value={note}
                                handleChangeForm={onChangeNoted}
                                placeholder="Nhập nội dung ghi chú..."
                                title="Nhập ghi chú"
                            />
                        }
                        <ScrollView style={{ height: reportItem?.isUseNoteProduct !== 1 ? "80%" : "90%" }}>
                            <FlatList data={result} renderItem={rowError} />
                        </ScrollView>
                        <View style={Styles.taskDoneBottomStyle}>
                            <TouchableOpacity onPress={() => onSendReport()} style={{ display: Status ? "none" : "flex", padding: 7, flexGrow: 1, alignItems: "center", }}>
                                <Text style={Styles.textBottomTask} >Gửi báo cáo</Text>
                            </TouchableOpacity>
                            <View style={{ display: Status ? "none" : "flex", flexGrow: 0.05, backgroundColor: appcolor.light, height: "100%", }} />
                            <TouchableOpacity style={{ padding: 7, flexGrow: 1, alignItems: "center", }} onPress={() => { setDone(false); SheetManager.hide('_sheet'); }}   >
                                <Text style={Styles.textBottomTask}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

            </ActionSheet>
            <ActionSheet
                // headerAlwaysVisible gestureEnabled
                containerStyle={{ backgroundColor: appcolor.light }}
                onClose={() => { setDone(false) }}
                // ref={_sheetAddMore}
                id={'_sheetAddMore'}
            >
                <Fragment>
                    <FormGroup
                        useClearAndroid={false}
                        editable={true}
                        handleChangeForm={(e) => handleSearch(e)}
                        placeholder="Nhập mã sản phẩm ngoài danh sách"
                    />
                    <ScrollView style={{ height: "95%" }}>
                        <View>
                            {product.map((item, index) => {
                                return rowProduct(item, index);
                            })}
                        </View>
                    </ScrollView>
                    <TouchableOpacity onPress={() => onAddMore()}>
                        <View style={Styles.viewBottomAdd}>
                            <Text style={{ color: appcolor.white }}>{count > 0 ? `(${count}) Áp dụng` : `Trở về`}</Text>
                        </View>
                    </TouchableOpacity>
                </Fragment>
            </ActionSheet>
        </View>
    )
}