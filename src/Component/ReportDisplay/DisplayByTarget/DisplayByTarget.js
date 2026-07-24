import { useSelector } from 'react-redux';
import React, { useEffect, useState, useRef, Fragment } from 'react';
import {
  View,
  Text,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { DisplayContext } from '../../../Controller/DisplayController';
import { checkNetwork, TODAY } from '../../../Core/Utility';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { Badge, Divider, Icon } from '@rneui/themed';
import { scaleSize } from '../../../Themes/AppsStyle';
import FormGroup from '../../../Content/FormGroup';
import ActionSheet from 'react-native-actions-sheet';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { getPhotosReport } from '../../../Controller/WorkController';
import { ToastError, ToastSuccess } from '../../../Core/Helper';
import filter from 'lodash';
import { SceneMap } from 'react-native-tab-view';
import { InputDisplay } from './InputDisplay';
import { TabForm } from '../../../Control/TabForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const DisplayByTarget = ({ navigation }) => {
  const { appcolor, kpiinfo, workinfo } = useSelector(state => state.GAppState);
  const _sheet = useRef();
  const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
  const [upload, setUpload] = useState(
    workinfo.workDate !== TODAY ? true : false,
  );
  const [reloadPhoto, setLoadPhoto] = useState(0);

  const [reload, setReload] = useState(false);

  const [routes, setRoutes] = useState([
    { key: 'first', title: 'Nhập Liệu' },
    { key: 'second', title: 'Hình Ảnh' },
  ]);

  //end search product
  const loadData = async () => {
    const result = await DisplayContext.DisplayTargetGetList(workinfo);
    if (result.length > 0) {
      await setUpload(result[0].upload === 1 ? true : false);
      await setLoadPhoto(reloadPhoto + 1);
    }
  };
  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const ViewItemInput = () => {
    return <InputDisplay reload={reload} upload={upload} workinfo={workinfo} />;
  };
  const ViewItemPhoto = () => {
    return (
      <PhotoItems
        usedHeader={false}
        navigation={navigation}
        route={{
          params: {
            Photos: reportItem.ImageByList || [],
            Status: upload ? 1 : 0,
          },
        }}
      />
    );
  };
  const renderScene = SceneMap({
    first: ViewItemInput,
    second: ViewItemPhoto,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
      keyboardVerticalOffset={-10}
      style={{ flex: 1, backgroundColor: appcolor.transparent }}
    >
      <CheckDone
        navigation={navigation}
        appcolor={appcolor}
        _sheet={_sheet}
        upload={upload}
        kpiinfo={kpiinfo}
        workinfo={workinfo}
        reportItem={reportItem}
        loadData={loadData}
      />
      <View style={{ flex: 1, backgroundColor: appcolor.light }}>
        {routes.length > 0 && (
          <TabForm
            renderScene={renderScene}
            initialPage={0}
            routes={routes}
            positionTabBar={'bottom'}
            swipeEnabled={false}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const CheckDone = ({
  navigation,
  appcolor,
  _sheet,
  upload,
  kpiinfo,
  workinfo,
  reportItem,
  loadData,
}) => {
  const insets = useSafeAreaInsets();
  const [taskDone, setDone] = useState([]);
  const [count, setCount] = useState(0);
  //search product
  const [product, setListProduct] = useState([]);
  const [query, setQuery] = useState('');
  const [_filterProduct, setFilterProduct] = useState([]);

  const onValidated = async resultValid => {
    const res = await DisplayContext.taskDone(workinfo);
    let isDone = true;
    let uiTask = [];
    await uiTask.push(
      <Text
        key={'dasda'}
        style={{
          padding: 12,
          color: appcolor.dark,
          fontSize: scaleSize(18),
        }}
      >
        {upload
          ? 'Báo cáo đã gửi lên hệ thống'
          : 'Bạn chưa hoàn thành các mục màu đỏ bên dưới'}
      </Text>,
    );
    await res.forEach((v, index) => {
      isDone === true && v.countInput < v.totalRow ? (isDone = false) : null;
      uiTask.push(
        <View key={index + '92KK'}>
          <View style={{ padding: 7, flexDirection: 'row' }} key={v.category}>
            <Text
              style={{
                flexGrow: 1,
                textDecorationLine:
                  v.countInput < v.totalRow ? 'line-through' : 'none',
                padding: 3,
                color:
                  v.countInput < v.totalRow
                    ? appcolor.danger
                    : appcolor.success,
              }}
            >
              {v.categoryName}
            </Text>
            <Text
              style={{
                padding: 3,
                color:
                  v.countInput < v.totalRow
                    ? appcolor.danger
                    : appcolor.success,
              }}
            >
              {v.countInput}/{v.totalRow}
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: appcolor.surface,
              width: '100%',
            }}
          />
        </View>,
      );
    });
    //kiem tra du lieu hinh anh
    await uiTask.push(
      <Text
        key={'aaa'}
        style={{
          padding: 12,
          color: appcolor.dark,
          fontSize: scaleSize(18),
        }}
      >
        Dữ liệu hình ảnh
      </Text>,
    );
    await reportItem.ImageByList?.forEach(async (item, index) => {
      let photoType = `${item.code}`;
      let lstPhoto =
        (await getPhotosReport(
          kpiinfo.kpiId,
          photoType,
          workinfo.shopId,
          workinfo.workDate,
        )) || [];
      const photoSize = (await lstPhoto.length) || 0;
      if (isDone === true && photoSize < item.numberIMG) {
        //set false neu trang thai dang done
        isDone = false;
      }
      await uiTask.push(
        <View key={index + '-29dkl'}>
          <View style={{ padding: 7, flexDirection: 'row' }}>
            <Text
              style={{
                flexGrow: 1,
                textDecorationLine:
                  item.numberIMG > photoSize ? 'line-through' : 'none',
                padding: 3,
                color:
                  item.numberIMG > photoSize
                    ? appcolor.danger
                    : appcolor.success,
              }}
            >
              {item.nameVN}
            </Text>
            <Text
              style={{
                padding: 3,
                color:
                  item.numberIMG > photoSize
                    ? appcolor.danger
                    : appcolor.success,
              }}
            >
              {photoSize}/{item.numberIMG}
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: appcolor.surface,
              width: '100%',
            }}
          />
        </View>,
      );
    });
    await setDone(uiTask);
    setTimeout(() => {
      return resultValid(isDone);
    }, 200);
  };
  const onSummitReport = async () => {
    await Keyboard.dismiss();
    await onValidated(async res => {
      if ((await res) === false || upload) {
        //chua nhap xong du lieu
        await _sheet.current.show();
      } else {
        //hoan thanh
        if (await checkNetwork()) {
          await DisplayContext.displayUpload(
            { ...workinfo, reportId: kpiinfo.kpiId },
            result => {
              if (result.statusId === 200) {
                loadData();
              }
              ToastSuccess(result.messager);
            },
          );
        } else {
          ToastError('Không có kết nối mạng', 'error', 'top');
        }
      }
    });
  };
  const onLoadProduct = async () => {
    const list = await DisplayContext.GetProductMore(workinfo);
    await setListProduct(list);
    await setFilterProduct(list);
  };
  const onSelected = (item, index) => {
    let edit = item;
    edit.addMore = !item.addMore;
    let updatelist = [...product];
    updatelist[index] = edit;
    const _data = updatelist.filter(e => e.addMore === true);
    setCount(_data.length);
    setListProduct(updatelist);
  };
  const onAddMore = async () => {
    if (count > 0) {
      const addlist = product.filter(v => v.addMore === true);
      await DisplayContext.AddMore(addlist);
      await loadData();
    }
    await setListProduct([]);
    await setFilterProduct([]);
    await setCount(0);
    await _sheet.current.hide();
  };
  const rowProduct = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => onSelected(item, index)}
        key={'hig' + index}
      >
        <View
          key={'rs' + index}
          style={{
            alignItems: 'center',
            padding: 7,
            backgroundColor: item.addMore ? appcolor.primary : appcolor.light,
            flexDirection: 'row',
            marginEnd: 7,
          }}
        >
          <View style={{ flexGrow: 1 }}>
            <Text
              style={{
                color: appcolor.dark,
                fontSize: scaleSize(16),
              }}
            >
              {item.productName}
            </Text>
            <Text
              style={{
                color: appcolor.dark,
                fontSize: scaleSize(12),
                marginBottom: 7,
              }}
            >
              {item.categoryName}
            </Text>
          </View>
          {item.addMore ? (
            <SpiralIcon
              size={30}
              name="playlist-add-check"
              color={appcolor.light}
            />
          ) : null}
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
      </TouchableOpacity>
    );
  };

  const handleSearch = text => {
    const formattedQuery = text.toLowerCase();
    const filteredData = filter(_filterProduct, item => {
      return contains(item, formattedQuery);
    });
    setQuery(text);
    if (formattedQuery === undefined || formattedQuery === '') {
      setListProduct(product);
    } else setListProduct(filteredData);
  };
  const closeSheet = () => {
    _sheet.current.hide();
    setDone([]);
  };
  // search area
  const contains = (item, query) => {
    const { productCode, productName, categoryName } = item;
    let SCate =
      categoryName === null ? categoryName : categoryName.toLowerCase();
    let SCode = productCode === null ? productCode : productCode.toLowerCase();
    let SName = productName === null ? productName : productName.toLowerCase();
    if (
      SCate.includes(query) ||
      SCode.includes(query) ||
      SName.includes(query)
    ) {
      return true;
    }
    return false;
  };

  return (
    <View>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        rightFunc={onSummitReport}
        iconRight={upload === true ? 'poll' : 'cloud-upload-alt'}
        iconMiddle="search"
        middleFunc={upload === true ? null : () => _sheet.current.show()}
        title={kpiinfo.name}
      />
      <ActionSheet
        // headerAlwaysVisible gestureEnabled
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        onClose={() => {
          setDone([]);
        }}
        ref={_sheet}
        onOpen={() => onLoadProduct()}
      >
        {taskDone.length > 0 ? (
          <View style={{ height: '95%' }}>
            <ScrollView>
              <View>{taskDone}</View>
            </ScrollView>
            <TouchableOpacity
              style={{
                width: '100%',
                position: 'absolute',
                bottom: 0,
                padding: 7,
                alignItems: 'center',
              }}
              onPress={() => closeSheet()}
            >
              <Text
                style={{
                  color: appcolor.primary,
                  fontSize: scaleSize(18),
                }}
              >
                Đã hiểu
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Fragment>
            <FormGroup
              useClearAndroid={false}
              editable={true}
              handleChangeForm={e => handleSearch(e)}
              placeholder="Nhập mã sản phẩm ngoài danh sách"
            />
            <ScrollView style={{ height: '95%' }}>
              <View>
                {product.map((item, index) => {
                  return rowProduct(item, index);
                })}
              </View>
            </ScrollView>
            <TouchableOpacity onPress={() => onAddMore()}>
              <View
                style={{
                  alignItems: 'center',
                  width: '100%',
                  backgroundColor: appcolor.primary,
                  padding: 12,
                }}
              >
                <Text style={{ color: appcolor.white }}>
                  {count > 0 ? `(${count}) Áp dụng` : `Trở về`}
                </Text>
              </View>
            </TouchableOpacity>
          </Fragment>
        )}
      </ActionSheet>
    </View>
  );
};
