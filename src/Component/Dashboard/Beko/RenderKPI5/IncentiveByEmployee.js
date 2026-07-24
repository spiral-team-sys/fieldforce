import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { FlashList } from '@shopify/flash-list';
import { Icon } from '@rneui/base';
import { scaleSize } from '../../../../Themes/AppsStyle';
import { isIphoneX } from '../../../../Core/is-iphone-x';
import { ViewListStoreKPI } from './ViewListStoreKPI';
import { formatNumber } from '../../../../Core/Helper';
import SpiralIcon from '../../../../Control/Icon/SpiralIcon';

const HEADER_SIZE = Platform.OS == 'android' ? 10 : isIphoneX() ? 50 : 20;

export const IncentiveByEmployee = ({ dataKPI }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [data, setData] = useState({ dataEmployees: [] });
  const [_mutate, setMutate] = useState(false);
  const [dataModal, setDataModal] = useState({
    isVisible: false,
    dataGroup: {},
    itemView: {},
  });

  const loadData = () => {
    const dataEmployee = _.uniqBy(dataKPI, 'employeeId');

    data.dataEmployees = dataEmployee;
    data.dataKPI = dataKPI;
    setMutate(e => !e);
  };
  useEffect(() => {
    const _load = loadData();
    return () => _load;
  }, []);

  const onClose = () => {
    setDataModal({ isVisible: false, itemSelect: {}, itemView: {} });
  };
  const handlePressItemView = (itemView, dataGroup) => {
    setDataModal({ isVisible: true, dataGroup: dataGroup, itemView: itemView });
  };

  const renderItem = ({ item, index }) => {
    const dataFilter = _.filter(data.dataKPI, e => {
      return e.employeeId == item.employeeId;
    });
    return (
      <View
        style={{
          padding: 8,
          marginVertical: 4,
          marginHorizontal: 8,
          borderRadius: 8,
          shadowOpacity: 0.5,
          elevation: 3,
          backgroundColor: appcolor.light,
          shadowColor: appcolor.dark,
          shadowOffset: { width: 3, height: 0 },
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SpiralIcon
            color={appcolor.primary}
            type="font-awesome-5"
            name="user"
            size={18}
          />
          <Text
            style={{
              fontWeight: '600',
              fontSize: 14,
              color: appcolor.dark,
              paddingLeft: 8,
            }}
          >
            {item.employeeName} - {item.employeeCode}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          {item.pG_Type && (
            <Text
              style={{
                marginEnd: 5,
                color: appcolor.placeholderText,
                marginStart: 5,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Type : {item.pG_Type}
            </Text>
          )}
        </View>
        {dataFilter.map((it, idx) => {
          return (
            <View
              key={`${item.employeeId}_${it.shopId}_${it.isFinal}_${idx}`}
              style={{ paddingVertical: 4 }}
            >
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 4,
                }}
              >
                <SpiralIcon
                  color={appcolor.primary}
                  type="font-awesome-5"
                  name="store-alt"
                  size={18}
                />
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 14,
                    color: appcolor.dark,
                    paddingLeft: 8,
                  }}
                >
                  {it.shopName} - {it.shopCode}
                  {
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 14,
                        color: appcolor.info,
                      }}
                    >
                      {it.isFinal == 1 ? ' - Verify' : ''}
                    </Text>
                  }
                </Text>
              </View>
              <View style={{ width: '100%' }}>
                <ViewItemMain
                  itemView={it}
                  handlePressItemView={handlePressItemView}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      {data.dataEmployees?.length > 0 && (
        <FlashList
          key={`ListItem`}
          keyExtractor={(it, _index) => it.employeeId.toString()}
          data={data.dataEmployees}
          extraData={[data.dataEmployees]}
          renderItem={renderItem}
          estimatedItemSize={100}
          getItemLayout={(_data, idx) => ({
            length: _data.length,
            offset: 100 * idx,
            idx,
          })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        />
      )}

      <Modal
        visible={dataModal.isVisible}
        style={{ flex: 1 }}
        animationType="fade"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              backgroundColor: appcolor.primary,
              padding: 5,
              alignItems: 'center',
              paddingTop: HEADER_SIZE,
            }}
          >
            <TouchableOpacity
              onPress={() => onClose()}
              style={{
                padding: 10,
                paddingRight: 15,
                borderRadius: 20,
                width: '15%',
              }}
            >
              <SpiralIcon
                name={'times'}
                type={'font-awesome-5'}
                size={scaleSize(23)}
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
              {dataModal.itemView?.employeeName || 'Incentive nhân viên'}
            </Text>
            <View
              style={{
                padding: 10,
                paddingRight: 15,
                borderRadius: 20,
                width: '15%',
              }}
            ></View>
          </View>
          <View style={{ flex: 1 }}>
            <ViewListStoreKPI dataModal={dataModal} />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const ViewItemMain = ({ itemView, handlePressItemView }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState(
    JSON.parse(itemView.mainGroup || '[]'),
  );

  const onPressItem = (it, dataGroup) => {
    handlePressItemView(itemView, dataGroup);
  };
  return (
    <View
      style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}
    >
      {dataMain?.map((it, idx) => {
        const dataGroup = it.group;
        return (
          <TouchableOpacity
            key={`${itemView.employeeId}_${itemView.shopId}_${it.fieldMain}_${idx}`}
            onPress={() => onPressItem(it, dataGroup)}
            style={{
              backgroundColor: appcolor.surface,
              marginRight: 2,
              flex: 1,
              padding: 2,
              borderRadius: 12,
            }}
          >
            <View style={{ backgroundColor: appcolor.light, borderRadius: 12 }}>
              <Text
                style={{
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: 14,
                  color: appcolor.dark,
                  padding: 2,
                }}
              >
                {it.title}
              </Text>
            </View>
            <Text
              style={{
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 14,
                color: appcolor.dark,
                padding: 2,
              }}
            >
              {itemView[it.fieldMain] == 0
                ? 0
                : formatNumber(itemView[it.fieldMain], ',')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
