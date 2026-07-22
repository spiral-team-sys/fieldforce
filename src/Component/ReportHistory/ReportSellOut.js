import React, { Component } from 'react';
import { View } from 'react-native';
import { Text } from '@rneui/themed';

export default class ReportSellOut extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSellOut: this.props.dataReport
        }
    }

    getListProduct = () => {
        let strProduct = null;
        if (this.state.dataSellOut != null && this.state.dataSellOut != undefined) {
            strProduct = this.state.dataSellOut;
        } else {
            strProduct = 'Không có dữ liệu số bán'
        }
        return strProduct;
    }

    render() {
        return (
            <View style={{ flex: 1, marginBottom: 8 }}>
                <Text>{this.getListProduct()}</Text>
            </View>
        )
    }
} 