import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import Geolocation from '@react-native-community/geolocation'
import _ from 'lodash'
import { deviceHeight } from "../Core/Utility";
import AnimatedLottieView from "lottie-react-native";
import { Text } from '@rneui/themed';

export const LocationTracking = ({ navigation, route }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [dataLocation, setDataLocation] = useState([])
	//
	const onLocationTracking = async () => {
		await Geolocation.getCurrentPosition(async e => {
			const _data = dataLocation
			_data.push(e.coords)
			const resultdata = _.uniqWith(_data, _.isEqual);
			if (resultdata.length < 6) {
				await setDataLocation(resultdata)
			}
		}, r => {
			console.log(r, 'error')
		}, {
			enableHighAccuracy: true,
			timeout: 15000,
			maximumAge: 0,
			distanceFilter: 1,
			forceRequestLocation: true,
		})
	}
	// Handler 
	const callBackData = () => {
		const lengthJson = route?.params?.lengthJson || 0
		if (dataLocation !== null && dataLocation.length == lengthJson) {
			const item = {
				...route?.params,
				dataLocation: JSON.stringify(dataLocation)
			}
			navigation.goBack()
			navigation.navigate('Camera', item);
		}
	}
	useEffect(() => {
		const _getinfo = onLocationTracking()
		const _tracking = setInterval(onLocationTracking, 1000)
		return () => {
			_getinfo
			clearInterval(_tracking)
		}
	}, [])
	useEffect(() => {
		const _goback = callBackData()
		return () => _goback
	}, [dataLocation])
	// View
	const styles = StyleSheet.create({
		mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.primary },
		titleView: { position: 'absolute', textAlign: 'center', fontSize: 18, fontWeight: '700', padding: 8, paddingStart: 16, paddingEnd: 16, bottom: deviceHeight / 3, color: appcolor.light }
	})
	return (
		<SafeAreaView style={styles.mainContainer}>
			<View style={{ width: '100%', height: deviceHeight, justifyContent: 'center' }}>
				<Text style={styles.titleView}>{`Vui lòng di chuyển thiết bị qua lại trong phạm vi vài mét để hệ thống xác định đúng vị trí hiện tại của bạn`}</Text>
				<AnimatedLottieView autoPlay source={require('../Themes/lotties/movephone.json')} />
			</View>
		</SafeAreaView>
	)
} 