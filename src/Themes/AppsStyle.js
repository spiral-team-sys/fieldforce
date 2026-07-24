import { Dimensions, Platform, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export const { width: deviceWidth, height: deviceHeight } =
  Dimensions.get('window');
export const fontWeightBold = Platform.OS == 'android' ? '700' : '600';

export const scaleSize = size => {
  try {
    const option = Platform.isPad === true ? deviceWidth : deviceHeight;
    return RFValue(size + 1, option);
  } catch (e) {
    return 100;
  }
};
export const styleDefault = appcolor => {
  return StyleSheet.create({
    loadingView: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    mainContainer: { flex: 1, backgroundColor: appcolor.primary },
    contentContainer: { flex: 1, backgroundColor: appcolor.light },
    contentTab: { flex: 1, backgroundColor: appcolor.light },
    itemContainer: {
      flex: 1,
      padding: 8,
      margin: 8,
      marginBottom: 0,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grey,
      backgroundColor: appcolor.light,
      elevation: 3,
      shadowOpacity: 0.3,
      shadowColor: appcolor.grey,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    titleName: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    subTitleName: {
      fontSize: 12,
      fontWeight: '500',
      color: appcolor.darkslategray,
    },
    subTitleTime: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.darkslategray,
      fontStyle: 'italic',
    },
    inputContainer: {
      flex: 2,
      marginBottom: 0,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: appcolor.light,
      borderWidth: 0.6,
      borderColor: appcolor.grey,
    },
    inputText: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: '500',
      padding: 4,
      textAlign: 'center',
    },
    sheetContainer: { flex: 1, backgroundColor: appcolor.light },
    buttonContainer: {
      marginHorizontal: 8,
      marginBottom: 8,
      padding: 8,
      backgroundColor: appcolor.primary,
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: appcolor.grey,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
