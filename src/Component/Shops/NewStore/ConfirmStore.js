import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { LoadingView } from '../../../Control/ItemLoading';
import {
  ConfirmNewStore,
  GetListConfirmStore,
} from '../../../Controller/ShopController';
import { Text } from '@rneui/base';
import FormGroup from '../../../Content/FormGroup';
import { alertConfirm, checkNetwork } from '../../../Core/Utility';
import {
  GetEmployeeInfo,
  StringTobase64,
  ToastError,
  removeVietnameseTones,
} from '../../../Core/Helper';
import { deviceWidth } from '../../../Themes/AppsStyle';
import _ from 'lodash';
import WebViewUI from '../../../Content/WebViewUI';

export const ConfirmStore = ({ navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [dataConfirm, setDataConfirm] = useState([]);
  const [_mutate, setMutate] = useState(false);
  const [visibleBS, setVisibleBS] = useState(false);
  const [linkResult, setLinkResult] = useState(null);

  const LoadData = async () => {
    await setLoading(true);
    await GetListConfirmStore(async mData => {
      await setDataConfirm(mData);
    });
    await setLoading(false);
  };
  const LoadLinkResult = async item => {
    const userInfo = await GetEmployeeInfo();
    let shareData = {
      accountId: userInfo.accountId,
      employeeId: item.employeeId,
      employeeName: removeVietnameseTones(item.employeeName),
      shopId: item.shopId || 0,
      isHistory: 1,
    };
    shareData = StringTobase64(JSON.stringify(shareData));
    await setLinkResult(`${item.linkFormResult}&appShare=${shareData}`);
    await setVisibleBS(true);
  };
  const uploadConfirmData = async () => {
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
        'Kết nối mạng',
        'top',
      );
      return;
    }
    alertConfirm(
      'Gửi dữ liệu',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        let listEmployees = [];
        if (dataConfirm !== null && dataConfirm.length > 0) {
          dataConfirm.map((item, _index) => {
            if (item.isConfirm !== 0) listEmployees.push(item.createdBy);
          });
        }
        const lstCounter = _.unionBy(listEmployees, _.isEqual);
        await ConfirmNewStore(dataConfirm, lstCounter.join(','), async () => {
          await LoadData();
        });
      },
    );
  };
  // Handler
  const handlerConfirmOrReject = async (status, _item, index) => {
    const value = dataConfirm[index].isConfirm == status ? 0 : status;
    dataConfirm[index].isConfirm = value;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    LoadData();
    return () => false;
  }, []);

  const renderItem = ({ item, index }) => {
    const confirm = () => {
      handlerConfirmOrReject(1, item, index);
    };
    const reject = () => {
      handlerConfirmOrReject(-1, item, index);
    };
    const colorConfirm = item.isConfirm == 1 ? appcolor.success : null;
    const colorReject = item.isConfirm == -1 ? appcolor.red : null;
    const titleColorConfirm =
      item.isConfirm == 1 ? appcolor.light : appcolor.success;
    const titleColorReject =
      item.isConfirm == -1 ? appcolor.light : appcolor.red;
    const borderColorConfirm =
      item.isConfirm == 1 ? appcolor.success : appcolor.placeholderText;
    const borderColorReject =
      item.isConfirm == -1 ? appcolor.red : appcolor.placeholderText;
    return (
      <View key={`sto_@${index}`}>
        <View style={styles.itemContainer}>
          <TouchableOpacity onPress={() => LoadLinkResult(item)}>
            <View style={{ flex: 1, padding: 8 }}>
              <Text style={styles.titleName}>{`${index + 1}/${
                dataConfirm.length
              }. ${item.shopCode} - ${item.shopName}`}</Text>
              <Text style={styles.bodyName}>{`Đc: ${item.address}`}</Text>
              <Text
                style={styles.bodyName}
              >{`${item.dealerName} - ${item.supDealer}`}</Text>
              <Text
                style={styles.bodyName}
              >{`Liên hệ: ${item.phone} - ${item.email}`}</Text>
              <Text
                style={styles.bodyName}
              >{`Tần suất: F${item.monthlyFrequency} / Tháng`}</Text>
              <Text style={styles.bodyName}>{`${item.storeSize}`}</Text>
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: appcolor.greylight,
                  margin: 5,
                  alignSelf: 'center',
                }}
              />
              {item.addressUpdate !== null && (
                <Text
                  style={styles.bodyName}
                >{`Cập nhật Đc: ${item.addressUpdate}`}</Text>
              )}
              {(item.dealerNameUpdate !== null ||
                item.supDealerUpdate !== null) && (
                <Text
                  style={styles.bodyName}
                >{`${item.dealerNameUpdate} - ${item.supDealerUpdate}`}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 5,
            marginEnd: 8,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 3,
              borderWidth: 0.5,
              borderColor: borderColorConfirm,
              backgroundColor: colorConfirm,
              marginEnd: 8,
            }}
            onPress={confirm}
          >
            <Text
              style={{
                color: titleColorConfirm,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              Xác nhận
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 3,
              borderWidth: 0.5,
              borderColor: borderColorReject,
              backgroundColor: colorReject,
            }}
            onPress={reject}
          >
            <Text
              style={{
                color: titleColorReject,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              Từ chối
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentView: { flex: 1 },
    itemContainer: {
      margin: 8,
      borderRadius: 5,
      backgroundColor: appcolor.surface,
    },
    titleName: {
      color: appcolor.blacklight,
      fontSize: 15,
      fontWeight: '700',
      paddingBottom: 5,
    },
    bodyName: { color: appcolor.greylight, fontSize: 13, paddingBottom: 5 },
  });
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo.menuNameVN || 'Xác nhận cửa hàng mới'}
        leftFunc={() => {
          navigation.goBack();
        }}
        rightFunc={uploadConfirmData}
        iconRight="cloud-upload-alt"
      />
      <FormGroup
        editable
        iconName="search"
        placeholder="Tìm kiếm cửa hàng"
        inputStyle={{ fontSize: 14, color: appcolor.dark }}
        containerStyle={{
          margin: 8,
          backgroundColor: appcolor.placeholderBody,
        }}
      />
      <LoadingView
        isLoading={isLoading}
        styles={{ marginTop: 8 }}
        title={'Đang cập nhật dữ liệu'}
      />
      <View style={styles.contentView}>
        <FlatList
          key={'dataConfirmStore'}
          keyExtractor={(_item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          data={dataConfirm}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={LoadData} />
          }
          ListFooterComponent={
            <View style={{ paddingBottom: deviceWidth / 2 }} />
          }
        />
      </View>
      <Modal animationType="slide" visible={visibleBS}>
        <WebViewUI
          pageName={'Lịch sử khảo sát'}
          urlPage={linkResult}
          onClose={() => setVisibleBS(false)}
        />
      </Modal>
    </View>
  );
};
