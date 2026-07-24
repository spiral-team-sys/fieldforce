import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { deviceWidth } from '../../Themes/AppsStyle';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight } from '../../Core/Utility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../Icon/SpiralIcon';

export const SearchGroup = ({
  placeholder,
  iconName,
  data,
  value,
  handlerChange,
  handlerSearch,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [isSearchView, setSearchView] = useState(false);
  // Handler
  const handlerShowGroup = () => {
    SheetManager.show('listgroupdata');
  };
  const handlerShowSearch = () => {
    if (isSearchView) handlerSearch(null);
    setSearchView(e => !e);
  };
  //
  useEffect(() => {
    return () => false;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: deviceWidth,
      backgroundColor: appcolor.light,
      padding: 8,
    },
    headerMain: { width: '100%', flexDirection: 'row', alignItems: 'center' },
    bottomGroup: {
      width: '78%',
      flexDirection: 'row',
      padding: 10,
      paddingStart: 16,
      paddingEnd: 16,
      marginEnd: 8,
      borderRadius: 30,
      backgroundColor: appcolor.surface,
      alignItems: 'center',
    },
    searchView: {
      width: '20%',
      flexDirection: 'row',
      backgroundColor: appcolor.surface,
      borderRadius: 30,
      padding: 10,
      paddingStart: 16,
      paddingEnd: 16,
      alignItems: 'center',
    },
    titleGroup: {
      width: '93%',
      fontSize: 14,
      fontWeight: '600',
      color: appcolor.dark,
    },
    titleSearchMain: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '600',
      marginStart: 5,
    },
    searchInputMain: {
      padding: 5,
      borderRadius: 30,
      backgroundColor: appcolor.placeholderBody,
      position: 'absolute',
      width: '100%',
    },
    searchInputView: { fontSize: 13, color: appcolor.dark },
    itemChoose: {
      padding: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.grayLight,
    },
    titleItemGroup: { fontSize: 14, fontWeight: '600', color: appcolor.dark },
  });
  const RenderGroupList = () => {
    return (
      data !== null &&
      data.length > 0 &&
      data.map((item, index) => {
        const handlerChoose = () => {
          handlerChange(item);
        };
        return (
          <TouchableOpacity
            key={`idi_${index}`}
            style={styles.itemChoose}
            onPress={handlerChoose}
          >
            <Text
              style={{
                ...styles.titleItemGroup,
                color:
                  value == item.ItemGroup ? appcolor.primary : appcolor.dark,
              }}
            >
              {item.ItemGroup}
            </Text>
          </TouchableOpacity>
        );
      })
    );
  };
  return (
    <View style={styles.mainContainer}>
      {/* Header Group */}
      <View style={styles.headerMain}>
        <TouchableOpacity onPress={handlerShowGroup} style={styles.bottomGroup}>
          <Text style={styles.titleGroup}>{value}</Text>
          <SpiralIcon name="arrow-drop-down" size={18} color={appcolor.dark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlerShowSearch} style={styles.searchView}>
          <SpiralIcon name="search" size={18} color={appcolor.dark} />
          <Text style={styles.titleSearchMain}>Tìm</Text>
        </TouchableOpacity>
        {isSearchView && (
          <FormGroup
            editable
            useClearAndroid={false}
            iconName={iconName}
            iconRight="times-circle"
            placeholder={placeholder}
            clearButtonMode="never"
            handleChangeForm={handlerSearch}
            rightFunc={handlerShowSearch}
            containerStyle={styles.searchInputMain}
            inputStyle={styles.searchInputView}
          />
        )}
      </View>
      {/* Bottom Sheet List*/}
      <ActionSheet
        id="listgroupdata"
        indicatorColor={appcolor.light}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ width: '100%', height: deviceHeight / 2, padding: 8 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {RenderGroupList()}
            <View style={{ paddingBottom: 32 }} />
          </ScrollView>
        </View>
      </ActionSheet>
    </View>
  );
};
