import React, { createRef, PureComponent } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import {
  fetchSellOutEvident,
  uploadEvident,
  uploadPhoto,
} from '../../Controller/SellOutController';
import PageHeader from '../../Content/PageHeader';
import { Button, Icon, Badge, SearchBar } from '@rneui/themed';
import { DEFAULT_COLOR } from '../../Core/URLs';
import { appcolor } from '../../Themes/AppColor';
import { Modalize } from 'react-native-modalize';
import ActionFilter from '../ReportHistory/ActionFilter';
import moment from 'moment';
import { launchImageLibrary } from 'react-native-image-picker';
import { InsertPhotosItem } from '../../Controller/PhotoController';
import { alertNotify } from '../../Core/Utility';
import NativeCamera from '../../Control/NativeCamera';

const styles = StyleSheet.create({
  rowTitleSellOutCheck: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd600',
    marginBottom: 8,
    borderRadius: 5,
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'left',
  },
});

const modalRef = createRef();
const actionRef = createRef();
class SellOutEvident extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lstDataContent: [],
      lstData: [],
      lstTabView: [],
      dateFilter: [],
      keySearch: null,
      isFilter: false,
      toDay: moment(new Date()).format('YYYY-MM-DD').toString(),
      markedDates: {
        [moment(new Date()).format('YYYY-MM-DD').toString()]: {
          selected: true,
          marked: true,
          selectedColor: DEFAULT_COLOR,
        },
      },
      isStartDay: false,
      isEndDay: false,
      startDate: '',
      dataItem: {},
    };
    this.markedDatesDefault = {
      [this.state.toDay]: {
        selected: true,
        marked: true,
        selectedColor: DEFAULT_COLOR,
      },
    };
    this.markingTypeDefault = 'custom';
    this.aCamera = 'CAMERA';
    this.aUploadFile = 'UPLOADFILE';
    this.aViewPhoto = 'VIEWPHOTO';
  }

  async componentDidMount() {
    await this.handlerGetData();
  }
  takePhoto = item => {
    let photoType =
      item.productId !== undefined
        ? 'EVIDENT_' + item.productName
        : 'EVIDENT_FULL';
    let photoInfo = {
      reportId: 0,
      shopId: item.shopId,
      shopCode: item.shopCode,
      photoType: photoType,
      photoDate: item.workDate,
    };
    this.props.navigation.navigate('Camera', photoInfo);
  };
  getPhotoFromGallery = item => {
    let photoinfo = {};
    let photoType =
      item.productId !== undefined
        ? 'EVIDENT_' + item.productName
        : 'EVIDENT_FULL';
    let options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.4,
      includeBase64: true,
    };
    launchImageLibrary(
      options,
      async response => {
        if (!response.didCancel) {
          const newImageUrl = await NativeCamera.resizeImage(
            await response.uri,
          );
          photoinfo = {
            shopId: item.shopId,
            shopCode: item.shopCode,
            photoDate: item.workDate,
            photoType: photoType,
            photoTime: parseInt(moment(new Date()).format('YYYYMMDDHHmmss')),
            photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
            photoPath: newImageUrl?.uri || response.uri,
            reportId: 0,
            latitude: 0,
            longitude: 0,
            photoDesc: 0,
            fileUpload: 0,
            dataUpload: 0,
          };
          await InsertPhotosItem(photoinfo);
        }
      },
      true,
    );
  };
  showAlbum = item => {
    let photoType =
      item.productId !== undefined
        ? 'EVIDENT_' + item.productName
        : 'EVIDENT_FULL';
    let photoInfo = {
      reportId: 0,
      shopId: item.shopId,
      photoType: photoType,
      photoDate: item.workDate,
    };
    this.props.navigation.navigate('AlbumPhoto', photoInfo);
  };
  showBottomButton = items => {
    actionRef.current.open('top');
    this.setState({ dataItem: items });
  };
  handlerGetData = async () => {
    let mDataSellOut = await fetchSellOutEvident();
    if (mDataSellOut != null && mDataSellOut.length > 0) {
      let mTitle = null;
      mDataSellOut.forEach((item, index) => {
        if (item.titleItem === mTitle) {
          mTitle = item.titleItem;
          mDataSellOut[index].titleItem = '';
        } else {
          mTitle = item.titleItem;
        }
      });
    }
    this.setState({ lstData: mDataSellOut, lstDataContent: mDataSellOut });
  };
  handlerSelectDate = dateString => {
    if (dateString !== null && dateString !== undefined) {
      if (
        this.state.startDate === dateString ||
        dateString < this.state.startDate
      ) {
        this.setState({
          markedDates: this.markedDatesDefault,
          markingType: this.markingTypeDefault,
          isStartDay: false,
          isEndDay: false,
          startDate: '',
        });
      }
      if (!this.state.isStartDay) {
        const markedDates = {};
        const dateFilter = [];
        markedDates[dateString] = {
          startingDay: true,
          color: '#ffa500',
          textColor: 'white',
        };
        dateFilter.push(dateString);
        this.setState({
          dateFilter: dateFilter,
          markingType: 'period',
          markedDates: markedDates,
          isStartDay: true,
          isEndDay: false,
          startDate: dateString,
        });
      } else {
        const markedDates = { ...this.state.markedDates };
        const dateFilter = this.state.dateFilter;
        //
        let startDate = moment(this.state.startDate);
        let endDate = moment(dateString);
        let range = endDate.diff(startDate, 'days');

        if (range > 0) {
          for (let i = 1; i <= range; i++) {
            let tempDate = startDate.add(1, 'day');
            tempDate = moment(tempDate).format('YYYY-MM-DD');
            dateFilter.push(tempDate);
            if (i < range) {
              markedDates[tempDate] = { color: '#ffd64a', textColor: 'white' };
            } else {
              markedDates[tempDate] = {
                endingDay: true,
                color: '#ffa500',
                textColor: 'white',
              };
            }
          }
          this.setState({
            dateFilter: dateFilter,
            markingType: 'period',
            markedDates: markedDates,
            isStartDay: false,
            isEndDay: true,
            startDate: '',
          });
        }
      }
    } else {
      this.setState({
        markedDates: this.markedDatesDefault,
        markingType: this.markingTypeDefault,
      });
    }
  };
  handlerApplyFilter = typeFilter => {
    let sortList = [];
    if (typeFilter == 'APPLY') {
      if (this.state.dateFilter.length > 0) {
        this.state.lstDataContent.filter(item => {
          let items = this.state.dateFilter.filter(
            mFilter => item.sellDate.indexOf(mFilter) > -1,
          );
          if (items.length > 0) {
            sortList.push(item);
          }
        });
      } else {
        sortList = { ...this.state.lstDataContent };
      }
      this.setState({ lstData: sortList, isFilter: true });
      modalRef.current.close();
    } else {
      this.setState({
        isFilter: false,
        dateFilter: [],
        lstData: this.state.lstDataContent,
        markedDates: this.markedDatesDefault,
        markingType: this.markingTypeDefault,
      });
    }
  };
  handlerInputKeyFilter = strKey => {
    let lstFilter = this.state.lstDataContent.filter(
      i =>
        i.productName.toLowerCase().match(strKey.toLowerCase()) ||
        i.contactName.toLowerCase().match(strKey.toLowerCase()) ||
        i.phone.toLowerCase().match(strKey.toLowerCase()),
    );
    this.setState({
      lstData:
        strKey !== null && strKey !== undefined
          ? lstFilter
          : this.state.lstDataContent,
    });
  };
  handlerActionButton = typeAction => {
    switch (typeAction) {
      case this.aCamera:
        this.takePhoto(this.state.dataItem);
        break;
      case this.aUploadFile:
        this.getPhotoFromGallery(this.state.dataItem);
        break;
      case this.aViewPhoto:
        this.showAlbum(this.state.dataItem);
        break;
    }
  };
  handlerUpload = async item => {
    //console.log(item)
    await uploadEvident(
      item,
      async message => {
        alertNotify(message.toString());
      },
      countImage => {
        let count = item.photoCount + countImage;
        let countFull = item.photoCountFull + countImage;
        item.productId !== undefined &&
          this.setState({
            lstData: this.state.lstData.map(i =>
              i.stt === item.stt ? { ...i, photoCount: count } : i,
            ),
          });
        item.productId === undefined &&
          this.setState({
            lstData: this.state.lstData.map(i =>
              i.stt === item.stt ? { ...i, photoCountFull: countFull } : i,
            ),
          });
      },
    );
    await uploadPhoto(item);
  };

  renderButtonAction = (title, icon, typeAction) => {
    return (
      <Button
        type="clear"
        icon={
          <SpiralIcon
            type="material-community"
            name={icon}
            size={20}
            color={DEFAULT_COLOR}
          />
        }
        containerStyle={{
          alignItems: 'flex-start',
          borderTopColor: '#c2c2c2',
          borderTopWidth: 0.5,
        }}
        title={title}
        titleStyle={{ fontSize: 13, color: 'black', marginStart: 3 }}
        buttonStyle={{ height: 35, marginBottom: 3 }}
        onPress={() => this.handlerActionButton(typeAction)}
      />
    );
  };
  renderItem = ({ item }) => {
    const itemShop = { ...item, productId: undefined };
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View
          style={{
            ...styles.rowTitleSellOutCheck,
            display: item.titleItem.length > 0 ? 'flex' : 'none',
          }}
        >
          <Text style={{ flex: 3, fontWeight: '500', fontSize: 15 }}>
            {item.titleItem}
          </Text>
          <Button
            type="outline"
            icon={
              <SpiralIcon
                type="material-community"
                name="camera"
                size={20}
                color="black"
              />
            }
            style={{ flex: 1 }}
            titleStyle={{
              fontSize: 13,
              color: item.colorConfirmTL,
              marginEnd: 3,
            }}
            buttonStyle={{ borderColor: 'black', marginEnd: 3 }}
            onPress={() => this.showBottomButton(itemShop)}
          />
          <Button
            type="outline"
            icon={
              <SpiralIcon
                type="material-community"
                name="upload"
                size={20}
                color="black"
              />
            }
            style={{ flex: 1 }}
            title={item.photoCountFull + ' Hình'}
            titleStyle={{
              fontSize: 13,
              color: item.colorConfirmTL,
              padding: 8,
            }}
            buttonStyle={{ borderColor: 'black' }}
            onPress={() => this.handlerUpload(itemShop)}
          />
        </View>
        <View
          style={{
            marginBottom: 8,
            borderColor: '#e2e2e2',
            borderWidth: 0.5,
            borderRadius: 5,
          }}
        >
          <View style={{ padding: 8, flex: 1, flexDirection: 'column' }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Badge
                status="primary"
                badgeStyle={{
                  height: 32,
                  width: 32,
                  borderRadius: 20,
                  marginEnd: 8,
                }}
                value={item.quantity}
              />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500' }}>
                {item.productName}
              </Text>
              <Button
                type="outline"
                icon={
                  <SpiralIcon
                    type="material-community"
                    name="camera"
                    size={20}
                    color={DEFAULT_COLOR}
                  />
                }
                style={{ flex: 1 }}
                titleStyle={{ fontSize: 13, color: item.colorConfirmTL }}
                buttonStyle={{ borderColor: DEFAULT_COLOR, marginEnd: 3 }}
                onPress={() => this.showBottomButton(item)}
              />
              <Button
                type="outline"
                icon={
                  <SpiralIcon
                    type="material-community"
                    name="upload"
                    size={20}
                    color={DEFAULT_COLOR}
                  />
                }
                style={{ flex: 1 }}
                title={item.photoCount + ' Hình'}
                titleStyle={{
                  fontSize: 13,
                  color: item.colorConfirmTL,
                  padding: 8,
                }}
                buttonStyle={{ borderColor: DEFAULT_COLOR }}
                onPress={() => this.handlerUpload(item)}
              />
            </View>
            <Text style={{ paddingBottom: 3 }}>{item.shopName}</Text>
            <Text style={{ paddingBottom: 3 }}>{item.sellDate}</Text>
            <Text style={{ paddingBottom: 3 }}>{item.contactName}</Text>
            <Text style={{ paddingBottom: 3 }}>{item.phone}</Text>
            <Text style={{ paddingBottom: 3 }}>{item.fullName}</Text>
            {item.adminNote !== null && item.adminNote !== undefined && (
              <Text
                style={{
                  paddingBottom: 3,
                  fontSize: 15,
                  fontWeight: '500',
                  color: 'red',
                }}
              >
                Reject: Sai hoa don
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          Title={'Kiểm tra trùng số bán'}
          righticon={'filter'}
          rightclick={() => modalRef.current.open('top')}
        />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <SearchBar
            containerStyle={{
              borderTopColor: 'white',
              backgroundColor: appcolor.transparent,
              borderBottomColor: appcolor.transparent,
            }}
            inputContainerStyle={{ backgroundColor: '#e2e2e2', height: 38 }}
            inputStyle={{ fontSize: 13, color: 'black' }}
            placeholder="Tìm kiếm sản phẩm"
            lightTheme
            round
            clearIcon
            value={this.state.keySearch}
            onChangeText={this.handlerInputKeyFilter}
          />
          <FlatList
            style={{ padding: 8, marginBottom: 32 }}
            keyExtractor={item => item.itemId}
            data={this.state.lstData}
            renderItem={this.renderItem}
          />
        </View>
        <Modalize ref={modalRef} modalHeight={450}>
          <View View style={{ flex: 1, margin: 8 }}>
            <View
              style={{ flex: 1, marginBottom: 8, flexDirection: 'row-reverse' }}
            >
              <Button
                type="solid"
                title="Áp dụng"
                titleStyle={{ fontSize: 12 }}
                buttonStyle={{ marginStart: 5 }}
                onPress={() => this.handlerApplyFilter('APPLY')}
              />
              <Button
                type="outline"
                title="Làm mới"
                titleStyle={{ fontSize: 12 }}
                onPress={() => this.handlerApplyFilter('CLEAR')}
              />
            </View>
            <ActionFilter
              handlerSelectDate={this.handlerSelectDate.bind(this)}
              mState={this.state}
            />
          </View>
        </Modalize>
        <Modalize ref={actionRef} modalHeight={230} keyboardAvoidingOffset={50}>
          <View style={{ flex: 1, flexDirection: 'column', margin: 16 }}>
            <Text
              style={{ ...styles.title, textAlign: 'center', marginBottom: 8 }}
            >
              Upload hình ảnh
            </Text>
            {this.state.dataItem.productId !== undefined && (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {this.state.dataItem.productName}
              </Text>
            )}
            {this.renderButtonAction('Chụp hình', 'camera', this.aCamera)}
            {this.renderButtonAction(
              'Chọn hình ảnh từ thư viện',
              'upload',
              this.aUploadFile,
            )}
            {this.renderButtonAction(
              'Xem hình ảnh',
              'image-album',
              this.aViewPhoto,
            )}
          </View>
        </Modalize>
      </View>
    );
  }
}

export default SellOutEvident;
