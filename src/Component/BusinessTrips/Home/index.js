import React from "react";
import { AppNameBuild, aquaApp, bshApp, hafeleApp, hisenApp, honorApp, hpiApp, lgApp, psvApp, sharpApp, tefalApp, toshibaApp, viessmannApp } from "../../../Core/URLs";
import { HomeBusiness } from "./HomeBusiness";
import { HomeBusinessPNS } from "./HomeBusinessPNS";
import { DEVHomeBusiessPNS } from "./DEVHomeBusiessPNS";
import { useSelector } from "react-redux";
import { HomeBusinessVSM } from "./HomeBusinessVSM";
import { HomeBusinessHSS } from "./HomeBusinessHSS";
import { HomeBusinessToshiba } from "./HomeBusinessToshiba";
import { HomeBusinessSharp } from "./HomeBusinessSharp";
import { HomeBusinessGSV } from "./HomeBusinessGSV";
import { HomeBusinessAqua } from "./HomeBusinessAqua";
import { HomeBusinessBosch } from "./HomeBusinessBosch";
import { HomeBusinessHPI } from "./HomeBusinessHPI";
import { HomeBusinessHonor } from "./HomeBusinessHonor";
import { HomeBusinessHafele } from "./HomeBusinessHafele";
import { HomeBusinessLG } from "./HomeBusinessLG";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const HomeBusinessMenu = ({ navigation }) => {
	const { userinfo } = useSelector(state => state.GAppState)
	const componentBusiness = () => {
		switch (AppNameBuild) {
			case psvApp:
				return userinfo.groupType == 'SR' ?
					<HomeBusinessPNS navigation={navigation} />
					:
					<DEVHomeBusiessPNS navigation={navigation} />
			case viessmannApp:
				return <HomeBusinessVSM navigation={navigation} />
			case hisenApp:
				return <HomeBusinessHSS navigation={navigation} />
			case toshibaApp:
				return <HomeBusinessToshiba navigation={navigation} />
			case sharpApp:
				return <HomeBusinessSharp navigation={navigation} />
			case tefalApp:
				return <HomeBusinessGSV navigation={navigation} />
			case aquaApp:
				return <HomeBusinessAqua navigation={navigation} />
			case bshApp:
				return <HomeBusinessBosch navigation={navigation} />
			case hpiApp:
				return <HomeBusinessHPI navigation={navigation} />
			case honorApp:
				return <HomeBusinessHonor navigation={navigation} />
			case hafeleApp:
				return <HomeBusinessHafele navigation={navigation} />
			case lgApp:
				return <HomeBusinessLG navigation={navigation} />
			default:
				return <HomeBusiness navigation={navigation} />
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			{componentBusiness()}
		</SafeAreaView>
	)
}