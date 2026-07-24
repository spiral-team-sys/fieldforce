import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  DeviceEventEmitter,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Moment from 'moment';

import {
  checkAddWork,
  updateWorkStatus,
  uploadTimeOT,
} from '../../Controller/WorkController';
import { SYNC_DATA_ATT, CAMERA_NOTE, _competitorId } from '../../Core/URLs';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Button, Divider, Icon, Switch, Text } from '@rneui/themed';
import { deviceHeight, deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { ToastError, ToastSuccess, UUIDGenerator } from '../../Core/Helper';
import { GetPhotosINOUT, UpdateTimeOT } from '../../Controller/PhotoController';
import FormGroup from '../../Content/FormGroup';
import { getMasterlist } from '../../Controller/MasterController';
import { ATTENDANT } from '../../Core/KEYs';
import { AttendantController } from '../../Controller/AttendantController';
import { SetReport } from '../../Redux/action';
import AttendanceList from '../../Content/Attendance/AttendanceList';
import Attendant from '../../Content/Attendant';
import KPIList from '../../Content/Menu/KPIList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const status = { TC: 1, KTC: 0 };
export const ShopTask = ({
  navigation,
  shopId,
  OTSign,
  OTSummary,
  NumberAtt,
}) => {
  const insets = useSafeAreaInsets();
  const { shopinfo, appcolor, userinfo, workinfo } = useSelector(
    state => state.GAppState,
  );
  const [masterlst, setMasterLst] = useState([]);
  const [note, setNote] = useState(null);
  const [otherNote, setOtherNote] = useState({ note: '' });
  const [noteName, setNoteName] = useState('Nhập lý do');
  const [itemSelect, setItemSelect] = useState({});
  const [noteOption, setNoteAttendant] = useState(null);
  const [dataOTSummary, setDataOTSummary] = useState([]);
  const [isKTC, setIsKTC] = useState(false);
  const [toDoList, setToDoList] = useState(false);
  const [isLockWorkStatus, setLockWorkStatus] = useState(
    shopinfo?.finish > 0 && shopinfo?.finish % 2 === 0,
  );
  const dispatch = useDispatch();

  const workLoad = async () => {
    const workTemplate = await {
      shopId: shopinfo.shopId || 0,
      shopName: shopinfo.shopName,
      shopCode: shopinfo.shopCode,
      address: shopinfo.address,
      imageUrl: shopinfo.imageUrl,
      workDate: shopinfo.auditDate,
      workTime: Moment(new Date()).format('YYYYMMDDHHmmss'),
      workStatus: status.TC,
      attendantCount: 2,
      guiid: UUIDGenerator(),
      shopConfig: shopinfo.config || '{}',
    };
    const workCurrent = await checkAddWork(workTemplate);
    await dispatch(SetReport(workCurrent));
    await DeviceEventEmitter.emit(SYNC_DATA_ATT, null);
    //
    let configInfo = await JSON.parse(shopinfo?.config || '{}');
    await setIsKTC(configInfo.ktc == 1);
    await setToDoList(configInfo.toDoList == 1);
  };
  const loadData = async () => {
    let listCode = '';
    switch (noteOption) {
      case ATTENDANT.NOTE:
        listCode = 'ATTENDANT';
        break;
      case ATTENDANT.KTC:
        listCode = 'KTC';
        break;
      case ATTENDANT.NOTEKPI:
        listCode = 'NoteKPI';
        break;
      case ATTENDANT.NOTEREPORT:
        listCode = 'NoteReport';
        break;
      default:
        listCode = 'OT';
    }

    let masterList = await getMasterlist(listCode);
    await setMasterLst(masterList);
  };

  const LoadOTSummary = async () => {
    await AttendantController.GetOTSummary(
      shopinfo?.shopId,
      async dataSummary => {
        await setDataOTSummary(dataSummary);
      },
    );
  };
  const handlerClose = () => {
    setItemSelect({});
    setNoteAttendant(null);
  };
  const handlerKTC = async value => {
    const statusWorking = value ? 1 : 0;
    const work = { ...workinfo, workStatus: statusWorking };
    await dispatch(SetReport(work));
    await updateWorkStatus(workinfo.workId, statusWorking);

    statusWorking == 0 &&
      isKTC &&
      (await showNoteAttendant(ATTENDANT.KTC, 'Lí do Không thành công'));
  };
  useEffect(() => {
    if (shopinfo?.shopId !== undefined) workLoad();
    return () => false;
  }, [shopId]);
  useEffect(() => {
    loadData();
    if (OTSign > 0) {
      LoadOTSummary();
      setNoteAttendant('OT');
      SheetManager.show('bottomSheet');
    }
    return () => false;
  }, [OTSign]);
  useEffect(() => {
    loadData();
    return () => false;
  }, [noteOption]);

  const renderItem = ({ item, index }) => {
    const actionPress = async () => {
      await setItemSelect(item);
      await setNote(null);
    };
    return (
      <View
        key={'das' + index}
        style={{ backgroundColor: appcolor.light, minWidth: 100 }}
      >
        <TouchableOpacity
          style={{
            borderRadius: 16,
            backgroundColor:
              itemSelect.listCode == item.listCode &&
              itemSelect.code == item.code
                ? appcolor.primary
                : appcolor.surface,
            marginHorizontal: 5,
            marginVertical: 5,
          }}
          onPress={actionPress}
        >
          <Text
            style={{
              padding: 8,
              textAlign: 'center',
              color:
                itemSelect.listCode == item.listCode &&
                itemSelect.code == item.code
                  ? appcolor.white
                  : appcolor.dark,
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const confirmOT = async () => {
    const shopNote = JSON.parse(shopinfo?.config || '{}').shopNote || 0; // Ghi chu (neu co) -- Khong rang buoc
    if (shopNote === 0) {
      if (
        noteOption === ATTENDANT.NOTE &&
        (note === null || note.length < 10)
      ) {
        ToastError(
          'Vui lòng nhập nội dụng ghi chú & tối thiểu 10 kí tự',
          'Ghi chú',
          'top',
        );
        return;
      }
    }
    if (
      noteOption === ATTENDANT.SELECT ||
      noteOption === ATTENDANT.NOTEREPORT ||
      noteOption == ATTENDANT.KTC ||
      noteOption == ATTENDANT.NOTEKPI
    ) {
      if (Object.keys(itemSelect).length === 0) {
        ToastError('Vui lòng chọn lý do.', 'Chú ý', 'top');
        return;
      } else if (itemSelect.id === 100 && (note === null || note.length < 10)) {
        ToastError(
          'Vui lòng nhập lý do khác & tối thiểu 10 kí tự',
          'Lý do',
          'top',
        );
        return;
      }
    }
    if (noteOption === ATTENDANT.OT) {
      if (Object.keys(itemSelect).length === 0) {
        ToastError('Bạn chưa chọn thời gian tăng ca!', 'Lý do', 'top');
        return;
      } else if (note === null) {
        ToastError('Bạn chưa nhập lý do!', 'Lý do', 'top');
        return;
      } else if (note.length < 10) {
        ToastError('Lý do tối thiểu 10 kí tự!', 'Lý do', 'top');
        return;
      }
      const confirmMonth = dataOTSummary[0];
      if (confirmMonth != undefined) {
        const sumOT =
          parseInt(confirmMonth.totalOT) + parseInt(itemSelect.ref_Code);
        if (sumOT >= confirmMonth.limitOT) {
          ToastError(
            `Giờ tăng ca của bạn đã ${confirmMonth.limitOT} giờ hoặc hơn`,
            'Tăng ca',
            'top',
          );
          return;
        }
      }
    }
    const overTime = parseFloat(itemSelect.ref_Code);
    //Update Data
    if (noteOption === ATTENDANT.NOTE || noteOption === ATTENDANT.SHOPNOTE)
      await DeviceEventEmitter.emit(CAMERA_NOTE, note);
    else if (
      noteOption === ATTENDANT.SELECT ||
      noteOption === ATTENDANT.NOTEREPORT ||
      noteOption == ATTENDANT.KTC ||
      noteOption == ATTENDANT.NOTEKPI
    )
      await DeviceEventEmitter.emit(
        CAMERA_NOTE,
        note === null
          ? itemSelect.name +
              `${otherNote.note?.length > 0 ? ', ' + otherNote.note : ''}`
          : note,
      );
    else if (noteOption === ATTENDANT.OT) {
      await uploadTimeOT(
        shopinfo.shopId,
        shopinfo.auditDate,
        overTime,
        note,
        async responseJson => {
          let result = false;
          if (responseJson.status === 200) {
            result = await UpdateTimeOT(
              overTime,
              note,
              shopinfo.shopId,
              shopinfo.auditDate,
              '0',
            );
          }
          result
            ? ToastSuccess(responseJson.messeger)
            : ToastError('Lỗi khi gửi dữ liệu!');
        },
      );
    }
    await SheetManager.hide('bottomSheet');
    await setItemSelect({});
  };

  const showNoteAttendant = async (noteType, noteName) => {
    await setNote(null);
    await setNoteAttendant(noteType);
    await setNoteName(noteName);
    await SheetManager.show('bottomSheet');
  };
  const bottomButton = () => {
    const actionPress = async () => {
      await SheetManager.hide('bottomSheet');
      handlerClose();
    };
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 7,
          backgroundColor: appcolor.light,
          alignSelf: 'center',
          bottom: 10,
        }}
      >
        <Button
          type="outline"
          title="Huỷ"
          buttonStyle={{
            borderColor: appcolor.primary,
            backgroundColor: appcolor.light,
          }}
          titleStyle={{
            color: appcolor.primary,
            fontSize: 15,
            fontWeight: '500',
          }}
          containerStyle={{
            borderColor: appcolor.transparent,
            width: '48%',
            marginRight: 7,
          }}
          onPress={actionPress}
        />
        <Button
          title="Xác nhận"
          titleStyle={{ fontSize: 15, fontWeight: '500' }}
          buttonStyle={{
            borderColor: appcolor.primary,
            backgroundColor: appcolor.primary,
          }}
          containerStyle={{ width: '48%' }}
          onPress={confirmOT}
        />
      </View>
    );
  };

  const renderItemOT = ({ item, index }) => {
    return (
      <View
        key={`OT_${index}`}
        style={{
          width: deviceWidth / 3,
          height: 100,
          padding: 8,
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        <Text
          style={{
            color: appcolor.info,
            fontSize: 25,
            textAlign: 'center',
            fontWeight: '800',
          }}
        >
          {item.totalOT}
        </Text>
        <Text
          style={{
            color: appcolor.dark,
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {item.title}{' '}
        </Text>
      </View>
    );
  };
  const RenderNoteSelect = ({}) => {
    const actionPress = async item => {
      await setItemSelect(item);
      await setNote(null);
    };
    return (
      <View
        style={{ width: '100%', height: (deviceHeight * 3) / 5 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          key="selectview"
          style={{ width: '100%', height: '100%', padding: 10 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: appcolor.primary,
                padding: 5,
                textAlign: 'center',
              }}
            >
              {noteName}
            </Text>
          </View>
          <View style={{ maxHeight: '60%' }}>
            <ScrollView nestedScrollEnabled>
              {masterlst.length > 0 &&
                masterlst.map((item, index) => {
                  return (
                    <View
                      key={'das' + index}
                      style={{ backgroundColor: appcolor.light, minWidth: 100 }}
                    >
                      <TouchableOpacity
                        style={{
                          borderRadius: 16,
                          backgroundColor:
                            itemSelect.listCode == item.listCode &&
                            itemSelect.code == item.code
                              ? appcolor.primary
                              : appcolor.surface,
                          marginHorizontal: 5,
                          marginVertical: 5,
                        }}
                        onPress={() => actionPress(item)}
                      >
                        <Text
                          style={{
                            padding: 8,
                            textAlign: 'center',
                            color:
                              itemSelect.listCode == item.listCode &&
                              itemSelect.code == item.code
                                ? appcolor.white
                                : appcolor.dark,
                          }}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </ScrollView>
          </View>
          <FormGroup
            handleChangeForm={text => (otherNote.note = text)}
            defaultValue={otherNote.note}
            editable
            iconName={'comment-alt'}
            selectTextOnFocus={true}
            containerStyle={{ marginBottom: 10, marginTop: 10 }}
            inputStyle={{ fontSize: 13, color: appcolor.dark }}
            numberOfLines={3}
            multiline={true}
            onClearTextAndroid={() => setOtherNote({ note: '' })}
            placeholder="Nhập ghi chú ở đây"
          />
          {bottomButton()}
        </View>
      </View>
    );
  };

  return (
    <View style={{ height: '100%', width: '100%' }}>
      {isKTC && (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
        >
          <Switch
            disabled={isLockWorkStatus}
            thumbColor={appcolor.light}
            trackColor={appcolor.success}
            value={workinfo.workStatus == status.TC}
            onValueChange={handlerKTC}
          />
          <Text
            style={{
              padding: 8,
              fontSize: 15,
              fontWeight: '600',
              color:
                workinfo.workStatus == status.TC ? appcolor.dark : appcolor.red,
            }}
          >
            {workinfo.workStatus == status.TC
              ? 'Thành công'
              : 'Không thành công'}
          </Text>
        </View>
      )}
      <Attendant
        noteAtt={note}
        noteAttendant={showNoteAttendant}
        navigation={navigation}
        OnHistory={false}
        OTSign={OTSign}
        numberAtt={NumberAtt}
        shopinfo={shopinfo}
      />
      <View>
        <KPIList />
      </View>
      {toDoList && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            backgroundColor: appcolor.blacklight,
            padding: 16,
            borderRadius: 50,
            bottom: 12,
            end: 16,
            shadowColor: appcolor.dark,
            shadowOpacity: 0.4,
            elevation: 5,
            shadowOffset: { width: 1, height: 1 },
          }}
          onPress={() => navigation.navigate('todolist')}
        >
          <SpiralIcon
            name="tasks"
            type="font-awesome-5"
            size={20}
            color={appcolor.light}
          />
        </TouchableOpacity>
      )}
      <ActionSheet
        id={'bottomSheet'}
        keyboardHandlerEnabled={false}
        defaultOverlayOpacity={0.3}
        onClose={handlerClose}
        gestureEnabled={false}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View
          style={{
            width: '100%',
            height: deviceHeight * 0.7,
            alignContent: 'center',
          }}
        >
          {noteOption === ATTENDANT.OT && (
            <View
              key="otview"
              style={{
                width: deviceWidth,
                height: deviceHeight / 1.2,
                paddingBottom: 16,
              }}
            >
              {dataOTSummary?.length > 0 && (
                <View
                  style={{
                    width: deviceWidth,
                    height: '20%',
                    borderBottomColor: appcolor.surface,
                    borderBottomWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: appcolor.dark,
                      width: '100%',
                      textAlign: 'center',
                      padding: 5,
                    }}
                  >
                    Thống kê tăng ca
                  </Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ width: deviceWidth, height: deviceHeight }}
                    contentContainerStyle={{
                      width: deviceWidth,
                      justifyContent: 'center',
                    }}
                    key="listSummaryOT"
                    keyExtractor={(_, index) => index.toString()}
                    data={dataOTSummary}
                    renderItem={renderItemOT}
                  />
                </View>
              )}
              <View style={{ width: deviceWidth, height: '50%' }}>
                <View style={{ width: deviceWidth, height: 100 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: appcolor.dark,
                      width: '100%',
                      textAlign: 'center',
                      padding: 8,
                    }}
                  >
                    Đăng kí thời gian tăng ca
                  </Text>
                  <FlatList
                    horizontal
                    style={{ width: deviceWidth, height: deviceHeight }}
                    showsHorizontalScrollIndicator={false}
                    key={item => item.id}
                    keyExtractor={(item, index) => item + index}
                    data={masterlst}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
                <FormGroup
                  containerStyle={{ margin: 8 }}
                  title={'Nhập lý do tăng ca'}
                  handleChangeForm={text => setNote(text)}
                  defaultValue={note}
                  editable
                  inputStyle={{ minHeight: 80 }}
                  numberOfLines={3}
                  multiline={true}
                  onClearTextAndroid={() => setNote('')}
                  placeholder="Nhập lý do ở đây"
                />
                {bottomButton()}
              </View>
            </View>
          )}
          {(noteOption === ATTENDANT.NOTE ||
            noteOption === ATTENDANT.SHOPNOTE) && (
            <View
              key="noteview"
              style={{
                width: deviceWidth,
                height: deviceHeight / 3,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  marginLeft: 12,
                  padding: 7,
                  fontSize: scaleSize(18),
                  fontWeight: 'bold',
                  color: appcolor.primary,
                }}
              >
                {noteName}
              </Text>
              <FormGroup
                title={'Nhập lý do'}
                handleChangeForm={text => setNote(text)}
                defaultValue={note}
                editable
                inputStyle={{ minHeight: 120 }}
                numberOfLines={3}
                multiline={true}
                onClearTextAndroid={() => setNote('')}
                placeholder="Nhập ghi chú ở đây"
              />
              {bottomButton()}
            </View>
          )}
          {(noteOption === ATTENDANT.SELECT ||
            noteOption === ATTENDANT.NOTEREPORT ||
            noteOption === ATTENDANT.KTC ||
            noteOption === ATTENDANT.NOTEKPI) &&
            itemSelect.id === 100 && (
              <View
                key="selectotherview"
                style={{
                  width: deviceWidth,
                  height: deviceHeight / 3,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    marginLeft: 12,
                    padding: 7,
                    fontSize: scaleSize(18),
                    fontWeight: 'bold',
                    color: appcolor.primary,
                  }}
                >
                  {noteName}
                </Text>
                <FormGroup
                  title={'Nhập lý do'}
                  handleChangeForm={text => setNote(text)}
                  defaultValue={note}
                  editable
                  inputStyle={{ minHeight: 120 }}
                  numberOfLines={3}
                  multiline={true}
                  onClearTextAndroid={() => setNote('')}
                  placeholder="Nhập ghi chú ở đây"
                />
                {bottomButton()}
              </View>
            )}
          {(noteOption === ATTENDANT.SELECT ||
            noteOption === ATTENDANT.NOTEREPORT) &&
            itemSelect.id !== 100 && <RenderNoteSelect />}
          {noteOption === ATTENDANT.KTC && itemSelect.id !== 100 && (
            <RenderNoteSelect />
          )}
          {noteOption === ATTENDANT.NOTEKPI && itemSelect.id !== 100 && (
            <RenderNoteSelect />
          )}
        </View>
      </ActionSheet>
    </View>
  );
};
