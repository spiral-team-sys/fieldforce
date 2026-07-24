import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { GetEmployeeManager } from '../../../Controller/EmployeeController';
import { Avatar, Icon, Text } from '@rneui/themed';
import { deviceHeight, deviceWidth, minWidthTab } from '../../../Core/Utility';
import { URLDEFAULT } from '../../../Core/URLs';
import {
  ColorRand,
  ToastError,
  removeVietnameseTones,
} from '../../../Core/Helper';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import { LoadingView } from '../../../Control/ItemLoading';
import FormGroup from '../../../Content/FormGroup';
import { SafeAreaView } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ConfirmsResigns } from '../../LG/ConfirmsResigns';
import { EmployeeEdit } from './ItemUpdate/EmployeeEdit';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const HomeManager = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataEmployee, setDataEmployee] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [itemEdit, setItemEdit] = useState({});
  const tabRef = useRef();
  //
  const LoadData = async () => {
    await setLoading(true);
    const result = await GetEmployeeManager();
    if ((await result.statusId) === 200) {
      const tabList = await _.uniqBy(result.data, 'groupType');
      await setTabList(tabList);
      await setDataEmployee(result.data);
      await setDataMain(result.data);
    }
    await setLoading(false);
  };
  // Handler
  const onCallEmployee = phone => {
    let phoneNumber =
      Platform.OS == 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          ToastError(
            'Số điện thoại không đúng hoặc sai định dạng, vui lòng kiểm tra và thử lại sau',
            'Số điện thoại',
          );
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(error => {
        console.log(error);
        ToastError(`Lỗi: ${error}`);
      });
  };
  const onShowUpdate = async (item, color) => {
    await setItemEdit({ ...item, backgroundColor: color });
    await SheetManager.show('updateinfo');
  };
  const handlerConfirmResign = () => {
    SheetManager.show('confirmresign');
  };
  const handleViewImage = () => { };
  const onSearchEmployee = async text => {
    const value = removeVietnameseTones(text);
    const filterlist = _.filter(dataMain, e => {
      return (
        removeVietnameseTones(e.employeeName)
          .toLowerCase()
          .match(value.toLowerCase()) ||
        removeVietnameseTones(e?.employeeCode || '')
          .toLowerCase()
          .match(value.toLowerCase()) ||
        removeVietnameseTones(e?.address || '')
          .toLowerCase()
          .match(value.toLowerCase()) ||
        removeVietnameseTones(e?.mobile || '')
          .toLowerCase()
          .match(value.toLowerCase()) ||
        removeVietnameseTones(e?.gender || '')
          .toLowerCase()
          .match(value.toLowerCase())
      );
    });
    const tabList = await _.uniqBy(filterlist, 'groupType');
    await setTabList(tabList);
    await setDataEmployee(filterlist);
  };
  // View
  useEffect(() => {
    const _load = LoadData();
    const _updateprofile = DeviceEventEmitter.addListener(
      'UPDATE_LIST_PROFILE',
      () => {
        LoadData();
      },
    );
    return () => {
      _load;
      _updateprofile.remove();
    };
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    mainItem: {
      margin: 8,
      borderWidth: 0.8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    contentHeader: { width: '100%', flexDirection: 'row', zIndex: 1 },
    contentMain: { width: '100%', height: deviceHeight - deviceHeight / 8 },
    titleEmployee: { fontSize: 16, fontWeight: '700', color: appcolor.light },
    subTitleEmployee: {
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.light,
      fontStyle: 'italic',
    },
    contentUser: { padding: 8 },
    titleContent: {
      width: '75%',
      fontWeight: '500',
      fontSize: 14,
      marginTop: 3,
      color: appcolor.blacklight,
    },
    contentAction: {
      position: 'absolute',
      bottom: 8,
      end: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchView: { margin: 8, padding: 5, borderRadius: 50 },
    inputStyle: { fontSize: 13, fontWeight: '500' },
  });
  const renderItem = ({ item, index }) => {
    const colorItem = ColorRand(index);
    const handlerCall = () => onCallEmployee(item.mobile);
    const handlerDetails = () => onShowUpdate(item, colorItem);
    return (
      <TouchableOpacity key={`ide_${index}`} onPress={handlerDetails}>
        <View style={{ ...styles.mainItem, borderColor: colorItem }}>
          {/* Header User */}
          <View style={styles.contentHeader}>
            <View
              style={{
                alignSelf: 'center',
                width: '100%',
                backgroundColor: colorItem,
                padding: 8,
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.titleEmployee}>{item.employeeName} </Text>
                <SpiralIcon
                  solid
                  name={item.status == 1 ? 'check-circle' : 'times-circle'}
                  type="font-awesome-5"
                  size={15}
                  color={item.status == 1 ? appcolor.success : appcolor.red}
                  style={{
                    backgroundColor: appcolor.light,
                    padding: 2,
                    borderRadius: 20,
                  }}
                />
              </View>
              <Text
                style={styles.subTitleEmployee}
              >{`Code: ${item.employeeCode} / User: ${item.username} `}</Text>
            </View>
            <View style={{ position: 'absolute', end: 16, top: 16 }}>
              {item.photo !== null ? (
                <Avatar
                  rounded
                  size="large"
                  source={{ uri: URLDEFAULT + item.photo }}
                  containerStyle={{
                    backgroundColor: appcolor.light,
                    padding: 3,
                  }}
                  onPress={handleViewImage}
                />
              ) : (
                <Avatar
                  rounded
                  size="large"
                  title={item.shortName}
                  titleStyle={{ color: appcolor.primary, fontWeight: '600' }}
                  containerStyle={{
                    borderWidth: 3,
                    borderColor: appcolor.placeholderBody,
                    padding: 3,
                    backgroundColor: appcolor.light,
                  }}
                />
              )}
            </View>
          </View>
          {/* Content User */}
          <View style={styles.contentUser}>
            {item.listShopName !== null && (
              <Text style={styles.titleContent}>{`${item.listShopName}`}</Text>
            )}
            <Text style={styles.titleContent}>{`Địa chỉ: ${item.address || 'Không có địa chỉ'
              }`}</Text>
            <Text style={styles.titleContent}>{`SĐT: ${item.mobile}`}</Text>
            <Text style={styles.titleContent}>{`Email: ${item.email}`}</Text>
            <Text
              style={styles.titleContent}
            >{`Giới tính: ${item.gender}`}</Text>
            <Text
              style={styles.titleContent}
            >{`Ngày vào làm: ${item.workingDate}`}</Text>
            <Text
              style={styles.titleContent}
            >{`Phép còn lại: ${item.holiday}`}</Text>
            <Text
              style={styles.titleContent}
            >{`Trạng thái làm việc: ${item.workingStatusName}`}</Text>
          </View>
          {/* Action User */}
          <View style={styles.contentAction}>
            <TouchableOpacity onPress={handlerCall}>
              <SpiralIcon
                name="phone"
                type="font-awesome-5"
                size={18}
                color={appcolor.info}
                style={{
                  padding: 8,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: appcolor.info,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const contentEmployee = () => {
    return (
      tabList !== null &&
      tabList.length > 0 &&
      tabList.map((item, index) => {
        const dataType = _.filter(dataEmployee, e => {
          return e.groupType == item.groupType;
        });
        const titleName = `${item.groupType} (${dataType.length})`;
        return (
          <Tabs.Tab key={`adl_${index}`} label={titleName} name={titleName}>
            <View style={{ width: deviceWidth, marginTop: 58 }}>
              <FlatList
                key="manageList"
                keyExtractor={(_item, index) => index.toString()}
                data={dataType}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={false} onRefresh={LoadData} />
                }
              />
            </View>
          </Tabs.Tab>
        );
      })
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
        rightFunc={
          JSON.parse(kpiinfo?.reportItem || '{}')?.isShowConfirm == 1
            ? handlerConfirmResign
            : null
        }
        iconRight="clipboard-check"
      />
      <View style={styles.contentMain}>
        <FormGroup
          editable
          placeholder="Tìm kiếm nhân viên"
          iconName="search"
          containerStyle={styles.searchView}
          inputStyle={styles.inputStyle}
          handleChangeForm={onSearchEmployee}
        />
        <LoadingView
          isLoading={isLoading}
          title="Đang cập nhật danh sách nhân viên"
          styles={{ marginTop: 8 }}
        />
        {tabList !== null && tabList.length > 0 && (
          <Tabs.Container
            ref={tabRef}
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                inactiveColor={appcolor.greylight}
                activeColor={appcolor.primary}
                scrollEnabled
                labelStyle={{ fontSize: 14, fontWeight: '700' }}
                indicatorStyle={{ backgroundColor: appcolor.primary }}
                tabStyle={{ minWidth: minWidthTab(tabList), height: 38 }}
                style={{
                  backgroundColor: appcolor.light,
                  borderWidth: 0,
                  paddingStart: 8,
                  paddingEnd: 8,
                }}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.light }}
            headerContainerStyle={{
              backgroundColor: appcolor.transparent,
              shadowColor: appcolor.transparent,
            }}
          >
            {contentEmployee()}
          </Tabs.Container>
        )}
      </View>
      <ActionSheet
        id="confirmresign"
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
        gestureEnabled
        drawUnderStatusBar={Platform.OS == 'ios'}
      >
        <SafeAreaView style={{ width: '100%', height: deviceHeight }}>
          <ConfirmsResigns isShowHeader={false} />
        </SafeAreaView>
      </ActionSheet>
      <ActionSheet
        id="updateinfo"
        gestureEnabled
        indicatorStyle={{ zIndex: 10 }}
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <SafeAreaView style={{ width: '100%', height: deviceHeight }}>
          <EmployeeEdit
            itemEdit={itemEdit}
            onClose={() => {
              SheetManager.hideAll();
            }}
          />
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};
