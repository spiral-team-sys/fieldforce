import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Button, Divider } from '@rneui/themed';
import FormGroup from '../../Content/FormGroup';
import Moment from 'moment'
import ActionSheet from 'react-native-actions-sheet';
import { GetListWorkingSchedule, UploadBussinessTrip } from '../../Controller/BussinessTripController';
import { MessageInfo } from '../../Core/Helper';
// import NumberFormat from "react-number-format";
import { checkNetwork } from '../../Core/Utility';
import { scaleSize } from '../../Themes/AppsStyle';
export const BussinessTripDetails = ({ bussinessInfo, appcolor, nextView, bottomSheet, presentView, MoneyMove, remaining }) => {
    const [modeRes, setModeRes] = useState();
    const [bussinessShow, setBussinessShow] = useState(bussinessInfo)
    const _bottomSheet = useRef();
    const VIEW_HIS = 'VIEW HISTORY'
    const MODE_EDIT = 'RES_EDIT'
    const MODE_VIEW = 'VIEW RESULT'
    const saveResult = async () => {
        if (bussinessShow?.supportTotal > remaining) {
            MessageInfo('Tổng trợ cấp không được lớn hơn số hạn mức hỗ trợ còn lại.')
            return
        }

        let today = parseInt(Moment(new Date()).format('YYYYMMDD'));
        if (bussinessShow?.fromDate < today) {
            MessageInfo('Không được tạo chuyến đi trong quá khứ.')
            return
        }

        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        // let lstWorkingSchedule = await GetListWorkingSchedule(Moment(bussinessShow?.fromDate).format('YYYYMMDD'), Moment(bussinessShow?.toDate).format('YYYYMMDD'));
        // let lstCheck = lstWorkingSchedule || []
        // if (lstCheck.length > 0) {
        //     const lstKey = Object.keys(lstCheck[0]);
        //     // console.log(lstKey, 'pppp')
        //     if (lstKey.length > 1) {
        //         MessageInfo('Không được đăng ký trùng tuyến công tác.')
        //         return
        //     }
        // }
        UploadBussinessTrip(bussinessShow, () => nextView(VIEW_HIS))
    }
    useEffect(() => {
        if (bussinessInfo.view === MODE_VIEW)
            setBussinessShow(bussinessInfo)
        else
            CalculatorBy();
        return () => false;
    }, [bussinessShow?.typeKm])
    // calcu
    const CalculatorBy = () => {
        let supportMove = 0;
        let numberDate = 0;
        let numberNight = 0;
        let supportTotal = 0;

        if (bussinessShow?.fromDate && bussinessShow?.toDate) {
            let fromDateInt = 0;
            let toDateInt = 0;
            fromDateInt = !isNaN(bussinessShow?.fromDate) ? bussinessShow?.fromDate : parseInt(bussinessShow?.fromDate.replace(/-/gm, ''));
            toDateInt = !isNaN(bussinessShow?.toDate) ? bussinessShow?.toDate : parseInt(bussinessShow?.toDate.replace(/-/gm, ''));
            if (toDateInt >= fromDateInt && toDateInt !== 0 && fromDateInt !== 0) {
                // cal date
                numberDate = (toDateInt === fromDateInt) ? 1 : (toDateInt - fromDateInt) + 1;
                //cal night
                numberNight = (toDateInt === fromDateInt) ? 0 : (toDateInt - fromDateInt);
                let supportHotel = (bussinessShow?.typeKmInfo?.isRequired === 1) ? (numberNight * 300000) || 0 : 0;
                let supportRestaurant = (numberDate * 100000) || 0;
                if (bussinessShow?.typeKm) {
                    let price = bussinessShow?.typeKmInfo.numberValue || 0;
                    supportMove = price * numberDate;
                    supportTotal = (bussinessShow?.typeKmInfo.isRequired === 1) ?
                        (supportHotel + supportRestaurant + supportMove) : (supportRestaurant + supportMove) || 0;
                } else
                    supportTotal = supportRestaurant;
                setBussinessShow({
                    ...bussinessShow, numberDate: numberDate,
                    numberNight: numberNight, supportHotel: supportHotel,
                    supportRestaurant: supportRestaurant, supportMove: supportMove,
                    supportTotal: supportTotal
                });
            }
            else {
                MessageInfo('Vui lòng chọn từ ngày phải sau đến ngày');
            }
        }
    }

    const renderItemKM = ({ item }) => {
        return (
            <TouchableOpacity key={item.id + "002j"} onPress={() => {
                setBussinessShow({ ...bussinessShow, typeKm: item.name });
                _bottomSheet.current.hide();
            }}>
                <View style={{ justifyContent: 'center', width: '100%' }}>
                    <Text style={{ width: '100%', color: appcolor.dark, textAlign: 'center', fontSize: 10, padding: 10 }}>{item.name}</Text>
                    <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
            {/* <Text style={{  }}>{JSON.stringify(bussinessShow)}</Text> */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    containerStyle={{ width: '33%' }}
                    title={'Tên nhân viên'}
                    value={bussinessShow?.employeeName}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '33%' }}
                    title={'Mã nhân viên'}
                    value={bussinessShow?.employeeCode}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '33%' }}
                    title={'Ngày yêu cầu'}
                    value={(Moment(bussinessShow?.workDate, "YYYYMMDD").format("ddd DD MM") || Moment(new Date()).format("ddd DD MM")) + ''}
                    useClearAndroid={false}
                />
            </View>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Đợt công tác từ ngày'}
                    value={Moment(bussinessShow?.fromDate + '').format('ddd DD MMM YY')}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Đợt công tác đến ngày'}
                    value={Moment(bussinessShow?.toDate + '').format('ddd DD MMM YY')}
                    useClearAndroid={false}
                />
            </View>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Từ nơi công tác'}
                    value={(bussinessShow?.provinceFromVN || 'NONE')}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Đến nơi công tác'}
                    value={(bussinessShow?.provinceToVN || 'NONE')}
                    useClearAndroid={false}
                />
            </View>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Số ngày'}
                    placeholder={'0'}
                    value={(bussinessShow?.numberDate || '') + ''}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Số đêm'}
                    placeholder={'0'}
                    value={(bussinessShow?.numberNight || '') + ''}
                    useClearAndroid={false}
                />
            </View>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <NumberFormat
                    key={'s1'}
                    disabled={true}
                    value={(remaining || '') + ''}
                    displayType={'text'}
                    thousandSeparator={true}
                    renderText={value =>
                        <FormGroup
                            containerStyle={{ width: '33%' }}
                            title={'Hạn mức còn lại'}
                            placeholder={'0'}
                            value={value} inputStyle={{ fontWeight: 'bold', color: appcolor.danger, textAlign: 'center' }}
                            useClearAndroid={false}
                        />
                    }
                />
                <NumberFormat
                    key={'s2'}
                    disabled={true}
                    value={(bussinessShow?.supportTotal || bussinessInfo?.totalSupport || '0')}
                    displayType={'text'}
                    thousandSeparator={true}
                    renderText={value =>
                        <FormGroup
                            containerStyle={{ width: '33%' }}
                            title={'Chi phí dự kiến'}
                            placeholder={'0'}
                            value={value} inputStyle={{ textAlign: 'center' }}
                            useClearAndroid={false}
                        />
                    }
                />
                <FormGroup
                    containerStyle={{ width: '33%' }}
                    title={'Trạng thái'}
                    placeholder={'0'}
                    value={(bussinessShow?.status || 'khởi tạo') + ''}
                    useClearAndroid={false}
                />
            </View>
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <FormGroup
                iconRight={modeRes === MODE_EDIT ? "caret-down" : null}
                iconRightStyle={{ color: appcolor.primary }}
                title={'Số KM của chuyến đi'}
                placeholder={'0'}
                rightFunc={modeRes === MODE_EDIT ? () => _bottomSheet.current.show() : null}
                value={(bussinessShow?.typeKm || '') + ''}
                useClearAndroid={false}
            />
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <NumberFormat
                key={'s1'}
                disabled={true}
                value={bussinessShow?.supportHotel || bussinessShow?.supportNight || 0}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Trợ cấp khách sạn'}
                        placeholder={'0'}
                        value={value} inputStyle={{ textAlign: 'right' }}
                        useClearAndroid={false}
                    />
                }
            />
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <NumberFormat
                key={'s3'}
                disabled={true}
                value={bussinessShow?.supportRestaurant || (bussinessShow?.supportLunch) || '0'}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Trợ cấp ăn uống'}
                        placeholder={'0'} inputStyle={{ textAlign: 'right' }}
                        value={value}
                        useClearAndroid={false}
                    />
                }
            />
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <NumberFormat
                key={'s4'}
                disabled={true}
                value={bussinessShow?.supportMove || bussinessShow?.supportKM || '0'}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Trợ cấp di chuyển'}
                        placeholder={'0'}
                        value={value} inputStyle={{ textAlign: 'right' }}
                        useClearAndroid={false}
                    />
                }
            />
            <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            <NumberFormat
                key={'s5'}
                disabled={true}
                value={bussinessShow?.supportTotal || bussinessInfo?.totalSupport || '0'}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Tổng trợ cấp'} containerStyle={{ backgroundColor: appcolor.primary }}
                        placeholder={'0'} inputStyle={{ fontSize: scaleSize(20), textAlign: 'right', color: appcolor.white }}
                        value={value?.toString()}
                        useClearAndroid={false}
                    />
                }
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '50%', alignSelf: 'flex-end' }}>
                {
                    bussinessInfo?.isLock === false &&
                    <Button containerStyle={{
                        height: 50,
                        alignItems: 'flex-end', right: 15,
                    }}
                        buttonStyle={{ backgroundColor: appcolor.success, paddingLeft: 25, paddingRight: 25 }}
                        onPress={() => saveResult()}
                        title="Gửi đề xuất"></Button>
                }
            </View>
            {/* <View style={{ backgroundColor: appcolor.darklight, justifyContent: 'center', height: 44, width: '100%' }}>
                <Text style={{ left: 5 }}>{'KẾ HOẠCH CÔNG TÁC'}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', height: 44, width: '100%' }}>
                <Text style={{ width: '18%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{'Thời gian'}</Text>
                <Text style={{ width: '25%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{'Tên CH'}</Text>
                <Text style={{ width: '27%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{'Mã CH'}</Text>
                <Text style={{ width: '30%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{'Địa chỉ'}</Text>
            </View>
            {
                LstStore.length > 0 &&
                LstStore.map(item => {
                    return (
                        <TouchableOpacity onPress={() => console.log(item)}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', height: 44, width: '100%' }}>
                                <Text style={{ width: '18%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{item.AuditDate}</Text>
                                <Text style={{ width: '25%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{item.ShopName}</Text>
                                <Text style={{ width: '27%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{item.ShopCode}</Text>
                                <Text style={{ width: '30%', textAlign: 'center', borderWidth: 0.5, fontSize: 12, padding: 10 }}>{item.address}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })
            } */}

            <ActionSheet
                ref={_bottomSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ padding: 7, flexGrow: 1, backgroundColor: appcolor.surface }}>
                <View key={'date'} style={{ height: '80%' }}>
                    <FlatList
                        data={MoneyMove}
                        renderItem={renderItemKM}
                    ></FlatList>
                    {/* <RenderCalendar appcolor={appcolor}
                        currentDate={dateSelect}
                        handleDisplay={date => handleDateSelect(date)}
                    /> */}
                </View>

            </ActionSheet>
        </View>
    )
}
