import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Divider, Icon } from '@rneui/themed';
import PagerView from 'react-native-pager-view';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { deletePhotoByGuid } from '../../Controller/PhotoController';
import { checkLockReport } from '../../Controller/ShopController';
import UploadController from '../../Controller/UploadController';
import {
  groupDataByKey,
  Message,
  MessageAction,
  MessageInfo,
  ToastError,
  ToastSuccess,
} from '../../Core/Helper';
import { checkNetwork, deviceHeight, deviceWidth } from '../../Core/Utility';
import { ItemDecorForm } from './ItemDecorForm';
const { useState, useEffect } = require('react');
const {
  View,
  VirtualizedList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
} = require('react-native');
const { REPORT } = require('../../API/ReportAPI');
const tabs = [
  { key: 'listDC', name: 'Decor' },
  { key: 'listQK', name: 'Quầy kệ' },
];
import RNFS from 'react-native-fs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
const DecorForm = ({ navigation }) => {
  const [data, setData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const { appcolor, kpiinfo, workinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [_, setMutate] = useState(false);
  // const shopId = 998191
  const KeyStore = `${shopinfo?.shopId || 0}DECOR${shopinfo?.auditDate}`;
  const [isLoading, setLoading] = useState(false);

  const onLoad = async () => {
    if (shopinfo?.shopId == undefined) {
      MessageInfo('Chưa lấy được thông tin cửa hàng');
      navigation.goBack();
      return;
    }
    const lockReport = await checkLockReport(shopinfo);
    const localStore = await AsyncStorage.getItem(KeyStore);
    if (localStore === null) {
      const result = await REPORT.GetDecor(workinfo.shopId);
      if (result.statusId === 200) {
        const _qkList = result.data?.filter(a => a.type == 'QK');
        const _dcList = result.data?.filter(a => a.type == 'DC');
        const dcListSort = _dcList.sort((a, b) => {
          if (a.groupId === b.groupId) return a.cate - b.cate;
          return b.groupId - a.groupId;
        });
        const { arr } = groupDataByKey({
          arr: dcListSort,
          key: 'cate',
        });
        const dataAll = {
          listQK: _qkList.sort(
            (a, b) => a.cate - b.cate && a.groupId - b.groupId,
          ),
          listDC: arr,
        };
        await setData({ ...dataAll, lockReport: lockReport });
        await AsyncStorage.setItem(KeyStore, JSON.stringify(dataAll));
        ToastSuccess(result.messager);
      } else {
        setData({});
        ToastError(result.messager);
      }
    } else {
      var local = await JSON.parse(localStore);
      await setData({ ...local, isLockReport: lockReport });
    }
  };
  useEffect(() => {
    const _load = onLoad();
    return () => _load;
  }, []);

  const RowDecor = ({ item, index, lastitem }) => {
    const template = JSON.parse(item.template);
    return (
      <View style={{ marginLeft: 7, marginRight: 7 }}>
        {(index == 0 || item?.groupId !== lastitem?.groupId) && (
          <TouchableOpacity style={{ flexDirection: 'row' }}>
            <Text
              style={{
                flexGrow: 1,
                padding: 7,
                color: appcolor.dark,
                fontWeight: '400',
                fontSize: 12,
              }}
            >
              {item.groupName}
            </Text>
          </TouchableOpacity>
        )}
        <View
          style={{
            backgroundColor: appcolor.light,
            padding: 7,
            borderRadiusTopLef: 12,
            borderTopRightRadius: 12,
          }}
        >
          {item.isParent && (
            <View>
              <Text
                style={{
                  fontWeight: '300',
                  color: appcolor.primary,
                  fontSize: 12,
                  padding: 10,
                }}
              >
                {item.cate}
              </Text>
              <View
                style={{
                  marginBottom: 7,
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />
            </View>
          )}
          <ItemDecorForm
            key={'itemDecor_' + index}
            item={item}
            index={index}
            template={template}
            data={data}
            KeyStore={KeyStore}
          />
        </View>
      </View>
    );
  };
  const RowShelf = ({ item, index, lastitem }) => {
    const template = JSON.parse(item.template);
    return (
      <View style={{ marginRight: 7, marginLeft: 7 }}>
        {(index == 0 || item.cate !== lastitem?.cate) && (
          <TouchableOpacity style={{ flexDirection: 'row' }}>
            <Text
              style={{
                flexGrow: 1,
                fontWeight: '400',
                padding: 7,
                color: appcolor.dark,
              }}
            >
              {item.cate}
            </Text>
          </TouchableOpacity>
        )}
        <View
          style={{
            backgroundColor: appcolor.light,
            padding: 7,
            borderRadiusTopLef: 12,
            borderTopRightRadius: 12,
          }}
        >
          {(index === 0 ||
            item?.groupId !== lastitem?.groupId ||
            (item.cate === lastitem.cate &&
              item?.groupId !== lastitem?.groupId)) && (
              <View>
                <Text
                  style={{
                    fontWeight: '700',
                    color: appcolor.primary,
                    fontSize: 12,
                  }}
                >
                  {item.groupName}
                </Text>
                <View
                  style={{
                    marginBottom: 7,
                    borderWidth: 1,
                    borderColor: appcolor.surface,
                    width: '100%',
                  }}
                />
              </View>
            )}
          <ItemDecorForm
            key={'itemQK_' + index}
            item={item}
            index={index}
            template={template}
            data={data}
            KeyStore={KeyStore}
          />
        </View>
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: { flex: 1 },
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: appcolor.grey,
    },
    tabButton: { paddingHorizontal: 20, flexGrow: 0.5, paddingVertical: 7 },
    activeTabButton: { borderBottomWidth: 4, borderColor: appcolor.primary },
    tabText: { fontSize: 16, textAlign: 'center', color: appcolor.primary },
    pagerView: { flex: 1 },
    page: { flex: 1 },
  });

  const openSheet = async () => {
    SheetManager.show('bottomSheetDecor');
  };
  const clearData = dataByTab => {
    dataByTab.map(item => {
      const itemTemplate = JSON.parse(item.template);
      let arr = [];
      if (itemTemplate.length > 1) {
        itemTemplate.map((it, idx) => {
          if (idx == 0 || it.isUpload == 1) {
            arr.push(it);
          } else {
            deletePhotoByGuid(it.guiId);
          }
        });
        item.template = JSON.stringify(arr);
      }
    });
    return dataByTab;
  };

  const clearAllDataStock = () => {
    data.listDC = clearData(data.listDC);
    data.listQK = clearData(data.listQK);
    AsyncStorage.setItem(KeyStore, JSON.stringify(data));
  };
  const handleClearAll = async () => {
    MessageAction(
      'Bạn có muốn xoá tất cả dữ liệu đã nhập không ?',
      async () => {
        await setLoading(true);
        await clearAllDataStock();
        await setMutate(e => !e);
        await SheetManager.hide('bottomSheetDecor');
        await setLoading(false);
      },
    );
  };
  const handleReloadDataStock = () => {
    MessageAction(
      `Sau khi tải lại sẽ mất hết dữ liệu đã nhập, bạn có muốn tiếp tục?`,
      () => {
        clearData(data.listDC);
        clearData(data.listQK);
        //  deleteDataRaw(shopinfo.shopId, menuinfo.id, accountId)
        AsyncStorage.removeItem(KeyStore);
        onLoad();
        SheetManager.hide('bottomSheetDecor');
      },
    );
  };

  const onPageSelected = e => {
    setCurrentPage(e.nativeEvent.position);
  };
  const setPage = index => {
    pagerRef.setPage(index);
  };
  const onSummit = async () => {
    let countData = 0;
    const dataAll = { ...data };
    const jsonUpload = [];
    for (let idxQK = 0; idxQK < dataAll.listQK.length; idxQK++) {
      const it = dataAll.listQK[idxQK];
      const itemTemplateQK = JSON.parse(it.template);
      if (itemTemplateQK.length > 1) {
        countData = countData + 1;
        jsonUpload.push(it);
      }
    }
    for (let idxDC = 0; idxDC < dataAll.listDC.length; idxDC++) {
      const it = dataAll.listDC[idxDC];
      const itemTemplateDC = JSON.parse(it.template);
      if (itemTemplateDC.length > 1) {
        countData = countData + 1;
        jsonUpload.push(it);
      }
    }
    if (countData == 0) {
      ToastError(
        'Bạn chưa nhập bất kì kích thước quầy kệ hay decor nào!!',
        'Thông báo',
        'Top',
      );
      return;
    }
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
        'Thông báo',
        'Top',
      );
      return;
    }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      async () => {
        await UploadController.uploadServer(
          { ...workinfo, reportId: kpiinfo.id },
          jsonUpload,
          async result => {
            console.log(result, 'resultresult1');
            if (result.statusId === 200) {
              dataAll.listQK.map(itQK => {
                let itemTemplateQK = JSON.parse(itQK.template);
                if (itemTemplateQK.length > 1) {
                  itemTemplateQK.map((it, idx) => {
                    if (idx !== 0) {
                      it.isUpload = 1;
                    }
                  });
                  itQK.template = JSON.stringify(itemTemplateQK);
                }
              });
              dataAll.listDC.map(itDC => {
                let itemTemplateDC = JSON.parse(itDC.template);
                if (itemTemplateDC.length > 1) {
                  itemTemplateDC.map((it, idx) => {
                    if (idx !== 0) {
                      it.isUpload = 1;
                    }
                  });
                  itDC.template = JSON.stringify(itemTemplateDC);
                }
              });
              setData({ ...dataAll });
              AsyncStorage.setItem(KeyStore, JSON.stringify(dataAll));
              ToastSuccess(result.messager, 'Đã gửi', 'top');
            } else {
              ToastError(result.messager, 'Lỗi gửi', 'top');
            }
          },
          error => {
            ToastError(error.messager, 'Lỗi kết nối', 'top');
          },
        );
      },
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        title={kpiinfo?.menuName || 'Báo cáo decor'}
        leftFunc={() => navigation.goBack()}
        iconRight={!data.isLockReport ? 'cloud-upload-alt' : 'user-lock'}
        rightFunc={
          !data.isLockReport
            ? () => onSummit()
            : () => {
              ToastSuccess(
                'Bạn đã hoàn thành chấm công nên không thể gửi dữ liệu báo cáo',
              );
            }
        }
        iconMiddle="poll-h"
        middleFunc={() => (!data.isLockReport ? openSheet() : null)}
      />
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabButton,
                index === currentPage && styles.activeTabButton,
              ]}
              onPress={() => setPage(index)}
            >
              <Text style={styles.tabText}>
                {tab.name} ({data[tab.key]?.length || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={onPageSelected}
          ref={ref => (pagerRef = ref)}
        >
          {/* Thêm các trang của bạn vào đây */}
          <View style={styles.page}>
            <VirtualizedList
              key={'listDecor'}
              showsVerticalScrollIndicator={false}
              data={data?.listDC || []}
              keyExtractor={(_item, index) => _item.itemCode}
              getItem={(_data, index) => _data[index]}
              getItemCount={_data => _data?.length}
              renderItem={({ item, index }) => (
                <RowDecor
                  key={'itemDC_' + index}
                  lastitem={index !== 0 ? data?.listDC[index - 1] : item}
                  item={item}
                  index={index}
                />
              )}
            />
          </View>
          <View style={styles.page}>
            <VirtualizedList
              key={'listQK'}
              showsVerticalScrollIndicator={false}
              data={data?.listQK || []}
              keyExtractor={(_item, index) => _item.itemCode}
              getItem={(_data, index) => _data[index]}
              getItemCount={_data => _data?.length}
              renderItem={({ item, index }) => (
                <RowShelf
                  key={'itemQC_' + index}
                  lastitem={index !== 0 ? data?.listQK[index - 1] : item}
                  item={item}
                  index={index}
                />
              )}
            />
          </View>
        </PagerView>
      </View>
      <ViewSheet
        appcolor={appcolor}
        handleClearAll={handleClearAll}
        handleReloadDataStock={handleReloadDataStock}
        isLoading={isLoading}
      />
    </View>
  );
};
const ViewSheet = ({
  appcolor,
  handleClearAll,
  handleReloadDataStock,
  isLoading,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <ActionSheet
      id={'bottomSheetDecor'}
      gestureEnabled={true}
      indicatorColor={appcolor.bluesky}
      containerStyle={{ paddingBottom: insets.bottom }}
    >
      <ToolAction
        isLoading={isLoading}
        handleClearAll={handleClearAll}
        handleReloadDataStock={handleReloadDataStock}
      />
    </ActionSheet>
  );
};

const ToolAction = ({ handleClearAll, handleReloadDataStock, isLoading }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  //
  const onDeleteAll = () => {
    handleClearAll();
  };
  const onReloadDataStock = () => {
    handleReloadDataStock();
  };
  const RenderButton = ({
    title,
    iconName,
    iconColor,
    iconType = null,
    actionPress,
    isShowInput = false,
  }) => {
    const styleView = {
      paddingLeft: 10,
      backgroundColor: isShowInput ? appcolor.light : appcolor.surface,
      borderWidth: isShowInput ? 0.5 : 0,
      borderColor: appcolor.success,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      marginTop: 8,
      borderRadius: 5,
    };
    return (
      <TouchableOpacity onPress={() => (isLoading ? null : actionPress())}>
        <View style={styleView}>
          <SpiralIcon
            name={iconName}
            type={iconType == null ? 'font-awesome-5' : iconType}
            size={18}
            color={iconColor}
          />
          <Text
            style={{
              width: '100%',
              fontSize: 14,
              fontWeight: '400',
              color: appcolor.dark,
              padding: 8,
            }}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ width: '100%', paddingBottom: deviceHeight / 20 }}>
      <Text
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 18,
          fontWeight: '600',
          color: appcolor.dark,
        }}
      >
        Công cụ
      </Text>
      <RenderButton
        title="Xoá tất cả dữ liệu đã nhập"
        iconName="trash"
        iconType={'font-awesome-5'}
        iconColor={appcolor.danger}
        actionPress={onDeleteAll}
      />
      <RenderButton
        title={`Tải lại dữ liệu Decor`}
        iconName="sync-alt"
        iconColor={appcolor.info}
        actionPress={onReloadDataStock}
      />
    </View>
  );
};

export default DecorForm;
