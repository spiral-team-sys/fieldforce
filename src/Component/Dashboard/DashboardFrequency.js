import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import { Divider } from '@rneui/base';
import { useSelector } from 'react-redux';
import { PercentView } from '../../Control/PercentView';
import { deviceWidth } from '../../Core/Utility';
import {
  GetEmployeeInfo,
  StringTobase64,
  groupDataByKey,
  removeVietnameseTones,
} from '../../Core/Helper';
import WebViewUI from '../../Content/WebViewUI';

export const DashboardFrequency = ({ info, sendNavigate }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [dataView, setDataView] = useState([]);
  const data = info !== null ? JSON.parse(info.chartData) : [];
  const itemFrequency = data[0] || {};
  const [visibleBS, setVisibleBS] = useState(false);
  const [linkResult, setLinkResult] = useState(null);

  const LoadData = async () => {
    const lstAttendant = data[0]?.lstAttendant || [];
    const { arr } = await groupDataByKey({
      arr: lstAttendant.sort((a, b) => {
        return a.DayWorking < b.DayWorking;
      }),
      key: 'EmployeeId',
    });
    await setDataView(arr);
  };
  const LoadResult = async () => {
    const userInfo = await GetEmployeeInfo();
    let shareData = {
      accountId: userInfo.accountId,
      employeeId: itemFrequency.employeeId,
      shopId: shopinfo?.shopId || 0,
      isHistory: 1,
    };
    shareData = StringTobase64(JSON.stringify(shareData));
    await setLinkResult(`${itemFrequency.linkResult}&appShare=${shareData}`);
    await setVisibleBS(true);
  };
  useEffect(() => {
    LoadData();
    return () => false;
  }, [info]);

  return (
    <TouchableOpacity onPress={LoadResult}>
      <View
        style={{
          backgroundColor: appcolor.surface,
          padding: 8,
          borderRadius: 10,
          marginBottom: 8,
        }}
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
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 15,
              color: appcolor.dark,
              paddingBottom: 5,
              textAlign: 'center',
            }}
          >{`Tần suất ghé thăm: ${itemFrequency.Actual}/${
            itemFrequency.Target
          } (${
            itemFrequency.percentValue > 100 ? 100 : itemFrequency.percentValue
          }%)`}</Text>
          <View
            style={{
              backgroundColor: appcolor.light,
              width: '100%',
              height: 5,
              borderRadius: 8,
            }}
          >
            <View
              style={{
                backgroundColor: appcolor.yellowdark,
                width: `${
                  itemFrequency.percentValue > 100
                    ? 100
                    : itemFrequency.percentValue
                }%`,
                height: 5,
                borderRadius: 8,
              }}
            />
          </View>
          <View>
            {dataView.map((item, index) => {
              return (
                <View key={`112_i${index}`}>
                  {item.isParent && (
                    <Text
                      style={{
                        textAlign: 'center',
                        padding: 8,
                        margin: 8,
                        marginTop: 16,
                        color: appcolor.red,
                        fontSize: 14,
                        fontWeight: '700',
                        fontStyle: 'italic',
                        alignSelf: 'center',
                      }}
                    >{`${item.EmployeeCode} - ${item.EmployeeName}`}</Text>
                  )}
                  <View
                    style={{
                      width: '100%',
                      marginTop: 5,
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 8,
                        justifyContent: 'center',
                        backgroundColor: appcolor.helper,
                        padding: 8,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          color: appcolor.light,
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                      >
                        {item.DayWorking}
                      </Text>
                    </View>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: appcolor.dark,
                        fontSize: 13,
                        fontWeight: '600',
                        marginStart: 8,
                      }}
                    >
                      {item.timeWorking}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <Modal animationType="slide" visible={visibleBS}>
          <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
            <WebViewUI
              pageName={info.chartName}
              urlPage={linkResult}
              onClose={() => setVisibleBS(false)}
            />
          </SafeAreaView>
        </Modal>
      </View>
    </TouchableOpacity>
  );
};
