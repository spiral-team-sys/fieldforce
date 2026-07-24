import moment from 'moment';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { NumberFormatView } from '../../../Control/NumberFormatView';
import { formatNumber } from '../../../Core/Helper';
import { AppNameBuild, casperApp } from '../../../Core/URLs';
import { alertWarning, deviceHeight, deviceWidth } from '../../../Core/Utility';
import { ACTION_UPLOAD } from '../UtilityBusiness';
import { ModalNotify } from '../../../Control/ModalNotify';
import LottieView from 'lottie-react-native';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const ItemResultDefault = ({
  item,
  index,
  handlerDeleteTrip,
  handlerConfirmTrip,
  handlerEditTrips,
  handlerUploadDocument,
  handlerReConfirmTrip,
  handlerCopyTrip,
  styles,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [isVisible, setVisible] = useState(false);
  const [messager, setMessager] = useState('');
  const listProvinceWork = JSON.parse(item?.provinceList || '[]');
  const provincePlan = `${item.provinceFromVN}${!item.districtFromVN ? '' : `(${item.districtFromVN})`
    } - ${item.provinceToVN}${!item.districtTo ? '' : `(${item.districtTo})`}`;
  const datePlan = `Từ ${moment(item.fromDate.toString()).format(
    'DD/MM/YY',
  )} - Đến ${moment(item.toDate.toString()).format('DD/MM/YY')}`;
  const daysMove = `Ngày di chuyển ${item.days || 0
    } Ngày - Thành tiền ${formatNumber(item.days * 250000, ',')} VNĐ`;
  const supportKM = `Chi phí di chuyển ${item.supportKM > 0 ? formatNumber(item.supportKM, ',') : 0
    } VNĐ`;
  const supportVehicalOther = `Chi phí di chuyển khác ${item.supportVehicalOther > 0
      ? formatNumber(item.supportVehicalOther, ',')
      : 0
    } VNĐ`;
  const supportNight = `Nghỉ qua đêm ${item.supportNight > 0 ? formatNumber(item.supportNight, ',') : 0
    } VNĐ`;
  const supportLunch = `Ăn trưa ${item.supportLunch > 0 ? formatNumber(item.supportLunch || 0, ',') : 0
    } VNĐ`;
  const supportDinner = `Ăn tối ${item.supportDinner > 0 ? formatNumber(item.supportDinner || 0, ',') : 0
    } VNĐ`;
  const supportOther = `Chi phí khác ${item.supportOther > 0 ? formatNumber(item.supportOther || 0, ',') : 0
    } VNĐ`;
  const supportLunchAndDinner = `Ăn uống ${item.supportLunch > 0 ? formatNumber(item.supportLunch || 0, ',') : 0
    } VNĐ`;
  const tripReplaceDetail = JSON.parse(item.tripReplaceDetail || '[]');

  const onChangeText = text => {
    item.confirmNote = text;
  };
  const onDeleteItem = () => {
    if (item.isNotePlan == 1 && item.disableNote !== 1) {
      if (item.confirmNote == null || item.confirmNote.length < 5) {
        alertWarning(
          `Vui lòng nhập lí do hủy chuyến ${provincePlan} ${datePlan}`,
        );
        return;
      }
    }
    handlerDeleteTrip(item);
  };
  const onEditItem = () => {
    handlerEditTrips(item);
  };
  const onConfirmTrips = () => {
    handlerConfirmTrip(item, ACTION_UPLOAD.APPROVED);
  };
  const onUploadDocument = () => {
    handlerUploadDocument(item);
  };
  const onReConfirm = () => {
    handlerReConfirmTrip(item);
  };
  const onCopyTrip = () => {
    handlerCopyTrip && handlerCopyTrip(item);
  };
  const handleVisibleModal = async visible => {
    await setVisible(visible);
  };
  const onPressDetailReplace = async () => {
    let pointUI = [];

    for (let index = 0; index < tripReplaceDetail.length; index++) {
      const element = tripReplaceDetail[index];
      const dataProvinceList = JSON.parse(element?.provinceList || '[]');
      pointUI.push(
        <View
          key={'ViewPoint_' + element.workingScheduleId}
          style={{
            borderRadius: 8,
            backgroundColor: appcolor.surface,
            padding: 4,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'column' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SpiralIcon
                  type="font-awesome-5"
                  name={'plane-departure'}
                  size={14}
                  color={appcolor.dark}
                  style={{ width: 30, padding: 4 }}
                />
                {dataProvinceList.length > 0 && (
                  <ScrollView
                    contentContainerStyle={{ padding: 5 }}
                    style={{ alignSelf: 'center', width: '100%' }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {dataProvinceList.map((itemP, indexP) => {
                      return (
                        <Text
                          key={`iib_${indexP}`}
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: appcolor.dark,
                          }}
                        >
                          {`${indexP > 0 ? ' -' : ''} ${itemP.provinceName} (${itemP.numberDay
                            })`}
                        </Text>
                      );
                    })}
                    <View style={{ width: deviceWidth / 3 }}></View>
                  </ScrollView>
                )}
                {dataProvinceList.length == 0 && (
                  <Text
                    key={`itemTripName`}
                    style={{
                      fontWeight: '600',
                      fontSize: 14,
                      color: appcolor.dark,
                      paddingBottom: 4,
                    }}
                  >
                    {`${element.provinceFromVN} - (${element.provinceToVN})`}
                  </Text>
                )}
              </View>
              {element?.fromDate && (
                <Text
                  key={`itemTripDate`}
                  style={{
                    fontWeight: '600',
                    fontSize: 14,
                    color: appcolor.dark,
                    paddingBottom: 4,
                  }}
                >
                  {`Từ ${moment(element?.fromDate?.toString()).format(
                    'DD/MM/YY',
                  )} - Đến ${moment(element.toDate.toString()).format(
                    'DD/MM/YY',
                  )}`}
                </Text>
              )}
            </View>
            {item.confirmReplace === 1 && (
              <LottieView
                style={{ width: 25, height: 25 }}
                source={require('../../../Themes/Images/check-mark-success.json')}
                autoPlay
                loop={false}
              />
            )}
          </View>
        </View>,
      );
    }
    await setMessager(
      <View style={{ height: deviceHeight * 0.3, width: deviceWidth * 0.8 }}>
        <ScrollView style={{ flex: 1 }}>{pointUI}</ScrollView>
      </View>,
    );
    await handleVisibleModal(true);
  };

  return (
    <View
      key={`int_${index}`}
      style={{
        width: '100%',
        paddingStart: 5,
        paddingEnd: 5,
        alignSelf: 'center',
      }}
    >
      <View style={styles.itemTrips}>
        {listProvinceWork.length > 0 ? (
          <ScrollView
            contentContainerStyle={{ padding: 5 }}
            style={{ alignSelf: 'center', width: '100%' }}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
          >
            {listProvinceWork.map((itemP, indexP) => {
              return (
                <Text key={`iib_${indexP}`} style={styles.titleView}>
                  {`${indexP > 0 ? ' -' : ''} ${itemP.provinceName}${!itemP.district ? '' : `(${itemP.district})`
                    } (${itemP.numberDay})`}
                </Text>
              );
            })}
          </ScrollView>
        ) : (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingHorizontal: 5,
            }}
          >
            <SpiralIcon
              type="font-awesome-5"
              name="plane-departure"
              size={14}
              color={appcolor.dark}
              style={{ width: 30, paddingTop: 5 }}
            />
            <Text style={{ ...styles.titleView, flex: 1, paddingTop: 2 }}>
              {provincePlan}
            </Text>
            {handlerCopyTrip && (
              <TouchableOpacity
                onPress={onCopyTrip}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  backgroundColor: appcolor.info,
                  borderRadius: 16,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  marginStart: 8,
                }}
              >
                <SpiralIcon
                  name="copy"
                  type="font-awesome-5"
                  color={appcolor.light}
                  size={11}
                />
                <Text
                  style={{
                    color: appcolor.light,
                    fontSize: 12,
                    fontWeight: '700',
                    marginStart: 6,
                  }}
                >
                  Copy
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <ItemView
          styleView={styles.contentView}
          value={datePlan}
          iconName="calendar-alt"
        />
        {item.days !== null && item.days > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={daysMove}
            iconName="road"
          />
        )}
        {item.supportKM !== null && item.supportKM > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={supportKM}
            iconName="road"
          />
        )}
        {item.supportVehicalOther !== null && item.supportVehicalOther > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={supportVehicalOther}
            iconName="road"
          />
        )}
        {item.supportNight !== null && item.supportNight > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={supportNight}
            iconName="hotel"
          />
        )}
        {item.supportLunch !== null && item.supportLunch > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={supportLunch}
            iconName="utensils"
          />
        )}
        {item.supportDinner !== null && item.supportDinner > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={supportDinner}
            iconName="utensils"
          />
        )}
        {item.supportOther !== null && item.supportOther > 0 && (
          <ItemView
            styleView={styles.contentView}
            value={supportOther}
            iconName="money-bill"
          />
        )}
        {item.note !== null && (
          <ItemView
            styleView={styles.contentView}
            value={`Ghi chú: ${item.note}`}
            iconName="comment-alt"
          />
        )}
        {/* {item.confirmNote !== null && <ItemView styleView={styles.contentView} value={`Quản lí ghi chú: ${item.confirmNote}`} iconName='comment-alt' />} */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'right',
            end: 3,
            color: appcolor.info,
          }}
        >
          Tổng chi phí: {<NumberFormatView value={item.totalSupport} />}
        </Text>
        {tripReplaceDetail?.length > 0 && (
          <TouchableOpacity
            onPress={() => onPressDetailReplace()}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: appcolor.primary,
              borderRadius: 50,
              padding: 8,
              zIndex: 10000,
            }}
          >
            <SpiralIcon
              type="font-awesome-5"
              name={'exchange-alt'}
              size={14}
              color={appcolor.white}
              style={{ width: 30, padding: 5 }}
            />
          </TouchableOpacity>
        )}
      </View>
      {item.isNotePlan == 1 && (
        <FormGroup
          editable={item.disableNote == 1 ? false : true}
          placeholder="Nhập lí do (Nếu có)"
          inputStyle={{ padding: 3, fontSize: 13 }}
          defaultValue={item.confirmNote}
          title="Ghi chú"
          handleChangeForm={onChangeText}
        />
      )}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingEnd: 8,
        }}
      >
        {item.isDocument == 1 && (
          <View style={{ flexDirection: 'row' }}>
            <ActionPress
              title="Chứng từ"
              type={ACTION_UPLOAD.DOCUMENT}
              colorAction={appcolor.bluesky}
              itemAction={item}
              onPress={onUploadDocument}
            />
          </View>
        )}
        <View style={{ flexDirection: 'row', end: 0 }}>
          {item.isConfirm == 1 && (
            <ActionPress
              title="Xác nhận"
              type={ACTION_UPLOAD.APPROVED}
              colorAction={appcolor.success}
              itemAction={item}
              onPress={onConfirmTrips}
            />
          )}
          {item.isUpdate == 1 && (
            <ActionPress
              title="Cập nhật"
              type={ACTION_UPLOAD.UPDATE}
              colorAction={appcolor.yellow}
              itemAction={item}
              onPress={onEditItem}
            />
          )}
          {item.isDelete == 1 && (
            <ActionPress
              title="Xoá"
              type={ACTION_UPLOAD.DELETE}
              colorAction={appcolor.red}
              itemAction={item}
              onPress={onDeleteItem}
            />
          )}
          {item.isReConfirm == 1 && (
            <ActionPress
              title="Xác nhận lại"
              type={ACTION_UPLOAD.RECONFIRM}
              colorAction={appcolor.tomato}
              itemAction={item}
              onPress={onReConfirm}
            />
          )}
        </View>
      </View>
      {isVisible && (
        <ModalNotify
          messager={messager}
          visible={isVisible}
          titleConfirm={'Đóng'}
          handleVisibleModal={handleVisibleModal}
        />
      )}
    </View>
  );
};

const ItemView = ({ value, iconName, styleView }) => {
  const appcolor = useSelector(state => state.GAppState);
  return (
    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
      <SpiralIcon
        type="font-awesome-5"
        name={iconName}
        size={14}
        color={appcolor.dark}
        style={{ width: 30, padding: 5 }}
      />
      <Text style={styleView}>{value}</Text>
    </View>
  );
};
const ActionPress = ({ type, title, onPress, colorAction, itemAction }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const actionItem = () => {
    onPress(itemAction, type);
  };
  return (
    <TouchableOpacity
      style={{
        margin: 3,
        padding: 8,
        backgroundColor: colorAction,
        borderRadius: 3,
      }}
      onPress={actionItem}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: appcolor.light }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
