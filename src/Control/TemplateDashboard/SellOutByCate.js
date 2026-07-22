import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/themed';
import _ from 'lodash';
import { deviceSize } from '../../Core/Helper';
import { ColorRand } from '../../Core/Helper';
export const SellOutSummaryByCate = ({ appcolor, dataSellOut, navigation }) => {
    const UIByCate = () => {
        var listCate = [];
        dataSellOut?.forEach((item, index) => {
            if (index == 0)
                return null
            else {
                listCate?.push(
                    <View key={`${index}1lak`} style={{
                        padding: 7, justifyContent: 'flex-end', flexDirection: 'row',
                        alignContent: 'flex-end', alignItems: 'flex-end',
                        backgroundColor: appcolor.light, marginBottom: 7, marginRight: 10 * index,
                        borderTopRightRadius: index == 1 ? 0 : 20, borderBottomRightRadius: 20
                    }}><TouchableOpacity style={{ flexDirection: 'row', }} >
                            <Text style={{ textAlign: 'right', fontSize: 10, color: ColorRand(index) }}>{item?.category}</Text>
                            <Text style={{ fontSize: 17, color: ColorRand(index) }}>{item?.quantity || 0}</Text>
                            {
                                item?.amount &&
                                <Text style={{ textAlign: 'right', fontSize: 10, color: ColorRand(index) }}>Số tiền
                                    <Text style={{ fontSize: 20, color: ColorRand(index) }}>
                                        {item.amount}
                                    </Text>
                                </Text>
                            }
                        </TouchableOpacity>
                    </View >)
            }
        })
        return listCate;
    }

    return (
        <TouchableOpacity style={{ zIndex: 10, width: '100%', height: '100%', }} onPress={() => dataSellOut[0]?.pageName ? navigation.navigate(dataSellOut[0]?.pageName) : null}>
            <View style={{
                width: '100%', height: '100%', alignItems: 'center', padding: 7, flexDirection: 'row',
            }}>
                <View style={{
                    top: -0, left: -0,
                    shadowColor: appcolor.dark,
                    shadowRadius: 28, zIndex: 2,
                    shadowOffset: { width: 40, height: 40 },
                    elevation: 13,
                    transform: [{ rotateZ: '0deg' }],
                    width: deviceWidth * 0.45, height: '35%',
                    backgroundColor: appcolor.primary, position: 'absolute', zIndex: 100, borderBottomLeftRadius: 0, borderBottomRightRadius: 40
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: (dataSellOut[0]?.quantityTarget !== null && dataSellOut[0]?.quantityTarget > 0) ? 'space-between' : 'center', paddingHorizontal: 20 }}>
                        {
                            (dataSellOut[0].quantityTarget !== null && dataSellOut[0].quantityTarget > 0) &&
                            <View style={{ paddingHorizontal: 5 }}>
                                <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: "600", color: appcolor.white }}>
                                    {dataSellOut?.length > 0 ? dataSellOut[0].quantityTarget : 0}
                                </Text>
                                <Text style={{ textAlign: 'center', color: appcolor.white, fontSize: 10, fontWeight: "600", }}>
                                    {dataSellOut?.length > 0 ? dataSellOut[0]?.unitTarget : "Target"}
                                </Text>
                            </View>
                        }
                        <View style={{ paddingLeft: 10 }}>
                            <Text style={{ textAlign: 'center', fontSize: 40, fontWeight: "600", color: appcolor.white }}>
                                {dataSellOut?.length > 0 ? dataSellOut[0].quantity : 0}
                            </Text>
                            <Text style={{ textAlign: 'center', color: appcolor.white, fontSize: 10, fontWeight: "600", }}>
                                {dataSellOut?.length > 0 ? dataSellOut[0]?.unit : "Số lượng"}
                            </Text>
                        </View>

                    </View>

                </View>
                <Text style={{
                    position: 'absolute', top: 10, zIndex: 122, right: 0,
                    color: appcolor.dark, fontSize: 11, marginRight: 10
                }}>{dataSellOut?.length > 0 ? dataSellOut[0].title : ''}</Text>

                <View style={{ flexGrow: 1, backgroundColor: appcolor.surface, marginTop: 40 }}>
                    {UIByCate()}
                </View>
            </View >
        </TouchableOpacity>
    )
}