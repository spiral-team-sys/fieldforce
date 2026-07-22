import React, { PureComponent, createRef } from 'react';
import { View, Switch, TextInput, ScrollView, Platform, FlatList, StyleSheet } from 'react-native';
import { Text, Card, SearchBar, Icon, Button, Slider } from '@rneui/themed';
import PageHeader from '../Content/PageHeader';
import { AppNameBuild, DEFAULT_COLOR, nokiaApp, psvApp } from '../Core/URLs';
import { Message } from "../Core/Helper";
import { checkNetwork, alertNotify, alertWarning, alertError } from "../Core/Utility";
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import ProgressCircleSnail from '../Content/ProgressCircleSnail';
import { Modalize } from 'react-native-modalize';
import { WORKINGPLAN_GetList, PLAN_uploadData, GetListShift, SR_PLAN_ChangeShift, PLAN_WorkingLate } from '../Controller/PlanController';
// import DropDownPicker from 'react-native-dropdown-picker';
// import InputSpinner from 'react-native-input-spinner';

//import { AppCreateAction } from '../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
const styles = StyleSheet.create({
  styleItemRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  styleSwitchView: {
    ...(Platform.OS === 'ios' && { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] })
  },
  inputNote: {
    fontSize: 13,
    color: 'black',
    height: 100,
    borderWidth: 0.5,
    alignItems: 'flex-start',
    textAlignVertical: 'top',
    borderColor: '#c2c2c2',
    borderRadius: 5,
    padding: 8,
    margin: 8
  }
});

