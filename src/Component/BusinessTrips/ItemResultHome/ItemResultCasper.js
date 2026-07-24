import moment from 'moment';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../../Content/FormGroup';
import { NumberFormatView } from '../../../Control/NumberFormatView';
import { formatNumber } from '../../../Core/Helper';
import { alertWarning } from '../../../Core/Utility';
import { ACTION_UPLOAD } from '../UtilityBusiness';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

export const ItemResultCasper = ({
  item,
  index,
  handlerDeleteTrip,
  handlerConfirmTrip,
  handlerEditTrips,
  styles,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const listProvinceWork = JSON.parse(item.provinceList) || [];
  const provincePlan = `${item.provinceFromVN} - ${item.provinceToVN}`;
  const datePlan = `Từ ${moment(item.fromDate.toString()).format(
    'DD/MM/YY',
  )} - Đến ${moment(item.toDate.toString()).format('DD/MM/YY')}`;

  const typeKM = (item.typeKM && `Số KM ${item.typeKM}`) || null;
  const typePeople = (item.typePeople && item.typePeople) || null;
  const supportKM = `Chi phí di chuyển ${item.supportKM > 0 ? formatNumber(item.supportKM, ',') : 0
    } VNĐ`;
  const supportVehicalOther = `Chi phí di chuyển khác ${item.supportVehicalOther > 0
      ? formatNumber(item.supportVehicalOther, ',')
      : 0
    } VNĐ`;
  const supportNight = `Chi phí khách sạn ${item.supportNight > 0 ? formatNumber(item.supportNight, ',') : 0
    } VNĐ`;
  const supportLunchAndDinner = `Ăn uống ${item.supportLunch > 0 ? formatNumber(item.supportLunch || 0, ',') : 0
    } VNĐ`;

  const onChangeText = text => {
    item.confirmNote = text;
  };
  const onDeleteItem = () => {
    if (item.isNotePlan == 1) {
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
            {listProvinceWork.map((item, index) => {
              return (
                <Text key={`iib_${index}`} style={styles.titleView}>
                  {`${index > 0 ? ' -' : ''} ${item.provinceName} (${item.numberDay
                    })`}
                </Text>
              );
            })}
          </ScrollView>
        ) : (
          <ItemView
            styleView={{ ...styles.titleView, width: '92%' }}
            value={provincePlan}
            iconName="plane-departure"
          />
        )}
        <ItemView
          styleView={styles.contentView}
          value={datePlan}
          iconName="calendar-alt"
        />
        {typeKM !== null && (
          <ItemView
            styleView={styles.contentView}
            value={typeKM}
            iconName="road"
          />
        )}
        <ItemView
          styleView={styles.contentView}
          value={supportKM}
          iconName="road"
        />
        <ItemView
          styleView={styles.contentView}
          value={supportVehicalOther}
          iconName="road"
        />
        {typePeople !== null && (
          <ItemView
            styleView={styles.contentView}
            value={typePeople}
            iconName="hotel"
          />
        )}
        <ItemView
          styleView={styles.contentView}
          value={supportNight}
          iconName="hotel"
        />
        <ItemView
          styleView={styles.contentView}
          value={supportLunchAndDinner}
          iconName="utensils"
        />
        {item.note !== null && (
          <ItemView
            styleView={styles.contentView}
            value={`Ghi chú: ${item.note}`}
            iconName="comment-alt"
          />
        )}
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
      </View>
      {item.isNotePlan == 1 && (
        <FormGroup
          editable
          placeholder="Nhập lí do (Nếu có)"
          inputStyle={{ padding: 3, fontSize: 13 }}
          defaultValue={item.confirmPlan}
          title="Ghi chú"
          handleChangeForm={onChangeText}
        />
      )}
      <View
        style={{ flexDirection: 'row', alignSelf: 'flex-end', paddingEnd: 8 }}
      >
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
      </View>
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
