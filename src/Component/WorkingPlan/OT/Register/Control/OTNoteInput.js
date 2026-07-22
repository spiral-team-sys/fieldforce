import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

import FormGroup from '../../../../../Content/FormGroup';

const OTNoteInput = ({ appcolor, note, onChangeNote, onClearNote, submitting }) => {
    const styles = useMemo(() => createStyles(appcolor), [appcolor]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Lý do tăng ca</Text>
                <Text style={styles.sectionHint}>Tối thiểu 10 ký tự</Text>
            </View>
            <FormGroup
                containerStyle={styles.noteContainer}
                handleChangeForm={onChangeNote}
                defaultValue={note}
                useClearAndroid={false}
                editable={!submitting}
                inputStyle={styles.noteInput}
                numberOfLines={4}
                multiline={true}
                onClearTextAndroid={onClearNote}
                placeholder='Nhập lý do ở đây'
            />
        </View>
    );
};

const createStyles = (appcolor) => StyleSheet.create({
    section: {
        marginBottom: 12
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    sectionTitle: {
        flex: 1,
        color: appcolor.dark,
        fontSize: 13,
        fontWeight: '700'
    },
    sectionHint: {
        color: appcolor.greylight,
        fontSize: 11,
        fontWeight: '500'
    },
    noteContainer: {
        marginHorizontal: 0,
        marginTop: 0
    },
    noteInput: {
        minHeight: 88,
        color: appcolor.dark,
        fontSize: 13,
    }
});

export default memo(OTNoteInput);
