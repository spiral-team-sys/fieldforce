import React, { Component, PureComponent, useState } from 'react';
import {
  Platform,
  View,
  Text,
  ImageBackground,
  SectionList,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Icon, Button, CheckBox } from '@rneui/themed';
import {
  getDisplayUpload,
  getCategoryProduct,
  getItemsProduct,
  getItemsProductLG,
  getDisplayResult,
  insertDisplay,
  insertPrice,
  getAllPhotosUpload,
  getDisplayHistory,
  deleteAllDisplayResult,
  uploadDisplayData,
  getCompetitorProductBy,
  getCategoryProductLG,
  getSubCatProductLG,
} from '../../Controller/WorkController';
import {
  getAllProduct,
  updateNoteDisplay,
  getSubCatProduct,
} from '../../Controller/WorkController';
import SearchableDropdown from 'react-native-searchable-dropdown';
import * as Progress from 'react-native-progress';
import { checkNetwork, checkDateReport } from '../../Core/Utility';
import { Message, MessageInfo, ToastError } from '../../Core/Helper';
import { DEFAULT_COLOR, AppNameBuild, _competitorId } from '../../Core/URLs';
import Moment from 'moment';
import { All_Select } from '../common';
import { isIphoneX } from '../../Core/is-iphone-x';
import moment from 'moment';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';
import UploadController from '../../Controller/UploadController';
const offsetKeyboard = Platform.OS === 'android' ? 200 : 200;
const HEADER_SIZE = Platform.OS == 'android' ? 110 : isIphoneX() ? 90 : 20;
const delay = ms => new Promise(res => setTimeout(res, ms));
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import RNFS from 'react-native-fs';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

