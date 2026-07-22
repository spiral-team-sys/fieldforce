import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Text } from "@rneui/base";
import { Icon } from "@rneui/themed";
import HeaderView from "./Page/HeaderView";
import FunctionView from "./Page/FunctionView";
import LoadingDefault from "../../../Control/ItemLoading/LoadingDefault";
import { LoadingView } from "../../../Control/ItemLoading";
import { SummaryHomeAqua } from "../../Aqua/SummaryHomeAqua";
import { fontWeightBold } from "../../../Themes/AppsStyle";
import { APPDOWNLOAD, downloadAll } from "../../../Controller/DownloadDataController";
import { GetMenu } from "../../../Controller/UserController";
import { ToastSuccess } from "../../../Core/Helper";

const HomeAqua = ({ navigation, isReloadData }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const downloadData = async () => {
        setRefreshing(true);
        await APPDOWNLOAD.downloadMenu();
        await downloadAll(async (e) => {
            setRefreshing(false);
            ToastSuccess(e, "Đồng bộ dữ liệu", "top");
        });
    };

    useEffect(() => {
    }, [isReloadData]);

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.primary },
        summaryContainer: { width: '100%', height: '38%', marginTop: 8, backgroundColor: appcolor.surface },
        menuContainer: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
        menuCard: { width: '95%', height: '50%', alignSelf: 'center', borderRadius: 8, marginTop: 8, backgroundColor: appcolor.light },
        menuHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, padding: 8, borderTopEndRadius: 8, borderTopStartRadius: 8 },
        menuHeaderTitle: { marginStart: 8, width: '50%', fontSize: 15, fontWeight: fontWeightBold, color: appcolor.light },
        menuBody: { width: '100%', height: '90%', borderRadius: 8 },
    });

    if (loading) return <LoadingDefault isLoading={loading} />;

    return (
        <SafeAreaView style={styles.mainContainer}>
            <HeaderView navigation={navigation} />
            {/* Summary */}
            <View style={styles.summaryContainer}>
                <LoadingView title='Đang đồng bộ dữ liệu hệ thống' isLoading={refreshing} />
                <ScrollView
                    contentContainerStyle={{ width: '100%', height: '100%' }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={downloadData}
                        />
                    }
                >
                    <SummaryHomeAqua
                        isLoading={refreshing}
                        navigation={navigation}
                    />
                </ScrollView>
            </View>
            {/* Menu */}
            <View style={styles.menuContainer}>
                <View style={styles.menuCard}>
                    <View style={styles.menuHeader}>
                        <Text style={styles.menuHeaderTitle}>Chức năng</Text>
                        <Icon name='list' type='font-awesome-5' size={18} style={{ flex: 1, textAlign: 'right' }} color={appcolor.light} />
                    </View>
                    <View style={styles.menuBody}>
                        <FunctionView
                            navigation={navigation}
                            isReloadData={isReloadData}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HomeAqua;
