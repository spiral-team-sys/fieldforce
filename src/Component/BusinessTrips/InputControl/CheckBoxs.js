





import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { CheckBox } from '@rneui/base';

const CheckBoxs = ({ itemCheck, indexCheck, titleCheckBox, contentContainerStyle, checkBoxStyle, handleSelectCheckBox, disabled, size }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [checked, setChecked] = useState(itemCheck?.isChoose == 1);

    useEffect(() => {
        let isMounted = true
        if (!isMounted)
            return
        if ((!checked && itemCheck?.isChoose == 1) || (checked && itemCheck.isChoose == 0)) {
            setChecked(itemCheck.isChoose)
        }
        return () => { isMounted = false }
    }, [itemCheck?.isChoose])

    const onSelectCheckbox = () => {
        setChecked(!checked);
        handleSelectCheckBox(itemCheck, indexCheck, !checked)
    }
    return (
        <View style={[styles.contentView, contentContainerStyle]}>
            <CheckBox
                key={`${itemCheck.id}_Check_${indexCheck}`}
                title={titleCheckBox || ''}
                onPress={onSelectCheckbox}
                uncheckedColor={appcolor.black}
                checkedColor={appcolor.primary}
                checked={checked}
                textStyle={{ color: appcolor.dark }}
                size={size || 20}
                disabled={disabled}
                containerStyle={[styles.containerStyle, checkBoxStyle]}
                style={{ flex: 1, }}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    contentView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    containerStyle: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0
    }
});

export default CheckBoxs;