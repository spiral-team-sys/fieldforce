import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { CheckBox, Icon } from '@rneui/themed';
import { Store, UpdateItem } from '../Core/SqliteDbContext';
import { deviceHeight, scaleSize } from '../Themes/AppsStyle';
import {
  checkIMEI,
  checkIMEI2,
  formatCard,
  formatNumber,
  formatPhone,
  isPhone,
} from '../Core/Helper';
import { toastError, toastSuccess } from '../Utils/configToast';
import {
  Check2IMEISellout,
  CheckIMEISellout,
  getPhotosByGuiId,
} from '../Controller/WorkController';
// import { NumericFormat } from 'react-number-format';
import {
  AppNameBuild,
  daikinApp,
  _competitorId,
  _competitorName,
  toshibaApp,
} from '../Core/URLs';
import {
  alertWarning,
  ConvertToInt,
  deviceWidth,
  findFirstLetterPosition,
} from '../Core/Utility';
import { Keyboard } from 'react-native';
import {
  deletePhotoByList,
  InsertPhotosItem,
} from '../Controller/PhotoController';
import { launchImageLibrary } from 'react-native-image-picker';
import Moment from 'moment';
import { useSelector } from 'react-redux';
import { sellOut } from '../Core/TableLocal';
import { HeaderCustom } from './HeaderCustom';
import FormGroup from './FormGroup';
import Swiper from 'react-native-swiper';
import { SellOutInsert } from '../Controller/SellOutController';
import { Calendar } from 'react-native-calendars';
import { LoadingView } from '../Control/ItemLoading';
import { ModalNotify } from '../Control/ModalNotify';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deleteItemPhotoByGuiId } from '../Controller/DisplayController';
import NativeCamera from '../Control/NativeCamera';
import { MutipleItemSelected } from '../Control/MutipleItemSelected';
import { GetByListCode } from '../Controller/MasterController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../Control/Icon/SpiralIcon';

