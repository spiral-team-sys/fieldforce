import AnimatedLottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TextInput,
  Platform,
} from 'react-native';
import { Badge, Image } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { GetByListCode } from '../../Controller/MasterController';
import { getPOPByShop, installPOPByShop } from '../../Controller/POPController';
import {
  groupDataByKey,
  Message,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { checkNetwork, deviceHeight, deviceWidth } from '../../Core/Utility';
//import NumberFormat from "react-number-format";
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { checkLockReport } from '../../Controller/ShopController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DeployPOP = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [loading, setLoading] = useState(false);
  const [dataPOP, setDataPOP] = useState({
    dataView: [],
    dataFilter: [],
    listPOP: [],
    listReasonPOP: [],
  });
  const [dataGroup, setDataGroup] = useState([]);
  const [itemSelect, setItemSelect] = useState({ groupId: 0 });
  const [isDone, setIsDone] = useState(false);
  const [isLockReport, setLockReport] = useState(false);
  const [search, setSearch] = useState('');
  const [itemPOPSelect, setItemPOPSelect] = useState({});
  const ref_group = useRef();
  const lstReport = JSON.parse(kpiinfo?.reportItem);

  const loadData = async () => {
    await setLoading(true);
    const isCheck = await checkLockReport(shopinfo);
    await setLockReport(isCheck);
    const listReasonPOP = await GetByListCode(`'ReasonPOP'`);
    await getPOPByShop(workinfo.shopId, async mData => {
      const sortData = mData.sort((a, b) => {
        if (a.groupName > b.groupName) return 1;
        if (a.groupName < b.groupName) return -1;
        if (a.popName < b.popName) return -1;
        if (a.popName >= b.popName) return 1;
      });
      const { arr } = groupDataByKey({
        arr: sortData,
        key: 'groupName',
      });
      const listData = await groupPOP(arr);
      await setItemSelect({ groupId: listData[0].groupId });
      await setDataGroup(listData);
      await setDataPOP({
        dataView: listData[0].detailData,
        dataFilter: listData[0].detailData,
        listPOP: arr,
        listReasonPOP: listReasonPOP,
      });
    });
    await setLoading(false);
  };
  const groupPOP = async data => {
    let listGroup = [];
    data.map(it => {
      if (it.isParent) {
        const listItemGroup = data.filter(
          item => item.groupName === it.groupName,
        );
        listGroup = [
          ...listGroup,
          {
            groupId: it.groupId ? it.groupId : it.popId,
            groupName: it.groupName,
            detailData: listItemGroup,
          },
        ];
      }
    });
    return listGroup;
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const uploadAction = async () => {
    await Keyboard.dismiss();

    let listUpload = dataPOP.listPOP.filter(
      it =>
        (it.quantity && it.quantity !== 'null' && it.quantity !== null) ||
        it.reasonId,
    );

    const checkQuantity = listUpload.filter(
      it =>
        it.quantity &&
        it.quantity !== 'null' &&
        it.quantity !== null &&
        !it.reasonId,
    );
    if (checkQuantity.length > 0) {
      ToastError(
        'Bạn đã nhập số lượng nhưng chưa chọn lí do triển khai.  - Nhóm : ' +
          checkQuantity[0].groupName +
          '     - POP : ' +
          checkQuantity[0].popName,
        'Thông báo',
        'top',
      );
      return;
    }

    const checkReason = listUpload.filter(
      it =>
        (!it.quantity || it.quantity === 'null' || it.quantity === null) &&
        it.reasonId,
    );
    if (checkReason.length > 0) {
      ToastError(
        'Bạn đã chọn lí do triển khai nhưng chưa nhập số lượng.  - Nhóm : ' +
          checkReason[0].groupName +
          '     - POP : ' +
          checkReason[0].popName,
        'Thông báo',
        'top',
      );
      return;
    }

    if (listUpload.length === 0) {
      ToastError('Vui lòng làm báo cáo');
      return;
    }

    await listUpload.map(it => (it.shopId = workinfo.shopId));
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
          ToastError(
            'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
          );
          return;
        }
        await installPOPByShop(
          JSON.stringify(listUpload),
          async success => {
            if (success.statusId) {
              ToastSuccess(success.messager, 'Thông báo', 'top');
              await loadData();
            }
          },
          async error => {},
        );
      },
    );
    // Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => UploadData(resStock));
  };

  const filterDeployData = async () => {
    let deployFilter = !isDone;
    let lstData = dataPOP.dataFilter.filter(
      it => it.quantity !== null && it.quantity >= 0,
    );
    if (deployFilter) {
      await setDataPOP({ ...dataPOP, dataView: lstData });
    } else {
      await setDataPOP({ ...dataPOP, dataView: dataPOP.dataFilter });
      await setSearch('');
    }
    await setIsDone(e => !e);
  };
  const filterProduct = async str => {
    let mDataFilter = [];
    if (str !== null && str !== undefined && str.length > 0) {
      mDataFilter = dataPOP.dataFilter.filter(i =>
        i.popName.toLowerCase().match(str.toLowerCase()),
      );
    } else {
      mDataFilter = dataPOP.dataFilter;
    }
    setDataPOP({ ...dataPOP, dataView: mDataFilter });
    setSearch(str);
  };

  const handlerItemSelect = async (item, index) => {
    setItemSelect({ groupId: item.groupId });
    let dataGroupPOP = item.detailData;
    let dataViewSearch = dataGroupPOP.filter(i =>
      i.popName.toLowerCase().match(search.toLowerCase()),
    );
    let dataViewFilter = dataGroupPOP.filter(
      it => it.quantity !== null && it.quantity > 0,
    );
    await setDataPOP({
      ...dataPOP,
      dataView:
        isDone === true
          ? dataViewFilter
          : search.length > 0
          ? dataViewSearch
          : dataGroupPOP,
      dataFilter: dataGroupPOP,
    });
    ref_group.current.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };

  const RenderItemGroup = ({ item, index }) => {
    const onPress = () => {
      handlerItemSelect(item, index);
    };
    const widthItem = deviceWidth / 5;
    const backgroundColor =
      itemSelect.groupId === item.groupId ? appcolor.surface : appcolor.light;
    const colorTitle =
      itemSelect.groupId === item.groupId ? appcolor.danger : appcolor.dark;
    const fontWeightTitle =
      itemSelect.groupId === item.groupId ? '800' : 'normal';
    const totalRow =
      item.detailData?.filter(i =>
        isDone
          ? i.quantity !== null && i.quantity >= 0
          : i.popName.toLowerCase().match(search.toLowerCase()),
      ).length || 0;
    return (
      <TouchableOpacity
        key={`DD_${index}`}
        onPress={onPress}
        style={{
          minWidth: widthItem,
          padding: 8,
          backgroundColor: backgroundColor,
          alignItems: 'center',
          borderRadius: 20,
          margin: 5,
          borderWidth: 1,
          borderColor: appcolor.light,
        }}
      >
        <Text
          style={{
            color: colorTitle,
            fontSize: 14,
            fontWeight: fontWeightTitle,
          }}
        >{`${item.groupName} ${totalRow > 0 ? `(${totalRow})` : ''}`}</Text>
        {/* {
                    totalRow > 0 &&
                    < Badge
                        containerStyle={{ position: 'absolute', top: -5, end: -5 }}
                        textStyle={{ color: appcolor.white, fontSize: 12, fontWeight: '600' }}
                        badgeStyle={{ backgroundColor: appcolor.primary, borderRadius: 50 }}
                        value={`${totalRow}`}
                    />
                } */}
      </TouchableOpacity>
    );
  };

  const handleChaneQuantity = async (item, text) => {
    let display =
      text !== null && text.length > 0
        ? text.toString().replace(/,/g, '')
        : null;
    if (item.quantityMyHouse < display) {
      ToastError(
        'Số lượng triển khai phải nhỏ hơn hoặc bằng số lượng kho đang có!!',
      );
      return;
    }
    const indexListPOP = dataPOP.listPOP.findIndex(
      it => it.popId === item.popId,
    );
    const indexGroup = dataGroup.findIndex(
      it => it.groupId === itemSelect.groupId,
    );
    const indexDetail = dataGroup[indexGroup].detailData.findIndex(
      it => it.popId === item.popId,
    );
    const indexView = dataPOP.dataView.findIndex(it => it.popId === item.popId);

    dataGroup[indexGroup].detailData[indexDetail].quantity = display;
    dataPOP.listPOP[indexListPOP].quantity = display;
    dataPOP.dataView[indexView].quantity = display;
    // const dataView = dataGroup[indexGroup]?.detailData.filter(i => isDone ? (i.quantity !== null && i.quantity >= 0) : (i.popName.toLowerCase().match(search.toLowerCase()))) || []
    // const dataSort = display == null ? [...dataView, item].sort((a, b) => a.popName > b.popName) : dataView
    await setDataPOP({
      ...dataPOP,
      dataFilter: dataGroup[indexGroup].detailData,
    });
  };
  const RenderItem = ({ item, index }) => {
    const onShowReason = () => {
      setItemPOPSelect(item);
      SheetManager.show('ref_reasonPOP');
    };
    const changeValuePOP = text => {
      handleChaneQuantity(item, text);
    };
    return (
      <View
        key={`I_P_P_${index}`}
        style={{
          flex: 1,
          padding: 8,
          flexDirection: 'row',
          borderBottomWidth: 0.5,
          borderColor: appcolor.light,
        }}
      >
        <View
          style={{
            backgroundColor: appcolor.light,
            width: 100,
            height: 100,
            borderRadius: 15,
            padding: 8,
          }}
        >
          {item.image !== null && item.image.length > 0 ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <AnimatedLottieView
              autoPlay={false}
              source={require('../../Themes/lotties/no_image.json')}
            />
          )}
          <Badge
            containerStyle={{ position: 'absolute', top: -5, end: -10 }}
            textStyle={{
              color: appcolor.light,
              fontSize: 13,
              fontWeight: '600',
            }}
            badgeStyle={{
              minWidth: 30,
              height: 30,
              backgroundColor: appcolor.dark,
              borderRadius: 50,
            }}
            value={item.quantityMyHouse}
          />
        </View>
        <View
          style={{
            flex: 1,
            padding: 5,
            paddingLeft: 20,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.titleItem}>{`${index + 1}. ${
              item.popName
            }`}</Text>
            {/* {item.Quantity ? <Text style={styles.textItem}>Tồn kho tổng : {item.Quantity}</Text> : null} */}
            {item.quantityMyHouse == 0 || item.quantityMyHouse ? (
              <Text style={styles.textItem}>
                Tồn kho cá nhân : {item.quantityMyHouse}
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => onShowReason()}
              style={{
                flex: 1,
                height: 30,
                backgroundColor: appcolor.light,
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: appcolor.greydark,
                marginRight: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: '500',
                  color: appcolor.dark,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                {item.reasonName || '-- Chọn --'}
              </Text>
            </TouchableOpacity>
            <NumberFormat
              value={item.quantity === 0 ? 0 : item.quantity || ''}
              displayType="text"
              thousandSeparator={true}
              renderText={value => (
                <TextInput
                  textAlign={'center'}
                  value={value}
                  style={{
                    flex: 1,
                    height: 30,
                    fontSize: 12,
                    color: appcolor.dark,
                    backgroundColor: appcolor.light,
                    fontWeight: '500',
                    marginEnd: 3,
                    width: '20%',
                    textAlign: 'center',
                    borderWidth: 0.5,
                    borderRadius: 5,
                    borderColor: appcolor.greydark,
                  }}
                  keyboardType="number-pad"
                  placeholder="Số lượng"
                  placeholderTextColor={appcolor.greydark}
                  editable={true}
                  selectTextOnFocus={true}
                  onChangeText={changeValuePOP}
                  // onEndEditing={endInputDisplay}
                />
              )}
            />
          </View>
        </View>
      </View>
    );
  };
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.surface,
    },
    titleItem: {
      width: '100%',
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 5,
    },
    textItem: { color: appcolor.dark, fontSize: 12, fontWeight: '600' },
    numberItem: {
      width: '100%',
      color: appcolor.greylight,
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
    },
    inputStyle: {
      fontSize: 14,
      color: appcolor.dark,
      backgroundColor: appcolor.light,
      fontWeight: '500',
      alignSelf: 'center',
      width: '50%',
      textAlign: 'center',
      borderWidth: 0.5,
      borderRadius: 10,
      borderColor: appcolor.grayLight,
      height: 38,
    },
  });

  const handleSelectReason = async item => {
    const itemReasonId = item.id === itemPOPSelect.reasonId ? null : item.id;
    const itemReasonName =
      item.name === itemPOPSelect.reasonName ? null : item.name;

    const index = dataPOP.listPOP.findIndex(
      it => it.popId === itemPOPSelect.popId,
    );
    dataPOP.listPOP[index] = {
      ...itemPOPSelect,
      reasonId: itemReasonId,
      reasonName: itemReasonName,
    };
    itemPOPSelect.reasonId = itemReasonId;
    itemPOPSelect.reasonName = itemReasonName;
    const listData = await groupPOP(dataPOP.listPOP);
    const listDataIndex = listData.findIndex(
      it => it.groupId === itemSelect.groupId,
    );
    await setDataGroup(listData);
    const dataView =
      listData[listDataIndex]?.detailData.filter(it =>
        isDone
          ? it.quantity !== null && it.quantity >= 0
          : it.popName.toLowerCase().match(search.toLowerCase()),
      ) || [];
    await setDataPOP({
      ...dataPOP,
      dataView: dataView,
      dataFilter: listData[listDataIndex].detailData,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
        rightFunc={() => uploadAction()}
        iconRight={!isLockReport ? 'cloud-upload-alt' : 'user-lock'}
        iconMiddle="poll-h"
        middleFunc={() =>
          !isLockReport
            ? !loading
              ? filterDeployData()
              : null
            : ToastSuccess(
                'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
              )
        }
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <FormGroup
            editable
            containerStyle={{
              width: '95%',
              backgroundColor: appcolor.grayLight,
              padding: 5,
              margin: 8,
              alignSelf: 'center',
            }}
            inputStyle={{ fontSize: 14, color: appcolor.dark }}
            placeholder="Tìm kiếm sản phẩm"
            iconName="search"
            onClearTextAndroid={filterProduct}
            handleChangeForm={filterProduct}
          />
        </View>
        <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
        <View style={{ width: '100%' }}>
          <FlatList
            key={'headeritem'}
            ref={ref_group}
            keyExtractor={(_, index) => index.toString()}
            style={{ padding: 10 }}
            contentContainerStyle={{ paddingRight: 10 }}
            snapToAlignment="start"
            decelerationRate="fast"
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dataGroup}
            renderItem={RenderItemGroup}
          />
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: 'column', margin: 5 }}
          behavior={Platform.OS == 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10}
        >
          <FlatList
            style={{ padding: 8 }}
            key={'productlistpop'}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            data={dataPOP.dataView}
            renderItem={RenderItem}
            ListFooterComponent={
              <View style={{ height: deviceHeight / 3, marginBottom: 28 }} />
            }
          />
        </KeyboardAvoidingView>
        <ActionSheet
          id={'ref_reasonPOP'}
          defaultOverlayOpacity={0.3}
          containerStyle={{
            backgroundColor: appcolor.surface,
            paddingBottom: insets.bottom,
          }}
          closeOnPressBack={true}
          gestureEnabled={true}
          indicatorColor={appcolor.primary}
        >
          <View style={{ padding: 8, paddingBottom: 30 }}>
            <FlatList
              key={'listReason'}
              keyExtractor={(_, index) => index.toString()}
              data={dataPOP.listReasonPOP}
              numColumns={2}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectReason(item)}
                    style={{
                      padding: 5,
                      flex: 1,
                      borderRadius: 10,
                      backgroundColor:
                        itemPOPSelect?.reasonId === item.id
                          ? appcolor.primary
                          : appcolor.light,
                      borderBottomColor: appcolor.grey,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderBottomWidth: 1,
                      margin: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          itemPOPSelect?.reasonId === item.id
                            ? appcolor.white
                            : appcolor.dark,
                        padding: 5,
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </ActionSheet>
      </View>
    </View>
  );
};
