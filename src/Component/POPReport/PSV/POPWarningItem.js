import React, { useEffect, useRef, useState } from "react"
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { HeaderCustom } from "../../../Content/HeaderCustom"
import { LoadingView } from "../../../Control/ItemLoading"
import { POPWarningList } from "../../../Controller/POPController"
import { deviceWidth } from "../../../Core/Utility"
import FormGroup from "../../../Content/FormGroup"
import { Badge, Image } from '@rneui/themed'
import AnimatedLottieView from "lottie-react-native"
import { RefreshControl } from "react-native"

export const POPWarningItem = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(false)
    const [dataGroup, setDataGroup] = useState([])
    const [dataProduct, setDataProduct] = useState({ dataView: [], dataFilter: [] })
    const [itemSelect, setItemSelect] = useState({ groupId: 0 })
    const [search, setSearch] = useState('')
    const ref_group = useRef()

    const LoadData = async () => {
        await setLoading(true)
        await POPWarningList(async (mData) => {
            setItemSelect({ groupId: mData[0].groupId })
            await setDataGroup(mData)
            await setDataProduct({ dataView: JSON.parse(mData[0].detailData), dataFilter: JSON.parse(mData[0].detailData) })
        })
        await setLoading(false)
    }
    const filterProduct = async (str) => {
        let mDataFilter = [];
        if (str !== null && str !== undefined && str.length > 0) {
            mDataFilter = dataProduct.dataFilter.filter(i => i.POPName.toLowerCase().match(str.toLowerCase()))
        } else {
            mDataFilter = dataProduct.dataFilter
        }
        setDataProduct({ ...dataProduct, dataView: mDataFilter })
        setSearch(str)
    }
    const handlerItemSelect = async (item, index) => {
        setItemSelect({ groupId: item.groupId })
        let dataProducts = JSON.parse(item.detailData)
        let dataViewSearch = dataProducts.filter(i => i.POPName.toLowerCase().match(search.toLowerCase()))
        await setDataProduct({ dataView: search.length > 0 ? dataViewSearch : dataProducts, dataFilter: dataProducts })
        ref_group.current.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 0.5
        })
    }
    const RenderItemGroup = ({ item, index }) => {
        const onPress = () => {
            handlerItemSelect(item, index)
        }
        const widthItem = deviceWidth / 4
        const backgroundColor = itemSelect.groupId === item.groupId ? appcolor.surface : appcolor.light
        const colorTitle = itemSelect.groupId === item.groupId ? appcolor.danger : appcolor.dark
        const fontWeightTitle = itemSelect.groupId === item.groupId ? '700' : 'normal'
        const totalRow = JSON.parse(item.detailData || [])?.filter(i => i.POPName.toLowerCase().match(search.toLowerCase())).length || 0
        return (
            <TouchableOpacity
                key={`DD_${index}`} onPress={onPress}
                style={{ minWidth: widthItem, padding: 8, backgroundColor: backgroundColor, alignItems: 'center', borderRadius: 20, margin: 5, borderWidth: 1, borderColor: appcolor.light }}>
                <Text style={{ color: colorTitle, fontSize: 14, fontWeight: fontWeightTitle }}>{`${item.groupName} (${totalRow})`}</Text>
                {/* {
                    totalRow > 0 &&
                    < Badge
                        containerStyle={{ position: 'absolute', top: -5, end: -5 }}
                        textStyle={{ color: appcolor.dark, fontSize: 12, fontWeight: '600' }}
                        badgeStyle={{ backgroundColor: appcolor.blacklight, borderRadius: 50 }}
                        value={`${totalRow}`}
                    />
                } */}

            </TouchableOpacity>
        )
    }
    const RenderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1, flexWrap: 'wrap' }}>
                <View key={`I_P_P_${index}`} style={{ width: '100%', padding: 8 }}>
                    <View style={{ backgroundColor: appcolor.light, width: '100%', height: 100, borderRadius: 15, padding: 8 }}>
                        {item.Image !== null && item.Image.length > 0 ?
                            <Image source={{ uri: item.Image }} style={{ width: '100%', height: '100%' }} /> :
                            <AnimatedLottieView autoPlay={false} source={require('../../../Themes/lotties/no_image.json')} />
                        }
                    </View>
                    <Text style={styles.titleItem}>{`${index + 1}. ${item.POPName}`}</Text>
                    <Badge
                        containerStyle={{ position: 'absolute', top: 0, end: 0 }}
                        textStyle={{ color: appcolor.light, fontSize: 13, fontWeight: '600' }}
                        badgeStyle={{ minWidth: 30, height: 30, backgroundColor: appcolor.dark, borderRadius: 50 }}
                        value={item.Quantity}
                    />
                </View>
            </View>
        )
    }
    useEffect(() => {
        LoadData()
        return () => loading
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
        titleItem: { width: '100%', color: appcolor.dark, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 5 },
        numberItem: { width: '100%', color: appcolor.greylight, fontSize: 13, fontWeight: '500', textAlign: 'center' },
        inputStyle: {
            fontSize: 14, color: appcolor.dark, backgroundColor: appcolor.light, fontWeight: '500', alignSelf: 'center',
            width: '50%', textAlign: 'center', borderWidth: 0.5, borderRadius: 10, borderColor: appcolor.grayLight, height: 38
        }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={route.params?.popMenu.wareHouseName || route.params?.popMenu.menuName}
                leftFunc={() => navigation.goBack()}
            />
            <FormGroup
                editable
                containerStyle={{ width: '95%', backgroundColor: appcolor.grayLight, padding: 5, margin: 8, alignSelf: 'center' }}
                inputStyle={{ fontSize: 14, color: appcolor.dark }}
                placeholder='Tìm kiếm sản phẩm'
                iconName='search' value={search}
                onClearTextAndroid={filterProduct}
                handleChangeForm={filterProduct}
            />
            <LoadingView isLoading={loading} title='Đang cập nhật dữ liệu' />
            <View style={{ width: '100%' }}>
                <FlatList
                    ref={ref_group}
                    key={'headeritem'}
                    keyExtractor={(_, index) => index.toString()}
                    style={{ width: '100%' }}
                    snapToAlignment='start'
                    decelerationRate='fast'
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={dataGroup}
                    renderItem={RenderItemGroup}
                />
            </View>
            <FlatList
                style={{ padding: 8 }}
                key={'productlistpop'}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                data={dataProduct.dataView}
                numColumns={2}
                renderItem={RenderItem}
                refreshControl={<RefreshControl refreshing={false} onRefresh={LoadData} />}
                ListFooterComponent={<View style={{ marginBottom: 28 }} />}
            />
        </View>
    )
}