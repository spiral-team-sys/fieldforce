import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import { Divider } from '@rneui/base';
import { useSelector } from 'react-redux';
import { groupDataByKey } from '../../Core/Helper';

export const DashboardSellOut = ({ info, sendNavigate }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  let viewAll = [];
  const data = info !== null ? JSON.parse(info.chartData) : [];
  if (Array.isArray(data) && data.length > 0) {
    const isShowSubCate = data[0]?.isShowSubCate || 0;
    if (isShowSubCate == 1) {
      const { arr } = groupDataByKey({
        arr: data,
        key: 'RGroup',
      });
      viewAll.push(
        <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              width: '20%',
              alignItems: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          ></Text>
          <Text
            style={{
              width: '30%',
              textAlign: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          >
            Chỉ tiêu
          </Text>
          <Text
            style={{
              width: '30%',
              textAlign: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          >
            Thực tế
          </Text>
          <Text
            style={{
              width: '20%',
              textAlign: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          >
            Tỷ lệ (%)
          </Text>
        </View>,
      );
      viewAll.push(
        <Divider
          key="313a"
          style={{
            backgroundColor: appcolor.grayLight,
            height: 1,
            width: '100%',
          }}
        />,
      );
      arr.forEach((item, index) => {
        viewAll.push(
          <View key={'item_' + index} style={{}}>
            {item.isParent &&
              item.RGroup !== null &&
              item.RGroup?.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                >
                  <View style={{ width: '20%' }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: appcolor.primary,
                      }}
                    >
                      {item.RGroup}
                    </Text>
                  </View>
                  <View style={{ width: '30%', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 13,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: appcolor.primary,
                      }}
                    >
                      {item.totalTargetByCate}
                    </Text>
                  </View>
                  <View style={{ width: '30%', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 13,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: appcolor.primary,
                      }}
                    >
                      {item.totalActualByCate}
                    </Text>
                  </View>
                  <View style={{ width: '20%' }}>
                    <Text
                      style={{
                        fontSize: 13,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: appcolor.primary,
                      }}
                    >
                      {item.totalPercentByCate}
                    </Text>
                  </View>
                </View>
              )}

            <View
              key={index.toString()}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{ width: '20%' }}>
                <Text
                  style={{
                    paddingLeft: 12,
                    fontSize: 15,
                    color: appcolor.dark,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  {item.RTime}
                </Text>
              </View>
              <View style={{ width: '30%', alignItems: 'center' }}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 14,
                    color: appcolor.tomato,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  {item.Target || 0}
                </Text>
              </View>
              <View style={{ width: '30%', alignItems: 'center' }}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 14,
                    color: appcolor.second,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  {item.Actual || 0}
                </Text>
              </View>
              <View style={{ width: '20%' }}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 14,
                    color: appcolor.secondary,
                    textAlign: 'center',
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  {item.Percent}
                </Text>
              </View>
            </View>
          </View>,
        );
      });
    } else {
      // isShowSubCate
      viewAll.push(
        <View key="e92" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              width: '20%',
              alignItems: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          ></Text>
          <Text
            style={{
              width: '30%',
              textAlign: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          >
            Chỉ tiêu
          </Text>
          <Text
            style={{
              width: '30%',
              textAlign: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          >
            Đã đạt
          </Text>
          <Text
            style={{
              width: '20%',
              textAlign: 'center',
              color: appcolor.dark,
              fontWeight: '500',
              paddingBottom: 8,
            }}
          >
            Tỷ lệ (%)
          </Text>
        </View>,
      );
      viewAll.push(
        <Divider
          key="313a"
          style={{
            backgroundColor: appcolor.grayLight,
            height: 1,
            width: '100%',
          }}
        />,
      );
      data.forEach((item, index) => {
        viewAll.push(
          <View
            key={index.toString()}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{ width: '20%' }}>
              <Text
                style={{
                  fontSize: 15,
                  color: appcolor.dark,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                {item.RTime}
              </Text>
            </View>
            <View style={{ width: '30%', alignItems: 'center' }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                  color: appcolor.tomato,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                {item.Target}
              </Text>
            </View>
            <View style={{ width: '30%', alignItems: 'center' }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                  color: appcolor.second,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                {item.Actual}
              </Text>
            </View>
            <View style={{ width: '20%' }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                  color: appcolor.secondary,
                  textAlign: 'center',
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                {item.Percent}
              </Text>
            </View>
          </View>,
        );
        viewAll.push(
          <Divider
            key={'so' + index.toString()}
            style={{
              backgroundColor: appcolor.grayLight,
              height: 1,
              width: '100%',
            }}
          />,
        );
      });
    }
  } else {
    viewAll.push(
      <Text
        key="s1oi"
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 15,
          color: appcolor.danger,
        }}
      >
        Chưa có dữ liệu doanh số
      </Text>,
    );
  }
  const onViewDetail = () => {
    sendNavigate.navigate('dashboardDetail', {
      detailDashboard: info,
      listMonth: info.listMonth,
      titlePage: 'Chi tiết',
    });
  };
  return (
    <TouchableOpacity
      style={{
        backgroundColor: appcolor.surface,
        padding: 8,
        borderRadius: 10,
        marginBottom: 8,
      }}
      onPress={onViewDetail}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SpiralIcon
          type="font-awesome-6"
          color={appcolor.info}
          name="chart-bar"
          size={23}
        />
        <Text
          style={{
            marginEnd: 8,
            color: appcolor.dark,
            marginStart: 8,
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          {' '}
          {info !== null ? info.chartName : ''}
        </Text>
      </View>
      <View style={{ marginTop: 16 }}>{viewAll}</View>
    </TouchableOpacity>
  );
};
