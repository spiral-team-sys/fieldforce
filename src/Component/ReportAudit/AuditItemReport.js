import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import RNFS from 'react-native-fs';
import FormGroup from '../../Content/FormGroup';
import { CheckBox } from '@rneui/themed';
import { AuditAPI } from '../../Controller/AuditController';
import {
  formatNumber,
  groupDataByKey,
  isNotInteger,
  Message,
  MessageAction,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { checkNetwork, deviceHeight } from '../../Core/Utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadController from '../../Controller/UploadController';
import { checkLockReport } from '../../Controller/ShopController';
import { LoadingView } from '../../Control/ItemLoading';
import moment from 'moment';

// -- 1 - TEXT
// -- 2 - NUMBER
// -- 3 - BOOLEAN

export const AuditItemReport = ({ navigation }) => {
  const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(
    state => state.GAppState,
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ dataTaskList: [] });
  const [_, setMutate] = useState(false);
  const [Status, setStatus] = useState(false);
  const KeyStore = `${shopinfo.shopId || 0}AUDITITEMREPORT${
    shopinfo.auditDate
  }`;
  const [isLockReport, setLockReport] = useState(false);

  const LoadData = async () => {
    await setLoading(true);
    const isCheck = await checkLockReport(shopinfo);
    await setLockReport(isCheck);
    const localStore = await AsyncStorage.getItem(KeyStore);
    if (localStore === null || JSON.parse(localStore || '[]')?.length == 0) {
      await AuditAPI.GetListAudit(shopinfo.shopId, async dataAudit => {
        const { arr } = await groupDataByKey({
          arr: dataAudit,
          key: 'groupId',
        });
        let day = parseInt(moment(new Date()).format('YYYYMMDD'));
        if (workinfo.workDate !== day) {
          await setStatus(1);
        }
        await setData({ dataTaskList: arr });
        await AsyncStorage.setItem(KeyStore, JSON.stringify(arr));
      });
    } else {
      var local = await JSON.parse(localStore);
      let day = parseInt(moment(new Date()).format('YYYYMMDD'));
      if (workinfo.workDate === day) {
        await setStatus(local[0].upload);
      } else {
        await setStatus(1);
      }
      await setData({ dataTaskList: local });
    }
    await setLoading(false);
  };

  useEffect(() => {
    LoadData();
    return () => loading;
  }, []);

  const uploadAction = async () => {
    if (Status) {
      ToastError('Bạn đã gửi báo cáo này!');
      return;
    }
    let itemsUpload = data.dataTaskList.filter(
      it => it.posmValue != null && it.posmValue != undefined,
    );
    if (itemsUpload.length === 0) {
      Message('Chú ý', 'Bạn chưa điền thông tin, có muốn tiếp tục?', () =>
        UploadData(data.dataTaskList),
      );
      return;
    }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => UploadData(data.dataTaskList),
    );
  };
  const UploadData = async itemsUpload => {
    const work = { ...workinfo, reportId: kpiinfo.kpiId };
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    await AuditAPI.UploadTaskList(
      itemsUpload,
      work,
      async () => {
        data.dataTaskList.map(it => {
          it.upload = 1;
        });
        await AsyncStorage.setItem(KeyStore, JSON.stringify(data.dataTaskList));
        await LoadData();
        await setMutate(e => !e);
      },
      async () => {},
    );
  };
  const onSelectCheck = async (item, it, idx) => {
    it.isCheck = it.isCheck ? false : true;
    const arrValue = JSON.parse(item.listItem || '[]');
    await arrValue.map(itm => {
      itm.ItemId === it.ItemId
        ? (itm.isCheck = itm.isCheck ? false : true)
        : (itm.isCheck = false);
    });
    item.listItem = JSON.stringify(arrValue);
    item.posmValue = it.isCheck ? it.ItemName : null;
    await setMutate(e => !e);
    await AsyncStorage.setItem(KeyStore, JSON.stringify(data.dataTaskList));
  };
  const onNumberChanged = async (item, text) => {
    let value =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;
    let intValue = value == null ? null : parseInt(value);
    item.posmValue = intValue;
    await setMutate(e => !e);
    await AsyncStorage.setItem(KeyStore, JSON.stringify(data.dataTaskList));
  };
  const onChangeText = async (item, text) => {
    let value = text == '' ? null : text;
    item.posmValue = value;
    await setMutate(e => !e);
    await AsyncStorage.setItem(KeyStore, JSON.stringify(data.dataTaskList));
  };
  const renderItemTaskList = ({ item, index }) => {
    switch (item.kpI1) {
      case 1:
        return (
          <View style={{ minHeight: 10, minWidth: 10 }}>
            <FormGroup
              containerStyle={{
                backgroundColor:
                  item.upload === 1 ? appcolor.surface : appcolor.light,
                alignSelf: 'center',
                marginBottom: 5,
              }}
              inputStyle={{ fontSize: 13, color: appcolor.dark }}
              placeholder={
                item.unit !== null ? item.unit : 'Nhập ' + item.productNameVN
              }
              editable={item.upload === 1 ? false : true}
              title={item.productNameVN}
              iconName="comment-alt"
              value={item.posmValue}
              handleChangeForm={text => onChangeText(item, text)}
            />
          </View>
        );
      case 2:
        return (
          <View style={{ minHeight: 10, minWidth: 10 }}>
            <FormGroup
              editable={item.upload === 1 ? false : true}
              key={index}
              placeholder={item.unit !== null ? item.unit : 'Số lượng'}
              containerStyle={{
                backgroundColor:
                  item.upload === 1 ? appcolor.surface : appcolor.light,
                marginBottom: 5,
              }}
              value={formatNumber(item.posmValue, ',')}
              title={item.productNameVN}
              inputStyle={{ textAlign: 'right' }}
              keyboardType="numeric"
              handleChangeForm={text => onNumberChanged(item, text)}
              onClearTextAndroid={() => onNumberChanged(item, null)}
            />
          </View>
        );
      case 3:
        return (
          <View style={{ minHeight: 10, minWidth: 10 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: appcolor.surface,
                padding: 5,
                marginBottom: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: appcolor.dark,
                }}
              >
                {item.productNameVN}
              </Text>
              <View
                style={{
                  flex: 1,
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  justifyContent:
                    JSON.parse(item.listItem || '[]').length > 2
                      ? 'flex-start'
                      : 'flex-end',
                }}
              >
                {JSON.parse(item.listItem || '[]').map(it => {
                  return (
                    <CheckBox
                      containerStyle={{
                        padding: 5,
                        backgroundColor: appcolor.surface,
                        borderColor: appcolor.transparent,
                        width: '26%',
                      }}
                      textStyle={{
                        fontSize: 12,
                        fontWeight: '400',
                        color: appcolor.dark,
                      }}
                      key={it.ItemId}
                      size={20}
                      title={it.ItemNameVN}
                      checkedColor={appcolor.success}
                      checkedIcon="check-square-o"
                      uncheckedIcon="square-o"
                      onPress={
                        item.upload !== 1 ? () => onSelectCheck(item, it) : null
                      }
                      checked={it.isCheck}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN || 'Báo cáo khảo sát'}
        leftFunc={() => navigation.goBack()}
        iconRight={
          !isLockReport
            ? Status !== 1
              ? 'cloud-upload-alt'
              : null
            : 'user-lock'
        }
        rightFunc={() =>
          !isLockReport
            ? Status !== 1
              ? uploadAction()
              : null
            : ToastSuccess(
                'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
              )
        }
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      <View style={{ flex: 1, padding: 5 }}>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
          behavior={Platform.OS == 'ios' ? 'padding' : null}
          keyboardVerticalOffset={60}
        >
          <FlatList
            key={'ListItemAudit'}
            keyExtractor={(_, index) => index.toString()}
            data={data.dataTaskList}
            renderItem={renderItemTaskList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={{ height: deviceHeight / 2, width: '100%' }} />
            }
          />
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};
