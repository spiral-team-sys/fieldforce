import React, { Component } from 'react';
import {
  ScrollView,
  Image,
  View,
  Text,
  ImageBackground,
  SectionList,
  TextInput,
  Dimensions,
  Switch,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import { appcolor } from '../../Themes/AppColor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  getItemsProgramDisplay,
  getDisplayProgramResult,
  insertDisplayResult,
  updateDisplayResult,
} from '../../Controller/WorkController';
import {
  uploadAuditDisplay,
  getPhotosUploaded,
  updateAuditDisplayResult,
  getCategoryAudit,
  getSubCategoriesAudit,
} from '../../Controller/WorkController';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { Message } from '../../Core/Helper';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';

export default class DisplayProgram extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workinfo: this.props.route.params.workinfo.workinfo,
      lstShow: [],
      DisplayItem: this.props.route.params.DisplayItem,
      isHiddenNote: true,
      isHiddenPhotos: false,
      noteSaved: '',
      cateSaved: '',
      LblCategory: 'Ngành hàng',
      LblSubCategory: 'Loại ngành hàng',
      categorySelect: '',
      subCategorySelect: '',
      isShowSubCat: false,
      isResetValue: 0,
      Categories: [],
      SubCategories: [],
      Status: 0,
    };
  }

  DisplayItemMap(lstItemsProgram, resDisplay) {
    let MapArr = [];
    let itemMap = {};
    let items = {};
    let refName = '';
    let subItems = [];

    lstItemsProgram.map((item, i) => {
      var isnew = 0;
      if (!itemMap[item.refName]) {
        itemMap[item.refName] = [];
        items = {};
        refName = '';
        subItems = [];
        isnew = 1;
      }

      if (subItems.indexOf(item.code) < 0) {
        subItems.push(item.code);
        itemMap[item.refName].push({
          SubCatId: item.refId,
          SubCatName: item.code,
          category: item.refName,
        });
      }

      let itemInput = {
        itemName: item.itemName,
        itemId: item.id,
        refName: item.refName,
        upload: 0,
      };

      if (Array.isArray(resDisplay)) {
        let itemsHave = resDisplay.filter(
          itemRes => itemRes.itemId === item.id,
        );

        if (itemsHave.length > 0) {
          itemInput.quanity = itemsHave[0].quanity;
          itemInput.displayComment = itemsHave[0].displayComment;
          itemInput.upload = itemsHave[0].upload;

          if (itemsHave[0].upload == 1) {
            this.setState({
              Status: 1,
            });
          }
        }
      }

      itemMap[item.refName].push(itemInput);
      items = itemMap[item.refName];
      refName = item.refName;

      if (isnew == 1 || lstItemsProgram.length - 1 === i) {
        let itemsHave = Array.isArray(resDisplay)
          ? resDisplay.filter(
              itemRes =>
                itemRes.displayRef === refName && itemRes.displayComment !== '',
            )
          : [];
        refName != '' &&
          MapArr.push({
            title: {
              name: refName,
              comment: itemsHave.length > 0 ? itemsHave[0].displayComment : '',
            },
            data: items,
          });
      }
    });

    return MapArr;
  }
  insertDefault(text, item) {
    let itemInsert = {
      workId: this.state.workinfo.workId,
      displayId: this.props.route.params.DisplayItem.id,
      itemId: item.itemId,
      quanity: text != '' ? parseInt(text) : '',
      displayRef: item.refName,
      displayComment: item.displayComment,
      upload: 0,
    };

    insertDisplayResult(itemInsert);
    this.refreshView();
  }
  async refreshView() {
    this.setState({
      noteSaved: '',
      cateSaved: '',
    });

    await this.loadData();
    this.forceUpdate();
  }
  componentDidMount() {
    this.loadData();
  }
  uploadAction = async () => {
    let resDisplay = await getDisplayProgramResult(
      this.state.workinfo.workId,
      this.props.route.params.DisplayItem.id,
    );
    let resPhotos = await getPhotosUploaded(
      this.props.route.params.workinfo.reportId,
      this.state.workinfo.shopId,
      this.state.workinfo.workDate,
      '' + this.props.route.params.DisplayItem.name,
    );
    if (resDisplay.length == 0) {
      alert('Bạn chưa làm báo cáo.');
      return;
    }

    if (resPhotos.length < 2) {
      alert('Vui lòng chụp tối thiểu 2 tấm hình cho báo cáo.');
      return;
    }

    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => this.UploadData(resDisplay, resPhotos),
    );
  };
  UploadData = async (resDisplay, resPhotos) => {
    let res = uploadAuditDisplay(
      this.props.route.params.DisplayItem.id,
      resDisplay,
      resPhotos,
      this.state.workinfo,
    );
    if (res) {
      let isUpdate = await updateAuditDisplayResult(
        this.state.workinfo,
        this.props.route.params.DisplayItem.id,
      );
      this.UploadFilePhoto(resPhotos);

      this.refreshView();
    } else {
      alert('Gửi báo cáo không thành công.');
    }
  };
  UploadFilePhoto = lstPhoto => {
    let res = uploadAllDataPhoto(lstPhoto);
    if (res) {
      alert('Gửi báo cáo và hình ảnh thành công.');
    } else {
      alert('Gửi hình ảnh không thành công.');
    }
  };
  loadData = async () => {
    let Lstcategory = [];
    let categoryTem = await getCategoryAudit();
    let itemTem = { id: 0, name: '-- Tất cả --', division: '' };
    Lstcategory.push(itemTem);
    categoryTem.map(itemc => {
      Lstcategory.push(itemc);
    });

    this.setState({
      Categories: Lstcategory,
    });

    this.refreshData();
  };
  refreshData = () => {
    this.loadSubCat();
    this.loadDataShow();
  };
  loadSubCat = async () => {
    let LstSubCategory = [];
    let subcatTem = await getSubCategoriesAudit(this.state.categorySelect);
    let itemSubTem = { id: 0, name: '-- Tất cả --' };
    LstSubCategory.push(itemSubTem);
    subcatTem.forEach(itemSC => {
      LstSubCategory.push(itemSC);
    });

    this.setState({
      SubCategories: LstSubCategory,
    });
  };
  loadDataShow = async () => {
    let lstItemsProgram = await getItemsProgramDisplay(
      this.props.route.params.DisplayItem.id,
      this.state.categorySelect,
      this.state.subCategorySelect,
    );
    let resDisplay = await getDisplayProgramResult(
      this.state.workinfo.workId,
      this.props.route.params.DisplayItem.id,
    );
    this.setState({
      lstShow: this.DisplayItemMap(lstItemsProgram, resDisplay),
    });
  };
  changeValue = (text, item) => {
    this.setState({
      lstShow: this.state.lstShow.map(itemShow =>
        itemShow.title.name === item.refName
          ? {
              ...itemShow,
              data: itemShow.data.map(itemS =>
                itemS.id === item.itemId
                  ? { ...itemS, quanity: text != '' ? parseInt(text) : '' }
                  : itemS,
              ),
            }
          : itemShow,
      ),
    });

    this.insertDefault(text, item);
  };
  takePhoto = itemDisplay => {
    let item = {
      reportId: this.props.route.params.workinfo.reportId,
      shopId: this.state.workinfo.shopId,
      shopCode: this.state.workinfo.shopCode,
      photoType:
        '' +
        this.props.route.params.DisplayItem.name +
        '_' +
        itemDisplay.category +
        '_' +
        itemDisplay.name,
      photoDate: this.state.workinfo.workDate,
    };
    this.props.navigation.navigate('Camera', item);
  };
  showAlbum = itemDisplay => {
    let item = {
      reportId: this.props.route.params.workinfo.reportId,
      shopId: this.state.workinfo.shopId,
      photoType:
        '' +
        this.props.route.params.DisplayItem.name +
        '_' +
        itemDisplay.category +
        '_' +
        itemDisplay.name,
      photoDate: this.state.workinfo.workDate,
    };
    this.props.navigation.navigate('AlbumPhoto', item);
  };
  showNoteForm = itemDisplay => {
    this.setState({
      isHiddenNote: this.state.isHiddenNote ? false : true,
      cateSaved: itemDisplay.name,
      noteSaved: itemDisplay.comment,
    });
    this.forceUpdate();
  };
  validateNote = () => {
    this.setState({
      isHiddenNote: true,
    });

    if (this.state.noteSaved === '' || this.state.noteSaved === ' ') {
      //console.log('Vui lòng không để trống ghi chú' + Circle.toString(e));
    }

    // update note coment
    let itemInsert = {
      workId: this.state.workinfo.workId,
      displayId: this.props.route.params.DisplayItem.id,
      displayRef: this.state.cateSaved,
      displayComment: this.state.noteSaved,
    };

    updateDisplayResult(itemInsert);

    this.refreshView();
  };
  cancelNote = () => {
    this.setState({
      isHiddenNote: true,
      cateSaved: '',
    });
    this.forceUpdate();
  };
  toggleSwitchYES = async (value, item) => {
    let itemInsert = {
      workId: this.state.workinfo.workId,
      displayId: this.props.route.params.DisplayItem.id,
      itemId: item.itemId,
      quanity: value === true ? 1 : -1,
      displayRef: item.refName,
      displayComment: item.displayComment,
      upload: 0,
    };

    await insertDisplayResult(itemInsert);
    this.refreshView();
  };

  toggleSwitchNO = async (value, item) => {
    let itemInsert = {
      workId: this.state.workinfo.workId,
      displayId: this.props.route.params.DisplayItem.id,
      itemId: item.itemId,
      quanity: value === true ? 0 : -1,
      displayRef: item.refName,
      displayComment: item.displayComment,
      upload: 0,
    };

    await insertDisplayResult(itemInsert);
    this.refreshView();
  };
  ComboboxCustom = (Label, List, indexItem) => {
    return (
      <SearchableDropdown
        onItemSelect={item => {
          if (Label === this.state.LblCategory) {
            if (item.id !== 0) {
              this.setState({ isShowSubCat: false });
              this.setState({
                categorySelect: item.name,
                isShowSubCat: true,
                isResetValue: 1,
                subCategorySelect: '',
              });
            } else {
              this.setState({
                isShowSubCat: false,
                categorySelect: '',
                subCategorySelect: '',
              });
            }

            this.refreshData();
          } else if (Label === this.state.LblSubCategory) {
            this.setState({ subCategorySelect: item.name });
          }

          this.loadDataShow();
          this.forceUpdate();
        }}
        containerStyle={{
          width: '100%',
        }}
        onRemoveItem={(item, index) => {
          const items = selectedItems.filter(sitem => sitem.id !== item.id);
          List.splice(items);
        }}
        itemStyle={{
          padding: 10,
          backgroundColor: '#ddd',
          borderColor: '#bbb',
          borderWidth: 0.6,
        }}
        itemTextStyle={{ color: '#222' }}
        itemsContainerStyle={{ maxHeight: 380 }}
        items={List}
        defaultIndex={indexItem.toString()}
        resetValue={false}
        textInputProps={{
          placeholder: Label,
          underlineColorAndroid: 'transparent',
          style: {
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
          },
        }}
        listProps={{
          nestedScrollEnabled: true,
        }}
      />
    );
  };
  SeparatorStyle = () => {
    return (
      <View
        style={{ height: 0.5, width: '100%', backgroundColor: '#606070' }}
      />
    );
  };
  renderSectionHeader = ({ section: { title } }) => (
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
  renderTypeRowSwitch(item) {
    switch (this.state.DisplayItem.id) {
      case 21:
      case 22:
      case 24:
      case 26:
      case 27:
      case 28:
        return (
          <View
            style={{
              width: '100%',
              padding: 5,
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Text style={{ alignSelf: 'center' }}>YES</Text>
            <Switch
              style={{
                marginRight: 1,
                transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={this.state.isHiddenNote ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={valueS => this.toggleSwitchYES(valueS, item)}
              value={item.quanity === 1 ? true : false}
            />
            <Text style={{ alignSelf: 'center' }}>NO</Text>
            <Switch
              style={{
                marginRight: 1,
                transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={this.state.isHiddenNote ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={valueS => this.toggleSwitchNO(valueS, item)}
              value={item.quanity === 0 ? true : false}
            />
          </View>
        );
      case 19:
        return (
          <TextInput
            keyboardType={'number-pad'}
            ref={input => {
              this.InputQuantity = input;
            }}
            editable={this.state.Status === 0 ? true : false}
            backgroundColor={this.state.Status === 0 ? 'white' : 'gray'}
            onChangeText={text => {
              if (isNaN(text)) {
                this.InputQuantity.clear();
                this.changeValue('', item);
                alert('Bạn phải nhập số cho mục số lượng.');
                return;
              }

              this.changeValue(text, item);
            }}
            defaultValue={
              typeof item.quanity === 'undefined' ? '' : item.quanity + ''
            }
            style={{
              fontSize: 12,
              color: 'black',
              minHeight: 37,
              textAlign: 'center',
              borderWidth: 0.6,
              borderColor: 'gray',
              width: '98%',
            }}
            placeholder="số lượng"
          />
        );
      default:
        return <View />;
    }
  }
  renderRow = ({ item }) => (
    <View>
      {!('SubCatId' in item) ? (
        <View
          style={{
            height: 70,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 35,
            paddingRight: 15,
          }}
        >
          <View style={{ width: '60%', alignSelf: 'center' }}>
            {<Text>{item.itemName}</Text>}
          </View>
          <View style={{ width: '40%', alignSelf: 'center' }}>
            {this.renderTypeRowSwitch(item)}
          </View>
        </View>
      ) : (
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
          <View style={{ width: '60%', alignSelf: 'center' }}>
            {<Text>{item.SubCatName}</Text>}
          </View>
          <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
            <SpiralIcon
              type="font-awesome"
              style="baseline"
              color="blue"
              name="photo"
              containerStyle={{ marginRight: 25 }}
              size={25}
              activeOpacity={0.7}
              onPress={e => {
                this.showAlbum(item);
              }}
            />
            {this.state.Status === 0 ? (
              <View style={{ flexDirection: 'row' }}>
                <SpiralIcon
                  type="font-awesome"
                  style="baseline"
                  color="blue"
                  name="edit"
                  containerStyle={{ marginRight: 25 }}
                  size={25}
                  activeOpacity={0.7}
                  onPress={e => {
                    this.showNoteForm(item);
                  }}
                />
                <SpiralIcon
                  type="font-awesome"
                  style="baseline"
                  color="blue"
                  name="camera"
                  size={25}
                  activeOpacity={0.7}
                  onPress={e => {
                    this.takePhoto(item);
                  }}
                />
              </View>
            ) : (
              <View />
            )}
          </View>
        </View>
      )}
    </View>
  );
  render() {
    const lstShowAll = this.state.lstShow;
    return (
      <ImageBackground
        style={{ height: '100%', width: '100%' }}
        source={require('./../Themes/Images/back_3.png')}
      >
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          type="font-awesome"
          Title={this.props.route.params.DisplayItem.name}
          righticon="upload"
          rightcolor={appcolor.blue}
          rightclick={() => this.uploadAction()}
        />
        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            height: Dimensions.get('window').height - 60,
          }}
        >
          <View style={{ flexDirection: 'row', padding: 8, zIndex: 1 }}>
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 13 }}>
                {''}
                {this.state.LblCategory}{' '}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-start', width: '25%' }}>
              <View
                style={{ alignContent: 'center', backgroundColor: '#FFFFFF50' }}
              >
                {this.state.categorySelect !== null &&
                  this.state.Categories.length > 0 &&
                  this.ComboboxCustom(
                    this.state.LblCategory,
                    this.state.Categories,
                    0,
                  )}
              </View>
            </View>
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 13 }}>
                {'  '}
                {this.state.isShowSubCat === true &&
                  this.state.subCategorySelect !== null &&
                  this.state.SubCategories.length > 0 &&
                  this.state.LblSubCategory}{' '}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-start', width: '25%' }}>
              <View
                style={{ alignContent: 'center', backgroundColor: '#FFFFFF50' }}
              >
                {this.state.isShowSubCat === true &&
                  this.state.subCategorySelect !== null &&
                  this.state.SubCategories.length > 0 &&
                  this.ComboboxCustom(
                    this.state.LblSubCategory,
                    this.state.SubCategories,
                    0,
                  )}
              </View>
            </View>
          </View>

          <View
            style={{
              position: 'absolute',
              marginTop: 75,
              width: '100%',
              height: '85%',
              zIndex: 0,
            }}
          >
            {/* view note */}
            <View
              style={{
                zIndex: 1,
                display: this.state.isHiddenNote ? 'none' : 'flex',
                flex: 0,
                justifyContent: 'center',
                alignItems: 'center',
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
                  backgroundColor: 'white',
                  borderRadius: 15,
                  flexDirection: 'column',
                }}
              >
                <Text
                  style={{ marginBottom: 15, marginTop: 15, paddingLeft: 5 }}
                >
                  Ghi chú
                </Text>
                <View style={{ height: 0.8, backgroundColor: 'black' }}></View>
                <Text
                  style={{ marginBottom: 15, marginTop: 20, paddingLeft: 5 }}
                >
                  Nhập ghi chú ở dưới đây:
                </Text>
                <TextInput
                  numberOfLines={6}
                  multiline={true}
                  onChangeText={text => this.setState({ noteSaved: text })}
                  style={{
                    margin: 5,
                    padding: 10,
                    color: 'black',
                    height: 145,
                    textAlign: 'left',
                    borderWidth: 0.6,
                    borderColor: 'black',
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
                      backgroundColor: 'red',
                      borderRadius: 15,
                    }}
                    title="Huỷ"
                    onPress={e => this.cancelNote()}
                  />
                  <Button
                    buttonStyle={{
                      width: '90%',
                      backgroundColor: 'green',
                      borderRadius: 15,
                    }}
                    title="Lưu"
                    onPress={e => this.validateNote()}
                  />
                </View>
              </View>
            </View>
            {/* view main */}
            <View
              style={{
                zIndex: 0,
                width: '100%',
                position: this.state.isHiddenNote ? 'relative' : 'absolute',
                backgroundColor: 'white',
                height: '100%',
              }}
            >
              <KeyboardAwareScrollView
                enableAutomaticScroll={true}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={true}
              >
                <SectionList
                  sections={lstShowAll}
                  ItemSeparatorComponent={this.SeparatorStyle}
                  renderItem={this.renderRow}
                  renderSectionHeader={this.renderSectionHeader}
                  keyExtractor={(item, index) => item + index}
                />
              </KeyboardAwareScrollView>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }
}
