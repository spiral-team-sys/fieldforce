import React from 'react';
import { View, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Image, Text } from '@rneui/base';
import { fontWeightBold } from '../../Themes/AppsStyle';

const CodePushUpdateModal = ({ visible, updateInfo, isCheckingUpdate, isDownloadingUpdate, isInstallingUpdate, downloadProgress, error, onUpdate, onDismiss }) => {
    const appcolor = useSelector((state) => state?.GAppState?.appcolor);
    const isLoading = isCheckingUpdate || isDownloadingUpdate || isInstallingUpdate;
    const percent = downloadProgress?.totalBytes ? Math.round((downloadProgress.receivedBytes / downloadProgress.totalBytes) * 100) : 0;

    const getStatusMessage = () => {
        if (isCheckingUpdate) return 'Đang kiểm tra cập nhật...';
        if (isDownloadingUpdate) return 'Đang tải cập nhật...';
        if (isInstallingUpdate) return 'Đang hoàn tất cài đặt cập nhật...';
        return '';
    };

    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light, padding: 16, alignItems: 'center', justifyContent: 'center', marginTop: -72 },
        modalStyle: { flex: 1, backgroundColor: appcolor.light },
        titleName: { fontSize: 20, fontWeight: 'bold', color: appcolor.dark, textAlign: 'center', padding: 8 },
        subTitleName: { fontSize: 13, fontWeight: '500', color: appcolor.dark, textAlign: 'center', padding: 8 },
        subTitleError: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.red, textAlign: 'center', padding: 8 },
        viewWarning: { width: '100%', backgroundColor: appcolor.surface, padding: 4, margin: 8, borderRadius: 8 },
        viewAction: { flexDirection: 'row', alignItems: 'center', padding: 16 },
        buttonStyle: { padding: 8, borderWidth: 1, borderColor: appcolor.dark, backgroundColor: appcolor.transparent, borderRadius: 8 },
        titleButton: { color: appcolor.dark, fontSize: 13, fontWeight: fontWeightBold, textAlign: 'center' },
        buttonContainer: { flexGrow: 1, marginHorizontal: 4 },
        viewItemContent: { alignItems: 'center', width: '100%' },
        imageStyle: { width: 180, height: 180, margin: 16 }
    })

    return (
        <Modal
            visible={visible && (isLoading || error || updateInfo?.isAvailable)}
            presentationStyle='fullScreen'
            statusBarTranslucent
            style={styles.modalStyle}>
            <SafeAreaView style={styles.mainContainer}>
                <Image
                    source={require('../../Themes/Images/updateapp.png')}
                    style={styles.imageStyle}
                />
                {isLoading ? (
                    <View style={styles.viewItemContent}>
                        <ActivityIndicator size="small" color={appcolor.dark} />
                        <Text style={styles.subTitleName}>{getStatusMessage()}</Text>
                        {isDownloadingUpdate && downloadProgress && (
                            <Text style={[styles.subTitleName, { fontWeight: fontWeightBold }]}>
                                {`${percent}%`}
                            </Text>
                        )}
                        {isInstallingUpdate && (
                            <Text style={[styles.subTitleName, { fontStyle: 'italic' }]}>
                                Ứng dụng sẽ tự khởi động lại sau vài giây
                            </Text>
                        )}
                    </View>
                ) : error ?
                    <View style={styles.viewItemContent}>
                        <Text style={styles.subTitleError}>{error}</Text>
                    </View>
                    :
                    <View style={styles.viewItemContent}>
                        <Text style={styles.titleName}>{`Thông báo cập nhật ứng dụng`}</Text>
                        <Text style={styles.subTitleName}>{`${updateInfo?.label || `Nội dung cập nhật`}\n${updateInfo?.description}`}</Text>
                        <Text style={[styles.subTitleName, { fontWeight: fontWeightBold }]}>{`Phiên bản: ${updateInfo?.version}`}</Text>
                        {updateInfo?.isMandatory &&
                            <View style={styles.viewWarning}>
                                <Text style={styles.subTitleName}>{`⚠️ Cập nhật bắt buộc`}</Text>
                            </View>
                        }
                    </View>
                }
                <View style={styles.viewAction}>
                    {!updateInfo?.isMandatory &&
                        <Button
                            title="Bỏ qua"
                            buttonStyle={styles.buttonStyle}
                            containerStyle={styles.buttonContainer}
                            titleStyle={styles.titleButton}
                            onPress={onDismiss}
                        />
                    }
                    <Button
                        disabled={isDownloadingUpdate || isInstallingUpdate}
                        title={isInstallingUpdate ? 'Đang cài đặt...' : 'Cập nhật ngay'}
                        buttonStyle={[styles.buttonStyle, { backgroundColor: appcolor.blacklight }]}
                        containerStyle={styles.buttonContainer}
                        titleStyle={[styles.titleButton, { color: appcolor.light }]}
                        onPress={onUpdate}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default CodePushUpdateModal;
