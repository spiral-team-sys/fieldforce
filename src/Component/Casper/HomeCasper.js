import React, { Fragment, PureComponent } from 'react';
import { View, Text, AppState, RefreshControl, ScrollView } from 'react-native';
import { Divider } from '@rneui/themed';
import Moment from 'moment';
import { GetEmployeeInfo, ManageMessenger, saveStore, getStore, ToastSuccess } from '../../Core/Helper';
import { getLstMessengerNotSeen, getStoreList } from '../../Controller/WorkController';
import { _competitorId, MENU_TYPE } from '../../Core/URLs';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { AppCreateAction } from '../../Core/ReduxController';
import { TODAY } from '../../Core/Utility';
import { MainMenu } from '../../Content/MainMenu';
import { GetMenu, RemoveUser } from '../../Controller/UserController';
import { APPDOWNLOAD, downloadAll } from '../../Controller/DownloadDataController';
import { scaleSize } from '../../Themes/AppsStyle';
import { Welcome } from '../Welcome/WelcomeScreen';
import messaging from '@react-native-firebase/messaging';
import { fetchDataNotify } from '../../Controller/NotificationController';
import MessageForm from '../../Content/Message';
import { GetDataDashboard } from '../../Controller/DashboardController';
import LoginCasper from './LoginCasper';
import { DashboardRouting } from '../../Content/Beko/DashboardRouting';
import { LoadingView } from '../../Control/ItemLoading';

