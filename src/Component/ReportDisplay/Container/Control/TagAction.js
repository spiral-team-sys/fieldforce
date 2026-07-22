import React from "react"
import { FlatList, TouchableOpacity, View } from "react-native"
import { Text } from '@rneui/themed'
import { useSelector } from "react-redux"

export const TagAction = ({ dataTag, title, handlerAction, mode }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const renderItemTag = ({ item, index }) => {
		const onPressItem = () => {
			handlerAction(item, mode)
		}
		return (
			<TouchableOpacity onPress={onPressItem} >
				<View key={`iid_tag_${index}`} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.surface, padding: 5, borderRadius: 5, marginTop: 8 }}>
					<View style={{ height: 20, width: 20, borderRadius: 40, backgroundColor: item.isColor }} />
					<Text style={{ width: '100%', fontSize: 13, fontWeight: '400', padding: 8, color: appcolor.dark }}>{item.name}</Text>
				</View>
			</TouchableOpacity>
		)
	}
	return (
		<View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
			<Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '600', color: appcolor.dark }}>{title}</Text>
			<FlatList
				key='dataTagList'
				keyExtractor={(___, index) => index.toString()}
				data={dataTag}
				renderItem={renderItemTag}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	)
}