import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { itemUploaded } from '../../../Controller/ReportController';
import {
  groupDataByKey,
  MessageAction,
  MessageInfo,
  ToastSuccess,
  UUIDGenerator,
} from '../../../Core/Helper';
import { checkNetwork, deviceHeight, deviceWidth } from '../../../Core/Utility';
import { Icon } from '@rneui/themed';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import moment from 'moment';
import NativeCamera from '../../../Control/NativeCamera';
import { getPhotosByGuiId } from '../../../Controller/WorkController';
import { deletePhoto } from '../../../Controller/PhotoController';
import {
  GetDataIssueReport,
  IssueReportUpload,
} from '../../../Controller/IssueController';
import { URLDEFAULT } from '../../../Core/URLs';
import ViewListComment from './ViewListComment';
import { LoadingView } from '../../../Control/ItemLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const IssueReportHome = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo, workinfo, userinfo, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const [data, setData] = useState({
    dataTab: [],
    dataMain: [],
    dataShow: [],
    listIssueType: [],
  });
  const [loading, setLoading] = useState(false);
  const [isUploaded, setUploaded] = useState(false);
  const [currentTab, setCurrentTab] = useState({});
  const dataFilter = { shopId: null, reportId: kpiinfo.id };
  const lstReport = JSON.parse(kpiinfo?.reportItem || '[]');
  const [visibleModal, setVisibleModal] = useState(false);
  const [guiIdItem, setGuiIdItem] = useState('');
  const [itemSelect, setItemSelect] = useState({
    itemIssue: {},
    indexSelect: 0,
    type: '',
  });
  const [showTab, setShowTab] = useState(true);
  const [dataImage, setDataImage] = useState({
    isShowPhoto: false,
    itemPhoto: [],
    indexPhoto: 0,
  });
  const [_, setMutate] = useState();

  const loadData = async () => {
    await setLoading(true);
    await GetDataIssueReport(dataFilter, async (mData, mesager) => {
      const listTab = JSON.parse(mData.dataTab || '[]');
      const listIssue = JSON.parse(mData.dataIssue || '[]');
      const dataIssueSort = listIssue.sort((a, b) => {
        if (a.shopId === b.shopId) return a.reportDate - b.reportDate;
        return b.shopId - a.shopId;
      });
      const { arr } = groupDataByKey({
        arr: dataIssueSort,
        key: 'shopId',
        keyLayer2: 'reportDate',
      });
      await setData({
        dataTab: listTab,
        dataMain: dataIssueSort,
        dataShow: dataIssueSort,
      });
      await setCurrentTab(listTab[0]);
    });
    await setLoading(false);
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const handleSelectQuestion = async (type, dataItem) => {
    if (type == 'CREATE') {
      const guiIdNew = UUIDGenerator();
      itemSelect.type = type;
      await setGuiIdItem(guiIdNew);
      await setVisibleModal(true);
    } else if (type == 'CLOSE') {
      const listPhotoByGuiid = await getPhotosByGuiId(
        guiIdItem,
        workinfo.shopId,
      );
      listPhotoByGuiid.forEach(it => {
        if (it.dataUpload != 1) {
          deletePhoto(it);
        }
      });
      await setVisibleModal(false);
    } else if (type == 'CLOSENEW') {
      const listDataNew = [dataItem, ...data.dataMain];
      data.dataMain = listDataNew;
      data.dataShow = listDataNew;
      await setVisibleModal(false);
    } else if (type == 'CLOSEEDIT') {
      const indexDataM = data.dataMain.findIndex(
        it => it.guiid === dataItem.guiid,
      );
      const indexDataS = data.dataShow.findIndex(
        it => it.guiid === dataItem.guiid,
      );
      data.dataMain[indexDataM] = dataItem;
      data.dataShow[indexDataS] = dataItem;
      await setVisibleModal(false);
    } else if (type == 'EDIT') {
      await SheetManager.hide('sheetItemSetting');
      itemSelect.type = type;
      const guiIdNew = dataItem.guiid;
      SheetManager.hide('sheetItemSetting');
      await setGuiIdItem(guiIdNew);
      await setVisibleModal(true);
    }
  };

  const ViewInputIssues = () => {
    return (
      <View style={{}}>
        <TouchableOpacity
          onPress={() => handleSelectQuestion('CREATE')}
          style={{ flexDirection: 'row', justifyContent: 'center', margin: 5 }}
        >
          <View style={{ width: '15%', alignItems: 'center' }}>
            <View
              style={{
                height: 40,
                width: 40,
                backgroundColor: appcolor.surface,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                name="cogs"
                type="font-awesome-5"
                size={25}
                color={appcolor.primary}
              />
            </View>
          </View>
          <View
            style={{
              width: '75%',
              justifyContent: 'center',
              paddingHorizontal: 10,
              color: appcolor.dark,
            }}
          >
            <Text>Vấn đề của bạn là gì?</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '10%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: appcolor.surface,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                width: 30,
                height: 30,
              }}
            >
              <SpiralIcon
                name="images"
                type="font-awesome-5"
                size={16}
                color={appcolor.primary}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <View
          style={{
            height: 5,
            width: deviceWidth,
            backgroundColor: appcolor.grayLight,
          }}
        />
      </View>
    );
  };

  const handleSelectTab = item => {
    setCurrentTab(item);
  };

  const renderItemTab = ({ item, index }) => {
    const countList = data.dataShow.filter(
      it => it.issueStatus == item.id,
    )?.length;
    return (
      <TouchableOpacity
        key={'itemTab_' + index}
        onPress={() => handleSelectTab(item)}
        style={{
          padding: 5,
          borderRadius: 5,
          borderWidth: 0.6,
          borderColor:
            currentTab.id == item.id ? appcolor.white : appcolor.dark,
          backgroundColor:
            currentTab.id == item.id ? appcolor.primary : appcolor.light,
          marginHorizontal: 3,
        }}
      >
        <Text
          style={{
            fontWeight: '400',
            fontSize: 13,
            color: currentTab.id == item.id ? appcolor.white : appcolor.dark,
          }}
        >
          {item.nameVN}
          {countList > 0 ? `(${countList})` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSelectArrow = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowTab(e => !e);
  };
  const updateStatus = () => {
    setMutate(e => !e);
  };

  const ViewListTab = ({ listByTab }) => {
    return (
      <View
        style={{
          padding: 5,
          justifyContent: showTab ? 'space-between' : 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            display: showTab ? 'flex' : 'none',
            width: deviceWidth - 40,
          }}
        >
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            key={'listTabIssue'}
            data={data.dataTab}
            renderItem={renderItemTab}
          />
        </View>
        <View style={{ display: showTab ? 'none' : 'flex' }}>
          <TouchableOpacity
            key={'itemCurrentTab' + currentTab.id}
            onPress={() => handleSelectTab(item)}
            style={{
              padding: 5,
              borderRadius: 5,
              borderWidth: 0.6,
              borderColor: appcolor.white,
              marginHorizontal: 3,
              backgroundColor: appcolor.primary,
            }}
          >
            <Text
              style={{ fontWeight: '400', fontSize: 13, color: appcolor.white }}
            >
              {currentTab.nameVN}
              {listByTab.length > 0 ? `(${listByTab.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 40 }}>
          <TouchableOpacity
            key={'itemCurrentTab' + currentTab.id}
            onPress={() => handleSelectArrow()}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: 6,
              paddingHorizontal: 8,
            }}
          >
            <SpiralIcon
              color={appcolor.primary}
              name={showTab ? 'caret-left' : 'caret-right'}
              type="font-awesome-5"
              size={14}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const handleSelectDecription = (item, index) => {
    itemSelect.itemIssue = item;
    itemSelect.indexSelect = index;

    // setItemSelect({ ...itemSelect, itemIssue: item, indexSelect: index })
    SheetManager.show('sheetItemComment');
  };
  const countComment = listComment => {
    let count = 0;
    for (let i = 0; i < listComment.length; i++) {
      const item = listComment[i];
      count = count + 1;
      if (JSON.parse(item.noteFeedBack || '[]').length > 0) {
        count = count + 1;
      }
    }
    return count;
  };

  const handleSelectSetting = (item, index) => {
    setItemSelect({ ...itemSelect, itemIssue: item, indexSelect: index });
    SheetManager.show('sheetItemSetting');
  };

  const renderItemIssue = ({ item, index }) => {
    let numComment = countComment(JSON.parse(item.issueComments || '[]'));
    return (
      <View>
        {item.isParent && (
          <View style={{ backgroundColor: appcolor.grayLight }}>
            <View
              style={{
                padding: 8,
                borderTopEndRadius: 10,
                borderTopStartRadius: 10,
                flexDirection: 'row',
                backgroundColor: appcolor.primary,
              }}
            >
              <SpiralIcon
                color={appcolor.white}
                name="store-alt"
                type="font-awesome-5"
                size={18}
              />
              <Text
                style={{
                  color: appcolor.white,
                  fontWeight: '700',
                  fontSize: 16,
                  paddingHorizontal: 10,
                }}
              >{`${item.shopNameVN}`}</Text>
            </View>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 6,
            alignItems: 'center',
          }}
        >
          <View style={{ paddingLeft: 5 }}>
            <Text
              style={{
                color: appcolor.primary,
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              {moment(item.reportDate?.toString() || new Date()).format(
                'YYYY-MM-DD',
              )}
            </Text>
          </View>
          {item.isEditItem == 1 && (
            <TouchableOpacity
              onPress={() => handleSelectSetting(item, index)}
              style={{
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SpiralIcon
                color={appcolor.primary}
                name="ellipsis-h"
                type="font-awesome-5"
                size={18}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ paddingHorizontal: 10 }}>
          <Text
            style={{
              fontWeight: '400',
              fontSize: 13,
              color: appcolor.dark,
              paddingHorizontal: 5,
            }}
          >
            {
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 14,
                  color: appcolor.dark,
                }}
              >
                Vấn dề :{' '}
              </Text>
            }
            {item.noteIssue}
          </Text>
          {item.noteSolution !== undefined &&
            item.noteSolution !== null &&
            item.noteSolution.length > 0 && (
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 13,
                  color: appcolor.dark,
                  paddingHorizontal: 5,
                }}
              >
                {
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 14,
                      color: appcolor.dark,
                      paddingHorizontal: 10,
                    }}
                  >
                    Giải pháp :{' '}
                  </Text>
                }
                {item.noteSolution}
              </Text>
            )}
        </View>

        <View style={{ marginTop: 5 }}>
          <ListPhotoByItem
            item={item}
            index={index}
            handleShowImage={handleShowImage}
          />
        </View>
        {numComment > 0 && (
          <TouchableOpacity
            onPress={() => handleSelectDecription(item, index)}
            style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
          >
            <Text
              style={{
                padding: 10,
                fontWeight: '400',
                fontSize: 12,
                color: appcolor.dark,
              }}
            >
              {numComment} Phản hồi
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            height: 1,
            width: deviceWidth - 40,
            marginHorizontal: 20,
            backgroundColor: appcolor.grayLight,
          }}
        />
        <View style={{ height: 30, width: deviceWidth, flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => handleSelectDecription(item, index)}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text
              style={{ fontWeight: '600', fontSize: 14, color: appcolor.dark }}
            >
              Thông tin theo dõi
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 5,
            width: deviceWidth,
            backgroundColor: appcolor.grayLight,
          }}
        />
      </View>
    );
  };

  const ViewItemIssue = () => {
    const listByTab = data.dataShow?.filter(
      it => it.issueStatus == currentTab.id,
    );
    return (
      <View style={{}}>
        <ViewListTab listByTab={listByTab} />
        <View
          style={{
            height: 5,
            width: deviceWidth,
            backgroundColor: appcolor.grayLight,
          }}
        />
        <FlatList
          data={listByTab}
          renderItem={renderItemIssue}
          ListFooterComponent={<View style={{ height: 300 }} />}
          refreshControl={<RefreshControl onRefresh={() => loadData()} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const handleCancelIssue = () => {
    const dataFilter = data.dataMain.filter(
      it => it.guiid !== itemSelect.itemIssue.guiid,
    );
    data.dataMain = dataFilter;
    data.dataShow = dataFilter;
  };

  const onCancelIssue = () => {
    const dataUpload = [
      {
        ...itemSelect.itemIssue,
        typeSend: 'CANCEL',
      },
    ];
    MessageAction('Bạn chắc chắn muốn huỷ bỏ vấn đề này?', async () => {
      let isNetwork = await checkNetwork();
      if (!isNetwork) {
        MessageInfo(
          'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
        );
        return;
      }
      await IssueReportUpload(dataUpload, workinfo, null, async result => {
        if (result.statusId === 200) {
          handleCancelIssue();
          ToastSuccess('Huỷ bỏ vấn đề thành công!', 'Thông báo', 'top');
          setItemSelect({ ...itemSelect, itemIssue: {}, indexSelect: 0 });
        } else {
          MessageInfo(result.messager, 'Lỗi', 'top');
        }
      });
    });
  };

  const handleShowImage = async (itemImage, listImage, indexImage) => {
    dataImage.itemPhoto = itemImage;
    dataImage.indexPhoto = indexImage;
    SheetManager.show('imageSheet');
  };

  const handleVisible = async () => {
    // dataImage.isShowPhoto ? (dataImage.isShowPhoto = false) : null
    // await setVisibleModalPhoto(e => !e)
    SheetManager.hide('imageSheet');
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
        iconRight="cloud-upload-alt"
        // rightFunc={isUploaded ? null : }
      />
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        {/* <ViewInputIssues /> */}
        {data.dataShow?.length > 0 && <ViewItemIssue />}
        {loading && (
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={loading}
            styles={{ marginTop: 8 }}
          />
        )}
      </View>

      <Modal visible={visibleModal} style={{ flex: 1 }} animationType={'slide'}>
        <ViewCreateIssue
          guiIdItem={guiIdItem}
          handleSelectQuestion={handleSelectQuestion}
          lstReport={lstReport}
          data={data}
          itemSelect={itemSelect}
          handleShowImage={handleShowImage}
        />
      </Modal>
      <ActionSheet
        onClose={updateStatus}
        id="sheetItemComment"
        statusBarTranslucent
        gestureEnabled
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        drawUnderStatusBar={Platform.OS == 'ios'}
        closable={true}
      >
        <ViewListComment itemSelect={itemSelect} data={data} />
        {/* </SafeAreaView> */}
      </ActionSheet>
      <ActionSheet
        id="sheetItemSetting"
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ height: 250, width: '100%', marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => handleSelectQuestion('EDIT', itemSelect.itemIssue)}
            style={{ flexDirection: 'row', padding: 5, alignItems: 'center' }}
          >
            <SpiralIcon
              color={appcolor.primary}
              name="edit"
              type="font-awesome-5"
              size={25}
              style={{ paddingHorizontal: 10 }}
            />
            <Text
              style={{ fontWeight: '400', fontSize: 18, color: appcolor.dark }}
            >
              Chỉnh sửa vấn đề
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onCancelIssue()}
            style={{ flexDirection: 'row', padding: 5, alignItems: 'center' }}
          >
            <SpiralIcon
              color={appcolor.danger}
              name="trash-alt"
              type="font-awesome-5"
              size={25}
              style={{ paddingHorizontal: 10 }}
            />
            <Text
              style={{
                fontWeight: '400',
                fontSize: 18,
                color: appcolor.dark,
                paddingHorizontal: 10,
              }}
            >
              Bỏ vấn đề
            </Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
      <ActionSheet
        id={'imageSheet'}
        containerStyle={{
          height: deviceHeight,
          width: deviceWidth,
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <ViewImageSheet dataImage={dataImage} handleVisible={handleVisible} />
      </ActionSheet>
    </View>
  );
};

const ViewImageSheet = ({ dataImage, handleVisible }) => {
  const [itemPhoto, setItemPhoto] = useState({});
  const appcolor = useSelector(state => state.GAppState.appcolor);

  useEffect(() => {
    loadData();
    return () => false;
  }, []);
  const loadData = () => {
    const itemImage = dataImage.itemPhoto;
    setItemPhoto(itemImage);
  };
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <TouchableOpacity
        onPress={() => handleVisible()}
        style={{
          position: 'absolute',
          right: 20,
          top: Platform.OS == 'ios' ? 40 : 20,
          zIndex: 100,
          borderRadius: 5,
          borderWidth: 1,
          padding: 3,
          paddingHorizontal: 10,
          borderColor: appcolor.primary,
        }}
      >
        <Text
          style={{ fontWeight: '400', fontSize: 18, color: appcolor.primary }}
        >
          Đóng
        </Text>
      </TouchableOpacity>
      {itemPhoto?.photoPath !== undefined && (
        <Image
          source={{
            uri: itemPhoto.photoPath.includes('uploaded')
              ? URLDEFAULT + itemPhoto.photoPath
              : itemPhoto.photoPath || '',
          }}
          resizeMode={'contain'}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </View>
  );
};

const ListPhotoByItem = ({ item, index, handleShowImage }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const listImage = JSON.parse(item.imageIssues || '[]');

  const renderItemImage = ({ item, index }) => {
    return index < 7 ? (
      <TouchableOpacity
        onPress={() => handleShowImage(item, listImage, index)}
        style={{
          width: deviceWidth / 3,
          height: deviceWidth / 3,
          alignItems: index == 1 || index == 4 ? 'center' : 'baseline',
          marginBottom: 2,
        }}
      >
        <Image
          source={{
            uri: item.photoPath.includes('uploaded')
              ? URLDEFAULT + item.photoPath
              : item.photoPath || '',
          }}
          style={{
            width: '99%',
            marginRight: index == 0 || index == 3 ? 6 : 0,
            marginLeft: index == 2 || index == 5 ? 2 : 0,
            height: '99%',
            backgroundColor: appcolor.surface,
          }}
        />
        {index == 5 && listImage.length - 5 > 1 && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <Text
              style={{ fontSize: 20, color: appcolor.white, fontWeight: '500' }}
            >
              {listImage.length - 5}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    ) : null;
  };

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <FlatList
          data={listImage}
          contentContainerStyle={{ justifyContent: 'space-between' }}
          renderItem={renderItemImage}
          numColumns={3}
        />
      </View>
    </View>
  );
};

const ViewCreateIssue = ({
  guiIdItem,
  handleSelectQuestion,
  lstReport,
  data,
  itemSelect,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [listPhoto, setListPhoto] = useState([]);
  const [dataIssue, setDataIssue] = useState({
    issueText: '',
    solutionText: '',
  });
  const listIssueType = data.listIssueType;
  const [issueType, setIssueType] = useState({});
  const [dataImage, setDataImage] = useState({ itemPhoto: [], indexPhoto: 0 });

  const loadData = () => {
    const imageList = JSON.parse(itemSelect.itemIssue.imageIssues || '[]');
    dataIssue.issueText = itemSelect.itemIssue?.noteIssue || '';
    dataIssue.solutionText = itemSelect.itemIssue?.noteSolution || '';
    setListPhoto(imageList);
  };
  useEffect(() => {
    if (itemSelect.type == 'EDIT') {
      loadData();
    }
    return () => false;
  }, []);

  const handleShowImage = async (itemImage, indexImage) => {
    dataImage.itemPhoto = itemImage;
    dataImage.indexPhoto = indexImage;
    SheetManager.show('imageSheetModal');
  };
  const handleVisibleImage = async () => {
    // dataImage.isShowPhoto ? (dataImage.isShowPhoto = false) : null
    // await setVisibleModalPhoto(e => !e)
    SheetManager.hide('imageSheetModal');
  };

  // useFocusEffect(
  //     useCallback(() => {

  //         return () => false;
  //     }, [])
  // );

  const takePhoto = async () => {
    const photoinfo = {
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      reportId: kpiinfo.kpiId,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoType: 'ISSUE_REPORT',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
      guid: guiIdItem,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, countNumPhoto);
  };

  const uploadFilePhoto = async () => {
    const photoinfo = {
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      reportId: kpiinfo.kpiId,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      fileUpload: 0,
      dataUpload: 0,
      photoPath: null,
      photoType: 'ISSUE_REPORT',
      guid: guiIdItem,
      photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, countNumPhoto);
  };

  const countNumPhoto = async () => {
    const dataPhoto = await getPhotosByGuiId(guiIdItem, workinfo.shopId);
    listPhoto.length !== dataPhoto.length ? await setListPhoto(dataPhoto) : [];
    if (itemSelect.type == 'EDIT') {
      let editPhoto = [...listPhoto];
      dataPhoto?.forEach(element => {
        let ImgName = element.photoPath.substring(
          element.photoPath.lastIndexOf('/') + 1,
          element.photoPath.length,
        );
        let fileName = '/uploaded/' + element.photoDate + '/' + ImgName;
        let itemPhoto = listPhoto.find(
          it => it.photoPath == fileName || it.photoPath == element.photoPath,
        );
        if (itemPhoto?.photoPath == undefined) {
          editPhoto.push({ ...element, photoPath: element.photoPath });
        }
      });
      setListPhoto(editPhoto);
    } else {
      setListPhoto(dataPhoto);
    }
  };

  const handleDeletePhoto = async itemPhoto => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    !itemPhoto.photoPath.includes('uploaded') && (await deletePhoto(itemPhoto));
    const listAfterDelete = await listPhoto.filter(
      it => it.photoPath !== itemPhoto.photoPath,
    );
    await setListPhoto(listAfterDelete);
  };

  const renderItemPhoto = ({ item, index }) => {
    const onSelectImage = () => {
      handleShowImage(item, index);
    };
    const onDeletePhoto = () => {
      handleDeletePhoto(item);
    };
    return (
      <TouchableOpacity
        key={index}
        onPress={() => onSelectImage()}
        style={{
          width: deviceWidth / 3,
          height: deviceWidth / 3,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={{
            uri: item.photoPath.includes('uploaded')
              ? URLDEFAULT + item.photoPath
              : item.photoPath || '',
          }}
          style={{
            width: '95%',
            height: '95%',
            borderRadius: 12,
            backgroundColor: appcolor.surface,
          }}
        />
        <TouchableOpacity
          style={{
            width: 25,
            height: 25,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 8,
            right: 8,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          onPress={() => onDeletePhoto()}
        >
          <SpiralIcon
            color={appcolor.white}
            name="trash-alt"
            type="font-awesome-5"
            size={14}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  const onChangeText = (text, type) => {
    setDataIssue({ ...dataIssue, [type]: text });
  };
  const handleCreateIssue = () => {
    if (
      lstReport.limitPhoto !== undefined &&
      lstReport.limitPhoto > 0 &&
      listPhoto.length < lstReport.limitPhoto
    ) {
      MessageInfo('Bạn chưa chụp đủ số hình cần thiết!');
      return;
    }
    if (
      dataIssue.issueText?.length === 0 ||
      dataIssue.issueText?.length === '' ||
      dataIssue.issueText?.length === null
    ) {
      MessageInfo('Bạn chưa nhập vấn đề cần giải quyết!');
      return;
    }
    if (dataIssue.issueText?.length < 5) {
      MessageInfo('Vấn đề cần giải quyết phải tối thiểu 5 ký tự!');
      return;
    }
    if (lstReport.isNeedSolution == 1) {
      if (
        dataIssue.solutionText?.length === 0 ||
        dataIssue.solutionText?.length === '' ||
        dataIssue.solutionText?.length === null
      ) {
        MessageInfo('Bạn chưa nhập giải pháp cho vấn đề đã đưa ra!');
        return;
      }
      if (dataIssue.solutionText?.length < 5) {
        MessageInfo('Giải pháp nhập vào phải tối thiểu 5 ký tự!');
        return;
      }
    }

    let jphoto = [];
    listPhoto?.forEach(element => {
      let ImgName = element.photoPath.substring(
        element.photoPath.lastIndexOf('/') + 1,
        element.photoPath.length,
      );
      let fileName = '/uploaded/' + element.photoDate + '/' + ImgName;
      jphoto.push({ ...element, photoPath: fileName });
    });

    const dataUpload = {
      shopId: workinfo.shopId,
      noteIssue: dataIssue.issueText,
      noteSolution: dataIssue.solutionText,
      guiid: guiIdItem,
      issueType: issueType.id ? [...issueType] : null,
      issueStatus: 1,
      typeSend: itemSelect.type == 'EDIT' ? 'EDIT' : 'CREATE',
      reportDate: workinfo.workDate,
      imageIssues: JSON.stringify(jphoto || '[]'),
      isEditItem: 1,
    };
    MessageAction(
      `Bạn chắc chắn muốn ${
        itemSelect.type == 'EDIT' ? 'sửa' : 'tạo'
      } vấn đề này?`,
      async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
          MessageInfo(
            'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
          );
          return;
        }
        await IssueReportUpload(
          [dataUpload],
          { ...workinfo, reportId: kpiinfo.id },
          guiIdItem,
          async result => {
            if (result.statusId === 200) {
              handleSelectQuestion(
                itemSelect.type == 'EDIT' ? 'CLOSEEDIT' : 'CLOSENEW',
                {
                  ...dataUpload,
                  imageIssues: JSON.stringify(listPhoto || '[]'),
                },
              );
              ToastSuccess(
                `${itemSelect.type == 'EDIT' ? 'Sửa' : 'Tạo'} thành công!`,
                'Thông báo',
                'top',
              );
            } else {
              MessageInfo(
                `Xảy ra lỗi khi ${
                  itemSelect.type == 'EDIT' ? 'Sửa' : 'Tạo'
                } vấn đề!` + result.messager,
                'Lỗi',
                'top',
              );
            }
          },
        );
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
      <View
        style={{
          flexDirection: 'row',
          padding: 5,
          borderBottomWidth: 1.5,
          borderBottomColor: appcolor.grayLight,
        }}
      >
        <View
          style={{
            width: '10%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => handleSelectQuestion('CLOSE', { guiid: guiIdItem })}
            style={{
              height: 30,
              width: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SpiralIcon
              name="arrow-left"
              type="font-awesome-5"
              size={20}
              color={appcolor.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 5, width: '75%' }}>
          <Text
            style={{ fontWeight: '600', fontSize: 18, color: appcolor.primary }}
          >
            Tạo vấn đề
          </Text>
        </View>
        <View style={{ width: '15%' }}>
          <TouchableOpacity
            onPress={() => handleCreateIssue()}
            style={{
              height: 30,
              width: 50,
              backgroundColor: appcolor.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 5,
            }}
          >
            <Text
              style={{ fontWeight: '600', fontSize: 16, color: appcolor.white }}
            >
              {itemSelect.type == 'EDIT' ? 'Sửa' : 'Tạo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <FormGroup
          // iconName={'comment-alt'}
          multiline={true}
          selectTextOnFocus={true}
          containerStyle={{
            backgroundColor: appcolor.light,
            width: '100%',
            minHeight: 60,
            padding: 3,
            borderRadius: 0,
            marginBottom: 0,
            borderWidth: 0.5,
            borderColor: appcolor.transparent,
            borderBottomColor: appcolor.grayLight,
          }}
          inputStyle={{
            fontSize: 16,
            color: appcolor.dark,
            borderColor: appcolor.transparent,
          }}
          placeholder="Vấn đề của bạn là gì?"
          editable={true}
          onClearTextAndroid={() => onChangeText('', 'issueText')}
          handleChangeForm={text => onChangeText(text, 'issueText')}
          defaultValue={dataIssue.issueText || ''}
        />
        <FormGroup
          // iconName={'comment-alt'}
          multiline={true}
          selectTextOnFocus={true}
          containerStyle={{
            backgroundColor: appcolor.light,
            width: '100%',
            minHeight: 60,
            padding: 3,
            marginBottom: 0,
            borderRadius: 0,
            borderColor: appcolor.transparent,
            borderWidth: 0.5,
            borderBottomColor: appcolor.grayLight,
          }}
          inputStyle={{
            fontSize: 16,
            color: appcolor.dark,
            borderColor: appcolor.grayLight,
          }}
          placeholder="Đề xuất giải pháp xử lí"
          editable={true}
          onClearTextAndroid={() => onChangeText('', 'solutionText')}
          handleChangeForm={text => onChangeText(text, 'solutionText')}
          defaultValue={dataIssue.solutionText || ''}
        />
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <TouchableOpacity
            onPress={() => uploadFilePhoto()}
            style={{
              borderRadius: 5,
              padding: 5,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <SpiralIcon
              name="image"
              type="font-awesome-5"
              size={15}
              color={appcolor.primary}
            />
            <Text
              style={{
                fontSize: 13,
                color: appcolor.dark,
                fontWeight: '300',
                paddingHorizontal: 10,
              }}
            >
              {'Ảnh'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => takePhoto()}
            style={{
              borderRadius: 5,
              padding: 5,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <SpiralIcon
              name="camera"
              type="font-awesome-5"
              size={15}
              color={appcolor.primary}
            />
            <Text
              style={{
                fontSize: 13,
                color: appcolor.dark,
                fontWeight: '300',
                paddingHorizontal: 10,
              }}
            >
              {'Camera'}
            </Text>
          </TouchableOpacity>
          {listIssueType?.length > 0 && (
            <TouchableOpacity
              onPress={() => SheetManager.show('testSheet')}
              style={{
                borderRadius: 5,
                borderWidth: 0.6,
                borderColor: appcolor.dark,
                padding: 5,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: appcolor.dark,
                  fontWeight: '300',
                  paddingHorizontal: 10,
                }}
              >
                {'Loại vấn đề'}
              </Text>
              <SpiralIcon
                name="angle-down"
                type="font-awesome-5"
                size={15}
                color={appcolor.primary}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{}}>
          <FlatList
            numColumns={3}
            data={listPhoto}
            renderItem={renderItemPhoto}
            ListFooterComponent={<View style={{ height: 300 }} />}
          />
        </View>
      </View>
      <ActionSheet
        id="testSheet"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View
          style={{
            backgroundColor: 'red',
            height: deviceWidth,
            width: deviceWidth,
          }}
        ></View>
      </ActionSheet>
      <ActionSheet
        id={'imageSheetModal'}
        containerStyle={{
          height: deviceHeight,
          width: deviceWidth,
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <ViewImageSheet
          dataImage={dataImage}
          handleVisible={handleVisibleImage}
        />
      </ActionSheet>
    </SafeAreaView>
  );
};
