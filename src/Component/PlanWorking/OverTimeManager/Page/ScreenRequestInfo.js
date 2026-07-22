import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { DeviceEventEmitter, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSelector } from "react-redux";
import { ShopPermission } from "./ItemPage/ShopPermission";
import { EmployeeList } from "./ItemPage/EmployeeList";
import { ShiftList } from "./ItemPage/ShiftList";
import { ReasonList } from "./ItemPage/ReasonList";
import Pagination from "../Control/Pagination";

export const ScreenRequestInfo = ({ info, dataConfig }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [data, setData] = useState({ employeeList: [], shopPermission: [], shiftList: [], reasonList: [] });
    const [indexPage, setIndexPage] = useState(0);
    const refPage = useRef();

    useEffect(() => {
        setData(dataConfig || { employeeList: [], shopPermission: [], shiftList: [], reasonList: [] });
    }, [dataConfig]);

    const onCallIndex = useCallback((indexChange) => {
        refPage.current?.setPage(indexChange);
    }, []);

    const onReset = useCallback(() => {
        refPage.current?.setPage(0);
        setIndexPage(0);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const _reloadData = DeviceEventEmitter.addListener('RELOAD_REQUEST_INFO', onReset);
        return () => {
            isMounted = false;
            _reloadData.remove();
        };
    }, [onReset]);

    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.light },
        contentContainer: { width: '100%', flex: 1 },
        mainPager: { flex: 1 },
        pageStyle: { flex: 1, alignItems: 'center' }
    });


    const activePages = useMemo(() => {
        const allPages = [
            {
                key: 'shop_permission',
                condition: data.shopPermission && data.shopPermission.length > 0,
                component: (
                    <View key={`shop_permission`} style={styles.pageStyle}>
                        <ShopPermission data={data.shopPermission} info={info} callIndex={onCallIndex} />
                    </View>
                )
            },
            {
                key: 'employee_list',
                condition: data.employeeList && data.employeeList.length > 0,
                component: (
                    <View key={`employee_list`} style={styles.pageStyle}>
                        <EmployeeList data={data.employeeList} info={info} callIndex={onCallIndex} />
                    </View>
                )
            },
            {
                key: 'shift_list',
                condition: data.shiftList && data.shiftList.length > 0,
                component: (
                    <View key={`shift_list`} style={styles.pageStyle}>
                        <ShiftList data={data.shiftList} info={info} callIndex={onCallIndex} />
                    </View>
                )
            },
            {
                key: 'reason_list',
                condition: data.reasonList && data.reasonList.length > 0,
                component: (
                    <View key={`reason_list`} style={styles.pageStyle}>
                        <ReasonList data={data.reasonList} info={info} />
                    </View>
                )
            }
        ];

        return allPages.filter(page => page.condition);

    }, [data, info, onCallIndex]);

    const paginationData = useMemo(() => {
        return activePages.map((_, index) => ({ index: index + 1 }));
    }, [activePages]);

    const onPageSelected = (e) => {
        const index = e.nativeEvent.position;
        setIndexPage(index);
    };

    if (activePages.length === 0) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            </View>
        );
    }
    return (
        <View style={styles.mainContainer}>
            {paginationData.length > 1 && (
                <View style={{ marginTop: 16, marginBottom: 8 }}>
                    <Pagination data={paginationData} index={indexPage} />
                </View>
            )}
            <View style={styles.contentContainer}>
                <PagerView
                    ref={refPage}
                    style={styles.mainPager}
                    initialPage={0}
                    onPageSelected={onPageSelected}
                    key={activePages.length}
                >
                    {activePages.map(page => page.component)}
                </PagerView>
            </View>
        </View>
    );
};