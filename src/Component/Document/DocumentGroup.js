import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { GetListDocument } from '../../Controller/DocumentController';
import SpiralIcon from '../../Control/Icon/SpiralIcon';
import { deviceWidth } from '../../Themes/AppsStyle';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';

export const DocumentGroup = ({ navigation }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [group, setGroup] = useState([]);
  const loadGroup = async () => {
    await GetListDocument(async data => {
      await setGroup(data);
    });
  };
  const onSelected = item => {
    if (item.ref_Name == 'Video') {
      navigation.navigate('video', {
        titlePage: item.groupName,
        documentData: JSON.parse(item.detailDocument),
        formType: 'DOCUMENT',
      });
    } else {
      navigation.navigate('documentlist', {
        titlePage: item.groupName,
        documentData: JSON.parse(item.detailDocument),
      });
    }
  };
  const styles = StyleSheet.create({
    itemGroup: {
      backgroundColor: appcolor.homebackground,
      borderRadius: 8,
      borderColor: appcolor.dark,
      margin: 8,
      padding: 8,
      width: deviceWidth / 3 - 20,
      height: deviceWidth / 4,
      alignItems: 'center',
      justifyContent: 'space-around',
    },
  });
  useEffect(() => {
    loadGroup();
  }, []);
  const renderItem = ({ item, index }) => {
    const onSelectItem = () => {
      onSelected(item);
    };
    return (
      <TouchableOpacity
        onPress={onSelectItem}
        style={styles.itemGroup}
        key={index}
      >
        <SpiralIcon
          type="font-awesome-6"
          color={appcolor.primary}
          size={36}
          name="folder-open"
          solid
        />
        <Text
          style={{
            padding: 3,
            fontSize: 12,
            marginTop: 5,
            color: appcolor.dark,
            textAlign: 'center',
          }}
        >
          {item.groupName}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title="Quản lí tài liệu"
        leftFunc={() => navigation.goBack()}
      />
      <View
        style={{ flex: 1, alignSelf: group.length > 2 ? 'center' : 'auto' }}
      >
        <FlatList
          keyExtractor={(_, index) => index.toString}
          data={group}
          numColumns="3"
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};
