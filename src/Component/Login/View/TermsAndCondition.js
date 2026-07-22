import { CheckBox } from "@rneui/base";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux";
import { fontWeightBold } from "../../../Themes/AppsStyle";

const TermsAndCondition = ({ onShowPrivacy, onAccept, isAcceptPrivacy = false, useBackground = false }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const textColor = useBackground ? appcolor.grayLight : appcolor.blacklight;
    const subTextColor = useBackground ? appcolor.blacklight : appcolor.placeholderText;

    const styles = StyleSheet.create({
        securityContainer: { alignItems: 'center', paddingHorizontal: 8 },
        titleSecurityMain: { color: textColor, fontSize: 12, fontWeight: fontWeightBold },
        titleSecurity: { color: subTextColor, fontWeight: '500', textDecorationLine: 'underline', fontStyle: 'italic', fontSize: 12 },
        checkbox: { backgroundColor: appcolor.transparent, padding: 4, paddingHorizontal: 0, margin: 0, borderColor: appcolor.transparent, textAlign: 'center' },
        actionButton: { width: '100%', paddingHorizontal: 16 }
    })
    return (
        <View style={styles.securityContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onShowPrivacy}>
                <Text style={styles.titleSecurityMain}>Bằng việc đăng nhập bạn đã đồng ý với
                    <Text style={styles.titleSecurity}> Điều khoản & điều kiện cùng</Text>
                    <Text style={styles.titleSecurity}> chính sách bảo mật chia sẻ thông tin của Spiral</Text>
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default TermsAndCondition;