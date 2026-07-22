import React from "react";
import HomeVisitReportPage from "../Page/HomeVisitReportPage";

const SurveyListScreen = ({ navigation }) => {
    const onSurveyItem = (item) => {
        navigation.navigate('surveyhomevisit', item)
    }

    return (
        <HomeVisitReportPage
            navigation={navigation}
            headerTitle={'Danh sách khảo sát tại nhà'}
            onSurveyItem={onSurveyItem}
        />
    )
}

export default SurveyListScreen;