import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Text, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { DEFAULT_COLOR } from '../Core/URLs';
import { HeaderCustom } from './HeaderCustom';
import PageHeader from './PageHeader';

const styles = StyleSheet.create({
  line: {
    width: '100%',
    height: 0.6,
    backgroundColor: '#e9e9e9',
    paddingStart: 10,
    paddingEnd: 10,
    marginBottom: 4,
    marginTop: 4,
  },
});

export const ChartDetail = ({ navigation, route }) => {
  const [Detail, setDetail] = useState([]);
  const [titlePage, setTitlePage] = useState([]);
  const { appcolor } = useSelector(state => state.GAppState);
  useEffect(() => {
    setDetail(route.params.Detail);
    setTitlePage(route.params.titlePage);
  }, []);

  const renderItem = ({ item, index }) => {
    const lstKey = Object.keys(item);
    let lengthKey =
      item.HighLight !== null && item.HighLight !== undefined
        ? lstKey.length - 1
        : lstKey.length;
    return (
      <View
        key={'92jddada_' + index}
        style={{ backgroundColor: appcolor.light }}
      >
        <View style={{ width: '100%' }}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
              alignItems: 'center',
              backgroundColor: index === 0 && appcolor.info,
              padding: 7,
            }}
          >
            {index === 0 &&
              lstKey.map(
                (itemK, indexk) =>
                  itemK !== 'HighLight' && (
                    <Text
                      lineBreakMode={'clip'}
                      numberOfLines={3}
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: appcolor.dark,
                        borderColor: '#fff',
                        paddingTop: 5,
                        paddingBottom: 5,
                        width:
                          indexk === 0
                            ? Dimensions.get('window').width / 2.7
                            : Dimensions.get('window').width /
                              (1.5 * (lengthKey - 1)),
                        color: index === 0 && '#fff',
                        textAlign: 'center',
                      }}
                    >
                      {itemK}
                    </Text>
                  ),
              )}
          </View>
        </View>
        <View style={{ height: 40, width: '100%', paddingLeft: 15, top: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor:
                item.HighLight !== undefined &&
                item.HighLight !== null &&
                item.HighLight !== ''
                  ? item.HighLight
                  : null,
            }}
          >
            {lstKey.map(
              (itemK, indexk) =>
                itemK !== 'HighLight' && (
                  <Text
                    lineBreakMode={'clip'}
                    numberOfLines={3}
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: appcolor.dark,
                      width:
                        indexk === 0
                          ? Dimensions.get('window').width / 2.7
                          : Dimensions.get('window').width /
                            (1.5 * (lengthKey - 1)),
                      textAlign: indexk === 0 ? 'left' : 'center',
                    }}
                  >
                    {item[itemK]}
                  </Text>
                ),
            )}
          </View>
          <View
            style={{
              ...styles.line,
              height: 0.4,
              backgroundColor: 'lightgray',
              marginLeft: 30,
            }}
          ></View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ width: '100%', backgroundColor: appcolor.surface }}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title={'Chi tiết' + titlePage !== undefined ? titlePage : ''}
      />
      <FlatList
        keyExtractor={item => item.id}
        data={Detail}
        style={{ height: '98%' }}
        renderItem={renderItem}
        numColumns={1}
      />
    </View>
  );
};
