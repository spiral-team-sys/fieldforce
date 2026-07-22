import React from "react"
import { TouchableOpacity, View } from "react-native"
import { Text } from '@rneui/themed'
import { useSelector } from "react-redux"
import FormGroup from "../../../../Content/FormGroup"
import { deviceHeight } from "../../../../Core/Utility"

export const NoteAction = ({ noteValue, onChangeNote, onClose, settings }) => {
	const { appcolor } = useSelector(state => state.GAppState)
	const onChangeText = (text) => {
		noteValue.displayComment = text
		onChangeNote(text)
	}
	const onCloseNote = () => [
		onClose(noteValue.displayComment)
	]
	return (
		<View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
			<Text style={{ width: '100%', textAlign: 'center', fontSize: 15, fontWeight: '600', color: appcolor.dark, marginBottom: 8 }}>Ghi chú</Text>
			<FormGroup
				editable={!settings.isUploaded}
				multiline
				placeholder={'Nhập ghi chú'}
				value={noteValue.displayComment || ''}
				handleChangeForm={onChangeText}
			/>
			{!settings.isUploaded &&
				<TouchableOpacity
					style={{ width: deviceWidth / 3, backgroundColor: appcolor.surface, marginEnd: 3, marginStart: 3, borderRadius: 5, alignSelf: 'center' }}
					key={`close_iim`} onPress={onCloseNote}>
					<Text style={{ fontSize: 14, fontWeight: '500', color: appcolor.yellow, padding: 8, marginStart: 5, textAlign: 'center' }}>Xác nhận</Text>
				</TouchableOpacity>
			}
		</View>
	)
}