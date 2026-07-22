import { Dimensions } from 'react-native';

export function isIphoneX() {
  const dim = Dimensions.get('window');

  let res = false;

  res = (dim.height === 780 || dim.width === 780 || dim.height === 812 || dim.width === 812 || dim.height === 844 || dim.width === 844 || dim.height === 896 || dim.width === 896 || dim.height === 926 || dim.width === 926) ? true : false

  return res;
}

export function isIPhoneXSize(dim) {
  return dim.height == 812 || dim.width == 812;
}

export function isIPhoneXrSize(dim) {
  return dim.height == 896 || dim.width == 896;
}