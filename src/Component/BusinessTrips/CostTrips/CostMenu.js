import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { AppNameBuild, aquaApp, bshApp, casperApp, hafeleApp, hisenApp, honorApp, hpiApp, lgApp, psvApp, sharpApp, tefalApp, toshibaApp, viessmannApp } from "../../../Core/URLs";
import { CostCasper } from "./CostCasper";
import { CostPanasonic } from "./CostPanasonic";
import { CostPanasonicMultiple } from "./CostPanasonicMultiple";
import { CostViessmann } from "./CostViessmann";
import { MODE } from "../UtilityBusiness";
import { CostViessmannKTV } from "./CostViessmannKTV";
import { CostHisense } from "./CostHisense";
import { CostToshiba } from "./costToshiba";
import { CostSharp } from "./CostSharp";
import { CostGSV } from "./CostGSV";
import { CostAqua } from "./costAqua";
import { CostBosch } from "./CostBosch";
import { CostHPI } from "./CostHPI";
import { CostHonor } from "./CostHonor";
import { CostHafele } from "./CostHafele";
import { CostLG } from "./CostLG";


export const CostMenu = ({ onBack, onNext, dateFilter }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const limitCost = dateFilter?.modeDefault == MODE.UPDATE ? JSON.parse(dateFilter?.limitCost || '[]')[0] || {} : JSON.parse(dateFilter?.limitCostMain || '[]')[0] || {}
    const listProvinceCentral = JSON.parse(dateFilter?.listProvinceCentral || '[]') || []
    const quotaData = JSON.parse(dateFilter?.quotaData || '{}') || {}
    const limitCostSupport = JSON.parse(dateFilter?.limitCostSupport || '[]') || '[]'
    const typeArrow = { titleHeader: 'Chi phí', typeBack: 'arrow-back', typeForward: 'playlist-add-check' }
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light }
    })

    const menuItem = () => {
        switch (AppNameBuild) {
            case psvApp:
                return (
                    userinfo.groupType == 'SUP' ?
                        <CostPanasonicMultiple typeArrow={typeArrow} onBack={onBack} onNext={onNext} /> :
                        <CostPanasonic typeArrow={typeArrow} onBack={onBack} onNext={onNext} />
                )
            case casperApp:
                return <CostCasper typeArrow={typeArrow} onBack={onBack} onNext={onNext} />
            case viessmannApp:
                return (
                    userinfo.groupType == 'SR' ?
                        <CostViessmann typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} /> :
                        <CostViessmannKTV typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} />
                )
            case hisenApp:
                return (
                    <CostHisense typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} quotaData={quotaData} />
                )
            case toshibaApp:
                return (
                    <CostToshiba typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} quotaData={quotaData} />
                )
            case sharpApp:
                return (
                    <CostSharp typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} quotaData={quotaData} />
                )
            case tefalApp:
                return (
                    <CostGSV typeArrow={typeArrow} onBack={onBack} onNext={onNext} quotaData={quotaData} />
                )
            case aquaApp:
                return (
                    <CostAqua typeArrow={typeArrow} onBack={onBack} onNext={onNext} quotaData={quotaData} />
                )
            case bshApp:
                return (
                    <CostBosch typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} quotaData={quotaData} />
                )
            case hpiApp:
                return (
                    <CostHPI typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} quotaData={quotaData} />
                )
            case honorApp:
                return (
                    <CostHonor typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} limitCostSupport={limitCostSupport} quotaData={quotaData} dateFilter={dateFilter} />
                )
            case hafeleApp:
                return (
                    <CostHafele typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} limitCostSupport={limitCostSupport} quotaData={quotaData} dateFilter={dateFilter} />
                )
            case lgApp:
                return (
                    <CostLG typeArrow={typeArrow} onBack={onBack} onNext={onNext} limitCost={limitCost} listProvinceCentral={listProvinceCentral} quotaData={quotaData} />
                )
            default:
                return <CostPanasonic typeArrow={typeArrow} onBack={onBack} onNext={onNext} />
        }
    }
    return (
        <View style={styles.mainContainer}>
            {menuItem()}
        </View>
    )
}