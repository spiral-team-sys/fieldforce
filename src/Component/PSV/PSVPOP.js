import React, { Component } from 'react';
import { View, Dimensions, StatusBar, RefreshControl, ScrollView, FlatList } from 'react-native';
import { Card, ListItem, Avatar, Badge, Icon } from '@rneui/themed';
import { checkNetwork } from '../../Core/Utility';
import { DEFAULT_COLOR, URL_DOWNLOAD_MENUPOP } from '../../Core/URLs';
import { GetEmployeeInfo, Token } from '../../Core/Helper';
import * as Progress from 'react-native-progress';
import { HeaderCustom } from '../../Content/HeaderCustom';


export default class PSVPOP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      EmployInfo: null,
      MenuItem: [],
      loading: false
    }
  }
  setShowProgress = (check) => {
    this.setState({ showProgress: check, loading: check });
  }
  async componentDidMount() {
    let EmployeeInfo = await GetEmployeeInfo()
    let emObj = EmployeeInfo;
    this.setState({ EmployInfo: emObj })
    this.loadData();
  }
  async loadData() {
    let isNetwork = await checkNetwork();

    if (!isNetwork) {
      alert("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
      return
    }

    this.setShowProgress(true);
    let token = await Token();

    await fetch(URL_DOWNLOAD_MENUPOP, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + token
      },
    })
      .then((response) => {
        return response.json()
      }).then(res => {
        this.setShowProgress(false);

        this.setState({ MenuItem: res });
      })
  }
  ItemSelect = async (item) => {

    if (item.kpiId !== 0 && item.kpiId !== 5) {
      this.props.navigation.navigate('TotalPOP', { wareHouseId: item.wareHouseId, kpiId: item.kpiId, menuName: item.menuName, wareHouseList: item.wareHouseList });
    }
    else {
      this.props.navigation.navigate('followPOP', { menuName: item.menuName })
    }

  }
  renderItem = ({ item, index }) => (
    <ListItem key={"gd32" + index} style={{ height: 200, width: '50%', backgroundColor: '#fff' }} onPress={() => this.ItemSelect(item)}>
      <ListItem.Content style={{ height: '100%', width: 180, alignItems: 'center', borderColor: 'gray', backgroundColor: DEFAULT_COLOR, borderWidth: 2, borderRadius: 10 }}>
        <View style={{ backgroundColor: '#fff', width: '100%', top: -5, borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'flex-end' }}>
          {
            item.kpiId === 1 && <Avatar size="large" showEditButton rounded icon={{ name: 'home', type: 'ionicon', size: 40, color: DEFAULT_COLOR }} />
          }
          {
            item.kpiId === 2 && <Avatar size="large" showEditButton rounded icon={{ name: 'home', type: 'ionicon', size: 40, color: DEFAULT_COLOR }} />
          }
          {
            item.kpiId === 3 && <Avatar size="large" showEditButton rounded icon={{ name: 'warning', type: 'ionicon', size: 40, color: 'orange' }} />
          }
          {
            item.kpiId === 4 && <Avatar size="large" showEditButton rounded icon={{ name: 'pricetag', type: 'ionicon', size: 40, color: 'green' }} />
          }
          {
            item.kpiId === 5 && <Avatar size="large" showEditButton rounded icon={{ name: 'car', type: 'ionicon', size: 40, color: DEFAULT_COLOR }} />
          }
          {
            item.kpiId === 6 && <Avatar size="large" showEditButton rounded icon={{ name: 'briefcase', type: 'ionicon', size: 40, color: DEFAULT_COLOR }} />
          }
          {
            item.numberNotify > 0 && <Badge
              value={item.numberNotify}
              textStyle={{ fontSize: 12, fontWeight: '600' }}
              status="success"
              badgeStyle={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'red', shadowRadius: 15 }}
              containerStyle={{ position: 'absolute', top: -4, right: -4, }}
            />
          }
        </View>
        <View style={{ backgroundColor: 'white', width: '100%', top: -8, alignItems: 'center', height: 50 }}>
          <ListItem.Title style={{ fontSize: 15, color: 'black', fontWeight: '700', width: '100%', textAlign: 'left', paddingLeft: 5 }}>{' ' + item.menuName}</ListItem.Title>
          {/* <ListItem.Subtitle style={{fontSize:13,color:'#fff'}}>{item.detailMenu}</ListItem.Subtitle> */}
        </View>
        <View style={{ flexDirection: 'row', width: '100%', height: 25 }}>
          <ListItem.Subtitle style={{ fontSize: 13, color: '#fff', textAlign: 'center', fontWeight: '700', width: '70%' }}>Chi tiết</ListItem.Subtitle>
          <SpiralIcon name='arrow-forward-circle' type='ionicon' color={'#fff'} size={25}></SpiralIcon>
        </View>
      </ListItem.Content>
    </ListItem>
  )
  isRandomColor = () => {
    let ColorCode = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
    return ColorCode
  }
  render() {

    return (
      <View style={{ flex: 1, justifyContent: 'flex-start', backgroundColor: '#fff' }}>
        <HeaderCustom
          leftFunc={() => this.props.navigation.goBack()}
          title={this.props.route.params.titlePage || 'POP Manager'}
        />
        <View>
          <FlatList
            keyExtractor={(item, index) => item + index}
            data={this.state.MenuItem}
            refreshControl={
              <RefreshControl
                refreshing={this.state.loading}
                colors={['blue', 'orange']}
                titleColor={DEFAULT_COLOR}
                tintColor={DEFAULT_COLOR}
                title={'Đang tải dữ liệu...'}
                onRefresh={() => {
                  this.loadData()
                }} />
            }
            renderItem={this.renderItem}
            numColumns={2} />
        </View>
        {
          this.state.showProgress === true &&
          <View style={{ position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }}>
            <Progress.CircleSnail
              color={DEFAULT_COLOR}
              thickness={8}
              size={100} />
          </View>
        }

      </View>
      // </View>
    );
  }
}