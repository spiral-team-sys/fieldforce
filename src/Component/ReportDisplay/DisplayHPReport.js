import React, { PureComponent } from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Icon } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import {
  getAllAuditResult,
  getProgramDisplay,
  getProgramDisplayHPI,
} from '../../Controller/WorkController';
import { AppNameBuild, hpiApp, mitsuApp, nokiaApp } from '../../Core/URLs';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import LottieView from 'lottie-react-native';

class DisplayHPReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      workinfo: {},
      lstShow: [],
    };
  }
  async componentDidMount() {
    await this.loadData();
  }
  async refreshView() {
    await this.loadData();
    this.forceUpdate();
  }
  loadData = async () => {
    const workinfo = this.props.route.params.workinfo;
    let programlst =
      AppNameBuild === hpiApp || AppNameBuild === mitsuApp
        ? await getProgramDisplayHPI()
        : await getProgramDisplay(workinfo.shopId);

    let lstId = '';
    let count = 0;
    programlst.forEach(itemH => {
      count += 1;
      if (count === 1) {
        lstId = lstId + itemH.id;
      } else {
        lstId += ',' + itemH.id;
      }
    });

    if (lstId !== '') {
      let lstRes = await getAllAuditResult(workinfo.workId, lstId);
      let lstFinish = [];
      lstRes.map(itemR => {
        lstFinish.push(itemR.displayId);
      });

      let lstTem = programlst.map(itemH =>
        lstFinish.includes(itemH.id) ? { ...itemH, finish: 1 } : itemH,
      );
      this.setState({ workinfo: workinfo, lstShow: lstTem });
    }
  };
  selectedItem = (item, label) => {
    switch (label) {
      case this.state.LblCompetitor:
        this.setState({ seletedCategory: item });
        this.refreshView();
      default:
        break;
    }
  };
  selectProgram = (e, item) => {
    if (AppNameBuild === hpiApp) {
      this.props.navigation.navigate('displayProgram', {
        DisplayItem: item,
        workinfo: {
          ...this.state.workinfo,
          reportId: this.props.route.params.reportId,
        },
      });
    } else if (AppNameBuild === nokiaApp) {
      this.props.navigation.navigate('AuditDisplaysHMD', {
        DisplayItem: item,
        workinfo: {
          ...this.state.workinfo,
          reportId: this.props.route.params.reportId,
        },
        callBackDisPlay: this.loadData,
      });
    } else {
      this.props.navigation.navigate('AuditDisplayItems', {
        DisplayItem: item,
        workinfo: {
          ...this.state.workinfo,
          reportId: this.props.route.params.reportId,
        },
        callBackDisPlay: this.loadData,
      });
    }
  };
  renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ height: 160, width: '50%', padding: 3, borderRadius: 5 }}
      onPress={e => this.selectProgram(e, item)}
    >
      <View
        style={{
          width: '100%',
          backgroundColor: this.props.appcolor.surface,
          justifyContent: 'center',
        }}
      >
        <View style={{ width: '100%', height: '80%', alignItems: 'center' }}>
          <SpiralIcon
            color="orange"
            name="description"
            size={100}
            activeOpacity={0.7}
          />
        </View>
        <Text
          style={{
            width: '100%',
            textAlign: 'center',
            padding: 5,
            fontSize: 10,
            fontWeight: '600',
            color: this.props.appcolor.dark,
          }}
        >
          {item.name}
        </Text>
        {item.finish === 1 && (
          <LottieView
            style={{
              width: 40,
              height: 40,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            source={require('../../Themes/Images/check-mark-success.json')}
            autoPlay
            loop={false}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <ImageBackground
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: this.props.appcolor.light,
        }}
      >
        <PageHeader
          leftclick={() => this.props.navigation.goBack()}
          type="font-awesome"
          Title={this.props.route.params.titlePage}
        ></PageHeader>

        <FlatList
          style={{ width: '100%' }}
          contentContainerStyle={{ width: '100%' }}
          keyExtractor={this.keyExtractor}
          data={this.state.lstShow}
          renderItem={this.renderItem}
          numColumns={2}
        />
      </ImageBackground>
    );
  }
}
const mapStateToProps = state => {
  return {
    appcolor: state.GAppState.appcolor,
    workinfo: state.GAppState.workinfo,
    shopinfo: state.GAppState.shopinfo,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(DisplayHPReport);
