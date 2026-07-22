import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Button } from '@rneui/themed';
import FormGroup from '../../Content/FormGroup';
import Moment from 'moment'
import ActionSheet from 'react-native-actions-sheet';
import { GetListWorkingSchedule, UploadBussinessTrip } from '../../Controller/BussinessTripController';
import { MessageInfo } from '../../Core/Helper';
// import NumberFormat from "react-number-format";
import { checkNetwork } from '../../Core/Utility';

export const BussinessTripResult = ({ bussinessInfo, appcolor, nextView, bottomSheet, presentView, MoneyMove, remaining }) => {
    const [modeRes, setModeRes] = useState();
    const [dateSelect, setDateSelect] = useState(new Date());
    const [typeDate, setTypeDate] = useState();
    const [bussinessShow, setBussinessShow] = useState(bussinessInfo)
    const _bottomSheet = useRef();

    const TYPE_PROVINCE_FROM = 'FROM PROVINCE'
    const TYPE_PROVINCE_TO = 'TO PROVINCE'
    const VIEW_RESULT = 'VIEW RESULT'
    const VIEW_INPUT = 'VIEW INPUT'
    const VIEW_HIS = 'VIEW HISTORY'
    const MODE_EDIT = 'RES_EDIT'
    const MODE_SAVE = 'RES_SAVE'
    const TYPE_DATE_FROM = 'FROM DATE'
    const TYPE_DATE_TO = 'TO DATE'

    const saveResult = async () => {
        if (bussinessShow?.supportTotal > remaining) {
            MessageInfo('Tổng trợ cấp không được lớn hơn số hạn mức hỗ trợ còn lại.')
            return
        }
        let today = parseInt(Moment().format('YYYYMM'));
        const busMotnh = Moment(bussinessShow?.fromDate, "YYYYMMDD").format("YYYYMM")
        if (busMotnh < today) {
            MessageInfo('Không được tạo chuyến đi tháng cũ.')
            return
        }
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }
        let lstWorkingSchedule = await GetListWorkingSchedule(Moment(bussinessShow?.fromDate).format('YYYYMMDD'), Moment(bussinessShow?.toDate).format('YYYYMMDD'));
        let lstCheck = lstWorkingSchedule || []
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
        console.log(bussinessShow, "bussinessShow")
        const _cal = CalculatorBy();
        return () => {
            _cal
        };
    }, [bussinessShow?.typeKm])
    // calcu
    const CalculatorBy = () => {
        let supportMove = 0;
        let numberDate = 0;
        let numberNight = 0;
        let supportTotal = 0;
        // console.log(bussinessShow, "CalculatorBy")
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

                let supportHotel = (numberNight * 300000);
                let supportRestaurant = (numberDate * 100000);

                if (bussinessShow?.typeKm) {
                    let price = bussinessShow?.typeKmInfo.numberValue || 0;
                    supportMove = price * numberDate;
                    supportTotal = (bussinessShow?.typeKmInfo?.isRequired === 1) ? (supportHotel + supportRestaurant + supportMove) : (supportRestaurant + supportMove);
                }


                setBussinessShow({ ...bussinessShow, numberDate: numberDate, numberNight: numberNight, supportHotel: supportHotel, supportRestaurant: supportRestaurant, supportMove: supportMove, supportTotal: supportTotal });
            }
            else {
                MessageInfo('Vui lòng chọn từ ngày phải sau đến ngày');
            }
        }
    }
    // const handleDateShow = async (type) => {
    //     await setTypeDate(type);
    //     _bottomSheet.current.show();
    // }
    // const handleDateSelect = async (date) => {
    //     if(typeDate === TYPE_DATE_FROM)
    //     {
    //         console.log(date,TYPE_DATE_FROM)
    //         setBussinessShow({...bussinessShow,fromDate:date});
    //     }
    //     else if(typeDate === TYPE_DATE_TO)
    //     {
    //         console.log(date,TYPE_DATE_TO)
    //         setBussinessShow({...bussinessShow,toDate:date});
    //     }

    //     _bottomSheet.current.hide();
    // }
    const renderItemKM = ({ item, index }) => {
        return (
            <TouchableOpacity key={index + "002j"} onPress={() => {
                setBussinessShow({ ...bussinessShow, typeKm: item.name });
                _bottomSheet.current.hide();
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', height: 70, width: '100%' }}>
                    <Text style={{ width: '100%', textAlign: 'center', borderWidth: 0.5, fontSize: 10, padding: 10 }}>{item.name}</Text>
                    {/* <Text style={{ width: '25%', textAlign: 'center', borderWidth: 0.5, fontSize: 10, padding: 10 }}>{item.shopName}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            {/* <Text>{JSON.stringify(bussinessShow)}</Text> */}
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
                    value={(bussinessShow?.workDate || Moment(new Date()).format('YYYY-MM-DD')) + ''}
                    useClearAndroid={false}
                />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Đợt công tác từ ngày'}
                    value={Moment(bussinessShow?.fromDate + '').format('YYYY-MM-DD')}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '49%' }}
                    title={'Đợt công tác đến ngày'}
                    value={Moment(bussinessShow?.toDate + '').format('YYYY-MM-DD')}
                    useClearAndroid={false}
                />
            </View>

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
                            value={value}
                            useClearAndroid={false}
                        />
                    }
                />
                <NumberFormat
                    key={'s2'}
                    disabled={true}
                    value={(bussinessShow?.supportTotal || '') + ''}
                    displayType={'text'}
                    thousandSeparator={true}
                    renderText={value =>
                        <FormGroup
                            containerStyle={{ width: '33%' }}
                            title={'Chi phí dự kiến'}
                            placeholder={'0'}
                            value={value}
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
            <TouchableOpacity onPress={() => _bottomSheet.current.show()}>
                <FormGroup
                    iconRight={modeRes === MODE_EDIT ? "caret-down" : null}
                    iconRightStyle={{ color: appcolor.primary }}
                    title={'Số KM của chuyến đi'}
                    placeholder={'0'}
                    value={(bussinessShow?.typeKm || '') + ''}
                    useClearAndroid={false}
                />
            </TouchableOpacity>
            <NumberFormat
                key={'s1'}
                disabled={true}
                value={(bussinessShow?.supportHotel || '') + ''}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Trợ cấp khách sạn'}
                        placeholder={'0'}
                        value={value}
                        useClearAndroid={false}
                    />
                }
            />
            <NumberFormat
                key={'s3'}
                disabled={true}
                value={(bussinessShow?.supportRestaurant || '') + ''}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Trợ cấp ăn uống'}
                        placeholder={'0'}
                        value={value}
                        useClearAndroid={false}
                    />
                }
            />
            <NumberFormat
                key={'s4'}
                disabled={true}
                value={(bussinessShow?.supportMove || '0') + ''}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Trợ cấp di chuyển'}
                        placeholder={'0'}
                        value={value}
                        useClearAndroid={false}
                    />
                }
            />
            <NumberFormat
                key={'s5'}
                disabled={true}
                value={(bussinessShow?.supportTotal || '0') + ''}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value =>
                    <FormGroup
                        title={'Tổng trợ cấp'}
                        placeholder={'0'}
                        value={value}
                        useClearAndroid={false}
                    />
                }
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '50%', alignSelf: 'flex-end' }}>
                {/* <Button containerStyle={{
                    width: '50%', height: 50,
                    backgroundColor: appcolor.tranparents,
                    alignItems: 'flex-end', right: 15,
                }}
                    buttonStyle={{ backgroundColor: modeRes === undefined ? appcolor.dark : appcolor.grey, paddingLeft: 25, paddingRight: 25 }}
                    onPress={() => modeRes === undefined ? setModeRes(MODE_EDIT) : setModeRes()}
                    title={'Sửa'}></Button> */}
                {
                    bussinessInfo?.isLock === false &&
                    <Button containerStyle={{
                        width: '50%', height: 50,
                        backgroundColor: appcolor.tranparents,
                        alignItems: 'flex-end', right: 15,
                    }}
                        buttonStyle={{ backgroundColor: appcolor.dark, paddingLeft: 25, paddingRight: 25 }}
                        onPress={() => saveResult()}
                        title={'Lưu'}></Button>
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
                containerStyle={{ padding: 8, flexGrow: 1, backgroundColor: appcolor.homebackground }}>

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
