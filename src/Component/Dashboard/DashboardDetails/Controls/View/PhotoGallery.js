import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { FlashList } from "@shopify/flash-list";
import { Image, Text } from "@rneui/base";
import moment from "moment";
import { MultipleShowImage } from "../../../../../Control/MultipleShowImage";
import { deviceHeight, deviceWidth, fontWeightBold } from "../../../../../Themes/AppsStyle";
import { URLDEFAULT } from "../../../../../Core/URLs";
import { GroupListData } from "../../../../../Control/GroupListData";
import _ from 'lodash';

export const PhotoGallery = ({ data }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [dataMain, setDataMain] = useState([])
    const [dataPhoto, setDataPhoto] = useState([])
    const [itemShowImage, _setItemShowImage] = useState({ visible: false, photos: [], index: 0 })
    const [isRemoveImage, _setRemoveImage] = useState(false)
    const [_mutate, setMutate] = useState(false)
    //
    const LoadData = async () => {
        if (data !== null && data.length > 0) {
            await setDataMain(data)
            await setDataPhoto(data)
        }
    }
    // Handler
    const handlerShowImage = (index) => {
        itemShowImage.visible = true
        itemShowImage.photos = dataPhoto
        itemShowImage.index = index
        setMutate(e => !e)
    }
    const handlerCloseShowImage = () => {
        itemShowImage.visible = false
        itemShowImage.photos = []
        itemShowImage.index = 0
        setMutate(e => !e)
    }
    const handlerSearchByGroup = async (item, keyValue, isMultiple) => {
        const listChooseGroup = _.map(dataMain, (it, _idx) => {
            if (item.keyValue == it[keyValue]) {
                return { ...it, isChooseTag: it.isChooseTag == 1 ? 0 : 1 }
            }
            else
                return isMultiple ? it : { ...it, isChooseTag: 0 }
        })
        //
        const _productByGroup = _.filter(listChooseGroup, (e) => e.isChooseTag == 1)
        await setDataMain(listChooseGroup)
        if (_productByGroup.length === 0) {
            await setDataPhoto(dataMain);
        } else {
            await setDataPhoto(_productByGroup);
        }
    }
    //
    useEffect(() => {
        const _load = LoadData()
        return () => _load
    }, [data])
    // View
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: deviceHeight },
        itemMain: { margin: 8 },
        titleHead: { fontSize: 15, fontWeight: fontWeightBold, color: appcolor.primary, position: 'absolute', start: 2, top: 8, padding: 8 },
        viewPhoto: { borderRadius: 5, overflow: 'hidden' },
        viewPosition: { flexDirection: 'row', minWidth: 80, position: 'absolute', justifyContent: 'center', top: 0, end: 0, padding: 8, backgroundColor: appcolor.light, zIndex: 10, opacity: 0.9, borderBottomStartRadius: 5 },
        titleTimeView: { fontSize: 13, fontWeight: '700', color: appcolor.primary, textAlign: 'center' },
        buttonCloseView: { padding: 8, paddingTop: 0 },
        contentAction: { padding: 8, width: '100%', flexDirection: 'row', justifyContent: 'flex-end', borderBottomWidth: 0.5, borderBottomColor: appcolor.grayLight },
        actionRemoveView: { position: 'absolute', top: 0, bottom: 0, end: 0, start: 0, zIndex: 100, justifyContent: 'center' },
        viewOpacityRemove: { backgroundColor: 'black', position: 'absolute', top: 0, bottom: 0, end: 0, start: 0, opacity: 0.5 }
    })
    const renderItem = ({ item, index }) => {
        const onPress = () => {
            handlerShowImage(index)
        }
        const keyLayer2 = item[`${item.photoMonth}${item.photoDate}`];
        return (
            <View key={`pg_item_${index}`} style={styles.itemMain}>
                {
                    item.isParent &&
                    <View style={{ padding: 8, marginTop: index !== 0 ? 20 : 5, margin: 5, borderRadius: 10, flexDirection: 'row' }}>
                        <Text style={{ color: appcolor.primary, fontWeight: '900', fontSize: 22 }}>{`${item.photoMonth}`}</Text>
                    </View>
                }
                {
                    keyLayer2 &&
                    <View style={{ padding: 8, marginTop: 8, marginBottom: 8, borderRadius: 10, flexDirection: 'row', backgroundColor: appcolor.primary }}>
                        <Text style={{ color: appcolor.white, fontWeight: '900', fontSize: 16 }}>{`${moment(item.photoDate).format('DD/MM/YYYY')}`}</Text>
                    </View>
                }
                <TouchableOpacity style={styles.viewPhoto} onPress={onPress}>
                    <View style={styles.viewPosition} >
                        <Text style={styles.titleTimeView}>{`${item.photoNote ? item.photoNote + ' -' : ''} ${moment(item.photoTime).format('DD,MMM/YYYY')}`}</Text>
                    </View>
                    <Image
                        source={{ uri: `${URLDEFAULT}${item.photoPath}` }}
                        style={{ width: '100%', height: deviceHeight / 5 }}
                    />
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <GroupListData
                dataMain={dataMain}
                keyName='PhotoGroup'
                keyValue='PhotoGroup'
                handlerChange={handlerSearchByGroup}
            />
            <FlashList
                data={dataPhoto}
                extraData={[isRemoveImage, data]}
                keyExtractor={(_item, index) => index.toString()}
                estimatedItemSize={100}
                renderItem={renderItem}
                ListFooterComponent={<View style={{ paddingBottom: deviceHeight / 5 }} />}
                showsVerticalScrollIndicator={false}
            />
            <Modal visible={itemShowImage.visible}>
                <MultipleShowImage
                    key='showdisplayimage'
                    listItem={itemShowImage.photos || []}
                    indexItem={itemShowImage.index}
                    closeShowImage={handlerCloseShowImage} />
            </Modal>
        </View>
    )
}