class DisplayEPS extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isTickToolTip: false,
      isClear: false,
      isDone: false,
      selectCombobox: '',
      togPhoto: 0,
      countPhoto: 0,
      progress: 0,
      indeterminate: true,
      showProgress: false,
      showProgressPhoto: false,
      lstShow: [],
      DisplayItem: this.props.route.params.DisplayItem,
      isHiddenNote: true,
      isHiddenPhotos: false,
      noteSaved: '',
      divisionSaved: '',
      cateSaved: '',
      subCateSaved: '',
      LblCompetitor: 'Hãng',
      LblCategory: 'Ngành hàng',
      LblSubCategory: 'Loại',
      competitorSelect: '',
      categorySelect: '',
      subCategorySelect: '',
      isShowSubCat: true,
      isResetValue: 0,
      Competitors: [],
      Categories: [],
      SubCategories: [],
      Status: 0,
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  setShowProgressPhoto = check => {
    this.setState({ showProgressPhoto: check });
  };
  DisplayItemMap(lstItemsProgram, resDisplay, displayHistory) {
    let MapArr = [];
    let itemMap = {};
    let items = {};
    let Division = '';
    let subItems = [];
    let catItems = [];
    let idOrther = 0;
    let subGenArr = [];

    lstItemsProgram?.map((item, i) => {
      let ItemRes = [];

      if (Array.isArray(resDisplay)) {
        let itemsHave = resDisplay.filter(
          itemRes => itemRes.productId === item.productId,
        );
        if (itemsHave.length > 0) {
          ItemRes = itemsHave;
        }
        // else{

        // if(this.state.isClear === false)
        // {

        //     let itemsHistory = displayHistory.filter(itemHis => itemHis.productId === item.productId)
        //     if(itemsHistory.length > 0)
        //     {

        //         let itemHis = itemsHistory[0];

        //         let itemInsert={
        //             workId:this.props.route.params.workinfo.workId,
        //             productId:item.productId,
        //             subCatId:item.subCatId,
        //             quanity:itemHis.hDisplay,
        //             price:itemHis.hPrice,
        //             displayRef:item.categoryName,
        //             subCategory:item.subCategory,
        //             division:item.division,
        //             displayComment:'',
        //             upload:0
        //         }

        //         // alertPrint(itemInsert)
        //         if (itemHis.division !== null) {
        //             ItemRes = [{quanity:itemHis.hDisplay,price:itemHis.hPrice}];
        //             insertDisplay(itemInsert);
        //         }
        //     }

        // }

        // }
      }

      var isnew = 0;
      if (!itemMap[item.division]) {
        itemMap[item.division] = [];
        items = {};
        Division = '';
        subItems = [];
        catItems = [];
        isnew = 1;
      }

      if (catItems.indexOf(item.categoryName) < 0) {
        catItems.push(item.categoryName);
        itemMap[item.division].push({
          Category: item.categoryName,
          CategoryId: item.categoryId,
          division: item.division,
        });
      }

      if (subItems.indexOf(item.subCategory) < 0) {
        if (item.subCatId !== 0) {
          let itemsHaveComment = resDisplay.filter(
            itemRes =>
              itemRes.subCategory === item.subCategory &&
              itemRes.displayRef === item.categoryName &&
              itemRes.division === item.division,
          );
          subItems.push(item.subCategory);
          itemMap[item.division].push({
            division: item.division,
            SubCatId: item.subCatId,
            SubCatName: item.subCategory,
            category: item.categoryName,
            displayComment:
              itemsHaveComment.length > 0
                ? itemsHaveComment[0].displayComment
                : '',
          });
        } else {
          let subOtherName = 'sub-' + item.categoryName;
          if (subGenArr.indexOf(subOtherName) < 0) {
            idOrther += 1;
            subGenArr.push(subOtherName);
            let itemsHaveComment = resDisplay.filter(
              itemRes => itemRes.subCategory === subOtherName,
            );
            subItems.push(idOrther);
            itemMap[item.division].push({
              division: item.division,
              SubCatId: idOrther,
              SubCatName: subOtherName,
              category: item.categoryName,
              displayComment:
                itemsHaveComment.length > 0
                  ? itemsHaveComment[0].displayComment
                  : '',
            });
          }
        }
      }

      let itemInput = {
        division: item.division,
        itemName: item.productName,
        productCode: item.productCode,
        itemId: item.productId,
        refName: item.categoryName,
        subCatId: item.subCatId,
        subCat:
          item.subCatId !== 0 ? item.subCategory : 'sub-' + item.categoryName,
        displayComment: '',
        upload: 0,
      };

      if (ItemRes.length > 0) {
        itemInput.quanity = ItemRes[0].quanity;
        itemInput.price = ItemRes[0].price;
        itemInput.displayComment = ItemRes[0].displayComment;
        itemInput.upload = ItemRes[0].upload;

        if (ItemRes[0].upload == 1) {
          this.setState({
            Status: 1,
          });
        }

        itemMap[item.division].push(itemInput);
      } else {
        if (this.state.isDone === false) {
          itemMap[item.division].push(itemInput);
        }
      }

      items = itemMap[item.division];
      Division = item.division;

      if (isnew == 1) {
        Division != '' &&
          MapArr.push({ title: { name: Division }, data: items });
      }
    });

    return MapArr;
  }
  async refreshView() {
    await this.setState({
      noteSaved: '',
      // cateSaved:''
    });

    await this.loadData();
  }
  async componentDidMount() {
    await this.loadCompetitor();
    await this.setShowProgress(true);
    await this.insertHistory();
    await delay(1000);
    await this.loadData();
    await this.setShowProgress(false);
  }
  insertHistory = async () => {
    if (this.state.isClear === false) {
      let displayHistory = await getDisplayHistory(this.props.workinfo);
      let lstProduct = await getAllProduct();
      let resDisplay = await getDisplayUpload(this.props.workinfo.workId);
      displayHistory.map(itemHis => {
        let itemsHave = resDisplay.filter(
          itemRes => itemRes.productId === itemHis.productId,
        );
        if (itemsHave.length === 0) {
          let lstHave = lstProduct.filter(
            itemP => itemP.productId === itemHis.productId,
          );

          if (lstHave !== undefined && Array.isArray(lstHave)) {
            let item = lstHave[0];

            let itemInsert = {
              workId: this.props.route.params.workinfo.workId,
              productId: item.productId,
              subCatId: item.subCatId,
              quanity: itemHis.hDisplay,
              price: itemHis.hPrice,
              displayRef: item.category,
              subCategory: item.subCategory,
              division: item.division,
              displayComment: '',
              upload: 0,
            };

            insertDisplay(itemInsert);
          }
        }
      });
    }
  };

  loadCompetitor = async () => {
    // Competitor
    let Lstcompetitor = [];
    let comTem = await getCompetitorProductBy(_competitorId);
    let itemComTem = { id: 0, name: All_Select };
    await Lstcompetitor.push(itemComTem);
    await comTem.map(itemc => {
      Lstcompetitor.push(itemc);
    });
    await this.setState({ Competitors: Lstcompetitor });
  };
  loadCategory = async () => {
    let Lstcategory = [];
    let itemTem = { id: 0, name: All_Select, division: '' };

    if (this.state.competitorSelect !== '') {
      let categoryTem =
        AppNameBuild === 'lg'
          ? await getCategoryProductLG(this.state.competitorSelect)
          : await getCategoryProduct(this.state.competitorSelect);
      Lstcategory.push(itemTem);
      categoryTem.map(itemc => {
        Lstcategory.push(itemc);
      });
    }

    this.setState({
      Categories: Lstcategory,
    });
  };
  isFinishReport = async lstRes => {
    if (lstItemsProgram.length === lstRes.length) {
      return true;
    }

    return false;
  };

  uploadAction = async () => {
    if (this.state.Status !== 0) {
      MessageInfo('Báo cáo đã khóa');
      return;
    }

    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => this.UploadData(),
    );
  };
  UploadData = async () => {
    // const workinfo = this.props.route.params.workinfo;
    const workinfo = {
      ...this.props.route.params.workinfo,
      reportId: this.props.route.params.reportId,
    };

    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      MessageInfo(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    this.setShowProgress(false);

    let resDisplay = await getDisplayResult(this.props.route.params.workinfo);
    if (resDisplay.length === 0) {
      ToastError('Vui lòng làm báo cáo.');
    }

    if (AppNameBuild === 'lg') {
      this.setShowProgress(true);
      UploadController.DataDisplay(
        resDisplay,
        workinfo,
        () => {
          this.setShowProgress(false);
          this.refreshData();
        },
        () => {
          this.setShowProgress(false);
        },
      );
    } else {
      const date = moment(Date()); // Thursday Feb 2015
      const countDate = date.day();

      let resPhotos = await getAllPhotosUpload(
        this.props.route.params.reportId,
        this.props.route.params.workinfo.shopId,
        this.props.route.params.workinfo.workDate,
      );

      if (Array.isArray(resDisplay) && resDisplay.length == 0) {
        MessageInfo('Bạn chưa làm báo cáo.');
        return;
      }

      // if(AppNameBuild === mitsuApp)
      // {
      // alertPrint(resDisplay)
      // let resQuantityHave = resDisplay.filter(item => (item.quanity === 'undefined' || item.quanity === '') && (item.price !== null && item.price !== '') )
      // if(resQuantityHave.length > 0)
      // {
      //     let itemRes = resQuantityHave[0]
      //     let itemPro = lstItemsProgram.filter(itemP => itemP.productId === itemRes.productId)

      //     MessageInfo('Bạn đã nhập giá cho '+ itemPro[0].productName + ' nhưng chưa nhập số lượng. Vui lòng nhập số lượng.')
      //     return
      // }

      // alertPrint(resDisplay)
      // let resPriceHave = resDisplay.filter(item => (item.price === 'undefined' || item.price === '' || item.price === null) && item.quanity !== null && item.quanity !== '' )
      // if(resPriceHave.length > 0)
      // {
      //     let itemRes = resPriceHave[0]
      //     let itemPro = lstItemsProgram.filter(itemP => itemP.productId === itemRes.productId)
      //     MessageInfo('Bạn đã nhập số lượng cho '+ itemPro[0].productName + ' nhưng chưa nhập giá. Vui lòng nhập giá.')
      //     return
      // }
      // }

      // if(lstItemsProgram.length !== resDisplay.length)
      // {
      //     alert('Vui lòng làm hết báo cáo.');
      //     return
      // }

      // if (AppNameBuild === hafeleApp) {
      //     if (countDate === 5) {
      //         if (resPhotos.length < 2) {
      //             MessageInfo("Vui lòng chụp tối thiểu 2 tấm hình cho báo cáo.")
      //             return
      //         }
      //     }
      // }

      this.setShowProgress(true);
      uploadDisplayData(
        resDisplay,
        resPhotos,
        workinfo,
        message => {
          this.setShowProgress(false);
          this.refreshData();
          resPhotos.length > 0
            ? this.UploadFilePhoto(resPhotos)
            : MessageInfo(message);
        },
        () => {
          this.setShowProgress(false);
        },
      );
    }
  };
  UploadFilePhoto = async lstPhotos => {
    this.setShowProgressPhoto(true);
    var count = 0;
    this.setState({ togPhoto: lstPhotos.length });
    this.RunUploading();

    await uploadAllDataPhoto(lstPhotos, () => {
      count += 1;
      this.setState({ countPhoto: count });
    });
  };
  loadData = async () => {
    this.refreshData();
  };
  refreshData = () => {
    this.loadDataShow();
  };
  loadSubCat = async () => {
    let LstSubCategory = [];
    let itemSubTem = { id: 0, name: All_Select };
    LstSubCategory.push(itemSubTem);

    if (
      this.state.competitorSelect !== '' &&
      this.state.categorySelect !== ''
    ) {
      let subcatTem =
        AppNameBuild === 'lg'
          ? await getSubCatProductLG(
            this.state.competitorSelect,
            this.state.categorySelect,
          )
          : await getSubCatProduct(
            this.state.competitorSelect,
            this.state.categorySelect,
          );
      subcatTem.forEach(itemSC => {
        LstSubCategory.push(itemSC);
      });
    }

    this.setState({
      SubCategories: LstSubCategory,
    });
  };
  loadDataShow = async () => {
    this.loadCategory();
    this.loadSubCat();
    let displayHistory = await getDisplayHistory(
      this.props.route.params.workinfo,
    );
    let lstItemsProgram =
      AppNameBuild === 'lg'
        ? await getItemsProductLG(
          this.state.competitorSelect,
          this.state.categorySelect,
          this.state.subCategorySelect,
        )
        : await getItemsProduct(
          this.state.competitorSelect,
          this.state.categorySelect,
          this.state.subCategorySelect,
        );
    let resDisplay = await getDisplayResult(this.props.route.params.workinfo);
    this.setState({ lstShow: [] });
    this.setState({
      lstShow: this.DisplayItemMap(lstItemsProgram, resDisplay, displayHistory),
    });
  };
  validateNote = () => {
    this.setState({
      isHiddenNote: true,
    });

    if (this.state.noteSaved === '' || this.state.noteSaved === ' ') {
      //console.log('Vui lòng không để trống ghi chú');
    }

    let itemInsert = {
      workId: this.props.route.params.workinfo.workId,
      displayRef: this.state.cateSaved,
      subCategory: this.state.subCateSaved,
      displayComment: this.state.noteSaved,
      division: this.state.divisionSaved,
    };
    updateNoteDisplay(itemInsert);

    this.refreshView();
  };
  cancelNote = () => {
    this.setState({
      isHiddenNote: true,
      cateSaved: '',
      subCateSaved: '',
    });
    this.forceUpdate();
  };
  ComboboxCustom = (Label, List) => {
    return (
      <SearchableDropdown
        onItemSelect={item => {
          this.setState({ selectCombobox: Label });
          if (Label === this.state.LblCompetitor) {
            this.setState({
              competitorSelect: null,
              categorySelect: null,
              subCategorySelect: null,
            });
            this.setState({ competitorSelect: item.name });
          } else if (Label === this.state.LblCategory) {
            this.setState({ categorySelect: null, isShowSubCat: false });
            this.setState({ isShowSubCat: false });
            this.setState({
              categorySelect: item.name,
              isShowSubCat: true,
              isResetValue: 1,
              subCategorySelect: '',
            });
          } else if (Label === this.state.LblSubCategory) {
            this.setState({ subCategorySelect: item.name });
          }

          this.loadDataShow();
          this.forceUpdate();
        }}
        containerStyle={{
          width: Dimensions.get('window').width / 3 - 10,
          borderWidth: 1,
          borderColor: this.props.appcolor.darklight,
        }}
        onRemoveItem={(item, index) => {
          const items = selectedItems.filter(sitem => sitem.id !== item.id);
          List.splice(items);
        }}
        itemStyle={{
          padding: 10,
          backgroundColor: this.props.appcolor.darklight,
          borderColor: this.props.appcolor.light,
          borderWidth: 0.6,
          color: this.props.appcolor.dark,
        }}
        itemTextStyle={{ color: this.props.appcolor.dark, fontSize: 11 }}
        itemsContainerStyle={{ maxHeight: 380 }}
        items={List}
        defaultIndex={0}
        resetValue={false}
        textInputProps={{
          placeholder: Label,
          underlineColorAndroid: this.props.appcolor.transparent,
          style: {
            padding: 10,
            color: this.props.appcolor.dark,
          },
        }}
        listProps={{
          nestedScrollEnabled: true,
        }}
      />
    );
  };
  showNoteForm = itemDisplay => {
    this.setState({
      isHiddenNote: this.state.isHiddenNote ? false : true,
      cateSaved: itemDisplay.category,
      noteSaved: itemDisplay.displayComment,
      subCateSaved: itemDisplay.SubCatName,
      divisionSaved: itemDisplay.division,
    });

    this.forceUpdate();
  };
  RunUploading() {
    let progress = this.state.countPhoto;
    this.setState({ progress });
    setTimeout(() => {
      this.setState({ indeterminate: false });
      var mytime = setInterval(() => {
        progress += this.state.countPhoto / this.state.togPhoto;
        if (progress > 1) {
          progress = 1;
          this.setShowProgressPhoto(false);
          clearInterval(mytime);
        }
        this.setState({ progress });
      }, 500);
    }, 1500);
  }
  setDoneItem = () => {
    this.setState({ isDone: this.state.isDone === true ? false : true });
    this.loadDataShow();
  };
  setClearAll = async () => {
    this.setState({ isClear: true });
    let res = await deleteAllDisplayResult(
      this.props.route.params.workinfo.workId,
    );
    this.loadDataShow();
  };
  render() {
    const lstShowAll = this.state.lstShow;
    const appcolor = this.props.appcolor;
    return (
      <ImageBackground
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: appcolor.light,
        }}
      >
        <HeaderCustom
          title={this.props.route.params.titlePage}
          iconRight={this.state.Status === 0 ? 'cloud-upload-alt' : 'check'}
          leftFunc={() => this.props.navigation.goBack()}
          rightFunc={() => this.uploadAction()}
        />

        {/* {
                    this.state.showProgress === false && <View style={{position:'absolute',alignItems:'center',alignSelf:"center",width:'100%'}}><Progress.Bar thickness={1} size={65} indeterminate={true} style={{width:'100%'}}/></View>
                } */}
        <View
          style={{
            backgroundColor: appcolor.light,
            width: '100%',
            height: Dimensions.get('window').height - HEADER_SIZE,
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              padding: 8,
              zIndex: 1,
              width: '100%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                right: 10,
              }}
            >
              <CheckBox
                right
                containerStyle={{
                  width: '40%',
                  backgroundColor: appcolor.light,
                  borderColor: appcolor.light,
                  height: 30,
                  padding: 2,
                }}
                title="Đã nhập"
                textStyle={{ fontSize: 11, color: appcolor.dark }}
                checked={this.state.isDone}
                onPress={() => this.setDoneItem()}
              />
              <Button
                disabled={this.state.Status === 1 ? true : false}
                buttonStyle={{
                  backgroundColor: 'clear',
                  borderWidth: 1,
                  borderColor: 'gray',
                }}
                containerStyle={{ height: 40, width: 90 }}
                titleStyle={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: '500',
                  color: appcolor.dark,
                }}
                title="Clear"
                onPress={() => this.setClearAll()}
              ></Button>
            </View>

            <View style={{ flexDirection: 'row', paddingTop: 15 }}>
              <View
                style={{
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  width: '33%',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: '600',
                    bottom: 5,
                    color: appcolor.dark,
                  }}
                >
                  {''}
                  {this.state.LblCompetitor}{' '}
                </Text>
                <View
                  style={{
                    alignContent: 'center',
                    backgroundColor: appcolor.darklight,
                  }}
                >
                  {this.ComboboxCustom(
                    this.state.LblCompetitor,
                    this.state.Competitors,
                  )}
                </View>
              </View>
              <View
                style={{
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  width: '33%',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    width: '100%',
                    textAlign: 'center',
                    bottom: 5,
                    fontWeight: '600',
                    color: appcolor.dark,
                  }}
                >
                  {''}
                  {this.state.LblCategory}{' '}
                </Text>
                <View
                  style={{
                    alignContent: 'center',
                    backgroundColor: appcolor.darklight,
                  }}
                >
                  {this.state.competitorSelect !== null &&
                    this.ComboboxCustom(
                      this.state.LblCategory,
                      this.state.Categories,
                    )}
                </View>
              </View>
              <View
                style={{
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  width: '33%',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    bottom: 5,
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '100%',
                    color: appcolor.dark,
                  }}
                >
                  {'  '}
                  {this.state.LblSubCategory}{' '}
                </Text>
                <View
                  style={{
                    alignContent: 'center',
                    backgroundColor: appcolor.darklight,
                  }}
                >
                  {this.state.competitorSelect !== null &&
                    this.state.isShowSubCat === true &&
                    this.ComboboxCustom(
                      this.state.LblSubCategory,
                      this.state.SubCategories,
                    )}
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              marginTop: this.state.isHiddenNote ? 130 : 0,
              width: '100%',
              height: this.state.isHiddenNote ? '85%' : '100%',
              zIndex: 0,
            }}
          >
            {/* view main */}

            <View
              style={{
                zIndex: 0,
                width: '100%',
                position: this.state.isHiddenNote ? 'relative' : 'absolute',
                backgroundColor: 'white',
                height: '87%',
              }}
            >
              <KeyboardAvoidingView
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                enabled
                keyboardVerticalOffset={offsetKeyboard}
              >
                <SectionList
                  // contentContainerStyle={{height:'100%'}}
                  sections={lstShowAll}
                  ItemSeparatorComponent={RenderSeparatorStyle}
                  renderItem={({ item, index }) => (
                    <RenderRow
                      item={item}
                      index={index}
                      Status={this.state.Status}
                      refreshView={() => this.refreshView()}
                      workinfo={this.props.route.params.workinfo}
                      DisplayItem={this.state.DisplayItem}
                      Props={this.props}
                      UpdateKeyNote={this.showNoteForm}
                      appcolor={appcolor}
                    />
                  )}
                  renderSectionHeader={RenderSectionHeader}
                  keyExtractor={(item, index) => item + index}
                  // getItemLayout={getItemLayout}
                  // removeClippedSubviews={true}
                  initialNumToRender={1}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              </KeyboardAvoidingView>
            </View>
          </View>
        </View>
        <Modal
          presentationStyle="overFullScreen"
          animated={true}
          animationType="slide"
          visible={this.state.isHiddenNote ? false : true}
          transparent={true}
        >
          <View
            style={{
              zIndex: 1,
              flex: 0,
              width: '100%',
              height: Dimensions.get('window').height,
            }}
          >
            <View
              style={{
                zIndex: 2,
                position: 'absolute',
                height: '100%',
                width: '100%',
                backgroundColor: '#D3D3D3',
                opacity: 0.5,
              }}
              onStartShouldSetResponder={e => this.cancelNote()}
            />

            <View
              style={{
                zIndex: 3,
                position: this.state.isHiddenNote ? 'absolute' : 'relative',
                width: '80%',
                height: 'auto',
                opacity: 1.0,
                backgroundColor: appcolor.light,
                borderRadius: 15,
                flexDirection: 'column',
                marginTop: 70,
                marginLeft:
                  Dimensions.get('window').width / 2 -
                  (40 * Dimensions.get('window').width) / 100,
              }}
            >
              <Text
                style={{
                  marginBottom: 15,
                  marginTop: 15,
                  paddingLeft: 5,
                  color: appcolor.dark,
                }}
              >
                Ghi chú
              </Text>
              <View
                style={{ height: 0.8, backgroundColor: appcolor.dark }}
              ></View>
              <Text
                style={{
                  marginBottom: 15,
                  marginTop: 20,
                  paddingLeft: 5,
                  color: appcolor.dark,
                }}
              >
                Nhập ghi chú ở dưới đây:
              </Text>
              <TextInput
                numberOfLines={6}
                multiline={true}
                autoFocus
                blurOnSubmit={true}
                autoCorrect={false}
                onChangeText={text => this.setState({ noteSaved: text })}
                style={{
                  margin: 5,
                  padding: 10,
                  color: appcolor.dark,
                  height: 105,
                  textAlign: 'left',
                  borderWidth: 0.6,
                  borderColor: appcolor.dark,
                  backgroundColor: appcolor.light,
                }}
                defaultValue={
                  typeof this.state.noteSaved === 'undefined'
                    ? ''
                    : this.state.noteSaved
                }
                placeholder="Nhập ghi chú ở đây."
              />
              <View
                style={{
                  marginTop: 15,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  height: 50,
                  width: '100%',
                  padding: 5,
                }}
              >
                <Button
                  buttonStyle={{
                    width: '90%',
                    backgroundColor: appcolor.primary,
                    borderRadius: 15,
                  }}
                  title="Huỷ"
                  onPress={e => this.cancelNote()}
                />
                <Button
                  buttonStyle={{
                    width: '90%',
                    backgroundColor: appcolor.primary,
                    borderRadius: 15,
                  }}
                  title="Lưu"
                  onPress={e => this.validateNote()}
                />
              </View>
            </View>
          </View>
        </Modal>
        {this.state.showProgress === true && (
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          >
            <Progress.Circle thickness={1} size={65} indeterminate={true} />
            <Text style={{ color: '#007AFF' }}>...</Text>
          </View>
        )}
        {/* {
                    this.state.showProgressPhoto === true && <Progress.Circle progress={this.state.progress} thickness={1} size={65} showsText={true} style={{position:'absolute',alignSelf:"center",marginTop:Dimensions.get('window').height/2}}/>
                } */}
        {this.state.showProgressPhoto === true && (
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          >
            <Progress.Circle
              showsText={true}
              progress={this.state.progress}
              thickness={1}
              size={65}
            />
            <Text style={{ color: '#007AFF' }}>Đang upload hình...</Text>
          </View>
        )}
      </ImageBackground>
    );
  }
}
const RenderSeparatorStyle = () => {
  return (
    <View style={{ height: 0.5, width: '100%', backgroundColor: '#606070' }} />
  );
};
const RenderSectionHeader = ({ section: { title } }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 55,
      backgroundColor: '#A9A9A9',
      paddingTop: 17,
      paddingBottom: 15,
      paddingLeft: 10,
      paddingRight: 5,
    }}
  >
    <View style={{ marginLeft: 5 }}>
      <Text style={{ fontSize: 15, color: 'black' }}>{title.name}</Text>
    </View>
  </View>
);
const RenderRow = ({
  item,
  index,
  Status,
  refreshView,
  workinfo,
  DisplayItem,
  Props,
  UpdateKeyNote,
  appcolor,
}) => {
  return (
    <View>
      {!('SubCatId' in item) && !('CategoryId' in item) ? (
        <View
          style={{
            height: 70,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 25,
            paddingRight: 5,
            backgroundColor: appcolor.darklight,
          }}
        >
          <View style={{ width: '40%', alignSelf: 'center', left: 15 }}>
            <Text style={{ fontSize: 13, color: appcolor.dark }}>
              {item.itemName}
            </Text>
            <Text style={{ fontSize: 11, color: appcolor.grey }}>
              {item.productCode}
            </Text>
          </View>
          <View
            style={{
              width: '50%',
              alignSelf: 'center',
              alignItems: 'flex-end',
            }}
          >
            {RenderTypeRowSwitch(item, Status, refreshView, workinfo)}
          </View>
        </View>
      ) : 'SubCatId' in item ? (
        <View
          style={{
            height: 45,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 25,
            paddingRight: 15,
            backgroundColor: '#DCDCDC',
          }}
        >
          <View style={{ width: '60%', alignSelf: 'center', left: 15 }}>
            {<Text>{item.SubCatName}</Text>}
          </View>
          <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
            <SpiralIcon
              type="ionicon"
              color={DEFAULT_COLOR}
              name="images-outline"
              containerStyle={{ marginRight: 25 }}
              size={25}
              activeOpacity={0.7}
              onPress={e => {
                showAlbum(item, Props);
              }}
            />
            {Status === 0 ? (
              <View style={{ flexDirection: 'row' }}>
                <SpiralIcon
                  type="ionicon"
                  color={DEFAULT_COLOR}
                  name="create-outline"
                  containerStyle={{ marginRight: 25 }}
                  size={25}
                  activeOpacity={0.7}
                  onPress={e => {
                    UpdateKeyNote(item);
                  }}
                />
                <SpiralIcon
                  type="ionicon"
                  color={DEFAULT_COLOR}
                  name="camera-outline"
                  size={25}
                  activeOpacity={0.7}
                  onPress={e => {
                    takePhoto(item, Props);
                  }}
                />
              </View>
            ) : (
              <View />
            )}
          </View>
        </View>
      ) : (
        <View
          style={{
            height: 50,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 25,
            paddingRight: 5,
            backgroundColor: '#C0C0C0',
          }}
        >
          <View style={{ width: '100%', alignSelf: 'center' }}>
            {<Text>{item.Category}</Text>}
          </View>
        </View>
      )}
    </View>
  );
};
const takePhoto = (itemDisplay, Props) => {
  let item = {
    reportId: Props.route.params.reportId,
    shopId: Props.route.params.workinfo.shopId,
    shopCode: Props.route.params.workinfo.shopCode,
    photoType:
      'DISPLAY_' +
      itemDisplay.division +
      '_' +
      itemDisplay.category +
      '_' +
      itemDisplay.SubCatName,
    photoDate: Props.route.params.workinfo.workDate,
  };
  Props.navigation.navigate('Camera', item);
};
const showAlbum = (itemDisplay, Props) => {
  let item = {
    reportId: Props.route.params.reportId,
    shopId: Props.route.params.workinfo.shopId,
    photoType:
      'DISPLAY_' +
      itemDisplay.division +
      '_' +
      itemDisplay.category +
      '_' +
      itemDisplay.SubCatName,
    photoDate: Props.route.params.workinfo.workDate,
  };

  Props.navigation.navigate('AlbumPhoto', item);
};
const RenderTypeRowSwitch = (item, Status, refreshView, workinfo) => {
  const [quantity, setQuantity] = useState(
    item.quanity === 'undefined' ||
      item.quanity === undefined ||
      item.quanity === null
      ? ''
      : item.quanity + '',
  );
  const [price, setPrice] = useState(
    item.price === 'undefined' ||
      item.price === undefined ||
      item.price === null
      ? ''
      : item.price + '',
  );

  return (
    <View
      style={{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <TextInput
        editable={checkDateReport(workinfo.workDate, Status)}
        keyboardType={'number-pad'}
        backgroundColor={Status === 0 ? 'white' : 'gray'}
        // onFocus = { e => {
        //     setQuantity('');
        // } }
        onChangeText={text => {
          if (isNaN(text)) {
            setQuantity('');
            ChangeValue('', item, workinfo, refreshView);
            MessageInfo('Bạn phải nhập số cho mục số lượng.');
            return;
          }

          ChangeValue(text, item, workinfo, refreshView);
        }}
        defaultValue={quantity}
        style={{
          fontSize: 12,
          color: 'black',
          minHeight: 37,
          textAlign: 'center',
          borderWidth: 0.6,
          borderColor: 'gray',
          width: '90%',
        }}
        placeholder="số lượng"
      />
      {/* <TextInput
                keyboardType={'number-pad'}
                editable={checkDateReport(workinfo.workDate,Status)}
                backgroundColor = {(Status === 0) ? 'white':'gray'}
                // onFocus = { e => { 
                //     setPrice('');
                // } } 
                onChangeText={text=>{
                    if(isNaN(text))
                    {
                        setPrice('');
                        ChangeValuePrice('',item,workinfo,refreshView)
                        MessageInfo('Bạn phải nhập số cho giá.');
                        return
                    }
                    
                    ChangeValuePrice(text,item,workinfo,refreshView)
                }}
                defaultValue={price}
                style={{fontSize:12,color:'black',minHeight:37,textAlign:'center',borderWidth:0.6,borderColor:'gray',width:'45%'}}
                placeholder='giá'
            /> */}
    </View>
  );
};
const ChangeValue = (text, item, workinfo, refreshView) => {
  InsertDefault(text, item, workinfo, refreshView);
};

const ChangeValuePrice = (text, item, workinfo, refreshView) => {
  InsertDefaultPrice(text, item, workinfo, refreshView);
};

const InsertDefault = async (text, item, workinfo, refreshView) => {
  let itemInsert = {
    workId: workinfo.workId,
    productId: item.itemId,
    subCatId: item.subCatId,
    quanity: text != '' ? parseInt(text) : '',
    displayRef: item.refName,
    subCategory: item.subCat,
    division: item.division,
    displayComment: item.displayComment !== null ? item.displayComment : '',
    upload: 0,
  };

  await insertDisplay(itemInsert);
  // refreshView();
};

const InsertDefaultPrice = async (text, item, workinfo, refreshView) => {
  let itemInsert = {
    workId: workinfo.workId,
    productId: item.itemId,
    subCatId: item.subCatId,
    quanity: item.quanity,
    price: text != '' ? parseInt(text) : '',
    displayRef: item.refName,
    subCategory: item.subCat,
    displayComment: item.displayComment !== null ? item.displayComment : '',
    upload: 0,
  };

  await insertPrice(itemInsert);
  // refreshView();
};
function mapStateToProps(state) {
  return {
    appcolor: state.GAppState.appcolor,
    workinfo: state.GAppState.workinfo,
    kpiinfo: state.GAppState.kpiinfo,
    shopinfo: state.GAppState.shopinfo,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(DisplayEPS);