const sotemplate = {
  quantity: 1,
  amount: null,
  price: null,
  serial: null,
  IMEI2: null,
  sellComment: null,
  customer: null,
  address: null,
  phone: null,
  gender: null,
  age: null,
  color: null,
  competitorId: null,
  reportDate: Moment().format('YYYY-MM-DD'),
  flag: null,
  statusVerify: null,
  itemClassify: null,
  promotionType: null,
  taxCode: null,
  email: null,
  paymentMethod: null,
  deposit: null,
  billCode: 'HD' + Moment(new Date()).format('DDMMYY'),
};
const HOLDER_TEXT = '-- Chọn --';
const SelloutModel = ({
  Shops,
  Competitors,
  Categories,
  SubCategories,
  Segments,
  SubSegment,
  Products,
  Closed,
  Props,
  ItemSaved,
  LoadHistory,
  Dashboard,
  MasterList,
  reload,
  guiId,
  lstReport,
  infoSave,
}) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo, kpiinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [pageNum, setPageNext] = useState(0);
  var pageList = {};
  const [sellItem, setSellItem] = useState(sotemplate);
  const [nameShop, setNameShop] = useState();
  const [selectedProducts, setSelectProduct] = useState({});
  const [dataDivision, setDivision] = useState([]);
  const [dataCategory, setCategory] = useState(Categories);
  const [dataSubCategory, setSubCategory] = useState(SubCategories);
  const [dataSegment, setSegment] = useState(Segments);
  const [dataSubSegment, setSubSement] = useState([]);
  const [dataProducts, setProduct] = useState({ dataView: [], dataFilter: [] });
  const [Mdata, setMdata] = useState([]);
  const [MdataTitle, setMdataTitle] = useState([]);
  const refInputs = useRef([]);
  const swiperRef = useRef();
  // const [tickInfoSave, setTickInfoSave] = useState(false)
  const [_, setMutate] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [isSave, setIsSave] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [messager, setMessager] = useState('');
  const [dataCalendar, setDataCalendar] = useState({
    markedDatesDefault: {
      [Moment(LoadHistory ? ItemSaved.reportDate?.toString() : new Date())
        .format('YYYY-MM-DD')
        .toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    },
    markedDates: {
      [Moment(LoadHistory ? ItemSaved.reportDate?.toString() : new Date())
        .format('YYYY-MM-DD')
        .toString()]: {
        selected: true,
        marked: true,
        selectedColor: appcolor.primary,
      },
    },
    reportDate: LoadHistory ? ItemSaved.reportDate : '',
  });
  const [dataImage, setDataImage] = useState({
    isShowPhoto: false,
    listPhoto: [],
    indexPhoto: 0,
  });
  const config = JSON.parse(kpiinfo.reportItem || '{}');
  const [modalItem, setModalItem] = useState({
    isShowModal: false,
    itemSelect: {},
    dataShow: [],
    typeItem: '',
    itemMain: {},
  });

  const workingDate = Number(userinfo?.workingDate) || 0;
  const firstDateOfMonthInt = Number(Moment().format('YYYYMM01'));
  const minDateInt =
    workingDate > firstDateOfMonthInt ? workingDate : firstDateOfMonthInt;
  const minDateCalendar = Moment(minDateInt.toString(), 'YYYYMMDD').format(
    'YYYY-MM-DD',
  );

  const handlerTextInput = (idx, isNextHidden) => {
    const next = refInputs.current[idx + 1];
    if (next) {
      isNextHidden === 1 ? Keyboard.dismiss() : next.focus();
    } else {
      Keyboard.dismiss();
    }
  };
  const filterItem = async (text, type) => {
    const { category, division, competitor, segment, subsegment } =
      selectedProducts;
    switch (type) {
      case 'products':
        const lstProduct = dataProducts.dataFilter.filter(
          i =>
            (i.division === division ||
              i.division === competitor ||
              i.category === category ||
              i.segment === segment) &&
            i.name.toLowerCase().match(text.toLowerCase()),
        );
        await setProduct({ ...dataProducts, dataView: lstProduct });
        break;
    }
  };

  React.useEffect(() => {
    AppNameBuild === 'bk' && setMdata([]);
    if (infoSave?.tickInfoSave == true) {
      // setSellItem({ ...sotemplate, competitorId: sellItem.competitorId, customer: sellItem.customer, address: sellItem.address, phone: sellItem.phone, reportDate: sellItem.reportDate ? sellItem.reportDate : Moment(workinfo.workDate.toString()).format('YYYY-MM-DD').toString() })
      setSellItem({
        ...sotemplate,
        competitorId: infoSave?.dataInfoSave?.competitorId,
        customer: infoSave?.dataInfoSave?.customer,
        address: infoSave?.dataInfoSave?.address,
        phone: infoSave?.dataInfoSave?.phone,
        reportDate: infoSave?.dataInfoSave?.reportDate
          ? infoSave?.dataInfoSave?.reportDate
          : Moment(workinfo.workDate.toString())
            .format('YYYY-MM-DD')
            .toString(),
        flag: infoSave?.dataInfoSave?.flag == 1 ? true : false,
        statusVerify: infoSave?.dataInfoSave?.statusVerify,
        itemClassify: infoSave?.dataInfoSave?.itemClassify,
        promotionType: infoSave?.dataInfoSave?.promotionType,
        taxCode: infoSave?.dataInfoSave?.taxCode,
        email: infoSave?.dataInfoSave?.email,
        paymentMethod: infoSave?.dataInfoSave?.paymentMethod,
        deposit: infoSave?.dataInfoSave?.deposit
          ? JSON.parse(infoSave?.dataInfoSave?.deposit || '[]')
          : null,
        billCode: infoSave?.dataInfoSave?.billCode,
      });
    } else {
      setSellItem({
        ...sotemplate,
        reportDate: Moment(workinfo?.workDate?.toString())
          .format('YYYY-MM-DD')
          .toString(),
      });
    }
    setNameShop();
    defaultLoad();
    loadDataCalendar();
    setIsSave(0);

    return () => false;
  }, [reload]);

  const loadDataCalendar = () => {
    setDataCalendar({
      markedDatesDefault: {
        [Moment(LoadHistory ? ItemSaved.reportDate?.toString() : new Date())
          .format('YYYY-MM-DD')
          .toString()]: {
          selected: true,
          marked: true,
          selectedColor: appcolor.primary,
        },
      },
      markedDates: {
        [Moment(LoadHistory ? ItemSaved.reportDate?.toString() : new Date())
          .format('YYYY-MM-DD')
          .toString()]: {
          selected: true,
          marked: true,
          selectedColor: appcolor.primary,
        },
      },
      reportDate: LoadHistory ? ItemSaved.reportDate : '',
    });
  };

  const defaultLoad = async () => {
    // console.log(Competitors)
    await setDivision(Competitors);
    if (Competitors !== null && Competitors?.length > 0) {
      const _division = await Competitors[0].name;
      const _divisionId = await Competitors[0].id;
      await setSelectProduct({ division: _division });
      //set Cate
      const _tempCate = await Categories?.filter(i => i.division == _division);
      const lstProductByDivision = await Products.filter(
        i => i.division == _division,
      );
      await setCategory(_tempCate);
      // Category
      if (_tempCate?.length > 0) {
        const _category =
          lstProductByDivision.length > 300 ? Categories[0].name : null;
        const _categoryId =
          lstProductByDivision.length > 300 ? Categories[0].id : null;
        await setSelectProduct({
          ...selectedProducts,
          category: _category,
          categoryId: _categoryId,
          competitor: _division,
          competitorId: _divisionId,
        });
        await setSegment(
          Segments.filter(
            seg => seg.category == _category && seg.division === _division,
          ),
        );
        const lstProductFilter = await lstProductByDivision.filter(
          i =>
            i.division == _division &&
            (i.category == _category || _category == null),
        );
        await setProduct({
          dataView: lstProductFilter,
          dataFilter: lstProductFilter,
        });
      } else {
        const lstProductFilter = await Products.filter(
          i => i.division == _division,
        );
        await setProduct({
          dataView: lstProductFilter,
          dataFilter: lstProductFilter,
        });
      }
    } else {
      await setCategory(Categories);
      await setSegment(Segments);
      await setSubSement(SubSegment);
      await setProduct({ dataView: Products, dataFilter: Products });
    }
    if (LoadHistory) {
      const filterCompetitor = Competitors.filter(
        it => it.id == ItemSaved.competitorId,
      );
      const products = await {
        ...ItemSaved,
        deposit: ItemSaved.deposit
          ? JSON.parse(ItemSaved.deposit || '[]')
          : null,
        id: ItemSaved.productId,
        products: ItemSaved.productName,
        competitor: filterCompetitor[0]?.name || null,
      };
      await setSellItem(products);
      await setSelectProduct(products);
    }
  };

  const onValidated = async onFinish => {
    let isValid = true;
    let currentDate = parseInt(Moment().format('YYYYMMDD'));

    for (let index = 0; index < MasterList.length; index++) {
      const element = MasterList[index];

      if (
        element.ref_Name === 'billCode' &&
        element.isRequired === 1 &&
        (sellItem.billCode === null ||
          sellItem.billCode === '' ||
          sellItem.billCode === 'null')
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `Bạn chưa nhập Số hoá đơn.` });
        return;
      }
      if (
        element.ref_Name === 'reportDate' &&
        sellItem.reportDate &&
        sellItem.reportDate !== '' &&
        parseInt(sellItem.reportDate) > currentDate
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `Ngày báo cáo không được lớn hơn ngày hiện tại!`,
        });
        return;
      }
      if (
        element.ref_Name === 'shop' &&
        (nameShop === null || nameShop === undefined)
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: 'Bạn chưa chọn cửa hàng.' });
        return;
      }
      if (element.ref_Name === 'products') {
        if (
          (lstReport?.isCheckModel == undefined ||
            lstReport?.isCheckModel == 1) &&
          (selectedProducts.id == undefined || selectedProducts.id < 1) &&
          (selectedProducts.competitorId == _competitorId ||
            selectedProducts.competitorId == null ||
            selectedProducts.competitorId == undefined)
        ) {
          isValid = false;
          onFinish({ statusId: 500, messager: 'Bạn chưa chọn sản phẩm bán' });
          return;
        }
      }

      if (
        element.ref_Name === 'customer' &&
        element.isRequired === 1 &&
        (sellItem.customer == null ||
          sellItem.customer == '' ||
          (sellItem.customer?.length || 0) < element.numberValue)
      ) {
        if ((sellItem.customer?.length || 0) < element.numberValue) {
          isValid = false;
          onFinish({
            statusId: 500,
            messager: `Tên khách hàng ngắn, nhập ít nhất ${element.numberValue} ký tự`,
          });
          return;
        }
      }
      if (
        element.ref_Name === 'quantity' &&
        (sellItem.quantity == null ||
          sellItem.quantity == '' ||
          ConvertToInt(sellItem.quantity) < 1)
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `Số lượng không hợp lệ` });
        return;
      }
      if (
        element.ref_Name === 'quantity' &&
        sellItem.quantity !== null &&
        sellItem.quantity !== '' &&
        ConvertToInt(sellItem.quantity) > element.numberValue
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `Số lượng không hợp lệ, số lượng lớn hơn cho phép ${element.numberValue}`,
        });
        return;
      }
      if (
        element.ref_Name === 'price' &&
        element.isRequired === 1 &&
        (sellItem.price === null ||
          sellItem.price === '' ||
          sellItem.price === 'null')
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `Giá không được để trống` });
        return;
      }
      if (
        element.ref_Name === 'statusVerify' &&
        element.isRequired === 1 &&
        (sellItem.statusVerify === null ||
          sellItem.statusVerify === '' ||
          sellItem.statusVerify === 'null')
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `Bạn chưa chọn trạng thái đơn hàng`,
        });
        return;
      }
      if (
        element.ref_Name === 'itemClassify' &&
        element.isRequired === 1 &&
        (sellItem.itemClassify === null ||
          sellItem.itemClassify === '' ||
          sellItem.itemClassify === 'null')
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `Bạn chưa chọn loại hàng hoá` });
        return;
      }
      if (
        element.ref_Name === 'promotionType' &&
        element.isRequired === 1 &&
        (sellItem.promotionType === null ||
          sellItem.promotionType === '' ||
          sellItem.promotionType === 'null')
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `Bạn chưa chọn loại khuyến mãi` });
        return;
      }
      if (
        element.ref_Name === 'deposit' &&
        element.isRequired === 1 &&
        (sellItem.deposit === null ||
          sellItem.deposit === '' ||
          sellItem.deposit === 'null')
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `Bạn chưa chọn Khách hàng cọc trước.`,
        });
        return;
      }
      if (
        element.ref_Name === 'taxCode' &&
        element.isRequired === 1 &&
        (sellItem.taxCode === null ||
          sellItem.taxCode === '' ||
          sellItem.taxCode === 'null')
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `Bạn chưa nhập mã số thuế.` });
        return;
      }

      if (element.ref_Name === 'email' && element.isRequired === 1) {
        if (
          sellItem.email === null ||
          sellItem.email === '' ||
          sellItem.email === 'null'
        ) {
          isValid = false;
          onFinish({ statusId: 500, messager: `Bạn chưa nhập Email.` });
          return;
        }

        const regEmail = /^\S+@\S+\.\S+$/g;
        if (!regEmail.test(sellItem.email) && sellItem.email) {
          isValid = false;
          onFinish({
            statusId: 500,
            messager: `Định dạng email không chính xác!`,
          });
          return;
        }
      }

      if (
        element.ref_Name === 'paymentMethod' &&
        element.isRequired === 1 &&
        (sellItem.paymentMethod === null ||
          sellItem.paymentMethod === '' ||
          sellItem.paymentMethod === 'null')
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `Bạn chưa chọn phương thức thanh toán.`,
        });
        return;
      }

      if (
        element.ref_Name === 'phone' &&
        element.isRequired === 1 &&
        (sellItem.phone === null || sellItem.phone === '') &&
        element.isRequired === 1 &&
        (selectedProducts.competitorId == _competitorId ||
          selectedProducts.competitorId == null ||
          selectedProducts.competitorId == undefined)
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `Số điện thoại không được để trống`,
        });
        return;
      }
      if (sellItem.phone !== null && sellItem.phone !== '') {
        const checkPhone = isPhone(sellItem.phone);
        if (!checkPhone) {
          onFinish({
            statusId: 500,
            messager: `Số điện thoại không đúng định dạng`,
          });
          isValid = false;
          return;
        }
      }
      if (
        element.ref_Name === 'serial' &&
        (element.isRequired === 1 || element.isRequired === 3) &&
        (sellItem.serial === null || sellItem.serial === '')
      ) {
        isValid = false;
        // arrItem.push({ statusId: 500, messager: `IMEI không được để trống` })
        onFinish({ statusId: 500, messager: `Số Seri không được để trống` });
        return;
      }
      if (
        element.ref_Name === 'serial' &&
        element.isRequired !== 2 &&
        element.isRequired !== 3 &&
        sellItem.serial !== null &&
        sellItem.serial !== '' &&
        sellItem.serial?.length !== element.numberValue
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `${element.name} chưa đúng định dạng, Seri phải đủ ${element.numberValue} ký tự`,
        });
        return;
      }
      if (
        element.ref_Name === 'IMEI2' &&
        element.isRequired !== 2 &&
        element.isRequired !== 3 &&
        sellItem.IMEI2 !== null &&
        sellItem.IMEI2 !== '' &&
        sellItem.IMEI2?.length !== element.numberValue
      ) {
        isValid = false;
        onFinish({
          statusId: 500,
          messager: `${element.name} chưa đúng định dạng, Seri phải đủ ${element.numberValue} ký tự`,
        });
        return;
      }

      const filterList = JSON.parse(element.filterList || '{}');
      if (
        element.filterList?.length > 0 &&
        typeof filterList === 'object' &&
        filterList !== null &&
        !Array.isArray(filterList) &&
        sellItem[element.ref_Name] !== null &&
        sellItem[element.ref_Name] !== ''
      ) {
        // '{"isCheckCharacters":1,"numCharacters":1,"numDigits":6,"characterPosition":1}'

        if (filterList.isCheckCharacters === 1) {
          const textPosition = findFirstLetterPosition(
            sellItem[element.ref_Name],
          );
          if (textPosition == -1) {
            isValid = false;
            onFinish({
              statusId: 500,
              messager: `${element.name} chưa đúng định dạng, Seri phải có ký tự chữ`,
            });
            return;
          } else if (
            filterList.characterPosition != undefined &&
            filterList.characterPosition > 0 &&
            textPosition + 1 != filterList.characterPosition
          ) {
            isValid = false;
            onFinish({
              statusId: 500,
              messager: `${element.name
                } chưa đúng định dạng, ký tự chữ phải nằm ở vị trí ${filterList.characterPosition == 1
                  ? 'đầu tiên'
                  : 'thứ' + filterList.characterPosition
                }`,
            });
            return;
          }

          const lettersOnly = sellItem[element.ref_Name].replace(
            /[^a-zA-Z]/g,
            '',
          );
          const digitsOnly = sellItem[element.ref_Name].match(/\d/g);

          if (
            filterList.numCharacters != undefined &&
            filterList.numCharacters != lettersOnly.length
          ) {
            isValid = false;
            onFinish({
              statusId: 500,
              messager: `${element.name} sai định dạng, yêu cầu : ${filterList.numCharacters} Ký tự chữ cái vị trí đầu tiên và ${filterList.numDigits} ký tự số`,
            });
            return;
          }
          if (
            filterList.numDigits != undefined &&
            filterList.numDigits != digitsOnly.length
          ) {
            isValid = false;
            onFinish({
              statusId: 500,
              messager: `${element.name} sai định dạng, yêu cầu : ${filterList.numCharacters} Ký tự chữ cái vị trí đầu tiên và ${filterList.numDigits} ký tự số`,
            });
            return;
          }
        }
      }

      if (
        lstReport?.isCheckIMEI !== -1 &&
        ((element.ref_Name === 'serial' &&
          sellItem.serial !== null &&
          sellItem.serial !== '') ||
          (element.ref_Name === 'IMEI2' &&
            sellItem.IMEI2 !== null &&
            sellItem.IMEI2 !== ''))
      ) {
        if (
          lstReport?.isOnlyNumber == 1 &&
          (sellItem.serial.match(/^[a-zA-Z]+$/) ||
            sellItem.IMEI2.match(/^[a-zA-Z]+$/))
        ) {
          isValid = false;
          onFinish({
            statusId: 500,
            messager: `Số Seri chỉ chứa số và không chứa ký tự hoặc ký tự đặc biệt!`,
          });
          return;
        }
        if (lstReport?.isOtherCheck == 1) {
          if (element.ref_Name === 'IMEI2') {
            let lstSellout2 = await Check2IMEISellout(
              sellItem.serial,
              sellItem.IMEI2,
              selectedProducts.productId,
              sellItem.sellId,
              lstReport?.checkDuplicate,
            );

            if (lstSellout2?.length > 0) {
              isValid = false;
              onFinish({
                statusId: 500,
                messager: `số Seri ${sellItem.serial},${sellItem.IMEI2} đã tồn tại `,
              });
              return;
            }
          }
        } else {
          let lstSellout = await CheckIMEISellout(
            element.ref_Name === 'serial' ? sellItem.serial : sellItem.IMEI2,
            element.ref_Name,
          );
          if (lstSellout?.length > 0 && LoadHistory === false) {
            isValid = false;
            onFinish({
              statusId: 500,
              messager: `Số Seri này đã tồn tại ${element.ref_Name === 'serial' ? sellItem.serial : sellItem.IMEI2
                }`,
            });
            return;
          }
        }
        if (lstReport?.isCheckIMEISystem == 1) {
          if (lstReport?.isDoubleImei == 1 && sellItem.IMEI2 !== null) {
            const checkIMEIServer = await checkIMEI2(
              sellItem.serial,
              sellItem.IMEI2,
              selectedProducts.productCode,
            );
            if (checkIMEIServer !== null && checkIMEIServer.length > 0) {
              isValid = false;
              onFinish({
                statusId: 500,
                messager: checkIMEIServer[0].messager,
                showModal: true,
              });
              return;
            }
          } else if (lstReport?.isDoubleImei !== 1) {
            const checkIMEIServer = await checkIMEI(
              element.ref_Name === 'serial' ? sellItem.serial : sellItem.IMEI2,
              selectedProducts.productCode,
            );
            if (checkIMEIServer !== null && checkIMEIServer.length > 0) {
              isValid = false;
              onFinish({
                statusId: 500,
                messager: checkIMEIServer[0].messager,
                showModal: true,
              });
              return;
            }
          }
        }
      }
      if (
        lstReport?.isMismatched !== 1 &&
        element.ref_Name === 'IMEI2' &&
        sellItem.serial !== null &&
        sellItem.serial !== '' &&
        sellItem.IMEI2 == sellItem.serial
      ) {
        isValid = false;
        onFinish({ statusId: 500, messager: `2 số serial phải khác nhau!` });
        return;
      }
      if (
        element.ref_Name === 'photo' &&
        element.isRequired === 1 &&
        (selectedProducts.competitorId == _competitorId ||
          selectedProducts.competitorId == null ||
          selectedProducts.competitorId == undefined)
      ) {
        const listPhoto = await getPhotosByGuiId(guiId, workinfo.shopId);
        if (listPhoto.length == undefined || listPhoto.length == 0) {
          onFinish({
            statusId: 500,
            messager: `Bạn chưa chụp hình ảnh hoá đơn, số lượng cần chụp là ${element.numberValue}`,
          });
          return;
        }
        if (listPhoto.length < element.numberValue) {
          onFinish({
            statusId: 500,
            messager: `Số lượng hình ảnh hoá đơn cần chụp không đủ ${listPhoto.length}/${element.numberValue}`,
          });
          return;
        }
      }
      if (index === MasterList?.length - 1 && isValid === true) {
        onFinish({ statusId: 200 });
      }
    }
  };

  const onSaveSOItem = async () => {
    // console.log(selectedProducts, 'selectedProducts')
    // console.log(nameCompetitor, 'nameCompetitor')
    // console.log(nameShop, 'nameShop')

    let day = parseInt(Moment(new Date()).format('YYYYMMDD'));
    if (workinfo.workDate === day) {
      await setLoading(true);
      await onValidated(async result => {
        if (result?.statusId === 500) {
          if (result.showModal) {
            await setMessager(result.messager);
            await handleVisibleModal(true);
          } else {
            toastError('Lỗi', result.messager);
          }
          return;
        } else {
          let serial = '';
          let IMEI2 = '';
          if (sellItem.serial?.length > 0) {
            const itemSerial = MasterList.filter(
              it => it.ref_Name === 'serial',
            );
            serial = formatCard(sellItem.serial || '', itemSerial || 6);
          }
          if (sellItem.IMEI2?.length > 0) {
            const itemSerial2 = MasterList.filter(
              it => it.ref_Name === 'IMEI2',
            );
            IMEI2 = formatCard(sellItem.IMEI2 || '', itemSerial2 || 6);
          }

          await Store().then(async db => {
            const item = {
              workId: workinfo.workId,
              shopId: workinfo.shopId,
              reportDate: sellItem.reportDate,
              productId: selectedProducts.id || 0,
              productCode: selectedProducts.productCode || '',
              productName: selectedProducts.productName || '',
              serial: serial || '',
              IMEI2: IMEI2 || '',
              quantity:
                serial.length > 0 && serial !== null && serial !== 'null'
                  ? 1
                  : sellItem.quantity,
              price: sellItem.price || '',
              sellType: selectedProducts.type,
              sellComment: sellItem.sellComment || '',
              customer: sellItem.customer || '',
              address: sellItem.address || '',
              phone: sellItem.phone || '',
              gender: sellItem.gender || '',
              age: sellItem.age || '',
              color: sellItem.color || '',
              guiId: guiId,
              competitorId: selectedProducts?.competitorId || _competitorId,
              division: selectedProducts?.competitor || _competitorName,
              category: selectedProducts?.category || '',
              categoryId: selectedProducts?.categoryId || 0,
              subcategory: selectedProducts?.subcategory || '',
              segment: selectedProducts?.segment || '',
              subsegment: selectedProducts?.subsegment || '',
              flag: sellItem.flag ? 1 : 0,
              statusVerify: sellItem.statusVerify || '',
              itemClassify: sellItem.itemClassify || '',
              promotionType: sellItem.promotionType || '',
              taxCode: sellItem.taxCode || '',
              email: sellItem.email || '',
              paymentMethod: sellItem.paymentMethod || '',
              deposit: JSON.stringify(sellItem.deposit) || '',
              billCode: sellItem.billCode || '',
              upload: 0,
            };
            if (LoadHistory === true) {
              await UpdateItem(db, sellOut.tableName, item, {
                sellId: ItemSaved.sellId,
              });
              infoSave.dataInfoSave = infoSave.tickInfoSave == true ? item : {};
              await resetAndClose();
              toastSuccess('Thông báo', 'Đã lưu');
            } else {
              await SellOutInsert(item);
              infoSave.dataInfoSave = infoSave.tickInfoSave == true ? item : {};
              await resetAndClose();
              toastSuccess('Thông báo', 'Đã lưu');
            }
          });
        }
      });
      await setLoading(false);
    } else {
      toastError('Bạn đang báo cáo dữ liệu ngày cũ!');
    }
  };
  const resetAndClose = async () => {
    await setSelectProduct({});
    await Closed();
  };
  const deletePhoto = async () => {
    await deleteItemPhotoByGuiId(guiId);
  };
  const handleGoback = async () => {
    await resetAndClose();
    if (!LoadHistory) await deletePhoto();
  };
  const closeBottomSheet = async () => {
    await setVisibleModal(false);
    await setPageNext(0);
  };
  const onNextPage = refName => {
    const indexPage = pageList[refName] || 0;
    const indexPageProduct = pageList.products || 0;
    if (
      selectedProducts.competitorId == _competitorId ||
      (selectedProducts.competitorId !== _competitorId &&
        indexPageProduct !== indexPage + 1)
    ) {
      setPageNext(indexPage + 1);
      setVisibleModal(true);
    } else {
      closeBottomSheet();
    }
  };
  const selectItem = async (item, refName) => {
    switch (refName) {
      case 'competitor':
        const filerCategoryList = Categories.filter(
          cat => cat.division == item.name,
        );
        await setCategory(filerCategoryList);
        const lstProduct = Products.filter(pro => pro.division === item.name);
        await setProduct({ dataView: lstProduct, dataFilter: lstProduct });
        setSelectProduct({ [refName]: item.name, competitorId: item.id });
        await onNextPage(refName);
        break;
      case 'category':
        //delete product
        if (selectedProducts.id) {
          delete selectedProducts.id;
          delete selectedProducts.productId;
          delete selectedProducts.products;
          delete selectedProducts.productName;
          delete selectedProducts.productCode;
        }
        //filter subcate
        const _subcate = SubCategories.filter(
          sc => sc.category == item.name && sc.division === item.division,
        );
        await setSubCategory(_subcate);
        //filter segment
        const _segment = Segments.filter(
          seg => seg.category == item.name && seg.division === item.division,
        );
        await setSegment(_segment);
        let lstProFil = Products.filter(
          pro =>
            (selectedProducts.competitor === undefined
              ? item.division !== undefined
                ? pro.division === item.division
                : item.division === undefined
              : pro.division === selectedProducts.competitor) &&
            pro.category === item.name,
        );
        await setProduct({ dataView: lstProFil, dataFilter: lstProFil });
        setSelectProduct({
          ...selectedProducts,
          [refName]: item.name,
          categoryId: item.id,
        });
        if (
          (lstReport?.isCheckModel == undefined ||
            lstReport?.isCheckModel == 1) &&
          selectedProducts.competitorId == _competitorId
        ) {
          await onNextPage(refName);
        } else {
          await closeBottomSheet();
        }

        break;
      case 'subcategory':
        if (selectedProducts.id) {
          delete selectedProducts.id;
          delete selectedProducts.productId;
          delete selectedProducts.products;
          delete selectedProducts.productName;
          delete selectedProducts.productCode;
        }
        const _dataSubCate = await SubCategories.filter(
          sc => sc.category == item.category && sc.division === item.division,
        );
        await setSubCategory(_dataSubCate);
        const _subProduct = Products.filter(pro => {
          return (
            (selectedProducts.competitor === undefined ||
              pro.division === selectedProducts.competitor) &&
            (selectedProducts.category === undefined ||
              pro.category === selectedProducts.category) &&
            pro.subCategory === item.name
          );
        });
        await setProduct({ dataView: _subProduct, dataFilter: _subProduct });
        setSelectProduct({ ...selectedProducts, [refName]: item.name });
        await onNextPage(refName);
        break;
      case 'segment':
        if (selectedProducts.id) {
          delete selectedProducts.id;
          delete selectedProducts.productId;
          delete selectedProducts.products;
          delete selectedProducts.productName;
          delete selectedProducts.productCode;
        }
        setSelectProduct({ ...selectedProducts, [refName]: item.name });
        SubSegment.filter(sseg => sseg.segment === item.name).forEach(
          result => {
            dataSubSegment.push(result);
          },
        );
        let sListProduct = Products.filter(
          pro =>
            (selectedProducts.competitor === undefined ||
              pro.division === selectedProducts.competitor) &&
            (selectedProducts.category === undefined ||
              pro.category === selectedProducts.category) &&
            (selectedProducts.subcategory === undefined ||
              pro.subcategory === selectedProducts.subcategory) &&
            pro.segment === item.name,
        );

        await setProduct({ dataView: sListProduct, dataFilter: sListProduct });
        await onNextPage(refName);
        break;
      case 'subsegment':
        if (selectedProducts.id) {
          delete selectedProducts.id;
          delete selectedProducts.productId;
          delete selectedProducts.products;
          delete selectedProducts.productName;
          delete selectedProducts.productCode;
        }
        setSelectProduct({ ...selectedProducts, [refName]: item.name });
        let product = Products.filter(
          pro =>
            (selectedProducts.competitor === undefined ||
              pro.division === selectedProducts.competitor) &&
            (selectedProducts.category === undefined ||
              pro.category === selectedProducts.category) &&
            (selectedProducts.subcategory === undefined ||
              pro.subCategory === selectedProducts.subcategory) &&
            (selectedProducts.segment === undefined ||
              pro.segment === selectedProducts.segment) &&
            pro.subCategory === item.name,
        );
        await setProduct({ dataView: product, dataFilter: product });
        await onNextPage(refName);
        break;
      case 'products':
        setSelectProduct({
          ...selectedProducts,
          competitor: item.division,
          category: item.category,
          subcategory: MasterList.filter(i => i.ref_Name == 'subcategory')
            ?.length
            ? item.subCategory
            : undefined,
          segment: MasterList.filter(i => i.ref_Name == 'segment')?.length
            ? item.segment
            : undefined,
          subsegment: MasterList.filter(i => i.ref_Name == 'subsegment')?.length
            ? item.subSegment
            : undefined,
          id: item.id,
          productId: item.id,
          products: item.name,
          productName: item.name,
          productCode: item.productCode,
          isHavePrice: item.price ? 1 : 0,
        });
        (AppNameBuild === daikinApp ||
          AppNameBuild === toshibaApp ||
          config?.isUsePriceProduct == 1) &&
          setSellItem({ ...sellItem, price: item.price });
        closeBottomSheet();
        break;
      case 'gender':
        setSellItem({ ...sellItem, gender: item.name });
        await setVisibleModal(false);
        break;
      case 'age':
        setSellItem({ ...sellItem, age: item.name });
        await setVisibleModal(false);
        break;
      case 'color':
        setSellItem({ ...sellItem, color: item.name });
        await setVisibleModal(false);
        break;
      case 'other':
        if (item.id === 1) {
          let gui = LoadHistory ? ItemSaved?.guiId || guiId : guiId;
          showALbum(gui);
        } else if (item.id === 2) {
          takePhoto();
        } else {
          uploadFile();
        }
        break;
      default:
        break;
    }
  };
  const showALbum = async gui => {
    await setVisibleModal(false);
    let item = {
      reportId: 0,
      shopId: workinfo.shopId,
      guiId: gui,
      photoDate: workinfo.workDate,
    };

    Props.navigation.navigate('AlbumPhoto', item);
  };
  const takePhoto = async () => {
    await setVisibleModal(false);
    let item = {
      reportId: 0,
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      guiId: guiId,
      photoDate: workinfo.workDate,
    };

    Props.navigation.navigate('Camera', item);
  };
  const uploadFile = async () => {
    let photoinfo = {};
    let options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
    };
    await launchImageLibrary(options, async response => {
      if (!response.didCancel) {
        const newImageUrl = await NativeCamera.resizeImage(await response.uri);
        photoinfo = {
          reportId: 0,
          shopId: workinfo.shopId,
          shopCode: workinfo.shopCode,
          guid: guiId,
          photoDate: workinfo.workDate,
          photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
          photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
          photoPath: newImageUrl?.uri || response.uri,
          fileUpload: 0,
          dataUpload: 0,
        };

        await InsertPhotosItem(photoinfo);
      }
    });
  };
  const saveQRCode = barcode => {
    onIMEI(barcode[0].data);
    // onIMEI(barcode)
  };
  const scanQRCODE = () => {
    let settingCamera = { ...workinfo, QRCode: 1, callBack: saveQRCode };
    Props.navigation.navigate('Camera', settingCamera);
  };
  const showAttack = async () => {
    await setMdataTitle('Hoá đơn đính kèm');
    await setMdata([
      { name: 'Hình đã đính kèm', id: 1 },
      { name: 'Chụp hình', id: 2 },
      { name: 'Chọn trong thư viện', id: 3 },
    ]);
    await setVisibleModal(true);
  };
  const showShops = async () => {
    setMdata(Shops);
    await setVisibleModal(true);
  };
  const showListSelect = async item => {
    Keyboard.dismiss();
    if (item.filterList !== null && item.filterList?.length > 0) {
      let lstDrop = JSON.parse(item.filterList);
      await setMdataTitle(item.name);
      await setMdata(lstDrop);
      await setVisibleModal(true);
    } else {
      const indexPage = pageList[item.ref_Name] || 0;
      switch (item.ref_Name) {
        case 'bill':
          showAttack();
          break;
        default:
          setPageNext(indexPage);
          setVisibleModal(true);
          break;
      }
    }
  };
  const saveItemEnter = (item, text) => {
    if (item.ref_Name === 'serial' && lstReport?.isOnlyNumber == 1) {
      if (text !== null) {
        let textValue = text.replace(/\D/g, '');
        setSellItem({ ...sellItem, [item.ref_Name]: textValue });
      } else {
        setSellItem({ ...sellItem, [item.ref_Name]: null });
      }
    } else if (item.ref_Code === 'phone') {
      if (text !== null) {
        let textValue = text
          .replace(/\D+/g, '')
          .replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
        if (text?.length == 11)
          textValue = text
            .replace(/\D+/g, '')
            .replace(/(\d{3})(\d{4})(\d{4})/, '$1$2$3');
        (!sellItem[item.ref_Name] ||
          textValue == '' ||
          textValue?.length < 12) &&
          setSellItem({ ...sellItem, [item.ref_Name]: textValue });
      } else {
        setSellItem({ ...sellItem, [item.ref_Name]: null });
      }
    } else {
      if (item.ref_Name === 'serial' || item.ref_Name === 'IMEI2') {
        setSellItem({ ...sellItem, [item.ref_Name]: text.replace(/\s+/g, '') });
      } else {
        setSellItem({ ...sellItem, [item.ref_Name]: text });
      }
    }
  };
  const handlerSelectItem = (itemSelect, typeItem, itemMain) => {
    if (itemSelect.listByItem) {
      configDataByItem(itemSelect, typeItem, itemMain);
    } else {
      if (itemSelect.isSaveItem == 1) {
        setSellItem({ ...sellItem, [typeItem]: itemSelect });
      } else {
        setSellItem({ ...sellItem, [typeItem]: itemSelect.itemName });
      }
    }
  };
  const configDataByItem = async (itemSelect, typeItem, itemMain) => {
    let listData = [];
    if (sellItem[itemMain.ref_Name]?.itemName == itemSelect.itemName) {
      listData = JSON.parse(sellItem[itemMain.ref_Name]?.subList || '[]');
    }

    if (listData.length == 0) {
      listData = await GetByListCode(
        `"${itemSelect.listByItem}"`,
        itemSelect.groupName || null,
      );
    }
    let itemConfig = {
      itemSelect: itemSelect,
      dataShow: listData,
      typeItem: typeItem,
      itemMain: itemMain,
    };
    SheetManager.show('listByItem', { payload: itemConfig });
  };
  const onNumberChanged = (item, text) => {
    if (text === null || text === '' || text.toString().trim() === '') {
      setSellItem({ ...sellItem, [item.ref_Name]: null });
    } else {
      var intValue = text.toString().replace(/,/g, '');
      intValue = parseInt(intValue);
      intValue = isNaN(intValue) ? null : Math.round(intValue);
      setSellItem({ ...sellItem, [item.ref_Name]: intValue });
    }
  };
  const ItemViewSelect = ({ itemM }) => {
    return itemM.ref_Name !== 'products' ||
      (itemM.ref_Name == 'products' &&
        (selectedProducts.competitorId == _competitorId ||
          selectedProducts.competitorId == null ||
          selectedProducts.competitorId == undefined)) ? (
      <View style={{ backgroundColor: appcolor.lightgray, padding: 1 }}>
        <TouchableOpacity style={{ width: '100%' }}>
          <FormGroup
            key={itemM.ref_Name + itemM.code}
            rightFunc={() => (!LoadHistory ? showListSelect(itemM) : null)}
            iconRight="caret-down"
            iconRightStyle={{ color: appcolor.primary }}
            title={itemM.name}
            value={selectedProducts[itemM.ref_Name] || '--Chọn--'}
            useClearAndroid={false}
          />
        </TouchableOpacity>
      </View>
    ) : (
      <View />
    );
  };
  const onSelectTick = async () => {
    infoSave.tickInfoSave = !infoSave.tickInfoSave;
    await setMutate(e => !e);
  };
  const onSelectFlag = async () => {
    sellItem.flag = !sellItem.flag;
    await setMutate(e => !e);
  };
  const displayItem = () => {
    return MasterList?.map((itemM, index) => {
      switch (itemM.ref_Code) {
        case 'selected':
          return <ItemViewSelect key={`s${index}`} itemM={itemM} />;
        case 'scan':
          return (
            <NumericFormat
              key={`sc${index}`}
              disabled={true}
              value={sellItem[itemM.ref_Name] || ''}
              displayType={'text'}
              format={itemM?.textValue}
              renderText={value => (
                <FormGroup
                  editable={itemM.ref_Id === 1 ? false : true}
                  key={index}
                  inputRef={ref => (refInputs.current[index] = ref)}
                  title={itemM.name}
                  rightFunc={() => scanQRCODE()}
                  iconRight="barcode"
                  value={value}
                  returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
                  keyboardType={itemM.code === 'm2' ? 'numeric' : 'default'}
                  // placeholder={itemM.ref_Id === 1 ? itemM.name : 'Nhập ' + itemM.name + ' ở đây'}
                  placeholder={itemM.textValue || itemM.name}
                  blurOnSubmit={false}
                  handleChangeForm={text => saveItemEnter(itemM, text)}
                  onSubmitEditing={() =>
                    handlerTextInput(
                      index,
                      MasterList[index + 1] !== undefined
                        ? MasterList[index + 1].ref_Id
                        : 0,
                    )
                  }
                  onClearTextAndroid={() => saveItemEnter(itemM, '')}
                />
              )}
            />
          );
        case 'number':
          if (
            itemM.ref_Name !== 'price' ||
            (itemM.ref_Name == 'price' &&
              (selectedProducts.competitorId == _competitorId ||
                selectedProducts.competitorId == null ||
                selectedProducts.competitorId == undefined))
          ) {
            return (
              <NumericFormat
                key={`n${index}`}
                disabled={true}
                value={sellItem[itemM.ref_Name] || ''}
                displayType={'text'}
                thousandSeparator
                renderText={value => (
                  <FormGroup
                    editable={
                      itemM.ref_Name === 'price'
                        ? AppNameBuild === daikinApp ||
                          AppNameBuild === toshibaApp
                          ? selectedProducts.isHavePrice === 1 ||
                            itemM.ref_Id === 1
                            ? false
                            : true
                          : itemM.ref_Id === 1
                            ? false
                            : true
                        : itemM.ref_Id === 1
                          ? false
                          : true
                    }
                    key={index}
                    inputRef={ref => (refInputs.current[index] = ref)}
                    returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
                    placeholder={
                      itemM.ref_Id === 1
                        ? itemM.name
                        : 'Nhập ' + itemM.name + ' ở đây'
                    }
                    value={value}
                    title={itemM.name}
                    inputStyle={{ textAlign: 'right' }}
                    keyboardType="numeric"
                    handleChangeForm={text => onNumberChanged(itemM, text)}
                    onSubmitEditing={() =>
                      handlerTextInput(
                        index,
                        MasterList[index + 1] !== undefined
                          ? MasterList[index + 1].ref_Id
                          : 0,
                      )
                    }
                    returnKeyLabel={Platform.OS === 'ios' ? 'tiếp' : 'tiếp'}
                    onClearTextAndroid={() => onNumberChanged(itemM, null)}
                  />
                )}
              />
            );
          } else {
            return null;
          }

        case 'date':
          return (
            <FormGroup
              key={`date${index}`}
              rightFunc={() => showListSelect(itemM)}
              iconRight="caret-down"
              iconRightStyle={{ color: appcolor.primary }}
              title={itemM.name}
              value={Moment(
                sellItem.reportDate?.toString() || new Date(),
              ).format('YYYY-MM-DD')}
              useClearAndroid={false}
            />
          );
        case 'phone':
          return (
            <FormGroup
              title={itemM.name}
              isRequired={itemM.isRequired == 1}
              key={itemM.ref_Name}
              value={formatPhone(sellItem[itemM.ref_Name] || '')}
              onClearTextAndroid={() => saveItemEnter(itemM, null)}
              handleChangeForm={text => saveItemEnter(itemM, text)}
              placeholder={itemM.textValue}
              keyboardType={'phone-pad'}
              maxLength={itemM.numberValue}
              editable={itemM.ref_Id === 1 ? false : true}
            />
          );
        case 'template':
          return (
            <FormGroup
              title={itemM.name}
              isRequired={itemM.isRequired == 1}
              key={itemM.ref_Name}
              value={
                lstReport?.isOnlyNumber == 1
                  ? sellItem[itemM.ref_Name]?.replace(/\D/g, '') || ''
                  : sellItem[itemM.ref_Name] || ''
              }
              handleChangeForm={text => saveItemEnter(itemM, text)}
              onClearTextAndroid={() => saveItemEnter(itemM, null)}
              keyboardType={lstReport?.isOnlyNumber ? 'numeric' : 'default'}
              placeholder={itemM.textValue}
              maxLength={itemM.numberValue}
              editable={itemM.ref_Id === 1 ? false : true}
            />
          );
        case 'tick':
          return (
            <View key={`Tick${index}`} style={{ alignItems: 'flex-end' }}>
              <CheckBox
                checked={infoSave?.tickInfoSave || false}
                title={'Giữ thông tin khách hàng'}
                textStyle={{ color: appcolor.dark, paddingRight: 5 }}
                containerStyle={{
                  maxWidth: Dimensions.get('screen').width / 1.6,
                  borderRadius: 10,
                  backgroundColor: appcolor.surface,
                  borderColor: appcolor.light,
                }}
                onPress={() => onSelectTick()}
              ></CheckBox>
            </View>
          );
        case 'itemSelected':
          const data = JSON.parse(itemM.filterList || '[]');
          let valueItem =
            sellItem[itemM.ref_Name] != null &&
              typeof sellItem[itemM.ref_Name] == 'object'
              ? sellItem[itemM.ref_Name].itemName
              : sellItem[itemM.ref_Name];
          let subList = [];
          if (
            sellItem[itemM.ref_Name]?.itemName &&
            sellItem[itemM.ref_Name]?.subList
          ) {
            valueItem = sellItem[itemM.ref_Name]?.itemName;
            subList = JSON.parse(sellItem[itemM.ref_Name].subList || '[]');
          }
          return (
            <View key={`Select${index}`} style={{ flex: 1 }}>
              <MutipleItemSelected
                key={'itemSelected_' + index}
                isRequire={itemM.isRequired == 1}
                typeItem={itemM.ref_Name}
                isFilter={data.length > 5}
                titleName={itemM.name}
                dataItems={data}
                itemMain={itemM}
                defaultValue={valueItem}
                onItemChoose={handlerSelectItem}
              />
              {subList.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    configDataByItem(
                      sellItem[itemM.ref_Name],
                      itemM.ref_Name,
                      itemM,
                    )
                  }
                  style={{
                    flex: 1,
                    backgroundColor: appcolor.transparent,
                    marginLeft: 40,
                    borderRadius: 8,
                    padding: 8,
                    paddingHorizontal: 16,
                    backgroundColor: appcolor.surface,
                  }}
                >
                  {subList.map((it, idx) => {
                    const value =
                      it.ref_Code == 'number'
                        ? formatNumber(it.itemValue, ',')
                        : it.itemValue;
                    return (
                      <View
                        key={`subList_${idx}`}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingBottom: 4,
                          shadowColor: '#000',
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: appcolor.dark,
                            flex: 1,
                          }}
                        >
                          {it.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: fontWeightBold,
                            color: appcolor.dark,
                          }}
                        >
                          {value ?? '-'}
                        </Text>
                      </View>
                    );
                  })}
                </TouchableOpacity>
              )}
            </View>
          );

        case 'flag':
          return (
            <View key={`Tick${index}`} style={{ alignItems: 'flex-end' }}>
              <CheckBox
                checked={sellItem?.flag || false}
                title={itemM.name}
                textStyle={{ color: appcolor.dark, paddingRight: 5 }}
                containerStyle={{
                  maxWidth: Dimensions.get('screen').width / 1.6,
                  borderRadius: 10,
                  backgroundColor: appcolor.surface,
                  borderColor: appcolor.light,
                }}
                onPress={() => onSelectFlag()}
              ></CheckBox>
            </View>
          );
        case 'takePhoto':
          return (
            <View
              key={`${index}`}
              style={{
                backgroundColor: appcolor.surface,
                justifyContent: 'space-between',
                borderRadius: 10,
                padding: 10,
              }}
            >
              <ViewPhotoInvoice
                key={'ViewInvoicephoto'}
                guiId={guiId}
                Props={Props}
                itemM={itemM}
                handleShowImage={handleShowImage}
                config={config}
              />
            </View>
          );
        default:
          return (
            <FormGroup
              key={`f${index}`}
              isRequired={itemM.isRequired == 1}
              editable={itemM.ref_Id === 1 ? false : true}
              title={itemM.name}
              inputRef={ref => (refInputs.current[index] = ref)}
              value={sellItem[itemM.ref_Name] || ''}
              returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
              keyboardType={itemM.code === 'm2' ? 'numeric' : 'default'}
              placeholder={
                itemM.ref_Id === 1
                  ? itemM.name
                  : 'Nhập ' + itemM.name + ' ở đây'
              }
              blurOnSubmit={false}
              handleChangeForm={text => saveItemEnter(itemM, text)}
              onSubmitEditing={() =>
                handlerTextInput(
                  index,
                  MasterList[index + 1] !== undefined
                    ? MasterList[index + 1].ref_Id
                    : 0,
                )
              }
              onClearTextAndroid={() => saveItemEnter(itemM, '')}
            />
          );
      }
    });
  };
  const handleShowImage = async (itemImage, listImage, indexImage) => {
    dataImage.listPhoto = itemImage;
    dataImage.indexPhoto = indexImage;
    SheetManager.show('imageSheet');
  };

  const renderItem = (item, index, refName) => {
    const onPressItem = async () => {
      await selectItem(item, refName);
    };
    return (
      <TouchableOpacity
        key={item.id + item.name}
        style={{
          backgroundColor: appcolor.grayLight,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          marginBottom: 1,
        }}
        onPress={onPressItem}
      >
        <Text
          style={{
            width: '80%',
            fontSize: scaleSize(15),
            fontWeight: '500',
            color: appcolor.dark,
          }}
        >
          {index + 1}. {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  const ProductView = () => {
    let uiView = [];
    var _pageTemp = {};
    MasterList.forEach((m, i) => {
      switch (m.ref_Name) {
        case 'reportDate':
          _pageTemp = { [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={'reportDate'}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              <Calendar
                firstDay={1}
                current={Moment(
                  sellItem.reportDate?.toString() || new Date(),
                ).format('yyyy-MM-DD')}
                maxDate={Moment(new Date()).format('yyyy-MM-DD')}
                minDate={config.isLockMonth == 1 ? minDateCalendar : null}
                monthFormat={'MM - yyyy'}
                hideExtraDays={true}
                theme={{
                  backgroundColor: appcolor.light,
                  calendarBackground: appcolor.surface,
                  todayTextColor: appcolor.highlightDate,
                  selectedDayTextColor: appcolor.white,
                  dayTextColor: appcolor.dark,
                  monthTextColor: appcolor.dark,
                }}
                markedDates={dataCalendar.markedDates}
                onDayPress={date => handlerSelectCalendar(date, m.ref_Name)}
              />
            </View>,
          );
          break;
        case 'competitor':
          const dataDivisionlist = dataDivision.filter(it =>
            m.ref_Id == 1 ? it.id == _competitorId : it,
          );
          _pageTemp = { [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={0}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              {
                <FlatList
                  key="dataDivision"
                  keyExtractor={(_, index) => index.toString()}
                  data={dataDivisionlist}
                  renderItem={({ item, index }) =>
                    renderItem(item, index, m.ref_Name)
                  }
                />
              }
            </View>,
          );
          break;
        case 'category':
          _pageTemp = { ..._pageTemp, [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={1}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              <FlatList
                key="dataCategory"
                keyExtractor={(_, index) => index.toString()}
                data={dataCategory}
                renderItem={({ item, index }) =>
                  renderItem(item, index, m.ref_Name)
                }
              />
            </View>,
          );
          break;
        case 'subcategory':
          _pageTemp = { ..._pageTemp, [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={2}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              <FlatList
                key="subcate"
                keyExtractor={(_, index) => index.toString()}
                data={dataSubCategory}
                renderItem={({ item, index }) =>
                  renderItem(item, index, m.ref_Name)
                }
              />
            </View>,
          );
          break;
        case 'segment':
          _pageTemp = { ..._pageTemp, [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={3}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              <FlatList
                key="dataSegment"
                keyExtractor={(_, index) => index.toString()}
                data={dataSegment}
                renderItem={({ item, index }) =>
                  renderItem(item, index, m.ref_Name)
                }
              />
            </View>,
          );
          break;
        case 'subsegment':
          _pageTemp = { ..._pageTemp, [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={4}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              <FlatList
                key="dataSubSegment"
                keyExtractor={(_, index) => index.toString()}
                data={dataSubSegment}
                renderItem={({ item, index }) =>
                  renderItem(item, index, m.ref_Name)
                }
              />
            </View>,
          );
          break;
        case 'products':
          _pageTemp = { ..._pageTemp, [m.ref_Name]: i };
          uiView.push(
            <View style={{ flex: 1 }} key={4}>
              <View
                style={{ flexDirection: 'row', padding: 12, width: '100%' }}
              >
                <Text
                  style={{
                    flexGrow: 1,
                    marginLeft: 12,
                    fontSize: scaleSize(22),
                    color: appcolor.dark,
                  }}
                >
                  {m.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: appcolor.surface,
                  width: '100%',
                }}
              />

              <FormGroup
                containerStyle={{
                  backgroundColor: appcolor.grayLight,
                  margin: 8,
                  padding: 3,
                  paddingEnd: 8,
                }}
                inputStyle={{ fontSize: 13, color: appcolor.dark }}
                placeholder="Tìm kiếm sản phẩm"
                iconName="search"
                editable
                handleChangeForm={text => filterItem(text, 'products')}
                onClearTextAndroid={() => filterItem('', 'products')}
              />
              <FlatList
                key="dataProducts"
                keyExtractor={(_, index) => index.toString()}
                data={dataProducts.dataView}
                initialNumToRender={15}
                scrollEventThrottle={16}
                renderItem={({ item, index }) =>
                  renderItem(item, index, m.ref_Name)
                }
                ListFooterComponent={<View style={{ height: 100 }} />}
              />
            </View>,
          );

          break;
        default:
          break;
      }
    });
    pageList = _pageTemp;
    return uiView;
  };
  const handlerSelectCalendar = async (date, refName) => {
    const dateString = date.dateString;
    if (dateString !== null && dateString !== undefined) {
      let currentDate = parseInt(Moment().format('YYYYMMDD'));
      if (parseInt(Moment(dateString).format('YYYYMMDD')) > currentDate) {
        alertWarning(
          'Vui lòng chọn ngày báo cáo không được lớn hơn ngày hiện tại!',
        );
        return;
      }

      const markedDates = {};
      markedDates[dateString] = {
        selected: true,
        selectedColor: appcolor.primary,
        textColor: appcolor.white,
      };
      await setDataCalendar({
        ...dataCalendar,
        markedDates: markedDates,
      });
      await setSellItem({ ...sellItem, reportDate: dateString });
      const indexPage = pageList[refName] || 0;
      await setTimeout(() => setPageNext(indexPage + 1), 200);
    } else {
      await setDataCalendar({
        ...dataCalendar,
        markedDates: dataCalendar.markedDatesDefault,
      });
    }
  };
  const handleVisibleModal = async visible => {
    await setVisible(visible);
  };
  const handleVisible = async typeSheet => {
    SheetManager.hide(typeSheet || 'imageSheet');
  };
  const handlerShowModal = resultMessager => {
    setMessager(resultMessager);
    handleVisibleModal(true);
  };
  const handlerSaveData = (dataSave, typeItem, sheetId) => {
    setSellItem({ ...sellItem, [typeItem]: dataSave });
    SheetManager.hide(sheetId || 'imageSheet');
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        iconRight={'save'}
        title={'Doanh số bán (Sellout)'}
        leftFunc={handleGoback}
        iconLeft="times"
        rightFunc={loading ? null : () => onSaveSOItem()}
      />

      <LoadingView
        title={'Đang lưu dữ liệu...'}
        isLoading={loading}
        styles={{ marginTop: 8 }}
      />
      {!loading && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
          enabled
          keyboardVerticalOffset={60}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 12 }}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            {Dashboard && (
              <FormGroup
                value={nameShop !== undefined ? nameShop : HOLDER_TEXT}
                iconRight="caret-down"
                title="Cửa hàng"
                rightFunc={() => showShops()}
              />
            )}
            <View style={{ flex: 1, height: '100%' }}>{displayItem()}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      {isVisible && (
        <ModalNotify
          messager={messager}
          visible={isVisible}
          handleVisibleModal={handleVisibleModal}
          titleConfirm={'Đóng'}
        />
      )}
      <Modal
        visible={visibleModal}
        style={{ flex: 1, backgroundColor: appcolor.danger }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
          <TouchableOpacity
            onPress={() => closeBottomSheet()}
            style={{
              zIndex: 100,
              padding: 20,
              position: 'absolute',
              right: 0,
              top: Platform.OS === 'ios' ? 20 : -10,
            }}
          >
            <SpiralIcon size={32} name="close" />
          </TouchableOpacity>
          <Swiper
            ref={swiperRef}
            index={pageNum}
            loop={false}
            onIndexChanged={setPageNext}
          >
            {ProductView()}
          </Swiper>
        </SafeAreaView>
      </Modal>
      <ActionSheet
        id={'imageSheet'}
        containerStyle={{
          height: deviceHeight * 0.9,
          width: deviceWidth,
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <ViewImageSheet dataImage={dataImage} handleVisible={handleVisible} />
      </ActionSheet>
      <ActionSheet
        id={'listByItem'}
        closeOnPressBack={false}
        closeOnTouchBackdrop={false}
        keyboardHandlerEnabled={false}
        onBeforeShow={data => setModalItem(data)}
        containerStyle={{
          height: deviceHeight * 0.85,
          width: deviceWidth,
          backgroundColor: appcolor.transparent,
          paddingBottom: insets.bottom,
        }}
      >
        <ViewItemByList
          modalItem={modalItem}
          handleVisible={handleVisible}
          handlerShowModal={handlerShowModal}
          handlerSaveData={handlerSaveData}
        />
      </ActionSheet>
    </View>
  );
};
const ViewItemByList = ({
  modalItem,
  handleVisible,
  handlerShowModal,
  handlerSaveData,
}) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [dataConfig, setDataConfig] = useState({});
  const [_mutate, setMutate] = useState(false);

  const onSaveData = () => {
    Keyboard.dismiss();
    validData(result => {
      if (result) {
        let dataSave = [];
        modalItem.dataShow?.map(it =>
          dataSave.push({
            id: it.id,
            code: it.code,
            filterList: it.filterList,
            isRequired: it.isRequired,
            itemValue:
              it.ref_Code == 'date' && !it.itemValue
                ? Moment(new Date()).format('yyyy-MM-DD')
                : it.itemValue,
            name: it.name,
            ref_Code: it.ref_Code,
            ref_Id: it.ref_Id,
          }),
        );
        const itemSave = {
          ...modalItem.itemSelect,
          subList: JSON.stringify(dataSave),
        };

        handlerSaveData(itemSave, modalItem.typeItem, 'listByItem');
        return;
      }
    });
  };
  const validData = onFinish => {
    for (let index = 0; index < modalItem.dataShow?.length || 0; index++) {
      const item = modalItem.dataShow[index];
      if (
        item.isRequired == 1 &&
        (!item.itemValue || item.itemValue?.length == 0)
      ) {
        const action = item.ref_Code == 'number' ? 'nhập' : 'chọn';
        const titleError = `Bạn chưa ${action} ${item.name}`;
        handlerShowModal(titleError);
        onFinish(false);
        return;
      }
    }
    onFinish(true);
  };

  const handlerChangeData = (itemChild, value, type) => {
    switch (type) {
      case 'number':
        itemChild.itemValue = value;
        if (value === null || value === '' || value.toString().trim() === '') {
          itemChild.itemValue = null;
        } else {
          let intValue = value.toString().replace(/,/g, '');
          intValue = parseInt(intValue);
          intValue = isNaN(intValue) ? null : Math.round(intValue);
          itemChild.itemValue = intValue;
        }
        return;
      case 'date':
        itemChild.itemValue = value;
        setMutate(e => !e);
        return;
      case 'selected':
        itemChild.itemValue = value.itemName;
        setMutate(e => !e);
        return;
    }
  };
  const InputNumber = ({ itemChild, indexChild }) => {
    const handlerChange = text => {
      handlerChangeData(itemChild, text, 'number');
    };
    const onEndEditing = () => {
      setMutate(e => !e);
    };
    const onClearText = () => {
      handlerChangeData(itemChild, '', 'number');
      onEndEditing();
    };
    return (
      <NumericFormat
        key={`subItem_${indexChild}`}
        disabled={true}
        value={itemChild.itemValue || ''}
        displayType={'text'}
        thousandSeparator
        renderText={value => (
          <FormGroup
            editable={itemChild.ref_Id === 1 ? false : true}
            key={`Input_${indexChild}`}
            isRequired={itemChild.isRequired == 1}
            returnKeyType={Platform.OS === 'ios' ? 'done' : 'next'}
            placeholder={
              itemChild.ref_Id === 1
                ? itemChild.name
                : 'Nhập ' + itemChild.name + ' ở đây'
            }
            defaultValue={value}
            title={itemChild.name}
            inputStyle={{ textAlign: 'right' }}
            keyboardType="numeric"
            handleChangeForm={handlerChange}
            onEndEditing={() => setMutate(e => !e)}
            returnKeyLabel={Platform.OS === 'ios' ? 'tiếp' : 'tiếp'}
            onClearTextAndroid={onClearText}
          />
        )}
      />
    );
  };
  const SelectItem = ({ itemChild, indexChild }) => {
    const data = JSON.parse(itemChild.filterList || '[]');
    const handlerSelectItem = (item, typeItem) => {
      handlerChangeData(itemChild, item, 'selected');
    };
    return (
      <MutipleItemSelected
        key={'itemSelected_' + indexChild}
        isRequire={itemChild.isRequired == 1}
        typeItem={itemChild.ref_Name}
        isFilter={data.length > 5}
        titleName={itemChild.name}
        dataItems={data}
        containerStyle={{ padding: 0 }}
        filterStyle={{ backgroundColor: appcolor.light }}
        defaultValue={itemChild.itemValue}
        onItemChoose={handlerSelectItem}
      />
    );
  };
  const SelectDate = ({ itemChild, indexChild }) => {
    const handlerSelectDate = date => {
      handlerChangeData(itemChild, date.dateString, 'date');
    };
    if (!itemChild.itemValue) {
      itemChild.itemValue = Moment(new Date()).format('yyyy-MM-DD');
    }
    const currentDate =
      Moment(itemChild.itemValue) || Moment(new Date()).format('yyyy-MM-DD');
    return (
      <View style={{ flex: 1, paddingBottom: 12 }} key={`Date_${indexChild}`}>
        <Text
          style={{
            color: appcolor.dark,
            fontSize: 13,
            padding: 8,
            fontWeight: fontWeightBold,
          }}
        >
          {itemChild.name}
        </Text>
        <View
          style={{
            backgroundColor: appcolor.light,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'baseline',
            paddingHorizontal: 20,
            marginBottom: 10,
            elevation: 3,
            shadowColor: appcolor.dark,
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <Text
            style={{
              color: appcolor.placeholderText,
              fontSize: 36,
              fontWeight: '700',
              marginRight: 8,
            }}
          >
            {currentDate.date()}
          </Text>
          <Text
            style={{
              color: appcolor.greylight,
              fontSize: 16,
              fontWeight: '500',
            }}
          >
            {currentDate.format('MMM YYYY').toUpperCase()}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            elevation: 3,
            shadowColor: appcolor.dark,
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <Calendar
            firstDay={1}
            current={
              itemChild.itemValue || Moment(new Date()).format('yyyy-MM-DD')
            }
            minDate={Moment(new Date()).format('yyyy-MM-DD')}
            monthFormat={'MM - yyyy'}
            hideExtraDays={true}
            theme={{
              backgroundColor: appcolor.light,
              calendarBackground: appcolor.light,
              textSectionTitleColor: appcolor.dark,
              monthTextColor: appcolor.dark,
              dayTextColor: appcolor.dark,
              todayTextColor: appcolor.yellow,
              arrowColor: appcolor.dark,
              textDisabledColor: appcolor.placeholderText,
              selectedDayBackgroundColor: appcolor.yellow,
              selectedDayTextColor: appcolor.white,
            }}
            markedDates={{
              [itemChild.itemValue || Moment(new Date()).format('yyyy-MM-DD')]:
              {
                selected: true,
                selectedColor: appcolor.danger,
                textColor: appcolor.light,
              },
            }}
            onDayPress={handlerSelectDate}
          />
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: appcolor.surface,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 20,
          width: '100%',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          onPress={() => handleVisible('listByItem')}
          style={{ width: '15%' }}
        >
          <SpiralIcon
            name="close"
            reverse
            type="font-asomeware-5"
            size={20}
            iconStyle={{ color: appcolor.dark }}
            color={appcolor.light}
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            width: '70%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: appcolor.dark,
              fontWeight: fontWeightBold,
            }}
          >
            {modalItem.itemMain?.name || 'Thông tin'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onSaveData()} style={{ width: '15%' }}>
          <SpiralIcon
            name="save"
            reverse
            type="font-asomeware-5"
            size={20}
            iconStyle={{ color: appcolor.dark }}
            color={appcolor.light}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        key="id"
        data={modalItem.dataShow || []}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyExtractor={(_, indexChild) => indexChild.toString()}
        style={{ padding: 12 }}
        ListFooterComponent={<View style={{ height: deviceWidth / 2 }} />}
        renderItem={({ item, index }) => {
          switch (item.ref_Code) {
            case 'number':
              return <InputNumber itemChild={item} indexChild={index} />;
            case 'date':
              return <SelectDate itemChild={item} indexChild={index} />;
            case 'selected':
              return <SelectItem itemChild={item} indexChild={index} />;
          }
        }}
      />
    </View>
  );
};
const ViewImageSheet = ({ dataImage, handleVisible }) => {
  const [listImage, setListImage] = useState({});
  const appcolor = useSelector(state => state.GAppState.appcolor);

  useEffect(() => {
    loadData();
    return () => false;
  }, []);
  const loadData = () => {
    const itemImage = dataImage.listPhoto;
    setListImage(itemImage);
  };
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <TouchableOpacity
        onPress={() => handleVisible('imageSheet')}
        style={{
          position: 'absolute',
          right: 20,
          top: Platform.OS == 'ios' ? 40 : 20,
          zIndex: 100,
        }}
      >
        <SpiralIcon
          name="close"
          type="font-asomeware-5"
          size={30}
          color={appcolor.dark}
        />
      </TouchableOpacity>
      {listImage?.photoPath !== undefined && (
        <Image
          source={{ uri: listImage.photoPath }}
          resizeMode={'contain'}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </View>
  );
};

const ViewPhotoInvoice = ({ guiId, Props, itemM, handleShowImage, config }) => {
  const insets = useSafeAreaInsets();
  const { workinfo, kpiinfo, appcolor } = useSelector(state => state.GAppState);
  const [dataPhoto, setDataPhoto] = useState({ listPhoto: [], indexImage: 0 });
  const [isShowDelete, setShowDelete] = useState(false);
  const [listPhotoItem, setListPhotoItem] = useState();
  const [numDelete, setNumDelete] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    loadListPhoto();
    return () => false;
  }, []);
  const takePhoto = async () => {
    const photoinfo = {
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      reportId: config.isUseSellOut == 1 ? 5 : kpiinfo.kpiId,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoType: 'SELLOUT_INVOICE',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      guid: guiId,
      photoFullTime: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, loadListPhoto);

    SheetManager.hideAll();
  };
  const uploadFilePhoto = async () => {
    let photoinfo = {};
    let options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
    };

    await launchImageLibrary(options, async response => {
      if (!response.didCancel) {
        let { assets } = (await response) || [];
        if (assets !== undefined) {
          await assets?.forEach(async res => {
            const newImageUrl = await NativeCamera.resizeImage(await res.uri);

            photoinfo = {
              shopId: workinfo.shopId,
              reportId: config.isUseSellOut == 1 ? 5 : kpiinfo.kpiId,
              photoPath: newImageUrl?.uri || res.uri,
              photoDate: Moment(new Date()).format('YYYYMMDD'),
              photoType: 'SELLOUT_INVOICE',
              photoTime: parseInt(Moment(new Date()).format('YYYYMMDDHHmmss')),
              fileUpload: 0,
              dataUpload: 0,
              guid: guiId,
              photoFullTime: Moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
            };
            await InsertPhotosItem(photoinfo);
            await loadListPhoto();
          });
        }
      }
    });
  };
  const loadListPhoto = async () => {
    const listPhoto = await getPhotosByGuiId(guiId, workinfo.shopId);
    setListPhotoItem(listPhoto || []);
  };
  const handleSelectImage = async (listPhotoItem, indexImage) => {
    // setDataPhoto({ listPhoto: listPhotoItem, indexImage: indexImage })
    // setVisible(true)
    await handleShowImage(listPhotoItem, indexImage);
  };
  const RenderItemPhoto = ({ item, index }) => {
    const onLongPressImage = () => {
      item.isDelete = item.isDelete ? false : true;
      item.photoPath !== null && !isShowDelete
        ? setNumDelete(1)
        : setNumDelete(0);
      if (isShowDelete) {
        listPhotoItem.map(it => {
          it.isDelete = false;
        });
      }
      setShowDelete(e => !e);
    };
    const pressOnShowDelete = () => {
      const count = item.isDelete ? numDelete - 1 : numDelete + 1;
      item.isDelete = item.isDelete ? false : true;
      setNumDelete(count);
    };
    return (
      <TouchableOpacity
        key={index}
        onLongPress={() => onLongPressImage()}
        onPress={() =>
          isShowDelete
            ? pressOnShowDelete()
            : handleShowImage(item, listPhotoItem, index)
        }
        style={{
          width: deviceWidth / 4,
          height: deviceWidth / 4,
          backgroundColor: appcolor.light,
          margin: 5,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: item.photoPath }}
          style={{ width: '100%', height: '100%', borderRadius: 12 }}
        />
        {isShowDelete && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: appcolor.black,
              opacity: 0.5,
            }}
          >
            <SpiralIcon
              color={appcolor.red}
              name={item.isDelete ? 'check-circle' : 'circle'}
              type="font-awesome-5"
              size={40}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const deletePhotoSelect = async () => {
    const listSelect = listPhotoItem.filter(it => it.isDelete == true);
    const listPhoto = listPhotoItem.filter(it => it.isDelete !== true);
    // listSelect.map(it => dele)
    await deletePhotoByList(listSelect);
    await setListPhotoItem(listPhoto);
    await setShowDelete(e => !e);
  };
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, color: appcolor.dark, fontWeight: '500' }}>
          {itemM.name}
        </Text>
        <TouchableOpacity
          style={{
            width: '30%',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}
          onPress={() =>
            isShowDelete
              ? deletePhotoSelect()
              : SheetManager.show('ref_takePhoto')
          }
        >
          <SpiralIcon
            iconStyle={{ color: isShowDelete ? appcolor.red : appcolor.dark }}
            style={{}}
            size={30}
            name={isShowDelete ? 'trash' : 'camera-outline'}
            type="ionicon"
          />
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          horizontal
          key={'listPhoto'}
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          data={listPhotoItem}
          renderItem={({ item, index }) => (
            <RenderItemPhoto item={item} index={index} />
          )}
        />
      </View>
      <ActionSheet
        id="ref_takePhoto"
        defaultOverlayOpacity={0.3}
        containerStyle={{
          backgroundColor: appcolor.surface,
          paddingBottom: insets.bottom,
        }}
        closeOnPressBack={true}
        gestureEnabled={true}
        indicatorColor={appcolor.primary}
      >
        <View style={{ padding: 8, width: '100%', height: '50%' }}>
          <View
            style={{
              padding: 8,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: appcolor.dark, fontSize: 17, fontWeight: '600' }}
            >
              Chụp Hình
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 20,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 5,
                width: '48%',
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: appcolor.dark,
                borderWidth: 0.5,
                borderRadius: 10,
                backgroundColor: appcolor.light,
              }}
              onPress={() => takePhoto()}
            >
              <Text style={{ color: appcolor.dark, padding: 5 }}>Máy ảnh</Text>
              <SpiralIcon
                color={appcolor.dark}
                name="camera"
                type="ionicon"
                size={30}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 5,
                width: '48%',
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: appcolor.primary,
                borderWidth: 0.5,
                borderRadius: 10,
                backgroundColor: appcolor.light,
              }}
              onPress={() => uploadFilePhoto()}
            >
              <Text style={{ color: appcolor.dark, padding: 5 }}>Chọn ảnh</Text>
              <SpiralIcon
                color={appcolor.dark}
                name="attach"
                type="ionicon"
                size={30}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
export default SelloutModel;