class HomeCasper extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isNewApp: false,
            isMainApp: true,
            isShowNotify: false,
            badgeNotify: 0,
            Employee: {},
            notifyInfo: '',
            lstCat: [],
            selectedCat: '',
            displayMenu: 0,
            appState: AppState.currentState,
            chartdata: [],
            activeSlide: 0,
            titlePage: '',
            detailSelect: [],
            pageIndex: null,
            userinfo: null,
            refreshing: false,
            welcome: 1,
        }
    }

    async componentDidMount() {
        let userinfo = await GetEmployeeInfo();
        await setTimeout(async () => {
            await this.setState({ welcome: 0 })
            if (userinfo.employeeId !== undefined) {
                await this.props.GAppController.SetUserInfo(userinfo);
                await this.setState({ Employee: userinfo })
                if (TODAY >= userinfo?.expriedDate) // 20201112
                {
                    await RemoveUser();
                    await this.props.GAppController.SetUserInfo({});
                } else {
                    await this.setBadge();
                    await this.loadChart();
                    await this.SyncdataApp()
                    //load menu
                    const _menu = await GetMenu(0);
                    (_menu && _menu.length === 0) && await APPDOWNLOAD.downloadMenu();
                    await this.setState({ menus: [] });
                    await this.setState({ menus: _menu });
                }
            }
        }, 3000)

        messaging().getInitialNotification().then(async remoteMessage => {
            if (remoteMessage !== null) {
                await this.gotoLink(remoteMessage?.data || {})
            }
        })
        messaging().onNotificationOpenedApp(async remoteMessage => {
            // console.log("onNotificationOpenedApp")
            await this.gotoLink(remoteMessage?.data || {})
        });
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            // console.log(remoteMessage, "setBackgroundMessageHandler")
            await this.gotoLink(remoteMessage?.data || {})

        });
        messaging().onMessage(async remoteMessage => {
            // console.log("onMessage")
            await fetchDataNotify(e => { this.setBadge(); })
            await this.setState({ notifyInfo: remoteMessage, isShowNotify: true })
            // await this.gotoLink(remoteMessage?.data || {})
        });
        this.subscription = AppState.addEventListener('change', this._handleAppStateChange);
    }
    gotoLink = (info) => {
        if (info.hyperLinks === undefined || info.hyperLinks === null) {
            this.props.navigation.navigate('Notification');
        }
        else if (info.hyperLinks.includes('http')) {
            this.props.navigation.navigate('WebView', { link: hyperLinks, titlePage: 'Trình duyệt' });
        }
        else {
            this.props.navigation.navigate(info.hyperLinks);
        }
    }
    async gotoMessage(info) {
        await this.setState({ isShowNotify: false })
        await this.gotoLink(info)
    }
    componentWillUnmount() {
        try {
            this.subscription.remove()
        } catch (err) {
            console.log(err, "componentWillUnmount")
        }
    }
    loadChart = async () => {
        await GetDataDashboard(result => {
            if (result.length > 0) {
                // console.log(result, "GetDataDashboard")
                this.setState({ chartdata: result || [] })
            } else {
                this.setState({ chartdata: [] })
            }
        })
    }
    async checkAutoDownloadShop() {
        await saveStore(MENU_TYPE, '0')
        let Today = parseInt(Moment(new Date()).format('YYYYMMDD'));
        let lst = await getStoreList('', Today);
        if (lst?.length === 0) {
            this.menuRef1?.onItemPress({ Id: 1, name: 'Download' })
        }
    }
    _backgroundState(state) {
        return state.match(/inactive|background/);
    }
    _handleAppStateChange = async (nextAppState) => {
        let isload = false;
        if (this._backgroundState(nextAppState)) {
        } else if (this._backgroundState(this.state.appState) && (nextAppState === 'active') && isload === false) {
            isload = true;
            await this.setBadge();
            await this.setState({ isShowNotify: false })
            await this.loadChart()
            await this.checkAutoDownloadShop();
        }
        this.setState({ appState: nextAppState });
    }
    async setBadge() {
        let lstMessenger = await getLstMessengerNotSeen();
        if (Array.isArray(lstMessenger)) {
            this.setState({ badgeNotify: lstMessenger.length });
        }
    }
    changeDisplayMenu = async () => {
        let menuType = await getStore(MENU_TYPE);
        if (menuType !== undefined) {
            await saveStore(MENU_TYPE, parseInt(menuType) === 0 ? '1' : '0')
            this.setState({ displayMenu: parseInt(menuType) === 0 ? 1 : 0 })
        }
    }
    SyncdataApp = async () => {
        await this.setState({ refreshing: true })
        await this.loadChart();
        const _menu = await GetMenu(0);
        await APPDOWNLOAD.downloadMenu();
        await this.setState({ menus: [] });
        await this.setState({ menus: _menu });
        await downloadAll(result => {
            this.setState({ refreshing: false })
            ToastSuccess(result, "SyncData", 'top');
        })
        await fetchDataNotify(async e => {
            await this.setBadge();
        })
        setTimeout(() => {
            this.setState({ refreshing: false })
        }, 60000)//sau 1 phut neu mat ket noi se tat
    }
    render() {
        const { appcolor, userinfo } = this.props;
        const { chartdata } = this.state;
        return (
            <Fragment>
                {
                    this.state.welcome === 1 ?
                        <Welcome />
                        :
                        userinfo.employeeId !== undefined ?
                            <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
                                <HeaderCustom
                                    isHome={true}
                                    title={userinfo.employeeName}
                                    countNotify={this.state.badgeNotify}
                                    iconLeft='bars'
                                    iconRight='bell'
                                    leftFunc={() => this.props.navigation.openDrawer()}
                                    rightFunc={() => ManageMessenger(this.props)}
                                />
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    refreshControl={<RefreshControl
                                        refreshing={false}
                                        onRefresh={() => this.SyncdataApp()}
                                    />}>
                                    <View style={{ flex: 1, padding: 7 }}>
                                        <LoadingView isLoading={this.state.refreshing} title='Đang đồng bộ dữ liệu' />
                                        <View style={{ height: 240, paddingEnd: 0 }}>
                                            {chartdata.length > 0 &&
                                                <DashboardRouting navigation={this.props.navigation} data={chartdata[0]} />
                                            }
                                        </View>
                                        <View style={{ flexGrow: 1, backgroundColor: appcolor.light }}>
                                            <Text style={{
                                                color: appcolor.dark, flexGrow: 1,
                                                padding: 12, fontWeight: '700',
                                                fontSize: scaleSize(20)
                                            }}>Chức năng</Text>
                                            {!this.state.refreshing && <MainMenu menus={this.state.menus} navigation={this.props.navigation} />}
                                        </View>
                                    </View>
                                </ScrollView>
                                <MessageForm ref={ref => this.messageRef = ref}
                                    animation={'slideY'} position={'top'}
                                    type={'info'} appcolor={this.props.appcolor}
                                    navigation={this.props.navigation}
                                    data={this.state.notifyInfo?.data || {}}
                                    messageHeight={100} >
                                    {
                                        this.state.isShowNotify &&
                                        this.messageRef?.showMessage(this.state.notifyInfo?.notification?.title, this.state.notifyInfo?.notification?.body, 7000)
                                    }
                                </MessageForm>

                            </View>
                            : <LoginCasper onLoginCallBack={() => this.SyncdataApp()} />
                }
            </Fragment>
        );
    }
}
function mapStateToProps(state) {
    return {
        userinfo: state.GAppState.userinfo,
        appcolor: state.GAppState.appcolor,
    }
}
function mapDispatchToProps(dispatch) {
    return {
        GAppController: bindActionCreators(AppCreateAction, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeCasper);