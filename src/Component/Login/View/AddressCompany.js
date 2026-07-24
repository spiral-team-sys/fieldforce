import { StyleSheet, Text, View } from 'react-native';
import { getVersion } from 'react-native-device-info';
import { deviceWidth, fontWeightBold } from '../../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AddressCompany = ({ appcolor, useBackground = false }) => {
  const insets = useSafeAreaInsets();
  const textColor = useBackground ? appcolor.light : appcolor.dark;
  const subTextColor = useBackground
    ? appcolor.surface
    : appcolor.placeholderText;

  const styles = StyleSheet.create({
    titleVersion: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: textColor,
      textAlign: 'center',
      padding: 8,
    },
    companyContainer: {
      justifyContent: 'center',
      bottom: insets.bottom,
      width: deviceWidth,
      position: 'absolute',
    },
    titleCompany: {
      textAlign: 'center',
      fontSize: 15,
      color: subTextColor,
      fontWeight: 'bold',
    },
    addressCompany: {
      fontSize: 11,
      textAlign: 'center',
      color: subTextColor,
      fontWeight: '500',
    },
  });
  return (
    <View style={styles.companyContainer}>
      <Text style={styles.titleVersion}>{`Phiên bản: ${getVersion()}`}</Text>
      <Text style={styles.titleCompany}>Spiral Co.,Ltd</Text>
      <Text style={styles.addressCompany}>
        27B Nguyễn Đình Chiểu, Phường Sài Gòn, Thành Phố Hồ Chí Minh
      </Text>
    </View>
  );
};

export default AddressCompany;
