import React, { Component, useState } from 'react';
import {
  Platform,
  View,
  Text,
  ImageBackground,
  SectionList,
  TextInput,
  Dimensions,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { Icon, Button } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import {
  getItemsProgramDisplay,
  getDisplayProgramResult,
  insertDisplayHPResult,
  updateDisplayHPResult,
} from '../../Controller/WorkController';
import {
  getPhotosUploaded,
  updateAuditDisplayResult,
  getCategoryAudit,
  getSubCategoriesAudit,
} from '../../Controller/WorkController';
import SearchableDropdown from 'react-native-searchable-dropdown';
import * as Progress from 'react-native-progress';
import { checkNetwork } from '../../Core/Utility';
import { Message, MessageInfo, Token } from '../../Core/Helper';
import { URL_UPLOAD_AUDIT_DISPLAY } from '../../Core/URLs';
import Moment from 'moment';
import { uploadAllDataPhoto } from '../../Controller/PhotoController';

const offsetKeyboard = Platform.OS === 'android' ? 200 : 200;
const offsetSwitch = Platform.OS === 'android' ? 1.1 : 0.8;
export default class DisplayProgram extends Component {
  constructor(props) {
    super(props);
    this.state = {
      togPhoto: 0,
      countPhoto: 0,
      progress: 0,
      indeterminate: true,
      showProgress: false,
      showProgressPhoto: false,
      workinfo: this.props.route.params.workinfo,
      lstShow: [],
      DisplayItem: this.props.route.params.DisplayItem,
      isHiddenNote: true,
      isHiddenPhotos: false,
      noteSaved: '',
      cateSaved: '',
      subCateSaved: '',
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
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  setShowProgressPhoto = check => {
    this.setState({ showProgressPhoto: check });
  };
  DisplayItemMap(lstItemsProgram, resDisplay) {
    let MapArr = [];
    let itemMap = {};
    let items = {};
    let refName = '';
    let subItems = [];

    lstItemsProgram.map((item, i) => {
      let ItemRes = [];
      // Item res
      if (Array.isArray(resDisplay)) {
        let itemsHave = resDisplay.filter(
          itemRes => itemRes.itemId === item.id,
        );
        if (itemsHave.length > 0) {
          ItemRes = itemsHave;
          //console.log(JSON.stringify(ItemRes[0]))
        }
      }

      var isnew = 0;
      if (!itemMap[item.refName]) {
        itemMap[item.refName] = [];
        items = {};
        refName = '';
        subItems = [];
        isnew = 1;
      }

      if (subItems.indexOf(item.code) < 0) {
        let itemsHaveComment = resDisplay.filter(
          itemRes => itemRes.displaySubCat === item.code,
        );
        subItems.push(item.code);
        itemMap[item.refName].push({
          SubCatId: item.refId,
          SubCatName: item.code,
          category: item.refName,
          displayComment:
            itemsHaveComment.length > 0
              ? itemsHaveComment[0].displayComment
              : '',
        });
      }

      let itemInput = {
        itemName: item.itemName,
        itemId: item.id,
        refName: item.refName,
        subCat: item.code,
        displayComment: '',
        upload: 0,
      };

      if (ItemRes.length > 0) {
        itemInput.quanity = ItemRes[0].quanity;
        itemInput.displayComment = ItemRes[0].displayComment;
        itemInput.upload = ItemRes[0].upload;

        if (ItemRes[0].upload == 1) {
          this.setState({
            Status: 1,
          });
        }
      }

      itemMap[item.refName].push(itemInput);
      items = itemMap[item.refName];
      refName = item.refName;

      if (isnew == 1) {
        // let itemsHave = (Array.isArray(resDisplay)) ? resDisplay.filter(itemRes => itemRes.displayRef === refName && itemRes.displayComment !== ''):[];
        refName != '' && MapArr.push({ title: { name: refName }, data: items });
      }
    });
    return MapArr;
  }
  async refreshView(reload) {
    this.setState({
      noteSaved: '',
      cateSaved: '',
    });

    if (reload !== undefined) {
      await this.loadData();
    } else {
      if (this.props.route.params.DisplayItem.fieldSetting !== null) {
        switch (this.props.route.params.DisplayItem.fieldSetting) {
          case 'R':
            await this.loadData();
          default:
        }
      } else {
        switch (this.props.route.params.DisplayItem.id) {
          case 21:
          case 22:
          case 24:
          case 26:
          case 27:
          case 30:
            await this.loadData();
          case 19:
          case 28:
          default:
        }
      }
    }
  }
  componentDidMount() {
    this.loadCategory();
    this.loadData();
  }
  loadCategory = async () => {
    let Lstcategory = [];
    let categoryTem = await getCategoryAudit(
      this.props.route.params.DisplayItem.id,
    );
    let itemTem = { id: 0, name: '-- Tất cả --', division: '' };
    Lstcategory.push(itemTem);
    categoryTem.map(itemc => {
      Lstcategory.push(itemc);
    });

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
    let lstItemsProgram = await getItemsProgramDisplay(
      this.props.route.params.DisplayItem.id,
      '',
      '',
    );
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
    if (Array.isArray(resDisplay) && resDisplay.length == 0) {
      alert('Bạn chưa làm báo cáo.');
      return;
    }

    // if(lstItemsProgram.length !== resDisplay.length)
    // {
    //     alert('Vui lòng làm hết báo cáo.');
    //     return
    // }

    // if(resPhotos.length < 2)
    // {
    //     alert("Vui lòng chụp tối thiểu 2 tấm hình cho báo cáo.")
    //     return
    // }

    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => this.UploadData(resDisplay, resPhotos),
    );
  };
  UploadData = async (resDisplay, resPhotos) => {
    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      alert(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    this.setShowProgress(true);

    let access_token = await Token();
    try {
      let items = [];
      resDisplay.forEach(item => {
        let dataItem = {
          displayId: item.displayId,
          itemId: item.itemId,
          quanity: item.quanity,
          displayRef: item.displayRef,
          displayComment: item.displayComment,
        };
        items.push(dataItem);
      });

      // alertPrint(items)
      let itemsPhoto = [];
      resPhotos.forEach(photoInfo => {
        let ImgName = photoInfo.photoPath.substring(
          photoInfo.photoPath.lastIndexOf('/') + 1,
          photoInfo.photoPath.length,
        );
        // let pathPhoto = URLDEFAULT + 'uploaded/' + photoInfo.photoDate + '/' + ImgName
        let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName;
        let dataItem = {
          shopId: photoInfo.shopId,
          photoName: ImgName,
          latitude: photoInfo.latitude,
          longitude: photoInfo.longitude,
          accuracy: 8,
          reportId: photoInfo.reportId,
          photoTime: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          photoType: '' + photoInfo.photoType,
          photoDate: photoInfo.photoDate,
          photoPath: pathPhoto,
        };
        itemsPhoto.push(dataItem);
      });

      let UploadJson = {
        DisplayId: this.props.route.params.DisplayItem.id,
        ShopId: this.state.workinfo.shopId,
        WorkDate: Moment(new Date()).format('YYYY-MM-DD'),
        Details: JSON.stringify(items),
        Photos: JSON.stringify(itemsPhoto),
      };

      await fetch(URL_UPLOAD_AUDIT_DISPLAY, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + access_token,
        },
        body: JSON.stringify(UploadJson),
      })
        .then(response => {
          return response.json();
        })
        .then(async responseJson => {
          if (responseJson.status == 200) {
            MessageInfo('Gửi báo cáo thành công');
            this.setShowProgress(false);
            updateAuditDisplayResult(
              this.state.workinfo,
              this.props.route.params.DisplayItem.id,
            );
            this.refreshData();
            // this.setShowProgressPhoto(true);
            var count = 0;
            this.setState({ togPhoto: lstPhotos.length });
            // this.RunUploading()

            resPhotos.length > 0 &&
              uploadAllDataPhoto(
                resPhotos,
                () => {
                  count += 1;
                  this.setState({ countPhoto: count });
                },
                () => {},
              );

            this.refreshData();
          } else {
            alert(responseJson.messeger);
            return false;
          }
        })
        .catch(error => {
          return false;
        });
    } catch (error) {
      //console.log(error);
    }
  };
  loadData = async () => {
    this.refreshData();
  };
  refreshData = () => {
    this.loadDataShow();
    this.loadSubCat();
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
    // alertPrint(lstItemsProgram)
    let resDisplay = await getDisplayProgramResult(
      this.state.workinfo.workId,
      this.props.route.params.DisplayItem.id,
    );
    // alertPrint(resDisplay)
    this.setState({ lstShow: [] });
    this.setState({
      lstShow: this.DisplayItemMap(lstItemsProgram, resDisplay),
    });
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
      displaySubCat: this.state.subCateSaved,
      displayComment: this.state.noteSaved,
    };

    updateDisplayHPResult(itemInsert);

    this.refreshView(true);
  };
  cancelNote = () => {
    this.setState({
      isHiddenNote: true,
      cateSaved: '',
      subCateSaved: '',
    });
    this.forceUpdate();
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
  showNoteForm = itemDisplay => {
    this.setState({
      isHiddenNote: this.state.isHiddenNote ? false : true,
      cateSaved: itemDisplay.category,
      noteSaved: itemDisplay.displayComment,
      subCateSaved: itemDisplay.SubCatName, //SubCatId
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
  render() {
    const lstShowAll = this.state.lstShow;
    return (
      <View style={{ height: '100%', width: '100%' }}>
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          Title={this.props.route.params.DisplayItem.name}
          righticon="cloud-upload-alt"
          rightclick={() => this.uploadAction()}
        />
        {/* {
                    this.state.showProgress === false && <View style={{position:'absolute',alignItems:'center',alignSelf:"center",width:'100%'}}><Progress.Bar thickness={1} size={65} indeterminate={true} style={{width:'100%'}}/></View>
                } */}
        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            height: Dimensions.get('window').height - 60,
          }}
        >
          {this.state.isHiddenNote && (
            <View style={{ flexDirection: 'row', padding: 8, zIndex: 1 }}>
              <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 13 }}>
                  {''}
                  {this.state.LblCategory}{' '}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-start', width: '25%' }}>
                <View
                  style={{
                    alignContent: 'center',
                    backgroundColor: '#FFFFFF50',
                  }}
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
                  style={{
                    alignContent: 'center',
                    backgroundColor: '#FFFFFF50',
                  }}
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
          )}
          <View
            style={{
              position: 'absolute',
              marginTop: this.state.isHiddenNote ? 75 : 0,
              width: '100%',
              height: this.state.isHiddenNote ? '85%' : '100%',
              zIndex: 0,
            }}
          >
            {/* view note */}
            <View
              style={{
                zIndex: 1,
                display: this.state.isHiddenNote ? 'none' : 'flex',
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
                  backgroundColor: 'white',
                  borderRadius: 15,
                  flexDirection: 'column',
                  marginTop: 70,
                  marginLeft:
                    Dimensions.get('window').width / 2 -
                    (40 * Dimensions.get('window').width) / 100,
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
                  sections={lstShowAll}
                  ItemSeparatorComponent={RenderSeparatorStyle}
                  renderItem={({ item, index }) => (
                    <RenderRow
                      item={item}
                      index={index}
                      Status={this.state.Status}
                      refreshView={() => this.refreshView()}
                      workinfo={this.state.workinfo}
                      DisplayItem={this.state.DisplayItem}
                      Props={this.props}
                      UpdateKeyNote={this.showNoteForm}
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
            <Text style={{ color: '#007AFF' }}>Đang upload báo cáo...</Text>
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
      </View>
    );
  }
}
const getItemLayout = (data, index) => ({
  length: 44,
  offset: 44 * index,
  index,
});
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
}) => {
  return (
    <View>
      {!('SubCatId' in item) ? (
        <View
          style={{
            height: 70,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 25,
            paddingRight: 5,
          }}
        >
          <View style={{ width: '50%', alignSelf: 'center' }}>
            {<Text>{item.itemName}</Text>}
          </View>
          <View style={{ width: '50%', alignSelf: 'center' }}>
            {RenderTypeRowSwitch(
              item,
              Status,
              refreshView,
              workinfo,
              DisplayItem,
            )}
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
                showAlbum(item, Props);
              }}
            />
            {Status === 0 ? (
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
                    UpdateKeyNote(item);
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
                    takePhoto(item, Props);
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
};
const takePhoto = (itemDisplay, Props) => {
  let item = {
    reportId: Props.route.params.workinfo.reportId,
    shopId: Props.route.params.workinfo.shopId,
    shopCode: Props.route.params.workinfo.shopCode,
    photoType:
      '' +
      Props.route.params.DisplayItem.name +
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
    reportId: Props.route.params.workinfo.reportId,
    shopId: Props.route.params.workinfo.shopId,
    photoType:
      '' +
      Props.route.params.DisplayItem.name +
      '_' +
      itemDisplay.category +
      '_' +
      itemDisplay.SubCatName,
    photoDate: Props.route.params.workinfo.workDate,
  };
  Props.navigation.navigate('AlbumPhoto', item);
};
const RenderTypeRowSwitch = (
  item,
  Status,
  refreshView,
  workinfo,
  DisplayItem,
) => {
  if (DisplayItem.fieldSetting !== null) {
    switch (DisplayItem.fieldSetting) {
      case 'R':
        return (
          <View
            style={{
              width: '100%',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Text style={{ alignSelf: 'center', fontSize: 12 }}>YES</Text>
            <Switch
              // style={{marginRight:1,transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              style={{
                marginRight: 1,
                transform: [{ scaleX: offsetSwitch }, { scaleY: offsetSwitch }],
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor="#f5dd4b" //{this.state.isHiddenNote ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={valueS =>
                ToggleSwitchYES(
                  valueS,
                  item,
                  workinfo,
                  refreshView,
                  DisplayItem,
                )
              }
              value={item.quanity === 1 ? true : false}
              disabled={Status !== 0 ? true : false}
            />
            <Text style={{ alignSelf: 'center', fontSize: 12 }}>NO</Text>
            <Switch
              // style={{marginRight:1,transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              style={{
                marginRight: 1,
                transform: [{ scaleX: offsetSwitch }, { scaleY: offsetSwitch }],
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor="#f5dd4b" //{this.state.isHiddenNote ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={valueS =>
                ToggleSwitchNO(valueS, item, workinfo, refreshView, DisplayItem)
              }
              value={item.quanity === 0 ? true : false}
              disabled={Status !== 0 ? true : false}
            />
          </View>
        );
      case 'T':
        const [todoText, setTodoText] = useState(
          typeof item.quanity === 'undefined' ? '' : item.quanity + '',
        );

        return (
          <View>
            <TextInput
              keyboardType={'number-pad'}
              // ref={input => {todoText = input}}
              editable={Status === 0 ? true : false}
              backgroundColor={Status === 0 ? 'white' : 'gray'}
              onFocus={e => {
                setTodoText('');
              }}
              onChangeText={text => {
                if (isNaN(text)) {
                  setTodoText('');
                  ChangeValue('', item, workinfo, refreshView, DisplayItem);
                  alert('Bạn phải nhập số cho mục số lượng.');
                  return;
                }

                ChangeValue(text, item, workinfo, refreshView, DisplayItem);
              }}
              defaultValue={todoText}
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
          </View>
        );
      default:
        return <View />;
    }
  } else {
    switch (DisplayItem.id) {
      case 21:
      case 22:
      case 24:
      case 26:
      case 27:
      case 30:
        return (
          <View
            style={{
              width: '100%',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Text style={{ alignSelf: 'center', fontSize: 12 }}>YES</Text>
            <Switch
              // style={{marginRight:1,transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              style={{
                marginRight: 1,
                transform: [{ scaleX: offsetSwitch }, { scaleY: offsetSwitch }],
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor="#f5dd4b" //{this.state.isHiddenNote ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={valueS =>
                ToggleSwitchYES(
                  valueS,
                  item,
                  workinfo,
                  refreshView,
                  DisplayItem,
                )
              }
              value={item.quanity === 1 ? true : false}
              disabled={Status !== 0 ? true : false}
            />
            <Text style={{ alignSelf: 'center', fontSize: 12 }}>NO</Text>
            <Switch
              // style={{marginRight:1,transform: [{ scaleX: .8 }, { scaleY: .8 }]}}
              style={{
                marginRight: 1,
                transform: [{ scaleX: offsetSwitch }, { scaleY: offsetSwitch }],
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor="#f5dd4b" //{this.state.isHiddenNote ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={valueS =>
                ToggleSwitchNO(valueS, item, workinfo, refreshView, DisplayItem)
              }
              value={item.quanity === 0 ? true : false}
              disabled={Status !== 0 ? true : false}
            />
          </View>
        );
      case 19:
      case 28:
        const [todoText, setTodoText] = useState(
          typeof item.quanity === 'undefined' ? '' : item.quanity + '',
        );

        return (
          <View>
            <TextInput
              keyboardType={'number-pad'}
              // ref={input => {todoText = input}}
              editable={Status === 0 ? true : false}
              backgroundColor={Status === 0 ? 'white' : 'gray'}
              onFocus={e => {
                setTodoText('');
              }}
              onChangeText={text => {
                if (isNaN(text)) {
                  setTodoText('');
                  ChangeValue('', item, workinfo, refreshView, DisplayItem);
                  alert('Bạn phải nhập số cho mục số lượng.');
                  return;
                }

                ChangeValue(text, item, workinfo, refreshView, DisplayItem);
              }}
              defaultValue={todoText}
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
          </View>
        );
      default:
        return <View />;
    }
  }
};
const ChangeValue = (text, item, workinfo, refreshView, DisplayItem) => {
  InsertDefault(text, item, workinfo, refreshView, DisplayItem);
};
InsertDefault = (text, item, workinfo, refreshView, DisplayItem) => {
  let itemInsert = {
    workId: workinfo.workId,
    displayId: DisplayItem.id,
    itemId: item.itemId,
    quanity: text != '' ? parseInt(text) : '',
    displayRef: item.refName,
    displaySubCat: item.subCat,
    displayComment: item.displayComment !== null ? item.displayComment : '',
    upload: 0,
  };

  insertDisplayHPResult(itemInsert);
  refreshView();
};
const ToggleSwitchYES = async (
  value,
  item,
  workinfo,
  refreshView,
  DisplayItem,
) => {
  let itemInsert = {
    workId: workinfo.workId,
    displayId: DisplayItem.id,
    itemId: item.itemId,
    quanity: value === true ? 1 : -1,
    displayRef: item.refName,
    displaySubCat: item.subCat,
    displayComment: item.displayComment,
    upload: 0,
  };

  await insertDisplayHPResult(itemInsert);
  refreshView();
};

const ToggleSwitchNO = async (
  value,
  item,
  workinfo,
  refreshView,
  DisplayItem,
) => {
  let itemInsert = {
    workId: workinfo.workId,
    displayId: DisplayItem.id,
    itemId: item.itemId,
    quanity: value === true ? 0 : -1,
    displayRef: item.refName,
    displaySubCat: item.subCat,
    displayComment: item.displayComment,
    upload: 0,
  };

  await insertDisplayHPResult(itemInsert);
  refreshView();
};
