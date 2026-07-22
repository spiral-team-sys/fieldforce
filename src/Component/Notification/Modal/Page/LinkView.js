import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

const LinkView = ({ title, body, link, modalKey }) => {
    const { appcolor } = useSelector(state => state.GAppState);

    const styles = StyleSheet.create({
        contentContainer: { flex: 1, padding: 8, backgroundColor: appcolor.light },
        tilteName: { fontSize: 13, fontWeight: fontWeightBold, color: appcolor.dark },
        subTitleName: { fontSize: 12, fontWeight: '500', color: appcolor.placeholderText },
        viewContent: { flex: 1, marginVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: appcolor.surface, overflow: 'hidden' },
        buttonContainer: { width: 120, alignSelf: 'center', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
        buttonClose: { width: 120, alignSelf: 'center', borderRadius: 8, borderWidth: 1, borderColor: appcolor.red, padding: 6, paddingHorizontal: 24 },
        titleButtonClose: { fontSize: 12, fontWeight: fontWeightBold, color: appcolor.red },
        emptyText: { fontSize: 12, color: appcolor.placeholderText, textAlign: 'center', paddingVertical: 16 },
    });

    return (
        <SafeAreaView style={styles.contentContainer}>
            <Text style={styles.tilteName}>{title}</Text>
            <Text style={styles.subTitleName}>{body}</Text>
            <View style={styles.viewContent}>
                {link ? (
                    <WebView
                        key={modalKey}
                        source={{ uri: link }}
                        startInLoadingState
                        javaScriptEnabled
                        domStorageEnabled
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <Text style={styles.emptyText}>Không có nội dung để hiển thị</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

export default React.memo(LinkView);