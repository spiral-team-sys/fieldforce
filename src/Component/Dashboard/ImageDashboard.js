import React, { useRef, useState } from "react";
import { FlatList, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import ActionSheet from "react-native-actions-sheet";
import Icon from '@react-native-vector-icons/fontawesome6';
import ImageZoom from "../../Content/ImageZoom";
import { MultipleShowImage } from "../../Control/MultipleShowImage";
import { URLDEFAULT } from "../../Core/URLs";

export const ImageDashboard = ({ lstPhoto, appcolor, dataPhoto }) => {
    const bottomSheet = useRef()
    const [imageUrl, setImageUrl] = useState(null)
    const [imageIndex, setImageIndex] = useState(0)
    const showImage = (isShow) => {
        isShow ? bottomSheet.current.show() : bottomSheet.current.hide()
    }

    const onShowImage = (item) => {
        const index = dataPhoto.findIndex(it => it.photoPath === item.photoPath)
        setImageIndex(index)
        showImage(true)
    }

    const renderItemPhoto = ({ item, index }) => {
        const photoPath = item.photoPath.indexOf('https://') === - 1 ? URLDEFAULT + item.photoPath : item.photoPath
        return (
            <View key={`112_${index}`} style={{ flex: 1, padding: 5 }}>
                <TouchableOpacity
                    style={{ borderRadius: 10, borderRadius: 10 }}
                    onPress={() => onShowImage(item)}>
                    {/* onPress={() => onShowImage(item.photoPath.indexOf('https://') === - 1 ? URLDEFAULT + item.photoPath : item.photoPath)}> */}
                    <ImageBackground
                        imageStyle={{ borderRadius: 10 }}
                        source={{ uri: photoPath }}
                        style={{ width: '100%', borderRadius: 10, height: 130, zIndex: 3 }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1, borderRadius: 10 }}>
                <View style={{ width: '100%', borderRadius: 5, backgroundColor: appcolor.secondary, padding: 10, marginVertical: 5 }}>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: 'bold', fontStyle: 'italic', color: appcolor.dark }}>{item.title}</Text>
                </View>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1, }}
                    keyExtractor={(_, index) => index.toString()}
                    data={item.listPhoto}
                    renderItem={renderItemPhoto}
                    numColumns={2}
                />
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, }}
                keyExtractor={(_, index) => index.toString()}
                data={lstPhoto}
                renderItem={renderItem}
                ListFooterComponent={<View style={{ height: 100 }} />}
            />
            <ActionSheet ref={bottomSheet}>
                <View style={{ width: '100%', height: '100%', backgroundColor: appcolor.light }}>
                    <MultipleShowImage key={'ShowItemImage'} listItem={dataPhoto} closeShowImage={() => showImage(false)} indexItem={imageIndex} isShowTitle={true} titleFeild='photoNote' />
                    {/* <ImageZoom ImagePath={imageUrl} />
                    <TouchableOpacity onPress={() => showImage(null)}
                        style={{ position: 'absolute', right: 20, top: 40, zIndex: 100 }}>
                        <Icon name='times' type='font-asomeware-5' size={30} color={appcolor.dark} />
                    </TouchableOpacity> */}
                </View>
            </ActionSheet>
        </View>
    )
}
