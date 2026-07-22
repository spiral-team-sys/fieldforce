import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../../../Content/FormGroup";
import { TextInput } from "../Control/FieldData/TextInput";
import { NumberInput } from "../Control/FieldData/NumberInput";
import { SelectItem } from "../Control/FieldData/SelectItem";
import { ItemChoose } from "../Control/FieldData/ItemChoose";
import { PhoneNumber } from "../Control/FieldData/PhoneNumber";
import { RegionChoose } from "../Control/FieldData/RegionChoose";
import { FlashList } from "@shopify/flash-list";
import { PictureChoose } from "../Control/FieldData/PictureChoose";
import { deviceWidth, fontWeightBold } from "../../../../Themes/AppsStyle";
import { URLDEFAULT } from "../../../../Core/URLs";
import { MultipleShowImage } from "../../../../Control/MultipleShowImage";
import { DateInput } from "../Control/FieldData/DateInput";
import { SupportInfo } from "../Control/SupportInfo";
import { ChangePass } from "../Control/ChangePass";
import { ContactInfo } from "../Control/FieldData/ContactInfo";
import RegionUpdate from "../../../../Control/RegionControl/RegionUpdate";
import _ from 'lodash';

export const ItemDetails = ({ navigation, itemMain }) => {
    const { appcolor, employeeInfo } = useSelector(state => state.GAppState)
    const [dataDetails, setDataDetails] = useState([])
    const [itemShowImage, _setItemShowImage] = useState({ visible: false, photos: [], index: 0 })
    const [_mutate, setMutate] = useState(false)

    const loadData = async () => {
        await setDataDetails(itemMain.DetailList || [])
    }
    // Handler 
    const handlerShowImage = (index, item) => {
        const dataPhoto = JSON.parse(employeeInfo[item.Ref_Code] || '[]')
        itemShowImage.visible = true
        itemShowImage.index = index
        itemShowImage.photos = dataPhoto
        setMutate(e => !e)
    }
    const handlerHideImage = () => {
        itemShowImage.visible = false
        itemShowImage.index = 0
        itemShowImage.photos = []
        setMutate(e => !e)
    }
    //
    useEffect(() => {
        const _load = loadData()
        return () => _load
    }, [employeeInfo])

    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', padding: 8 },
        itemViewMain: { width: '100%' },
        titleView: { width: '100%', fontSize: 14, fontWeight: fontWeightBold, color: appcolor.dark, fontStyle: 'italic' },
        subTitleView: { width: '100%', fontSize: 13, fontWeight: '500', color: appcolor.greylight, fontStyle: 'italic' },
        inputContainer: { padding: 3, marginTop: 5, borderWidth: 0.5, borderColor: appcolor.grayLight },
        inputStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
        titleRequired: { fontSize: 14, color: appcolor.red },
        viewItemMain: { width: '100%' },
        itemMainPhoto: { minWidth: deviceWidth / 2.5, height: 100, margin: 8, marginEnd: 1, borderRadius: 5, borderWidth: 1.5, borderColor: appcolor.grayLight, overflow: 'hidden' },
    })
    const itemEdits = (item) => {
        switch (item.Ref_Name) {
            case 'picture':
                return <PictureChoose itemMain={item} keyValue={item.Ref_Code} />
            case 'phonenumber':
                return <PhoneNumber itemMain={item} keyValue={item.Ref_Code} isEdit={true} />
            case 'date':
                return <DateInput itemMain={item} keyValue={item.Ref_Code} />
            case 'select':
                return <SelectItem itemMain={item} keyValue={item.Ref_Code} />
            case 'multipleselect':
                return null
            case 'region':
                return <RegionChoose itemMain={item} keyValue={item.Ref_Code} isNewAddress />
            case 'checkbox':
                return <ItemChoose itemMain={item} keyValue={item.Ref_Code} />
            case 'number':
                return <NumberInput itemMain={item} keyValue={item.Ref_Code} />
            case 'contactinfo':
                return <ContactInfo itemMain={item} keyValue={item.Ref_Code} />
            case 'regionUpdate':
                return <RegionUpdate
                    isView={false}
                    typeFilter={item.Ref_Code}
                    isRequire={item.IsRequired == 1}
                    titleName={null} isEmployee={true}
                    newRegionId={employeeInfo.newRegionId}
                />
            default:
                return <TextInput itemMain={item} keyValue={item.Ref_Code} />
        }
    }
    const itemView = (item) => {
        const dataPhoto = item.Ref_Name == 'picture' ? JSON.parse(employeeInfo[item.Ref_Code] || '[]') : []
        const renderItemView = (data) => {
            return renderItemPhoto(data.item, data.index, item)
        }
        switch (item.Ref_Name) {
            case 'supportinfo':
                return <SupportInfo itemMain={item} />
            case 'changepass':
                return <ChangePass itemMain={item} keyValue={item.Ref_Code} />
            case 'phonenumber':
                return <PhoneNumber itemMain={item} keyValue={item.Ref_Code} isEdit={false} />
            case 'regionUpdate':
                return <RegionUpdate
                    typeFilter={item.Ref_Code} isView={true}
                    isRequire={item.IsRequired == 1}
                    titleName={null} isEmployee={true}
                    newRegionId={employeeInfo.newRegionId}
                />
            default:
                return (
                    <View style={styles.viewItemMain} key={`itemview`}>
                        {item.Ref_Name == 'picture' && dataPhoto !== null && dataPhoto.length > 0 ?
                            <FlashList
                                horizontal
                                key={`view_photolist_${item.Ref_Code}`}
                                keyExtractor={(_item, index) => index.toString()}
                                estimatedItemSize={50}
                                extraData={dataPhoto}
                                data={dataPhoto}
                                renderItem={renderItemView}
                                showsHorizontalScrollIndicator={false}
                                ListFooterComponent={<View style={{ paddingEnd: 32 }} />}
                            />
                            :
                            <FormGroup
                                editable={itemMain.isUpdate && item.IsLock == 0}
                                useClearAndroid={false}
                                multiline
                                value={employeeInfo[item.Ref_Code] || ''}
                                containerStyle={styles.inputContainer}
                                inputStyle={styles.inputStyle}
                            />
                        }
                    </View>
                )
        }
    }
    const renderItemPhoto = (item, index, itemRef) => {
        const onPressPhoto = () => {
            handlerShowImage(index, itemRef)
        }
        return (
            <TouchableOpacity key={`vpit_ptl_${index}`} style={styles.itemMainPhoto} onPress={onPressPhoto} >
                <Image
                    source={{ uri: `${URLDEFAULT}${item.photoPath}` }}
                    style={{ width: deviceWidth / 2.5, height: 100 }}
                    resizeMode="cover"
                    resizeMethod="resize"
                />
            </TouchableOpacity>
        )
    }
    const renderItem = ({ item, index }) => {
        return (
            <View key={`dimmi_${itemMain.GroupId}_${index}`} style={styles.itemViewMain}>
                {item.ItemName !== null && item.ItemName.length > 0 && <Text style={styles.titleView}>{item.ItemName} <Text style={styles.titleRequired}>{`${item.IsRequired == 1 ? '*' : ''}`}</Text></Text>}
                {item.DescriptionName && itemMain.isUpdate && <Text style={styles.subTitleView}>{item.DescriptionName}</Text>}
                {(!itemMain.isUpdate || item.IsLock == 1) ? itemView(item) : itemEdits(item)}
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <FlashList
                key={`typeList_${itemMain.GroupId}`}
                keyExtractor={(_item, index) => index.toString()}
                estimatedItemSize={100}
                extraData={[itemMain, dataDetails]}
                data={dataDetails}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            />
            <Modal visible={itemShowImage.visible}>
                <MultipleShowImage
                    key='showimageprofile'
                    listItem={itemShowImage.photos || []}
                    indexItem={itemShowImage.index}
                    closeShowImage={handlerHideImage}
                />
            </Modal>
        </View>
    )
}