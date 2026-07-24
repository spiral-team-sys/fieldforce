import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  VirtualizedList,
} from 'react-native';
import { Divider } from '@rneui/themed';
import { useSelector } from 'react-redux';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const CustomerCheckList = ({ data, callback, reloadView }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const getItem = (_data, index) => _data[index];
  const [expanded, setExpanded] = useState({});
  const [list, setList] = useState([]);
  useEffect(() => {
    setList(data);
  }, [reloadView]);
  const onCheckItem = (item, index) => {
    var edit = [...list];
    edit = edit.map(a => {
      if (a.groupId == item.groupId) a.selectValue = false;
      return a;
    });
    var rowEdit = { ...item, selectValue: true };
    edit[index] = rowEdit;
    setList(edit);
    callback(edit);
  };

  const CustRow = ({ item, index }) => {
    const isHeader = index == 0 || item.groupId !== list[index - 1].groupId;
    return (
      <View
        key={`a${index}pal2`}
        style={{ padding: 3, flex: 1, backgroundColor: appcolor.light }}
      >
        {isHeader && (
          <TouchableOpacity>
            <View
              style={{
                backgroundColor: appcolor.surface,
                padding: 7,
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: appcolor.dark,
                  fontWeight: 'bold',
                }}
              >
                {item?.groupName || 'no name'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            margin: 3,
          }}
          onPress={() => onCheckItem(item, index)}
        >
          <View
            style={{
              width: '95%',
              flexDirection: 'row',
              justifyContent: 'center',
              borderRadius: 8,
              alignItems: 'center',
              padding: 5,
              backgroundColor: item.selectValue
                ? appcolor.primary
                : appcolor.light,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                flexGrow: 1,
                padding: 3,
                color: item.selectValue ? appcolor.white : appcolor.dark,
              }}
            >
              {item?.name}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderWidth: 1,
            borderColor: appcolor.surface,
            width: '100%',
          }}
        />
      </View>
    );
  };
  const handleExpanded = (showState, hideState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    expanded[showState] = expanded[showState] === true ? false : true;
    expanded[hideState] = false;
  };
  return (
    <View key={'ViewCustCheck'}>
      <Text style={{ color: appcolor.dark, padding: 7, fontWeight: '900' }}>
        Thông tin mua hàng
      </Text>
      <VirtualizedList
        key={'listCustCheck'}
        data={list}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        initialNumToRender={9}
        renderItem={({ item, index }) => (
          <CustRow key={'itemCheck_' + index} item={item} index={index} />
        )}
        keyExtractor={(_, index) => {
          `23${index}da2`;
        }}
        getItem={getItem}
        getItemCount={() => list?.length || 0}
      />
    </View>
  );
};
