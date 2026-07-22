import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from '@rneui/themed';
import { useSelector } from "react-redux";
import FormGroup from "../../Content/FormGroup";
import { AttendantAPI, AttendantController } from "../../Controller/AttendantController";
import { alertNotify } from "../../Core/Utility";

export const AutoCompleteAddress = ({ itemValue, titleName, placeholder, iconName, isRequire, typeFilter, onChooseItem, isFreeText = false, handleTextChange, isReload, borderInputColor = null }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [isLoading, setLoading] = useState(false)
	const [search, setSearch] = useState(itemValue)
	const [dataShow, setDataShow] = useState([])
	const [_, setMutate] = useState(false)

	const handlerSearch = async (text) => {
		isFreeText && await handleTextChange(text, typeFilter)
		await setSearch(text)
		// if (text !== null && text.length > 5)
		// 	await setTimeout(async () => {
		// 		await AttendantAPI.DataLocationFromAddress(text, async (dataLocation) => {
		// 			await setDataShow(dataLocation)
		// 		})
		// 	}, 500)
		// else
		// 	await setDataShow([])
	}
	const onGetAddress = async () => {
		if (search !== null && search.length > 5)
			await setTimeout(async () => {
				await AttendantController.DataLocationFromAddress(search, async (dataLocation) => {

					if (dataLocation !== null && dataLocation.length > 0)
						await setDataShow(dataLocation)
					else
						alertNotify('Không tìm thấy địa chỉ, vui lòng kiểm tra lại thông tin và tìm kiếm lại')
				})
			}, 500)
		else
			await setDataShow([])
	}
	const handlerSelectItem = (item) => {
		setSearch(item.formatted_address)
		setDataShow([])
		//
		const locationValue = `${item.geometry.location.lat},${item.geometry.location.lng}`
		onChooseItem(item.formatted_address, typeFilter, locationValue)
	}
	useEffect(() => {
		const load = setSearch(itemValue)
		return () => load
	}, [isReload])
	const styles = StyleSheet.create({
		mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
		titleHeader: { width: '100%', fontSize: 13, fontWeight: '700', color: appcolor.blacklight, marginStart: 8 },
		titleItem: { width: '100%', fontSize: 13, fontWeight: '700', color: appcolor.red },
		itemContent: { backgroundColor: appcolor.light, borderRadius: 5, padding: 8, margin: 5, borderWidth: 0.5, borderColor: appcolor.grayLight },
		placeholderHeader: { width: '100%', fontSize: 13, fontWeight: '300', color: appcolor.placeholderText, marginStart: 8, marginBottom: 8, fontStyle: 'italic' },
		inputView: { width: '86%', backgroundColor: appcolor.surface, borderColor: borderInputColor != null ? borderInputColor : appcolor.surface, borderWidth: borderInputColor != null ? 0.8 : 0, borderRadius: 5, marginBottom: 0 }
	})
	const renderItem = (item, index) => {
		const onPress = () => {
			handlerSelectItem(item)
		}
		return (
			<TouchableOpacity key={`iid__${index}`} style={styles.itemContent} onPress={onPress}>
				<View style={{ alignItems: 'center' }}>
					<Text style={styles.titleItem}>{item.formatted_address}</Text>
				</View>
			</TouchableOpacity>
		)
	}
	return (
		<View style={styles.mainItem}>
			<View style={{ width: '100%', flexDirection: 'row', marginBottom: 5 }}>
				{iconName && <Icon name={iconName} type="font-awesome-5" size={15} color={appcolor.blacklight} />}
				{titleName &&
					<Text style={styles.titleHeader}>{`${titleName} `}
						{isRequire && <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>}
					</Text>
				}
			</View>
			<Text style={styles.placeholderHeader}>{`${placeholder} `}</Text>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<FormGroup
					containerStyle={styles.inputView}
					editable
					multiline
					selectTextOnFocus
					useClearAndroid={false}
					value={search}
					defaultValue={itemValue}
					handleChangeForm={handlerSearch}
					onClearTextAndroid={() => setSearch(null)}
				/>
				<TouchableOpacity
					style={{ width: '12%', backgroundColor: appcolor.surface, padding: 8, borderRadius: 5, marginStart: 3 }}
					onPress={onGetAddress}
				>
					<Icon name="search" size={25} color={appcolor.primary} />
				</TouchableOpacity>
			</View>
			<View style={{ marginTop: 8 }}>
				{isLoading && <ActivityIndicator />}
				<ScrollView
					key={'idlistdropdow'}
					showsVerticalScrollIndicator={false}
				>
					{dataShow.map((item, index) => { return renderItem(item, index) })}
				</ScrollView>
			</View>
		</View>
	)
}
