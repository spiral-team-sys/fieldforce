import React, { PureComponent } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HeaderNavigation from './HeaderNavigation';
import ShopPage from './Shops/ShopPage';
import TakePicture from '../Content/TakePicture';
import ImageReview from '../Content/ImageReview';
import { Settings } from './Settings';
import Promotion from './Promotion';
import SurveyCTSS from './SurveyCTSS';
import Market from './HPI/Market';
import DisplayProgram from './ReportDisplay/DisplayProgram';
import DisplayCompetitorReport from './ReportDisplay/DisplayCompetitorReport';
import DisplayCompetitorReport_MD from './ReportDisplay/LG/DisplayCompetitorReport_MD';
import TrackingCompetitorReport from './TrackingCompetitorReport';
import AlbumPhoto from './AlbumPhoto';
import DisplayEPS from './EPSON/DisplayEPS';
import StockoutEPS from './EPSON/StockoutEPS';
import DisplayPSV from './PSV/DisplayPSV';
import DisplayBK from './Beko/ReportDisplayAndStock/DisplayBK';
import StockOutBK from './Beko/StockOutBK';
import StockOutART from './ART/StockOutART';
import DisplayPriceReportLG from './LG/DisplayPriceReportLG';
import NotifyDetail from './NotifyDetail';
import PayslipPage from './PaySlip';
import MenuWork from './MenuWork';
import PSVPOP from './PSV/PSVPOP';
import TotalPOP from './PSV/TotalPOP';
import Sellout from './ReportSellOut/Sellout';
// import { WebViewScreen } from './WebViewScreen'
// import { WebViewScreen as PageWebView } from './WebViewScreen'
import AuditDisplaysHMD from './AuditDisplaysHMD';
import MarketPriceReport from './ReportPrice/MarketPriceReport';
import PriceCompetitor from './ReportPrice/PriceCompetitor';
import CompetitorReport from './CompetitorReport';
import WorkingPlan from './WorkingPlan';
import DisplayART from './ART/DisplayART';
import WorkingPlanPG from './PlanWorking/WorkingPlanPG';
import ConfirmPlanSR from './PlanWorking/ConfirmPlanSR';
import ConfirmPlanPG from './PlanWorking/ConfirmPlanPG';
import ConfirmSR from './PlanWorking/MEVN/ConfirmSR';
import FieldCoaching from './TrainingOnline/FieldCoaching';
import AuditDisplayItems from './AuditDisplayItems';
import TrainingResults from './TrainingOnline/TrainingResults';
import { ChartDetail } from '../Content/ChartDetail';
import { FollowPOP } from './PSV/FollowPOP';
import { DetailOrderPOP } from './PSV/DetailOrderPOP';
import { DamageNote } from './PSV/DamageNote';
import { POPByShop } from './PSV/POPByShop';
import ExamByEmployee from './Beko/ExamByEmployee';
import PlanSR from './PlanWorking/MEVN/PlanSR';
import SellInByEmployee from './ReportSellIn/SellInByEmployee';
import SellInShopScreen from './ReportSellIn/SellInShopScreen';
import SellInShopDetailScreen from './ReportSellIn/SellInShopDetailScreen';
import { alertWarning, checkNetwork, deviceWidth } from '../Core/Utility';
import { TrackingDisplayMEVN } from './MEVN/TrackingDisplayMEVN';
import InventoryByEmployee from './ReportInventory/InventoryByEmployee';
import { DisplayCombineBeko } from './Beko/ReportDisplayAndStock/DisplayCombineBeko';
import { InstoreShareBK } from './Beko/InstoreShareBK';
import { DashboardSellOutDetail } from './Dashboard/DashboardSellOutDetail';
import ProgressReport from './Dashboard/ProgressReport';
import { DocumentGroup } from './Document/DocumentGroup';
import { DocumentList } from './Document/DocumentList';
import HistoryConfirm from './PlanWorking/History/Confirm/HistoryConfirm';
import { AdhocDetail } from './Adhoc/AdhocDetail';
import AdhocList from './Adhoc/AdhocList';
import WorkingPlanHMDPG from './PlanWorking/HMD/WorkingPlanHMDPG';
import { PhotoTag } from './Photo/PhotoTag';
import { PhotoEdit } from './Photo/PhotoEdit';
import { SearchStore } from '../Control/SearchStore';
import { DisplayCombineLG } from './LG/DisplayCombineLG';
import LG_WorkingPlanASM from './PlanWorking/LG/LG_WorkingPlanASM';
import LG_WorkingPlanMD from './PlanWorking/LG/LG_WorkingPlanMD';
import LG_WorkingPlanPC from './PlanWorking/LG/LG_WorkingPlanPC';
import LG_WorkingPlanLeader from './PlanWorking/LG/LG_WorkingPlanLeader';
import LG_ConfirmPlanASM from './PlanWorking/LG/LG_ConfirmPlanASM';
import LG_ConfirmPlanPC from './PlanWorking/LG/LG_ConfirmPlanPC';
import LG_ConfirmPlanMD from './PlanWorking/LG/LG_ConfirmPlanMD';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
//import { AppCreateAction } from '../Core/ReduxController';
import AttendantResult from './PlanWorking/History/Attendance/AttendantHistoryScreen';
import WorkingPlanHMDSR from './PlanWorking/HMD/WorkingPlanHMDSR';
import { Logout } from '../Controller/UserController';
import { NavigationContainer } from '@react-navigation/native';
import WorkingPlanSR_V2 from './PlanWorking/WorkingPlanSR_V2';
import { KPIIncentive } from './Dashboard/Beko/KPIIncentive';
import { DisplayPriceReport } from './ReportDisplay/DisplayPriceReport';
import { StockReport } from './EPSON/StockReport';
import SellIn from './ReportSellIn/SellIn';
import { ShopManager } from './Shops/ShopManager';
// import { ShopPageProfile } from './Shops/ShopProfileScreen';
import { ProfileDetail } from './Employee/ProfileDetail';
import { PhotoItems } from './EPSON/PhotoItems';
import { SurveyShelf } from './LG/SurveyShelf';
import PSVManagerHome from './PSVManager/PSVManagerHome';
import { BussinessTrip } from './MEVN/BussinessTrip';
import { DisplayByTarget } from './ReportDisplay/DisplayByTarget/DisplayByTarget';
import { InputPOP } from './POPReport/InputPOP';
import { MonthlyPlan } from './PlanWorking/MonthlyPlan';
import ManagerPlan from './Dashboard/ManagerPlan';
import { PosmWhirlPool } from './POPReport/PosmWhirlPool';
import AccessoriesReport from './LG/AccessoriesReport';
import { SellOutInput } from './ReportSellOut/SellOutInput';
import { PGTimeSheet } from './TimeSheet/PGTimeSheet';
import CameraAI from '../Control/CameraAI';
import ReviewPhoto from '../Control/ReviewPhoto';
import LG_ConfirmPlanLeader from './PlanWorking/LG/LG_WorkingPlanLeader';
import { DisplayMain } from './ReportDisplay/DisplayTrackingCompetitor/DisplayMain';
import { PromotionPriceReport } from './ReportPrice/PromotionPriceReport';
import { DisplayAndStock } from './ReportDisplay/Cuckoo/DisplayAndStock';
import { DisplayAndStockCasper } from './ReportDisplay/Casper/DisplayAndStockCasper';
import { DisplaySituation } from './ReportDisplay/PNS/DisplaySituation';
import { DisplaySurveyReport } from './ReportDisplay/PNS/DisplaySurveyReport';
import { CompetitorReportCuckoo } from './ReportDisplay/Cuckoo/CompetitorReportCuckoo';
import { DisplayByModel } from './ReportDisplay/Beko/DisplayByModel';
import { ReportCheckSell } from './PSV/ReportCheckSell';
import { UploadShopInfo } from './Shops/UploadShopInfo';
import { ConfirmSellIn } from './ReportSellIn/ConfirmSellIn';
import { DashboardHomeSellin } from './Dashboard/DashboardHomeSellin';
import { ProductList } from './ProductList';
import { DeployPOP } from './PSV/DeployPOP';
import { PhotoList } from './Photo/PhotoList';
import TrainingList from './TrainingOnline/TrainingList';
import { POPMenu } from './POPReport/PSV/POPMenu';
import { POPWarehouse } from './POPReport/PSV/POPWarehouse';
import { POPWarningItem } from './POPReport/PSV/POPWarningItem';
import { POPOrderItem } from './POPReport/PSV/POPOrderItem';
import { FollowOrderList } from './POPReport/PSV/POPFollowList/FollowOrderList';
import { OrderPOPDetail } from './POPReport/PSV/POPFollowList/OrderPOPDetail';
import { WeekLyPlan } from './PlanWorking/WeeklyPlan';
import { UpdateSystem } from './UpdateSystem';
import { ReportTimeSheet } from './TimeSheet/ReportTimeSheet';
import { ApproachReport } from './ReportSellOut/ApproachReport';
import { ConfirmPlanWeekly } from './PlanWorking/ConfirmPlanWeekly';
import { RoutingReport } from './Dashboard/RoutingReport';
import { CapacityReport } from './Daikin/CapacityReport';
import { DaikinInventoryReport } from './ReportInventory/DaikinInventoryReport';
import { InstoreShareDaikin } from './Daikin/InstoreShareDaikin';
import { HomeTodoList } from './TodoList/HomeTodoList';
import { AllTodoList } from './TodoList/AllTodoList';
import { MapPlan } from './PlanWorking/MapPlan';
import PayslipDetail from './PayslipDetail';
import { EmployeeResigns } from './LG/EmployeeResigns';
import { ConfirmsResigns } from './LG/ConfirmsResigns';
import { DisplayPricePNS } from './ReportDisplay/PNS/DisplayPricePNS';
import ItemProductsSellin from './ReportSellIn/ItemProductsSellIn';
import CreateSellInByShop from './ReportSellIn/CreateSellInByShop';
import { SurveyResultReport } from './SurveyReport/PNS/SurveyResultReport';
import { ScoreKPI } from './EmployeeKPI/ScoreKPI';
import { KPIResult } from './EmployeeKPI/KPIResult';
import { DisplayDaikin } from './ReportDisplay/Daikin/DisplayDaikin';
import { AuditItemReport } from './ReportAudit/AuditItemReport';
import { TrackingStoreDaikin } from './Daikin/TrackingStoreDaikin';
import { TotalInventoryReport } from './ReportInventory/TotalInventoryReport';
import { TrackingStoreDaikinSO } from './Daikin/TrackingStoreDaikinSO';
import WorkingPlanPG_Permisstion from './PlanWorking/WorkingPlanPG_Permisstion';
import { HomeBusinessMenu } from './BusinessTrips/Home';
import { AttendantIssue } from './TimeSheet/AttendantIssue';
import { ConfirmAttendantIssue } from './TimeSheet/ConfirmAttendantIssue';
import CreateItem from './Shops/NewStore/CreateItem';
import { ConfirmStore } from './Shops/NewStore/ConfirmStore';
import UpdateStore from './Shops/NewStore/UpdateStore';
import SellOutHPI from './HPI/SellOutHPI';
import { SellOutInputHPI } from './HPI/SellOutInputHPI';
import MarketCreate from './HPI/MarketCreate';
import { VerifyDataSellout } from './ReportVerifyData/VerifyDataSellout';
import { VerifySelloutBK } from './ReportVerifyData/VerifySelloutBK';
import { POSMHPIReport } from './HPI/POSMHPIReport';
import { DisplayHPIReport } from './HPI/DisplayHPIReport';
import { ConfirmMain } from './ReportSellIn/ConfirmOrder/ConfirmMain';
import { DisplayAndStockHSS } from './Hisense/DisplayAndStock/DisplayAndStockHSS';
import DrawerMenu from '../Control/DrawerMenu/DrawerMenu';
import { HomeManager } from './Employee/Manager/HomeManager';
import DecorForm from './LG/DecorForm';
import { FSMByShopReport } from './Hisense/FSMReport/FSMByShopReport';
import { DisplayStockHome } from './ReportDisplay/Container/Home/DisplayStockHome';
import { IssueReport } from './Hisense/IssueReport/IssueReport';
import { ConfirmScheduleHome } from './BusinessTrips/ConfirmSchedule/ConfirmScheduleHome';
import { MarketVisit } from './TrainingOnline/CoachingByShop/MarketVisit';
import { FieldCoachingForEmployee } from './TrainingOnline/CoachingByShop/FieldCoachingForEmployee';
import { LocationTracking } from '../Content/LocationTracking';
import { IssueReportHome } from './Hisense/IssueReport/issueReportHome';
import { HomeOverview } from './MaketOverview/HomeOverview';
import { PlanOffice } from './OFFICE SPIRAL/WorkingPlan/PlanOffice';
import { ConfirmPlanOffice } from './OFFICE SPIRAL/WorkingPlan/ConfirmPlanOffice';
import { DashboardSummarySSub } from './Dashboard/DashboardSummarySSub';
import { DisplayCompetitorTF } from '../Component/ReportDisplay/Tefal/DisplayCompetitorTF';
import { HomeInstoreShare } from './InstoreShareReport/HomeInstoreShare';
import { ViewStore } from './Employee/EmployeeStore/ViewStore';
import { FieldCoachingFSMReport } from './FieldCoachingFSM/FieldCoachingFSMReport';
import { ScoreKPIV2 } from './EmployeeKPI/KPIV2/ScoreKPIV2';
import { KPISummary } from './Dashboard/KPISummary/KPISummary';
import { HomeReportStatusIssue } from './ReportStatusIssue';
import { DashboardSellInDetails } from './Dashboard/DashboardDetails/SellIn';
import { HomeReportStatusIssueManager } from './ReportStatusIssue/ManagerIssue';
import { PriceCompetitorDealer } from './ReportPrice/PriceCompetitorDealer/PriceCompetitorDealer';
import { ScreenShops } from './Shops/Page/ScreenShops';
import { EmployeeInfo } from './Employee/Infomation';
import { QRCodeScan } from './Employee/Infomation/Control/QRCodeScan';
import { HomePageMain } from './Home/HomePageMain';
import { DisplayDefault } from './ReportDisplay/Default';
import ShareReportInfo from './Dashboard/ShareReportInfo';
import { DashboardDisplayDetails } from './Dashboard/DashboardDetails/Display';
import { DisplayCompetitorReportV2 } from './ReportDisplay/DisplayCompetitorReportV2';
import { PhotoByList } from './Photo/PhotoByList';
import { PayslipList } from '../Component/Payslip/PayslipList';
import PayslipDetails from '../Component/Payslip/PayslipDetails';
import { OOSDefault } from './ReportOOS';
import { WarehouseMain } from './ReportWarehouse';
import { SummaryList } from './Dashboard/OOS/SumaryList/SummaryList';
import { SupportInfo } from './Employee/Infomation/Control/SupportInfo';
import { PhotoSystemReport } from './Photo/PhotoSystemReport';
import { ScreenGroup } from './Dashboard/OOS/DashboardListOOS/Views/ScreenGroup';
import { StatisticalDisplay } from './LG/StatisticalDisplay/StatisticalDisplay';
import { SummaryGroup } from './Dashboard/OOS/SumaryList/SummaryGroup';
import { ReportZalo } from './PSV/ReportZalo';
import { ShopReportZalo } from './PSV/ShopReportZalo';

