import React, { useEffect, useMemo, useState } from "react";
import { DeviceEventEmitter, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/themed";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import { UpdateLocationStoreList } from "../../../../Controller/PhotoController";
import { TODAY } from "../../../../Core/Utility";
import { getIdMaxOverview } from "../../../../Controller/WorkController";
import { CheckLocation, LocationEnabled, ToastError, formatPhone, checkLinkType, UUIDGenerator } from "../../../../Core/Helper";
import ShopLocation from "../../ShopLocation";
import NativeCamera from "../../../../Control/NativeCamera";
import { SetShopInfo } from "../../../../Redux/action";
import { LOCATION_INFO } from "../../../../Utils/LocationInfo";
import { UpdateShopInfo } from "../../../../Controller/ShopController";
import ViewPictures from "../../../../Control/Gallary/ViewPictures";
import CustomListView from "../../../../Control/Custom/CustomListView";

const WorkShopInfo = () => {
    const { appcolor, shopinfo } = useSelector(state => state.GAppState);
    const [isMap, setIsMap] = useState(false);
    const [urlImage, setUrlImage] = useState(null);
    const [latitudePo, setLatitudePo] = useState(0);
    const [longitudePo, setLongitudePo] = useState(0);
    const [pictureShow, setPictureShow] = useState({ visible: false, index: 0, dataShow: [] });
    const isFocused = useIsFocused();
    const dispatch = useDispatch();

    const delay = ms => new Promise(res => setTimeout(res, ms));
    const imagePath = useMemo(() => checkLinkType(urlImage || shopinfo?.imageUrl), [urlImage, shopinfo?.imageUrl]);
    const shopRows = useMemo(() => ([
        { label: "Mã cửa hàng", value: shopinfo?.shopCode || "-" },
        { label: "Cửa hàng", value: shopinfo?.shopName || "-" },
        { label: "Tỉnh/TP", value: shopinfo?.province || "-" },
        { label: "Quận/huyện", value: shopinfo?.district || "-" },
        { label: "Phường/xã", value: shopinfo?.town || "-" },
        { label: "Số nhà/Đường", value: shopinfo?.address || "-" },
        { label: "Khu vực", value: shopinfo?.region || "-" },
        { label: "Vùng", value: shopinfo?.area || "-" },
        { label: "Diện tích", value: shopinfo?.storeSize?.toString() || "-" },
        { label: "Người liên hệ", value: shopinfo?.contactName || "-" },
        { label: "Số điện thoại", value: formatPhone(shopinfo?.phone || "") || "-" },
        { label: "Email", value: shopinfo?.email || "-" }
    ]), [shopinfo]);

    const loadData = async () => {
        const urlOverview = shopinfo?.imageUrl || null;
        if (urlOverview !== null) {
            setUrlImage(urlOverview);
        }

        const lstOverview = await getIdMaxOverview(shopinfo.shopId, TODAY);
        if (lstOverview.length > 0) {
            const latest = lstOverview[0];
            if (latest.photoPath !== "") {
                setUrlImage(latest.photoPath);
                if ((shopinfo.latitude === 0 || shopinfo.longitude === 0) && latest.latitude && latest.longitude) {
                    await UpdateLocationStoreList(latest.latitude, latest.longitude, shopinfo.shopId);
                    dispatch(SetShopInfo({ ...shopinfo, latitude: latest.latitude, longitude: latest.longitude }));
                }
            }
        }
    };

    const callBackOverView = async (info) => {
        await dispatch(SetShopInfo({ ...shopinfo, imageUrl: info.imageUrl }));
        await UpdateShopInfo({ ...shopinfo, imageUrl: info.imageUrl });
        await DeviceEventEmitter.emit("RELOADSHOP");
        setUrlImage(info.imageUrl);
    };

    const getLocationLast = () => {
        return new Promise(resolve => {
            LOCATION_INFO.getCurrentLocation(info => {
                setLatitudePo(info.latitude);
                setLongitudePo(info.longitude);
                resolve(info);
            }, error => {
                ToastError(error.message);
                resolve(null);
            });
        });
    };

    const takeOverview = async () => {
        const photoinfo = {
            shopId: shopinfo.shopId,
            shopCode: shopinfo.shopCode,
            reportId: -1,
            photoDate: shopinfo.auditDate || TODAY,
            photoTime: parseInt(moment(new Date()).format("YYYYMMDDHHmmss"), 10),
            photoType: "-1",
            dataUpload: 0,
            fileUpload: 0,
            photoPath: null,
            latitude: latitudePo,
            longitude: longitudePo,
            guid: UUIDGenerator(),
            photoFullTime: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        };
        await LocationEnabled(async (enabled) => {
            if (enabled === true) {
                if ((shopinfo.latitude === 0 || shopinfo.longitude === 0) && (!photoinfo.latitude || !photoinfo.longitude)) {
                    const lastLocation = await getLocationLast();
                    if (lastLocation) {
                        await delay(150);
                    }
                }
                NativeCamera.cameraStart({ ...photoinfo, latitude: latitudePo, longitude: longitudePo }, { ...shopinfo, callBackOverView });
            } else {
                CheckLocation(() => {
                    LocationEnabled(enabledAfterRequest => {
                        if (enabledAfterRequest) {
                            NativeCamera.cameraStart({ ...photoinfo, latitude: latitudePo, longitude: longitudePo }, { ...shopinfo, callBackOverView });
                        }
                    });
                });
            }
        });
    };

    const handlerPressImage = () => {
        if (!imagePath) {
            return;
        }
        setPictureShow({
            visible: true,
            index: 0,
            dataShow: [{ photoPath: imagePath, photoType: "OVERVIEW" }]
        });
    };

    const handlerCloseImage = () => {
        setPictureShow({ visible: false, index: 0, dataShow: [] });
    };

    useEffect(() => {
        loadData();
        getLocationLast();

        const goShopMapListener = DeviceEventEmitter.addListener("GO_SHOP_MAP", async () => { setIsMap(true) });
        const takePhotoListener = DeviceEventEmitter.addListener("TAKE_PHOTO_OVERVIEW", async () => { await takeOverview() });

        return () => {
            goShopMapListener.remove();
            takePhotoListener.remove();
        };
    }, [isFocused]);

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        scrollContainer: { paddingHorizontal: 12, paddingBottom: 28, paddingTop: 10 },
        toggleWrap: {
            flexDirection: "row",
            backgroundColor: appcolor.surface,
            borderRadius: 30,
            padding: 4
        },
        toggleButton: {
            flex: 1,
            borderRadius: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8
        },
        toggleText: { fontWeight: "600", marginLeft: 6, fontSize: 13 },
        mediaCard: {
            marginTop: 10,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: appcolor.surface,
            minHeight: 240
        },
        imageWrapper: { minHeight: 240, justifyContent: "center", alignItems: "center", backgroundColor: appcolor.surface },
        image: { width: "100%", minHeight: 240 },
        emptyImageText: { color: appcolor.greydark, fontSize: 14, fontStyle: "italic" },
        mapContainer: { width: "100%", minHeight: 240 },
        captureButton: {
            position: "absolute",
            right: 12,
            bottom: 12,
            backgroundColor: appcolor.white,
            borderRadius: 22,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center"
        },
        captureText: { color: appcolor.dark, fontWeight: "700", marginLeft: 6 },
        infoCard: {
            marginTop: 12,
            backgroundColor: appcolor.surface,
            borderRadius: 14,
            padding: 12
        },
        infoTitle: { fontSize: 16, fontWeight: "700", color: appcolor.dark, marginBottom: 8 },
        rowLine: {
            flexDirection: "row",
            alignItems: "center",
            minHeight: 40,
            borderBottomWidth: 1,
            borderBottomColor: appcolor.greylight + "40"
        },
        rowLabel: { flex: 0.42, fontSize: 12, color: appcolor.greydark, fontWeight: "600", paddingRight: 10 },
        rowValue: { flex: 0.58, fontSize: 12, color: appcolor.dark, textAlign: "right" },
        rowLast: { borderBottomWidth: 0 }
    });

    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.mainContainer} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.toggleWrap}>
                    <TouchableOpacity
                        onPress={() => setIsMap(false)}
                        style={[styles.toggleButton, { backgroundColor: !isMap ? appcolor.primary : "transparent" }]}
                    >
                        <Icon size={17} color={!isMap ? appcolor.white : appcolor.dark} name="image" type="ionicon" />
                        <Text style={[styles.toggleText, { color: !isMap ? appcolor.white : appcolor.dark }]}>Hình tổng quan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsMap(true)}
                        style={[styles.toggleButton, { backgroundColor: isMap ? appcolor.primary : "transparent" }]}
                    >
                        <Icon size={17} color={isMap ? appcolor.white : appcolor.dark} name="map" type="font-awesome-5" />
                        <Text style={[styles.toggleText, { color: isMap ? appcolor.white : appcolor.dark }]}>Bản đồ</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.mediaCard}>
                    {!isMap ? (
                        <TouchableOpacity style={styles.imageWrapper} onPress={handlerPressImage}>
                            {imagePath ? (
                                <Image source={{ uri: imagePath }} style={styles.image} />
                            ) : (
                                <Text style={styles.emptyImageText}>Chưa có hình tổng quan</Text>
                            )}
                            <TouchableOpacity style={styles.captureButton} onPress={takeOverview}>
                                <Icon size={18} color={appcolor.dark} name="camera-outline" type="ionicon" />
                                <Text style={styles.captureText}>Chụp hình</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.mapContainer}>
                            <ShopLocation />
                        </View>
                    )}
                </View>
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Thông tin cửa hàng</Text>
                    <CustomListView
                        data={shopRows}
                        scrollEnabled={false}
                        bottomView={{ paddingBottom: 0 }}
                        renderItem={({ item, index }) => (
                            <View style={[styles.rowLine, index === shopRows.length - 1 && styles.rowLast]}>
                                <Text style={styles.rowLabel} numberOfLines={1}>{item.label}</Text>
                                <Text style={styles.rowValue} numberOfLines={3}>{item.value}</Text>
                            </View>
                        )}
                    />
                </View>
                <View style={{ height: Platform.OS == 'android' ? 64 : 128 }} />
            </ScrollView>

            <ViewPictures
                visible={pictureShow.visible}
                images={pictureShow.dataShow}
                initialIndex={pictureShow.index}
                onSwipeDown={handlerCloseImage}
            />
        </View>
    );
};

export default WorkShopInfo;