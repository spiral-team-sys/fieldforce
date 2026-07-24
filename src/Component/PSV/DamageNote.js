import React, { useState } from 'react';
import { Dimensions, Text, View, TextInput } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import { DEFAULT_COLOR } from '../../Core/URLs';
import moment from 'moment';

export const DamageNote = ({ navigation, route }) => {
    const [notePhoto, setNotePhoto] = useState('')

    const takePhoto = () => {
        let maDH = route.params.orderNo.replace('Mã đơn hàng: ', '')

        let item = {
            "photoType": maDH,
            "photoDate": parseInt(moment(new Date()).format('YYYYMMDD')),
            "photoDesc": notePhoto
        }

        navigation.navigate('Camera', item);
    }
    const showAlbum = () => {
        let maDH = route.params.orderNo.replace('Mã đơn hàng: ', '')

        let item = {
            "reportId": -3,
            "photoType": maDH,
            "photoDate": parseInt(moment(new Date()).format('YYYYMMDD')),
            "photoDesc": notePhoto
        }

        navigation.navigate('AlbumPhoto', item);
    }
    return (
        <View style={{ flex: 1 }}>
            <PageHeader Title="Chi tiết Hư hỏng"
                leftclick={() => navigation.goBack()}
            />

            <View style={{ padding: 15 }}>
                <Text style={{ paddingTop: 15, paddingBottom: 15, fontSize: 15, fontWeight: '700', fontStyle: 'italic' }}>Chú ý: (Nếu có ghi chú vui lòng nhập trước khi chụp hình)</Text>
                <TextInput
                    keyboardType={'default'}
                    style={{ height: 250, width: '100%', borderColor: 'gray', borderWidth: 1 }}
                    value={notePhoto}
                    multiline={true}
                    onChangeText={(text) => setNotePhoto(text)}
                ></TextInput>

            </View>
            <View style={{ flexDirection: 'row', bottom: Dimensions.get('window').height / 3, justifyContent: 'space-between', padding: 8, position: 'absolute' }}>
                <Button
                    title={' chụp hình'}
                    titleStyle={{ fontSize: 17, fontWeight: '700' }}
                    buttonStyle={{ backgroundColor: DEFAULT_COLOR, alignContent: 'center' }}
                    containerStyle={{ width: '47%', borderRadius: 10, height: 55, alignContent: 'center' }}
                    icon={
                        <SpiralIcon type='ionicon' name='camera' size={35} color={'#fff'}></SpiralIcon>
                    }
                    onPress={() => takePhoto()}
                >
                </Button>
                <Button
                    title={' Album'}
                    titleStyle={{ fontSize: 17, fontWeight: '700' }}
                    buttonStyle={{ backgroundColor: DEFAULT_COLOR, alignContent: 'center' }}
                    containerStyle={{ width: '47%', borderRadius: 10, height: 55, alignContent: 'center' }}
                    icon={
                        <SpiralIcon type='ionicon' name='images' size={35} color={'#fff'}></SpiralIcon>
                    }
                    onPress={() => showAlbum()}
                >
                </Button>
            </View>
        </View>
    )
}