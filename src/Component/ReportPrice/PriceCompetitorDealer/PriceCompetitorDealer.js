// pricecompetitordealer

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import FormGroup from '../../../Content/FormGroup';
import {
  GetPriceCompetitorDealer,
  UploadPriceCompetitorDealer,
} from '../../../Controller/PriceController';
import {
  Platform,
  UIManager,
  LayoutAnimation,
  ScrollView,
  View,
  SafeAreaView,
} from 'react-native';
import { CalendarSelected } from '../../../Control/CalendarSelected';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import moment from 'moment';
import { dataAll } from '../../../Themes/DataTest';
import { TouchableOpacity } from 'react-native';
import { deviceHeight } from '../../Home';
import { Text } from 'react-native';
import {
  Message,
  MessageAction,
  MessageAction2,
  MessageInfo,
  ToastError,
  ToastSuccess,
} from '../../../Core/Helper';
import { ViewPriceCompetitorDealer } from './ViewPriceCompetitorDealer';
import filter from 'lodash';
import { TODAY, checkNetwork } from '../../../Core/Utility';
import { LoadingView } from '../../../Control/ItemLoading';
import { Icon } from '@rneui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const PriceCompetitorDealer = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [dateKPI, setDateKPI] = useState({
    value: moment().format('YYYYMMDD'),
    date: moment().format('YYYY-MM-DD'),
    isView: false,
  });
  const [data, setData] = useState({
    dataView: [],
    dataMain: [],
    dateReport: moment().format('YYYYMMDD'),
  });
  const [dataByDealer, setDataByDealer] = useState({
    listInput: [],
    listNote: [],
    listCompetitor: [],
    listConfig: {},
    listCompetitorF: [],
    itemSelect: [],
    isUploaded: 0,
  });
  const [showSheetDealer, setShowSheetDealer] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const LoadData = async date => {
    await setLoading(true);
    const result = await GetPriceCompetitorDealer(date || data.dateReport);
    // const result = dataAll
    if (result.statusId === 200) {
      await setDataByDealer({
        listInput: [],
        listNote: [],
        listCompetitor: [],
        listCompetitorF: [],
        listConfig: {},
        itemSelect: [],
        isUploaded: 0,
      });
      await setData({ ...data, dataView: result.data, dataMain: result.data });
      await SheetManager.show('SheetCompetitorDealer');
    }
    await setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, []);
  const contains = (item, query) => {
    for (
      let indexL = 0;
      indexL < dataByDealer.listInput?.length || 0;
      indexL++
    ) {
      const itemL = dataByDealer.listInput[indexL];
      if (
        item[itemL.displayType] !== null &&
        item[itemL.displayType] !== undefined &&
        (item[itemL.displayType] > 0 ||
          (item[itemL.displayType] == 0 && itemL.isZero == 1))
      )
        return true;
    }
    for (
      let indexN = 0;
      indexN < dataByDealer.listNote?.length || 0;
      indexN++
    ) {
      const itemN = dataByDealer.listNote[indexN];
      if (
        item[itemN.noteType] !== null &&
        item[itemN.noteType] !== undefined &&
        item[itemN.displayType] !== ''
      )
        return true;
    }
    return false;
  };
  const uploadAction = async () => {
    await setLoading(true);
    const listUpload = dataByDealer.listCompetitorF;
    const checkValidate = await onValidated(listUpload);
    if (checkValidate) {
      let isNetwork = await checkNetwork();
      if (!isNetwork) {
        ToastError(
          'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
        );
        return;
      }
      const jsonUpload = [
        {
          jsonData: JSON.stringify(listUpload),
          jsonPhoto: '[]',
        },
      ];
      if (
        dataByDealer.listConfig.isConstraintByDealer == 1 ||
        dataByDealer.listConfig.isConstraintByDealer == 2
      ) {
        onValidateTab(listUpload, jsonUpload);
      } else {
        Message(
          'Chú ý',
          'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
          () => UploadData(jsonUpload),
        );
      }
    }
  };
  const UploadData = async jsonUpload => {
    await UploadPriceCompetitorDealer(jsonUpload, async info => {
      if (info.status == 200) {
        await setDataByDealer({
          listInput: [],
          listNote: [],
          listCompetitor: [],
          listCompetitorF: [],
          listConfig: {},
          itemSelect: [],
          isUploaded: 0,
        });
        await LoadData(data.dateReport);
        await ToastSuccess(info.messeger, 'Thông báo', 'top');
      } else ToastError(info.messeger);
    });
  };
  const onValidateTab = (listUpload, jsonUpload) => {
    let countHave = 0;
    for (let indexC = 0; indexC < listUpload?.length; indexC++) {
      const itemC = listUpload[indexC];
      const listProduct = JSON.parse(itemC.ListProduct || '[]');
      const listHave = filter(listProduct, item => {
        return contains(item);
      });
      if (listHave.length == 0) {
        countHave = countHave + 1;
      }
    }
    if (countHave > 0) {
      if (dataByDealer.listConfig?.isConstraintByDealer == 1) {
        ToastError(
          `Bạn chưa điền đủ thông tin các đối thủ!`,
          'Thông báo',
          'top',
        );
        return false;
      } else if (dataByDealer.listConfig?.isConstraintByDealer == 2) {
        MessageAction(
          `Bạn chưa điền đủ thông tin các đối thủ, Có muốn lưu hay không?`,
          () => UploadData(jsonUpload),
        );
      }
    } else {
      Message(
        'Chú ý',
        'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
        () => UploadData(jsonUpload),
      );
    }
  };
  const onValidated = async listUpload => {
    let countHave = 0;
    for (let indexC = 0; indexC < listUpload?.length; indexC++) {
      const itemC = listUpload[indexC];
      const listProduct = JSON.parse(itemC.ListProduct || '[]');
      const listHave = filter(listProduct, item => {
        return contains(item);
      });
      if (listHave?.length == 0) {
        countHave = countHave + 1;
      }
      for (let indexP = 0; indexP < listHave?.length || 0; indexP++) {
        const itemP = listHave[indexP];
        for (
          let indexL = 0;
          indexL < dataByDealer.listInput?.length || 0;
          indexL++
        ) {
          const itemL = dataByDealer.listInput[indexL];
          if (
            (itemP[itemL.displayType] == null ||
              itemP[itemL.displayType] == undefined ||
              (itemP[itemL.displayType] == 0 && itemL.isZero !== 1)) &&
            itemL.isRequired == 1
          ) {
            ToastError(
              `Chưa nhập ${itemL.name} sản phẩm ${itemP.ProductName} - ${itemP.CategoryName} - ${itemC.CompetitorName}`,
              'Thông báo',
              'top',
            );
            return false;
          }

          if (
            itemP[itemL.displayType] !== null &&
            itemP[itemL.displayType] !== undefined &&
            (itemP[itemL.displayType] !== 0 ||
              (itemP[itemL.displayType] == 0 && itemL.isZero !== 1)) &&
            (itemP[itemL.displayType] <
              (itemL.min && itemL.min !== '' ? itemL.min : 1000) ||
              itemP[itemL.displayType] >
                (itemL.max && itemL.max !== '' ? itemL.max : 1000) ||
              itemP[itemL.displayType] %
                (itemL.min && itemL.min !== '' ? itemL.min : 1000 > 0))
          ) {
            ToastError(
              `Sai định dạng ${itemL.name} sản phẩm ${itemP.ProductName} - ${itemP.CategoryName} - ${itemC.CompetitorName}`,
              'sản phẩm',
              'top',
            );
            return false;
          }
        }
        for (
          let indexL = 0;
          indexL < dataByDealer.listNote?.length || 0;
          indexL++
        ) {
          const itemN = dataByDealer.listNote[indexL];
          if (
            (itemP[itemN.noteType] == null ||
              itemP[itemN.noteType] == undefined ||
              itemP[itemN.noteType] == '') &&
            itemN.isRequired == 1
          ) {
            ToastError(
              `Chưa nhập ${itemN.name} ${itemP.ProductName} - ${itemP.CategoryName} - ${itemC.CompetitorName}`,
              'Thông báo',
              'top',
            );
            return false;
          } else if (
            itemP[itemN.noteType] !== null &&
            itemP[itemN.noteType] !== undefined &&
            itemP[itemN.noteType] !== '' &&
            itemP[itemN.noteType]?.length < 5
          ) {
            ToastError(
              `Nhập ${itemN.name} tối thiểu 5 kí tự ${itemP.ProductName} - ${itemP.CategoryName} - ${itemC.CompetitorName}`,
              'Thông báo',
              'top',
            );
            return false;
          }
        }
      }
    }
    if (listUpload?.length == countHave) {
      ToastError(`Bạn chưa nhập bất kì dữ liệu nào!`, 'Thông báo', 'top');
      return false;
    }
    return true;
  };

  const handleSelectDealer = async item => {
    const listCompetitor = JSON.parse(item.listCompetitor || '[]');
    const listInput = JSON.parse(item.listInput || '[]');
    const listNote = JSON.parse(item.listNote || '[]');
    const listConfig = JSON.parse(item.listConfig || '[]');
    if (listCompetitor?.length == 0) {
      MessageInfo('Chưa có danh sách đối thủ!');
      return;
    }
    await setDataByDealer({
      listCompetitor: listCompetitor,
      listCompetitorF: listCompetitor,
      listConfig: listConfig,
      listInput: listInput,
      listNote: listNote,
      itemSelect: item,
      isUploaded: item.isUploaded || 0,
    });
    await setShowSheetDealer(true);
    await SheetManager.hide('SheetCompetitorDealer');
  };
  const handlerSelectItem = () => {
    SheetManager.show('SheetCompetitorDealer');
  };
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: appcolor.surface,
      }}
    >
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
        iconRight={'cloud-upload-alt'}
        rightFunc={dataByDealer.isUploaded == 1 ? null : () => uploadAction()}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 50,
            padding: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => handlerSelectItem()}
            style={{
              flex: 1,
              borderRadius: 8,
              borderWidth: 0.4,
              borderColor: appcolor.dark,
              padding: 4,
              backgroundColor: appcolor.light,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: appcolor.dark, fontWeight: '600', fontSize: 16 }}
            >
              {dataByDealer.itemSelect?.dealerNameTitle || 'Chọn chuỗi'}
            </Text>
          </TouchableOpacity>
        </View>
        {dataByDealer.listCompetitor?.length > 0 && (
          <ViewPriceCompetitorDealer data={data} dataByDealer={dataByDealer} />
        )}
      </View>
      <ActionSheet
        id={'SheetCompetitorDealer'}
        initialOffsetFromBottom={0.6}
        statusBarTranslucent
        gestureEnabled
        closable={!isLoading}
        drawUnderStatusBar={Platform.OS == 'ios'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <ViewListDealer
          data={data}
          LoadData={LoadData}
          handleSelectDealer={handleSelectDealer}
          dataByDealer={dataByDealer}
          isLoading={isLoading}
        />
      </ActionSheet>
    </View>
  );
};

