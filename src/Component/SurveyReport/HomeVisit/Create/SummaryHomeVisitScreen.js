import React from "react";
import { useSelector } from "react-redux";
import HomeVisitReportPage from "../Page/HomeVisitReportPage";

const SummaryHomeVisitScreen = ({ navigation }) => {
    const onCreatePlan = () => {
        navigation.navigate('homevisit')
    }
    const { kpiinfo } = useSelector(state => state.GAppState)

    return (
        <HomeVisitReportPage
            navigation={navigation}
            headerTitle={kpiinfo?.screenTitle || 'Thống kê khảo sát tại nhà'}
            enableCreatePlan
            onCreatePlan={onCreatePlan}
        />
    )
}

export default SummaryHomeVisitScreen;