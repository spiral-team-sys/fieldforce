import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, Switch, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux'
import { MessageInfo } from '../../Core/Helper'

const DeviceCheckModal = ({ visible, data = [], checkIMEI = 0, onClose, onConfirm }) => {
    const [needCheck, setNeedCheck] = useState(checkIMEI == 1)
    const [loading, setLoading] = useState(false)
    const [_mutate, setMutate] = useState(false)
    const { appcolor } = useSelector(state => state.GAppState)
    const [isHaveChange, setIsHaveChange] = useState(false)

    const toggleDevice = useCallback((item) => {
        item.status = item.status == 1 ? 0 : 1
        setIsHaveChange(true)
        setMutate(e => !e)
    }, [needCheck])
    const handleSelectSwitch = (value) => {
        setIsHaveChange(true)
        setNeedCheck(value)
    }

    const handleConfirm = async () => {
        try {
            if (!isHaveChange) {
                MessageInfo("Không có thay đổi nào để xác nhận")
                return
            }
            setLoading(true)
            await onConfirm({
                needCheck,
                devices: data
            })
            onClose()
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const renderItem = ({ item }) => {
        const isChecked = item.status == 1

        return (
            <View style={styles.row}>
                <Text style={styles.stt}>{item.index + 1}</Text>
                <Text style={styles.imei}>{item.imei}</Text>
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        isChecked && styles.checkboxActive
                    ]}
                    onPress={() => toggleDevice(item)}
                >
                    {isChecked && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
            </View>
        )
    }

    const styles = StyleSheet.create({
        overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
        container: { margin: 10, backgroundColor: appcolor.light, borderRadius: 14, padding: 16, maxHeight: '80%' },
        title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: appcolor.dark },
        switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
        label: { fontWeight: '600', color: appcolor.dark },
        row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: appcolor.greydark },
        stt: { width: 40, fontWeight: '600', color: appcolor.dark },
        imei: { flex: 1, color: appcolor.dark },
        checkbox: { width: 26, height: 26, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
        checkboxActive: { backgroundColor: appcolor.primary, borderColor: appcolor.primary },
        disabled: { opacity: 0.4 },
        check: { color: appcolor.light, fontWeight: 'bold' },
        footer: { flexDirection: 'row', marginTop: 20 },
        closeBtn: { flex: 1, padding: 12, backgroundColor: appcolor.grey, borderRadius: 8, marginRight: 8, alignItems: 'center' },
        confirmBtn: { flex: 1, padding: 12, backgroundColor: appcolor.primary, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
        closeText: { fontWeight: '600', color: appcolor.dark },
        confirmText: { color: appcolor.light, fontWeight: '600' }
    })

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>

                    <Text style={styles.title}>Mã thiết bị</Text>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>
                            Có kiểm tra thiết bị
                        </Text>
                        <Switch
                            value={needCheck}
                            onValueChange={handleSelectSwitch}
                        />
                    </View>

                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.closeText}>Đóng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color={appcolor.light} />
                                : <Text style={styles.confirmText}>Xác nhận</Text>}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    )
}

export default DeviceCheckModal