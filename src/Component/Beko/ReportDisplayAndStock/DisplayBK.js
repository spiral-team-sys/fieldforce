import React, { PureComponent } from 'react';
import {
  getCompetiorByTracking,
  getCategoryByProduct,
  getSubCatProduct,
  dataDisplayResult,
  displayTabData,
  clearDisplayData,
  insertNoteDisplay,
  getDisplayComment,
  insertDisplayCompetitor,
  insertDisplayBeko,
} from '../../../Controller/DisplayController';
import {
  View,
  Text,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { CheckBox, SearchBar } from '@rneui/themed';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { _competitorName } from '../../../Core/URLs';
import { Message } from '../../../Core/Helper';
import {
  alertNotify,
  ConvertToInt,
  deviceWidth,
  minWidthTab,
} from '../../../Core/Utility';
import moment from 'moment';
import FormGroup from '../../../Content/FormGroup';
import { LoadingView } from '../../../Control/ItemLoading';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
////import { NumericFormat } from "react-number-format";;

const styles = StyleSheet.create({
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
});

export default class DisplayBK extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconType: 'material-community',
      mWORK: this.props.route.params.workinfo,
      mReportId: this.props.route.params.reportId,
      isUpload: this.props.uploaded || 0,
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
      itemClick: null,
      TODAY: ConvertToInt(moment(new Date()).format('YYYYMMDD').toString()),
      dataQuantityDisplay: [
        { id: -1, title: '-Trưng Bày-' },
        { id: 0, title: '0' },
        { id: 1, title: '1' },
        { id: 2, title: '2' },
        { id: 3, title: '3' },
        { id: 4, title: '4' },
        { id: 5, title: '5' },
      ],
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
    let mDataResult = await dataDisplayResult(
      this.state.mWORK,
      _competitorName,
    );
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
      isUpload: mDataResult.length > 0 ? mDataResult[0].upload : 0,
      isOldDay: this.state.TODAY !== this.state.mWORK.workDate ? true : false,
    });
    this.hideProgress();
  };
  getInputView = async () => {
    await this.setState({ dataDisplay: [] });
    let mDataFilter = await dataDisplayResult(
      this.state.mWORK,
      _competitorName,
      !this.state.isInputView,
    );
    await this.setState({
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
      const quanityDisplay =
        type === 'display'
          ? text !== null && text.length > 0
            ? parseInt(text)
            : 'null'
          : item.quanityDisplay;
      const quanitySuggest =
        type === 'suggest'
          ? text !== null && text.length > 0
            ? parseInt(text)
            : 'null'
          : item.quanitySuggest;
      let mPrice =
        type === 'price'
          ? text !== null && text.length > 0
            ? text.toString().replace(/,/g, '')
            : 'null'
          : item.price;
      const mQuantity =
        type === 'quantity'
          ? text !== null && text.length > 0
            ? parseInt(text)
            : 'null'
          : item.quanity;

      const mDisplay = {
        workId: this.state.mWORK.workId,
        productId: item.productId,
        subCatId: item.subCatId,
        categoryId: item.categoryId,
        quanity: mQuantity,
        quanityDisplay: quanityDisplay,
        quanitySuggest: quanitySuggest,
        price: mPrice,
        subCategory: item.subCategory,
        division: item.division,
        displayComment: item.displayComment !== null ? item.displayComment : '',
        upload: 0,
      };
      this.setState({
        dataDisplay: this.state.dataDisplay.map(i =>
          i.workId === this.state.mWORK.workId && i.productId === item.productId
            ? {
                ...i,
                price: mPrice,
                quanity: mQuantity,
                quanityDisplay: quanityDisplay,
                quanitySuggest: quanitySuggest,
              }
            : i,
        ),
      });

      await insertDisplayBeko(mDisplay);
    }
  };
  takePhoto = itemDisplay => {
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
  // Render View
  renderTabView = () => {
    let dataDisplay = [];
    return this.state.dataTabView.map((item, index) => {
      dataDisplay = this.state.dataDisplay.filter(
        products => products.categoryId === item.tabId,
      );
      return (
        <Tabs.Tab key={item.tabName} label={item.tabName} name={item.tabName}>
          <View
            style={{
              backgroundColor: this.props.appcolor.light,
              marginTop: 40,
              padding: 6,
              width: deviceWidth,
            }}
          >
            {/* <View key={index.toString()} style={{ flex: 1, flexDirection: 'column' }} tabLabel={item.tabName}> */}
            <KeyboardAvoidingView
              style={{ flex: 1, flexDirection: 'column' }}
              behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
              enabled
              keyboardVerticalOffset={Platform.OS === 'ios' ? 250 : 40}
            >
              <FlatList
                key="dataDisplayInput"
                scrollEnabled={true}
                keyExtractor={(_, index) => index.toString()}
                data={dataDisplay}
                style={{ marginBottom: 10 }}
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
      <View
        key={index}
        style={{
          ...styles.containerRow,
          backgroundColor: this.props.appcolor.light,
          borderBottomWidth: 0,
          margin: 5,
          marginBottom: 1,
          borderRadius: 5,
        }}
      >
        <Text
          style={{
            flex: flexTitle,
            color: this.props.appcolor.dark,
            fontSize: 13,
            alignContent: 'center',
          }}
        >
          {index + 1}. {titleName}
        </Text>
        <View
          style={{ flex: 1, flexDirection: 'column', alignSelf: 'flex-end' }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <NumericFormat
              value={item.quanityDisplay}
              displayType="text"
              renderText={values => (
                <TextInput
                  editable={this.state.isOldDay ? false : !isEditable}
                  keyboardType="numeric"
                  backgroundColor={this.props.appcolor.surface}
                  placeholder="Trưng bày"
                  placeholderTextColor={this.props.appcolor.grey}
                  style={{
                    ...styles.inputNumber,
                    width: '50%',
                    marginStart: 5,
                    color: this.props.appcolor.dark,
                  }}
                  value={values}
                  onChangeText={text => {
                    this.saveItem(item, text, 'quanityDisplay');
                  }}
                />
              )}
            />
            <NumericFormat
              value={
                this.state.isTrackingCompetitor ? item.quantity : item.quanity
              }
              displayType="text"
              renderText={values => (
                <TextInput
                  editable={this.state.isOldDay ? false : !isEditable}
                  keyboardType="numeric"
                  backgroundColor={this.props.appcolor.surface}
                  placeholder="Tồn kho"
                  placeholderTextColor={this.props.appcolor.grey}
                  style={{
                    ...styles.inputNumber,
                    width: '50%',
                    marginStart: 5,
                    color: this.props.appcolor.dark,
                  }}
                  value={values}
                  onChangeText={text => {
                    this.saveItem(item, text, 'quantity');
                  }}
                />
              )}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <NumericFormat
              value={
                this.state.isTrackingCompetitor
                  ? item.quantity
                  : item.quanitySuggest
              }
              displayType="text"
              renderText={values => (
                <TextInput
                  editable={this.state.isOldDay ? false : !isEditable}
                  keyboardType="numeric"
                  backgroundColor={this.props.appcolor.surface}
                  placeholder="Đề xuất"
                  placeholderTextColor={this.props.appcolor.grey}
                  style={{
                    ...styles.inputNumber,
                    width: '50%',
                    color: this.props.appcolor.dark,
                  }}
                  value={values}
                  onChangeText={text => {
                    this.saveItem(item, text, 'suggest');
                  }}
                />
              )}
            />
            <NumericFormat
              value={item.price}
              displayType="text"
              thousandSeparator={true}
              allowedDecimalSeparators={['.', ',']}
              maxLength={50}
              renderText={values => (
                <TextInput
                  value={values}
                  style={{
                    ...styles.inputNumber,
                    width: '50%',
                    color: this.props.appcolor.dark,
                  }}
                  editable={this.state.isOldDay ? false : !isEditable}
                  keyboardType="numeric"
                  backgroundColor={this.props.appcolor.surface}
                  placeholderTextColor={this.props.appcolor.grey}
                  placeholder="Giá"
                  onChangeText={text => {
                    this.saveItem(item, text, 'price');
                  }}
                />
              )}
            />
          </View>
        </View>
      </View>
    );
  };
  render() {
    const appcolor = this.props.appcolor;
    const isEditable = this.state.isUpload;
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: appcolor.light,
        }}
      >
        <View style={{ width: '100%', height: '100%' }}>
          {/* Filter Action */}
          <View
            style={{
              zIndex: 1,
              width: '100%',
              backgroundColor: appcolor.light,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FormGroup
                containerStyle={{
                  flex: 3.5,
                  backgroundColor: appcolor.grayLight,
                  margin: 8,
                  padding: 3,
                  paddingEnd: 8,
                }}
                inputStyle={{ fontSize: 13, color: appcolor.dark }}
                placeholder="Tìm kiếm sản phẩm"
                iconName="search"
                editable
                value={this.state.keySearch}
                handleChangeForm={this.filterProduct}
              />
              <CheckBox
                containerStyle={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                }}
                title="Đã nhập"
                textStyle={{ fontSize: 11, color: appcolor.dark }}
                checked={this.state.isInputView}
                onPress={() => this.getInputView()}
              />
            </View>
          </View>
          {/* View Main */}
          <View
            style={{
              width: '100%',
              height: '100%',
              zIndex: 0,
              backgroundColor: appcolor.light,
            }}
          >
            <LoadingView
              title={this.state.titleProgress}
              isLoading={this.state.showProgress}
            />
            {!this.state.showProgress && (
              <View
                style={{
                  zIndex: 0,
                  position: this.state.isHiddenNote ? 'relative' : 'absolute',
                  backgroundColor: appcolor.homebackground,
                  height: '93%',
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
                                    tabBarBackgroundColor={appcolor.light}
                                    tabBarTextStyle={{ fontSize: 15, color: appcolor.dark }}
                                    tabBarUnderlineStyle={{ height: 3, backgroundColor: appcolor.yellowdark }}
                                    renderTabBar={() => <ScrollableTabBar tabStyle={{ borderTopWidth: 0.5, borderTopColor: appcolor.grey, height: 42 }} style={{ height: 42 }} />}>
                                    {this.renderTabView()}
                                </ScrollableTabView> */}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }
}
