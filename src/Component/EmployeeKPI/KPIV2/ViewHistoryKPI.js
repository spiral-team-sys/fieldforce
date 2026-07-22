import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import { deviceHeight, deviceWidth } from '../../../Core/Utility';
import FormGroup from '../../../Content/FormGroup';
import { useSelector } from 'react-redux';
import { FlatList } from "react-native-actions-sheet"

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
}

const KPIGroupView = ({ dataHistory = [] }) => {
    const [expandedDates, setExpandedDates] = useState({});
    const [search, _setItemSearch] = useState({ text: '', isSearch: false })
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)

    const toggleDate = (dateKey) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedDates((prev) => ({
            ...prev,
            [dateKey]: !prev[dateKey],
        }));
    };

    const processedData = useMemo(() => {
        return dataHistory.map((it) => {
            const parsedKPIs = JSON.parse(it.KPIs);
            const grouped = _.groupBy(parsedKPIs, 'GroupName');
            return {
                WorkDate: it.WorkDate,
                TotalPoint: it.TotalPoint,
                TotalMPoint: it.TotalMPoint,
                groupedKPIs: grouped,
            };
        });
    }, [dataHistory]);


    const styles = StyleSheet.create({
        dateSection: { marginBottom: 16, backgroundColor: appcolor.surface, borderRadius: 10, shadowColor: appcolor.dark, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, },
        searchContainer: { height: 40, margin: 8, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.light, borderWidth: 0.5, borderColor: appcolor.primary },
        searchContainerInput: { height: 40, margin: 8, padding: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: appcolor.primary, borderWidth: 0.5 },
        searchInputStyle: { fontSize: 13, color: appcolor.light, fontWeight: '500' },
        searchStyle: { fontSize: 13, color: appcolor.primary },
        dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
        dateText: { fontSize: 16, fontWeight: '700', color: appcolor.dark, },
        pointText: { textAlign: 'right', fontSize: 14, fontWeight: '500', color: appcolor.alert, },
        groupContainer: { paddingHorizontal: 12, paddingBottom: 12 },
        groupBox: { marginVertical: 4, padding: 8, backgroundColor: appcolor.light, borderRadius: 8, borderColor: appcolor.surface, borderWidth: 1, },
        groupTitle: { fontWeight: '700', color: appcolor.primary, marginBottom: 4, },
        kpiItem: { marginBottom: 4, },
        KPIName: { fontSize: 14, color: appcolor.dark, },
        KPIscore: { textAlign: 'right', fontSize: 12, color: appcolor.alert, },
    });

    const renderItem = ({ item }) => {
        const isExpanded = expandedDates[item.WorkDate];
        const formattedDate = moment(item.WorkDate?.toString(), 'YYYYMMDD').format('DD/MM/YYYY');
        return (
            <View key={item.WorkDate} style={styles.dateSection}>
                <TouchableOpacity
                    style={{ padding: 12, }}
                    onPress={() => toggleDate(item.WorkDate)}>
                    <View style={styles.dateHeader}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                        <Text style={styles.pointText}>{item.TotalMPoint}</Text>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.groupContainer}>
                        {Object.entries(item.groupedKPIs).map(([GroupName, KPIs], i) => (
                            <View key={`${item.WorkDate}_${GroupName}_${i}`} style={{}}>
                                <Text style={styles.groupTitle}>{GroupName}</Text>
                                <View style={styles.groupBox}>

                                    {KPIs.map((kpi, idx) => (
                                        <View key={kpi.KPIId} style={styles.kpiItem}>
                                            <Text style={styles.groupTitle}>{kpi.SubGroupName}</Text>
                                            <Text style={styles.KPIName}>{kpi.KPIName}</Text>
                                            <Text style={styles.KPIscore}> {kpi.mPoint}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={{ height: deviceHeight * 0.8, width: deviceWidth }}>
            <FlatList
                data={processedData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 12 }}
            />
        </View>
    );
};

export default KPIGroupView;
