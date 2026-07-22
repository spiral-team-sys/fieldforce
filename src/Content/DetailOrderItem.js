
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, Text, View, Keyboard } from 'react-native';
import { Image } from '@rneui/themed';
import { DEFAULT_COLOR } from '../Core/URLs';

export const DetailOrderItem = ({ item, details, setDetails, route }) => {

    const [inputText, setInputText] = useState(item.UserInput !== undefined ? item.UserInput : '');
    const [damageText, setDamageText] = useState(item.QuantityDamaged !== undefined ? item.QuantityDamaged : '');
    const [pickText, setPickText] = useState(item.QuantityPickup !== undefined ? item.QuantityPickup : '')
    const [detailsTem] = useState(details)

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', async () => {
            setDetails(detailsTem);
        });
        return () => {
            keyboardDidHideListener.remove();
        };
    }, []);

    const EndEditInputChange = async (text, item) => {
        setInputText(text)

        let indexD = detailsTem.findIndex(it => it.POPId === item.POPId)
        let itemUpdate = { ...item, UserInput: text };
        await detailsTem.splice(indexD, 1);
        await detailsTem.push(itemUpdate);
    }
    const EndEditDamageChange = async (item, index) => {

        let indexD = detailsTem.findIndex(it => it.POPId === item.POPId)
        let itemD = detailsTem.filter(it => it.POPId === item.POPId)

        let itemUpdate = { ...itemD[0], QuantityDamaged: damageText };

        await detailsTem.splice(indexD, 1);
        await detailsTem.push(itemUpdate);
    }
    const EndEditPickChange = async (item, index) => {

        let indexD = detailsTem.findIndex(it => it.POPId === item.POPId)
        let itemD = detailsTem.filter(it => it.POPId === item.POPId)

        let itemUpdate = { ...itemD[0], QuantityPickup: pickText };
        await detailsTem.splice(indexD, 1);
        await detailsTem.push(itemUpdate);
    }

    return (
        <View style={{ width: '100%', padding: 8 }}>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: 7, borderColor: DEFAULT_COLOR, borderWidth: 0.7, borderRadius: 10 }}>
                {/* <Text>{JSON.stringify(item)}</Text> */}
                <View style={{ width: '30%' }}>
                    {item.Image !== null && <Image style={{ width: 100, height: 100, alignSelf: 'flex-start' }} source={{ uri: item.Image !== undefined ? item.Image : item.image }} PlaceholderContent={<ActivityIndicator />} />}
                </View>

                <View style={{ flexDirection: 'column', width: '70%' }}>
                    <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '700', width: '100%', textAlign: 'left' }}>{item.POPName !== undefined ? item.POPName : item.popName}</Text>
                    </View>

                    {
                        !route.params.orderStatus.includes('chờ xác nhận') ?
                            <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                                <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '62%' }}>{'Số lượng đề xuất: '}</Text>
                                <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', width: '100%', textAlign: 'left' }}>{item.UserInput}</Text>
                            </View> :
                            <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                                <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '62%' }}>{'Số lượng đề xuất: '}</Text>
                                <TextInput
                                    keyboardType={'numeric'}
                                    style={{ fontSize: 13, color: 'black', fontWeight: '600', width: '38%', textAlign: 'center', alignSelf: 'flex-end', borderColor: 'gray', borderWidth: 1, height: 30 }}
                                    onChangeText={text => EndEditInputChange(text, item)}
                                >{inputText}
                                </TextInput>
                            </View>
                    }

                    <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '62%' }}>{'Tồn kho tổng: '}</Text>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', width: '100%', textAlign: 'left' }}>{(item.TotalPOP !== undefined ? item.TotalPOP : item.totalPOP)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '62%' }}>{'Tồn kho cá nhân: '}</Text>
                        <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', width: '100%', textAlign: 'left' }}>{(item.Quantity !== undefined ? item.Quantity : item.quantity)}</Text>
                    </View>
                    {
                        (!route.params.orderStatus.includes('chờ xác nhận')) &&
                        <View>
                            <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                                <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '62%' }}>{'Số lượng hư hỏng: '}</Text>
                                <TextInput
                                    editable={route.params.orderStatus.includes('thành công') ? false : true}
                                    keyboardType={'numeric'}
                                    style={{ fontSize: 13, color: 'black', fontWeight: '600', width: '38%', textAlign: 'center', alignSelf: 'flex-end', borderColor: 'gray', borderWidth: 1, height: 30 }}
                                    onChangeText={text => setDamageText(text)}
                                    onEndEditing={e => EndEditDamageChange(item)}
                                >{damageText}
                                </TextInput>
                            </View>
                            <View style={{ flexDirection: 'row', width: '100%', padding: 5 }}>
                                <Text style={{ fontSize: 13, color: 'black', fontWeight: '600', textAlign: 'left', width: '62%' }}>{'Số lượng nhận được: '}</Text>
                                <TextInput
                                    editable={route.params.orderStatus.includes('thành công') ? false : true}
                                    keyboardType={'numeric'}
                                    style={{ fontSize: 13, color: 'black', fontWeight: '600', width: '38%', textAlign: 'center', alignSelf: 'flex-end', borderColor: 'gray', borderWidth: 1, height: 30 }}
                                    onChangeText={text => setPickText(text)}
                                    onEndEditing={e => EndEditPickChange(item)}
                                >{pickText}
                                </TextInput>
                            </View>
                        </View>
                    }
                </View>
            </View>
        </View>
    )
}