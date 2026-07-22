import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '@rneui/themed';

export default class ReportDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mData: this.props.dataReport
        }
    }

    getListProduct = () => {
        let strProduct = null;
        if (this.state.mData != null && this.state.mData != undefined) {
            strProduct = this.state.mData;
        } else {
            strProduct = 'Không có dữ liệu trưng bày'
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