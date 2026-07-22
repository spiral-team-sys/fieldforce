import React from 'react';
import { Text } from 'react-native';
////import { NumericFormat } from "react-number-format";;

export const NumberFormatView = ({ value, textStyle }) => {
    return (
        <NumericFormat
            value={value}
            displayType={'text'}
            thousandSeparator={true}
            renderText={formattedValue => <Text style={textStyle}>{formattedValue} VNĐ</Text>}
        />
    );
}