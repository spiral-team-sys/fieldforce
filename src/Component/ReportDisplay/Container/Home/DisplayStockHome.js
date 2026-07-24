import React, { useRef } from 'react';
import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { REPORT } from '../../../../API/ReportAPI';
import {
  Message,
  MessageAction,
  ToastError,
  UUIDGenerator,
  debounce,
  formatNumber,
  groupDataByKey,
  removeVietnameseTones,
} from '../../../../Core/Helper';
import _ from 'lodash';
import { Text } from '@rneui/themed';
import {
  TODAY,
  deviceHeight,
  deviceWidth,
  minWidthTab,
} from '../../../../Core/Utility';
import FormGroup from '../../../../Content/FormGroup';
import { LoadingView } from '../../../../Control/ItemLoading/index';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import {
  itemUploaded,
  saveJsonData,
} from '../../../../Controller/ReportController';
import { HeaderItemView } from '../ItemMain/HeaderItemView';
import { SearchGroup } from '../../../../Control/SearchGroup/SearchGroup';
import { actualPhoto } from '../../../../Controller/DisplayController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { ToolsAction } from '../Control/ToolsAction';
import NativeCamera from '../../../../Control/NativeCamera';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const actionMode = {
  NOTE: 'NOTE',
  TAG_POP: 'TAG_POP',
  TAG_DISPLAY: 'TAG_DISPLAY',
  TOOLS: 'TOOLS',
};
export const DisplayStockHome = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(
    state => state.GAppState,
  );
  const [loading, setLoading] = useState(false);
  const [isUploaded, setUploaded] = useState(false);
  const [dataMain, setDataMain] = useState([]);
  const [data, setData] = useState([]);
  const [tabData, setTabData] = useState([]);
  const [competitorData, setCompetitorData] = useState([]);
  const [itemGroup, setItemGroup] = useState(null);
  const [mode, setMode] = useState(null);
  const [isShowInput, setShowInput] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const tabRef = useRef();
  //

  const LoadData = async group => {
    await setLoading(true);
    const dataFilter = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop(dataFilter, async (mData, message) => {
      const _itemgroup = group || mData[0]?.ItemGroup || '';
      const dataGroup = _.filter(mData, e => {
        return e.ItemGroup == _itemgroup;
      });
      if (message !== null) ToastError(message);
      const _tabData = _.unionBy(mData, 'GroupName');
      const _competitorData = _.unionBy(mData, 'CompetitorName');
      const { arr } = await groupDataByKey({
        arr: dataGroup,
        key: 'SubGroupName',
      });
      await setTabData(_tabData);
      await setCompetitorData(_competitorData);
      await setDataMain(mData);
      await setData(arr);
      await setItemGroup(_itemgroup);
    });
    const itemUpdate = await itemUploaded(shopinfo, kpiinfo.id);
    await setUploaded(itemUpdate.isUploaded == 1);
    await setLoading(false);
  };
  // Handler
  const handlerUpload = async () => {
    const checkData = await checkInput();
    if (checkData) {
      Message(
        'Chú ý',
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
        async () => {
          await REPORT.UploadDataRaw(shopinfo, kpiinfo.id);
          await LoadData();
        },
      );
    }
  };
  const checkInput = async () => {
    const configData = JSON.parse(kpiinfo?.reportItem) || {};
    const configPhoto = configData.ImageByList || [];
    const isConstraint = configData.isConstraint || 0;
    // Check Data
    for (let index = 0; index < competitorData.length; index++) {
      const item = competitorData[index];
      const dataValidate = _.filter(dataMain, e => {
        return (
          e.ItemGroup == item.ItemGroup &&
          ((e.Display !== null && e?.Display?.length > 0) ||
            (e.QuanityStock !== null && e?.QuanityStock?.length > 0))
        );
      });
      if (dataValidate == null || dataValidate.length == 0) {
        ToastError(
          `Hoàn thành báo cáo ${item.ItemGroup} trước khi gửi dữ liệu lên hệ thống`,
          'Dữ liệu báo cáo',
          'top',
        );
        return;
      }
    }
    // Check Photo
    if (isConstraint == 1) {
      for (let index = 0; index < dataMain.length; index++) {
        const item = dataMain[index];
        for (let j = 0; j < configPhoto.length; j++) {
          const jItem = configPhoto[j];
          const photoType = `${item.ItemGroup}_${item.CategoryId}`;
          const actual = await actualPhoto(workinfo, kpiinfo.id, photoType);
          if (actual < jItem.numberIMG) {
            ToastError(
              `Chưa chụp đầy đủ hình ${item.GroupName} của ${item.ItemGroup} (${actual}/${jItem.numberIMG} tấm)`,
              'Hình ảnh',
              'top',
            );
            return;
          }
        }
      }
    }
    return true;
  };
  const onSearchProduct = debounce(text => {
    const filterProducts = _.filter(dataMain, e => {
      return (
        e.ItemGroup == itemGroup &&
        (removeVietnameseTones(e.ProductName.toLowerCase()).match(
          removeVietnameseTones(text?.toLowerCase()),
        ) ||
          removeVietnameseTones(e.ProductCode.toLowerCase()).match(
            removeVietnameseTones(text?.toLowerCase()),
          ))
      );
    });
    const groupData = _.unionBy(filterProducts, 'GroupName');
    setTabData(groupData);
    setData(filterProducts);
  }, 300);
  const onChangeItem = debounce(item => {
    setLoading(true);
    setItemGroup(item.ItemGroup);
    const filter = _.filter(dataMain, e => {
      return (
        e.ItemGroup == item.ItemGroup &&
        (isShowInput
          ? (e.Display !== null && e.Display >= 0) ||
            (e.QuanityStock !== null && e.QuanityStock >= 0)
          : e.ItemGroup == item.ItemGroup)
      );
    });
    const groupData = _.unionBy(filter, 'GroupName');
    if (groupData.length > 0) {
      const { arr } = groupDataByKey({
        arr: filter,
        key: 'SubGroupName',
      });
      setTabData(groupData);
      setData(arr);
    }
    setLoading(false);
  }, 300);
  const handlerChangeValue = (item, value, type) => {
    if (type == 'DISPLAY') item.Display = value;
    if (type == 'STOCK') item.QuanityStock = value;
    setMutate(e => !e);
    saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataMain);
  };
  const handlerCameraAction = async item => {
    const photoinfo = {
      shopId: shopinfo.shopId,
      shopCode: shopinfo.shopCode,
      reportId: kpiinfo.id,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoType: `${itemGroup}_${item.CategoryId}`,
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: shopinfo.latitude,
      shopLong: shopinfo.longitude,
      guid: UUIDGenerator(),
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, callBackPhoto);
  };
  const callBackPhoto = result => {
    console.log(result);
  };
  const handlerViewPhoto = item => {
    let photoType = `${itemGroup}_${item.CategoryId}`;
    let itemPhoto = {
      reportId: kpiinfo.id,
      shopId: shopinfo.shopId,
      photoType: photoType,
      photoDate: workinfo.workDate,
    };
    navigation.navigate('AlbumPhoto', itemPhoto);
  };
  //
  const handlerClearAll = () => {
    MessageAction('Bạn có muốn xoá tất cả dữ liệu đã nhập không ?', () => {
      const dataUpdate = dataMain.map((item, _index) => ({
        ...item,
        Display: null,
        QuanityStock: null,
      }));
      saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataUpdate);
      setShowInput(false);
      SheetManager.hide('actionDisplay');
      LoadData(itemGroup);
    });
  };
  const handlerClearByCategory = itemCategory => {
    MessageAction(
      `Bạn có muốn xoá dữ liệu ngành hàng ${itemCategory.CategoryName} đã nhập không ?`,
      () => {
        const dataUpdate = dataMain.map((item, _index) =>
          item.CategoryName == itemCategory.CategoryName
            ? { ...item, Display: null, QuanityStock: null }
            : item,
        );
        saveJsonData(shopinfo.shopId, kpiinfo.id, TODAY, dataUpdate);
        setShowInput(false);
        SheetManager.hide('actionDisplay');
        LoadData(itemGroup);
      },
    );
  };
  const handlerShowItemInput = show => {
    setShowInput(show);
    if (show) {
      const dataInput = _.filter(dataMain, i => {
        return (
          i.ItemGroup == itemGroup &&
          ((i.Display !== null && i.Display >= 0) ||
            (i.QuanityStock !== null && i.QuanityStock >= 0))
        );
      });
      setData(dataInput);
    } else {
      const dataInput = _.filter(dataMain, i => {
        return i.ItemGroup == itemGroup;
      });
      setData(dataInput);
    }
  };
  // View Action Sheet
  const middleAction = async () => {
    await setMode(actionMode.TOOLS);
    SheetManager.show('actionDisplay');
  };
  //
  useState(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    contentView: { width: '100%', height: deviceHeight },
    itemMain: {
      width: deviceWidth,
      flexDirection: 'row',
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 0.5,
    },
    titleView: { fontSize: 14, fontWeight: '500', color: appcolor.dark },
    subTitleView: {
      fontSize: 12,
      fontWeight: '400',
      color: appcolor.greylight,
    },
    contentInput: {
      position: 'absolute',
      end: 0,
      top: 8,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputContainer: { minWidth: 80, margin: 0, padding: 0 },
    inputView: {
      color: appcolor.dark,
      fontSize: 12,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      borderRadius: 5,
      textAlign: 'center',
      marginEnd: 8,
    },
    titleHeader: {
      padding: 8,
      fontSize: 15,
      fontWeight: '700',
      color: appcolor.info,
      fontStyle: 'italic',
      marginTop: 8,
    },
    searchView: { margin: 8, padding: 5, borderRadius: 30 },
    inputStyle: { fontSize: 13, color: appcolor.dark },
    warningData: {
      width: '100%',
      textAlign: 'center',
      padding: 8,
      color: appcolor.red,
      fontSize: 13,
      fontWeight: '500',
    },
  });
  const renderItem = (item, index, dataSize) => {
    const onChangeDisplay = text => {
      handlerChangeValue(item, text, 'DISPLAY');
    };
    const onChangeStock = text => {
      handlerChangeValue(item, text, 'STOCK');
    };
    return (
      <View key={`aall_${index}`}>
        {item.isParent && (
          <Text style={styles.titleHeader}>{`${item.SubGroupName}`}</Text>
        )}
        <View style={styles.itemMain}>
          <View style={{ width: '60%', padding: 8 }}>
            <Text style={styles.titleView}>{`${index + 1}/${dataSize}. ${
              item.ProductName
            }`}</Text>
            <Text
              style={styles.subTitleView}
            >{`Mã SP: ${item.ProductCode}`}</Text>
          </View>
          <View style={styles.contentInput}>
            <FormGroup
              editable={!isUploaded}
              nonBorder
              noneRadius
              useClearAndroid={false}
              placeholder={item.DisplayUnit || 'SL'}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputView}
              clearButtonMode="never"
              value={formatNumber(item.Display, ',')}
              handleChangeForm={onChangeDisplay}
            />
            {item.isStock == 1 && (
              <FormGroup
                editable={!isUploaded}
                nonBorder
                noneRadius
                useClearAndroid={false}
                placeholder={item.InventoryUnit || 'Tồn kho'}
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputView}
                clearButtonMode="never"
                value={formatNumber(item.QuanityStock, ',')}
                handleChangeForm={onChangeStock}
              />
            )}
          </View>
        </View>
      </View>
    );
  };
  const renderContentProducts = () => {
    return (
      tabData !== null &&
      tabData.length > 0 &&
      tabData.map((item, index) => {
        const lstProducts = _.filter(data, e => {
          return e.GroupName == item.GroupName;
        });
        return (
          <Tabs.Tab
            key={`category_${index}`}
            label={item.GroupName}
            name={item.GroupName}
          >
            <FlatList
              key="productlist"
              keyExtractor={(_item, index) => index.toString()}
              data={lstProducts}
              renderItem={({ item, index }) =>
                renderItem(item, index, lstProducts.length)
              }
              showsVerticalScrollIndicator={false}
              style={{ paddingTop: 48 }}
              ListFooterComponent={
                <View style={{ paddingBottom: deviceHeight / 1.8 }} />
              }
              ListHeaderComponent={
                <HeaderItemView
                  isUploaded={isUploaded}
                  itemHeader={item}
                  index={index}
                  handlerCamera={handlerCameraAction}
                  handlerAlbums={handlerViewPhoto}
                />
              }
            />
          </Tabs.Tab>
        );
      })
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={kpiinfo?.menuNameVN}
        iconMiddle="poll-h"
        iconRight={!isUploaded ? 'cloud-upload-alt' : null}
        rightFunc={!isUploaded ? () => handlerUpload() : null}
        middleFunc={middleAction}
        leftFunc={() => navigation.goBack()}
      />
      {itemGroup !== null && (
        <SearchGroup
          data={competitorData}
          value={itemGroup}
          iconName="search"
          placeholder="Tìm kiếm sản phẩm"
          handlerSearch={onSearchProduct}
          handlerChange={onChangeItem}
        />
      )}
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      {/* Content View */}
      <View style={styles.contentView}>
        {tabData !== null && tabData.length > 0 && !loading ? (
          <Tabs.Container
            ref={tabRef}
            renderTabBar={props => (
              <MaterialTabBar
                {...props}
                inactiveColor={appcolor.blacklight}
                activeColor={appcolor.primary}
                scrollEnabled
                labelStyle={{ fontSize: 14, fontWeight: '700' }}
                indicatorStyle={{ backgroundColor: appcolor.primary }}
                tabStyle={{ minWidth: minWidthTab(tabData), height: 38 }}
                style={{
                  backgroundColor: appcolor.light,
                  borderWidth: 0,
                  marginStart: 8,
                  marginEnd: 8,
                }}
              />
            )}
            containerStyle={{ backgroundColor: appcolor.light }}
            headerContainerStyle={{
              backgroundColor: appcolor.light,
              shadowColor: appcolor.transparent,
              paddingBottom: 8,
            }}
          >
            {renderContentProducts()}
          </Tabs.Container>
        ) : (
          <Text style={styles.warningData}>Không có dữ liệu</Text>
        )}
      </View>
      {/* Action */}
      <ActionSheet
        id="actionDisplay"
        gestureEnabled
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ padding: 8, width: '100%' }}>
          {mode == actionMode.TOOLS && (
            <ToolsAction
              clearAllData={handlerClearAll}
              clearByCategory={handlerClearByCategory}
              itemInput={handlerShowItemInput}
              dataTab={tabData}
              tabRef={tabRef}
              showInputView={isShowInput}
              isLock={isUploaded}
            />
          )}
        </View>
      </ActionSheet>
    </View>
  );
};
