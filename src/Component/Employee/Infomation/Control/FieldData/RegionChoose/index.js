import React, { useEffect, useRef, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import FormGroup from "../../../../../../Content/FormGroup";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { deviceHeight } from "../../../../../../Core/Utility";
import { removeVietnameseTones } from "../../../../../../Core/Helper";
import { Icon, Text } from '@rneui/themed';
import { GroupListDistrict } from "./GroupListDistrict";
import { ButtonAction } from "../../ButtonAction";
import { fontWeightBold } from "../../../../../../Themes/AppsStyle";
import CustomListView from "../../../../../../Control/Custom/CustomListView";
import { SET_EmployeeInfo } from "../../../../../../Redux/action";
import dvhc2025 from '../../../../../../Themes/filedata/dvhc2025.json'
import _ from 'lodash'

export const RegionChoose = ({ itemMain, keyValue, isNewAddress = false }) => {
    const { appcolor, employeeInfo, regionData } = useSelector(state => state.GAppState)
    const [search, _setSearch] = useState({ text: '', isSearch: false })
    const [dataMain, setDataMain] = useState([])
    const [data, setData] = useState([])
    const [_mutate, setMutate] = useState(false)
    const dispatch = useDispatch()
    const refRegionList = useRef()
    //
    const LoadData = async () => {
        if (isNewAddress) {
            await setDataMain(dvhc2025.data)
            await setData(dvhc2025.data)
        } else {
            await setDataMain(regionData)
            await setData(regionData)
        }
    }
    // Handler
    const handlerShowRegion = () => {
        SheetManager.show(`regionchoose_${itemMain.Ref_Id}`)
    }
    const onSearchData = (text) => {
        search.text = text
        setMutate(e => !e)
        //
        const valueSearch = removeVietnameseTones(text).toLowerCase()
        const listUpdate = _.filter(dataMain, (e) => removeVietnameseTones(e.name).toLowerCase().match(valueSearch))
        setData(listUpdate)
    }
    const onFocusSearch = () => {
        search.isSearch = !search.isSearch
        setMutate(e => !e)
    }
    const handlerOpenDetails = async (item) => {
        const _isOpen = !(item.isOpen || false)
        let lstChoose = []
        if (_isOpen) {
            const newEmployeeInfo = { ...employeeInfo, [keyValue]: item.name }
            dispatch(SET_EmployeeInfo(newEmployeeInfo))
            _.map(data, (e) => {
                item.level1_id == e.level1_id && lstChoose.push({ ...e, isOpen: _isOpen })
            })
        } else
            lstChoose = dataMain

        refRegionList?.current.scrollToIndex({ index: 0, animated: true })
        setData(lstChoose)
    }
    const handlerCloseRegion = () => {
        SheetManager.hide(`regionchoose_${itemMain.Ref_Id}`)
    }
    //
    useEffect(() => {
        LoadData()
    }, [])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%' },
        inputContainer: { padding: 3, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.grayLight },
        inputStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
        contentMain: { padding: 8, width: '100%', height: deviceHeight },
        searchContainer: { margin: 8, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { margin: 8, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 14, color: appcolor.light, fontWeight: Platform.OS == 'ios' ? '600' : '700' },
        searchStyle: { fontSize: 13, color: appcolor.primary },
        itemViewMain: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: appcolor.light, marginBottom: 8, elevation: 3, borderWidth: 0.5, borderColor: appcolor.surface, shadowColor: appcolor.dark, shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.3, borderRadius: 8 },
        contentDataView: { width: '100%', height: deviceHeight, marginTop: 8 },
        mainView: { width: '100%', paddingHorizontal: 8, backgroundColor: appcolor.light },
        contentTitle: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark },
        contentSubTitle: { fontSize: 13, fontWeight: '500', color: appcolor.placeholderText },
        closeView: { alignSelf: 'center', position: 'absolute', bottom: deviceHeight / 12, zIndex: 1000 }
    })
    const renderItem = ({ item, index }) => {
        const onPress = () => {
            handlerOpenDetails(item)
        }
        const districtList = item.level2s || []
        return (
            <View key={`it_group_${index}`} style={styles.mainView}>
                <TouchableOpacity style={styles.itemViewMain} onPress={onPress}>
                    {item.isOpen && <Icon type="ionicon" name="checkmark-circle" size={18} color={appcolor.primary} />}
                    <View style={{ marginStart: item.isOpen ? 8 : 0 }}>
                        <Text style={styles.contentTitle}>{item.name}</Text>
                        <Text style={styles.contentSubTitle}>{`${districtList.length} Quận/Huyện/Thị Xã`}</Text>
                    </View>
                </TouchableOpacity>
                {item.isOpen &&
                    <GroupListDistrict
                        key={`group_dt_${item.level1_id}`}
                        type='level1_id'
                        keyValue='name'
                        keyInfo={itemMain.LinkItem}
                        dataDetails={districtList} />
                }
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <FormGroup
                editable={false}
                useClearAndroid={false}
                iconRight='list-alt'
                value={employeeInfo[keyValue] || ''}
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                rightFunc={handlerShowRegion}
            />

            <ActionSheet id={`regionchoose_${itemMain.Ref_Id}`}
                drawUnderStatusBar
                statusBarTranslucent={false}
                safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
                containerStyle={{ flex: 1, backgroundColor: appcolor.light }}
            >
                <SafeAreaView style={styles.contentMain}>
                    <FormGroup
                        editable
                        placeholder='Tìm kiếm địa chỉ'
                        iconName='search'
                        value={search.text}
                        iconColor={search.isSearch ? appcolor.light : appcolor.primary}
                        useClearAndroid={search.text !== null && search.text.length > 0}
                        placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
                        containerStyle={search.isSearch ? styles.searchContainerInput : styles.searchContainer}
                        inputStyle={search.isSearch ? styles.searchInputStyle : styles.searchStyle}
                        handleChangeForm={onSearchData}
                        onClearTextAndroid={onSearchData}
                        onFocus={onFocusSearch}
                        onEndEditing={onFocusSearch}
                    />
                    <View style={styles.contentDataView}>
                        <CustomListView
                            ref={refRegionList}
                            key={`dataregionlist`}
                            keyExtractor={(_item, index) => index.toString()}
                            data={data}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                    <View style={styles.closeView}>
                        <ButtonAction
                            iconName='close'
                            iconSize={24}
                            iconColor={appcolor.light}
                            backgroundColor={appcolor.blacklight}
                            onPress={handlerCloseRegion}
                        />
                    </View>
                </SafeAreaView>
            </ActionSheet>

        </View>
    )
}