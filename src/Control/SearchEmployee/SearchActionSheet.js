import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import FormGroup from "../../Content/FormGroup";
import { useSelector } from "react-redux";
import { removeVietnameseTones } from "../../Core/Helper";
import _ from 'lodash'
import { Text } from '@rneui/themed';
import { deviceHeight } from "../../Core/Utility";

export const SearchActionSheet = ({ data, actionResult }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [dataEmployee, setDataEmployee] = useState([])
	const [dataEmployeeMain, setDataEmployeeMain] = useState([])

	const LoadData = async () => {
		await setDataEmployee(data)
		await setDataEmployeeMain(data)
	}
	useEffect(() => {
		const _load = LoadData()
		return () => _load
	}, [data])
	// Handler
	const onFilterEmployee = (text) => {
		const value = removeVietnameseTones(text)
		const dataFilter = _.filter(dataEmployeeMain, (e) => {
			return removeVietnameseTones(e.employeeCode).toLowerCase().match(value) ||
				removeVietnameseTones(e.employeeName).toLowerCase().match(value)
		})
		setDataEmployee(dataFilter)
	}
	const onSelectedEmployee = (employeeId) => {
		const byEmployee = dataEmployeeMain.map((item) => item.employeeId == employeeId ? { ...item, itemSelect: item.employeeId } : { ...item, itemSelect: 0 })
		setDataEmployee(byEmployee)
	}
	const handlerResultByEmployee = (employeeId) => {
		actionResult(employeeId)
		SheetManager.hide('employees')
	}
	// View
	const renderEmployee = () => {
		const itemEmployee = (item, index) => {
			const isSelected = item.itemSelect == item.employeeId
			const handlerSelected = () => {
				item.itemSelect = item.employeeId
				onSelectedEmployee(isSelected ? 0 : item.employeeId)
				handlerResultByEmployee(isSelected ? 0 : item.employeeId)
			}
			return (
				<TouchableOpacity
					key={`ii_e${index}`}
					style={{ backgroundColor: appcolor.surface, borderRadius: 8, marginBottom: 8, padding: 3 }}
					onPress={handlerSelected} >
					<Text style={!isSelected ? styles.titleEmployee : styles.titleEmployeeSelected}>{`${index + 1}. ${item.employeeCode} - ${item.employeeName}`}</Text>
				</TouchableOpacity>
			)
		}
		return (
			<View style={{ padding: 8 }}>
				{dataEmployee !== null && dataEmployee.length > 0 &&
					dataEmployee.map((item, index) => {
						return itemEmployee(item, index)
					})
				}
			</View>
		)
	}
	const styles = StyleSheet.create({
		searchView: { width: '85%', margin: 8, padding: 5, marginEnd: 16 },
		inputView: { fontSize: 13, color: appcolor.dark },
		titleEmployee: { fontSize: 13, fontWeight: '600', color: appcolor.dark, padding: 8 },
		titleEmployeeSelected: { fontSize: 13, fontWeight: '600', color: appcolor.primary, padding: 8 }
	})
	return (
		<ActionSheet id="employees"
			gestureEnabled
			initialOffsetFromBottom={0.5}
			drawUnderStatusBar={Platform.OS == 'ios'}>
			<View style={{ width: '100%', height: deviceHeight }}>
				{/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
				<FormGroup
					editable
					placeholder='Tìm kiếm nhân viên'
					iconName='search'
					containerStyle={styles.searchView}
					inputStyle={styles.inputView}
					useClearAndroid={false}
					clearButtonMode="never"
					handleChangeForm={onFilterEmployee}
				/>
				{/* <TouchableOpacity onPress={handlerResultByEmployee}>
						<Icon name="arrow-alt-circle-right" solid type="font-awesome-5" size={28} />
					</TouchableOpacity> */}
				{/* </View> */}
				<ScrollView showsVerticalScrollIndicator={false}>
					{renderEmployee()}
				</ScrollView>
			</View>
		</ActionSheet>
	)
}