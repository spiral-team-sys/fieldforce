import React from "react";
import { useSelector } from "react-redux";
import { AppNameBuild, aquaApp, bshApp, casperApp, hafeleApp, hisenApp, honorApp, hpiApp, lgApp, sharpApp, tefalApp, toshibaApp, viessmannApp } from "../../../Core/URLs";
import { ItemResultDefault } from "./ItemResultDefault";
import { ItemResultCasper } from "./ItemResultCasper";
import { View } from "react-native";
import { ItemResultVSM } from "./ItemResultVSM";
import { ItemResultHSS } from "./ItemResultHSS";
import { ItemResultToshiba } from "./ItemResultToshiba";
import { ItemResultSharp } from "./ItemResultSharp";
import { ItemResultGSV } from "./ItemResultGSV";
import { ItemResultAqua } from "./ItemResultAqua";
import { ItemResultBosch } from "./ItemResultBosch";
import { ItemResultHPI } from "./ItemResultHPI";
import { ItemResultHonor } from "./ItemResultHonor";
import { ItemResultHafele } from "./ItemResultHafale";
import { ItemResultLG } from "./ItemResultLG";

export const ItemResultView = ({ item, index, handlerDeleteTrip, handlerConfirmTrip, handlerEditTrips, handlerUploadDocument, handlerReConfirmTrip, handlerCopyTrip, styles }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const ItemView = () => {
		switch (AppNameBuild) {
			case casperApp:
				return <ItemResultCasper
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case viessmannApp:
				return <ItemResultVSM
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case hisenApp:
				return <ItemResultHSS
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case toshibaApp:
				return <ItemResultToshiba
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case sharpApp:
				return <ItemResultSharp
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case tefalApp:
				return <ItemResultGSV
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
					handlerUploadDocument={handlerUploadDocument}
					handlerReConfirmTrip={handlerReConfirmTrip}
				/>
			case aquaApp:
				return <ItemResultAqua
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case bshApp:
				return <ItemResultBosch
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case hpiApp:
				return <ItemResultHPI
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case honorApp:
				return <ItemResultHonor
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case hafeleApp:
				return <ItemResultHafele
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			case lgApp:
				return <ItemResultLG
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
				/>
			default:
				return <ItemResultDefault
					key={`${AppNameBuild}${index}`}
					styles={styles}
					index={index}
					item={item}
					handlerConfirmTrip={handlerConfirmTrip}
					handlerEditTrips={handlerEditTrips}
					handlerDeleteTrip={handlerDeleteTrip}
					handlerUploadDocument={handlerUploadDocument}
					handlerReConfirmTrip={handlerReConfirmTrip}
					handlerCopyTrip={handlerCopyTrip}
				/>
		}
	}
	return (
		<View style={{ flex: 1, backgroundColor: appcolor.light }}>
			{ItemView()}
		</View>
	)
}