import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { Icon, Text } from '@rneui/themed'
import { useSelector } from "react-redux"
import { deviceHeight } from "../../../../Core/Utility"

export const ToolsAction = ({ clearAllData, clearByCategory, itemInput, tabRef, dataTab, showInputView = false, isLock = false }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const [isShowInput, setShowInput] = useState(showInputView)
	const itemTab = dataTab[tabRef?.current.getCurrentIndex()]
	// 
	const onShow = () => {
		const isShow = !isShowInput
		itemInput(isShow)
		setShowInput(isShow)
	}
	const onDeleteAll = () => {
		clearAllData()
	}
	const onDeleteByCategory = () => {
		clearByCategory(itemTab)
	}
	//
	const RenderButton = ({ title, iconName, iconColor, actionPress, isShowInput = false }) => {
		const styleView = {
			backgroundColor: isShowInput ? appcolor.light : appcolor.surface,
			borderWidth: isShowInput ? 0.5 : 0,
			borderColor: appcolor.success,
			width: '100%', flexDirection: 'row', alignItems: 'center',
			padding: 5, marginTop: 8, borderRadius: 5
		}
		return (
			<TouchableOpacity onPress={actionPress}>
				<View style={styleView}>
					<Icon type='font-awesome-5' name={iconName} size={18} color={iconColor} />
					<Text style={{ width: '100%', fontSize: 14, fontWeight: '400', color: appcolor.dark, padding: 8 }}>{title}</Text>
				</View>
			</TouchableOpacity>
		)
	}
	return (
		<View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
			<Text style={{ width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '600', color: appcolor.dark }}>Công cụ</Text>
			<RenderButton
				title='Xem dữ liệu đã nhập'
				iconName='keyboard'
				iconColor={appcolor.success}
				isShowInput={isShowInput}
				actionPress={onShow} />
			{!isLock && <RenderButton
				title='Xoá tất cả dữ liệu'
				iconName='trash'
				iconColor={appcolor.red}
				actionPress={onDeleteAll} />
			}
			{!isLock && <RenderButton
				title={`Xoá dữ liệu ngành hàng ${itemTab.categoryName || itemTab.CategoryName || ''}`}
				iconName='trash'
				iconColor={appcolor.red}
				actionPress={onDeleteByCategory} />
			}
		</View>
	)
}