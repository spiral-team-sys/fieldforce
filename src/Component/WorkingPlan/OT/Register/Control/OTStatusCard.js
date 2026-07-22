import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';

const OTStatusCard = ({ appcolor, isRegistered, registeredTime, totalMonth }) => {
    const styles = useMemo(() => createStyles(appcolor, isRegistered), [appcolor, isRegistered]);

    return (
        <View style={styles.section}>
            <View style={styles.statusBox}>
                <View style={styles.statusIcon}>
                    <Icon
                        name={isRegistered ? 'check' : 'clock'}
                        type='font-awesome-5'
                        size={14}
                        color={isRegistered ? appcolor.success : appcolor.light}
                    />
                </View>
                <View style={styles.textWrap}>
                    <Text style={styles.title}>
                        {isRegistered ? `Đã đăng ký hôm nay: ${registeredTime}h` : 'Chưa đăng ký tăng ca hôm nay'}
                    </Text>
                    <Text style={styles.subTitle}>
                        {isRegistered ? 'Thông tin đã được cập nhật trên máy và gửi lên hệ thống.' : `Tổng tháng hiện tại: ${totalMonth}`}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const createStyles = (appcolor, isRegistered) => StyleSheet.create({
    section: {
        marginBottom: 12
    },
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        padding: 12,
        backgroundColor: isRegistered ? appcolor.success : appcolor.surface
    },
    statusIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isRegistered ? appcolor.light : appcolor.primary
    },
    textWrap: {
        flex: 1,
        paddingLeft: 10
    },
    title: {
        color: isRegistered ? appcolor.light : appcolor.dark,
        fontSize: 13,
        fontWeight: '700'
    },
    subTitle: {
        color: isRegistered ? appcolor.light : appcolor.greylight,
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2
    }
});

export default memo(OTStatusCard);
