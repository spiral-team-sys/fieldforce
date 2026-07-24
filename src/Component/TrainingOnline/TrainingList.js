import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getListTraining } from '../../Controller/TrainingController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading/index';
import { RefreshControl } from 'react-native';
import { Icon } from '@rneui/base';
import { GetEmployeeInfo, ToastError, groupDataByKey } from '../../Core/Helper';
import DeviceInfo from 'react-native-device-info';
import base64 from 'react-native-base64';
import { TRAINEEKEY } from '../../Core/URLs';
import FormGroup from '../../Content/FormGroup';
import _ from 'lodash';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TrainingList = ({ navigation, route }) => {
  const { appcolor, kpiinfo, shopinfo } = useSelector(state => state.GAppState);
  const [dataMain, setDataMain] = useState({
    dataTraining: [],
    dataTrainingF: [],
    dataTrainingM: [],
    dataGroupTraining: [],
  });
  const [loading, setLoading] = useState(false);
  const [_mutate, setMutate] = useState(false);
  const lstReport = JSON.parse(kpiinfo?.reportItem || '{}');
  const [dataTab, setDataTab] = useState({ indexTab: 0, itemTab: {} });

  const LoadData = async () => {
    await setLoading(true);
    if (shopinfo.shopId !== 0) {
      await getListTraining(async mData => {
        const dataGroupTraining = _.unionBy(mData, 'positionName');
        const currentTab = dataGroupTraining[0];
        const { arr } = groupDataByKey({
          arr: mData,
          key: 'positionName',
        });
        const dataFilterByTab = _.filter(
          arr,
          it => it.positionName == currentTab.positionName,
        );
        await setDataTab({ indexTab: 0, itemTab: currentTab });
        await setDataMain({
          dataTraining: dataFilterByTab,
          dataTrainingF: dataFilterByTab,
          dataTrainingM: arr,
          dataGroupTraining: dataGroupTraining,
        });
      });
    } else {
      ToastError('Hệ thống chưa lấy được dữ liệu cửa hàng', 'Thông báo', 'top');
    }
    await setLoading(false);
  };
  const handlerTraining = async item => {
    const einfo = await GetEmployeeInfo();
    const shareKey = {
      LoginID: TRAINEEKEY,
      AccountId: einfo.accountId,
      EmployeeId: einfo.employeeId,
      DeviceID: await DeviceInfo.getUniqueId(),
      LoginIDForRP: item.trainerCode,
      CoachingID: item.shopId !== 0 ? item.shopId : shopinfo.shopId,
      RefLoginType: 2,
    };
    const appShare = await base64.encode(JSON.stringify(shareKey));
    const params = {
      LinkTraining: item.linkTraining + appShare,
      LinkResult: item.linkResult + appShare,
      LinkEvaluate: item.linkEvaluate + appShare,
    };
    navigation.navigate('trainingaction', params);
  };
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    itemMain: {
      width: '100%',
      padding: 8,
      backgroundColor: appcolor.surface,
      borderRadius: 10,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleMenu: {
      width: '100%',
      color: appcolor.dark,
      fontSize: 16,
      fontWeight: '700',
    },
    descriptionView: {
      width: '100%',
      color: appcolor.dark,
      fontSize: 13,
      fontStyle: 'italic',
    },
  });

  const filterItem = async text => {
    if (text !== null && text.length > 0) {
      const mResult = await dataMain.dataTrainingF.filter(it => {
        const nameTraining = it.title
          ? it.title.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return nameTraining.indexOf(textData) > -1;
      });
      dataMain.dataTraining = mResult;
    } else {
      dataMain.dataTraining = dataMain.dataTrainingF;
    }
    setMutate(e => !e);
  };
  const renderItem = ({ item, index }) => {
    const onItemPress = () => {
      handlerTraining(item);
    };
    return (
      <TouchableOpacity key={`LT_${index}`} onPress={onItemPress}>
        <View style={styles.itemMain}>
          <View style={{ width: '95%' }}>
            <Text style={styles.titleMenu}>{item.title}</Text>
            <Text style={styles.descriptionView}>{item.descriptionName}</Text>
          </View>
          <SpiralIcon
            name="angle-right"
            type="font-awesome-5"
            size={15}
            color={appcolor.dark}
            style={{ padding: 8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const onPressTab = (item, index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    const dataFilterByTab = _.filter(
      dataMain.dataTrainingM,
      it => it.positionName == item.positionName,
    );
    dataMain.dataTraining = dataFilterByTab;
    dataMain.dataTrainingF = dataFilterByTab;
    setDataTab({ indexTab: index, itemTab: item });
  };
  const renderItemGroup = ({ item, index }) => {
    const isChoose = item.positionName == dataTab.itemTab?.positionName;
    const styleDefault = {
      minWidth: 80,
      padding: 8,
      margin: 8,
      marginEnd: 1,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: appcolor.greylight,
      marginEnd: index + 1 == dataMain.dataGroupTraining?.length ? 8 : 1,
    };
    const styleChoose = {
      minWidth: 80,
      padding: 8,
      margin: 8,
      marginEnd: 1,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      backgroundColor: appcolor.primary,
      marginEnd: index + 1 == dataMain.dataGroupTraining?.length ? 8 : 1,
    };
    return (
      <TouchableOpacity
        key={`igi_${index}`}
        style={isChoose ? styleChoose : styleDefault}
        onPress={() => onPressTab(item, index)}
      >
        <Text
          style={{
            width: '100%',
            fontSize: 14,
            fontWeight: Platform.OS == 'ios' ? '600' : '700',
            color: appcolor.dark,
            textAlign: 'center',
            color: isChoose ? appcolor.light : appcolor.dark,
          }}
        >
          {item.positionName || 'NONE'}
        </Text>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    LoadData();
    return () => false;
  }, []);
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        title={route.params.titlePage || kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
      />
      <LoadingView isLoading={loading} title={'Đang cập nhật dữ liệu'} />
      <FormGroup
        containerStyle={{
          borderColor: appcolor.grayLight,
          borderWidth: 0.5,
          backgroundColor: appcolor.light,
          padding: 3,
          width: '96%',
          margin: 10,
        }}
        inputStyle={{ fontSize: 14, color: appcolor.dark }}
        placeholder="Tìm kiếm"
        editable
        iconName="search"
        onClearTextAndroid={filterItem}
        handleChangeForm={filterItem}
      />
      <View style={{ width: '100%' }}>
        <FlatList
          horizontal
          key="groupListIssue"
          keyExtractor={(_item, index) => index.toString()}
          data={dataMain.dataGroupTraining}
          onScrollToIndexFailed={() => { }}
          renderItem={renderItemGroup}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <FlatList
        style={{ padding: 8 }}
        key={'listTraining'}
        keyExtractor={(_, index) => index.toString()}
        data={dataMain.dataTraining}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={LoadData} />
        }
      />
    </View>
  );
};
export default TrainingList;
