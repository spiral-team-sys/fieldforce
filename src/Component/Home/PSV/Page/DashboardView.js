import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";

import { DataSummary } from "../../../../Controller/DashboardController";
import { DashboardRouting } from "../../../../Content/Beko/DashboardRouting";
import CustomSlideView from "../../../../Control/Custom/CustomSlideView";
import { DashBoardTargetTF } from "../../../Dashboard/Tefal/DashBoardTargetTF";
import DashboardSlide from "./Control/DashboardSlide";
import { AttendanceCard, BarChartCard, EmptyDashboard, SellOutCard, SSubCard, TargetCard } from "./DashboardCards";

const SLIDE_GAP = 12;
const SLIDE_HORIZONTAL_PADDING = 14;
// Dashboard charts and nested scroll content need a stable carousel height to measure correctly.
const SLIDE_MIN_HEIGHT = 320;

const DASHBOARD_TYPE = {
    menu: "MENU",
    attendance: "ATTENDANT",
    sellOut: "SELLOUT",
    sellIn: "SELLIN",
    kpi5: "KPI5",
    target: "TARGET",
    routing: "ROUTING",
    sSub: "SSUB",
    targetRow: "TARGETROW"
};

const dashboardConfig = [
    { type: DASHBOARD_TYPE.attendance, title: "Chấm công", subtitle: "Tiến độ ngày", icon: "clock" },
    { type: DASHBOARD_TYPE.sellOut, title: "Sell Out", subtitle: "Doanh số ra", icon: "shopping-bag" },
    { type: DASHBOARD_TYPE.sellIn, title: "Sell In", subtitle: "Nhập hàng", icon: "package" },
    { type: DASHBOARD_TYPE.kpi5, title: "KPI5", subtitle: "Hiệu quả", icon: "activity" },
    { type: DASHBOARD_TYPE.target, title: "Target", subtitle: "Chỉ tiêu", icon: "target" },
    { type: DASHBOARD_TYPE.routing, title: "Routing", subtitle: "Lộ trình", icon: "map" },
    { type: DASHBOARD_TYPE.sSub, title: "S-Sub", subtitle: "Tổng hợp", icon: "layers" },
    { type: DASHBOARD_TYPE.targetRow, title: "Target Row", subtitle: "Tiến độ", icon: "list" }
];

