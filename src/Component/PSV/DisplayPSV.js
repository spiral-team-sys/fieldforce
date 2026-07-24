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
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { CheckBox, SearchBar } from '@rneui/themed';
import SearchableDropDown from 'react-native-searchable-dropdown';
import {
  DEFAULT_COLOR,
  _competitorName,
  DEFAULT_LIGHT_COLOR,
  URL_UPLOAD_PHOTOS,
} from '../../Core/URLs';
import { Token, Message } from '../../Core/Helper';
import { deviceHeight } from '../../Themes/AppsStyle';
////import { NumericFormat } from "react-number-format";;
import ProgressCircleSnail from '../../Content/ProgressCircleSnail';
import {
  alertWarning,
  alertNotify,
  checkNetwork,
  alertError,
  ConvertToInt,
  deviceWidth,
  minWidthTab,
} from '../../Core/Utility';
import {
  uploadDisplayData,
  getDisplayUpload,
} from '../../Controller/WorkController';
import { Icon, Button } from '@rneui/themed';
import { checkImageDisplay } from '../../Controller/CheckDataController';
import moment from 'moment';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { connect } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import ActionSheet from 'react-native-actions-sheet';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';

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
class DisplayPSV extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconType: 'material-community',
      mReportId: this.props.kpiinfo.id,
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
      LblCompetitor: 'Panasonic',
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
      visibleModal: false,
    };
    this.handlerFormNote = this.handlerFormNote.bind(this);
    this.clearAllData = this.clearAllData.bind(this);
    this.actionUploadData = this.actionUploadData.bind(this);
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
    await this.setState({
      dataCompetitor: [],
      dataCategory: [],
      dataSubcategory: [],
      dataDisplay: [],
      dataDisplayFilter: [],
      dataTabView: [],
    });
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
    let mDataResult = await dataDisplayResult(
      this.props.workinfo,
      competitorName,
    );
    let dataTabView = await displayTabData(
      this.props.workinfo,
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
      isOldDay:
        this.state.TODAY !== this.props.workinfo.workDate ? true : false,
    });
    this.hideProgress();
  };
  getInputView = async () => {
    const competitorName =
      this.state.competitorSelect.length > 0
        ? this.state.competitorSelect
        : _competitorName;
    let mDataFilter = await dataDisplayResult(
      this.props.workinfo,
      competitorName,
      !this.state.isInputView,
    );
    this.setState({
      isInputView: !this.state.isInputView,
      dataDisplay: mDataFilter,
    });
  };
  clearAllData = async () => {
    await Message(
      'Chú ý',
      'Bạn có muốn xóa tất cả dữ liệu trưng bày không?',
      async () => {
        let mDataReset = await clearDisplayData(
          this.props.workinfo,
          this.state.competitorSelect,
        );
        await this.setState({ dataDisplay: mDataReset });
        await this.loadData();
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
        workId: this.props.workinfo.workId,
        competitorId: item.divisionId,
        categoryId: item.categoryId,
        quantity: mQuantity,
      };
      this.setState({
        dataDisplay: this.state.dataDisplay.map(i =>
          i.workId === this.props.workinfo.workId &&
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
        workId: this.props.workinfo.workId,
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
          i.workId === this.props.workinfo.workId &&
          i.productId === item.productId
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
      shopId: this.props.workinfo.shopId,
      shopCode: this.props.workinfo.shopCode,
      photoType: this.state.isTrackingCompetitor
        ? photoTypeCompetitor
        : photoType,
      photoDate: this.props.workinfo.workDate,
    };
    this.props.navigation.navigate('Camera', item);
  };
  showAlbum = itemDisplay => {
    let photoType = 'DISPLAY_' + _competitorName + '_' + itemDisplay.tabId;
    let photoTypeCompetitor = 'DISPLAY_COMPETITOR_' + itemDisplay.tabId;
    let item = {
      reportId: this.state.mReportId,
      shopId: this.props.workinfo.shopId,
      photoType: this.state.isTrackingCompetitor
        ? photoTypeCompetitor
        : photoType,
      photoDate: this.props.workinfo.workDate,
    };
    this.props.navigation.navigate('AlbumPhoto', item);
  };
  showFormNote = async item => {
    let tableName = this.state.isTrackingCompetitor
      ? 'displayCompetitor'
      : 'display';
    let mComment = await getDisplayComment(
      this.props.workinfo.workId,
      item.tabId,
      tableName,
    );
    this.setState({ dataFormNote: item, inputNote: mComment });
    modalRef.current.show();
  };
  handlerFormNote = async () => {
    let mNote = this.state.inputNote;
    let mData = this.state.dataFormNote;
    const itemDisplay = {
      workId: this.props.workinfo.workId,
      categoryId: mData.tabId,
      displayComment: mNote !== null ? mNote : '',
    };
    let tableName = this.state.isTrackingCompetitor
      ? 'displayCompetitor'
      : 'display';
    await insertNoteDisplay(itemDisplay, tableName);
    this.setState({
      dataDisplay: this.state.dataDisplay.map(i =>
        i.workId === this.props.workinfo.workId && i.categoryId === mData.tabId
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
    let mDisplayUpload = await getDisplayUpload(this.props.workinfo.workId);
    let mPhotoUpload = await getPhotoUploadByType(
      this.state.mReportId,
      this.props.workinfo.shopId,
      this.props.workinfo.workDate,
      'DISPLAY_' + _competitorName,
    );
    let mPhotoCompetitor = await getPhotoUploadByType(
      this.state.mReportId,
      this.props.workinfo.shopId,
      this.props.workinfo.workDate,
      'DISPLAY_COMPETITOR',
    );
    let mDisplayCompetitorUpload = await getDisplayCompetitorUpload(
      this.props.workinfo.workId,
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
    let checkImage = await checkImageDisplay(this.props.workinfo);
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
      { ...this.props.workinfo, reportId: this.props.kpiinfo.id },
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
      { ...this.props.workinfo, reportId: this.props.kpiinfo.id },
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
  async handlerChooseModal(name) {
    await this.setState({
      visibleModal: false,
      competitorSelect: name,
      LblCompetitor: name,
    });
    await this.loadData();
  }
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
    const appcolor = this.props.appcolor;
    return (
      <Modal animationType="slide" visible={this.state.visibleModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 8,
            }}
          >
            <Text
              style={{
                fontSize: 21,
                padding: 8,
                fontWeight: '700',
                color: appcolor.dark,
                textAlign: 'center',
              }}
            >
              {Label}
            </Text>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => this.setState({ visibleModal: false })}
            >
              <SpiralIcon
                type="font-awesome-5"
                name="times"
                size={25}
                color={appcolor.dark}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            style={{ flex: 1, padding: 8 }}
            keyExtractor={(_, index) => index.toString()}
            data={List}
            renderItem={this.renderItemModal}
            removeClippedSubviews={true}
          />
        </SafeAreaView>
      </Modal>
    );
  };
  renderItemModal = ({ item, index }) => {
    const appcolor = this.props.appcolor;
    const chooseItem = () => {
      this.handlerChooseModal(item.name);
    };
    return (
      <View
        key={index}
        style={{
          flexDirection: 'row',
          backgroundColor: appcolor.homebackground,
          marginBottom: 8,
          borderRadius: 8,
        }}
      >
        <TouchableOpacity style={{ flex: 8, padding: 12 }} onPress={chooseItem}>
          <Text
            style={{
              width: '80%',
              fontSize: 15,
              fontWeight: '500',
              color: appcolor.dark,
            }}
          >
            {index + 1}. {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  renderTabView = () => {
    let dataDisplay = [];
    const appcolor = this.props.appcolor;
    return this.state.dataTabView?.map(item => {
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
      <View key={`Display_${index}`} style={styles.containerRow}>
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
    const appcolor = this.props.appcolor;
    return (
      <View style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
        <HeaderCustom
          leftFunc={() => this.props.navigation.goBack()}
          title={this.props.kpiinfo.menuNameVN}
          iconRight={
            this.state.isOldDay
              ? ''
              : !this.state.isUpload
              ? 'cloud-upload-alt'
              : 'check'
          }
          iconMiddle={
            this.state.isOldDay ? '' : !this.state.isUpload ? 'trash' : ''
          }
          rightFunc={
            this.state.isOldDay
              ? null
              : !this.state.isUpload
              ? () => this.actionUploadData()
              : () => {}
          }
          middleFunc={
            this.state.isOldDay
              ? null
              : !this.state.isUpload
              ? () => this.clearAllData()
              : null
          }
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
          </View>
          <TouchableOpacity
            onPress={() => this.setState({ visibleModal: true })}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                backgroundColor: appcolor.primary,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  width: '100%',
                  textAlign: 'center',
                  fontWeight: '500',
                  color: appcolor.white,
                }}
              >
                {this.state.LblCompetitor}
              </Text>
              {this.renderDropdown(
                this.state.LblCompetitor,
                this.state.dataCompetitor,
              )}
            </View>
          </TouchableOpacity>
          {/* View Main */}
          <View style={{ width: '100%', height: '100%', zIndex: 0 }}>
            <ProgressCircleSnail
              Title={this.state.titleProgress}
              isShowing={this.state.showProgress}
            />
            {!this.state.showProgress && this.state.dataTabView?.length > 0 && (
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
              </View>
            )}
          </View>
        </View>
        <ActionSheet
          ref={modalRef}
          containerStyle={{ height: deviceHeight / 3 }}
        >
          <View View style={{ padding: 5 }}>
            <KeyboardAvoidingView
              style={{ flexDirection: 'column', justifyContent: 'center' }}
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
                  style={{ alignItems: 'flex-end', padding: 5, width: '100%' }}
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
        </ActionSheet>
      </View>
    );
  }
}
const mapStateToProps = state => {
  return {
    GAppState: state.GAppState,
    shopinfo: state.GAppState.shopinfo,
    appcolor: state.GAppState.appcolor,
    workinfo: state.GAppState.workinfo,
    kpiinfo: state.GAppState.kpiinfo,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(DisplayPSV);
