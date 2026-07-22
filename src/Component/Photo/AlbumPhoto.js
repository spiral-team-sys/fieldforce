import { Animated, DeviceEventEmitter, Easing, FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { HeaderCustom } from "../../Content/HeaderCustom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getPhotosReportByPhototype } from "../../Controller/WorkController";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { MultipleShowImage } from "../../Control/MultipleShowImage";
import { Icon } from "@rneui/base";
import { DeleteItem, Store } from "../../Core/SqliteDbContext";

export const AlbumPhoto = ({ navigation, route }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [detailInfo, setDetailInfo] = useState(route.params);
    const [lstShow, setLstShow] = useState({ showALlPhotos: [], isHiddenButton: false });
    const [isAnimatingIcon, setIsAnimatingIcon] = useState(false);
    const [modalImage, setModalImage] = useState({ imageIndex: 0, showImage: false });
    const [reloadView, setReloadView] = useState(false);

    const animatedValue = useRef(new Animated.Value(0)).current;
    const animationLoopRef = useRef(null);

    const loadData = async () => {
        let lstPhotos = await getPhotosReportByPhototype(detailInfo.photoType, detailInfo.shopId, detailInfo.photoDate);
        const mapped = lstPhotos?.map(ele => ({
            ...ele,
            isDelete: isAnimatingIcon
        }));
        setLstShow(mapped);
    };

    useEffect(() => {
        loadData();
    }, []);

    const showActionDelete = (status) => {
        const newListByStatus = lstShow?.map(ele => ({ ...ele, isDelete: status }));
        setLstShow(newListByStatus);
        setIsAnimatingIcon(status);
    };

    const handlerGoback = () => {
        if (detailInfo.callBackReport) {
            DeviceEventEmitter.emit('CALL_BACK_REPORT');
        }
        if (reloadView) {
            DeviceEventEmitter.emit('RELOAD_VIEW');
            navigation.goBack();
        } else navigation.goBack();
    };

    const deleteItem = async (item) => {
        await Store().then(db => DeleteItem(db, 'photos', { id: item.id }));
        setReloadView(true);
        loadData();
    };

    const showImage = (isShow) => {
        isShow ? SheetManager.show('imageSheetAlbum') : SheetManager.hide('imageSheetAlbum');
    };

    const onShowImage = (item) => {
        const index = lstShow.findIndex(it => it.photoPath == item.photoPath);
        setModalImage({ imageIndex: index });
        showImage(true)
    };

    const handleAnimation = (status) => {
        if (status) {
            animationLoopRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(animatedValue, { toValue: -1, duration: 300, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(animatedValue, { toValue: 0, duration: 100, easing: Easing.linear, useNativeDriver: true })
                ])
            );
            animationLoopRef.current.start();
        } else {
            if (animationLoopRef.current) {
                animationLoopRef.current.stop();
            }
            animatedValue.setValue(0);
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1, },
        listWrapper: { flex: 1, },
        flatList: { padding: 10, },
        itemContainer: {
            flex: 1, marginHorizontal: 5, marginTop: 8, borderRadius: 14, overflow: "hidden", backgroundColor: appcolor.light,
            shadowColor: appcolor.dark, shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3,
        },
        itemTouchable: { flex: 1, },
        itemImage: { width: '100%', height: 130, borderRadius: 14, },
        iconContainer: { position: 'absolute', top: 5, right: 5, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', },
        icon: { top: 2, right: 2, },
        actionSheetWrapper: { width: '100%', },
        sheetContent: { width: '100%', height: '100%', },
    });

    const handlerLongPress = () => {
        showActionDelete(true)
        handleAnimation(true)
    }
    const handlerPressDelete = (item) => {
        if (item.isDelete === true) {
            showActionDelete(false);
            handleAnimation(false);
        } else {
            onShowImage(item);
        }
    }


    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onLongPress={() => handlerLongPress()}
                onPress={() => handlerPressDelete(item)}
                delayLongPress={1000}
                style={styles.itemTouchable}
            >
                <Image source={{ uri: item.photoPath }} style={styles.itemImage} />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
                <Animated.View style={{
                    transform: (item.dataUpload !== 1 && item.isDelete === true)
                        ? [{
                            rotate: animatedValue.interpolate({
                                inputRange: [-1, 1],
                                outputRange: ['-0.2rad', '0.2rad']
                            })
                        }] : []
                }}>
                    <Icon
                        style={styles.icon}
                        name={(item?.dataUpload !== 1 && item.isDelete === true) ? 'close' : "check-circle"}
                        size={38}
                        color={
                            (item.isDelete && item?.dataUpload !== 1) ? appcolor.danger :
                                ((item?.fileUpload == 1 && item?.dataUpload == 1) ? appcolor.success :
                                    ((item?.fileUpload == 1 && item?.dataUpload == 0) ? appcolor.warning :
                                        ((item?.fileUpload == 0 && item?.dataUpload == 1) ? appcolor.tomato : 'transparent')))
                        }
                        onPress={() => (item.dataUpload !== 1 && item.isDelete === true) && deleteItem(item)}
                    />
                </Animated.View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: appcolor.surface }]}>
            <HeaderCustom leftFunc={handlerGoback} title={detailInfo.titlePage || 'Quản lý hình ảnh'} />

            <TouchableOpacity style={styles.listWrapper} onLongPress={() => showActionDelete(false)}>
                <FlatList
                    style={styles.flatList}
                    data={lstShow}
                    renderItem={renderItem}
                    numColumns={2}
                />
            </TouchableOpacity>

            <View style={styles.actionSheetWrapper}>
                <ActionSheet id={'imageSheetAlbum'}>
                    <View style={[styles.sheetContent, { backgroundColor: appcolor.light }]}>
                        <MultipleShowImage
                            key={'ShowItemImage'}
                            listItem={lstShow}
                            closeShowImage={() => showImage(false)}
                            indexItem={modalImage.imageIndex}
                        />
                    </View>
                </ActionSheet>
            </View>
        </SafeAreaView>
    );
};
