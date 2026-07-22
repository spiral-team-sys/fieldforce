import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";
import { Icon } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import { GetDataAllRegion } from "../../Controller/ShopController";
import { RegionSelected } from "./RegionSelected";

const TYPE = {
    REGION: 'REGION',
    PROVINCE: 'PROVINCE',
    DISTRICT: 'DISTRICT',
    TOWN: 'TOWN'
}


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const RegionMain = ({ typeFilter, titleName, containerStyle, isRequire = false, actionResult, regionId, editableProvince = true, editableArea = true }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [reloadView, setReloadView] = useState(0)
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState({ region: [], province: [], district: [], town: [] })
    const [dataMain, setDataMain] = useState({ region: [], province: [], district: [], town: [], regionAll: [] })
    const [itemRegion, setItemRegion] = useState({
        regionId: null,
        regionName: null,
        provinceCode: null,
        provinceName: null,
        districtCode: null,
        districtName: null,
        townCode: null,
        townName: null
    })
    const styles = StyleSheet.create({
        mainContainer: { flexGrow: 1, padding: 8, marginBottom: 1 },
        itemContent: { backgroundColor: appcolor.light, borderRadius: 5, padding: 8, margin: 5, borderWidth: 0.5, borderColor: appcolor.grayLight },
        itemName: { fontSize: 14, fontWeight: '300', color: appcolor.dark, textAlign: 'center', marginStart: 8, marginEnd: 8 },
        titleHeader: { width: '100%', fontSize: 13, fontWeight: '600', color: appcolor.blacklight, marginStart: 8 },
        filterItemContent: { width: '100%', backgroundColor: appcolor.surface, borderRadius: 5, padding: 3 },
    })
    const LoadData = async () => {
        await setLoading(true)
        await GetDataAllRegion(async (mData) => {
            if (regionId) {
                await loadDataByRegionId(mData, regionId)
            } else {
                const dataDistrict = mData.table2?.filter(it => it.districtCode !== null)
                const dataTown = mData.table3?.filter(it => it.townCode !== null)
                await setData({ region: mData.table, province: mData.table1, district: dataDistrict, town: dataTown, regionAll: mData.table4 })
                await setDataMain({ region: mData.table, province: mData.table1, district: mData.table2, town: mData.table3, regionAll: mData.table4 })
            }
        })
        await setLoading(false)
    }
    const loadDataByRegionId = async (mData, regionIdSelect) => {
        const itemByRegionId = mData?.table4?.find(it => it.regionID == regionIdSelect) || {};
        const itemByProvinceCode = mData?.table1?.find(it => it.provinceCode == itemByRegionId.provinceCode) || {};
        const itemByDistrictCode = mData?.table2?.find(it => it.districtCode == itemByRegionId.districtCode && itemByRegionId.districtCode !== null) || {}
        const itemByTownCode = mData?.table3?.find(it => it.townCode == itemByRegionId.townCode && itemByRegionId.townCode !== null) || {}
        const itemByRegionArea = mData.table.find(it => it.area == itemByProvinceCode.area) || {}

        const lstProvince = itemByProvinceCode.provinceCode ? (mData?.table1?.filter(i => i.area == itemByRegionArea.area && i.provinceCode !== null)) : mData?.table1?.filter(it => it.provinceCode !== null)
        const lstDistrict = itemByDistrictCode.districtCode ? (mData?.table2?.filter(i => i.provinceCode == itemByDistrictCode.provinceCode && i.districtCode !== null)) :
            (itemByProvinceCode.provinceCode ? mData?.table2?.filter(i => i.provinceCode == itemByProvinceCode.provinceCode && i.districtCode !== null) : [])
        const lstTown = itemByTownCode.townCode ? (mData?.table3?.filter(i => i.districtCode == itemByTownCode.districtCode && i.townCode !== null)) :
            (itemByDistrictCode.districtCode ? mData?.table3?.filter(i => i.districtCode == itemByDistrictCode.districtCode && i.townCode !== null) : [])

        const currentRegion = {
            regionId: regionIdSelect,
            regionName: itemByRegionArea?.area || null,
            provinceCode: itemByProvinceCode?.provinceCode || null,
            provinceName: itemByProvinceCode?.provinceName || null,
            districtCode: itemByDistrictCode?.districtCode || null,
            districtName: itemByDistrictCode?.districtName || null,
            townCode: itemByTownCode?.townCode || null,
            townName: itemByTownCode?.townName || null
        }
        await setItemRegion(currentRegion);
        await setData({ region: mData.table, province: lstProvince, district: lstDistrict, town: lstTown, regionAll: mData.table4 })
        await setDataMain({ region: mData.table, province: mData.table1, district: mData.table2, town: mData.table3, regionAll: mData.table4 })
    }
    const handlerItemChoose = (item, type) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        let itemChange = {}
        switch (type) {
            case TYPE.REGION:
                itemChange = {
                    ...itemRegion,
                    regionName: item.area,
                    provinceName: null,
                    provinceCode: null,
                    districtCode: null,
                    districtName: null,
                    townCode: null,
                    townName: null
                }
                //
                const lstProvince = dataMain.province.filter(i => i.area == item.itemName && i.provinceCode !== null)
                setData({ ...data, province: lstProvince, district: [], town: [] })
                break;
            case TYPE.PROVINCE:
                itemChange = {
                    ...itemRegion,
                    regionName: itemRegion.regionName ? itemRegion.regionName : item.area,
                    provinceName: item.provinceName,
                    provinceCode: item.provinceCode,
                    districtCode: null,
                    districtName: null,
                    townCode: null,
                    townName: null
                }
                //
                const lstDistrict = dataMain.district.filter(i => i.provinceCode == item.provinceCode && i.districtCode !== null)
                setData({ ...data, district: lstDistrict, town: [] })
                break
            case TYPE.DISTRICT:
                let itemProvince = {}
                if (!itemRegion.regionName || !itemRegion.provinceCode) {
                    itemProvince = data.province.find(it => it.provinceCode == item.provinceCode)
                }
                itemChange = {
                    ...itemRegion,
                    regionName: itemRegion.regionName ? itemRegion.regionName : itemProvince.area,
                    districtName: item.districtName,
                    districtCode: item.districtCode,
                    provinceName: itemRegion.provinceCode ? itemRegion.provinceName : itemProvince.provinceName,
                    provinceCode: itemRegion.provinceCode ? itemRegion.provinceCode : itemProvince.provinceCode,
                    townCode: null,
                    townName: null
                }
                //
                const arrProvince = itemRegion.provinceCode ? data.province : dataMain.province.filter(i => i.provinceCode == item.provinceCode && i.districtCode !== null)
                const lstTown = dataMain.town.filter(i => i.districtCode == item.districtCode && i.townCode !== null)
                setData({ ...data, province: arrProvince, town: lstTown })
                break;
            case TYPE.TOWN:
                const regionIdByCode = loadRegionId(item)
                itemChange = {
                    ...itemRegion,
                    regionId: regionIdByCode || null,
                    townName: item.townName,
                    townCode: item.townCode,
                    districtName: item.districtName,
                    districtCode: item.districtCode,
                    provinceName: item.provinceName,
                    provinceCode: item.provinceCode
                }
                break;
        }

        setItemRegion(itemChange)
        actionResult(itemChange, typeFilter)
        if ((itemChange.districtCode == null || itemChange.provinceCode == null || itemChange.regionName == null) && (type == TYPE.TOWN)) {
            const dataClone = { table: dataMain.region, table1: dataMain.province, table2: dataMain.district, table3: dataMain.town, table4: dataMain.regionAll }
            loadDataByRegionId(dataClone, itemChange.regionId)
        }
    }
    const loadRegionId = (item) => {
        let itemRegionByCode = {}
        if (item.townCode != null && item.townCode > 0) {
            itemRegionByCode = dataMain.regionAll.find(it => it.townCode == item.townCode && it.districtCode == item.districtCode && it.provinceCode == item.provinceCode)
        } else if (item.districtCode != null && item.districtCode > 0) {
            itemRegionByCode = dataMain.regionAll.find(it => it.districtCode == item.districtCode && it.provinceCode == item.provinceCode)
        } else if (item.provinceCode != null && item.provinceCode > 0) {
            itemRegionByCode = dataMain.regionAll.find(it => it.provinceCode == item.provinceCode)
        }

        // const itemRegionByCode = dataMain.regionAll.find(it =>
        //     (item.townCode > 0 && it.townCode == item.townCode && it.districtCode == item.districtCode && it.provinceCode == item.provinceCode)
        //     || (item.districtCode > 0 && it.districtCode == item.districtCode && it.provinceCode == item.provinceCode)
        //     || (item.provinceCode > 0 && it.provinceCode == item.provinceCode))

        return itemRegionByCode.regionID || 0
    }
    useEffect(() => {
        LoadData()
        return () => false
    }, [])

    return (
        <View style={[styles.mainContainer, containerStyle]}>
            <View style={{ width: '100%', flexDirection: 'row', marginBottom: 5, alignItems: 'center' }}>
                <Icon name='location-arrow' type="font-awesome-5" size={15} color={appcolor.blacklight} />
                {titleName &&
                    <Text style={styles.titleHeader}>{`${titleName} `}
                        {isRequire && <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>}
                    </Text>
                }
                {isLoading && <ActivityIndicator style={{ position: 'absolute', end: 8 }} />}
            </View>
            <RegionSelected
                typeItem={TYPE.REGION}
                //
                isFilter={dataMain.region.length > 5}
                reloadView={reloadView}
                dataItems={data.region}
                itemColor={appcolor.info}
                defaultValue={itemRegion.regionName}
                editable={editableProvince}
                onItemChoose={handlerItemChoose}
            />
            <RegionSelected
                typeItem={TYPE.PROVINCE}
                //
                isFilter={dataMain.province.length > 5}
                reloadView={reloadView}
                placeholder='Tìm kiếm Tỉnh/Thành phố'
                itemColor={appcolor.red}
                dataItems={data.province}
                defaultValue={itemRegion.provinceName}
                editable={editableArea}
                onItemChoose={handlerItemChoose}
            />
            {data?.district?.length > 0 && <RegionSelected
                typeItem={TYPE.DISTRICT}
                //
                reloadView={reloadView}
                isFilter={dataMain.district.length > 5}
                placeholder='Tìm kiếm Quận/Huyện'
                itemColor={appcolor.success}
                dataItems={data.district}
                defaultValue={itemRegion.districtName}
                onItemChoose={handlerItemChoose}
            />}
            {data?.town?.length > 0 && <RegionSelected
                typeItem={TYPE.TOWN}
                //
                reloadView={reloadView}
                isFilter={dataMain.town.length > 5}
                itemColor={appcolor.yellow}
                placeholder='Tìm kiếm Phường/Xã'
                dataItems={data.town}
                defaultValue={itemRegion.townName}
                onItemChoose={handlerItemChoose}
            />}
        </View>
    )
}   