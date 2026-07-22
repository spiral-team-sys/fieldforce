import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Icon, Text } from '@rneui/themed';
import { APPNAME, AppNameBuild, BUNDLE_ANDROID, URLDEFAULT, psvApp } from "../../Core/URLs";
import { Platform } from "react-native";
import { MessageInfo, onShareLocalFile, } from "../../Core/Helper";
import DeviceInfo from 'react-native-device-info';
import { insets } from "../../Core/Utility";
import { closeDatabase, openDatabaseLocal } from "../../Core/SqliteDbContext";
import { DataAPI } from "../../API/DataAPI";
import CustomListView from "../Custom/CustomListView";
import { fontWeightBold } from "../../Themes/AppsStyle";
import useApp from "../../Hooks/useApp";
import { SetKpiInfo } from "../../Redux/action";
let RNFS = require('react-native-fs');

const versionApp = DeviceInfo.getVersion();
const DrawerMenu = ({ navigation }) => {
	const { logout } = useApp()
	const { appcolor, userinfo } = useSelector(state => state.GAppState)
	const [dataMenu, setDataMenu] = useState([])
	const dispatch = useDispatch()

	const LoadData = async () => {
		await DataAPI.GetDrawMenu(setDataMenu)
	}
	// Handler
	const onMenuItemPress = async (item) => {
		console.log('menu draw', item);

		if (item.pageName !== null) {
			dispatch(SetKpiInfo(item));
			navigation.navigate('HomeMain', { screen: item.pageName })
			navigation.closeDrawer()
		} else {
			await handlerSendEmail(item)
		}
	}
	const handlerSendEmail = async () => {
		const db = await openDatabaseLocal(userinfo)
		await closeDatabase(db)
		const dbName = (AppNameBuild == psvApp ? "pns_" : "data_") + userinfo?.employeeId + ".db"
		const path = Platform.OS === 'ios' ? `${RNFS.LibraryDirectoryPath}/LocalDatabase/` : `file:///data/data/${BUNDLE_ANDROID}/databases/`;
		const pathFile = `${path}${dbName}`;
		RNFS.exists(pathFile).then(async exists => {
			if (exists) {
				const options = {
					title: 'Hỗ trợ app',
					type: 'application/x-sqlite3',
					fileName: dbName,
					url: pathFile,
					message: `File được xuất ra gửi từ ứng dụng ${APPNAME}`
				}
				await onShareLocalFile(options);
			} else {
				MessageInfo("Không tìm thấy được dữ liệu")
			}
		})
	}
	const handlerLogout = () => {
		onCloseDrawer()
		logout()
	}
	const onCloseDrawer = () => {
		navigation.closeDrawer()
	}
	// View
	useEffect(() => {
		LoadData()
	}, [])
	const styles = StyleSheet.create({
		mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 8, paddingTop: insets().top },
		contentView: { flex: 1, padding: 8 },
		avatarView: { width: 90, height: 90, borderRadius: 20, borderWidth: 0.4, borderColor: appcolor.dark, justifyContent: 'center', alignItems: 'center', marginStart: 8, overflow: 'hidden' },
		signoutView: { position: 'absolute', bottom: insets().bottom + 8, width: '100%' },
		titleView: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 8 },
		titleName: { fontSize: 15, fontWeight: '500', color: appcolor.blacklight, marginStart: 8 },
		lineView: { borderColor: appcolor.surface, borderWidth: 0.5, width: '100%' },
		headerView: { alignItems: 'center', padding: 16, marginBottom: 1, flexDirection: 'row', justifyContent: 'space-between' },
		buttonClose: { backgroundColor: appcolor.surface, padding: 12, borderRadius: 50, shadowRadius: 50, borderWidth: 1, borderColor: appcolor.surface },
		titleAppName: { fontWeight: 'bold', fontSize: 13, color: appcolor.primary, textAlign: 'right' },
		titleVersion: { textAlign: 'right', color: appcolor.blacklight, fontSize: 11 },
		employeeView: { padding: 8 },
		titleEmployeeCode: { fontSize: 12, fontWeight: '500', color: appcolor.placeholderText },
		titleEmployee: { fontSize: 16, fontWeight: fontWeightBold, color: appcolor.blacklight },
		buttonLogout: { width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }
	})
	const renderItem = ({ item }) => {
		const handlerMenuItem = () => {
			onMenuItemPress(item)
		}
		return (
			<TouchableOpacity onPress={handlerMenuItem}>
				<View style={styles.titleView}>
					<Icon name={item.iconName} type="ionicon" size={24} color={appcolor.blacklight} />
					<Text style={styles.titleName}>{item.menuName}</Text>
				</View>
				<View style={styles.lineView} />
			</TouchableOpacity>
		)
	}
	return (
		<View style={styles.mainContainer}>
			<View style={styles.headerView}>
				<TouchableOpacity onPress={onCloseDrawer} style={styles.buttonClose} >
					<Icon name="close" size={18} color={appcolor.primary} />
				</TouchableOpacity>
				<View>
					<Text style={styles.titleAppName}>{APPNAME}</Text>
					<Text style={styles.titleVersion}>{`Phiên bản: ${versionApp}`}</Text>
				</View>
			</View>
			<View style={styles.avatarView}>
				{userinfo?.photo !== undefined && userinfo?.photo !== null ?
					<Avatar size={100} source={{ uri: userinfo?.photo.includes('uploaded') ? (URLDEFAULT + userinfo?.photo) : (userinfo?.photo || '') }} />
					:
					<Avatar size={82} rounded icon={{ name: "user", type: "font-awesome", color: appcolor.dark }} containerStyle={{ backgroundColor: appcolor.light }} />
				}
			</View>
			<View style={styles.employeeView}>
				<Text style={styles.titleEmployeeCode}>{`Mã nhân viên: ${userinfo?.employeeCode || 'Chưa có thông tin'}`}</Text>
				<Text style={styles.titleEmployee}>{userinfo?.employeeName}</Text>
			</View>
			<View style={styles.contentView}>
				<CustomListView
					key='menudrawer'
					data={dataMenu}
					renderItem={renderItem}
				/>
			</View>
			<View style={styles.signoutView}>
				<TouchableOpacity style={styles.buttonLogout} onPress={handlerLogout}>
					<Icon name='logout' type="Ionicons" size={24} color={appcolor.greylight} style={{ padding: 8 }} />
					<Text style={{ fontSize: 15, fontWeight: '300', color: appcolor.greylight }}>Đăng xuất</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
export default DrawerMenu;