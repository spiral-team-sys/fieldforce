import React, { useState, useRef, useEffect, Fragment } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  FlatList,
  ScrollView,
} from 'react-native';
import { Button, Divider, Icon } from '@rneui/themed';
import FormGroup from '../../../Content/FormGroup';
import { getWorkingPlanByDate } from '../../../Controller/BussinessTripController';
import { MessageInfo } from '../../../Core/Helper';
import Moment from 'moment';
import ActionSheet from 'react-native-actions-sheet';
import { RenderCalendar } from '../../../Core/DatePickerView';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import { checkNetwork } from '../../../Core/Utility';
import { scaleSize } from '../../../Themes/AppsStyle';
import { AttendantController } from '../../../Controller/AttendantController';
import { AppNameBuild, mitsuApp } from '../../../Core/URLs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const Casper_BussinessTripInput = ({
  appcolor,
  nextView,
  myAddress,
  searchMap,
  bussinessInput,
  setBussinessInput,
  Provinces,
  MoneyMove,
  PeopleInRoom,
}) => {
  const insets = useSafeAreaInsets();
  const VIEW_RESULT = 'VIEW RESULT';
  const _bottomSheet = useRef();
  const [dateSelect, setDateSelect] = useState(new Date());
  const [typeDate, setTypeDate] = useState();
  const [reload, setReload] = useState(0);

  const TYPE_KM = 'KILOMET';
  const TYPE_PEOPLE_INROOM = 'PEOPLEINROOM';
  const TYPE_PROVINCE_FROM = 'FROM PROVINCE';
  const TYPE_PROVINCE_TO = 'TO PROVINCE';
  const TYPE_DATE_FROM = 'FROM DATE';
  const TYPE_DATE_TO = 'TO DATE';

  const handleDateShow = async type => {
    await setTypeDate(type);
    _bottomSheet.current.show();
  };
  const loadWorkingPlan = async (fromdate, todate) => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    let lstWorkingPlan = await getWorkingPlanByDate(fromdate, todate);

    let lstCV = [];
    lstCV = lstWorkingPlan ? await mapItemWorkingPlan(lstWorkingPlan) : [];
    await CalculatorBy();
    await setBussinessInput({
      ...bussinessInput,
      workingplan: lstCV,
    });
  };
  const mapItemWorkingPlan = lstwp => {
    let lstTem = [];
    let lstDate = [];
    lstwp.map(it => {
      if (!lstDate.includes(it.auditDate)) {
        lstDate.push(it.auditDate);
        lstTem.push({ auditDateKM: it.auditDate });
      }

      lstTem.push(it);
    });

    return lstTem;
  };
  useEffect(() => {
    CalculatorBy();
    // return () => false;
  }, [
    bussinessInput?.fromDate,
    bussinessInput?.toDate,
    bussinessInput?.typeKm,
  ]);
  // calcu
  const CalculatorBy = async () => {
    let supportMove = 0;
    let numberDate = 0;
    let numberNight = 0;
    let supportTotal = 0;
    if (bussinessInput?.fromDate && bussinessInput?.toDate) {
      let fromDateInt = parseInt(bussinessInput?.fromDate.replace(/-/gm, ''));
      let toDateInt = parseInt(bussinessInput?.toDate.replace(/-/gm, ''));
      if (toDateInt >= fromDateInt) {
        // cal date
        numberDate =
          toDateInt === fromDateInt ? 1 : toDateInt - fromDateInt + 1;
        //cal night
        numberNight = toDateInt === fromDateInt ? 0 : toDateInt - fromDateInt;

        let supportHotel =
          numberNight *
          (bussinessInput?.typePeopleInfo?.code == '1A' ? 430000 : 270000);
        let supportRestaurant = numberDate * 150000;
        if (bussinessInput?.typeKm) {
          if (bussinessInput?.provinceFromVN == bussinessInput?.provinceToVN) {
            supportMove = 150000 * numberDate;
            if (bussinessInput?.typeKm == '50km ~ 100km') supportHotel = 0;
          } else {
            supportMove = bussinessInput?.supportKM || 0;
          }
          supportTotal =
            bussinessInput?.typeKmInfo?.isRequired === 1
              ? supportHotel + supportRestaurant + supportMove
              : supportRestaurant + supportMove;
        }
        await setBussinessInput({
          ...bussinessInput,
          numberDate: numberDate,
          numberNight: numberNight,
          supportHotel: supportHotel,
          supportRestaurant: supportRestaurant,
          supportMove: supportMove,
          supportTotal: supportTotal,
        });
      }
    }
  };
  useEffect(() => {
    bussinessInput?.numberDate !== undefined &&
      loadWorkingPlan(
        parseInt(bussinessInput?.fromDate.replace(/-/gm, '')),
        parseInt(bussinessInput?.toDate.replace(/-/gm, '')),
      );
    return () => false;
  }, [bussinessInput?.numberDate]);
  const handleDateSelect = async date => {
    let dateCV = parseInt(date.replace(/-/gm, ''));

    if (typeDate === TYPE_DATE_FROM) {
      let toDateCV = parseInt(bussinessInput?.toDate.replace(/-/gm, ''));

      if (dateCV > toDateCV) {
        MessageInfo('ngày bắt đầu phải sau ngày kết thúc.');
        return;
      }

      await setBussinessInput({ ...bussinessInput, fromDate: date });
    } else if (typeDate === TYPE_DATE_TO) {
      let fromDateCV = parseInt(bussinessInput?.fromDate.replace(/-/gm, ''));
      if (dateCV < fromDateCV) {
        MessageInfo('ngày kết thúc phải trước ngày bắt đầu.');
        return;
      }

      await setBussinessInput({ ...bussinessInput, toDate: date });
    }
    _bottomSheet.current.hide();
  };

  const pressFromAddress = type => {
    if (type === 'from') {
      if (
        bussinessInput?.fromAddress &&
        bussinessInput?.fromAddress != '' &&
        bussinessInput?.fromAddress.length > 6
      ) {
        const textSeach = `${bussinessInput?.fromAddress}`;
        AttendantController.LocationFromAddress(
          textSeach,
          res => {
            if (res.statusId === 500) {
              MessageInfo(
                'Địa chỉ bạn nhập chúng tôi không tìm thấy vui lòng kiểm tra lại hoặc tìm 1 địa chỉ khác',
              );
            } else {
              setBussinessInput({
                ...bussinessInput,
                fromAddress: res.address,
                locationFrom: res?.location?.lat + ',' + res?.location?.lng,
              });
            }
          },
          err => {
            alert(err);
          },
        );
      } else {
        MessageInfo(
          'Vui lòng nhập địa chỉ ít nhất 6 ký tự (địa chỉ bao gồm số nhà, tên đường, quận huyện, thành phố)',
        );
      }
    } else if (type === 'to') {
      if (
        bussinessInput?.toAddress &&
        bussinessInput?.toAddress != '' &&
        bussinessInput?.toAddress.length > 10
      ) {
        const textSeach = `${bussinessInput?.toAddress}`;
        AttendantController.LocationFromAddress(
          textSeach,
          res => {
            // console.log(res, "LocationFromAddress")
            if (res.statusId === 500) {
              MessageInfo(
                'Địa chỉ bạn nhập chúng tôi không tìm thấy vui lòng kiểm tra lại hoặc tìm 1 địa chỉ khác',
              );
            } else {
              setBussinessInput({
                ...bussinessInput,
                toAddress: res.address,
                locationTo: `${res?.location?.lat},${res?.location?.lng}`,
              });
            }
          },
          err => {
            alert(err);
          },
        );
      } else {
        MessageInfo(
          'Vui lòng nhập địa chỉ ít nhất 10 ký tự (địa chỉ bao gồm số nhà, tên đường, quận huyện, thành phố )',
        );
      }
    }
  };
  const handleItemWorkingPlan = (text, index) => {
    let lstTem = bussinessInput?.workingplan;
    lstTem[index].numberKm = text && text != '' ? parseInt(text) : '';
    setBussinessInput({ ...bussinessInput, workingplan: lstTem });
  };
  const renderItemWorkPlan = ({ item, index }) => {
    return 'auditDateKM' in item ? (
      <View
        style={{
          width: '100%',
          backgroundColor: appcolor.surface,
          marginBottom: 7,
        }}
      >
        <Text
          style={{
            color: appcolor.dark,
            fontSize: scaleSize(16),
            marginLeft: 30,
            padding: 12,
          }}
        >
          {Moment(item.auditDateKM.toString()).format('dddd, DD MM YY')}
        </Text>
        <FormGroup
          keyboardType={'numeric'}
          value={(item?.numberKm || '') + ''}
          editable={true}
          inputStyle={{ textAlign: 'right' }}
          placeholder={'Nhập số km trong ngày'}
          useClearAndroid={false}
          handleChangeForm={text => handleItemWorkingPlan(text, index)}
        />
      </View>
    ) : (
      <Fragment>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            maxHeight: 70,
            width: '100%',
          }}
        >
          <Text
            style={{
              width: '25%',
              textAlign: 'center',
              color: appcolor.dark,
              fontSize: 10,
              padding: 10,
            }}
          >
            Cửa hàng
          </Text>
          <Text
            style={{
              width: '25%',
              textAlign: 'center',
              color: appcolor.dark,
              fontSize: 10,
              padding: 10,
            }}
          >
            {item.shopName}
          </Text>
          <Text
            style={{
              width: '50%',
              textAlign: 'center',
              color: appcolor.dark,
              fontSize: 10,
              padding: 10,
            }}
          >
            {item.address}
          </Text>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
      </Fragment>
    );
  };
  const continueView = () => {
    if (
      !bussinessInput?.fromAddress ||
      bussinessInput?.fromAddress === '' ||
      bussinessInput?.fromAddress.length < 10
    ) {
      MessageInfo(
        'Vui lòng nhập địa chỉ đi ít nhất 10 ký tự (địa chỉ gồm số nhà, tên đường, quận huyện, thành phố)',
      );
      return;
    }
    if (
      !bussinessInput?.toAddress ||
      bussinessInput?.toAddress === '' ||
      bussinessInput?.toAddress.length < 10
    ) {
      MessageInfo(
        'Vui lòng nhập địa chỉ đến ít nhất 10 ký tự (địa chỉ gồm số nhà, tên đường, quận huyện, thành phố)',
      );
      return;
    }
    if (!bussinessInput?.locationFrom || bussinessInput?.locationFrom === '') {
      MessageInfo(
        'Chưa có toạ độ nơi đi, Vui lòng nhập nơi đi rồi bấm tìm kiếm, hoặc bấm vào map để chọn toạ độ nơi đi.)',
      );
      return;
    }
    if (!bussinessInput?.locationTo || bussinessInput?.locationTo === '') {
      MessageInfo(
        'Chưa có toạ độ từ, Vui lòng nhập nơi đến rồi bấm tìm kiếm, hoặc vào map để chọn toạ độ nơi đi.)',
      );
      return;
    }
    if (
      !bussinessInput?.provinceFromVN ||
      bussinessInput?.provinceFromVN === ''
    ) {
      MessageInfo('Chưa chọn tỉnh thành phố xuất phát.');
      return;
    }
    if (!bussinessInput?.provinceToVN || bussinessInput?.provinceToVN === '') {
      MessageInfo('Chưa chọn tỉnh thành phố đến.');
      return;
    }
    if (!bussinessInput?.typeKm || bussinessInput?.typeKm === '') {
      MessageInfo('Chưa chọn số km của chuyến đi.');
      return;
    }
    if (bussinessInput?.provinceFromVN !== bussinessInput?.provinceToVN)
      if (!bussinessInput?.supportKM || bussinessInput?.supportKM === '') {
        MessageInfo('Chưa nhập chi phí di chuyển dự kiến');
        return;
      }
    if (
      (bussinessInput?.typeKm == 'Từ 100km' ||
        bussinessInput?.provinceFromVN !== bussinessInput?.provinceToVN) &&
      (!bussinessInput?.typePeople || bussinessInput?.typePeople === '')
    ) {
      MessageInfo('Chưa chọn số lượng người/phòng');
      return;
    }
    if (
      bussinessInput?.workingplan &&
      bussinessInput?.workingplan.length === 0
    ) {
      MessageInfo('Chưa có lịch làm việc cho khoảng thời gian này.');
      return;
    }

    let itemsNoneEnter = bussinessInput?.workingplan.filter(
      it =>
        'auditDateKM' in it &&
        (it.numberKm === undefined || it.numberKm === null),
    );
    if (itemsNoneEnter.length > 0) {
      MessageInfo(
        'Bạn chưa nhập km cho ngày: ' + itemsNoneEnter[0].auditDateKM,
      );
      return;
    }
    CalculatorBy();
    nextView(VIEW_RESULT, { ...bussinessInput, isLock: false });
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <FormGroup
          containerStyle={{ width: '49%' }}
          title={'Tên nhân viên'}
          value={bussinessInput?.employeeName}
          useClearAndroid={false}
        />
        <FormGroup
          containerStyle={{ width: '49%' }}
          title={'Mã nhân viên'}
          value={bussinessInput?.employeeCode}
          useClearAndroid={false}
        />
      </View>
      <FormGroup
        iconRight={'caret-down'}
        iconRightStyle={{ color: appcolor.primary }}
        title={'Từ nơi công tác'}
        placeholder="Tỉnh đi"
        rightFunc={() => {
          setTypeDate(TYPE_PROVINCE_FROM);
          _bottomSheet.current.show();
        }}
        value={bussinessInput?.provinceFromVN || ''}
        useClearAndroid={false}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <FormGroup
          containerStyle={{
            paddingBottom: 5,
            paddingTop: 5,
            maxHeight: 90,
            width: '100%',
          }}
          // inputStyle={{ height: 70 }}
          multiline={true}
          rightFunc={() => pressFromAddress('from')}
          iconRight="search"
          iconRightStyle={{ color: appcolor.primary }}
          editable={true}
          title={'Nơi đi'}
          value={bussinessInput?.fromAddress || ''}
          placeholder={'Địa chỉ nơi sinh sống'}
          useClearAndroid={false}
          handleChangeForm={text =>
            setBussinessInput({ ...bussinessInput, fromAddress: text })
          }
        />
        <View style={{ flexDirection: 'column' }}>
          {bussinessInput?.locationFrom && (
            <SpiralIcon
              name="location"
              type="ionicon"
              onPress={() => searchMap('from')}
              color={appcolor.green}
            />
          )}
          {/* <SpiralIcon color={appcolor.dark} name='map' type='font-awesome' size={25} onPress={() => searchMap('from')}></SpiralIcon> */}
        </View>
      </View>
      <FormGroup
        containerStyle={{ width: '100%' }}
        rightFunc={() => {
          setTypeDate(TYPE_PROVINCE_TO);
          _bottomSheet.current.show();
        }}
        iconRight={'caret-down'}
        title={'Đến nơi công tác'}
        value={bussinessInput?.provinceToVN || ''}
        useClearAndroid={false}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <FormGroup
          containerStyle={{
            maxHeight: 90,
            borderColor: appcolor.darklight,
            width: '100%',
          }}
          // inputStyle={{ height: 70 }}
          multiline={true}
          inputStyle={{ fontSize: 12 }}
          rightFunc={() => pressFromAddress('to')}
          iconRight="search"
          iconRightStyle={{ color: appcolor.primary }}
          editable={true}
          title={'Nơi đến'}
          value={bussinessInput?.toAddress || ''}
          useClearAndroid={false}
          placeholder={
            'Địa chỉ khách hàng check in xa nhất của chuyến công tác'
          }
          handleChangeForm={text =>
            setBussinessInput({ ...bussinessInput, toAddress: text })
          }
        />
        <View style={{ flexDirection: 'column' }}>
          {bussinessInput?.locationTo && (
            <SpiralIcon
              name="location"
              type="ionicon"
              onPress={() => searchMap('to')}
              color={appcolor.success}
            />
          )}
          {/* <SpiralIcon color={appcolor.dark} name='map' type='font-awesome' size={25} onPress={() => searchMap('to')}></SpiralIcon> */}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <FormGroup
          rightFunc={() => handleDateShow(TYPE_DATE_FROM)}
          iconRight={'caret-down'}
          iconRightStyle={{ color: appcolor.primary }}
          containerStyle={{ width: '49%' }}
          title={'Từ ngày'}
          value={
            bussinessInput?.fromDate
              ? Moment(bussinessInput?.fromDate).format('YYYY-MM-DD')
              : Moment().startOf('month').format('YYYY-MM-DD')
          }
          useClearAndroid={false}
        />
        <FormGroup
          rightFunc={() => handleDateShow(TYPE_DATE_TO)}
          iconRight={'caret-down'}
          iconRightStyle={{ color: appcolor.primary }}
          containerStyle={{ width: '49%' }}
          title={'Đến ngày'}
          value={Moment(bussinessInput?.toDate || new Date()).format(
            'YYYY-MM-DD',
          )}
          useClearAndroid={false}
        />
      </View>
      {/* <Text>{JSON.stringify(bussinessInput)}</Text> */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <FormGroup
          containerStyle={{ width: '49%' }}
          title={'Số ngày'}
          placeholder={'0'}
          value={(bussinessInput?.numberDate || '') + ''}
          useClearAndroid={false}
        />
        <FormGroup
          containerStyle={{ width: '49%' }}
          title={'Số đêm'}
          placeholder={'0'}
          value={(bussinessInput?.numberNight || '') + ''}
          useClearAndroid={false}
        />
      </View>
      <View
        style={{
          backgroundColor: appcolor.surface,
          padding: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Text style={{ fontWeight: '600', fontSize: 15, color: appcolor.dark }}>
          {'Kế hoạch công tác'}
        </Text>
      </View>
      <FlatList
        data={bussinessInput?.workingplan}
        style={{ backgroundColor: appcolor.surface, padding: 2 }}
        renderItem={renderItemWorkPlan}
      />
      {bussinessInput?.provinceFromVN !== bussinessInput?.provinceToVN && (
        <FormGroup
          editable
          keyboardType={'numeric'}
          value={bussinessInput?.supportKM || ''}
          containerStyle={{ top: 5 }}
          title={'Chi phí di chuyển dự kiến (Ngoại tỉnh)'}
          useClearAndroid={false}
          handleChangeForm={text =>
            setBussinessInput({ ...bussinessInput, supportKM: parseInt(text) })
          }
        />
      )}
      {/* <KeyboardSpacer topSpacing={Platform.OS === 'android' ? 30 : 20} /> */}
      <FormGroup
        value={bussinessInput?.typeKm || ''}
        containerStyle={{ top: 5 }}
        rightFunc={() => handleDateShow(TYPE_KM)}
        iconRight={'caret-down'}
        iconRightStyle={{ color: appcolor.primary }}
        title={'Số km của chuyến đi'}
        useClearAndroid={false}
      />
      {PeopleInRoom !== null &&
        PeopleInRoom.length > 0 &&
        (bussinessInput?.typeKm == 'Từ 100km' ||
          bussinessInput?.provinceFromVN !== bussinessInput?.provinceToVN) && (
          <FormGroup
            value={bussinessInput?.typePeople || ''}
            containerStyle={{ top: 5 }}
            rightFunc={() => handleDateShow(TYPE_PEOPLE_INROOM)}
            iconRight={'caret-down'}
            iconRightStyle={{ color: appcolor.primary }}
            title={'Số lượng người/phòng'}
            useClearAndroid={false}
          />
        )}
      <Button
        containerStyle={{
          width: '100%',
          height: 50,
          backgroundColor: appcolor.tranparents,
          alignItems: 'flex-end',
          right: 15,
          padding: 5,
        }}
        buttonStyle={{ backgroundColor: appcolor.green }}
        onPress={() => continueView()}
        title={'Tiếp tục'}
      />
      <ActionSheet
        ref={_bottomSheet}
        defaultOverlayOpacity={0.3}
        containerStyle={{
          padding: 7,
          flexGrow: 1,
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
      >
        <View key={'date'} style={{ marginBottom: 50 }}>
          {typeDate === TYPE_KM && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MoneyMove.map((v, i) => {
                return (
                  <TouchableOpacity
                    key={i + 'lllaa'}
                    onPress={() => {
                      setBussinessInput({
                        ...bussinessInput,
                        typeKm: v.name,
                        typeKmInfo: v,
                      });
                      _bottomSheet.current.hide();
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: appcolor.light,
                        borderRadius: 20,
                        marginEnd: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: appcolor.dark,
                          fontSize: 12,
                          padding: 10,
                        }}
                      >
                        {v.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {(typeDate === TYPE_PROVINCE_FROM ||
            typeDate === TYPE_PROVINCE_TO) && (
              <ScrollView horizontal>
                {Provinces.map((item, i) => {
                  return (
                    <TouchableOpacity
                      key={'dasda' + i}
                      style={{ marginEnd: 12 }}
                      onPress={() => {
                        typeDate === TYPE_PROVINCE_FROM
                          ? setBussinessInput({
                            ...bussinessInput,
                            provinceFromVN: item.provinceName,
                            provinceFromCode: item.provinceCode,
                          })
                          : setBussinessInput({
                            ...bussinessInput,
                            provinceToVN: item.provinceName,
                            provinceToCode: item.provinceCode,
                          });
                        _bottomSheet.current.hide();
                      }}
                    >
                      <View
                        style={{
                          padding: 12,
                          borderRadius: 20,
                          backgroundColor: appcolor.light,
                        }}
                      >
                        <Text style={{ color: appcolor.dark }}>
                          {item.provinceName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

          {typeDate == TYPE_PEOPLE_INROOM && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PeopleInRoom.map((v, i) => {
                return (
                  <TouchableOpacity
                    key={i + 'llla12'}
                    onPress={() => {
                      setBussinessInput({
                        ...bussinessInput,
                        typePeople: v.name,
                        typePeopleInfo: v,
                      });
                      _bottomSheet.current.hide();
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: appcolor.light,
                        borderRadius: 20,
                        marginEnd: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: appcolor.dark,
                          fontSize: 12,
                          padding: 10,
                        }}
                      >
                        {v.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {(typeDate == TYPE_DATE_FROM || typeDate == TYPE_DATE_TO) && (
            <RenderCalendar
              appcolor={appcolor}
              currentDate={dateSelect}
              handleDisplay={date => handleDateSelect(date)}
            />
          )}
        </View>
      </ActionSheet>
    </View>
  );
};
