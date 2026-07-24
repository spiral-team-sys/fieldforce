import React, { PureComponent, createRef } from 'react';
import {
  getCompetiorByTracking,
  getCategoryByProduct,
  getSubCatProduct,
  dataDisplayResult,
  displayTabData,
  insertDisplay,
  clearDisplayData,
  insertNoteDisplay,
  getDisplayComment,
  insertDisplayCompetitor,
  uploadDisplayCompetitor,
  getDisplayCompetitorUpload,
  getPhotoUploadByType,
} from '../../Controller/DisplayController';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { CheckBox, SearchBar } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import { appcolor } from '../../Themes/AppColor';
import { HEADER_SIZE } from '../../Core/is-iphone-x';
import SearchableDropDown from 'react-native-searchable-dropdown';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import {
  DEFAULT_COLOR,
  _competitorName,
  DEFAULT_LIGHT_COLOR,
  URL_UPLOAD_PHOTOS,
} from '../../Core/URLs';
import { Token, Message } from '../../Core/Helper';
////import { NumericFormat } from "react-number-format";;
import ProgressCircleSnail from '../../Content/ProgressCircleSnail';
import {
  alertWarning,
  alertNotify,
  checkNetwork,
  alertError,
  ConvertToInt,
  minWidthTab,
  deviceWidth,
} from '../../Core/Utility';
import {
  uploadDisplayData,
  getDisplayUpload,
  getAllPhotosUpload,
  updateIdStatusFileUploaded,
} from '../../Controller/WorkController';
import { Icon, Button } from '@rneui/themed';
import { Modalize } from 'react-native-modalize';
import { checkImageDisplay } from '../../Controller/CheckDataController';
import moment from 'moment';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const modalRef = createRef();
const styles = StyleSheet.create({
  viewActionReport: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerRow: {
    borderBottomColor: '#e1e1e1',
    borderBottomWidth: 1,
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputNumber: {
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#c2c2c2',
    borderRadius: 5,
    padding: 8,
    margin: 3,
  },
  inputNote: {
    fontSize: 13,
    color: 'black',
    height: 100,
    borderWidth: 0.5,
    alignItems: 'flex-start',
    textAlignVertical: 'top',
    borderColor: '#c2c2c2',
    borderRadius: 5,
    padding: 8,
    margin: 8,
  },
});

let RNFS = require('react-native-fs');
export default class DisplayART extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconType: 'material-community',
      mWORK: this.props.route.params.workinfo,
      mReportId: this.props.route.params.reportId,
      isUpload: false,
      isInputView: false,
      inputNote: null,
      dataFormNote: [],
      dataCompetitor: [],
      dataCategory: [],
      dataSubcategory: [],
      dataDisplay: [],
      dataDisplayFilter: [],
      dataTabView: [],
      LblCompetitor: 'Hãng',
      LblCategory: 'Ngành hàng',
      LblSubCategory: 'Loại',
      competitorSelect: '',
      categorySelect: '',
      subCategorySelect: '',
      titleProgress: null,
      showProgress: false,
      isTrackingCompetitor: false,
      keySearch: null,
      isOldDay: false,
      TODAY: ConvertToInt(moment(new Date()).format('YYYYMMDD').toString()),
    };
  }

  async componentDidMount() {
    this.showProgress('Đang cập nhật dữ liệu');
    await this.loadData();
  }
  // Progess Waiting
  showProgress = title => {
    this.setState({ titleProgress: title, showProgress: true });
  };
  hideProgress = () => {
    this.setState({ showProgress: false });
  };
  // Load Data
  loadData = async () => {
    const competitorName =
      this.state.competitorSelect.length > 0
        ? this.state.competitorSelect
        : _competitorName;
    let mCompetitor = await getCompetiorByTracking();
    let mCategory = await getCategoryByProduct();
    let mSubcategory = await getSubCatProduct(
      this.state.competitorSelect,
      this.state.categorySelect,
    );
    let mDataResult = await dataDisplayResult(this.state.mWORK, competitorName);
    let dataTabView = await displayTabData(
      this.state.mWORK,
      this.state.categorySelect,
    );
    await this.setState({
      dataCompetitor: mCompetitor,
      dataCategory: mCategory,
      dataSubcategory: mSubcategory,
      dataDisplay: mDataResult,
      dataDisplayFilter: mDataResult,
      dataTabView: dataTabView,
      isTrackingCompetitor: competitorName !== _competitorName,
      isUpload: mDataResult[0].upload,
      isOldDay: this.state.TODAY !== this.state.mWORK.workDate ? true : false,
    });
    this.hideProgress();
  };
  getInputView = async () => {
    const competitorName =
      this.state.competitorSelect.length > 0
        ? this.state.competitorSelect
        : _competitorName;
    let mDataFilter = await dataDisplayResult(
      this.state.mWORK,
      competitorName,
      !this.state.isInputView,
    );
    this.setState({
      isInputView: !this.state.isInputView,
      dataDisplay: mDataFilter,
    });
  };
  clearAllData = async () => {
    Message(
      'Chú ý',
      'Bạn có muốn xóa tất cả dữ liệu trưng bày không?',
      async () => {
        let mDataReset = await clearDisplayData(
          this.state.mWORK,
          this.state.competitorSelect,
        );
        this.setState({ dataDisplay: mDataReset });
      },
    );
  };
  //Save Item
  saveItem = async (item, text, type) => {
    if (this.state.isTrackingCompetitor) {
      const mQuantity =
        type === 'quantity'
          ? text !== null && text.length > 0
            ? parseInt(text)
            : 'null'
          : item.quantity;
      const mDisplayCompetitor = {
        workId: this.state.mWORK.workId,
        competitorId: item.divisionId,
        categoryId: item.categoryId,
        quantity: mQuantity,
      };
      this.setState({
        dataDisplay: this.state.dataDisplay.map(i =>
          i.workId === this.state.mWORK.workId &&
            i.divisionId === item.divisionId &&
            i.categoryId === item.categoryId
            ? { ...i, quantity: mQuantity }
            : i,
        ),
      });
      await insertDisplayCompetitor(mDisplayCompetitor);
    } else {
      const mQuantity =
        type === 'quantity'
          ? text !== null && text.length > 0
            ? parseInt(text)
            : 'null'
          : item.quanity;
      let mPrice =
        type === 'price'
          ? text !== null && text.length > 0
            ? text.toString().replace(/,/g, '')
            : 'null'
          : item.price;

      const mDisplay = {
        workId: this.state.mWORK.workId,
        productId: item.productId,
        subCatId: item.subCatId,
        categoryId: item.categoryId,
        quanity: mQuantity,
        price: mPrice,
        subCategory: item.subCategory,
        division: item.division,
        displayComment: item.displayComment !== null ? item.displayComment : '',
        upload: 0,
      };
      this.setState({
        dataDisplay: this.state.dataDisplay.map(i =>
          i.workId === this.state.mWORK.workId && i.productId === item.productId
            ? { ...i, price: mPrice, quanity: mQuantity }
            : i,
        ),
      });
      await insertDisplay(mDisplay);
    }
  };
  takePhoto = itemDisplay => {
    let photoType = 'DISPLAY_' + _competitorName + '_' + itemDisplay.tabId;
    let photoTypeCompetitor = 'DISPLAY_COMPETITOR_' + itemDisplay.tabId;
    let item = {
      reportId: this.state.mReportId,
      shopId: this.state.mWORK.shopId,
      shopCode: this.state.mWORK.shopCode,
      photoType: this.state.isTrackingCompetitor
        ? photoTypeCompetitor
        : photoType,
      photoDate: this.state.mWORK.workDate,
    };
    this.props.navigation.navigate('Camera', item);
  };
  showAlbum = itemDisplay => {
    let photoType = 'DISPLAY_' + _competitorName + '_' + itemDisplay.tabId;
    let photoTypeCompetitor = 'DISPLAY_COMPETITOR_' + itemDisplay.tabId;
    let item = {
      reportId: this.state.mReportId,
      shopId: this.state.mWORK.shopId,
      photoType: this.state.isTrackingCompetitor
        ? photoTypeCompetitor
        : photoType,
      photoDate: this.state.mWORK.workDate,
    };
    this.props.navigation.navigate('AlbumPhoto', item);
  };
  showFormNote = async item => {
    let tableName = this.state.isTrackingCompetitor
      ? 'displayCompetitor'
      : 'display';
    let mComment = await getDisplayComment(
      this.state.mWORK.workId,
      item.tabId,
      tableName,
    );
    this.setState({ dataFormNote: item, inputNote: mComment });
    modalRef.current.open();
  };
  handlerFormNote = async () => {
    let mNote = this.state.inputNote;
    let mData = this.state.dataFormNote;
    const itemDisplay = {
      workId: this.state.mWORK.workId,
      categoryId: mData.tabId,
      displayComment: mNote !== null ? mNote : '',
    };
    let tableName = this.state.isTrackingCompetitor
      ? 'displayCompetitor'
      : 'display';
    await insertNoteDisplay(itemDisplay, tableName);
    this.setState({
      dataDisplay: this.state.dataDisplay.map(i =>
        i.workId === this.state.mWORK.workId && i.categoryId === mData.tabId
          ? { ...i, displayComment: mNote }
          : i,
      ),
    });

    alertNotify('Lưu ghi chú thành công');
  };
  filterProduct = async str => {
    let mDataFilter = [];
    const isCompetitor =
      this.state.competitorSelect !== '' &&
        this.state.competitorSelect !== _competitorName
        ? true
        : false;
    if (str !== null && str !== undefined && str.length > 0) {
      if (isCompetitor) {
        mDataFilter = this.state.dataDisplayFilter.filter(i =>
          i.competitorName.toLowerCase().match(str.toLowerCase()),
        );
      } else {
        mDataFilter = this.state.dataDisplayFilter.filter(i =>
          i.productName.toLowerCase().match(str.toLowerCase()),
        );
      }
    } else {
      mDataFilter = this.state.dataDisplayFilter;
    }
    this.setState({ dataDisplay: mDataFilter });
  };
  // Upload Data
  actionUploadData = async () => {
    if (this.state.isUpload) {
      alertNotify('Báo cáo đã khóa');
      return;
    }
    let mDisplayUpload = await getDisplayUpload(this.state.mWORK.workId);
    let mPhotoUpload = await getPhotoUploadByType(
      this.state.mReportId,
      this.state.mWORK.shopId,
      this.state.mWORK.workDate,
      'DISPLAY_' + _competitorName,
    );
    let mPhotoCompetitor = await getPhotoUploadByType(
      this.state.mReportId,
      this.state.mWORK.shopId,
      this.state.mWORK.workDate,
      'DISPLAY_COMPETITOR',
    );
    let mDisplayCompetitorUpload = await getDisplayCompetitorUpload(
      this.state.mWORK.workId,
    );

    //console.log(mPhotoUpload, "PHOTO_UPLOAD")
    if (Array.isArray(mDisplayUpload) && mDisplayUpload.length == 0) {
      alertWarning(
        'Vui lòng làm đẩy đủ báo cáo ' +
        _competitorName +
        ' trước khi gửi báo cáo',
      );
      return;
    }
    let checkImage = await checkImageDisplay(this.state.mWORK);
    if (checkImage.length > 0) {
      alertWarning(checkImage);
      return;
    }

    if (
      Array.isArray(mDisplayCompetitorUpload) &&
      mDisplayCompetitorUpload.length == 0
    ) {
      alertWarning('Vui lòng làm đẩy đủ báo cáo Đối thủ trước khi gửi báo cáo');
      return;
    }
    Message(
      'Gửi báo cáo',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () =>
        this.uploadDisplay(
          mDisplayUpload,
          mDisplayCompetitorUpload,
          mPhotoUpload,
          mPhotoCompetitor,
        ),
    );
  };
  uploadDisplay = async (
    dataDisplay,
    dataDisplayCompetitor,
    dataPhoto,
    dataPhotoCompetitor,
  ) => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      alertError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    this.showProgress('Đang gửi dữ liệu');
    await uploadDisplayData(
      dataDisplay,
      dataPhoto,
      this.state.mWORK,
      message => {
        alertNotify('Dữ liệu ' + _competitorName + ': ' + message.toString());
        dataPhoto !== null && dataPhoto.length > 0
          ? this.uploadPhoto(dataPhoto)
          : this.hideProgress();
      },
      error => {
        alertError('Dữ liệu ' + _competitorName + ': ' + error.toString());
        this.hideProgress();
      },
    );
    await uploadDisplayCompetitor(
      dataDisplayCompetitor,
      dataPhotoCompetitor,
      this.state.mWORK,
      message => {
        alertNotify('Dữ liệu đối thủ: ' + message.toString());
        dataPhotoCompetitor !== null && dataPhotoCompetitor.length > 0
          ? this.uploadPhoto(dataPhotoCompetitor)
          : this.hideProgress();
      },
      error => {
        alertError('Dữ liệu đối thủ: ' + error.toString());
        this.hideProgress();
      },
    );
  };
  uploadPhoto = async dataPhoto => {
    await uploadAllDataPhoto(dataPhoto);
    await this.loadData();
  };
  // Render View
  renderDropdownFilter = (Label, List) => {
    return (
      <SearchableDropDown
        onItemSelect={item => {
          if (Label === this.state.LblCompetitor) {
            this.setState({ competitorSelect: item.name });
          } else if (Label === this.state.LblCategory) {
            this.setState({ categorySelect: item.name });
          } else if (Label === this.state.LblSubCategory) {
            this.setState({ subCategorySelect: item.name });
          }
          this.loadData();
          this.forceUpdate();
        }}
        containerStyle={{
          width: '100%',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
        }}
        itemStyle={{
          padding: 8,
          fontSize: 11,
          backgroundColor: '#ddd',
          borderColor: '#bbb',
          borderWidth: 0.6,
        }}
        itemTextStyle={{ color: '#222', fontSize: 13 }}
        itemsContainerStyle={{ maxHeight: 380 }}
        items={List}
        defaultIndex={2}
        resetValue={false}
        textInputProps={{
          placeholder: Label,
          underlineColorAndroid: 'transparent',
          style: {
            fontSize: 13,
            padding: 8,
          },
        }}
        listProps={{
          nestedScrollEnabled: true,
        }}
      />
    );
  };
  renderDropdown = (Label, List) => {
    return (
      // <ModalDropdown
      //     options={List}
      //     defaultValue={Label}
      //     style={{
      //         width: '100%',
      //         borderWidth: 1,
      //         borderColor: '#ccc',
      //         borderRadius: 5
      //     }}
      //     textStyle={{ padding: 12 }}
      //     itemStyle={{ justifyContent: 'flex-start', fontSize: 14 }}
      //     dropdownStyle={{ flex: 1, width: '50%', height: 'auto' }}
      //     dropdownTextStyle={{ fontSize: 13, color: 'black' }}
      //     dropdownTextHighlightStyle={{ backgroundColor: appcolor.greylight, fontWeight: '700' }}
      //     //Event
      //     onSelect={(index, options) => {
      //         if (Label === this.state.LblCompetitor) {
      //             this.setState({ competitorSelect: options }, this.loadData);
      //         } else if (Label === this.state.LblCategory) {
      //             this.setState({ categorySelect: options }, this.loadData);
      //         } else if (Label === this.state.LblSubCategory) {
      //             this.setState({ subCategorySelect: options }, this.loadData);
      //         }
      //     }}
      // />
      <View />
    );
  };
  renderTabView = () => {
    let dataDisplay = [];
    return this.state.dataTabView.map(item => {
      dataDisplay = this.state.dataDisplay.filter(
        products => products.categoryId === item.tabId,
      );
      return (
        <Tabs.Tab key={item.tabName} label={item.tabName} name={item.tabName}>
          <View
            style={{
              backgroundColor: appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
            }}
          >
            {/* <View style={{ flex: 1, flexDirection: 'column' }} tabLabel={item.tabName}> */}
            <View
              style={{
                padding: 5,
                width: '100%',
                height: 'auto',
                backgroundColor: DEFAULT_LIGHT_COLOR,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {this.state.isUpload !== 1 && (
                <View
                  style={{
                    ...styles.viewActionReport,
                    borderRightColor: 'white',
                    borderRightWidth: 1,
                  }}
                >
                  <Button
                    type="clear"
                    disabled={this.state.isOldDay}
                    disabledTitleStyle={{ color: 'white' }}
                    titleStyle={{
                      fontSize: 12,
                      paddingStart: 8,
                      color: 'white',
                    }}
                    title="Chụp hình"
                    icon={
                      <SpiralIcon
                        type={this.state.iconType}
                        name="camera"
                        color="white"
                        size={20}
                      />
                    }
                    onPress={() => {
                      this.takePhoto(item);
                    }}
                  />
                </View>
              )}
              <View
                style={{
                  ...styles.viewActionReport,
                  borderRightColor: 'white',
                  borderRightWidth: 1,
                }}
              >
                <Button
                  type="clear"
                  titleStyle={{ fontSize: 12, paddingStart: 8, color: 'white' }}
                  title="Xem ảnh"
                  icon={
                    <SpiralIcon
                      type={this.state.iconType}
                      name="image-album"
                      color="white"
                      size={20}
                    />
                  }
                  onPress={() => {
                    this.showAlbum(item);
                  }}
                />
              </View>
              <View style={{ ...styles.viewActionReport }}>
                <Button
                  type="clear"
                  titleStyle={{ fontSize: 12, paddingStart: 8, color: 'white' }}
                  title="Ghi chú"
                  icon={
                    <SpiralIcon
                      type={this.state.iconType}
                      name="note"
                      color="white"
                      size={20}
                    />
                  }
                  onPress={() => {
                    this.showFormNote(item);
                  }}
                />
              </View>
            </View>
            <KeyboardAvoidingView
              style={{ flex: 1, flexDirection: 'column' }}
              behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
              enabled
              keyboardVerticalOffset={Platform.OS === 'ios' ? 250 : 40}
            >
              <FlatList
                scrollEnabled={true}
                keyExtractor={(_, index) => index.toString()}
                data={dataDisplay}
                style={{ marginBottom: 40 }}
                renderItem={this.renderItem}
              />
            </KeyboardAvoidingView>
            {/* </View > */}
          </View>
        </Tabs.Tab>
      );
    });
  };
  renderItem = ({ item, index }) => {
    const isEditable = this.state.isUpload;
    const titleName = this.state.isTrackingCompetitor
      ? item.competitorName
      : item.productName;
    const flexTitle = this.state.isTrackingCompetitor ? 3 : 1;
    return (
      <View style={styles.containerRow}>
        <Text
          style={{
            flex: flexTitle,
            color: 'black',
            fontSize: 13,
            alignContent: 'center',
          }}
        >
          {index + 1}. {titleName}
        </Text>
        <View
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}
        >
          <NumericFormat
            value={
              this.state.isTrackingCompetitor ? item.quantity : item.quanity
            }
            displayType="text"
            renderText={values => (
              <TextInput
                editable={this.state.isOldDay ? false : !isEditable}
                keyboardType="numeric"
                backgroundColor="white"
                placeholder="Số lượng"
                style={{ ...styles.inputNumber, flex: 2 }}
                value={values}
                onChangeText={text => {
                  this.saveItem(item, text, 'quantity');
                }}
              />
            )}
          />
          {!this.state.isTrackingCompetitor && (
            <NumericFormat
              value={item.price}
              displayType="text"
              thousandSeparator={true}
              allowedDecimalSeparators={['.', ',']}
              maxLength={50}
              renderText={values => (
                <TextInput
                  value={values}
                  editable={this.state.isOldDay ? false : !isEditable}
                  keyboardType="numeric"
                  backgroundColor="white"
                  onChangeText={text => {
                    this.saveItem(item, text, 'price');
                  }}
                  style={{ ...styles.inputNumber, flex: 3 }}
                  placeholder="Giá"
                />
              )}
            />
          )}
        </View>
      </View>
    );
  };
  render() {
    const isEditable = this.state.isUpload;
    return (
      <View style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          Title={this.props.route.params.titlePage}
          righticon={
            this.state.isOldDay
              ? ''
              : !this.state.isUpload
                ? 'cloud-upload-alt'
                : 'check-square'
          }
          actionrighticon={
            this.state.isOldDay
              ? ''
              : !this.state.isUpload
                ? 'trash-outline'
                : ''
          }
          rightclick={this.actionUploadData}
          actionrightclick={this.clearAllData}
        />
        <View
          style={{ backgroundColor: 'white', width: '100%', height: '100%' }}
        >
          {/* Filter Action */}
          <View style={{ flexDirection: 'column', zIndex: 1, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <SearchBar
                containerStyle={{
                  flex: 3,
                  borderTopColor: 'white',
                  backgroundColor: appcolor.transparent,
                  borderBottomColor: appcolor.transparent,
                }}
                inputContainerStyle={{ backgroundColor: '#e2e2e2', height: 32 }}
                inputStyle={{ fontSize: 13, color: 'black' }}
                placeholder="Tìm kiếm sản phẩm"
                lightTheme
                round
                clearIcon
                value={this.state.keySearch}
                onChangeText={this.filterProduct}
              />
              <CheckBox
                containerStyle={{
                  flex: 1,
                  backgroundColor: 'clear',
                  borderColor: 'white',
                }}
                title="Đã nhập"
                textStyle={{ fontSize: 11, color: 'black' }}
                checked={this.state.isInputView}
                onPress={() => this.getInputView()}
              />
            </View>
            <View
              style={{
                padding: 8,
                flexDirection: 'row',
                borderTopWidth: 0.5,
                borderTopColor: 'white',
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'column',
                  flex: 1,
                  margin: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: '500',
                    bottom: 5,
                  }}
                >
                  {this.state.LblCompetitor}
                </Text>
                <View
                  style={{
                    alignContent: 'center',
                    backgroundColor: 'white',
                    width: '100%',
                  }}
                >
                  {this.renderDropdown(
                    this.state.LblCompetitor,
                    this.state.dataCompetitor,
                  )}
                </View>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'column',
                  flex: 1,
                  margin: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    width: '100%',
                    textAlign: 'center',
                    bottom: 5,
                    fontWeight: '500',
                  }}
                >
                  {this.state.LblCategory}
                </Text>
                <View
                  style={{
                    alignContent: 'center',
                    backgroundColor: 'white',
                    width: '100%',
                  }}
                >
                  {this.renderDropdown(
                    this.state.LblCategory,
                    this.state.dataCategory,
                  )}
                </View>
              </View>
              {/* <View style={{ alignItems: "center", flexDirection: 'column', flex: 1, margin: 3 }}>
                                <Text style={{ fontSize: 11, bottom: 5, fontWeight: '500' }}>{this.state.LblSubCategory}</Text>
                                <View style={{ alignContent: 'center', backgroundColor: 'white', width: '100%' }}>
                                    {
                                        this.renderDropdownFilter(this.state.LblSubCategory, this.state.dataSubcategory)
                                    }
                                </View>
                            </View> */}
            </View>
          </View>
          {/* View Main */}
          <View
            style={{
              position: 'absolute',
              marginTop: 130,
              width: '100%',
              height: '100%',
              zIndex: 0,
            }}
          >
            <ProgressCircleSnail
              Title={this.state.titleProgress}
              isShowing={this.state.showProgress}
            />
            {!this.state.showProgress && (
              <View
                style={{
                  zIndex: 0,
                  position: this.state.isHiddenNote ? 'relative' : 'absolute',
                  backgroundColor: 'white',
                  height: Platform.OS === 'ios' ? '85%' : '92%',
                }}
              >
                <Tabs.Container
                  renderTabBar={props => (
                    <MaterialTabBar
                      {...props}
                      labelStyle={{ fontSize: 14, fontWeight: '600' }}
                      indicatorStyle={{ backgroundColor: appcolor.primary }}
                      inactiveColor={appcolor.dark}
                      activeColor={appcolor.dark}
                      scrollEnabled={true}
                      style={{ backgroundColor: appcolor.light }}
                      tabStyle={{
                        minWidth: minWidthTab(this.state.dataTabView),
                        height: 36,
                      }}
                    />
                  )}
                >
                  {this.renderTabView()}
                </Tabs.Container>
                {/* <ScrollableTabView
                                initialPage={0}
                                tabBarBackgroundColor={DEFAULT_COLOR}
                                tabBarTextStyle={{ fontSize: 15, color: 'white' }}
                                tabBarUnderlineStyle={{ height: 2, backgroundColor: 'white' }}
                                renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 38 }} style={{ height: 38 }} />}>
                                {this.renderTabView()}
                            </ScrollableTabView> */}
              </View>
            )}
          </View>
        </View>
        <Modalize
          ref={modalRef}
          modalHeight={550}
          onOverlayPress={this.handlerClose}
          handleStyle={{ backgroundColor: 'white' }}
          modalStyle={{ backgroundColor: 'white' }}
        >
          <View View style={{ flex: 1, margin: 8 }}>
            <KeyboardAvoidingView
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
              enabled
              keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
              {!isEditable && (
                <Button
                  type="solid"
                  disabled={this.state.isOldDay}
                  buttonStyle={{
                    width: 100,
                    alignSelf: 'flex-end',
                    marginEnd: 8,
                  }}
                  titleStyle={{ fontSize: 13, marginStart: 16, marginEnd: 16 }}
                  style={{ alignItems: 'flex-end', flex: 1 }}
                  title="Lưu"
                  onPress={this.handlerFormNote}
                />
              )}
              <TextInput
                backgroundColor="white"
                multiline={true}
                editable={!isEditable}
                value={this.state.inputNote}
                onChangeText={value => this.setState({ inputNote: value })}
                style={{ ...styles.inputNote, zIndex: 0 }}
                placeholder="Nhập ghi chú"
              />
            </KeyboardAvoidingView>
          </View>
        </Modalize>
      </View>
    );
  }
}
