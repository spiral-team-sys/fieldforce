import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ToastError } from '../../../../Core/Helper';
import { OOSAPI } from '../../../../API/OOSAPI';
import { LoadingView } from '../../../../Control/ItemLoading';
import { Text } from '@rneui/base';
import { HeaderCustom } from '../../../../Content/HeaderCustom';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import CustomListView from '../../../../Control/Custom/CustomListView';

export const SummaryGroup = ({ navigation }) => {
  const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(true);
  const [dataGroup, setDataGroup] = useState([]);
  //
  const LoadData = async () => {
    try {
      !isLoading && setLoading(true);
      await OOSAPI.GetListSummary('DEALER', {}, async (mData, message) => {
        message && ToastError(message);
        setDataGroup(mData);
      });
    } catch (e) {
      ToastError(`Lỗi dữ liệu: ${e}`);
    } finally {
      setLoading(false);
    }
  };
  // Handler
  const onBack = () => {
    navigation.goBack();
  };
  const handlerShowDetails = item => {
    navigation.navigate('summaryooslist', item);
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    LoadData();
    return () => {
      isMounted = false;
    };
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.light,
    },
    loadingView: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },
    contentMain: { width: '100%', height: '100%', paddingHorizontal: 4 },
    itemMain: { width: '100%', paddingTop: 8, paddingHorizontal: 4 },
    itemContent: {
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      padding: 16,
    },
    titleName: {
      fontSize: 14,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    titleContent: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.dark,
      textAlign: 'center',
    },
  });

  if (isLoading)
    return (
      <LoadingView
        isLoading={isLoading}
        title="Đang cập nhật dữ liệu"
        styles={styles.loadingView}
      />
    );

  const renderItem = ({ item, index }) => {
    const onPress = () => handlerShowDetails(item);
    return (
      <View key={`sgi-${index}`} style={styles.itemMain}>
        <TouchableOpacity style={styles.itemContent} onPress={onPress}>
          <Text style={styles.titleName}>{item.dealerName}</Text>
          <Text
            style={styles.titleContent}
          >{`${item.titleShopOOS}: ${item.shopOOS}/${item.totalShopHCP}`}</Text>
          <Text
            style={styles.titleContent}
          >{`${item.titleProductOOS} ${item.productOOS}`}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title={kpiinfo.menuNameVN} leftFunc={onBack} />
      <View style={styles.contentMain}>
        <CustomListView
          data={dataGroup}
          extraData={dataGroup}
          renderItem={renderItem}
          onRefresh={LoadData}
        />
      </View>
    </View>
  );
};
