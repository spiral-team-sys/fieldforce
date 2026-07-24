import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { Icon, Avatar } from '@rneui/themed';
import { scaleSize } from '../../Themes/AppsStyle';
import { GetEmployeeManager } from '../../Controller/EmployeeController';
import {
  ColorRand,
  ToastError,
  removeVietnameseTones,
} from '../../Core/Helper';
////import { NumericFormat } from "react-number-format";;
import { URLDEFAULT } from '../../Core/URLs';
import { LoadingView } from '../../Control/ItemLoading/index';
import { deviceWidth } from '../../Core/Utility';
import { ConfirmsResigns } from '../LG/ConfirmsResigns';
import { deviceHeight } from '../Home';
import { ViewListSelect } from './EmployeeStore/ViewListSelect';
import CustomListView from '../../Control/Custom/CustomListView';
import { SearchData } from '../../Control/SearchData/SearchData';
import CustomTab from '../../Control/Custom/CustomTab';
import moment from 'moment';
import _ from 'lodash';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

export const EmployeeManager = ({ navigation, route }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const reportItem = JSON.parse(route.params?.menuitem?.reportItem || '{}');
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [isMaps, setIsMaps] = useState(false);
  const [dataTab, setDataTab] = useState([{ id: 1, name: 'DS nhân viên' }]);

  const onLoadEmployee = async () => {
    await setLoading(true);
    const result = await GetEmployeeManager();
    if (result.statusId === 200) {
      setEmployees(result.data || []);
      setList(result.data || []);
    }
    //
    const newDataTab = [{ id: 1, name: 'DS nhân viên' }];
    if (reportItem?.isShowStoreSelect === 1) {
      newDataTab.push({ id: 2, name: 'Cửa hàng đã chọn' });
    }
    if (reportItem?.isShowConfirm === 1) {
      newDataTab.push({ id: 3, name: 'Phê duyệt nghỉ việc' });
    }
    setDataTab(newDataTab);

    //
    await setLoading(false);
  };
  const callNumber = phone => {
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
      phoneNumber = `telprompt:${phone}`;
    } else {
      phoneNumber = `tel:${phone}`;
    }
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          ToastError('Phone number is not available');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(error => console.log(error));
  };
  const handleSelectEdit = async item => {
    navigation.navigate('editprofileemployee', {
      employee: item,
      onClose: handleCloseEdit,
      workinfo: {
        reportId: 22,
        workDate: parseInt(moment(new Date()).format('YYYYMMDD')),
        shopId: 0,
      },
    });
  };
  const handleCloseEdit = isLoading => {
    if (isLoading) {
      onLoadEmployee();
    }
  };
  const contains = (item, query) => {
    const { employeeCode, fullName, city, mobile } = item;
    const q = removeVietnameseTones(query);
    return (
      removeVietnameseTones(fullName?.toLowerCase())?.match(q) ||
      removeVietnameseTones(employeeCode?.toLowerCase())?.match(q) ||
      removeVietnameseTones(city?.toLowerCase())?.match(q) ||
      removeVietnameseTones(mobile?.toLowerCase())?.match(q)
    );
  };
  const handleSearch = text => {
    const formattedQuery = text.toLowerCase();
    setQuery(text);
    if (!formattedQuery) {
      setEmployees(list);
      return;
    }
    const filteredData = _.filter(list, employee =>
      contains(employee, formattedQuery),
    );
    setEmployees(filteredData);
  };
  const handleSelectStore = item => {
    const dataStore = JSON.parse(item.dataStore || '[]');
    if (dataStore.length > 0) {
      navigation.navigate('viewstore', {
        dataStore: dataStore,
        employeeId: item.employeeId,
        item: item,
      });
    } else {
      ToastError('Nhân viên này không có dữ liệu cửa hàng!');
    }
  };
  const goBack = () => {
    if (isMaps) {
      setIsMaps(false);
    } else {
      navigation.goBack();
    }
  };
  //
  useEffect(() => {
    onLoadEmployee();
  }, []);
  //
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: appcolor.light,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: appcolor.greylight,
      overflow: 'hidden',
    },
    touchableContainer: {
      flexDirection: 'row',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
    },
    leftContainer: {
      width: '35%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    employeeCode: {
      color: appcolor.white,
      fontSize: scaleSize(12),
      textAlign: 'center',
      padding: 8,
      marginBottom: 12,
      fontWeight: '600',
      backgroundColor: appcolor.greylight,
      borderRadius: 8,
    },
    positionText: {
      color: appcolor.white,
      fontSize: scaleSize(11),
      textAlign: 'center',
      padding: 6,
      marginTop: 12,
      fontWeight: '500',
      backgroundColor: appcolor.greylight,
      borderRadius: 6,
    },
    rightContainer: { flexGrow: 1, width: '65%', padding: 16 },
    fullName: {
      color: appcolor.dark,
      textAlign: 'left',
      padding: 4,
      fontSize: scaleSize(16),
      fontWeight: '700',
      marginBottom: 8,
    },
    infoText: {
      color: appcolor.dark,
      padding: 2,
      fontSize: scaleSize(11),
      marginBottom: 2,
      opacity: 0.8,
    },
    actionContainer: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      padding: 4,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 12,
    },
    actionButton: {
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      width: 36,
      height: 36,
      marginBottom: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainContainer: {
      backgroundColor: appcolor.light,
      height: '100%',
      width: '100%',
    },
    contentContainer: { flex: 1 },
    tabContainer: { backgroundColor: appcolor.surface },
    tabBarStyle: { backgroundColor: appcolor.light },
    tabLabelStyle: { fontSize: 14, fontWeight: '600' },
    tabIndicatorStyle: { backgroundColor: appcolor.primary, borderRadius: 2 },
    employeeListContainer: {},
    searchContainer: {
      margin: 12,
      backgroundColor: appcolor.light,
      borderRadius: 12,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 20,
    },
    flatListStyle: { alignContent: 'center', height: deviceHeight / 1.2 },
    storeSelectContainer: {
      backgroundColor: appcolor.light,
      marginTop: 20,
      width: deviceWidth,
    },
    confirmResignContainer: { backgroundColor: appcolor.light, flex: 1 },
    modalStyle: {
      backgroundColor: 'red',
      height: deviceHeight,
      width: deviceWidth,
    },
    statusIconContainer: {
      position: 'absolute',
      right: 12,
      top: 12,
      backgroundColor: appcolor.light,
      borderRadius: 12,
      padding: 4,
    },
    headerContainer: {
      backgroundColor: appcolor.light,
      borderRadius: 16,
      margin: 12,
      padding: 16,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarContainer: { borderWidth: 3, borderColor: appcolor.greylight },
    listContainer: { height: '100%', width: '100%' },
    loadingView: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
  });
  // Render View
  const renderItem = ({ item, index }) => {
    const onPressItem = () => {
      handleSelectEdit(item);
    };
    const onEditItem = () => {
      navigation.navigate('employeedetails', {
        employee: item,
        index: index + 1,
      });
    };
    const onSelectStore = () => {
      handleSelectStore(item);
    };
    const handlerCallEmployee = () => {
      callNumber(item?.mobile);
    };
    return (
      <View key={index + '_222kj'}>
        <View style={[styles.container, { borderColor: ColorRand(index) }]}>
          <TouchableOpacity
            onPress={onEditItem}
            style={styles.touchableContainer}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.leftContainer,
                { backgroundColor: ColorRand(index) },
              ]}
            >
              <Text style={styles.employeeCode}>{item.employeeCode}</Text>
              <Avatar
                size={80}
                rounded
                source={{ uri: URLDEFAULT + item.photo }}
                title={item.fisrtName?.substring(0, 1) || 'S'}
                containerStyle={[
                  styles.avatarContainer,
                  { backgroundColor: ColorRand(index + 1) },
                ]}
              />
              <Text style={styles.positionText}>{item.typeName}</Text>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.fullName}>{item.fullName}</Text>
              <View style={styles.statusIconContainer}>
                <SpiralIcon
                  name="check-circle"
                  size={16}
                  color={item.status === 1 ? appcolor.info : appcolor.danger}
                />
              </View>

              {item.listShopName !== null && (
                <Text
                  style={[
                    styles.infoText,
                    { fontWeight: '600', color: appcolor.primary },
                  ]}
                >
                  {item.listShopName}
                </Text>
              )}

              <NumericFormat
                displayType="text"
                format="(####) ### ###"
                value={item?.mobile}
                renderText={value => (
                  <Text style={styles.infoText}>{value}</Text>
                )}
              />

              <Text style={styles.infoText}>Mail: {item.email}</Text>
              <Text style={styles.infoText}>Giới tính: {item.gender}</Text>
              <Text style={styles.infoText}>
                Ngày vào làm: {item.workingDate}
              </Text>
              <Text style={styles.infoText}>
                {item.holiday || '0'} ngày phép
              </Text>
              <Text style={styles.infoText}>Tài khoản: {item.username}</Text>
              <Text style={[styles.infoText, { width: '80%' }]}>
                Trạng thái: {item.workingStatusName}
              </Text>
              <Text style={[styles.infoText, { width: '80%' }]}>
                Trạng thái: {item.userStatus}
              </Text>
              <Text style={[styles.infoText, { width: '80%' }]}>
                Hợp đồng: {item.typeOfContract}
              </Text>
              {item.city !== null && item.city !== undefined && (
                <Text style={[styles.infoText, { width: '80%' }]}>
                  Thành phố: {item.city}
                </Text>
              )}
            </View>

            <View style={styles.actionContainer}>
              {item.isUseStore == 1 && (
                <TouchableOpacity
                  onPress={onSelectStore}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <SpiralIcon
                    name="store"
                    type={'font-awesome-5'}
                    size={14}
                    color={appcolor.white}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onPressItem}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <SpiralIcon
                  name="create-outline"
                  type={'ionicon'}
                  size={18}
                  color={appcolor.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlerCallEmployee}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <SpiralIcon
                  name="phone-enabled"
                  type={'MaterialIcons'}
                  size={18}
                  color={appcolor.white}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderTab = item => {
    if (item.id === 1) {
      return (
        <View style={styles.employeeListContainer}>
          {!isMaps && (
            <SearchData
              placeholder={'Tìm kiếm nhân viên...'}
              onSearchData={handleSearch}
            />
          )}

          {!isMaps && !loading && (
            <View style={styles.listContainer}>
              <CustomListView
                onRefresh={onLoadEmployee}
                data={employees}
                renderItem={renderItem}
              />
            </View>
          )}
        </View>
      );
    }
    if (item.id === 2) {
      return (
        <View style={styles.storeSelectContainer}>
          <ViewListSelect navigation={navigation} employees={employees} />
        </View>
      );
    }
    if (item.id === 3) {
      return <ConfirmsResigns isShowHeader={false} />;
    }
    return null;
  };
  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <HeaderCustom
          title={kpiinfo.menuNameVN || 'Nhân viên của tôi'}
          leftFunc={() => goBack()}
          iconRight={'dots-three-vertical'}
        />
        {!isMaps && (
          <LoadingView
            isLoading={loading}
            styles={styles.loadingView}
            title="Đang cập nhật dữ liệu"
          />
        )}
        <CustomTab data={dataTab} keyTabName="name" renderItem={renderTab} />
      </View>
    </View>
  );
};
