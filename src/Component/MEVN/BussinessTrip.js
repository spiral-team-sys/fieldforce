import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, FlatList, Text } from 'react-native';
import { Icon } from '@rneui/themed';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useSelector } from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import { BussinessTripDetails } from './BussinessTripDetails';
import { BussinessTripInput } from './BussinessTripInput';
import { BussinessTripHistory } from './BussinessTripHistory';
import { MessageInfo, ToastError } from '../../Core/Helper';
import Moment from 'moment'
import FormGroup from '../../Content/FormGroup';
import { checkNetwork } from '../../Core/Utility';
import { GetListRegions, getWorkingPlanByDate } from '../../Controller/BussinessTripController';
import { getMasterlist } from '../../Controller/MasterController';
import { AttendantController } from '../../Controller/AttendantController';
import { AppNameBuild, mitsuApp } from '../../Core/URLs';
// Casper
import { Casper_BussinessTripDetails } from '../../Component/Casper/BussinessTrips/Casper_BussinessTripDetails';
import { Casper_BussinessTripInput } from '../../Component/Casper/BussinessTrips/Casper_BussinessTripInput';
import { Casper_BussinessTripHistory } from '../../Component/Casper/BussinessTrips/Casper_BussinessTripHistory';

const DETAL_LOCATION = 0.005
const VIEW_RESULT = 'VIEW RESULT'
const VIEW_INPUT = 'VIEW INPUT'
const VIEW_HIS = 'VIEW HISTORY'

