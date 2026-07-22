import React, { useEffect, useState } from "react"
import { SafeAreaView, Text, TouchableOpacity, Modal, View, StyleSheet, RefreshControl } from "react-native"
import { useSelector } from "react-redux"
import LottieView from 'lottie-react-native'
import { PayslipAPI } from "../../API/PaySlipAPI"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { deviceHeight } from "../../Core/Utility"
import { HeaderCustom } from "../../Content/HeaderCustom"
//import { NumericFormat } from "react-number-format";
import { LocalSignIn } from "../../Control/LocalSignIn"
import { Icon } from '@rneui/themed'
import CustomListView from "../../Control/Custom/CustomListView"
export const PAYSLIPLIST = "payslip"

export const PayslipList = ({ navigation }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [loading, setLoading] = useState(true)
    const [salaryData, setSalary] = useState(null)
    const [isSec, setSec] = useState(0)
    const onLoad = async () => {
        LocalSignIn.isSupportID((e) => {
            setSec(e)
        })
        const result = await PayslipAPI.GetPayslip();
        if (result.statusId === 200) {
            const dataSystem = result.data
            await AsyncStorage.setItem(PAYSLIPLIST, JSON.stringify(dataSystem || []))
            await setSalary(dataSystem || [])
        } else {
            await setSalary([])
        }
        await setLoading(false)
    }
    useEffect(() => {
        const _load = onLoad()
        LocalSignIn.isSupportID(e => {
            if (+e > 0) {
                LocalSignIn.onAuthenticateID((e) => { e === 1 ? setSec(-1) : setSec(1) })
            }
        })
        return () => { _load }
    }, [])
    const styles = StyleSheet.create({
        cardContainer: { backgroundColor: appcolor.light, padding: 15, marginVertical: 10, marginHorizontal: 10, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4, flexDirection: 'row', alignItems: 'center', },
        iconContainer: { padding: 10, borderRadius: 50, },
        textContainer: { marginLeft: 15, color: appcolor.dark, flex: 1, },
        header: { fontSize: 18, color: appcolor.dark, fontWeight: 'bold', },
        details: { fontSize: 14, color: appcolor.dark, opacity: 0.6, marginTop: 5, },
    });

    const SalaryItem = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate("paydetail", { item: item, })}
                key={`${index}091`} style={styles.cardContainer}>
                <View style={styles.iconContainer}>
                    <View style={{}}>
                        <Text style={{ fontSize: 20, textAlign: 'center', color: appcolor.dark }}>{item.month}</Text>
                        <View style={{ height: 4, backgroundColor: appcolor.dark, opacity: 0.4 }} />
                        <Text style={{ fontSize: 20, textAlign: 'center', color: appcolor.dark }}>{item.year}</Text>
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.header}>{item.title}</Text>
                    <NumericFormat value={item.totalSalary} displayType={'text'} thousandSeparator={true}
                        renderText={value => <Text style={styles.details}>{`Tổng thu nhập: ${value}`}</Text>}
                    />
                    <NumericFormat value={item.insuranceCost} displayType={'text'} thousandSeparator={true}
                        renderText={value => <Text style={styles.details}>{`Trừ Bảo hiểm: ${value}`}</Text>}
                    />
                    <NumericFormat value={item.incomeTaxCost || 0} displayType={'text'} thousandSeparator={true}
                        renderText={value => <Text style={styles.details}>{`Trừ thuế TNCN: ${value}`}</Text>}
                    />
                    <NumericFormat value={item.actualSalary} displayType={'text'} thousandSeparator={true}
                        renderText={value => <Text style={[styles.header, { fontSize: 14 }]}>{`Lương thực nhận: ${value}`}</Text>}
                    />
                    <Text style={[styles.details, { textAlign: 'right', fontStyle: 'italic' }]}>Đã gửi {item.sendDate}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.primary }}>
            <HeaderCustom
                leftFunc={() => navigation.goBack()}
                rightFunc={() => navigation.navigate('o-payslip')}
                iconRight={"history"}
                title={"Quản lý lương"} />
            <View style={{ height: deviceHeight, backgroundColor: appcolor.surface }}>
                {
                    salaryData?.length > 0 ?
                        <CustomListView
                            data={salaryData}
                            extraData={[salaryData]}
                            refreshControl={<RefreshControl
                                title="Cập nhật dữ liệu"
                                refreshing={loading}
                                onRefresh={onLoad}
                            />}
                            showsVerticalScrollIndicator={false}
                            renderItem={SalaryItem}
                            keyExtractor={(item) => `pa8${item.id}`}
                        />
                        : <TouchableOpacity onPress={() => navigation.navigate('o-payslip')}
                            style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 20, justifyContent: 'center' }}>
                            <Icon type="font-awesome-5" name="folder-plus" size={16} color={appcolor.primary} />
                            <Text style={{ textAlign: 'center', padding: 12, color: appcolor.danger }}>Xem trên bảng lương cũ</Text>
                        </TouchableOpacity>
                }
            </View>

            <Modal visible={isSec > 0 ? true : false} style={{ backgroundColor: appcolor.light }}>
                <View style={{ backgroundColor: appcolor.light, height: '100%' }}>
                    <View style={{ height: '40%' }}>
                        <LottieView autoPlay style={{ height: '100%' }} source={require("../../Themes/lotties/security.json")} />
                    </View>
                    <View style={{ padding: 12 }}>
                        <Text style={{ textAlign: 'center', color: appcolor.dark }}>Xác thực thông tin </Text>
                        <View style={{ paddingHorizontal: 12 }}>
                            <Text style={{ color: appcolor.dark, textAlign: 'center' }}>Nhằm nâng cao tính bảo mật về lương bạn cần xác thực 2 bước</Text>
                        </View>

                        <TouchableOpacity onPress={() => LocalSignIn.onAuthenticateID((e) => { e === 1 && setSec(-1) })}>
                            <View style={{ alignItems: 'center', marginTop: 30 }}>
                                {
                                    isSec === 1 ?
                                        <LottieView autoPlay style={{ height: 70, width: 70 }} source={require("../../Themes/lotties/faceid.json")} />
                                        :
                                        <LottieView autoPlay style={{ height: 70, width: 70 }} source={require("../../Themes/lotties/fingerprint.json")} />
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ padding: 12 }}>
                        <Text style={{ color: appcolor.danger, textAlign: 'center' }}>{`Ấn vào biểu tượng ${isSec === 1 ? 'khuôn mặt' : "vân tay"} => Sử dụng ${isSec === 1 ? 'FaceID' : "vân tay"} để mở khoá`}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
