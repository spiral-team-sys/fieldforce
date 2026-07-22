import React, { useImperativeHandle, useState } from "react"
import { useSelector } from "react-redux"
import { View, Text, TouchableOpacity } from "react-native"
import { scaleSize } from "../Themes/AppsStyle"
export const BottomConfirm = React.forwardRef((props, ref) => {
    const { title, onConfirm } = props
    const { appcolor } = useSelector(state => state.GAppState)
    const [display, setDisplay] = useState('none');
    useImperativeHandle(ref, () => ({
        hide: () => { onHide() },
        show: () => { onShow() }
    }))
    const onHide = () => {
        setDisplay('none')
    }
    const onShow = () => {
        setDisplay('flex')
    }
    return (
        <View style={{ display: display, height: '100%', zIndex: 20, position: 'absolute', width: '100%' }}>
            <View style={{ flexGrow: 1, backgroundColor: appcolor.dark, opacity: 0.6 }} />
            <View
                style={{
                    display: display,
                    position: 'absolute', bottom: -1, left: -1, right: -1,
                    backgroundColor: appcolor.light, padding: 20,
                    borderTopLeftRadius: 20, borderTopRightRadius: 20,
                }}>
                <Text style={{ fontSize: scaleSize(18), fontWeight: 'bold', padding: 12 }}>{title}</Text>
                <View style={{ flexDirection: 'row', padding: 7 }}>
                    <TouchableOpacity onPress={onConfirm} style={{ padding: 12, flexGrow: 1, backgroundColor: appcolor.danger, marginRight: 10, borderRadius: 8 }}>
                        <Text style={{ fontSize: scaleSize(14), textAlign: 'center', color: appcolor.white }}>Đồng ý</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onHide('none')} style={{ marginLeft: 10, padding: 12, flexGrow: 1, borderColor: appcolor.danger, borderWidth: 0.6, borderRadius: 8 }}>
                        <Text style={{ fontSize: scaleSize(14), textAlign: 'center', color: appcolor.dark }}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
})