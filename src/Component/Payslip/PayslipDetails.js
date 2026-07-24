import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ToastError } from '../../Core/Helper';
import { FlashList } from '@shopify/flash-list';
import { ButtonAction } from '../Employee/Infomation/Control/ButtonAction';
import { Image } from 'react-native';
// import { NumericFormat } from 'react-number-format';
import { fontWeightBold } from '../../Themes/AppsStyle';

const PayslipDetails = ({ navigation, route }) => {
  const { item } = route.params;
  const { appcolor } = useSelector(state => state.GAppState);
  const [salaryDetails, setSalaryDetails] = useState(
    JSON.parse(item?.jsonContent) || [],
  );
  //
  const footer = item.footer || '';
  const phoneMatch = footer.match(/(\+?\d[\d\s]+)/);
  let phoneNumber = '';
  if (phoneMatch && phoneMatch[1]) {
    phoneNumber = phoneMatch[1].replace(/\s+/g, '');
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.surface },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      color: appcolor.dark,
    },
    iconContainer: {
      backgroundColor: appcolor.primary,
      padding: 10,
      borderRadius: 50,
    },
    header: {
      fontSize: 24,
      fontWeight: fontWeightBold,
      marginLeft: 15,
      color: appcolor.dark,
    },
    detailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      backgroundColor: appcolor.light,
      borderBottomColor: appcolor.surface,
      paddingVertical: 3,
      color: appcolor.dark,
    },
    detailLabel: { width: '75%', fontSize: 12, color: appcolor.dark },
    detailValue: {
      width: '25%',
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '700',
      textAlign: 'right',
    },
    card: {
      backgroundColor: appcolor.primary,
      padding: 20,
      borderRadius: 10,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 7,
    },
    label: { fontSize: 14, color: appcolor.white },
    value: { fontSize: 14, fontWeight: fontWeightBold, color: appcolor.white },
    itemMain: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      marginBottom: 90,
    },
    contentInfo: { width: '80%', padding: 8 },
  });

  const SummaryCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              padding: 7,
              color: appcolor.white,
              fontWeight: '700',
            }}
          >
            {item?.headerContent}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Tổng thu nhập:</Text>
          <NumericFormat
            thousandSeparator
            value={item?.totalSalary}
            displayType={'text'}
            renderText={value => <Text style={styles.value}>{value}</Text>}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Trừ BHXH:</Text>
          <NumericFormat
            thousandSeparator
            value={item?.insuranceCost}
            displayType={'text'}
            renderText={value => <Text style={styles.value}>{value}</Text>}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Trừ thuế TNCN:</Text>
          <NumericFormat
            thousandSeparator
            value={item?.incomeTaxCost}
            displayType={'text'}
            renderText={value => <Text style={styles.value}>{value}</Text>}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Lương thực nhận:</Text>
          <NumericFormat
            thousandSeparator
            value={item?.actualSalary}
            displayType={'text'}
            renderText={value => <Text style={styles.value}>{value}</Text>}
          />
        </View>
      </View>
    );
  };

  const handlerActionInfo = type => {
    switch (type) {
      case 'ZALO':
        Linking.openURL(`https://zalo.me/${phoneNumber}`);
        break;
      case 'CALL':
        onCallAction(phoneNumber);
        break;
    }
  };

  const onCallAction = phoneNumber => {
    let call =
      Platform.OS == 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(call);
  };

  const renderItem = ({ item, index }) => {
    const value = item?.value;
    const isNumericValue =
      typeof value === 'number' ||
      (typeof value === 'string' &&
        value.trim() !== '' &&
        Number.isFinite(Number(value)));

    return value === null || value === '' || value?.length === 0 ? null : (
      <View style={[styles.detailItem, { alignItems: 'center' }]} key={index}>
        <Text style={styles.detailLabel}>{item.name}</Text>
        {isNumericValue ? (
          <NumericFormat
            value={value}
            thousandSeparator
            displayType="text"
            renderText={formattedValue => (
              <Text style={styles.detailValue}>{formattedValue}</Text>
            )}
          ></NumericFormat>
        ) : (
          <Text style={styles.detailValue}>{value}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: appcolor.light }}>
      <View style={{ height: '100%', backgroundColor: appcolor.primary }}>
        <HeaderCustom
          title={'Chi tiết lương'}
          leftFunc={() => navigation.goBack()}
        />
        <View
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: appcolor.light,
            marginTop: 10,
          }}
        >
          <FlashList
            data={salaryDetails}
            ListHeaderComponent={<SummaryCard item={item} />}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            ListFooterComponent={
              <View style={styles.itemMain}>
                <View style={styles.contentInfo}>
                  <Text style={styles.detailLabel}>{footer}</Text>
                </View>
                <View style={{ marginLeft: 15 }}>
                  <TouchableOpacity
                    onPress={() => handlerActionInfo('ZALO')}
                    style={{
                      marginLeft: 5,
                      shadowColor: appcolor.dark,
                      shadowOffset: { width: 3, height: 0 },
                      elevation: 3,
                      shadowOpacity: 0.5,
                    }}
                  >
                    <Image
                      source={require('../../Themes/Images/zalo.png')}
                      style={{ width: 50, height: 50 }}
                    />
                  </TouchableOpacity>
                  <ButtonAction
                    typeAction="CALL"
                    iconName="call"
                    iconSize={18}
                    onPress={() => handlerActionInfo('CALL')}
                  />
                </View>
              </View>
            }
            estimatedItemSize={100}
          />
        </View>
      </View>
    </View>
  );
};

export default PayslipDetails;