const modalShiftRef = createRef();
const modalLateRef = createRef();
class WorkingPlan extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            lstWorkingPlan: [],
            lstRawSearch: [],
            strSearch: null,
            dateSelected: moment(new Date()).format('YYYY-MM-DD'),
            isShowCalendar: false,
            isSelectedPlan: false,
            showProgress: false,
            isEdit: false,
            bottomSheetData: {},
            dataShift: [],
            shiftSelect: null,
            noteChangeShift: null,
            timeLate: null,
            noteTimeLate: null,
            sendChangeShift: false,
            sendWorkingLate: false
        }
        this.typeIcon = 'material-community'
    }

    async componentDidMount() {
        await GetListShift((mData) => { this.setState({ dataShift: mData }) })
        await this.LoadData(this.state.dateSelected);
    }

    setProgressAction = (check) => {
        this.setState({ showProgress: check });
    }
    LoadData = async (plandate) => {
        this.setState({ dateSelected: plandate })
        await WORKINGPLAN_GetList(plandate, (message, responseJson, mEdit) => {
            if (message !== null && message.length > 0)
                alertNotify(message);
            this.setState({ lstWorkingPlan: responseJson, lstRawSearch: responseJson, isEdit: mEdit });
        })
    }
    SwitchChangePlan = (rowData) => {
        this.setState({
            lstWorkingPlan: this.state.lstWorkingPlan.map(i => (
                i.shopId === rowData.shopId ? { ...i, isWorking: (i.isWorking === 1 ? 0 : 1) } : i)
            ),
            lstRawSearch: this.state.lstRawSearch.map(i => (
                i.shopId === rowData.shopId ? { ...i, isWorking: (i.isWorking === 1 ? 0 : 1) } : i)
            )
        })
    }
    SHOP_filter = (search) => {
        this.setState({
            strSearch: search,
            lstWorkingPlan: this.state.lstRawSearch.filter((i) =>
                (i.shopName.toLowerCase().match(search.toLowerCase()) || i.shopCode.toLowerCase().match(search.toLowerCase()) || i.address.toLowerCase().match(search.toLowerCase()))
            )
        })
    }
    ACTION_updatePlan = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            alertWarning("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return;
        }
        if (this.state.lstWorkingPlan === null || this.state.lstWorkingPlan === undefined)
            return;
        Message('Cập nhật', 'Bạn có muốn thay đổi lịch làm việc mới nhất không ?', async () => {
            this.setProgressAction(true);
            await PLAN_uploadData(this.state.lstRawSearch, (message) => alertNotify(message), (isProgress) => this.setProgressAction(isProgress))
            await this.LoadData(this.state.dateSelected)
        });
    }
    showChangeShift = async (item) => {
        await modalShiftRef.current.open();
        this.setState({ bottomSheetData: item })
    }
    showWorkingLate = async (item) => {
        await modalLateRef.current.open();
        this.setState({ bottomSheetData: item })
    }
    PLAN_ChangeShift = async (items) => {
        if (items.supConfirm !== null) {
            alertNotify('Dữ liệu đã khóa, yêu cầu của bạn đã được xác nhận')
            return
        }
        const shiftChange = items.shiftChange;
        const noteChange = items.notes;
        if (shiftChange == null) {
            alertWarning('Vui lòng chọn ca chuyển trước khi lưu')
            return;
        }
        if (noteChange == null || noteChange == undefined) {
            alertWarning('Vui lòng nhập lí do chuyển ca')
            return;
        }
        if (noteChange !== null && noteChange.length < 10) {
            alertWarning('Lí do chuyển ca quá ngắn, vui lòng nhập lại (Tối thiểu 10 kí tự)')
            return;
        }

        let mDataChange = this.state.lstWorkingPlan.map(i => i.stt === items.stt ? { ...i, shiftChange: shiftChange, notes: noteChange } : i)
        this.setState({ lstWorkingPlan: mDataChange, sendChangeShift: true })
        await SR_PLAN_ChangeShift(mDataChange, (message) => alertNotify(message), (isProgress) => this.setState({ sendChangeShift: isProgress }))
    }
    PLAN_WorkingLate = async (items) => {
        if (items.supConfirmLate == 1) {
            alertNotify('Dữ liệu đã khóa, yêu cầu của bạn đã được xác nhận')
            return
        }
        const noteLate = items.noteLate;
        if (items.timeLate == null || items.timeLate == 0) {
            alertWarning('Vui lòng chọn thời gian đi trễ lớn hơn 0')
            return;
        }
        if (noteLate == null || noteLate == undefined) {
            alertWarning('Vui lòng nhập lí do đi trễ, về sớm')
            return;
        }
        if (noteLate !== null && noteLate.length < 10) {
            alertWarning('Lí do đi trễ, về sớm quá ngắn, vui lòng nhập lại (Tối thiểu 10 kí tự)')
            return;
        }
        let mDataChange = this.state.lstWorkingPlan.map(i => i.stt === items.stt ? { ...i, timeLate: this.state.timeLate, noteLate: noteLate } : i)
        this.setState({ lstWorkingPlan: mDataChange, sendWorkingLate: true })
        await PLAN_WorkingLate(mDataChange, (message) => alertNotify(message), (isProgress) => this.setState({ sendWorkingLate: isProgress }))
    }

    renderItem = ({ item }) => {
        const isEdit = item.isEdit === 1 ? false : true;
        const isWorking = item.isWorking === 1 ? true : false;
        const appcolor = this.props.appcolor
        return (
            <Card>
                <View style={styles.styleItemRow}>
                    <Icon
                        style={{ flex: 1, alignItems: 'flex-start', marginEnd: 8 }}
                        name='store' type={this.typeIcon} size={20} color={appcolor.black} />
                    <Text style={{ flex: 1, fontWeight: '700', fontSize: 14 }}>{item.shopName}</Text>
                </View>
                <View style={styles.styleItemRow}>
                    <Icon
                        style={{ flex: 1, alignItems: 'flex-start', marginEnd: 8 }}
                        name='code-string' type={this.typeIcon} size={20} color={appcolor.grey} />
                    <Text style={{ flex: 1, fontWeight: 'normal', fontSize: 14 }}>{item.shopCode}</Text>
                </View>
                <View style={styles.styleItemRow}>
                    <Icon
                        style={{ flex: 1, alignItems: 'flex-start', marginEnd: 8 }}
                        name='map-marker' type={this.typeIcon} size={20} color={appcolor.grey} />
                    <Text style={{ flex: 1, fontWeight: 'normal', fontSize: 13 }}>{item.address}</Text>
                </View>
                <View style={styles.styleItemRow}>
                    <Icon
                        style={{ flex: 1, alignItems: 'flex-start', marginEnd: 8 }}
                        name='calendar-clock' type={this.typeIcon} size={20} color={appcolor.grey} />
                    <Text style={{ flex: 1, fontWeight: 'normal', fontSize: 13 }}>{item.shiftView}</Text>
                </View>
                {<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                        {AppNameBuild !== psvApp &&
                            <Button type='solid' title={AppNameBuild !== nokiaApp ? 'Chuyển ca' : 'Xin nghỉ phép'}
                                titleStyle={{ fontSize: 12 }}
                                buttonStyle={{ backgroundColor: item.colorChangeShift, marginStart: 5 }}
                                onPress={() => this.showChangeShift(item)}
                            />}
                        {
                            AppNameBuild !== nokiaApp && AppNameBuild !== psvApp &&
                            <Button type='solid' title='Đi trễ, về sớm'
                                titleStyle={{ fontSize: 12 }}
                                buttonStyle={{ backgroundColor: item.colorWorkingLate, marginStart: 5 }}
                                onPress={() => this.showWorkingLate(item)}
                            />
                        }
                        {/* <Button type='outline' title='Upload'
                            titleStyle={{ fontSize: 12 }}
                            buttonStyle={{ marginStart: 5 }}
                        /> */}
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Switch
                            style={styles.styleSwitchView}
                            ios_backgroundColor={appcolor.switchDisible}
                            trackColor={{ true: appcolor.switchEnable, false: appcolor.switchDisible }}
                            thumbColor={appcolor.white}
                            //Event
                            disabled={isEdit}
                            value={isWorking} onValueChange={() => this.SwitchChangePlan(item)} />
                    </View>
                </View>}
            </Card>
        );
    }
    render() {
        const appcolor = this.props.appcolor
        return (
            <View style={{ flex: 1 }}>
                <PageHeader Title="Lịch làm việc"
                    leftclick={() => this.props.navigation.goBack()}
                    rightclick={this.ACTION_updatePlan}
                    righticon={this.state.isEdit == 1 ? 'cloud-upload-alt' : null}
                    rightcolor='white'
                    {...this.props} />
                <CalendarStrip
                    scrollable
                    style={{ height: 100, paddingTop: 8, paddingBottom: 8 }}
                    minDate={'2023-01-01'}
                    calendarAnimation={{ type: 'sequence', duration: 30 }}
                    daySelectionAnimation={{ type: 'border', duration: 200 }}
                    calendarHeaderStyle={{ color: 'white' }}
                    calendarColor={DEFAULT_COLOR}
                    dateNumberStyle={{ color: 'white' }}
                    dateNameStyle={{ color: 'white' }}
                    highlightDateContainerStyle={{ borderColor: 'white', borderWidth: 1 }}
                    highlightDateNumberStyle={{ color: 'yellow' }}
                    highlightDateNameStyle={{ color: 'yellow' }}
                    disabledDateNameStyle={{ color: 'grey' }}
                    disabledDateNumberStyle={{ color: 'grey' }}
                    iconLeft={require('../Themes/Images/chevron-left.png')}
                    iconRight={require('../Themes/Images/chevron-right.png')}
                    iconContainer={{ flex: 0.1 }}
                    //Event
                    selectedDate={this.state.dateSelected}
                    onDateSelected={(mDate) => { this.LoadData(moment(mDate).format("YYYY-MM-DD")) }}
                />
                <SearchBar
                    round lightTheme cancelIcon
                    value={this.state.strSearch}
                    containerStyle={{ backgroundColor: appcolor.transparent, borderBottomColor: appcolor.transparent, paddingBottom: 5 }}
                    inputContainerStyle={{ height: 35 }}
                    inputStyle={{ fontSize: 13 }}
                    placeholder="Tìm kiếm cửa hàng"
                    onChangeText={this.SHOP_filter} />
                <ProgressCircleSnail Title="Đang cập nhật lịch làm việc" isShowing={this.state.showProgress} />
                <FlatList
                    scrollEnabled={true}
                    extraData={this.state}
                    keyExtractor={(item) => item.shopId}
                    style={{ flex: 1, marginBottom: 32 }}
                    data={this.state.lstWorkingPlan}
                    renderItem={this.renderItem}
                    initialNumToRender={10}
                    windowSize={10}
                />
                <Modalize ref={modalShiftRef} modalHeight={630} modalStyle={{ padding: 8 }} onClose={() => this.setState({ bottomSheetData: {} })}>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontWeight: '700' }}>{AppNameBuild !== nokiaApp ? 'Chuyển ca làm việc' : 'Xin nghỉ phép'}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '500' }}>{this.state.bottomSheetData.shopName} ({this.state.bottomSheetData.dateView})</Text>
                        <View style={{ flex: 2, padding: 8, borderColor: '#c2c2c2', borderWidth: 0.5, marginBottom: 8, marginTop: 8 }}>
                            <View style={{
                                flex: 1, flexDirection: 'column', ...(Platform.OS !== 'android' && { zIndex: 10 })
                            }}>
                                <Text style={{ flex: 1 }}>{this.state.bottomSheetData.shiftView}</Text>
                                {/* <DropDownPicker
                                    zIndex={100}
                                    disabled={this.state.bottomSheetData.supConfirm !== null}
                                    items={this.state.dataShift}
                                    defaultValue={this.state.bottomSheetData.shiftChange}
                                    style={{ backgroundColor: '#fafafa', margin: 8 }}
                                    itemStyle={{ justifyContent: 'flex-start' }}
                                    dropDownStyle={{ backgroundColor: '#fafafa' }}
                                    dropDownMaxHeight={180}
                                    placeholder={AppNameBuild !== nokiaApp ? 'Ca chuyển' : 'Chọn'}
                                    onChangeItem={item => this.setState({
                                        bottomSheetData: Object.assign({}, this.state.bottomSheetData, { shiftChange: item.value }),
                                        shiftSelect: item.value
                                    })}
                                    autoScrollToDefaultValue={true}
                                /> */}
                            </View>
                            <Text style={{ flex: 1 }}>{AppNameBuild !== nokiaApp ? 'Lí do chuyển ca' : 'Nhập lý do'}</Text>
                            <TextInput
                                editable={this.state.bottomSheetData.supConfirm == null}
                                value={this.state.bottomSheetData.notes} style={{ ...styles.inputNote, flex: 1, minHeight: 50, height: 'auto' }} multiline
                                onChangeText={(text) => {
                                    this.setState({
                                        bottomSheetData: Object.assign({}, this.state.bottomSheetData, { notes: text }),
                                        noteChangeShift: text
                                    })
                                }} />
                            <Text style={{ flex: 1, marginBottom: 5, fontSize: 15, fontWeight: '500', fontStyle: 'italic' }}>{this.state.bottomSheetData.supNote}</Text>
                            <Button
                                loading={this.state.sendChangeShift} disabled={this.state.sendChangeShift}
                                title={this.state.bottomSheetData.titleChangeShift}
                                style={{ zIndex: 0 }}
                                buttonStyle={{ backgroundColor: this.state.bottomSheetData.colorChangeShift }} titleStyle={{ fontSize: 15, fontWeight: '700' }}
                                onPress={() => this.PLAN_ChangeShift(this.state.bottomSheetData)} />
                        </View>
                    </View>
                </Modalize>
                <Modalize ref={modalLateRef} modalHeight={630} modalStyle={{ padding: 8 }} onClose={() => this.setState({ bottomSheetData: {} })}>
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontWeight: '700' }}>Xin phép đi trễ, về sớm</Text>
                        <Text style={{ fontSize: 13, fontWeight: '500' }}>{this.state.bottomSheetData.shopName} ({this.state.bottomSheetData.dateView})</Text>
                        <View style={{ padding: 8, borderColor: '#c2c2c2', borderWidth: 0.5, marginBottom: 8, marginTop: 8 }}>
                            <View style={{ flex: 1, flexDirection: 'column', paddingBottom: 5 }}>
                                <Text style={{ paddingBottom: 5 }}>Thời gian đi trễ (Phút)</Text>
                                {/* <InputSpinner max={90} min={0} step={5} width={200} height={30}
                                    disabled={this.state.bottomSheetData.supConfirmLate == 1}
                                    inputStyle={{ borderWidth: 0.5, borderColor: 'black' }}
                                    buttonStyle={{ backgroundColor: appcolor.black, height: 30, width: 50 }}
                                    value={this.state.bottomSheetData.timeLate}
                                    onChange={(num) => {
                                        this.setState({
                                            bottomSheetData: Object.assign({}, this.state.bottomSheetData, { timeLate: num }),
                                            timeLate: num
                                        })
                                    }}
                                    onKeyPress={(e) => this.setState({
                                        bottomSheetData: Object.assign({}, this.state.bottomSheetData, { timeLate: num }),
                                        timeLate: e !== null && e > 90 ? 90 : e
                                    })}
                                /> */}
                            </View>
                            <Text style={{ flex: 1 }}>Lí do đi trễ, về sớm</Text>
                            <TextInput
                                editable={this.state.bottomSheetData.supConfirmLate !== 1}
                                value={this.state.bottomSheetData.noteLate} style={{ ...styles.inputNote, flex: 1, minHeight: 50, height: 'auto' }} multiline
                                onChangeText={(text) => this.setState({
                                    bottomSheetData: Object.assign({}, this.state.bottomSheetData, { noteLate: text }),
                                    noteTimeLate: text
                                })} />
                            <Text style={{ flex: 1, marginBottom: 5, fontSize: 15, fontWeight: '500', fontStyle: 'italic' }}>{this.state.bottomSheetData.supNoteLate}</Text>
                            <Button loading={this.state.sendWorkingLate} disabled={this.state.sendWorkingLate}
                                title={this.state.bottomSheetData.titleWorkingLate}
                                titleStyle={{ fontSize: 15, fontWeight: '700' }}
                                onPress={() => this.PLAN_WorkingLate(this.state.bottomSheetData)} />
                        </View>
                    </View>
                </Modalize>
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        appcolor: state.GAppState.appcolor,
    }
}
const mapDispathToProps = (dispatch) => {
    return {
        GAppController: bindActionCreators(AppCreateAction, dispatch),
    }
}
export default connect(mapStateToProps, mapDispathToProps)(WorkingPlan)
