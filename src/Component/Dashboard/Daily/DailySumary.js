import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { scaleSize } from '../../../Themes/AppsStyle';
import { GetDailySummary } from '../../../Controller/DashboardController';
import { colorList } from '../../../Core/Helper';
import moment from 'moment';
import LoadingDefault from '../../../Control/ItemLoading/LoadingDefault';
export const DailySummary = ({ isLoading }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [table, setTable] = useState([]);
  const [table1, setTable1] = useState([]);
  const onLoadData = async () => {
    const result = await GetDailySummary();
    await setTable(result.table || []);
    await setTable1(result.table1 || []);
  };
  useEffect(() => {
    onLoadData();
    return () => false;
  }, [isLoading]);
  if (isLoading) return <LoadingDefault isLoading={isLoading} />;
  return (
    <>
      <Text
        style={{
          marginLeft: 12,
          color: appcolor.dark,
          padding: 7,
          fontWeight: 'bold',
        }}
      >
        Kế hoạch & Chấm công {moment().format('dddd DD MMMM')}
      </Text>
      <TouchableOpacity
        style={{
          marginLeft: 7,
          marginRight: 7,
          backgroundColor: colorList[8],
          padding: 12,
          borderRadius: 12,
        }}
      >
        {table?.map((v, i) => {
          return (
            <View key={'wo_' + i}>
              <View
                style={{
                  flexGrow: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 7,
                }}
              >
                <Text
                  style={{
                    color: appcolor.white,
                    fontSize: scaleSize(18),
                    width: '70%',
                  }}
                >
                  {v.title}
                </Text>
                <View style={{ padding: 3, flexGrow: 1, borderRadius: 20 }}>
                  <Text
                    style={{
                      textAlign: 'right',
                      fontSize: scaleSize(20),
                      color: appcolor.white,
                    }}
                  >
                    {v.v2 !== null ? v.v2 + ' |' : ''} {v.v1 || 0}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        <View
          style={{
            position: 'absolute',
            width: '54%',
            height: '130%',
            opacity: 0.3,
            borderBottomRightRadius: 500,
            borderTopRightRadius: 439,
            borderRightColor: appcolor.grey,
            borderRightWidth: 2,
            backgroundColor: appcolor.white,
          }}
        />
      </TouchableOpacity>

      <Text
        style={{
          marginLeft: 12,
          color: appcolor.dark,
          padding: 7,
          fontWeight: 'bold',
        }}
      >
        Số liệu báo cáo
      </Text>
      <TouchableOpacity
        style={{
          alignItems: 'center',
          marginLeft: 7,
          marginRight: 7,
          backgroundColor: appcolor.warning,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 7,
          }}
        >
          <Text
            style={{
              textAlign: 'left',
              flexGrow: 1,
              color: appcolor.black,
              fontSize: scaleSize(11),
            }}
          >
            Số báo cáo
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: appcolor.black,
              fontSize: scaleSize(11),
            }}
          >
            báo cáo
          </Text>
          <Text
            style={{
              textAlign: 'right',
              flexGrow: 1,
              color: appcolor.black,
              fontSize: scaleSize(11),
            }}
          >
            {' '}
            Số Nhân viên
          </Text>
        </View>
        {table1.map((v, i) => {
          return (
            <View key={'hm_' + i}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'right',
                      flexGrow: 2,
                      color: appcolor.dark,
                      fontSize: scaleSize(28),
                    }}
                  >
                    {v.v1} -----{' '}
                  </Text>
                  <View
                    style={{
                      flexGrow: 1,
                      padding: 12,
                      borderBottomWidth: 2.6,
                      borderRadius: 30,
                      borderLeftWidth: 0.8,
                      borderRightWidth: 0.8,
                      borderColor: appcolor.dark,
                      borderTopWidth: 0,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: scaleSize(12),
                        fontWeight: 'bold',
                        color: appcolor.black,
                      }}
                    >
                      {v.title}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flexGrow: 2,
                      color: appcolor.dark,
                      fontSize: scaleSize(28),
                    }}
                  >
                    {' '}
                    ----- {v.v2}
                  </Text>
                </View>
                {i < table1.length - 1 && (
                  <View
                    style={{
                      height: 32,
                      width: 3.5,
                      backgroundColor: appcolor.dark,
                    }}
                  />
                )}
              </View>
            </View>
          );
        })}
        <View
          style={{
            position: 'absolute',
            width: '54%',
            height: '125%',
            alignSelf: 'flex-end',
            opacity: 0.3,
            borderTopLeftRadius: 500,
            borderBottomLeftRadius: 439,
            borderLeftColor: appcolor.grey,
            borderLeftWidth: 2,
            backgroundColor: appcolor.white,
          }}
        />
      </TouchableOpacity>
    </>
  );
};