export const BussinessTrip = ({ navigation }) => {
    const [LstAddress, setLstAddress] = useState([]);
    const [currentLocation, setCurrent] = useState(null);
    const [myAddress, setMyAddress] = useState();
    const [showButton, setShowButton] = useState(false);
    const [search, setSearch] = useState('');
    const [remaining, setRemaining] = useState(0);

    const _mapRef = useRef(null);
    const _bottomSheetGoogle = useRef();
    const _actionSheetRef = useRef();
    const _searchRef = useRef();

    const [mode, setMode] = useState(VIEW_HIS);
    const [modeAddress, setModeAddress] = useState();
    const [MoneyMove, setMoneyMove] = useState([]);
    const [PeopleInRoom, setPeopleInRoom] = useState([]);

    const { appcolor, userinfo } = useSelector(state => state.GAppState);
    const [bussinessInfo, setBussinessInfo] = useState({
        employeeName: userinfo.employeeName,
        employeeCode: userinfo.employeeCode
    })

    const [Provinces, setProvinces] = useState([]);
    // {
    //     "name": "Ho Chi Minh",
    //     "province": "Ho Chi Minh",
    //     "provinceCode": "7000"
    // }

    const loadProvinces = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        if (Provinces.length === 0) {
            let lsttem = await GetListRegions();
            setProvinces(lsttem);
        }
    }

    const [bussinessInput, setBussinessInput] = useState({
        employeeName: userinfo.employeeName,
        employeeCode: userinfo.employeeCode,
        fromDate: Moment().startOf('month').format('YYYY-MM-DD'),
        toDate: Moment(new Date()).format('YYYY-MM-DD'),
    })

    const searchMap = async (type) => {
        setModeAddress(type);
        setSearch('');
        _searchRef.current?.focus();
        _actionSheetRef.current?.hide();
    }
    const searchLocation = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        AttendantController.LocationFromAddress(search, (res) => {
            const info = {
                "address": res.address,
                "latitude": res.location?.lat,
                "longitude": res.location?.lng
            }
            console.log(res)
            setLstAddress(info);
            _bottomSheetGoogle.current.show();
        }, (error) =>
            MessageInfo('Không tìm thấy địa chỉ cần tìm'))

    }
    const mapItemWorkingPlan = (lstwp) => {
        let lstTem = [];
        let lstDate = [];
        lstwp.map(it => {
            if (!lstDate.includes(it.auditDate)) {
                lstDate.push(it.auditDate);
                lstTem.push({ auditDateKM: it.auditDate });
            }

            lstTem.push(it)
        })

        return lstTem
    }
    const loadWorkingPlan = async (fromdate, todate) => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return
        }

        let lstWorkingPlan = await getWorkingPlanByDate(fromdate, todate);
        let lstCV = [];
        lstCV = (lstWorkingPlan) ? await mapItemWorkingPlan(lstWorkingPlan) : []
        if (lstCV.length > 0) {
            await setBussinessInput({
                ...bussinessInput,
                workingplan: lstCV
            })
        }
    }
    const loadMasterlist = async () => {
        let lstMasterMoneyMove = await getMasterlist('WorkingScheduleKM');
        let lstMasterInRoom = await getMasterlist('PeopleInRoom');
        if (lstMasterMoneyMove.length === 0) {
            ToastError('Chưa có dữ liệu km');
            return
        }
        await setMoneyMove(lstMasterMoneyMove)
        await setPeopleInRoom(lstMasterInRoom)
    }
    useEffect(() => {
        loadMasterlist();
        loadProvinces();
        requestMylocation();
        _actionSheetRef.current?.setModalVisible(true);
        // _actionSheetRef.current?.snapToOffset(300);
        return () => false
    }, [])
    const [defaultLocation, setLocationDef] = useState({
        latitude: 10.7880143,
        longitude: 106.6984652,
        latitudeDelta: DETAL_LOCATION,
        longitudeDelta: DETAL_LOCATION,
    })
    const [makerLocation, setMakerLocation] = useState({
        latitude: 10.7880143,
        longitude: 106.6984652,
        latitudeDelta: DETAL_LOCATION,
        longitudeDelta: DETAL_LOCATION,
    })
    const requestMylocation = (successCallback, errorCallback) => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                const region = {
                    latitude: lat,
                    longitude: long,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                }

                setCurrent(region)
                moveLocation(position.coords);
                successCallback && successCallback(region)
            },
            (error) => {
                errorCallback && errorCallback(error)
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            }
        );
    }
    const moveLocation = (moveInfo) => {
        _mapRef && _mapRef.current.animateToRegion({
            latitude: moveInfo.latitude, longitude: moveInfo.longitude,
            latitudeDelta: DETAL_LOCATION,
            longitudeDelta: DETAL_LOCATION,
        })
    }
    const moveCurrentLocation = () => {
        requestMylocation(
            (region) => {
                (_mapRef !== undefined) && _mapRef.current.animateToRegion(region)
            },
            () => {
                MessageInfo('Bạn chưa có toạ độ vui lòng bật tính năng vị trí trong phần cài đặt của máy.')
            }
        )
    }
    const nextView = async (view, itemInfo) => {
        await setBussinessInfo({ ...bussinessInfo, ...itemInfo, view: view });
    }
    const resetBussinessInput = async () => {
        await setBussinessInput({
            employeeName: userinfo.employeeName,
            employeeCode: userinfo.employeeCode,
            fromDate: Moment().startOf('month').format('YYYY-MM-DD'),
            toDate: Moment(new Date()).format('YYYY-MM-DD'),
        });
        await loadWorkingPlan(parseInt(bussinessInput?.fromDate.replace(/-/gm, '')), parseInt(bussinessInput?.toDate.replace(/-/gm, '')));
    }

    useEffect(() => {
        setMode(bussinessInfo.view || VIEW_HIS);
        return () => false
    }, [bussinessInfo])
    const renderItemAddress = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (mode === VIEW_INPUT && modeAddress === 'from') {
                    setModeAddress();
                    setBussinessInput({ ...bussinessInput, locationFrom: item.geometry.lat + ',' + item.geometry.lng, fromAddress: item.formatted_address })
                    _bottomSheetGoogle.current.hide();
                }
                else if (mode === VIEW_INPUT && modeAddress === 'to') {
                    setModeAddress();
                    setBussinessInput({ ...bussinessInput, locationTo: item.geometry.lat + ',' + item.geometry.lng, toAddress: item.formatted_address })
                    _bottomSheetGoogle.current.hide();
                }
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', height: 70, width: '100%' }}>
                    <Text style={{ width: '100%', textAlign: 'center', borderWidth: 0.5, fontSize: 14, padding: 10 }}>{item.formatted_address}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <View style={{ flex: 1 }} >
            <MapView
                style={{ flex: 1, marginBottom: 0 }}
                zoomEnabled={true}
                provider={PROVIDER_GOOGLE}
                getCurrentPosition={true}
                ref={_mapRef}
                showsUserLocation={true}
                showsMyLocationButton={false}
                scrollingEnabled={true}
                onRegionChange={(regionc) => {
                    setMakerLocation(regionc);
                }}
                initialRegion={defaultLocation}
            >
                <Marker
                    pinColor={appcolor.primary}
                    draggable
                    coordinate={makerLocation}
                />
            </MapView>
            {
                <View style={{
                    top: 50, position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'space-between'
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name='arrow-back' reverse />
                    </TouchableOpacity>
                    {/* <FormGroup
                        inputRef={_searchRef}
                        containerStyle={{ width: '100%' }}
                        iconFunc={() => navigation.goBack()}
                        handleChangeForm={setSearch} useClearAndroid={false}
                        value={search} placeholder="Nhập địa chỉ tìm kiếm..."
                        editable={modeAddress ? true : false}
                        rightFunc={() => searchLocation()}
                        iconRight={modeAddress ? "search" : null} iconRightStyle={{ color: appcolor.primary }}
                        iconName="arrow-left"
                        onEndEditing={() => searchLocation()}
                    ></FormGroup> */}
                </View>
            }

            {/* <View style={{ top: 90, position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
                {
                    modeAddress &&
                    <Button title={'Chọn vị trí ' + (modeAddress === 'from' ? 'nơi đi' : 'nơi đến') + ' ở đây'}
                        containerStyle={{ borderRadius: 10, width: '50%', backgroundColor: 'transperant' }}
                        titleStyle={{ textAlign: 'center', fontSize: 13, fontWeight: '700' }}
                        buttonStyle={{ backgroundColor: appcolor.primary, height: 40 }} onPress={() => searchLocation()}
                    ></Button>
                }
            </View> */}

            <ActionSheet
                initialOffsetFromBottom={mode === VIEW_INPUT ? 0.4 : 1}
                id={'sheetBussinessTrip'}
                ref={_actionSheetRef}
                keyboardHandlerEnabled={false}
                statusBarTranslucent
                bounceOnOpen={true}
                bounciness={4}
                gestureEnabled={false}
                onClose={() => { _searchRef.current?.focus() }}
                defaultOverlayOpacity={0.3}
                drawUnderStatusBar={Platform.OS == 'ios'}
                closable={false}
            >
                <View style={{ backgroundColor: appcolor.light }}>
                    {mode !== VIEW_HIS &&
                        <TouchableOpacity
                            onPress={() => { (mode === VIEW_RESULT || mode === VIEW_INPUT) && setMode(VIEW_HIS) }}
                            style={{ flexDirection: 'row', paddingLeft: 16, padding: 4, height: 50, alignItems: 'center', backgroundColor: appcolor.transparent }}>
                            <Icon
                                color={appcolor.primary}
                                name='angle-left'
                                type='font-awesome'
                                size={35} />
                            <Text style={{ color: appcolor.dark, flexGrow: 0.7, paddingLeft: 12 }}>Chi tiết công tác phí</Text>
                        </TouchableOpacity>
                    }
                    {AppNameBuild === mitsuApp ?
                        <ScrollView
                            nestedScrollEnabled
                            onMomentumScrollEnd={() => { _actionSheetRef.current?.handleChildScrollEnd() }}
                            style={{ flexGrow: 1, padding: 12 }}
                            contentContainerStyle={{ paddingBottom: 200 }}
                        >
                            {mode === VIEW_RESULT &&
                                <BussinessTripDetails
                                    key={'details'}
                                    actionSheetRef={_actionSheetRef}
                                    bussinessInfo={bussinessInfo} appcolor={appcolor} nextView={nextView}
                                    Provinces={Provinces} presentView={mode} MoneyMove={MoneyMove} remaining={remaining}
                                />
                            }
                            {mode === VIEW_INPUT &&
                                <BussinessTripInput
                                    key={'input'}
                                    actionSheetRef={_actionSheetRef} bussinessInfo={bussinessInfo} appcolor={appcolor} nextView={nextView}
                                    myAddress={myAddress} searchMap={searchMap} bussinessInput={bussinessInput} setBussinessInput={setBussinessInput}
                                    Provinces={Provinces} MoneyMove={MoneyMove} />
                            }
                            {mode === VIEW_HIS &&
                                <BussinessTripHistory
                                    key={'history'}
                                    actionSheetRef={_actionSheetRef} bussinessInfo={bussinessInfo} appcolor={appcolor} nextView={nextView}
                                    resetBussinessInput={resetBussinessInput} MoneyMove={MoneyMove} remaining={remaining} setRemaining={setRemaining} />
                            }
                        </ScrollView>
                        :
                        <ScrollView
                            nestedScrollEnabled
                            onMomentumScrollEnd={() => { _actionSheetRef.current?.handleChildScrollEnd() }}
                            style={{ flexGrow: 1, padding: 12 }}
                            contentContainerStyle={{ paddingBottom: 200 }}
                        >
                            {mode === VIEW_RESULT &&
                                <Casper_BussinessTripDetails
                                    key={'_details'}
                                    actionSheetRef={_actionSheetRef}
                                    bussinessInfo={bussinessInfo} appcolor={appcolor} nextView={nextView}
                                    Provinces={Provinces} presentView={mode} MoneyMove={MoneyMove} remaining={remaining}
                                    PeopleInRoom={PeopleInRoom}
                                />
                            }
                            {mode === VIEW_INPUT &&
                                <Casper_BussinessTripInput
                                    key={'_input'}
                                    actionSheetRef={_actionSheetRef} bussinessInfo={bussinessInfo} appcolor={appcolor} nextView={nextView}
                                    myAddress={myAddress} searchMap={searchMap} bussinessInput={bussinessInput} setBussinessInput={setBussinessInput}
                                    Provinces={Provinces} MoneyMove={MoneyMove} PeopleInRoom={PeopleInRoom} />
                            }
                            {mode === VIEW_HIS &&
                                <Casper_BussinessTripHistory
                                    key={'_history'}
                                    actionSheetRef={_actionSheetRef} bussinessInfo={bussinessInfo} appcolor={appcolor} nextView={nextView}
                                    resetBussinessInput={resetBussinessInput} MoneyMove={MoneyMove} PeopleInRoom={PeopleInRoom} remaining={remaining} setRemaining={setRemaining} />
                            }
                        </ScrollView>

                    }
                </View>
            </ActionSheet >

            <ActionSheet
                onClose={() => _actionSheetRef.current.show()}
                ref={_bottomSheetGoogle}
                defaultOverlayOpacity={0.3}
                containerStyle={{ padding: 8, flexGrow: 1, backgroundColor: appcolor.light }}>
                <View key={'date'} style={{ height: '80%' }}>
                    {LstAddress.length > 0 &&
                        <FlatList
                            data={LstAddress}
                            renderItem={renderItemAddress}
                        />
                    }
                </View>
            </ActionSheet>

            <TouchableOpacity
                onPress={() => moveCurrentLocation()}
                style={{ position: 'absolute', zIndex: 5, bottom: 10, right: 10, justifyContent: 'center' }}>
                <Icon reverse
                    color={appcolor.info}
                    name='location-arrow'
                    type='font-awesome'
                    size={24} />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => _actionSheetRef.current.show()}
                style={{ position: 'absolute', zIndex: 5, bottom: 10, left: 10, justifyContent: 'center' }}>
                <Icon
                    color={appcolor.success}
                    name='briefcase' raised
                    type='font-awesome'
                    size={24} />
            </TouchableOpacity>
        </View >
    );
}