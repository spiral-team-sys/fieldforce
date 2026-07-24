import { GetBusinesTrips } from '../../Controller/BussinessTripController';
import {
  AppNameBuild,
  aquaApp,
  bshApp,
  casperApp,
  hafeleApp,
  hisenApp,
  honorApp,
  hpiApp,
  lgApp,
  mitsuApp,
  psvApp,
  sharpApp,
  tefalApp,
  toshibaApp,
  viessmannApp,
} from '../../Core/URLs';
import { deviceHeight, deviceWidth } from '../../Core/Utility';

export const DATE = new Date();
const ASPECT_RATIO = deviceWidth / deviceHeight;
export const LATITUDE_DELTA = 0.01;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
export const MODE = {
  HISTORY: 'HistoryTrips',
  CREATE: 'CreateTrips',
  UPDATE: 'UpdateTrips',
  COST: 'CostTrips',
  RESULT: 'ResultTrips',
  CONFIRM: 'ConfirmTrips',
  PLUS_ACTUAL: 'PlusActual',
  DOCUMENT_TRIPS: 'DocumentTrip',
};
export const TYPE = {
  PROVINCE_LIST: 'provinceList',
  PROVINCE_FROM: 'provinceFrom',
  PROVINCE_TO: 'provinceTo',
  DISTRICT_FROM: 'districtFrom',
  DISTRICT_TO: 'districtTo',
  TYPE_KM: 'kilomet',
  TYPE_KM_DISTANCE: 'kilomet_distance',
  TYPE_VEHICAL: 'vehical',
  TYPE_NIGTH_REST: 'nightRest',
  TYPE_HOTEL: 'amountHotel',
  TYPE_LUNCH: 'lunch',
  TYPE_DINNER: 'dinner',
  TYPE_ALLOWANCE: 'amountAllowance',
  TYPE_GASOLINE: 'amountGasoline',
  TYPE_TICKET: 'amountTicket',
  TYPE_VEHICALHIRE: 'amountVehicleHire',
  TYPE_NOTE: 'note',
  TYPE_REMARK: 'remark',
  TYPE_OTHER: 'other',
  TYPE_NUMBER_DAY: 'numberDay',
  TYPE_VEHICAL_OTHER: 'vehicalOther',
  TYPE_DAYS_MOVE: 'daysMove',
  TYPE_COST_NOTE: 'costNote',
  TYPE_NUM_STAGES: 'numStages',
  TYPE_NUM_POINTS: 'numPoint',
  TYPE_VEHICLE: 'vehicle',
  TYPE_STORE: 'numberStore',
  TYPE_STOREVISIT: 'shopVisit',
  TYPE_SUPPORT_WORK: 'supportWork',
};
export const ACTION_UPLOAD = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVED: 'APPROVED',
  REJECT: 'REJECT',
  PLUS: 'PLUS',
  DOCUMENT: 'DOCUMENT',
  RECONFIRM: 'RECONFIRM',
};
export const actionBackHeader = typeArrow => {
  switch (typeArrow) {
    case MODE.CREATE:
    case MODE.UPDATE:
    case MODE.CONFIRM:
      return MODE.HISTORY;
    case MODE.COST:
      return MODE.CREATE;
    case MODE.RESULT:
      return MODE.COST;
  }
};
export const actionNextHeader = typeArrow => {
  switch (typeArrow) {
    case MODE.CREATE:
    case MODE.UPDATE:
      return MODE.COST;
    case MODE.COST:
      return MODE.RESULT;
    case MODE.RESULT:
    case MODE.PLUS_ACTUAL:
      return MODE.HISTORY;
  }
};
export const provinceByAddress = address => {
  const strAddress = address.split(', ');
  const province = strAddress[strAddress.length - 2] || '';
  const district = strAddress[strAddress.length - 3] || '';
  return { province: province.replace(/\d+/g, ''), district: district };
  // console.log(strAddress);
  // console.log(province);
  // console.log(district);
  // const regex = /,([^,]+),([^,]+)$/
  // const matches = address.match(regex);
  // if (matches && matches.length > 1) {
  //     const provinceCity = matches[1].trim();
  //     return provinceCity
  // } else {
  //     return ''
  // }
};
const business_Mitsu = () => {
  const priceNight = 150000;
};
const business_Casper = data => {
  // const priceKm = (data.kmValue || 0) * 1200
  const priceKm = data.supportKM;
  const priceVehicalOther = data.vehicalOtherValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceLunch = data.lunchValue || 0;
  // const priceDinner = data.dinnerValue || 01
  //
  const resultBusiness = {
    kmValue: data.kmValue,
    supportKM: priceKm,
    supportVehical: priceVehicalValue,
    supportNight: priceNightHotel,
    supportLunch: priceLunch,
    // supportDinner: priceDinner,
    typePeople: data.typePeople,
    workingKm: data.workingKm,
    typeKM: data.typeKM,
    totalKM: priceKm + priceVehicalValue,
    supportVehicalOther: priceVehicalOther,
    totalSupport:
      priceKm +
      priceVehicalValue +
      priceVehicalOther +
      priceNightHotel +
      priceLunch,
  };
  return resultBusiness;
};
const business_Pana = data => {
  const priceKm = (data.kmValue || 0) * 1200;
  const priceVehicalValue = data.vehicalValue || 0;
  const priceVehicalOtherValue = data.vehicalOtherValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceLunch = data.lunchValue || 0;
  const priceDinner = data.dinnerValue || 0;
  const priceOther = data.otherValue || 0;
  //
  const resultBusiness = {
    kmValue: data.kmValue,
    supportKM: priceKm,
    supportVehical: priceVehicalValue,
    supportVehicalOther: priceVehicalOtherValue,
    supportNight: priceNightHotel,
    supportLunch: priceLunch,
    supportDinner: priceDinner,
    supportOther: priceOther,
    totalKM: priceKm + priceVehicalValue + priceVehicalOtherValue,
    totalSupport:
      priceKm +
      priceVehicalValue +
      priceVehicalOtherValue +
      priceNightHotel +
      priceLunch +
      priceDinner +
      priceOther,
  };
  return resultBusiness;
};
const business_Pana_BySup = data => {
  // const priceKm = data.supportKM || 0
  const priceVehicalValue = data.vehicalValue || 0;
  const priceLunch = data.lunchValue || 0;
  const priceDinner = data.dinnerValue || 0;
  const priceOther = data.otherValue || 0;
  const priceStay = data.stayValue || 0;
  const priceVehicalOther = data.vehicalOtherValue || 0;
  const daysMove = data.daysMove || 0;
  //
  const resultBusiness = {
    kmValue: 0,
    supportKM: 0,
    supportVehical: priceVehicalValue,
    supportLunch: priceLunch,
    supportDinner: priceDinner,
    supportOther: priceOther,
    totalKM: priceVehicalValue,
    supportStay: priceStay,
    supportVehicalOther: priceVehicalOther,
    daysMove: daysMove,
    totalSupport:
      priceVehicalValue +
      priceLunch +
      priceDinner +
      priceOther +
      priceStay +
      priceVehicalOther +
      daysMove * 250000,
  };
  return resultBusiness;
};
const business_Viessmann = data => {
  const supportKM = data.supportKM || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceLunch = data.lunchValue || 0;
  const costNote = data.costNote || null;
  //
  const resultBusiness = {
    supportKM: supportKM,
    supportVehical: priceVehicalValue,
    supportNight: priceNightHotel,
    supportLunch: priceLunch,
    totalKM: priceVehicalValue,
    costNote: costNote,
    totalSupport: supportKM + priceVehicalValue + priceNightHotel + priceLunch,
  };
  return resultBusiness;
};
const business_Hisense = data => {
  const priceVehicalValue = data.vehicalValue || 0;
  const priceLunchValue = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceOther = data.otherValue || 0;
  //
  const resultBusiness = {
    supportVehical: priceVehicalValue,
    supportLunch: priceLunchValue,
    supportNight: priceNightHotel,
    supportOther: priceOther,
    totalKM: priceVehicalValue,
    totalSupport:
      priceVehicalValue + priceLunchValue + priceNightHotel + priceOther,
  };
  return resultBusiness;
};
const business_Toshiba = data => {
  const priceLunchValue = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  //
  const resultBusiness = {
    kmValue: data.kmValue,
    supportLunch: priceLunchValue,
    supportNight: priceNightHotel,
    totalKM: priceVehicalValue,
    totalSupport: priceLunchValue + priceNightHotel + priceVehicalValue,
  };
  return resultBusiness;
};
const business_Sharp = data => {
  const priceLunchValue = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  //
  const resultBusiness = {
    kmValue: data.kmValue,
    supportLunch: priceLunchValue,
    supportNight: priceNightHotel,
    totalKM: priceVehicalValue,
    totalSupport: priceLunchValue + priceNightHotel + priceVehicalValue,
  };
  return resultBusiness;
};
const business_GSV = data => {
  const priceLunchValue = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  const supportKM = data.supportKM || 0;
  //
  const resultBusiness = {
    supportKM: supportKM,
    supportLunch: priceLunchValue,
    supportNight: priceNightHotel,
    supportVehical: priceVehicalValue,
    totalSupport:
      priceLunchValue + priceNightHotel + supportKM + priceVehicalValue,
  };
  return resultBusiness;
};
const business_Aqua = data => {
  const priceLunchValue = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  const priceVehicalOther = data.vehicalOtherValue || 0;
  //
  const resultBusiness = {
    kmValue: data.kmValue,
    supportLunch: priceLunchValue,
    supportNight: priceNightHotel,
    totalKM: priceVehicalValue,
    supportVehicalOther: priceVehicalOther,
    totalSupport:
      priceLunchValue + priceNightHotel + priceVehicalValue + priceVehicalOther,
  };
  return resultBusiness;
};

