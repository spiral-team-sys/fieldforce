import { TouchableOpacity, View, Text, Dimensions, FlatList } from "react-native"
import React, { useEffect, useRef, useState } from 'react'
import FormGroup from "../../Content/FormGroup";
import { Capitalize, checkNetwork, deviceWidth, minWidthTab } from "../../Core/Utility";
import { Button, Divider, Icon } from '@rneui/themed';
import { RenderCalendar } from "../../Core/DatePickerView";
import Moment from 'moment'
import ActionSheet from 'react-native-actions-sheet';
import { GetListWorkingSchedule } from "../../Controller/BussinessTripController";
import { MessageInfo } from "../../Core/Helper";
import * as Progress from 'react-native-progress';
// import NumberFormat from "react-number-format";
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view'
const VIEW_RESULT = 'VIEW RESULT'
const VIEW_INPUT = 'VIEW INPUT'
const VIEW_HIS = 'VIEW HISTORY'

export const BussinessTripHistory = ({ bussinessInfo, appcolor, nextView, resetBussinessInput, remaining, setRemaining }) => {
    const [IndexTab, setIndexTab] = useState();
    const [LstShowF, setLstShowF] = useState([]);
    const [selectTab, setSelectTab] = useState();
    const [LstTab, setLstTab] = useState([])
    const [dateSelect, setDateSelect] = useState(new Date());
    const [start, setStart] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    const [typeDate, setTypeDate] = useState();
    const [bussinessShow, setBussinessShow] = useState({ ...bussinessInfo, fromDateF: bussinessShow?.fromDateF ? Moment(bussinessShow?.fromDateF).format('YYYYMMDD') : Moment().startOf('month').format('YYYYMMDD'), toDateF: Moment(bussinessShow?.toDateF || new Date()).format('YYYYMMDD') });

    const _bottomSheet = useRef();
    const TYPE_DATE_FROM = 'FROM DATE'
    const TYPE_DATE_TO = 'TO DATE'

    const loadData = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            setShowProgress(false);
            return
        }
        await setStart(true);
        await setShowProgress(true);
        let lstWorkingSchedule = await GetListWorkingSchedule(Moment(bussinessShow?.fromDateF).format('YYYYMMDD'), Moment(bussinessShow?.toDateF).format('YYYYMMDD'));
        await setLstShowF(lstWorkingSchedule || []);
        let lstTab = [];
        let lstId = [];
        if (Array.isArray(lstWorkingSchedule)) {
            await lstWorkingSchedule.map((it, index) => {
                if (!lstId.includes(it.status)) {
                    setRemaining(it.remaining);
                    lstId.push(it.status);
                    const _data = lstWorkingSchedule.filter(item => item.status === it.status)
                    it.status !== undefined && lstTab.push({ id: index, name: it.status, details: _data, key: `${index}Sta` });
                }
            })
            await setLstTab(lstTab);
        }
        await setShowProgress(false)
    }
    useEffect(() => {
        start === false && loadData();
        return () => false;
    }, [])
    useEffect(() => {
        const _load = loadData();
        return () => {
            _load
        }
    }, [bussinessShow?.fromDateF, bussinessShow?.toDateF])
    const handleDateShow = async (type) => {
        await setTypeDate(type);
        _bottomSheet.current.show();
    }
    const handleDateSelect = async (date) => {
        let dateCV = parseInt(date.replace(/[^\w\s]/gi, ''))
        if (typeDate === TYPE_DATE_FROM) {
            let toDateCV = parseInt(bussinessShow?.toDateF.replace(/[^\w\s]/gi, ''))
            if (dateCV > toDateCV) {
                MessageInfo('ngày bắt đầu phải sau ngày kết thúc.')
                return;
            }

            await setBussinessShow({ ...bussinessShow, fromDateF: date });
        }
        else if (typeDate === TYPE_DATE_TO) {
            let fromDateCV = parseInt(bussinessShow?.fromDateF.replace(/[^\w\s]/gi, ''))
            if (dateCV < fromDateCV) {
                MessageInfo('ngày kết thúc phải trước ngày bắt đầu.')
                return
            }
            await setBussinessShow({ ...bussinessShow, toDateF: date });
        }

        _bottomSheet.current.hide();

    }
    const handlerCreate = async () => {
        await resetBussinessInput();
        nextView(VIEW_INPUT, { ...bussinessInfo, status: 'Khởi tạo' })
    }
    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={`${index}2adaa`} onPress={() => nextView(VIEW_RESULT, { ...item, isLock: true })}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', maxHeight: 70, width: '100%' }}>
                    <Text style={{ width: '35%', textAlign: 'center', color: appcolor.dark, fontSize: 10, padding: 10 }}>
                        {Moment(item.fromDate?.toString()).format('DD-MMM') + ' -> ' + Moment(item.toDate, "YYYYMMDD").format('DD-MMM YY')}</Text>
                    <Text style={{ width: '35%', textAlign: 'center', color: appcolor.dark, fontSize: 10, padding: 10 }}>
                        {item.provinceFromVN + ' -> ' + item.provinceToVN}</Text>
                    <NumberFormat
                        key={'s1'}
                        disabled={true}
                        value={item.totalSupport}
                        displayType={'text'}
                        thousandSeparator={true}
                        renderText={value =>
                            <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontSize: 10, padding: 10 }}>{value}</Text>
                        }
                    >
                    </NumberFormat>
                </View>
                <View style={{ borderWidth: 1, borderColor: appcolor.surface, width: '100%' }} />
            </TouchableOpacity>
        )
    }
    const ViewItem = ({ data, index }) => {
        return (
            <View style={{ backgroundColor: appcolor.surface }} key={`23${index}09h`}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomWidth: 0.5, borderColor: appcolor.dark, width: '100%' }}>
                    <Text style={{ width: '35%', textAlign: 'center', color: appcolor.dark, fontSize: 12, padding: 10 }}>{'ĐỢT CT'}</Text>
                    <Text style={{ width: '35%', textAlign: 'center', color: appcolor.dark, fontSize: 12, padding: 10 }}>{'NƠI CT'}</Text>
                    <Text style={{ width: '30%', textAlign: 'center', color: appcolor.dark, fontSize: 12, padding: 10 }}>{'TRỢ CẤP'}</Text>
                </View>
                <FlatList
                    scrollEnabled={false}
                    data={data}
                    renderItem={renderItem}
                ></FlatList>
            </View>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    containerStyle={{ width: '33%' }}
                    title={'Tên nhân viên'}
                    value={bussinessInfo?.employeeName}
                    useClearAndroid={false}
                />
                <FormGroup
                    containerStyle={{ width: '33%' }}
                    title={'Mã nhân viên'}
                    value={bussinessInfo?.employeeCode}
                    useClearAndroid={false}
                />
                <NumberFormat
                    key={'s2'}
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
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormGroup
                    rightFunc={() => handleDateShow(TYPE_DATE_FROM)}
                    iconRight={"caret-down"} iconRightStyle={{ color: appcolor.primary }}
                    containerStyle={{ flexGrow: 1, marginRight: 3 }}
                    title={'Từ ngày'}
                    value={bussinessShow?.fromDateF ? Moment(bussinessShow?.fromDateF).format('YYYY-MM-DD') : Moment().startOf('month').format('YYYY-MM-DD')}
                    useClearAndroid={false}
                />
                <FormGroup
                    rightFunc={() => handleDateShow(TYPE_DATE_TO)}
                    iconRight={"caret-down"} iconRightStyle={{ color: appcolor.primary }}
                    containerStyle={{ flexGrow: 1, marginLeft: 3 }}
                    title={'Đến ngày'}
                    value={Moment(bussinessShow?.toDateF || new Date()).format('YYYY-MM-DD')}
                    useClearAndroid={false}
                />
            </View>
            {
                LstTab.length > 0 &&
                < Tabs.Container
                    renderTabBar={props => (
                        <MaterialTabBar
                            {...props}
                            labelStyle={{ fontSize: 14, fontWeight: '600' }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            scrollEnabled={true}
                            style={{ backgroundColor: appcolor.light }}
                            tabStyle={{ minWidth: minWidthTab(LstTab), height: 36 }}
                        />
                    )}>
                    {
                        LstTab.map((value, i) => {
                            return (
                                <Tabs.Tab key={`12k${i}`} name={`(${value.details.length}) ${Capitalize(value.name)}`}>
                                    <View style={{
                                        backgroundColor: appcolor.light, marginTop: 40, padding: 6,
                                        width: deviceWidth
                                    }}>
                                        <ViewItem data={value.details} index={`${i}02jjj`} key={value.key} />
                                    </View>
                                </Tabs.Tab>
                            )
                        })
                    }
                </Tabs.Container>
            }
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', paddingTop: 90 }}>
                <Button containerStyle={{ backgroundColor: appcolor.info, }}
                    buttonStyle={{ backgroundColor: appcolor.success }}
                    icon={<Icon name="add" size={22} color={appcolor.white} />}
                    onPress={handlerCreate} title={'Đăng kí ngay'}></Button>

            </View>

            <ActionSheet
                ref={_bottomSheet}
                defaultOverlayOpacity={0.3}
                containerStyle={{ padding: 8, flexGrow: 1, backgroundColor: appcolor.light }}>

                <View key={'date'} style={{}}>
                    <RenderCalendar appcolor={appcolor}
                        currentDate={dateSelect}
                        handleDisplay={date => handleDateSelect(date)}
                    />
                </View>

            </ActionSheet>

            {
                showProgress && <View style={{
                    position: 'absolute', alignItems: 'center', alignSelf: "center",
                    marginTop: Dimensions.get('window').height / 3
                }}><Progress.Circle thickness={1} size={65} indeterminate={true} />
                    <Text style={{ color: '#007AFF' }}>...</Text></View>
            }

        </View >
    )
}