import { DocumentGroupByShop } from './Document/DocumentGroupByShop';
import { EmployeeMaternityLeave } from './Employee/Infomation/Page/EmployeeMaternityLeave';
import { DashboardTarget } from './Dashboard/DashboardTarget';
import { PGReportHome } from './ReportPG';
import { VideoList } from './Document/Video/VideoList';
import { VideoPlay } from './Document/Video/VideoPlay';
import { VideoByType } from './Document/Video/VideoByType';

const Stack = createStackNavigator();
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen key='m1' name='Home' options={{ headerLeft: null, gestureEnabled: false }} component={HomePageMain}></Stack.Screen> */}
      <Stack.Screen
        key="c1"
        name="cameraai"
        component={CameraAI}
      ></Stack.Screen>
      <Stack.Screen
        key="system"
        name="system"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={UpdateSystem}
      ></Stack.Screen>
      <Stack.Screen
        key="c222"
        name="calendarweek"
        component={WeekLyPlan}
      ></Stack.Screen>
      <Stack.Screen
        key="c2"
        name="reviewphoto"
        component={ReviewPhoto}
      ></Stack.Screen>
      <Stack.Screen
        key="m2"
        name="Profile"
        component={EmployeeInfo}
      ></Stack.Screen>
      <Stack.Screen
        key="m3"
        name="MenuWork"
        component={MenuWork}
      ></Stack.Screen>
      <Stack.Screen
        key="m4"
        name="displayEPS"
        component={DisplayEPS}
      ></Stack.Screen>
      <Stack.Screen
        key="m5"
        name="stockoutEPS"
        component={StockoutEPS}
      ></Stack.Screen>
      <Stack.Screen
        key="m8"
        name="DisplayPSV"
        component={DisplayPSV}
      ></Stack.Screen>
      <Stack.Screen
        key="m9"
        name="DisplayART"
        component={DisplayART}
      ></Stack.Screen>
      <Stack.Screen key="m10" name="SellIn" component={SellIn}></Stack.Screen>
      <Stack.Screen
        key="m12"
        name="HeaderNavigation"
        component={HeaderNavigation}
      ></Stack.Screen>
      <Stack.Screen
        key="m14"
        name="NotifyDetail"
        options={{ headerLeft: null }}
        component={NotifyDetail}
      ></Stack.Screen>
      <Stack.Screen
        key="m15"
        name="ShopList"
        options={{ headerLeft: null }}
        component={ScreenShops}
      ></Stack.Screen>
      <Stack.Screen
        key="m16"
        name="ShopPage"
        options={{ headerLeft: null }}
        component={ShopPage}
      ></Stack.Screen>
      {/* <Stack.Screen key='m17' name='trainee' options={{ headerLeft: null }} component={WebViewScreen}></Stack.Screen> */}
      <Stack.Screen
        key="m139"
        name="WebView"
        options={{ headerLeft: null }}
        component={PageWebView}
      ></Stack.Screen>
      {/* <Stack.Screen key='m18' name='Camera' options={{ headerLeft: null }} component={TakePicture}></Stack.Screen> */}
      <Stack.Screen
        key="m19"
        name="Review"
        options={{ headerLeft: null }}
        component={ImageReview}
      ></Stack.Screen>
      <Stack.Screen
        key="m21"
        name="promotion"
        options={{ headerLeft: null }}
        component={Promotion}
      ></Stack.Screen>
      <Stack.Screen
        key="m22"
        name="surveyCTSS"
        options={{ headerLeft: null }}
        component={SurveyCTSS}
      ></Stack.Screen>
      <Stack.Screen
        key="m23"
        name="market"
        options={{ headerLeft: null }}
        component={Market}
      ></Stack.Screen>
      <Stack.Screen
        key="m24"
        name="trackingCompetitorReport"
        options={{ headerLeft: null }}
        component={TrackingCompetitorReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m25"
        name="competitorReport"
        options={{ headerLeft: null }}
        component={CompetitorReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m26"
        name="displayHPReport"
        options={{ headerLeft: null }}
        component={DisplayHPIReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m26"
        name="posmHPReport"
        options={{ headerLeft: null }}
        component={POSMHPIReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m27"
        name="displayProgram"
        options={{ headerLeft: null }}
        component={DisplayProgram}
      ></Stack.Screen>
      <Stack.Screen
        key="m28"
        name="AuditDisplayItems"
        options={{ headerLeft: null }}
        component={AuditDisplayItems}
      ></Stack.Screen>
      <Stack.Screen
        key="m29"
        name="AuditDisplaysHMD"
        options={{ headerLeft: null }}
        component={AuditDisplaysHMD}
      ></Stack.Screen>
      <Stack.Screen
        key="m30"
        name="AlbumPhoto"
        options={{ headerLeft: null }}
        component={AlbumPhoto}
      ></Stack.Screen>
      <Stack.Screen
        key="m32"
        name="oos"
        options={{ headerLeft: null }}
        component={OOSDefault}
      ></Stack.Screen>
      <Stack.Screen
        key="m35"
        name="Settings"
        component={Settings}
      ></Stack.Screen>
      <Stack.Screen
        key="m36"
        name="sellout"
        options={{ headerLeft: null }}
        component={Sellout}
      ></Stack.Screen>
      <Stack.Screen
        key="m37"
        name="VeryfySellout"
        options={{ headerLeft: null }}
        component={VerifyDataSellout}
      ></Stack.Screen>
      <Stack.Screen
        key="m38"
        name="ChartDetail"
        options={{ headerLeft: null }}
        component={ChartDetail}
      ></Stack.Screen>
      <Stack.Screen
        key="m39"
        name="marketprice"
        options={{ headerLeft: null }}
        component={MarketPriceReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m40"
        name="fieldcoaching"
        options={{ headerLeft: null }}
        component={FieldCoaching}
      ></Stack.Screen>
      <Stack.Screen
        key="m41"
        name="trainingresult"
        options={{ headerLeft: null }}
        component={TrainingList}
      ></Stack.Screen>
      <Stack.Screen
        key="m41"
        name="trainingaction"
        options={{ headerLeft: null }}
        component={TrainingResults}
      ></Stack.Screen>
      <Stack.Screen
        key="m94"
        name="displaybytarget"
        options={{ headerLeft: null }}
        component={DisplayByTarget}
      ></Stack.Screen>
      <Stack.Screen
        key="m96"
        name="pricecomperitor"
        options={{ headerLeft: null }}
        component={PriceCompetitor}
      ></Stack.Screen>
      <Stack.Screen
        key="m98"
        name="displaycompetitor"
        options={{ headerLeft: null }}
        component={DisplayCompetitorReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m101"
        name="displaycompetitormd"
        options={{ headerLeft: null }}
        component={DisplayCompetitorReport_MD}
      ></Stack.Screen>
      <Stack.Screen
        key="m103"
        name="posmguid"
        options={{ headerLeft: null }}
        component={PosmWhirlPool}
      ></Stack.Screen>
      <Stack.Screen
        key="m105"
        name="selloutinput"
        options={{ headerLeft: null }}
        component={SellOutInput}
      ></Stack.Screen>
      <Stack.Screen
        key="m106"
        name="accessoriesreport"
        options={{ headerLeft: null }}
        component={AccessoriesReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m101"
        name="displaytrackingcompetitor"
        options={{ headerLeft: null }}
        component={DisplayMain}
      ></Stack.Screen>
      <Stack.Screen
        key="m110"
        name="promotionprice"
        options={{ headerLeft: null }}
        component={PromotionPriceReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m116"
        name="displayandstock"
        options={{ headerLeft: null }}
        component={DisplayAndStock}
      ></Stack.Screen>
      <Stack.Screen
        key="m117"
        name="displayandstockcasper"
        options={{ headerLeft: null }}
        component={DisplayAndStockCasper}
      ></Stack.Screen>
      <Stack.Screen
        key="m118"
        name="displaysituation"
        options={{ headerLeft: null }}
        component={DisplaySituation}
      ></Stack.Screen>
      <Stack.Screen
        key="m119"
        name="displaysurvey"
        options={{ headerLeft: null }}
        component={DisplaySurveyReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m120"
        name="competitorreportcuckoo"
        options={{ headerLeft: null }}
        component={CompetitorReportCuckoo}
      ></Stack.Screen>
      <Stack.Screen
        key="m284"
        name="displaycompetitorreportV2"
        options={{ headerLeft: null }}
        component={DisplayCompetitorReportV2}
      ></Stack.Screen>
      <Stack.Screen
        key="m121"
        name="displaybymodel"
        options={{ headerLeft: null }}
        component={DisplayByModel}
      ></Stack.Screen>
      <Stack.Screen
        key="m122"
        name="reportchecksell"
        options={{ headerLeft: null }}
        component={ReportCheckSell}
      ></Stack.Screen>

      <Stack.Screen
        key="m123"
        name="uploadshopinfo"
        options={{ headerLeft: null }}
        component={UploadShopInfo}
      ></Stack.Screen>
      <Stack.Screen
        key="m124"
        name="displaypricereportpns"
        options={{ headerLeft: null }}
        component={DisplayPricePNS}
      ></Stack.Screen>
      <Stack.Screen
        key="m125"
        name="confirmsellin"
        options={{ headerLeft: null }}
        component={ConfirmSellIn}
      ></Stack.Screen>
      <Stack.Screen
        key="m126"
        name="capacityreport"
        options={{ headerLeft: null }}
        component={CapacityReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m127"
        name="instoresharedaikin"
        options={{ headerLeft: null }}
        component={InstoreShareDaikin}
      ></Stack.Screen>
      <Stack.Screen
        key="m128"
        name="dashboardhomesellin"
        options={{ headerLeft: null }}
        component={DashboardHomeSellin}
      ></Stack.Screen>
      <Stack.Screen
        key="m129"
        name="Product"
        options={{ headerLeft: null }}
        component={ProductList}
      ></Stack.Screen>
      <Stack.Screen
        key="m130"
        name="employeeresigns"
        options={{ headerLeft: null }}
        component={EmployeeResigns}
      ></Stack.Screen>
      <Stack.Screen
        key="m131"
        name="confirmsresigns"
        options={{ headerLeft: null }}
        component={ConfirmsResigns}
      ></Stack.Screen>
      <Stack.Screen
        key="m132"
        name="deploypop"
        options={{ headerLeft: null }}
        component={DeployPOP}
      ></Stack.Screen>
      <Stack.Screen
        key="m134"
        name="itemproductssellin"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={ItemProductsSellin}
      ></Stack.Screen>
      <Stack.Screen
        key="m135"
        name="createsellinbyshop"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={CreateSellInByShop}
      ></Stack.Screen>
      <Stack.Screen
        key="m135"
        name="createsellin"
        options={{ headerLeft: null }}
        component={CreateSellInByShop}
      ></Stack.Screen>
      <Stack.Screen
        key="m137"
        name="surveyresultreport"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={SurveyResultReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m142"
        name="trackingstoredaikin"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={TrackingStoreDaikin}
      ></Stack.Screen>
      <Stack.Screen
        key="m143"
        name="totalinventoryreport"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={TotalInventoryReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m144"
        name="trackingstoredaikinSO"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={TrackingStoreDaikinSO}
      ></Stack.Screen>
      <Stack.Screen
        key="m145"
        name="attendantissue"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={AttendantIssue}
      ></Stack.Screen>
      <Stack.Screen
        key="m146"
        name="confirmattendantissue"
        options={{ headerLeft: null, gestureEnabled: false }}
        component={ConfirmAttendantIssue}
      ></Stack.Screen>

      <Stack.Screen
        key="m130"
        name="employeematernityleave"
        options={{ headerLeft: null }}
        component={EmployeeMaternityLeave}
      ></Stack.Screen>

      {/* WorkingPlan */}
      <Stack.Screen
        key="m42"
        name="WorkingPlanPG"
        component={WorkingPlanPG}
      ></Stack.Screen>
      <Stack.Screen
        key="m43"
        name="WorkingPlanSR"
        component={WorkingPlanSR_V2}
      ></Stack.Screen>
      <Stack.Screen
        key="m44"
        name="WorkingPlan"
        component={WorkingPlan}
      ></Stack.Screen>
      <Stack.Screen
        key="m45"
        name="confirmplansr"
        options={{ headerLeft: null }}
        component={ConfirmPlanSR}
      ></Stack.Screen>
      <Stack.Screen
        key="m46"
        name="confirmplanpg"
        options={{ headerLeft: null }}
        component={ConfirmPlanPG}
      ></Stack.Screen>
      <Stack.Screen
        key="m47"
        name="DisplayBK"
        component={DisplayBK}
      ></Stack.Screen>
      <Stack.Screen
        key="m48"
        name="StockOutART"
        component={StockOutART}
      ></Stack.Screen>
      <Stack.Screen
        key="m49"
        name="StockOutBK"
        component={StockOutBK}
      ></Stack.Screen>
      <Stack.Screen
        key="m102"
        name="monthlyplan"
        options={{ headerLeft: null }}
        component={MonthlyPlan}
      ></Stack.Screen>
      <Stack.Screen
        key="m123"
        name="confirmplanweek"
        options={{ headerLeft: null }}
        component={ConfirmPlanWeekly}
      ></Stack.Screen>
      <Stack.Screen
        key="m228"
        name="mapplan"
        component={MapPlan}
      ></Stack.Screen>
      <Stack.Screen
        key="m258"
        name="statisticaldisplay"
        component={StatisticalDisplay}
      ></Stack.Screen>
      {/* Plan MEVN */}
      <Stack.Screen
        key="m51"
        name="MEVNPlanSR"
        component={PlanSR}
      ></Stack.Screen>
      <Stack.Screen
        key="m69"
        name="MEVNConfirmSR"
        component={ConfirmSR}
      ></Stack.Screen>
      <Stack.Screen
        key="m52"
        name="sellinbyemp"
        component={SellInByEmployee}
      ></Stack.Screen>
      <Stack.Screen
        key="m52-shop"
        name="sellinshop"
        component={SellInShopScreen}
      ></Stack.Screen>
      <Stack.Screen
        key="m52-shop-detail"
        name="sellinshopdetail"
        component={SellInShopDetailScreen}
      ></Stack.Screen>
      <Stack.Screen
        key="m57"
        name="stockbyemp"
        component={InventoryByEmployee}
      ></Stack.Screen>
      {/* POP */}
      <Stack.Screen
        key="m33"
        name="psvPOP"
        options={{ headerLeft: null }}
        component={PSVPOP}
      ></Stack.Screen>
      <Stack.Screen
        key="m34"
        name="TotalPOP"
        options={{ headerLeft: null }}
        component={TotalPOP}
      ></Stack.Screen>
      <Stack.Screen
        key="m53"
        name="followPOP"
        options={{ headerLeft: null }}
        component={FollowPOP}
      ></Stack.Screen>
      <Stack.Screen
        key="m54"
        name="detailOrderPOP"
        options={{ headerLeft: null }}
        component={DetailOrderPOP}
      ></Stack.Screen>
      <Stack.Screen
        key="m55"
        name="damageNote"
        options={{ headerLeft: null }}
        component={DamageNote}
      ></Stack.Screen>
      <Stack.Screen
        key="m56"
        name="popByShop"
        options={{ headerLeft: null }}
        component={POPByShop}
      ></Stack.Screen>
      <Stack.Screen
        key="m58"
        name="trackingDisplayMEVN"
        options={{ headerLeft: null }}
        component={TrackingDisplayMEVN}
      ></Stack.Screen>
      <Stack.Screen
        key="m59"
        name="examByEmployee"
        options={{ headerLeft: null }}
        component={ExamByEmployee}
      ></Stack.Screen>
      <Stack.Screen
        key="m60"
        name="displayCombineBeko"
        options={{ headerLeft: null }}
        component={DisplayCombineBeko}
      ></Stack.Screen>
      <Stack.Screen
        key="m61"
        name="dashboardDetail"
        options={{ headerLeft: null }}
        component={DashboardSellOutDetail}
      ></Stack.Screen>
      <Stack.Screen
        key="m62"
        name="progressReport"
        options={{ headerLeft: null }}
        component={ProgressReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m63"
        name="documentgroup"
        options={{ headerLeft: false }}
        component={DocumentGroup}
      ></Stack.Screen>
      <Stack.Screen
        key="m264"
        name="documentgroupbyshop"
        options={{ headerLeft: false }}
        component={DocumentGroupByShop}
      ></Stack.Screen>

      <Stack.Screen
        key="m301"
        name="video"
        options={{ headerShown: false }}
        component={VideoList}
      ></Stack.Screen>
      <Stack.Screen
        key="m302"
        name="videoplay"
        options={{ headerLeft: false }}
        component={VideoPlay}
      ></Stack.Screen>
      <Stack.Screen
        key="m303"
        name="videobytype"
        options={{ headerLeft: false }}
        component={VideoByType}
      ></Stack.Screen>

      <Stack.Screen
        key="m64"
        name="documentlist"
        options={{ headerLeft: false }}
        component={DocumentList}
      ></Stack.Screen>
      <Stack.Screen
        key="m65"
        name="historyconfirm"
        options={{ headerLeft: false }}
        component={HistoryConfirm}
      ></Stack.Screen>
      <Stack.Screen
        key="m66"
        name="instoreShareBK"
        options={{ headerLeft: null }}
        component={InstoreShareBK}
      ></Stack.Screen>
      <Stack.Screen
        key="m85"
        name="displayReport"
        options={{ headerLeft: null }}
        component={DisplayPriceReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m99"
        name="installposm"
        component={InputPOP}
      ></Stack.Screen>
      {/* Ad-Hoc */}
      <Stack.Screen
        key="m67"
        name="adhoc"
        options={{ headerLeft: null }}
        component={AdhocList}
      ></Stack.Screen>
      <Stack.Screen
        key="m68"
        name="adhocDetail"
        options={{ headerLeft: null }}
        component={AdhocDetail}
      ></Stack.Screen>
      <Stack.Screen
        key="m70"
        name="workingPlanHMDPG"
        options={{ headerLeft: null }}
        component={WorkingPlanHMDPG}
      ></Stack.Screen>
      {/* Photo Tag */}
      <Stack.Screen
        key="m69"
        name="phototag"
        options={{ headerLeft: null }}
        component={PhotoTag}
      ></Stack.Screen>
      <Stack.Screen
        key="m71"
        name="searchshop"
        options={{ headerLeft: null }}
        component={SearchStore}
      ></Stack.Screen>
      <Stack.Screen
        key="m72"
        name="displayCombineLG"
        options={{ headerLeft: null }}
        component={DisplayCombineLG}
      ></Stack.Screen>
      <Stack.Screen
        key="m90"
        name="photogroup"
        options={{ headerLeft: null }}
        component={PhotoItems}
      ></Stack.Screen>
      <Stack.Screen
        key="m104"
        name="photoedit"
        options={{ headerLeft: null }}
        component={PhotoEdit}
      ></Stack.Screen>
      <Stack.Screen
        key="m123"
        name="routingmonth"
        component={RoutingReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m133"
        name="photolist"
        options={{ headerLeft: null }}
        component={PhotoList}
      ></Stack.Screen>
      <Stack.Screen
        key="m260"
        name="photobylist"
        options={{ headerLeft: null }}
        component={PhotoByList}
      ></Stack.Screen>
      <Stack.Screen
        key="m263"
        name="photosystemreport"
        options={{ headerLeft: null }}
        component={PhotoSystemReport}
      ></Stack.Screen>

      {/* WorkingPlan LG */}
      <Stack.Screen
        key="m73"
        name="asmplanLG"
        options={{ headerLeft: null }}
        component={LG_WorkingPlanASM}
      ></Stack.Screen>
      <Stack.Screen
        key="m74"
        name="mdplanLG"
        options={{ headerLeft: null }}
        component={LG_WorkingPlanMD}
      ></Stack.Screen>
      <Stack.Screen
        key="m75"
        name="pcplanLG"
        options={{ headerLeft: null }}
        component={LG_WorkingPlanPC}
      ></Stack.Screen>
      <Stack.Screen
        key="m235"
        name="planbyconfig"
        options={{ headerLeft: null }}
        component={WorkingPlanPG_Permisstion}
      ></Stack.Screen>
      <Stack.Screen
        key="m76"
        name="confirmplanasmLG"
        options={{ headerLeft: null }}
        component={LG_ConfirmPlanASM}
      ></Stack.Screen>
      <Stack.Screen
        key="m77"
        name="confirmplanmdLG"
        options={{ headerLeft: null }}
        component={LG_ConfirmPlanMD}
      ></Stack.Screen>
      <Stack.Screen
        key="m78"
        name="confirmplanpcLG"
        options={{ headerLeft: null }}
        component={LG_ConfirmPlanPC}
      ></Stack.Screen>
      <Stack.Screen
        key="m79"
        name="attendanthistory"
        options={{ headerLeft: null }}
        component={AttendantResult}
      ></Stack.Screen>
      <Stack.Screen
        key="m79"
        name="employeedetails"
        options={{ headerLeft: null }}
        component={ProfileDetail}
      ></Stack.Screen>
      <Stack.Screen
        key="m97"
        name="displaypricelg"
        options={{ headerLeft: null }}
        component={DisplayPriceReportLG}
      ></Stack.Screen>
      <Stack.Screen
        key="m101"
        name="leaderplanLG"
        options={{ headerLeft: null }}
        component={LG_WorkingPlanLeader}
      ></Stack.Screen>
      <Stack.Screen
        key="m107"
        name="timesheetpg"
        options={{ headerLeft: null }}
        component={PGTimeSheet}
      ></Stack.Screen>
      <Stack.Screen
        key="m108"
        name="confirmplanleaderLG"
        component={LG_ConfirmPlanLeader}
      ></Stack.Screen>
      <Stack.Screen
        key="m118"
        name="reporttimesheet"
        component={ReportTimeSheet}
      ></Stack.Screen>
      <Stack.Screen
        key="m119"
        name="maketoverview"
        component={HomeOverview}
      ></Stack.Screen>
      <Stack.Screen
        key="m147"
        name="decor"
        component={DecorForm}
      ></Stack.Screen>

      <Stack.Screen
        key="m255"
        name="homeinstoreshare"
        options={{ headerLeft: null }}
        component={HomeInstoreShare}
      ></Stack.Screen>
      {/* WorkingPlan HMD */}
      <Stack.Screen
        key="m80"
        name="WorkingPlanHMDSR"
        component={WorkingPlanHMDSR}
      ></Stack.Screen>
      <Stack.Screen
        key="m81"
        name="o-payslip"
        component={PayslipPage}
      ></Stack.Screen>
      <Stack.Screen
        key="m224"
        name="o-payslip-detail"
        component={PayslipDetail}
      ></Stack.Screen>
      <Stack.Screen
        key="m223"
        name="workschedule"
        component={HomeBusinessMenu}
      ></Stack.Screen>

      <Stack.Screen
        key="m261"
        name="payment"
        component={PayslipList}
      ></Stack.Screen>
      <Stack.Screen
        key="m262"
        name="paydetail"
        component={PayslipDetails}
      ></Stack.Screen>

      {/* // */}

      <Stack.Screen
        key="m84"
        name="incentive"
        component={KPIIncentive}
      ></Stack.Screen>
      <Stack.Screen
        key="m86"
        name="stockReport"
        component={StockReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m225"
        name="inventoryDaikin"
        component={DaikinInventoryReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m87"
        name="shopmanager"
        component={ShopManager}
      ></Stack.Screen>
      <Stack.Screen
        key="m256"
        name="viewstore"
        component={ViewStore}
      ></Stack.Screen>
      <Stack.Screen
        key="m242"
        name="manageemployees"
        component={HomeManager}
      ></Stack.Screen>
      {/* <Stack.Screen key='m89' name='profileshops' component={ShopPageProfile}></Stack.Screen> */}
      <Stack.Screen
        key="m91"
        name="surveyshelf"
        component={SurveyShelf}
      ></Stack.Screen>
      <Stack.Screen
        key="m225"
        name="inst"
        component={InstoreShareDaikin}
      ></Stack.Screen>
      {/* PSV MANAGER */}
      <Stack.Screen
        key="m92"
        name="psvmanager"
        component={PSVManagerHome}
      ></Stack.Screen>
      <Stack.Screen
        key="m93"
        name="accessoriesManage"
        component={AccessoriesReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m95"
        name="bussinesstrip"
        component={BussinessTrip}
      ></Stack.Screen>
      <Stack.Screen
        key="m100"
        name="managerplan"
        component={ManagerPlan}
      ></Stack.Screen>
      <Stack.Screen
        key="m117"
        name="approach"
        component={ApproachReport}
      ></Stack.Screen>
      {/* Manager POP V2 */}
      <Stack.Screen
        key="m109"
        name="popmenu"
        component={POPMenu}
      ></Stack.Screen>
      <Stack.Screen
        key="m110"
        name="warehouseitem"
        component={POPWarehouse}
      ></Stack.Screen>
      <Stack.Screen
        key="m112"
        name="warningitem"
        component={POPWarningItem}
      ></Stack.Screen>
      <Stack.Screen
        key="m113"
        name="orderpop"
        component={POPOrderItem}
      ></Stack.Screen>
      <Stack.Screen
        key="m114"
        name="orderfollow"
        component={FollowOrderList}
      ></Stack.Screen>
      <Stack.Screen
        key="m115"
        name="orderfollowdetail"
        component={OrderPOPDetail}
      ></Stack.Screen>
      {/* Store New - Confirm */}
      <Stack.Screen
        key="m227"
        name="createstore"
        component={CreateItem}
      ></Stack.Screen>
      <Stack.Screen
        key="m235"
        name="updatestore"
        component={UpdateStore}
      ></Stack.Screen>
      <Stack.Screen
        key="m236"
        name="confirmnewstore"
        component={ConfirmStore}
      ></Stack.Screen>
      {/* Task List */}
      <Stack.Screen
        key="m228"
        name="todolist"
        component={HomeTodoList}
      ></Stack.Screen>
      <Stack.Screen
        key="m229"
        name="alltodolist"
        component={AllTodoList}
      ></Stack.Screen>

      {/* Employee KPI */}
      <Stack.Screen
        key="m230"
        name="scorekpi"
        component={ScoreKPI}
      ></Stack.Screen>
      <Stack.Screen
        key="m231"
        name="employeekpi"
        component={KPIResult}
      ></Stack.Screen>
      <Stack.Screen
        key="m233"
        name="displaydaikin"
        component={DisplayDaikin}
      ></Stack.Screen>
      <Stack.Screen
        key="m234"
        name="auditreport"
        component={AuditItemReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m231"
        name="scorekpiv2"
        component={ScoreKPIV2}
      ></Stack.Screen>

      {/** Summary KPI */}
      <Stack.Screen
        key="m231"
        name="kpisummary"
        component={KPISummary}
      ></Stack.Screen>

      {/* HPI */}
      <Stack.Screen
        key="m237"
        name="sellouthp"
        component={SellOutHPI}
      ></Stack.Screen>
      <Stack.Screen
        key="m238"
        name="sellouthpinput"
        component={SellOutInputHPI}
      ></Stack.Screen>
      <Stack.Screen
        key="m239"
        name="marketcreate"
        component={MarketCreate}
      ></Stack.Screen>
      <Stack.Screen
        key="m240"
        name="confirmorder"
        component={ConfirmMain}
      ></Stack.Screen>
      <Stack.Screen
        key="m241"
        name="verifyselloutbk"
        component={VerifySelloutBK}
      ></Stack.Screen>
      {/** HSS */}
      <Stack.Screen
        key="m243"
        name="displayandstockhss"
        component={DisplayAndStockHSS}
      ></Stack.Screen>
      <Stack.Screen
        key="m244"
        name="fsmbyshopreport"
        component={FSMByShopReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m247"
        name="issuereport"
        component={IssueReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m249"
        name="issuereporthome"
        component={IssueReportHome}
      ></Stack.Screen>
      <Stack.Screen
        key="m245"
        name="confirmschedule"
        component={ConfirmScheduleHome}
      ></Stack.Screen>
      <Stack.Screen
        key="m246"
        name="displaystock"
        options={{ headerLeft: null }}
        component={DisplayStockHome}
      ></Stack.Screen>
      <Stack.Screen
        key="m247"
        name="marketvisit"
        options={{ headerLeft: null }}
        component={MarketVisit}
      ></Stack.Screen>
      <Stack.Screen
        key="m248"
        name="coachingemployee"
        options={{ headerLeft: null }}
        component={FieldCoachingForEmployee}
      ></Stack.Screen>
      <Stack.Screen
        key="m250"
        name="locationtracking"
        options={{ headerLeft: null }}
        component={LocationTracking}
      ></Stack.Screen>
      <Stack.Screen
        key="m253"
        name="dashboardsummaryssub"
        options={{ headerLeft: null }}
        component={DashboardSummarySSub}
      ></Stack.Screen>
      <Stack.Screen
        key="m254"
        name="displaycompetitortf"
        options={{ headerLeft: null }}
        component={DisplayCompetitorTF}
      ></Stack.Screen>
      <Stack.Screen
        key="m259"
        name="pricecompetitordealer"
        options={{ headerLeft: null }}
        component={PriceCompetitorDealer}
      ></Stack.Screen>

      {/* // Office - Spiral One */}
      <Stack.Screen
        key="m251"
        name="officeplan"
        options={{ headerLeft: null }}
        component={PlanOffice}
      ></Stack.Screen>
      <Stack.Screen
        key="m252"
        name="officeconfirmplan"
        options={{ headerLeft: null }}
        component={ConfirmPlanOffice}
      ></Stack.Screen>
      <Stack.Screen
        key="m257"
        name="fieldcoachingfsmreport"
        component={FieldCoachingFSMReport}
      ></Stack.Screen>
      <Stack.Screen
        key="m280"
        name="reportstatusissue"
        component={HomeReportStatusIssue}
      ></Stack.Screen>
      <Stack.Screen
        key="m280"
        name="managerstatusissue"
        component={HomeReportStatusIssueManager}
      ></Stack.Screen>
      <Stack.Screen
        key="m281"
        name="qrcode"
        component={QRCodeScan}
      ></Stack.Screen>

      <Stack.Screen
        key="m282"
        name="display"
        component={DisplayDefault}
      ></Stack.Screen>
      <Stack.Screen
        key="m283"
        name="sharereport"
        component={ShareReportInfo}
      ></Stack.Screen>

      {/* // Detail Dashboard Data */}
      <Stack.Screen
        key="dt1"
        name="sellindetails"
        component={DashboardSellInDetails}
      ></Stack.Screen>
      <Stack.Screen
        key="dt2"
        name="displaydetails"
        component={DashboardDisplayDetails}
      ></Stack.Screen>
      {/* // Detail Dashboard View */}
      <Stack.Screen
        key="dv1"
        name="view_oosdetails"
        component={ScreenGroup}
      ></Stack.Screen>
      <Stack.Screen
        key="dv2"
        name="dashboardtarget"
        component={DashboardTarget}
      ></Stack.Screen>

      <Stack.Screen
        key="m281"
        name="warehouseupdate"
        component={WarehouseMain}
      ></Stack.Screen>
      <Stack.Screen
        key="m285"
        name="summaryooslist"
        component={SummaryList}
      ></Stack.Screen>
      <Stack.Screen
        key="m287"
        name="summaryoosgroup"
        component={SummaryGroup}
      ></Stack.Screen>

      <Stack.Screen
        key="m286"
        name="supportinfo"
        component={SupportInfo}
      ></Stack.Screen>
      <Stack.Screen
        key="m291"
        name="reportzalo"
        component={ReportZalo}
      ></Stack.Screen>
      <Stack.Screen
        key="m299"
        name="shopreportzalo"
        component={ShopReportZalo}
      ></Stack.Screen>

      {/* PGReportHome */}
      <Stack.Screen
        key="m300"
        name="pgreporthome"
        component={PGReportHome}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};
const Drawer = createDrawerNavigator();
class HomeNavigation extends PureComponent {
  constructor(props) {
    super(props);
  }
  logoutAction = async () => {
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      alertWarning(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    Logout(this.props.GAppController);
  };
  render() {
    return (
      <NavigationContainer>
        <Drawer.Navigator
          drawerStyle={{ width: deviceWidth - deviceWidth / 3.5 }}
          drawerContent={props => (
            <DrawerMenu
              navigation={props.navigation}
              isCheckVersion={this.props.isCheckVersion}
              logoutAction={() => this.logoutAction()}
            />
          )}
        >
          <Drawer.Screen name="Home" component={HomeStack}></Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }
}
function mapStateToProps(state) {
  return {
    userInfo: state.GAppState.userinfo,
    appcolor: state.GAppState.appcolor,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeNavigation);
