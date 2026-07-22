import React from 'react'
import { TouchableOpacity } from "react-native"
import { useSelector } from "react-redux"
import { deviceWidth } from "../../../../Core/Utility"
import { View } from "react-native"
import { Icon, Text } from '@rneui/themed'

export const HeaderItemView = ({ isUploaded, itemHeader, index, handlerCamera, handlerAlbums, handlerNote }) => {
	const { appcolor } = useSelector(state => state.GAppState)

	const RenderButton = ({ iconName, titleName, onAtion }) => {
		const pressItem = () => {
			onAtion(itemHeader)
		}
		return (
			<TouchableOpacity
				style={{ width: deviceWidth / 2.2, backgroundColor: appcolor.surface, marginEnd: 3, marginStart: 3, borderRadius: 5 }}
				key={`iid_acc_${index}`} onPress={pressItem}>
				<View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', padding: 5 }}>
					<Icon type='font-awesome-5' name={iconName} size={21} color={appcolor.yellow} solid />
					<Text style={{ fontSize: 13, fontWeight: '400', color: appcolor.dark, padding: 5, marginStart: 5 }}>{titleName}</Text>
				</View>
			</TouchableOpacity>
		)
	}
	return (
		<View style={{ width: deviceWidth, flexDirection: 'row', borderRadius: 5, justifyContent: 'center' }}>
			{!isUploaded && <RenderButton iconName='camera' titleName='Chụp hình' onAtion={handlerCamera} />}
			<RenderButton iconName='image' titleName='Hình ảnh' onAtion={handlerAlbums} />
			{/* <RenderButton iconName='comment-alt' titleName='Ghi chú' onAtion={handlerNote} /> */}
		</View>
	)
}