import moment from 'moment';
import { Platform } from 'react-native';
import { ConvertToInt } from '../../../Core/Utility';

const typeATTENDANT = 'ATTENDANT';
const typeOT = 'OT';
const typeOFF = 'OFF';
const typeLATE = 'LATE';
const typeEARLIER = 'EARLIER';
const FROM_MIN = 510; // 00:00 - 08:30 Minutes
const FROM_MAX = 720; // 00:00 - 12:00 Minutes
const TO_MIN = 780; // 00:00 - 13:00 Minutes
const TO_MAX = 1050; // 00:00 - 17:30 Minutes
const errorNoteTitle = 'Nhập ghi chú lý do không đồng ý (Tối thiểu 5 kí tự)';

const colorList = [
  '#336699',
  '#C02739',
  '#228B22',
  '#FFAA32',
  '#325a66',
  '#9F2B68',
  '#ff6600',
  '#336699',
];

const ColorRand = index => {
  if (
    index === undefined ||
    (index !== undefined && index > colorList.length - 1)
  ) {
    index = ConvertToInt(Math.random() * colorList.length || 0);
  }
  index = index % colorList.length;
  return colorList[index];
};

export const getTimeDefault = () => {
  const time = moment().toDate();
  time.setHours(0);
  time.setMinutes(0);
  time.setSeconds(0);
  time.setMilliseconds(0);
  return time;
};

export const BORDER_WIDTH = Platform.OS == 'android' ? 0.6 : 0.4;
export const UtilityOffice = {
  typeATTENDANT,
  typeOT,
  typeOFF,
  typeLATE,
  typeEARLIER,
  errorNoteTitle,
};
export const TimeDefault = { FROM_MIN, FROM_MAX, TO_MIN, TO_MAX };
export const COLOR = { ColorRand };
