import React from 'react';
import { processColor, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import { Text } from '@rneui/themed';
import _ from 'lodash';
import { deviceWidth } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';

export const SellOutSummary = ({ appcolor, dataSellOut, navigation }) => {
    const target = dataSellOut?.targetPercent < dataSellOut?.actualPercent ? 0 : dataSellOut?.targetPercent - dataSellOut?.actualPercent
    const data = {
        dataSets: [{
            values: [{ value: dataSellOut?.actualPercent || 0 }, { value: target || 0 }],
            config: {
                colors: [processColor('#085294'), processColor('#ff6347')],
                valueTextColor: processColor('transparent')
            },
            label: ''
        }],
    }
    const percentValue = `${dataSellOut.percentValue || 0}%` || `${(dataSellOut.actualPercent / dataSellOut.targetPercent).toFixed(2) * 100}%`
    return (
        <TouchableOpacity style={{ zIndex: 10, width: '100%', height: '100%' }} onPress={() => dataSellOut?.pageName != null ? navigation.navigate(dataSellOut?.pageName) : null}>
            <View style={{ width: '100%', height: '100%', padding: 8 }}>
                <Text style={{
                    width: '100%', position: 'absolute', top: 12, textAlign: 'center', fontSize: 15, fontWeight: '700',
                    color: appcolor.dark, zIndex: 10, elevation: 10
                }}>{dataSellOut?.cname || 'Báo cáo số bán'}</Text>
                <View style={{ width: '100%', height: '100%', flexDirection: 'row' }}>
                    <View style={{ width: '50%', height: '100%', alignSelf: 'flex-start' }}>
                        <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: appcolor.dark, padding: 5 }}>{`Target`}</Text>
                            <Text style={{ fontSize: scaleSize(32), fontWeight: '800', color: appcolor.tomato, marginStart: 8 }}>{`${dataSellOut?.targetValue || 0}`}</Text>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: appcolor.dark, padding: 5 }}>{`Actual`}</Text>
                            {
                                dataSellOut?.l1 && <Text style={{ fontSize: scaleSize(18), fontWeight: '700', color: appcolor.info, marginStart: 8 }}>{`${dataSellOut?.l1 || 'Giá trị 1'}: ${dataSellOut?.v1 || 0}`}</Text>
                            }
                            {
                                dataSellOut?.l2 &&
                                <Text style={{ fontSize: scaleSize(18), fontWeight: '700', color: appcolor.info, marginStart: 8 }}>{`${dataSellOut?.l2 || 'Gía trị 2'}: ${dataSellOut?.v2 || 0}`}</Text>
                            }

                        </View>
                    </View>
                    <View style={{ width: deviceWidth / 2.3, height: '100%', alignSelf: 'flex-end' }}>
                        <PieChart
                            style={{ flex: 1 }}
                            logEnabled={true}
                            chartBackgroundColor={processColor('transparent')}
                            chartDescription={{ text: '' }}
                            data={data}
                            legend={{ enabled: false }}
                            extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}
                            entryLabelColor={processColor('transparent')}
                            entryLabelTextSize={20}
                            entryLabelFontFamily={'HelveticaNeue-Medium'}
                            styledCenterText={{ text: percentValue, color: processColor('#d1380a'), size: 18, fontWeight: '600', textAlign: 'center' }}
                            centerTextRadiusPercent={100}
                            holeRadius={70}
                            maxAngle={360}
                            onChange={(event) => console.log(event.nativeEvent)}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}