const DashboardView = ({ navigation, isReloadData }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const { width } = useWindowDimensions();
    const [menuAccess, setMenuAccess] = useState("");
    const [currentType, setCurrentType] = useState(DASHBOARD_TYPE.attendance);
    const [reloadKey, setReloadKey] = useState(0);
    const [loadingType, setLoadingType] = useState(null);
    const [dashboardData, setDashboardData] = useState({});
    const slideWidth = useMemo(() => width - (SLIDE_HORIZONTAL_PADDING * 2), [width]);
    const styles = useMemo(() => createStyles(appcolor), [appcolor]);

    const slides = useMemo(() => {
        return dashboardConfig
            .filter(item => item.type === DASHBOARD_TYPE.attendance || menuAccess.includes(item.type))
            .flatMap(item => {
                const attendance = dashboardData[DASHBOARD_TYPE.attendance] || [];
                if (item.type !== DASHBOARD_TYPE.attendance || attendance.length < 2) return [item];
                return attendance.map((data, index) => ({
                    ...item,
                    key: `${item.type}_${index}`,
                    subtitle: data.dashboardName || item.subtitle,
                    attendanceData: [data]
                }));
            });
    }, [dashboardData, menuAccess]);

    const loadMenuAccess = useCallback(async () => {
        await DataSummary(DASHBOARD_TYPE.menu, data => {
            setMenuAccess(data?.[0]?.menuList || "");
        });
    }, []);

    const loadDashboard = useCallback(async (type) => {
        if (type === DASHBOARD_TYPE.targetRow) return;
        setLoadingType(type);
        await DataSummary(type, data => {
            if (type === DASHBOARD_TYPE.routing) {
                let routingData = {};
                try {
                    routingData = JSON.parse(data?.[0]?.chartData || "[]")?.[0] || {};
                } catch (error) {
                    routingData = {};
                }
                setDashboardData(current => ({ ...current, [type]: routingData }));
            } else if (type === DASHBOARD_TYPE.sellOut) {
                setDashboardData(current => ({ ...current, [type]: data?.[0] || {} }));
            } else {
                setDashboardData(current => ({ ...current, [type]: data || [] }));
            }
        });
        setLoadingType(null);
    }, []);

    const onSlideChange = useCallback((index) => {
        const type = slides[index]?.type;
        if (!type) return;
        setCurrentType(type);
        if (type !== DASHBOARD_TYPE.targetRow && dashboardData[type] === undefined) {
            loadDashboard(type);
        }
    }, [dashboardData, loadDashboard, slides]);

    const reloadDashboardData = useCallback(() => {
        setReloadKey(current => current + 1);
        setDashboardData({});
        loadMenuAccess();
        loadDashboard(currentType);
    }, [currentType, loadDashboard, loadMenuAccess]);

    useEffect(() => {
        reloadDashboardData();
    }, [isReloadData, reloadDashboardData]);

    useEffect(() => {
        const unsubscribeFocus = navigation?.addListener('focus', reloadDashboardData);

        return () => {
            unsubscribeFocus?.();
        };
    }, [navigation, reloadDashboardData]);

    const renderDashboard = useCallback((type, item) => {
        const data = dashboardData[type];
        if (type !== DASHBOARD_TYPE.targetRow && data === undefined) {
            return <View style={styles.pending}>
                <ActivityIndicator color={appcolor.primary} />
                <Text style={styles.pendingText}>Đang chuẩn bị dữ liệu</Text>
            </View>

        }
        switch (type) {
            case DASHBOARD_TYPE.attendance:
                return <AttendanceCard appcolor={appcolor} data={item.attendanceData || data} navigation={navigation} />;
            case DASHBOARD_TYPE.sellOut:
                return <SellOutCard appcolor={appcolor} data={data} navigation={navigation} />;
            case DASHBOARD_TYPE.sellIn:
                return <BarChartCard appcolor={appcolor} data={data} navigation={navigation} />;
            case DASHBOARD_TYPE.kpi5:
                return <BarChartCard appcolor={appcolor} data={data} navigation={navigation} accentColor={appcolor.highlightDate} />;
            case DASHBOARD_TYPE.target:
                return <TargetCard appcolor={appcolor} data={data} navigation={navigation} />;
            case DASHBOARD_TYPE.routing:
                return data && Object.keys(data).length
                    ? <DashboardRouting navigation={navigation} data={data} />
                    : <EmptyDashboard appcolor={appcolor} />;
            case DASHBOARD_TYPE.sSub:
                return <SSubCard appcolor={appcolor} data={data} />;
            case DASHBOARD_TYPE.targetRow:
                return (
                    <DashBoardTargetTF
                        key={`${DASHBOARD_TYPE.targetRow}_${reloadKey}`}
                        navigation={navigation}
                        typeDashboard={DASHBOARD_TYPE.targetRow}
                        bgViewItem={appcolor.light}
                    />
                );
            default:
                return <EmptyDashboard appcolor={appcolor} />;
        }
    }, [appcolor, dashboardData, navigation, reloadKey, styles]);

    const renderSlide = useCallback((item) => (
        <DashboardSlide
            key={`${item.key || item.type}_${reloadKey}`}
            appcolor={appcolor}
            item={item}
            loading={loadingType === item.type}
        >
            {renderDashboard(item.type, item)}
        </DashboardSlide>
    ), [appcolor, loadingType, reloadKey, renderDashboard]);

    return (
        <View style={styles.mainContainer}>
            <CustomSlideView
                data={slides}
                slideWidth={slideWidth}
                gap={SLIDE_GAP}
                horizontalPadding={SLIDE_HORIZONTAL_PADDING}
                showDots
                containerStyle={styles.slides}
                slideStyle={styles.slide}
                onSlideChange={onSlideChange}
                renderItem={renderSlide}
            />
        </View>
    );
};

const createStyles = (appcolor) => StyleSheet.create({
    mainContainer: {
        backgroundColor: appcolor.transparent,
        paddingTop: 12,
        paddingBottom: 16
    },
    slides: {},
    slide: {
        height: SLIDE_MIN_HEIGHT
    },
    pending: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    pendingText: {
        fontSize: 11,
        color: appcolor.placeholderText,
        marginTop: 8
    }
});

export default DashboardView;
