import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
  Text,
  FlatList,
} from 'react-native';
import { Badge, Divider, Icon } from '@rneui/themed';
import PagerView from 'react-native-pager-view';
import FormGroup from '../../Content/FormGroup';
import { useSelector } from 'react-redux';
import { CategoryContext } from '../../Controller/CategoryController';
import { scaleSize } from '../../Themes/AppsStyle';
import { NumPad } from '../../Control/NumPad';
import { CategoryControl } from '../../Control/CategoryControl';
export const SellOutInput = React.forwardRef((props, refParent) => {
  const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
  const template = JSON.parse(kpiinfo?.reportItem || '{}');
  const [seleted, setSelected] = useState({});
  useEffect(() => {
    setSelected({});
    return () => false;
  }, []);
  const onSeletedItem = (item, key) => {};
  const DisplayUI = () => {
    let Layout = [];
    for (const [key, item] of Object.entries(template)) {
      switch (key) {
        case 'products':
          Layout.push(
            <View style={{ flex: 1 }}>
              <CategoryControl config={item.list} />
            </View>,
          );
          break;
        case 'quantity':
          Layout.push(
            <View style={{ padding: 7, backgroundColor: appcolor.light }}>
              <View style={{ padding: 12 }}>
                <Text
                  style={{
                    fontWeight: '900',
                    marginBottom: 7,
                    fontSize: scaleSize(16),
                    color: appcolor.dark,
                  }}
                >
                  {item.title}
                </Text>
                <NumPad
                  placeholderText={item.title}
                  value="1"
                  handerNumberChange={e => onSeletedItem(item, e)}
                />
              </View>
              <FlatList
                data={item.list}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => onSeletedItem(item, 'division')}
                      key={'D1' + index}
                      style={{ padding: 3, marginBottom: 7 }}
                    >
                      <View
                        style={{
                          backgroundColor: appcolor.light,
                          borderWidth: appcolor.surface,
                          flexDirection: 'row',
                          borderRadius: 40,
                          borderWidth: 1,
                          padding: 7,
                        }}
                      >
                        <Text style={{ color: appcolor.dark }}>
                          {' '}
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>,
          );
          break;
        case 'price':
          Layout.push(
            <View>
              <Text
                style={{
                  fontWeight: '900',
                  marginBottom: 7,
                  fontSize: scaleSize(16),
                  color: appcolor.dark,
                }}
              >
                {item.title}
              </Text>
            </View>,
          );
          break;
        default:
          Layout.push(
            <View>
              <Text
                style={{
                  fontWeight: '900',
                  marginBottom: 7,
                  fontSize: scaleSize(16),
                  color: appcolor.dark,
                }}
              >
                {item.title}
              </Text>
            </View>,
          );
          break;
      }
    }
    return (
      <PagerView style={{ flex: 1 }} initialPage={0}>
        {Layout}
      </PagerView>
    );
  };
  return (
    <Fragment>
      <SafeAreaView style={{ backgroundColor: appcolor.light }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginEnd: 7,
            marginTop: StatusBar.currentHeight,
          }}
        >
          <Text
            style={{
              textAlignVertical: 'center',
              fontSize: scaleSize(20),
              padding: 7,
            }}
          >
            Nhập doanh số bán hàng
          </Text>
          <TouchableOpacity>
            <SpiralIcon size={28} color={appcolor.dark} name="close" />
          </TouchableOpacity>
        </View>
        <View style={{ height: '92%' }}>{DisplayUI()}</View>
      </SafeAreaView>
    </Fragment>
  );
});
