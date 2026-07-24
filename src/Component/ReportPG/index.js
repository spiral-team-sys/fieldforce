import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  RefreshControl,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { REPORT } from '../../API/ReportAPI';
import {
  MessageAction,
  MessageAction2,
  ToastError,
  ToastSuccess,
  groupDataByKey,
  removeVietnameseTones,
} from '../../Core/Helper';
import { HeaderCustom } from '../../Content/HeaderCustom';
import _ from 'lodash';
import { LoadingView } from '../../Control/ItemLoading';
import { deviceHeight, deviceWidth } from '../Home';
import FormGroup from '../../Content/FormGroup';
import { FlatList } from 'react-native';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
import {
  alertConfirm,
  alertWarning,
  checkNetwork,
  minWidthTab,
} from '../../Core/Utility';
import { NumPad_V2 } from '../../Control/NumPad_V2';
import { scaleSize } from '../../Themes/AppsStyle';
import { SpeedDial } from '@rneui/themed';
import { DEFAULT_LIGHT_COLOR } from '../../Core/URLs';
import { PhotoItems } from '../EPSON/PhotoItems';
import { Platform } from 'react-native';
import {
  getAllPhotosUpload,
  getPhotosReport,
} from '../../Controller/WorkController';
import { taskList } from '../../Core/Table';
import { QueryStringSql } from '../../Core/SqliteDbContext';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const PGReportHome = ({ navigation, route }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [isLocked, setLock] = useState(false);
  const [data, setData] = useState({
    dataMain: [],
    dataMainF: [],
    dataTab: [],
  });
  const [configReport, setConfigReport] = useState({});
  const [formSetting, setFormSetting] = useState({
    isLocked: false,
    configReport: {},
    typeAction: 'NEW',
  });
  const [isEditable, setEditable] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState({
    currentIndex: 0,
    currentItem: {},
    currentTabName: '',
  });
  const [isTakePicture, setTakePicture] = useState(false);

  const loadData = async () => {
    await setLoading(true);
    const params = { shopId: shopinfo.shopId, reportId: kpiinfo.id };
    await REPORT.GetDataReportByShop_RealTime(params, async mData => {
      const dataResult = mData[0];
      const jsonData = JSON.parse(dataResult.jsonData || '[]');
      const isUploaded = dataResult.isUploaded;
      const formConfig = JSON.parse(dataResult.config || '{}');
      const typeAction = dataResult.typeAction;
      const { arr } = await groupDataByKey({
        arr: jsonData,
        key: formConfig?.group1 || 'g1',
      });
      const dataTab = _.uniqBy(arr, formConfig?.group1 || 'g1');
      await setFormSetting({
        isLocked: isUploaded == 1,
        configReport: formConfig,
        typeAction: typeAction,
      });
      await setData({ dataMain: arr, dataMainF: arr, dataTab: dataTab });
    });
    await setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);
  const changeTextItem = (item, text) => {
    let input = 0;
    if (text == '' && text != 0) {
      input = null;
    } else {
      let value =
        text !== null &&
        (text?.length > 0 || (typeof text == 'number' && text >= 0))
          ? text.toString().replace(/,/g, '')
          : null;
      input = value === '' || value === null ? null : parseInt(value);
    }
    let indexF = data.dataMainF.findIndex(it => it.id === item.id);
    item.inputValue = input;
    data.dataMainF[indexF].inputValue = input;

    !isEditable && setEditable(true);
    setMutate(e => !e);
  };

  const handleReloadData = async () => {
    if (isEditable) {
      MessageAction(
        'Bạn chưa gửi dữ liệu lên, Bạn có muốn tiếp tục tải lại báo cáo không ? (Sau khi tải lại dữ liệu bạn đã chỉnh sửa sẽ mất đi)',
        async () => {
          await setOpen(false);
          await setEditable(false);
          await loadData();
        },
      );
    } else {
      await setOpen(false);
      await loadData();
    }
  };
  const handleSelectImage = () => {
    navigation.navigate('photogroup', {
      Status: formSetting.isLocked ? 1 : 0,
      hideIcon: true,
      lockByStatus: true,
      dataImageList: formSetting.configReport?.ImageByList || [],
    });
    setOpen(false);
  };

  const onBack = () => {
    if (isEditable) {
      MessageAction2(
        'Chưa gửi dữ liệu đã chỉnh sửa lên hệ thống, bạn có muốn gửi dữ liệu lên trước khi thoát báo cáo?',
        async () => {
          uploadData('BACK');
        },
        () => {
          navigation.goBack();
        },
      );
    } else {
      navigation.goBack();
    }
  };

  const uploadData = async type => {
    const _valid = await validData();
    if (_valid) {
      alertConfirm(
        'Gửi dự liệu lên hệ thống',
        `Bạn có muốn gửi dữ liệu đã nhập như bên dưới không ?`,
        async () => {
          const dataUpload = data.dataMainF.map(it => ({
            ...it,
            typeAction: formSetting.typeAction,
          }));
          const result = await REPORT.UploadDataRaw_Realtime(
            [...dataUpload],
            shopinfo,
            kpiinfo.id,
          );
          if (result.statusId == 200) {
            await loadData();
            await setEditable(false);
            await ToastSuccess(result.messager, 'Thông báo', 'top');
            type == 'BACK' && (await navigation.goBack());
          } else {
            ToastError(result.messager, 'Thông báo', 'top');
          }
        },
      );
    }
  };
  const validData = async () => {
    const listUpload = _.filter(
      data.dataMainF,
      e => e.inputValue || e.inputValue == 0,
    );

    if (listUpload.length == 0) {
      alertWarning(`Bạn chưa nhập dữ liệu báo cáo!`);
      return false;
    }

    const { isConstraint, image, ImageByList, isUseTakePhoto } =
      formSetting.configReport;
    // Check Photo
    if (
      isConstraint !== undefined &&
      isConstraint === 1 &&
      isUseTakePhoto == 1
    ) {
      if (image && image > 0) {
        const resPhotos = await getAllPhotosUpload(
          kpiinfo.kpiId,
          shopinfo.shopId,
          shopinfo.auditDate,
        );
        if (resPhotos.length < image) {
          ToastError(
            `Vui lòng chụp ${image} tấm hình cho báo cáo.(${resPhotos.length}/${image})`,
          );
          return false;
        }
      } else {
        const LstMenuPhotos = ImageByList || [];
        for (let index = 0; index < LstMenuPhotos.length; index++) {
          const it = LstMenuPhotos[index];
          let lstPhoto = await getPhotosReport(
            kpiinfo.kpiId,
            it.code,
            shopinfo.shopId,
            shopinfo.auditDate,
          );
          if (lstPhoto.length < it.numberIMG) {
            ToastError(
              `Vui lòng chụp ${it.numberIMG} tấm hình cho ${it.nameVN}.(${lstPhoto.length}/${it.numberIMG})`,
            );
            return false;
          }
        }
      }
    }

    // Network
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      alertWarning(
        `Vui lòng kiểm tra lại kết nối mạng, Sau đó gửi lại dữ liệu`,
      );
      return false;
    }
    return true;
  };
  const onTabChange = async itemTab => {
    try {
      const _itemDataTab = data.dataTab[itemTab.index];
      const _itemNameTab =
        data.dataTab[itemTab.index][formSetting.configReport?.group1 || 'g1'];
      //
      setCurrentTab({
        ...currentTab,
        currentTabIndex: itemTab.index,
        currentTabItem: _itemDataTab,
        currentTabName: _itemNameTab,
      });
    } catch (e) {
      console.log('onTabChange: ', e);
    }
  };
  const contains = (item, query) => {
    const { g1, g2, itemName } = item;
    let Sg1 = g1?.toLowerCase() || g1;
    let Sg2 = g2?.toLowerCase() || g2;
    let SitemName = itemName?.toLowerCase() || itemName;
    return (
      removeVietnameseTones(Sg1)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(Sg2)?.match(removeVietnameseTones(query)) ||
      removeVietnameseTones(SitemName)?.match(removeVietnameseTones(query))
    );
  };
  const handleSearch = text => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const formattedQuery = text.toLowerCase();

    const filteredData = _.filter(data.dataMainF, dataF => {
      return contains(dataF, formattedQuery);
    });
    const { arr } = groupDataByKey({
      arr: filteredData,
      key: formSetting?.configReport?.group1 || 'g1',
    });
    setData({ ...data, dataMain: arr });
  };
  const renderItem = ({ item, index }) => {
    return (
      <View style={{ width: '100%' }}>
        {item.isParent &&
          formSetting?.configReport?.isViewTab !== 1 &&
          item[formSetting.configReport?.group1 || 'g1'] && (
            <View
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: appcolor.primary,
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  color: appcolor.white,
                  fontWeight: '800',
                  fontSize: 16,
                }}
              >
                {item[formSetting.configReport?.group1 || 'g1']}
              </Text>
            </View>
          )}
        <View
          style={{
            padding: 8,
            backgroundColor: appcolor.surface,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: appcolor.dark, fontWeight: '800', fontSize: 16 }}
          >
            {item[formSetting.configReport?.name1 || 'itemName']}
          </Text>
          <View style={{ width: '35%' }}>
            <NumPad_V2
              inputStyle={{
                fontSize: scaleSize(12),
                color: appcolor.dark,
                fontWeight: '500',
                backgroundColor: appcolor.light,
                width: '100%',
                textAlign: 'center',
                borderRadius: 5,
                padding: 8,
              }}
              showIcon={item.upload === 1 ? false : true}
              index={index}
              iconSize={14}
              value={item.inputValue}
              placeholderText={'SL'}
              // upload={item.upload === 1}
              item={item}
              // editable={formSetting.isLocked}
              handerNumberChange={(it, e) => changeTextItem(it, e)}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => onBack()}
        iconRight="cloud-upload-alt"
        rightFunc={uploadData}
      />

      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={{
          position: 'absolute',
          top: deviceHeight / 2.5,
          width: '100%',
        }}
      />
      {!isLoading && !isTakePicture && (
        <View style={{ flex: 1 }}>
          <FormGroup
            containerStyle={{
              margin: 7,
              backgroundColor: appcolor.homebackground,
            }}
            appcolor={appcolor}
            placeholder={'Tìm kiếm'}
            editable
            handleChangeForm={handleSearch}
            iconName="search"
          />
          {formSetting?.configReport?.isViewTab !== 1 && (
            <View style={{ flex: 1 }}>
              <FlatList
                key={`ItemReport`}
                keyExtractor={(_item, index) => index.toString()}
                data={data.dataMain}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                estimatedItemSize={100}
                ListFooterComponent={
                  <View style={{ paddingBottom: deviceHeight / 2 }} />
                }
              />
            </View>
          )}
          {formSetting?.configReport?.isViewTab == 1 &&
            data.dataTab !== null &&
            data?.dataTab?.length > 0 && (
              <Tabs.Container
                pagerProps={{ scrollEnabled: false }}
                renderTabBar={props => (
                  <MaterialTabBar
                    {...props}
                    scrollEnabled
                    labelStyle={{ fontSize: 14, fontWeight: '700' }}
                    indicatorStyle={{ backgroundColor: appcolor.primary }}
                    inactiveColor={appcolor.greylight}
                    activeColor={appcolor.primary}
                    tabStyle={{
                      backgroundColor: appcolor.light,
                      minWidth: minWidthTab(data?.dataTab),
                      height: 38,
                    }}
                  />
                )}
                onTabChange={onTabChange}
                headerContainerStyle={{
                  backgroundColor: appcolor.light,
                  shadowColor: appcolor.transparent,
                }}
              >
                {data.dataTab.map((item, index) => {
                  const _dataIssues = _.filter(
                    data.dataMain,
                    e =>
                      e[formSetting?.configReport?.group1 || 'g1'] ==
                      item[formSetting?.configReport?.group1 || 'g1'],
                  );
                  const titleHead = `${
                    item[formSetting.configReport?.group1 || 'g1']
                  }${_dataIssues.length > 0 ? ` (${_dataIssues.length})` : ''}`;
                  return (
                    <Tabs.Tab
                      key={`tabiis_${index}`}
                      label={titleHead}
                      name={titleHead}
                    >
                      <View
                        style={{ flex: 1, marginTop: 38, width: deviceWidth }}
                      >
                        <FlatList
                          key={`item_image_${index}`}
                          keyExtractor={(_item, index) => index.toString()}
                          data={_dataIssues}
                          renderItem={renderItem}
                          contentContainerStyle={{ paddingHorizontal: 8 }}
                          estimatedItemSize={100}
                          // getItemLayout={(_data, index) => (
                          //     { length: deviceWidth, offset: deviceWidth * index, index }
                          // )}
                          ListFooterComponent={
                            <View style={{ paddingBottom: deviceHeight / 2 }} />
                          }
                          // refreshControl={<RefreshControl refreshing={false} onRefresh={LoadData} />}
                        />
                      </View>
                    </Tabs.Tab>
                  );
                })}
              </Tabs.Container>
            )}
          {/* {
                        isTakePicture &&
                        <PhotoItems key={'PhotoPGReport'} usedHeader={false} navigation={navigation} route={{ params: { Photos: formSetting.configReport?.ImageByList || [], Status: formSetting } }} />
                    } */}
          {
            <SpeedDial
              style={{
                elevation: 3,
                shadowColor: appcolor.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
              }}
              isOpen={open}
              icon={{ name: 'menu', color: appcolor.primary }}
              openIcon={{ name: 'close', color: appcolor.primary }}
              onOpen={() => setOpen(!open)}
              onClose={() => setOpen(!open)}
              color={appcolor.surface}
            >
              <SpeedDial.Action
                icon={{ name: 'refresh', color: appcolor.primary }}
                color={appcolor.surface}
                title="Tải lại"
                onPress={() => handleReloadData()}
              />
              {formSetting?.configReport?.isUseTakePhoto == 1 && (
                <SpeedDial.Action
                  icon={{ name: 'camera', color: appcolor.primary }}
                  color={appcolor.surface}
                  title="Chụp hình"
                  onPress={() => handleSelectImage()}
                />
              )}
            </SpeedDial>
          }

          {/* {!isLoading && data.dataMain.length === 0 && (
                    <View style={{ justifyContent: 'center', alignItems: 'center', padding: 10, marginTop: 20, }}>
                        <Text style={{ color: AppColor.dark, fontSize: 18 }}>Không Có Dữ Liệu</Text>
                    </View>
                )} */}
        </View>
      )}
    </View>
  );
};
