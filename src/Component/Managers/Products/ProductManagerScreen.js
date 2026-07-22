import React, { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "@rneui/themed";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { LoadingView } from "../../../Control/ItemLoading";
import CustomListView from "../../../Control/Custom/CustomListView";
import { SearchData } from "../../../Control/SearchData/SearchData";
import { productReload } from "../../../Controller/DownloadDataController";
import { getCompetitorByProduct } from "../../../Controller/StockOutController";
import { getAllProduct } from "../../../Controller/WorkController";
import { colorList, formatNumber, ToastSuccess } from "../../../Core/Helper";
import { removeDuplicate } from "../../../Core/Utility";
import { fontWeightBold, styleDefault } from "../../../Themes/AppsStyle";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@rneui/base";

const ProductManagerScreen = ({ navigation }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [sections, setSections] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [rootProduct, setRootProduct] = useState([])
    const [details, setDetail] = useState([])
    const [sheetTitle, setSheetTitle] = useState('')
    const [modalVisible, setModalVisible] = useState(false)

    // region — actions
    const LoadData = async () => {
        setLoading(true)
        const listProduct = await getAllProduct()
        let listCompetitor = await getCompetitorByProduct()
        listCompetitor = listCompetitor.map((item) => {
            item.listProduct = listProduct.filter(a => a.division === item.itemName)
            item.groupData = removeDuplicate(item.listProduct, "categoryId").map((g) => {
                const products = item.listProduct.filter(p => p.categoryId === g.categoryId)
                return { id: g.categoryId, name: g.category || 'N/A', products, count: products.length }
            })
            return item
        })
        setSections(listCompetitor)
        setLoading(false)
    }

    const reloadProduct = async () => {
        await productReload(async (e) => {
            await LoadData()
            ToastSuccess(e, "Đồng bộ sản phẩm", "top")
        })
    }

    const onBack = () => navigation.goBack()

    const onShowChip = (chip) => {
        setRootProduct(chip.products)
        setDetail(chip.products)
        setSheetTitle(chip.name)
        setModalVisible(true)
    }

    const filterProduct = (text) => {
        if (text && text.length > 0) {
            const lower = text.toLowerCase()
            const filtered = rootProduct.filter(item => {
                const nameProduct = `${item.productName} ${item.productCode} ${item?.subCategory || ''} ${item?.segment || ''}`.toLowerCase()
                return nameProduct.includes(lower)
            })
            setDetail(filtered)
        } else {
            setDetail(rootProduct)
        }
    }

    // region — derived data
    const filteredSections = useMemo(() => {
        if (!search.trim()) return sections
        const lower = search.toLowerCase()
        return sections.reduce((acc, section) => {
            const chips = section.groupData.filter(c => (c.name || '').toLowerCase().includes(lower))
            if (chips.length > 0 || (section.name || '').toLowerCase().includes(lower))
                acc.push({ ...section, groupData: chips.length ? chips : section.groupData })
            return acc
        }, [])
    }, [sections, search])

    useEffect(() => { LoadData() }, [])

    // region — styles
    const styles = StyleSheet.create({
        ...styleDefault(appcolor),
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        section: { marginHorizontal: 12, marginBottom: 8 },
        sectionLabel: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.greylight, letterSpacing: 0.8, marginVertical: 6 },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        chip: { backgroundColor: appcolor.surface, minWidth: 80, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, alignItems: 'center', gap: 6 },
        chipText: { fontSize: 14, fontWeight: '500', color: appcolor.dark },
        badgeView: { width: 36, height: 36, borderRadius: 18, backgroundColor: appcolor.primary, justifyContent: 'center', alignItems: 'center' },
        badgeText: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.light },
        productRow: { flex: 1, flexDirection: 'row', marginBottom: 3, paddingBottom: 5, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight, backgroundColor: appcolor.light },
        productIndex: { flex: 1.5, fontSize: 14, fontWeight: '400', color: appcolor.dark, textAlign: 'center' },
        productInfo: { flex: 6, backgroundColor: appcolor.light, flexDirection: 'column' },
        productName: { fontSize: 15, fontWeight: '600', color: appcolor.dark },
        productMeta: { fontSize: 13, fontWeight: '400', color: appcolor.greydark },
        productPrice: { flex: 2.5, fontSize: 14, fontWeight: '500', color: appcolor.dark, textAlign: 'center' },
    })

    // region — render helpers
    const renderChips = (section, sectionIndex) => section.groupData.map((chip, idx) => {
        console.log(section, chip);

        return (
            <TouchableOpacity
                key={`${section.id}_${chip.id}_${idx}`}
                onPress={() => onShowChip(chip)}
                style={styles.chip}
                activeOpacity={0.75}>
                <Avatar
                    containerStyle={{ backgroundColor: colorList[sectionIndex % colorList.length] }}
                    titleStyle={{ fontSize: 24, fontWeight: '600' }}
                    rounded
                    size='large'
                    title={chip.count || 0}
                />
                <Text style={styles.chipText}>{chip.name}</Text>
            </TouchableOpacity>
        )
    })

    const renderItem = ({ item, index }) => (
        <View style={styles.section}>
            <Text style={styles.sectionLabel}>{(item.name || '').toUpperCase()}</Text>
            <View style={styles.chipRow}>{renderChips(item, index)}</View>
        </View>
    )

    const renderItemProduct = ({ item, index }) => (
        <View style={styles.productRow}>
            <Text style={styles.productIndex}>{`${index + 1}. `}</Text>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productMeta}>{item.productCode}</Text>
                <Text style={styles.productMeta}>{`${item.subCategory || ''} ${item.segment || ''}`}</Text>
            </View>
            <Text style={styles.productPrice}>{formatNumber(item.price, ',') || 0}</Text>
        </View>
    )

    // region — view
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom title={'Quản lý sản phẩm'} leftFunc={onBack} />
            <SearchData placeholder="Tìm kiếm danh mục" onSearchData={setSearch} />
            <LoadingView title="Đang tải dữ liệu sản phẩm" isLoading={loading} styles={styles.loadingView} />
            <CustomListView
                data={filteredSections}
                renderItem={renderItem}
                onRefresh={reloadProduct}
            />
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} statusBarTranslucent>
                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
                        <SearchData
                            placeholder={`Tìm sản phẩm trong ${sheetTitle}`}
                            onSearchData={filterProduct}
                        />
                        <CustomListView data={details} extraData={details} renderItem={renderItemProduct} />
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{ position: 'absolute', bottom: 24, alignSelf: 'center' }} >
                            <Icon name="close" color={appcolor.danger} reverse size={24} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </SafeAreaProvider>
            </Modal>
        </View>
    )
}

export default ProductManagerScreen;