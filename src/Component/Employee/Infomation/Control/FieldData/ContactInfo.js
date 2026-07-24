import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormGroup from '../../../../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import Contacts from 'react-native-contacts';
import { PERMISSIONS } from 'react-native-permissions';
import {
  ColorRand,
  ToastError,
  removeVietnameseTones,
  requestPerrmission,
} from '../../../../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@rneui/themed';
import { deviceHeight } from '../../../../../Core/Utility';
import { ButtonAction } from '../ButtonAction';
import _ from 'lodash';
import { fontWeightBold } from '../../../../../Themes/AppsStyle';
import { SET_EmployeeInfo } from '../../../../../Redux/action';
import { SearchData } from '../../../../../Control/SearchData/SearchData';
import CustomListView from '../../../../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ContactInfo = ({ itemMain, keyValue }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, employeeInfo } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState([]);
  const [dataContacts, setDataContacts] = useState([]);
  const dispatch = useDispatch();
  //
  const handlerChooseContacts = async contacts => {
    const _name =
      contacts.displayName ||
      contacts.familyName ||
      contacts.givenName ||
      'No Name';
    let _phone = [];
    for (let index = 0; index < contacts.phoneNumbers.length; index++) {
      const itemPhone = contacts.phoneNumbers[index];
      _phone.push(`${_name} - ${itemPhone.number.replace(/ /g, '')}`);
    }
    //
    const _contactPersonInfo = _phone.join(',');
    employeeInfo[keyValue] = _contactPersonInfo || '';
    await dispatch(SET_EmployeeInfo(employeeInfo));
    onCloseAction();
  };
  //
  const searchContacts = text => {
    const searchValue = removeVietnameseTones(text).toLowerCase();
    const searchList = _.filter(
      dataMain,
      e =>
        removeVietnameseTones(e.displayName).toLowerCase().match(searchValue) ||
        removeVietnameseTones(e.familyName).toLowerCase().match(searchValue) ||
        removeVietnameseTones(e.phoneNumbers).toLowerCase().match(searchValue),
    );
    setDataContacts(searchList);
  };
  const onChangeValue = async text => {
    employeeInfo[keyValue] = text || '';
    await dispatch(SET_EmployeeInfo(employeeInfo));
  };
  const handlerShowContacts = () => {
    try {
      if (Platform.OS == 'android') {
        requestPerrmission(
          {
            android: PERMISSIONS.ANDROID.READ_CONTACTS,
            ios: PERMISSIONS.IOS.CONTACTS,
          },
          async status => {
            console.log('status', status);
            if (status) onShowAction();
          },
        );
      } else {
        onShowAction();
      }
    } catch (e) {
      ToastError(e, 'Lỗi quyền đọc dữ liệu', 'top');
    }
  };
  const onShowAction = () => {
    try {
      Contacts.getAll()
        .then(async data => {
          await setDataContacts([]);
          const _sortData =
            Platform.OS == 'android'
              ? _.sortBy(data, 'displayName')
              : _.sortBy(data, 'familyName');
          await setDataContacts(_sortData);
          await setDataMain(_sortData);
        })
        .catch(err => {
          console.log('err', err);
        });
      SheetManager.show('contactinfo');
    } catch (e) {
      console.log(e, 'contacts error');
    }
  };
  const onCloseAction = () => {
    SheetManager.hide('contactinfo');
  };
  //
  useEffect(() => {
    return () => false;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', marginTop: 5 },
    inputContainer: {
      padding: 3,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    inputStyle: { fontSize: 14, fontWeight: '400', color: appcolor.dark },
    contentMain: { width: '100%', height: deviceHeight },
    itemMain: {
      width: '100%',
      padding: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchContainer: {
      margin: 8,
      marginTop: 12,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.greylight,
    },
    searchInput: { fontSize: 13, color: appcolor.dark, fontWeight: '500' },
    avatarView: { width: '20%', alignSelf: 'center', alignItems: 'center' },
    infoView: { width: '80%' },
    circleView: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 50,
      height: 50,
      borderRadius: 50,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.5,
      borderWidth: 0.5,
    },
    titleShortName: {
      fontSize: 21,
      fontWeight: '700',
      color: appcolor.primary,
    },
    actionBottom: {
      alignItems: 'center',
      position: 'absolute',
      bottom: deviceHeight / 12,
      justifyContent: 'center',
      alignSelf: 'center',
      zIndex: 1000,
    },
    titleName: {
      fontSize: 15,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    contentName: { fontSize: 13, fontWeight: '500', color: appcolor.greylight },
  });
  const renderItem = ({ item, index }) => {
    const onPress = () => {
      handlerChooseContacts(item);
    };
    const colorItem = ColorRand(index);
    const titleName =
      item.displayName || item.familyName || item.givenName || 'No Name';
    return (
      <View key={`cti_item_${index}`} style={styles.itemMain}>
        <View style={styles.avatarView}>
          <View style={{ ...styles.circleView, borderColor: colorItem }}>
            <Text style={{ ...styles.titleShortName, color: colorItem }}>
              {titleName.substring(0, 1)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoView} onPress={onPress}>
          <Text style={styles.titleName}>{titleName}</Text>
          {item.phoneNumbers !== null &&
            item.phoneNumbers.length > 0 &&
            item.phoneNumbers.map((it, idx) => {
              return (
                <Text key={`${it.number}_${idx}`} style={styles.contentName}>
                  {it.number}
                </Text>
              );
            })}
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <FormGroup
        editable
        multiline
        iconRight="address-book"
        defaultValue={employeeInfo[keyValue] || ''}
        useClearAndroid={false}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputStyle}
        handleChangeForm={onChangeValue}
        rightFunc={handlerShowContacts}
      />
      <ActionSheet
        id="contactinfo"
        drawUnderStatusBar
        statusBarTranslucent={false}
        safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        containerStyle={{
          flex: 1,
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <SafeAreaView style={styles.contentMain}>
          <SearchData
            placeholder="Tìm kiếm số điện thoại"
            onSearchData={searchContacts}
          />
          <CustomListView
            data={dataContacts}
            extraData={dataContacts}
            renderItem={renderItem}
          />
          <View style={styles.actionBottom}>
            <ButtonAction
              iconName="close"
              iconColor={appcolor.light}
              backgroundColor={appcolor.blacklight}
              onPress={onCloseAction}
            />
          </View>
        </SafeAreaView>
      </ActionSheet>
    </View>
  );
};
