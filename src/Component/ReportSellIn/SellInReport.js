import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import SellInModel from '../ReportSellIn/SellInModel';
import { getAllDataConfig } from '../../Controller/SellInController';

export const SellInReport = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [dataConfig, setDataModal] = useState({ dealerList: [], competitorList: [], categoryList: [], subCategoryList: [], segmentList: [], subSegmentList: [], productsList: [] })
    const LoadData = async () => {
        await getAllDataConfig(async (lstDealer, lstCompetitor, lstCategory, lstSubCategory, lstSegment, lstSubSegment, lstProducts) => {
            await setDataModal({
                dealerList: lstDealer,
                competitorList: lstCompetitor,
                categoryList: lstCategory,
                subCategoryList: lstSubCategory,
                segmentList: lstSegment,
                subSegmentList: lstSubSegment,
                productsList: lstProducts
            })
        })
    }
    const handlerUploadData = async () => {

    }
    useEffect(() => {
        LoadData()
        return () => false
    }, [])
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light }
    })
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title='Báo cáo số bán (Sell In)'
                leftFunc={() => navigation.goBack()}
                iconRight='cloud-upload-alt'
                rightFunc={() => handlerUploadData()}
            />
            <SellInModel dataListInput={dataConfig} actionClose={() => console.log('action close')} />
        </View>
    )
}