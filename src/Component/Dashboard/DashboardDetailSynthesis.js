import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Platform, TouchableOpacity, SafeAreaView, LayoutAnimation, UIManager } from "react-native";
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { formatNumber, groupDataByKey } from '../../Core/Helper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Badge } from '@rneui/base';
import { deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import FormGroup from '../../Content/FormGroup';
import { LoadingView } from '../../Control/ItemLoading';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const DashboardDetailSynthesis = ({ title, dataSummary, dataHeader, onClose }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [data, setData] = useState({ dataSummary: [], dataSummaryF: [], dataHeader: {} })
    const [search, setSearch] = useState('')
    const [isDone, setDone] = useState(false)

    const LoadData = async () => {
        if (dataSummary.length > 0) {
            const { arr } = groupDataByKey({
                arr: dataSummary,
                key: 'CategoryId',
                keyLayer2: 'SubCatId'
            })
            await setData({ dataSummary: arr, dataSummaryF: arr, dataHeader: dataHeader })
        }
    }

    useEffect(() => {
        LoadData()
        return () => false
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        itemContainer: { flex: 1, paddingBottom: 8, alignItems: 'center' },
        itemStyle: { alignSelf: 'center', width: '90%', borderRadius: 8, margin: 3, padding: 5, backgroundColor: appcolor.surface },
        titleHead: { flex: 1, fontSize: 15, fontWeight: 'bold', color: appcolor.light },
        itemText: { color: appcolor.dark, fontSize: 14, fontWeight: '500' },
        titleSecond: { width: '100%', color: appcolor.tomato, fontSize: 14, fontWeight: '700', marginBottom: 5, marginEnd: 32, textAlign: 'right' }
    })

    const filterProduct = async (text) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (text) {
            const newDataShow = [...data.dataSummaryF].filter(it => {
                const nameProduct = it.ProductName ? it.ProductName.toUpperCase() : ''.toUpperCase()
                const textSearch = text.toUpperCase()
                return nameProduct.indexOf(textSearch) > -1
            })
            const { arr } = groupDataByKey({
                arr: [...newDataShow],
                key: 'CategoryId',
                keyLayer2: 'SubCatId'
            })
            data.dataSummary = arr
            setSearch(text)
        } else {
            data.dataSummary = data.dataSummaryF
            setSearch(text)
        }
    }

    const renderItem = ({ item, index }) => {
        // const lastStock = ((item.fistStock || 0) + (item.sellInByMonth || 0)) - (item.sellOutByMonth || 0)
        const keyLayer2 = item[`${item.CategoryId}${item.SubCatId}`];

        return (

            <View style={{}}>
                {item.isParent && item.CategoryId !== undefined && item.SubCatName !== null &&
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.secondary, padding: 5, borderRadius: 5, marginTop: 8, marginHorizontal: 8 }}>
                        <Text style={{ flex: 1, fontSize: 11.5, fontWeight: 'bold', color: appcolor.white }}>Ngành hàng : {item.CategoryName}</Text>
                    </View>
                }
                {keyLayer2 && (item.SubCatName !== undefined && item.SubCatName !== null) &&
                    <Text style={{ color: appcolor.primary, fontSize: 14, marginTop: 5, paddingLeft: 8, fontWeight: '600' }}>{item.SubCatName}</Text>
                }
                <View style={{ minHeight: 30, flexDirection: 'row', paddingTop: 5, paddingHorizontal: 5, width: deviceWidth, marginTop: index == 0 ? 10 : 0 }}>

                    <View style={{ width: data.dataHeader?.numColumn > 2 ? '40%' : '60%', backgroundColor: index % 2 == 0 ? appcolor.homebackground : appcolor.light, justifyContent: 'center', paddingLeft: 5 }}>
                        <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, }}>{item.ProductName}</Text>
                    </View>
                    {/* <View style={{ height: '80%', width: 0.6, backgroundColor: index % 2 == 0 ? appcolor.light : appcolor.surface }}></View> */}
                    {
                        data.dataHeader?.column1 !== null && data.dataHeader?.column1 !== undefined &&
                        < View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: index % 2 == 0 ? appcolor.homebackground : appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                            <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, textAlign: 'center' }}>{item[data.dataHeader?.itemField1] == 0 ? 0 : (item[data.dataHeader?.itemField1] || '-')}</Text>
                        </View>
                    }
                    {
                        data.dataHeader?.column2 !== null && data.dataHeader?.column2 !== undefined &&
                        <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: index % 2 == 0 ? appcolor.homebackground : appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                            <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, textAlign: 'center' }}>{item[data.dataHeader?.itemField2] == 0 ? 0 : (item[data.dataHeader?.itemField2] || '-')}</Text>
                        </View>
                    }
                    {
                        data.dataHeader?.column3 !== null && data.dataHeader?.column3 !== undefined &&
                        <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: index % 2 == 0 ? appcolor.homebackground : appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                            <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, textAlign: 'center' }}>{item[data.dataHeader?.itemField3] == 0 ? 0 : (item[data.dataHeader?.itemField3] || '-')}</Text>
                        </View>
                    }
                    {
                        data.dataHeader?.column4 !== null && data.dataHeader?.column4 !== undefined &&
                        <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: index % 2 == 0 ? appcolor.homebackground : appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                            <Text style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark, textAlign: 'center' }}>{item[data.dataHeader?.itemField4] == 0 ? 0 : (item[data.dataHeader?.itemField4] || '-')}</Text>
                        </View>
                    }
                </View >
            </View>
        )
    }

    const TitleDashboard = () => {
        return (
            <View style={{ minHeight: 30, marginTop: 10, paddingHorizontal: 5, flexDirection: 'row', width: deviceWidth, }}>
                <View style={{ width: data.dataHeader?.numColumn > 2 ? '40%' : '60%', paddingVertical: 5, backgroundColor: appcolor.homebackground, justifyContent: 'center', alignItems: "center" }}>
                    <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, textAlign: 'center' }}>Sản phẩm</Text>
                </View>
                {
                    data.dataHeader?.column1 !== null && data.dataHeader?.column1 !== undefined &&
                    <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                        <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, textAlign: 'center' }}>{data.dataHeader?.column1}</Text>
                    </View>
                }
                {
                    data.dataHeader?.column2 !== null && data.dataHeader?.column2 !== undefined &&
                    <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: appcolor.homebackground, justifyContent: 'center', alignItems: "center" }}>
                        <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, textAlign: 'center' }}>{data.dataHeader?.column2}</Text>
                    </View>
                }
                {
                    data.dataHeader?.column3 !== null && data.dataHeader?.column3 !== undefined &&
                    <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                        <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, textAlign: 'center' }}>{data.dataHeader?.column3}</Text>
                    </View>
                }
                {
                    data.dataHeader?.column4 !== null && data.dataHeader?.column4 !== undefined &&
                    <View style={{ width: `${data.dataHeader?.numColumn > 2 ? 60 : 40 / data.dataHeader?.numColumn}%`, backgroundColor: appcolor.light, justifyContent: 'center', alignItems: "center" }}>
                        <Text style={{ fontWeight: '600', fontSize: 13, color: appcolor.dark, textAlign: 'center' }}>{data.dataHeader?.column4}</Text>
                    </View>
                }
            </View>
        )
    }

    const openSheet = () => {
        SheetManager.show('ref_toolsSheet')
    }
    const filterDoneProduct = () => {
        if (!isDone) {
            let lstRes = data.dataSummary.filter(it => (
                it[data.dataHeader?.itemField1] !== null && it[data.dataHeader?.itemField1] >= 0) ||
                (it[data.dataHeader?.itemField2] !== null && it[data.dataHeader?.itemField2] >= 0) ||
                (it[data.dataHeader?.itemField3] !== null && it[data.dataHeader?.itemField3] >= 0) ||
                (it[data.dataHeader?.itemField4] !== null && it[data.dataHeader?.itemField4] >= 0)
            )
            data.dataSummary = lstRes;
        } else {
            data.dataSummary = data.dataSummaryF;
        }
        setDone(e => !e)
    }

    return (
        <View style={styles.mainContainer}>
            <SafeAreaView style={{ width: '100%', flexDirection: 'row', backgroundColor: appcolor.primary, padding: 5, alignItems: 'center' }}>
                <TouchableOpacity onPress={onClose} style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}>
                    <Icon name={'times'} size={scaleSize(23)} solid={true} color={appcolor.white} />
                </TouchableOpacity>
                <Text style={{ width: '80%', textAlign: 'center', fontSize: scaleSize(18), fontWeight: '700', padding: 5, color: appcolor.white }}>{title}</Text>
            </SafeAreaView>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 5 }}>
                    <FormGroup
                        containerStyle={{ borderColor: appcolor.grayLight, borderWidth: 0.5, backgroundColor: appcolor.light, padding: 3, width: '88%', marginBottom: 0 }}
                        inputStyle={{ fontSize: 14, color: appcolor.dark }}
                        placeholder='Tìm kiếm sản phẩm' editable
                        iconName='search'
                        value={search}
                        onClearTextAndroid={filterProduct}
                        handleChangeForm={filterProduct}
                    />
                    <TouchableOpacity
                        onPress={openSheet}
                        style={{ width: '10%', height: 38, backgroundColor: appcolor.grayLight, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name='filter' type='font-awesome-5' size={21} color={appcolor.dark} />
                    </TouchableOpacity>
                </View>
                <TitleDashboard />

                {
                    data.dataSummary?.length > 0 &&
                    <FlatList
                        keyExtractor={(_, index) => index.toString()}
                        data={data.dataSummary}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        initialNumToRender={20}
                        ListFooterComponent={<View style={{ height: deviceWidth / 2 }} />}
                    />
                }

            </View>
            <ActionSheet
                id={'ref_toolsSheet'}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary} >

                <View style={{ padding: 8, width: '100%', height: '30%' }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark }}>Công cụ</Text>
                        <TouchableOpacity
                            style={{
                                marginTop: 8,
                                backgroundColor: isDone ? appcolor.light : appcolor.surface,
                                borderWidth: isDone ? 0.5 : 0,
                                borderColor: appcolor.success,
                                width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 5,
                                padding: 4
                            }}
                            onPress={filterDoneProduct}
                        >
                            <Icon name={'keyboard'} size={18} color={appcolor.success} />
                            <Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }}>Xem dữ liệu đã nhập</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet >
        </View>
    )
}