const business_Bosch = data => {
  const priceLunchValue = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  const priceVehicalOther = data.vehicalOtherValue || 0;
  //
  const resultBusiness = {
    kmValue: data.kmValue,

    supportLunch: priceLunchValue,
    supportNight: priceNightHotel,
    supportVehical: priceVehicalValue,
    // supportKM: supportKM,
    totalKM: priceVehicalValue,
    supportVehicalOther: priceVehicalOther,
    totalSupport:
      priceLunchValue + priceNightHotel + priceVehicalValue + priceVehicalOther,
  };
  return resultBusiness;
};
const business_HPI = data => {
  const priceNightHotel = data.nightRestValue || 0;
  const priceLunch = data.lunchValue || 0;
  const priceDinner = data.dinnerValue || 0;
  const priceVehicalValue = data.vehicalValue || 0;
  const priceOther = data.otherValue || 0;
  const priceVehicalOtherValue = data.vehicalOtherValue || 0;
  //
  const resultBusiness = {
    supportVehical: priceVehicalValue,
    supportVehicalOther: priceVehicalOtherValue,
    supportLunch: priceLunch,
    // supportDinner: priceDinner,
    supportNight: priceNightHotel,
    supportOther: priceOther,
    totalKM: priceVehicalValue,
    totalSupport:
      priceVehicalValue +
      priceLunch +
      priceNightHotel +
      priceOther +
      priceVehicalOtherValue,
  };
  return resultBusiness;
};
const business_Honor = data => {
  const priceVehicalOtherValue = data.vehicalOtherValue || 0;
  const priceKm = data.supportKM || 0;
  const priceLunch = data.lunchValue || 0;
  const priceNightHotel = data.nightRestValue || 0;
  const priceOther = data.otherValue || 0;
  const priceSupportWork = data.supportWorkValue || 0;

  const resultBusiness = {
    kmValue: data.kmValue,
    supportKM: priceKm,
    supportLunch: priceLunch,
    supportNight: priceNightHotel,
    supportVehicalOther: priceVehicalOtherValue,
    supportOther: priceOther,
    supportWork: priceSupportWork,
    totalKM: priceKm + priceVehicalOtherValue,
    totalSupport:
      priceKm +
      priceLunch +
      priceNightHotel +
      priceVehicalOtherValue +
      priceOther +
      priceSupportWork,
  };
  return resultBusiness;
};
const business_LG = data => {
  const priceNightHotel = data.nightRestValue || 0;
  const priceKm = data.supportKM || 0;
  const priceSupportWork = data.supportWorkValue || 0;
  //
  const resultBusiness = {
    supportNight: priceNightHotel,
    supportKM: priceKm,
    supportWork: priceSupportWork,
    totalSupport: priceNightHotel + priceKm + priceSupportWork,
  };
  return resultBusiness;
};
const business_Hafele = data => {
  const priceKm = data.supportKM || 0;
  const priceNightHotel = data.nightRestValue || 0;

  const resultBusiness = {
    kmValue: data.kmValue,
    supportKM: priceKm,
    supportNight: priceNightHotel,
    totalKM: priceKm,
    totalSupport: priceKm + priceNightHotel,
  };
  return resultBusiness;
};
export const getBusinesDataSupport = (data, groupType) => {
  switch (AppNameBuild) {
    case casperApp:
      return business_Casper(data);
    case mitsuApp:
      return business_Mitsu(data);
    case psvApp:
      return groupType == 'SUP'
        ? business_Pana_BySup(data)
        : business_Pana(data);
    case viessmannApp:
      return business_Viessmann(data);
    case hisenApp:
      return business_Hisense(data);
    case toshibaApp:
      return business_Toshiba(data);
    case sharpApp:
      return business_Sharp(data);
    case tefalApp:
      return business_GSV(data);
    case aquaApp:
      return business_Aqua(data);
    case bshApp:
      return business_Bosch(data);
    case hpiApp:
      return business_HPI(data);
    case honorApp:
      return business_Honor(data);
    case hafeleApp:
      return business_Hafele(data);
    case lgApp:
      return business_LG(data);
    default:
      return business_Pana(data);
  }
};

const parseDate = yyyymmdd => {
  const stringDate = String(yyyymmdd);
  const year = parseInt(stringDate.substring(0, 4), 10);
  const month = parseInt(stringDate.substring(4, 6), 10) - 1; // Tháng bắt đầu từ 0
  const day = parseInt(stringDate.substring(6, 8), 10);

  // Tạo đối tượng Date và đặt giờ, phút, giây
  const date = new Date(year, month, day, 23, 59, 0);
  return date.toISOString();
};

const checkDateOverlap = (newFromDate, newToDate, data) => {
  return data.some(
    item => !(newToDate <= item.fromDate || newFromDate >= item.toDate),
  );
};
const checkByOneDate = (newFromDate, data) => {
  let count = 0;
  data.map(it => {
    if (it.fromDate == newFromDate || it.toDate == newFromDate) {
      count = count + 1;
    }
  });
  return count;
};
export const checkDateExists = (fromDate, toDate, mData) => {
  let result = checkDateOverlap(fromDate, toDate, mData);
  if (fromDate == toDate && !result) {
    const resultCount = checkByOneDate(fromDate, mData);

    if (resultCount > 1) {
      return true;
    } else return false;
  } else {
    return result;
  }
};
