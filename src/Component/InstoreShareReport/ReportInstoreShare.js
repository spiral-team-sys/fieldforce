import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Text } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { Platform } from 'react-native';
import { _competitorId } from '../../Core/URLs';
import RNFS from 'react-native-fs';
// //import NumberFormat from "react-number-format";
import { TextInput } from 'react-native';
import { Icon } from '@rneui/themed';
import { LayoutAnimation } from 'react-native';
import { MessageInfo, ToastError, ToastSuccess } from '../../Core/Helper';
import { sendInstoreShareByShop } from '../../Controller/SellOutController';
import FormGroup from '../../Content/FormGroup';
import { KeyboardAvoidingView } from 'react-native';
import { scaleSize } from '../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const itemTemplate = {
  competitorId: null,
  competitorName: null,
  categoryId: null,
  categoryName: null,
  monthSelect: null,
  yearSelect: null,
};

export const ReportInstoreShare = ({
  dataCategory,
  dataCompetitor,
  closeModal,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo, kpiinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [dataAll, setDataAll] = useState({ dataCate: [], dataCompe: [] });
  const [compeSelect, setCompeSelect] = useState({});
  const [inputNote, setInputNote] = useState(null);
  const [_, setMutate] = useState(false);
  const reportConfig = JSON.parse(kpiinfo?.reportItem || '{}');
  const [filterMonth, setFilterMonth] = useState({
    year: new Date().getFullYear(),
    yearname: `Năm ${new Date().getFullYear()}`,
    month: new Date().getMonth() + 1,
    monthname: `Tháng ${new Date().getMonth() + 1}`,
    loadYearMonth: false,
    jsonFilter: {},
  });

  const loadData = async () => {
    setDataAll({ dataCate: [...dataCategory], dataCompe: [...dataCompetitor] });
  };

  // Save Data
  const handlerSaveItem = async () => {
    if (reportConfig.limitDate > 0) {
      const currentDate = new Date().getDate();
      const currenMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      if (filterMonth.month > currenMonth && currentYear == filterMonth.year) {
        MessageInfo('Bạn không được báo cáo tháng lớn hơn tháng hiện tại!!');
        return;
      }
      if (currenMonth == 1) {
        if (
          reportConfig.limitDate >= currentDate &&
          filterMonth.month !== currenMonth &&
          filterMonth.month !== 12 &&
          filterMonth.month < currenMonth
        ) {
          MessageInfo(
            'Bạn không được báo cáo quá xa so với tháng hiện tại!!!!',
          );
          return;
        }
      } else {
        if (
          reportConfig.limitDate >= currentDate &&
          filterMonth.month < currenMonth - 1 &&
          filterMonth.year == currentYear
        ) {
          MessageInfo(
            'Bạn không được báo cáo quá xa so với tháng hiện tại!!!!',
          );
          return;
        }
      }
      if (currentYear > filterMonth.year && filterMonth.month !== 12) {
        MessageInfo('Bạn không được báo cáo quá xa so với tháng hiện tại!!!!');
        return;
      } else if (
        reportConfig.limitDate < currentDate &&
        (filterMonth.month !== currenMonth || currentYear !== filterMonth.year)
      ) {
        MessageInfo(
          `Qua ngày ${reportConfig.limitDate} bạn không được báo cáo tháng khác !!`,
        );
        return;
      }
    }
    if (compeSelect.competitorId == undefined) {
      MessageInfo('Bạn chưa chọn hãng!!');
      return;
    }
    const cateFilter = dataAll.dataCate.filter(it => it.isCheck == true);

    if (cateFilter.length == 0) {
      MessageInfo('Bạn chưa chọn ngành hàng!!');
      return;
    }
    const cateFilterValue = cateFilter.filter(
      it => it.quantityByCate == undefined || it.quantityByCate == null,
    );
    if (cateFilterValue.length > 0) {
      let str = 'Các ngành hàng : ';
      for (let index = 0; index < cateFilterValue.length; index++) {
        const item = cateFilterValue[index];
        str += item.categoryName + ', ';
      }
      MessageInfo(str + 'chưa nhâp số lượng');
      return;
    }

    //Update
    let dataUpload = [];
    dataAll.dataCate.map(it => {
      if (it.isCheck == true) {
        dataUpload.push({
          shopId: shopinfo.shopId,
          workDate: shopinfo.auditDate,
          competitorId: compeSelect.competitorId,
          competitorName: compeSelect.competitorName,
          categoryId: it.categoryId,
          categoryName: it.categoryName,
          monthSelect: filterMonth.month,
          yearSelect: filterMonth.year,
          quantityValue: it.quantityByCate,
          note: inputNote,
          typeSend: 'INSERT',
        });
      }
    });

    let res = [];
    dataUpload.map((it, idx) => {
      sendInstoreShareByShop(it, result => {
        if (result.status != 200) res.push(it);

        if (idx == dataUpload.length - 1) {
          if (res.length > 0) {
            let str = '';
            res.map(it => {
              str += it.name + ', ';
            });
            ToastError('Các sản phẩm : ' + str + ' gửi bị lỗi', 'Thông báo');
          } else {
            ToastSuccess('Đã gửi các sản phẩm', 'Đã gửi', 'top');
          }
          closeModal();
        }
      });
    });
  };
  const onFilterChange = search => {
    if (search.year && search.month) {
      setFilterMonth({ ...search });
    }
  };
  const handleSelectCate = item => {
    Platform.OS == 'ios' &&
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    item.isCheck = item.isCheck == true ? false : true;
    setMutate(e => !e);
  };
  const handleSelectCalendar = () => {
    // if(reportConfig.limitDate == )
    SheetManager.show('SheetMonthCreate');
  };
  const handleSelectCompetitor = () => {
    SheetManager.show('SheetCompetitor');
  };
  const handleSelectItemCompe = item => {
    setCompeSelect(item);
    SheetManager.hide('SheetCompetitor');
  };
  const handleChangeNote = text => {
    setInputNote(text);
  };

  useEffect(() => {
    const _Load = loadData();
    return () => _Load;
  }, []);
  const ViewMonth = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Text style={{ fontSize: 12, color: appcolor.dark, fontWeight: '600' }}>
          Chọn tháng :{' '}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '50%',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => handleSelectCalendar()}
            style={{
              flexDirection: 'row',
              borderRadius: 20,
              width: '60%',
              padding: 4,
              borderWidth: 0.6,
              borderColor: appcolor.grey,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: appcolor.dark,
                fontWeight: '400',
                textAlign: 'center',
                flex: 1,
              }}
            >{`${filterMonth.month}-${filterMonth.year}`}</Text>
            <SpiralIcon
              size={12}
              name="calendar-day"
              type="font-awesome-5"
              style={{ flex: 1, paddingHorizontal: 2 }}
            />
          </TouchableOpacity>
          <Text
            style={{ fontSize: 12, color: appcolor.dark, fontWeight: '400' }}
          >
            MM-YYYY
          </Text>
        </View>
      </View>
    );
  };
  const ViewCompetitor = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Text style={{ fontSize: 12, color: appcolor.dark, fontWeight: '600' }}>
          Hãng :{' '}
        </Text>
        <TouchableOpacity
          onPress={() => handleSelectCompetitor()}
          style={{
            flexDirection: 'row',
            width: '50%',
            borderRadius: 20,
            borderWidth: 0.6,
            borderColor: appcolor.grey,
            padding: 4,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: appcolor.dark,
              fontWeight: '400',
              textAlign: 'center',
              flex: 1,
            }}
          >
            {compeSelect.competitorName || 'Chọn hãng'}
          </Text>
          <SpiralIcon
            size={12}
            name="chevron-down"
            type="font-awesome-5"
            style={{ flex: 1, paddingHorizontal: 2 }}
          />
        </TouchableOpacity>
      </View>
    );
  };
  const ViewCategory = () => {
    return (
      <View style={{ padding: 4 }}>
        <Text style={{ fontSize: 12, color: appcolor.dark, fontWeight: '600' }}>
          Ngành hàng :{' '}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {dataAll.dataCate.map((item, index) => {
              return (
                <TouchableOpacity
                  key={'category_' + index}
                  onPress={() => handleSelectCate(item)}
                  style={{
                    padding: 4,
                    borderRadius: 20,
                    borderWidth: 0.6,
                    borderColor:
                      item.isCheck == true ? appcolor.primary : appcolor.grey,
                    minWidth: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: appcolor.light,
                    margin: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        item.isCheck == true ? appcolor.primary : appcolor.dark,
                      fontWeight: '500',
                    }}
                  >
                    {item.categoryName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };
  return (
    <View style={{ backgroundColor: appcolor.light, flex: 1 }}>
      <SafeAreaView
        style={{
          width: '100%',
          flexDirection: 'row',
          backgroundColor: appcolor.primary,
          padding: 5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={closeModal}
          style={{ padding: 10, paddingRight: 15, width: '15%' }}
        >
          <SpiralIcon
            name={'chevron-left'}
            size={scaleSize(28)}
            solid={true}
            color={appcolor.white}
          />
        </TouchableOpacity>
        <Text
          style={{
            width: '70%',
            textAlign: 'center',
            fontSize: scaleSize(18),
            fontWeight: '700',
            padding: 5,
            color: appcolor.white,
          }}
        >
          {'Tạo số bán'}
        </Text>
        <TouchableOpacity
          onPress={handlerSaveItem}
          style={{ padding: 10, width: '15%' }}
        >
          <SpiralIcon
            name={'save'}
            size={scaleSize(28)}
            solid={true}
            color={appcolor.white}
          />
        </TouchableOpacity>
      </SafeAreaView>
      <View style={{ flex: 1, padding: 8 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
          enabled
          keyboardVerticalOffset={60}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={{}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <ViewMonth />
            <ViewCompetitor />
            <ViewCategory />
            <View
              style={{
                justifyContent: 'space-between',
                padding: 4,
                paddingTop: 8,
              }}
            >
              {dataAll.dataCate.map((item, index) => {
                return item.isCheck == true ? (
                  <RenderItemInput
                    key={'itemInput_' + index}
                    item={item}
                    index={index}
                  />
                ) : null;
              })}
            </View>
            <View style={{ padding: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: appcolor.dark,
                  fontWeight: '600',
                  paddingBottom: 10,
                }}
              >
                Ghi chú
              </Text>
              <FormGroup
                iconName={'comment-alt'}
                multiline={true}
                selectTextOnFocus={true}
                containerStyle={{
                  backgroundColor: appcolor.light,
                  width: '100%',
                  minHeight: 30,
                  padding: 3,
                  marginBottom: 0,
                  borderColor: appcolor.grayLight,
                  borderWidth: 0.5,
                }}
                inputStyle={{
                  fontSize: 13,
                  color: appcolor.dark,
                  borderColor: appcolor.grayLight,
                }}
                placeholder="Nhập ghi chú..."
                editable={true}
                onClearTextAndroid={() => handleChangeNote(null)}
                handleChangeForm={text => handleChangeNote(text)}
                defaultValue={inputNote || ''}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <ActionSheet
        id={'SheetMonthCreate'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ height: 200 }}>
          <YearMonthSelected
            option={filterMonth}
            onYearMonth={search => onFilterChange(search)}
            numMonth={4}
          />
        </View>
      </ActionSheet>
      <ActionSheet
        id={'SheetCompetitor'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ height: 400 }}>
          <Text
            style={{
              fontSize: 16,
              color: appcolor.dark,
              fontWeight: '600',
              padding: 12,
            }}
          >
            Chọn hãng{' '}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {dataAll.dataCompe.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectItemCompe(item)}
                  style={{
                    padding: 4,
                    borderRadius: 20,
                    borderWidth: 0.6,
                    borderColor:
                      item.competitorId == compeSelect.competitorId
                        ? appcolor.primary
                        : appcolor.grey,
                    minWidth: 80,
                    height: 35,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: appcolor.light,
                    margin: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        item.competitorId == compeSelect.competitorId
                          ? appcolor.primary
                          : appcolor.dark,
                      fontWeight: '500',
                    }}
                  >
                    {item.competitorName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};

const RenderItemInput = ({ item, index }) => {
  const { appcolor, userinfo, kpiinfo, shopinfo } = useSelector(
    state => state.GAppState,
  );
  const [_, setMutate] = useState();

  const changeValue = async (text, item) => {
    let value =
      text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : '';
    let intValue = value === '' ? null : parseInt(value);
    if (intValue && intValue >= 0) {
      item.quantityByCate = intValue;
    } else {
      item.quantityByCate = null;
    }
    setMutate(e => !e);
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: appcolor.dark,
          fontWeight: '600',
          width: '50%',
        }}
      >
        {item.categoryName}
      </Text>
      <NumberFormat
        value={item.quantityByCate === 0 ? 0 : item.quantityByCate || ''}
        displayType="text"
        thousandSeparator={true}
        renderText={value => (
          <TextInput
            textAlign={'center'}
            value={value}
            style={{
              fontSize: 12,
              minWidth: 80,
              color: appcolor.dark,
              fontWeight: '500',
              textAlign: 'center',
              borderWidth: 0.5,
              borderRadius: 5,
              borderColor: appcolor.greydark,
              padding: 6,
              marginBottom: 2,
              backgroundColor: appcolor.light,
            }}
            keyboardType="numeric"
            placeholder={'Số lượng'}
            placeholderTextColor={appcolor.greydark}
            editable={true}
            selectTextOnFocus={true}
            onChangeText={text => changeValue(text, item)}
          // onEndEditing={endInput}
          />
        )}
      />
    </View>
  );
};
