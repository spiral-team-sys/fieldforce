import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderCustom } from '../Content/HeaderCustom';
import { DividerIcon, Icon, Text } from '@rneui/themed';
import { scaleSize } from '../Themes/AppsStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastError, defaultSetting } from '../Core/Helper';
import { LoadingView } from '../Control/ItemLoading';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight } from '../Core/Utility';
import { SetTheme } from '../Redux/action';

const list = [1, 2, 3]
export const Settings = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState)

  const [isLoading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const [setting, setSettings] = useState({});
  const [mode, setMode] = useState(false)
  const [faceId, setFaceId] = useState(false)
  const [exportAttendant, setExportAttendant] = useState(false)
  const [exportPhotoReport, setExportPhotoReport] = useState(false)
  const [cleanDataPhoto, setCleanDataPhoto] = useState({ 'isOpenClean': false, 'cleanFrom': 1, 'isWeek': false })

  const LoadDefault = async () => {
    const json = await AsyncStorage.getItem("SETTINGS");
    const settings = await JSON.parse(json) || await defaultSetting;
    //
    await setSettings(settings)
    await setMode(settings.mode)
    await setFaceId(settings.faceId)
    await setExportAttendant(settings.exportAttendant)
    await setExportPhotoReport(settings.exportPhotoReport)
    await setCleanDataPhoto(settings?.cleanDataPhoto || cleanDataPhoto)
  }
  // Handler
  const onChangeSettings = async (key, value) => {
    try {
      await setLoading(true)
      switch (key) {
        case "mode":
          await setMode(value);
          await dispatch(SetTheme(value));
          break
        case "faceId":
          await setFaceId(value)
          break
        // case "exportAttendant":
        //   if (google)
        //     await setGoogle(value);
        //   break;
        case "exportAttendant":
          await setExportAttendant(value)
          break;
        case "exportPhotoReport":
          await setExportPhotoReport(value)
          break;
        case "cleanDataPhoto":
          await setCleanDataPhoto({ ...cleanDataPhoto, isOpenClean: value, cleanFrom: 1 })
          if (value)
            SheetManager.show('actioncalendar')
          break;
      }
      await setLoading(false)
      let _modefield = await setting;
      _modefield[key] = value;
      await AsyncStorage.setItem("SETTINGS", JSON.stringify(_modefield))
    } catch (e) {
      await setLoading(false)
      ToastError(`Lỗi: ${e}`)
    }
  }
  const handlerChangeTimeDelete = async (key, type, value) => {
    try {
      await setLoading(true)
      let valueSave = {}
      switch (key) {
        case "cleanDataPhoto":
          valueSave = { ...cleanDataPhoto, [type]: value }
          await setCleanDataPhoto({ ...cleanDataPhoto, [type]: value })
          break;
        default:
          break;
      }
      await setLoading(false)
      let _modefield = await setting;
      _modefield[key] = valueSave;
      await AsyncStorage.setItem("SETTINGS", JSON.stringify(_modefield))
    } catch (err) {
      await setLoading(false)
      ToastError(`Lỗi: ${e}`)
    }
  }
  // View
  useEffect(() => {
    const _loaddefault = LoadDefault()
    return () => _loaddefault
  }, [])
  const styles = StyleSheet.create({
    mainContainer: { backgroundColor: appcolor.light, flex: 1 },
    controlView: { width: '100%', padding: 8, flexDirection: 'row', alignItems: 'center' },
    titleControl: { width: '75%', fontSize: 14, fontWeight: '600', color: appcolor.dark },
    switchView: { ...(Platform.OS === 'ios' && { transform: [{ scaleX: .9 }, { scaleY: .9 }] }), position: 'absolute', end: 16 },
    headerTitle: { fontSize: scaleSize(14), color: appcolor.greydark, padding: 8, paddingBottom: 0, fontStyle: 'italic', fontWeight: '400' },
    calendarTitle: { fontSize: scaleSize(16), color: appcolor.dark, padding: 8, paddingBottom: 0, fontWeight: '600' },
    itemTitle: { fontSize: 14, fontWeight: '600', padding: 8, minWidth: 80, textAlign: 'center' }
  })
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom leftFunc={() => navigation.goBack()} title='Cài đặt' />
      <LoadingView isLoading={isLoading} title="Đang kết nối..." />
      <Text style={styles.headerTitle}>Chế độ tối/Sáng</Text>
      <ControlView
        itemKey='mode'
        styles={styles}
        title={!mode ? 'Chế độ nền sáng' : 'Chế độ nền tối'}
        iconName={!mode ? 'sunny' : 'moon'}
        isChecked={mode}
        toggleSwitch={onChangeSettings}
      />
      <Text style={styles.headerTitle}>Sử dụng đăng nhập bằng  Khuôn mặt / Vân tay</Text>
      <ControlView
        itemKey='faceId'
        styles={styles}
        title={!faceId ? 'Xác thực bằng Khuôn mặt / Vân tay' : 'Đã bật xác thực'}
        iconName='user-shield'
        iconType='font-awesome-5'
        isChecked={faceId}
        toggleSwitch={onChangeSettings}
      />
      {/* <ControlView
        itemKey='google'
        styles={styles}
        title={!google ? 'Liên kết bằng tài khoản Gmail' : 'Đã liên kết tài khoản Gmail'}
        iconName='google'
        iconType='font-awesome-5'
        isChecked={google}
        toggleSwitch={onChangeSettings}
      />
      <ControlView
        itemKey='facebook'
        styles={styles}
        title={!facebook ? 'Liên kết bằng tài khoản Facebook' : 'Đã liên kết tài khoản Facebook'}
        iconName='facebook-f'
        iconType='font-awesome-5'
        isChecked={facebook}
        toggleSwitch={onChangeSettings}
      /> */}
      <Text style={styles.headerTitle}>Xuất File & Hình ảnh</Text>
      <ControlView
        itemKey='exportAttendant'
        styles={styles}
        title={!exportAttendant ? 'Lưu hình ảnh chấm công' : 'Đã bật lưu hình ảnh chấm công'}
        iconName='id-badge'
        iconType='font-awesome-5'
        isChecked={exportAttendant}
        toggleSwitch={onChangeSettings}
      />
      <ControlView
        itemKey='exportPhotoReport'
        styles={styles}
        title={!exportPhotoReport ? 'Lưu hình ảnh báo cáo' : 'Đã bật lưu hình ảnh báo cáo'}
        iconName='images'
        iconType='font-awesome-5'
        isChecked={exportPhotoReport}
        toggleSwitch={onChangeSettings}
      />
      <Text style={styles.headerTitle}>Xoá hình ảnh</Text>
      <ControlView
        itemKey='cleanDataPhoto'
        styles={styles}
        title={`${cleanDataPhoto?.isOpenClean ? "Đã bật xoá dữ liệu hình ảnh" : "Xoá dữ liệu hình ảnh"} ${cleanDataPhoto?.isOpenClean ? `(${cleanDataPhoto?.cleanFrom} ${cleanDataPhoto?.isWeek ? 'Tuần' : 'Tháng'})` : ''}`}
        iconName='trash-alt'
        iconType='font-awesome-5'
        isChecked={cleanDataPhoto.isOpenClean}
        toggleSwitch={onChangeSettings}
      />
      {/* Acction Choose */}
      <ActionSheet id='actioncalendar'
        gestureEnabled
        containerStyle={{ height: deviceHeight / 4 }}>
        <Text style={styles.calendarTitle}>Thời gian giữ hình ảnh trên thiết bị</Text>
        <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginVertical: 8 }} />
        <View style={styles.contentChange}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View key={`Month`} style={{ margin: 8, marginEnd: 0, borderRadius: 20, backgroundColor: !cleanDataPhoto?.isWeek ? appcolor.primary : appcolor.surface }} >
              <TouchableOpacity onPress={() => handlerChangeTimeDelete('cleanDataPhoto', 'isWeek', false)}>
                <Text style={{ ...styles.itemTitle, color: !cleanDataPhoto?.isWeek ? appcolor.white : appcolor.dark }}>Tháng</Text>
              </TouchableOpacity>
            </View>
            <View key={`Week`} style={{ margin: 8, borderRadius: 20, backgroundColor: cleanDataPhoto?.isWeek ? appcolor.primary : appcolor.surface }} >
              <TouchableOpacity onPress={() => handlerChangeTimeDelete('cleanDataPhoto', 'isWeek', true)}>
                <Text style={{ ...styles.itemTitle, color: cleanDataPhoto?.isWeek ? appcolor.white : appcolor.dark }}>Tuần</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ borderWidth: 1, borderColor: appcolor.surface, marginVertical: 8 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: 8 }}>
            {list.map((item, i) => {
              const handlerChange = () => {
                handlerChangeTimeDelete('cleanDataPhoto', 'cleanFrom', item)
              }
              return (
                <View key={`${i}jkao`} style={{
                  padding: 8, borderRadius: 20, marginEnd: 8, marginBottom: 8,
                  backgroundColor: cleanDataPhoto?.cleanFrom === item ? appcolor.primary : appcolor.surface
                }}>
                  <TouchableOpacity onPress={handlerChange}>
                    <Text style={{ color: cleanDataPhoto?.cleanFrom === item ? appcolor.white : appcolor.dark, minWidth: 68, textAlign: 'center' }}>
                      {item} {cleanDataPhoto?.isWeek ? 'Tuần' : 'Tháng'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        </View>
      </ActionSheet>
    </View>
  )
}
const ControlView = ({ itemKey, styles, title, iconName, iconType, isChecked, toggleSwitch }) => {
  const { appcolor } = useSelector(state => state.GAppState)
  const handlerChangeValue = (value) => {
    toggleSwitch(itemKey, value)
  }
  return (
    <View style={styles.controlView}>
      <Icon
        name={iconName}
        type={iconType || 'ionicon'}
        size={25}
        color={appcolor.primary}
        solid
        style={{ minWidth: 30, margin: 8, marginEnd: 16 }} />
      <Text style={styles.titleControl}>{title}</Text>
      <Switch
        style={styles.switchView}
        trackColor={{ true: appcolor.success }}
        thumbColor={appcolor.white}
        onValueChange={handlerChangeValue}
        value={isChecked}
      />
    </View>
  )
}