const ViewListDealer = ({
  data,
  LoadData,
  handleSelectDealer,
  dataByDealer,
  isLoading,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dateReport, setDateReport] = useState({
    value: data.dateReport || moment().format('YYYYMMDD'),
    date: data.dateDefalt || moment().format('YYYY-MM-DD'),
    isView: false,
  });

  const showCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDateReport({ ...dateReport, isView: !dateReport.isView });
  };
  const hanlerChooseDate = date => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const dateView = moment(date).format('DD MMM, YYYY');
    const dateValue = moment(date).format('YYYYMMDD');
    data.dateReport = dateValue;
    data.dateDefalt = date;
    setDateReport({ value: dateValue, date: date, isView: false });
    LoadData(dateValue);
  };

  const renderItemCheck = (item, index) => {
    const onChoose = () => {
      handleSelectDealer(item);
    };
    return (
      <TouchableOpacity
        key={`KeyItem_${index}`}
        onPress={onChoose}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 4,
        }}
      >
        <View
          style={{
            backgroundColor:
              dataByDealer.itemSelect?.dealerCode == item.dealerCode
                ? appcolor.light
                : appcolor.surface,
            borderWidth:
              dataByDealer.itemSelect?.dealerCode == item.dealerCode ? 0.5 : 0,
            borderColor:
              dataByDealer.itemSelect?.dealerCode == item.dealerCode
                ? appcolor.success
                : appcolor.transparent,
            borderRadius: 8,
            padding: 12,
            width: '100%',
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{ fontWeight: '500', fontSize: 15, color: appcolor.dark }}
          >
            {item.dealerNameTitle}
          </Text>
          {item.isUploaded == 1 && data.dateReport == TODAY && (
            <SpiralIcon
              type="font-awesome-5"
              name={'check-circle'}
              size={18}
              color={appcolor.success}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ width: '100%', height: deviceHeight, padding: 8 }}>
      <View style={{ alignItems: 'center', paddingTop: 12, padding: 8 }}>
        <FormGroup
          containerStyle={{
            width: '100%',
            padding: 5,
            backgroundColor: appcolor.placeholderBody,
          }}
          inputStyle={{
            fontSize: 14,
            fontWeight: '400',
            color: appcolor.greylight,
          }}
          title="Ngày báo cáo"
          iconRight="calendar-alt"
          value={dateReport.date}
          rightFunc={showCalendar}
        />
        {dateReport.isView && (
          <CalendarSelected
            onChangeData={hanlerChooseDate}
            isBetween={false}
            disibleFuture={true}
            defaultDate={dateReport.date}
          />
        )}
      </View>
      {isLoading && (
        <View style={{ alignItems: 'center', alignSelf: 'center' }}>
          <LoadingView
            title={'Đang tải dữ liệu...'}
            isLoading={isLoading}
            styles={{ marginTop: 8 }}
          />
        </View>
      )}
      {!isLoading && (
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        >
          {data.dataView.map((it, idx) => {
            return renderItemCheck(it, idx);
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
