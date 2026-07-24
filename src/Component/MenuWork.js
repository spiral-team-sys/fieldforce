import React, { PureComponent } from 'react';
import { deviceWidth } from '../Themes/AppsStyle';
import { View, Text, Dimensions, StatusBar, FlatList } from 'react-native';
import { Card, ListItem, Avatar } from '@rneui/themed';
import { checkNetwork } from '../Core/Utility';
import {
  DEFAULT_COLOR,
  URL_DOWNLOAD_MENULIST,
  URL_FIELD_COACHING,
} from '../Core/URLs';
import ScreenOne from './WaveHeader/ScreenOne';
import WavyHeader from './WaveHeader/WavyHeader';
const delay = ms => new Promise(res => setTimeout(res, ms));
import SpiralIcon from '../Control/Icon/SpiralIcon';
import { GetEmployeeInfo, Token } from '../Core/Helper';
import base64 from 'react-native-base64';
import * as Progress from 'react-native-progress';

export default class MenuWork extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      EmployInfo: null,
      MenuItem: [],
    };
  }
  setShowProgress = check => {
    this.setState({ showProgress: check });
  };
  async componentDidMount() {
    let EmployeeInfo = await GetEmployeeInfo();
    let emObj = EmployeeInfo;
    this.setState({ EmployInfo: emObj });
    this.loadData();
  }
  async loadData() {
    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      alert(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }

    this.setShowProgress(true);
    let token = await Token();
    console.log(token, 'or');

    alert(999);
    await fetch(URL_DOWNLOAD_MENULIST, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(res => {
        this.setShowProgress(false);
        this.setState({ MenuItem: res });
      });
  }
  ItemSelect = async item => {
    if (item.Id !== 0) {
      const dataObj = {
        AccountId: this.state.EmployInfo.accountId,
        EmployeeId: this.state.EmployInfo.employeeId,
      };
      const base64Str = base64.encode(JSON.stringify(dataObj));
      //this.b64EncodeUnicode(JSON.stringify(data));
      let url = URL_FIELD_COACHING + item.accessKey + '&data=' + base64Str;
      this.props.navigation.navigate('WebView', {
        link: url,
        titlePage: item.title,
      });
    }
  };
  renderItem = ({ item }) => (
    <ListItem
      style={{ height: 180, width: '50%', backgroundColor: '#fff' }}
      onPress={() => this.ItemSelect(item)}
    >
      <ListItem.Content
        style={{
          height: '100%',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Avatar
          size="large"
          showEditButton
          rounded
          icon={{
            name: 'reader-outline',
            type: 'ionicon',
            size: 60,
            color: 'gray',
          }}
        />
        <ListItem.Title style={{ fontSize: 12, color: 'black' }}>
          {item.title}
        </ListItem.Title>
        <ListItem.Subtitle style={{ fontSize: 12, color: 'gray' }}>
          {item.subTitle}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
  render() {
    return (
      // <View>
      // <PageHeader leftclick={()=>this.props.navigation.goBack()}
      //   Title='Báo cáo số bán'
      //   righticon='cloud-upload-alt'
      //   rightcolor='white'
      //   rightclick={()=>this.Upload()}
      // />
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          backgroundColor: DEFAULT_COLOR,
        }}
      >
        <StatusBar hidden={true}></StatusBar>
        <WavyHeader
          customStyles={{ position: 'absolute', width: deviceWidth }}
          flip={true}
        ></WavyHeader>
        <View style={{ height: 100, backgroundColor: 'transparent' }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'gray', fontWeight: '500', fontSize: 17 }}>
              {this.props.route.params.titlePage}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              height: '100%',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <View
              style={{ width: '50%', height: '100%', justifyContent: 'center' }}
            >
              <SpiralIcon
                type="ionicon"
                style={{ left: 15 }}
                size={35}
                name="chevron-back-outline"
                onPress={() => this.props.navigation.goBack()}
                color={'gray'}
              />
            </View>
          </View>
        </View>

        <Card
          containerStyle={{
            top: 52,
            borderRadius: 20,
            height: '73%',
            backgroundColor: '#fff',
          }}
        >
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            data={this.state.MenuItem}
            renderItem={this.renderItem}
            numColumns={2}
          />
        </Card>

        {this.state.showProgress === true && (
          <View
            style={{
              position: 'absolute',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: Dimensions.get('window').height / 2,
            }}
          >
            {/* <Progress.Circle thickness={1} size={65} indeterminate={true}/><Text style={{color:'#007AFF'}}>...</Text> */}
            <Progress.CircleSnail
              color={DEFAULT_COLOR}
              thickness={8}
              size={100}
            />
          </View>
        )}
      </View>
      // </View>
    );
  }
}
