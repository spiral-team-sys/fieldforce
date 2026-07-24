import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import { deviceHeight, fontWeightBold } from '../../../Themes/AppsStyle';
import { Text } from '@rneui/base';
import { menuController } from '../../../Controller/MenuController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomListView from '../../../Control/Custom/CustomListView';

const SheetKPI = ({}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [dataKPI, setDataKPI] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const typeStatus = {
    0: { name: 'Chưa hoàn thành', color: appcolor.danger },
    1: { name: 'Đã hoàn thành', color: appcolor.success },
    2: { name: 'Không bắt buộc', color: appcolor.warning },
  };
  //
  const LoadData = async () => {
    setLoading(true);
    const data = await menuController.getMenuKPI(1, shopinfo);
    setDataKPI(data);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const styles = StyleSheet.create({
    sheetContainer: {
      width: '100%',
      height: deviceHeight / 2,
      padding: 8,
      paddingBottom: 32,
      backgroundColor: appcolor.light,
    },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      paddingBottom: 8,
      textAlign: 'center',
    },
    itemMain: {
      flex: 1,
      padding: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 0.5,
      borderBottomColor: appcolor.surface,
    },
    titleMenu: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      padding: 8,
      textAlign: 'left',
    },
    titleStatus: {
      fontSize: 12,
      color: appcolor.dark,
      padding: 8,
      textAlign: 'left',
    },
  });

  const renderItem = ({ item, index }) => {
    const colorStatus = typeStatus[item.taskDone]
      ? typeStatus[item.taskDone].color
      : appcolor.danger;
    return (
      <View key={index} style={styles.itemMain}>
        <Text style={styles.titleMenu}>{item.menuNameVN}</Text>
        <Text style={{ ...styles.titleStatus, color: colorStatus }}>
          {typeStatus[item.taskDone]
            ? typeStatus[item.taskDone].name
            : item.taskAlter || ''}
        </Text>
      </View>
    );
  };
  return (
    <ActionSheet
      id="kpi-sheet"
      onBeforeShow={LoadData}
      containerStyle={{ paddingBottom: insets.bottom }}
    >
      <View style={styles.sheetContainer}>
        <Text style={styles.titleName}>Công việc phải hoàn thành</Text>
        {isLoading ? (
          <Text style={styles.titleStatus}>Đang cập nhật dữ liệu...</Text>
        ) : (
          <CustomListView
            data={dataKPI}
            extraData={dataKPI}
            renderItem={renderItem}
            bottomView={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </ActionSheet>
  );
};
export default SheetKPI;
