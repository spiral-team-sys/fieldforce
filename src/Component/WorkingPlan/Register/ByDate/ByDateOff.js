import { Icon, Text } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { PLANAPI } from '../../../../API/PlanAPI';
import { ToastError } from '../../../../Core/Helper';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ByDateOff = ({ item }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [itemOff, setItemOff] = useState({});

  const LoadData = async () => {
    !isLoading && (await setLoading(true));
    await PLANAPI.GetDataRegisterOff(
      item?.WorkingDay || 0,
      (mData, message) => {
        message && ToastError(message, 'Thông báo', 'top');
        setItemOff(mData[0] || {});
      },
    );
    await setLoading(false);
  };

  const onShowAction = () => {
    SheetManager.show('action_plan_off');
  };

  useEffect(() => {
    LoadData();
  }, [item]);

  const styles = StyleSheet.create({
    mainContainer: {
      borderBottomWidth: 1,
      borderColor: appcolor.grayLight,
      paddingBottom: 4,
    },
    mainContent: {
      padding: 8,
      margin: 8,
      marginBottom: 4,
      backgroundColor: appcolor.light,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      shadowColor: appcolor.greylight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: { fontSize: 12, color: appcolor.greylight },
    viewHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sheetContainer: { padding: 16, minHeight: 200, alignItems: 'center' },
  });
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.mainContent}
        activeOpacity={0.5}
        onPress={onShowAction}
      >
        <View style={styles.viewHead}>
          <View style={styles.infoHeader}>
            <SpiralIcon
              name="person-circle-outline"
              type="ionicon"
              size={24}
              color={appcolor.dark}
            />
            <View>
              <Text style={styles.titleName}>
                {itemOff.titleName || `Đăng ký nghỉ phép`}
              </Text>
              <Text
                style={[
                  styles.subTitleName,
                  { color: appcolor[itemOff.colorStatus] },
                ]}
              >
                {itemOff.subTitleName || `Không nghỉ phép`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <ActionSheet
        id="action_plan_off"
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={styles.sheetContainer}>
          <Text style={styles.titleName}>
            {itemOff.titleName || `Đăng ký nghỉ phép`}
          </Text>
        </View>
      </ActionSheet>
    </View>
  );
};

export default ByDateOff;
