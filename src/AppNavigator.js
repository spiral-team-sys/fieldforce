import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

// Core screens
import CameraReportScreen from './Component/Camera/CameraReportScreen';
import CameraScreen from './Component/Camera/CameraScreen';
import HomePageMain from './Component/Home/HomePageMain';
import ForgotPasswordScreen from './Component/Login/ForgotPasswordScreen';
import LoginScreen from './Component/Login/LoginScreen';
import ManageNotify from './Component/ManageNotify';
import POPFollowScreen from './Component/Managers/POP/POPFollowScreen';
import POPItemScreen from './Component/Managers/POP/POPItemScreen';
import POPMenuProcessScreen from './Component/Managers/POP/POPMenuProcessScreen';
import POPMenuScreen from './Component/Managers/POP/POPMenuScreen';
import POPOrderScreen from './Component/Managers/POP/POPOrderScreen';
import POPProcessScreen from './Component/Managers/POP/POPProcessScreen';
import POPPromotionScreen from './Component/Managers/POP/POPPromotionScreen';
import NotificationDetailScreen from './Component/Notification/NotificationDetailScreen';
import NotificationScreen from './Component/Notification/NotificationScreen';
import NotifyDetail from './Component/NotifyDetail';
import ConfirmPlanPG from './Component/PlanWorking/ConfirmPlanPG';
import POPInstallMenuScreen from './Component/Reports/Install/POP/POPInstallMenuScreen';
import POPInstallScreen from './Component/Reports/Install/POP/POPInstallScreen';
import WorkScreen from './Component/Shops/Work/WorkScreen';
import WelcomeScreen from './Component/Welcome/WelcomeScreen';

// Menu screens
import { HomeBusinessMenu } from './Component/BusinessTrips/Home';
import { KPIIncentive } from './Component/Dashboard/Beko/KPIIncentive';
import ManagerPlan from './Component/Dashboard/ManagerPlan';
import ProgressReport from './Component/Dashboard/ProgressReport/ProgressReport';
import { RoutingReport } from './Component/Dashboard/RoutingReport';
import { DocumentGroup } from './Component/Document/DocumentGroup';
import { DocumentList } from './Component/Document/DocumentList';
import EditProfileEmployee from './Component/Employee/EditProfileEmployee';
import { EmployeeManager } from './Component/Employee/EmployeeManager';
import { EmployeeInfo } from './Component/Employee/Infomation';
import { QRCodeScan } from './Component/Employee/Infomation/Control/QRCodeScan';
import { SupportInfo } from './Component/Employee/Infomation/Control/SupportInfo';
import { HomeManager } from './Component/Employee/Manager/HomeManager';
import { ProfileDetail } from './Component/Employee/ProfileDetail';
import { EmployeeResigns } from './Component/LG/EmployeeResigns';
import { StatisticalDisplay } from './Component/LG/StatisticalDisplay';
import { ConfirmPlanOffice } from './Component/OFFICE SPIRAL/WorkingPlan/ConfirmPlanOffice';
import { PlanOffice } from './Component/OFFICE SPIRAL/WorkingPlan/PlanOffice';
import CheckInScreen from './Component/OFFICE SPIRAL/YEP/CheckInScreen';
import PayslipPage from './Component/PaySlip';
import PayslipDetails from './Component/Payslip/PayslipDetails';
import { PayslipList } from './Component/Payslip/PayslipList';
import PayslipDetail from './Component/PayslipDetail';
import HistoryConfirm from './Component/PlanWorking/History/Confirm/HistoryConfirm';
import LG_ConfirmPlanPC from './Component/PlanWorking/LG/LG_ConfirmPlanPC';
import LG_WorkingPlanASM from './Component/PlanWorking/LG/LG_WorkingPlanASM';
import LG_WorkingPlanPC from './Component/PlanWorking/LG/LG_WorkingPlanPC';
import { MonthlyPlan } from './Component/PlanWorking/MonthlyPlan';
import WorkingPlanPG_Permisstion from './Component/PlanWorking/WorkingPlanPG_Permisstion';
import WorkingPlanSR_V2 from './Component/PlanWorking/WorkingPlanSR_V2';
import { FollowOrderList } from './Component/POPReport/PSV/POPFollowList/FollowOrderList';
import { POPMenu } from './Component/POPReport/PSV/POPMenu';
import { POPOrderItem } from './Component/POPReport/PSV/POPOrderItem';
import { POPWarehouse } from './Component/POPReport/PSV/POPWarehouse';
import { POPWarningItem } from './Component/POPReport/PSV/POPWarningItem';
import SellInByEmployee from './Component/ReportSellIn/SellInByEmployee';
import SellInShopScreen from './Component/ReportSellIn/SellInShopScreen';
import SellInShopDetailScreen from './Component/ReportSellIn/SellInShopDetailScreen';
import { Settings } from './Component/Settings';
import ShopManageScreen from './Component/Shops/Manager/ShopManageScreen';
import CreateItem from './Component/Shops/NewStore/CreateItem';
import StoreRequestFormScreen from './Component/Shops/NewStore/NewStoreConfirm/StoreRequestFormScreen';
import StoreRequestListScreen from './Component/Shops/NewStore/NewStoreConfirm/StoreRequestListScreen';
import ShopProfileScreen from './Component/Shops/ShopProfileScreen';
import { AttendantIssue } from './Component/TimeSheet/AttendantIssue';
import { ConfirmAttendantIssue } from './Component/TimeSheet/ConfirmAttendantIssue';
import { PGTimeSheet } from './Component/TimeSheet/PGTimeSheet';
import { ReportTimeSheet } from './Component/TimeSheet/ReportTimeSheet';
import PrepareExam from './Component/TrainingOnline/TrainingApp/Screens/PrepareExam';
import ResultExam from './Component/TrainingOnline/TrainingApp/Screens/ResultExam';
import TrainingApp from './Component/TrainingOnline/TrainingApp/Screens/TrainingApp';
import TrainingExam from './Component/TrainingOnline/TrainingApp/Screens/TrainingExam';
import HomeVisitScreen from './Component/SurveyReport/HomeVisit/Create/HomeVisitScreen';
import EvaluationPermisionScreen from './Component/Reports/Evaluation/EvaluationPermisionScreen';
import EvaluationScoreScreen from './Component/Reports/Evaluation/EvaluationScoreScreen';
import EvaluationResultScreen from './Component/Reports/Evaluation/EvaluationResultScreen';

// KPI screens
import { AdhocDetail } from './Component/Adhoc/AdhocDetail';
import AdhocList from './Component/Adhoc/AdhocList';
import ExamByEmployee from './Component/Beko/ExamByEmployee';
import { DashboardDisplayDetails } from './Component/Dashboard/DashboardDetails/Display';
import { DisplayCombineLG } from './Component/LG/DisplayCombineLG';
import HomeKaizen from './Component/Kaizen/HomeKaizen';
import PhotoManageScreen from './Component/Managers/Photos/PhotoManageScreen';
import { PhotoItems } from './Component/EPSON/PhotoItems';
import { DisplayAndStock } from './Component/ReportDisplay/Cuckoo/DisplayAndStock';
import { PGReportHome } from './Component/ReportPG';
import CreateSellInByShop from './Component/ReportSellIn/CreateSellInByShop';
import ItemProductsSellIn from './Component/ReportSellIn/ItemProductsSellIn';
import Sellout from './Component/ReportSellOut/Sellout';
import DisplayScreen from './Component/Reports/Display/DisplayScreen';
import DisplayUpdateScreen from './Component/Reports/Display/Update/DisplayUpdateScreen';
import InventoryReportScreen from './Component/Reports/Inventory/InventoryReportScreen';
import OOSScreen from './Component/Reports/OOS/OOSScreen';
import ApprovalStatusScreen from './Component/Reports/Programs/ApprovalStatus/ApprovalStatusScreen';
import SummaryProgramDetailScreen from './Component/Reports/Programs/Dashboard/SummaryProgramDetailScreen';
import SummaryProgramScreen from './Component/Reports/Programs/Dashboard/SummaryProgramScreen';
import EvaluateDetailScreen from './Component/Reports/Programs/Evaluate/EvaluateDetailScreen';
import EvaluateScreen from './Component/Reports/Programs/Evaluate/EvaluateScreen';
import UploadBillScreen from './Component/Reports/Programs/Invoice/UploadBillScreen';
import UploadDeliverySlipScreen from './Component/Reports/Programs/Invoice/UploadDeliverySlipScreen';
import VerifyResultScreen from './Component/Reports/Programs/Manage/VerifyResultScreen';
import ProgramResultScreen from './Component/Reports/Programs/ProgramResult/ProgramResultScreen';
import ProgramScreen from './Component/Reports/Programs/Register/ProgramScreen';
import RegisterProgramScreen from './Component/Reports/Programs/Register/RegisterProgramScreen';
import SellOutCreateScreen from './Component/Reports/SellOut/SellOutCreateScreen';
import WarehouseScreen from './Component/Reports/Warehouse/WarehouseScreen';
import { ScoreKPIV2 } from './Component/EmployeeKPI/KPIV2/ScoreKPIV2';
import UpdateStore from './Component/Shops/NewStore/UpdateStore';
import { ScreenShops } from './Component/Shops/Page/ScreenShops';
import ShopPage from './Component/Shops/ShopPage';
import HomeSaleExplain from './Component/SaleExplain/HomeSaleExplain';
import EmployeeListScreen from './Component/SaleExplain/Page/EmployeeListScreen';
import SummaryHomeVisitScreen from './Component/SurveyReport/HomeVisit/Create/SummaryHomeVisitScreen';
import SurveyListScreen from './Component/SurveyReport/HomeVisit/Survey/SurveyListScreen';
import SurveyHomeVisitScreen from './Component/SurveyReport/HomeVisit/Survey/SurveyHomeVisitScreen';
import ShareReportScreen from './Component/SurveyReport/ShareReport/ShareReportScreen';
import ContentDetailScreen from './Component/SurveyReport/ShareReport/ContentDetailScreen';
import FieldCoaching from './Component/FieldCoaching';

// Dashboard screens
import { DashboardHomeSellin } from './Component/Dashboard/DashboardHomeSellin';
import { DashboardSellOutDetail } from './Component/Dashboard/DashboardSellOutDetail';
import HorizontalPage from './Component/Dashboard/Display/Control/HorizontalPage';
import AttendantHistoryScreen from './Component/PlanWorking/History/Attendance/AttendantHistoryScreen';

// WorkingPlan screens
import RegisterByDateScreen from './Component/WorkingPlan/Register/ByDate/RegisterByDateScreen';
import OTRegisterScreen from './Component/WorkingPlan/OT/OTRegisterScreen';

// Shared across screen groups
import { DashboardSellInDetails } from './Component/Dashboard/DashboardDetails/SellIn';
import { ScreenGroup } from './Component/Dashboard/OOS/DashboardListOOS/Views/ScreenGroup';
import { SummaryGroup } from './Component/Dashboard/OOS/SumaryList/SummaryGroup';
import { SummaryList } from './Component/Dashboard/OOS/SumaryList/SummaryList';
import DrawerMenu from './Control/DrawerMenu/DrawerMenu';
import { SearchStore } from './Control/SearchStore';
import WebViewScreen from './Control/Webview/WebViewScreen';
import ConfirmPlanSR from './Component/PlanWorking/ConfirmPlanSR';
import SalesPromoterScreen from './Component/Reports/VisitStore/SalesPromoterScreen';
import EvaluationDashboardScreen from './Component/Reports/Evaluation/EvaluationDashboardScreen';
import { FieldCoachingFSMReport } from './Component/FieldCoachingFSM/FieldCoachingFSMReport';
import TrainingResults from './Component/TrainingOnline/TrainingResults';
import TrainingList from './Component/TrainingOnline/TrainingList';
import { HomeOTManager } from './Component/PlanWorking/OverTimeManager/HomeOTManager';
import { EmployeeMaternityLeave } from './Component/Employee/Infomation/Page/EmployeeMaternityLeave';
import { PhotoSystemReport } from './Component/Photo/PhotoSystemReport';
import { ReportZalo } from './Component/PSV/ReportZalo';
import { ShopReportZalo } from './Component/PSV/ShopReportZalo';
import { AllTodoList } from './Component/TodoList/AllTodoList';
import SellIn from './Component/ReportSellIn/SellIn';
import { ConfirmSellIn } from './Component/ReportSellIn/ConfirmSellIn';
import { DisplayPricePNS } from './Component/ReportDisplay/PNS/DisplayPricePNS';
import { PromotionPriceReport } from './Component/ReportPrice/PromotionPriceReport';
import Promotion from './Component/Promotion';
import { DisplayMain } from './Component/ReportDisplay/DisplayTrackingCompetitor/DisplayMain';
import { DisplaySurveyReport } from './Component/ReportDisplay/PNS/DisplaySurveyReport';
import { ReportCheckSell } from './Component/PSV/ReportCheckSell';
import RequestUpdateScreen from './Component/Reports/Display/Update/Request/RequestUpdateScreen';
import ConfirmUpdateScreen from './Component/Reports/Display/Update/Confirm/ConfirmUpdateScreen';
import ShopPermissionScreen from './Component/Shops/Permission/ShopPermissionScreen';
import { DashboardSummarySSub } from './Component/Dashboard/DashboardSummarySSub';
import ProductManagerScreen from './Component/Managers/Products/ProductManagerScreen';
import { ScoreKPI } from './Component/EmployeeKPI/ScoreKPI';
import { DisplayPriceReport } from './Component/ReportDisplay/DisplayPriceReport';
import { SurveyResultReport } from './Component/SurveyReport/PNS/SurveyResultReport';
import { PhotoList } from './Component/Photo/PhotoList';
import DisplayCompetitorReport from './Component/ReportDisplay/DisplayCompetitorReport';
import { MarketVisit } from './Component/TrainingOnline/CoachingByShop/MarketVisit';
import { FieldCoachingForEmployee } from './Component/TrainingOnline/CoachingByShop/FieldCoachingForEmployee';
import { KPIResult } from './Component/EmployeeKPI/KPIResult';
import { WeekLyPlan } from './Component/PlanWorking/WeeklyPlan';
import { ConfirmPlanWeekly } from './Component/PlanWorking/ConfirmPlanWeekly';
import { ConfirmsResigns } from './Component/LG/ConfirmsResigns';
import { PhotoByList } from './Component/Photo/PhotoByList';
import { DisplaySituation } from './Component/ReportDisplay/PNS/DisplaySituation';
import { DeployPOP } from './Component/PSV/DeployPOP';
import { VerifySelloutBK } from './Component/ReportVerifyData/VerifySelloutBK';
import { insets } from './Core/Utility';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  const coreScreens = [
    { name: 'Welcome', component: WelcomeScreen },
    { name: 'Login', component: LoginScreen },
    { name: 'ForgotPassword', component: ForgotPasswordScreen },
    { name: 'Home', component: HomePageMain },
    { name: 'Notification', component: NotificationScreen },
    { name: 'NotificationDetail', component: NotificationDetailScreen },
    { name: 'Camera', component: CameraScreen },
    { name: 'CameraReport', component: CameraReportScreen },
    { name: 'Work', component: WorkScreen },
    { name: 'ManageNotify', component: ManageNotify },
    { name: 'NotifyDetail', component: NotifyDetail },
  ];
  const menuScreens = [
    { name: 'shopPermission', component: ShopPermissionScreen },
    { name: 'confirmplanpg', component: ConfirmPlanPG },
    { name: 'popmanage', component: POPMenuScreen },
    { name: 'popwarehouse', component: POPItemScreen },
    { name: 'poporder', component: POPOrderScreen },
    { name: 'poporderfollow', component: POPFollowScreen },
    { name: 'popprocess', component: POPProcessScreen },
    { name: 'popmenuprocess', component: POPMenuProcessScreen },
    { name: 'poppromotion', component: POPPromotionScreen },
    { name: 'popinstall', component: POPInstallMenuScreen },
    { name: 'popinstalldetail', component: POPInstallScreen },
    { name: 'Profile', component: EmployeeInfo },
    { name: 'Product', component: ProductManagerScreen },
    { name: 'payment', component: PayslipList },
    { name: 'paydetail', component: PayslipDetails },
    { name: 'o-payslip', component: PayslipPage },
    { name: 'o-payslip-detail', component: PayslipDetail },
    { name: 'incentive', component: KPIIncentive },
    { name: 'Settings', component: Settings },
    { name: 'supportinfo', component: SupportInfo },
    { name: 'qrcode', component: QRCodeScan },
    { name: 'employeeresigns', component: EmployeeResigns },
    { name: 'confirmsresigns', component: ConfirmsResigns },
    { name: 'employeemanager', component: EmployeeManager },
    { name: 'statisticaldisplay', component: StatisticalDisplay },
    { name: 'asmplanLG', component: LG_WorkingPlanASM },
    { name: 'shopmanager', component: ShopManageScreen },
    { name: 'profileshops', component: ShopProfileScreen },
    { name: 'employeedetails', component: ProfileDetail },
    { name: 'summaryoosgroup', component: SummaryGroup },
    { name: 'summaryooslist', component: SummaryList },
    { name: 'confirmplanpcLG', component: LG_ConfirmPlanPC },
    { name: 'historyconfirm', component: HistoryConfirm },
    { name: 'workschedule', component: HomeBusinessMenu },
    { name: 'popmenu', component: POPMenu },
    { name: 'warehouseitem', component: POPWarehouse },
    { name: 'warningitem', component: POPWarningItem },
    { name: 'orderpop', component: POPOrderItem },
    { name: 'orderfollow', component: FollowOrderList },
    { name: 'WorkingPlanSR', component: WorkingPlanSR_V2 },
    { name: 'attendantissue', component: AttendantIssue },
    { name: 'confirmattendantissue', component: ConfirmAttendantIssue },
    { name: 'managerplan', component: ManagerPlan },
    { name: 'editprofileemployee', component: EditProfileEmployee },
    { name: 'trainee', component: WebViewScreen },
    { name: 'traineeApp', component: TrainingApp },
    { name: 'trainingExam', component: TrainingExam },
    { name: 'prepareExam', component: PrepareExam },
    { name: 'resultExam', component: ResultExam },
    { name: 'planbyconfig', component: WorkingPlanPG_Permisstion },
    { name: 'documentgroup', component: DocumentGroup },
    { name: 'timesheetpg', component: PGTimeSheet },
    { name: 'documentlist', component: DocumentList },
    { name: 'pcplanLG', component: LG_WorkingPlanPC },
    { name: 'reporttimesheet', component: ReportTimeSheet },
    { name: 'progressReport', component: ProgressReport },
    { name: 'officeplan', component: PlanOffice },
    { name: 'officeconfirmplan', component: ConfirmPlanOffice },
    { name: 'manageemployees', component: HomeManager },
    { name: 'yep-checkin', component: CheckInScreen },
    { name: 'monthlyplan', component: MonthlyPlan },
    { name: 'sellinbyemp', component: SellInByEmployee },
    { name: 'sellinscreen', component: SellInShopScreen },
    { name: 'sellinshopdetail', component: SellInShopDetailScreen },
    { name: 'createstore', component: CreateItem },
    { name: 'storerequestlist', component: StoreRequestListScreen },
    { name: 'storerequestform', component: StoreRequestFormScreen },
    { name: 'routingmonth', component: RoutingReport },
    { name: 'sellindetails', component: DashboardSellInDetails },
    { name: 'AlbumPhoto', component: PhotoManageScreen },
    { name: 'employeematernityleave', component: EmployeeMaternityLeave },
    { name: 'photosystemreport', component: PhotoSystemReport },
    { name: 'reportzalo', component: ReportZalo },
    { name: 'shopreportzalo', component: ShopReportZalo },
    { name: 'alltodolist', component: AllTodoList },
    { name: 'photolist', component: PhotoList },
    { name: 'employeekpi', component: KPIResult },
    { name: 'calendarweek', component: WeekLyPlan },
    { name: 'confirmplanweek', component: ConfirmPlanWeekly },
    { name: 'verifyselloutbk', component: VerifySelloutBK },
  ];
  const kpiScreens = [
    { name: 'sellout', component: Sellout },
    { name: 'selloutcreate', component: SellOutCreateScreen },
    { name: 'ShopList', component: ScreenShops },
    { name: 'display', component: DisplayScreen },
    { name: 'displayReport', component: DisplayPriceReport },
    { name: 'displaytrackingcompetitor', component: DisplayMain },
    { name: 'displaysurvey', component: DisplaySurveyReport },
    { name: 'displayupdate', component: DisplayUpdateScreen },
    { name: 'requestupdatedisplay', component: RequestUpdateScreen },
    { name: 'confirmupdatedisplay', component: ConfirmUpdateScreen },
    { name: 'oos', component: OOSScreen },
    { name: 'adhoc', component: AdhocList },
    { name: 'warehouseupdate', component: WarehouseScreen },
    { name: 'displayCombineLG', component: DisplayCombineLG },
    { name: 'displaydetails', component: DashboardDisplayDetails },
    { name: 'view_oosdetails', component: ScreenGroup },
    { name: 'ShopPage', component: ShopPage },
    { name: 'scorekpiv2', component: ScoreKPIV2 },
    { name: 'scorekpi', component: ScoreKPI },
    { name: 'pgreporthome', component: PGReportHome },
    { name: 'photogroup', component: PhotoItems },
    { name: 'searchshop', component: SearchStore },
    { name: 'updatestore', component: UpdateStore },
    { name: 'examByEmployee', component: ExamByEmployee },
    { name: 'displayandstock', component: DisplayAndStock },
    { name: 'createsellinbyshop', component: CreateSellInByShop },
    { name: 'itemproductssellin', component: ItemProductsSellIn },
    { name: 'adhocDetail', component: AdhocDetail },
    { name: 'programlist', component: ProgramScreen },
    { name: 'registerprogram', component: RegisterProgramScreen },
    { name: 'approvalstatus', component: ApprovalStatusScreen },
    { name: 'uploadbill', component: UploadBillScreen },
    { name: 'evaluate', component: EvaluateScreen },
    { name: 'evaluatedetail', component: EvaluateDetailScreen },
    { name: 'verifyresult', component: VerifyResultScreen },
    { name: 'uploaddeliveryslip', component: UploadDeliverySlipScreen },
    { name: 'programresult', component: ProgramResultScreen },
    { name: 'summaryprogram', component: SummaryProgramScreen },
    { name: 'summaryprogramdetail', component: SummaryProgramDetailScreen },
    { name: 'kaizen', component: HomeKaizen },
    { name: 'stockReport', component: InventoryReportScreen },
    // { name: 'promotion', component: PromotionScreen },
    { name: 'promotion', component: Promotion },
    { name: 'homesaleexplain', component: HomeSaleExplain },
    { name: 'employeelistscreen', component: EmployeeListScreen },
    { name: 'homevisit', component: HomeVisitScreen },
    { name: 'summaryhomevisit', component: SummaryHomeVisitScreen },
    { name: 'listhomevisit', component: SurveyListScreen },
    { name: 'surveyhomevisit', component: SurveyHomeVisitScreen },
    { name: 'sharereport', component: ShareReportScreen },
    { name: 'salespromoter', component: SalesPromoterScreen },
    { name: 'contentdetail', component: ContentDetailScreen },
    { name: 'evaluation', component: EvaluationPermisionScreen },
    { name: 'evaluationscore', component: EvaluationScoreScreen },
    { name: 'evaluationresult', component: EvaluationResultScreen },
    { name: 'evaluationdashboard', component: EvaluationDashboardScreen },
    { name: 'SellIn', component: SellIn },
    { name: 'confirmsellin', component: ConfirmSellIn },
    { name: 'displaypricereportpns', component: DisplayPricePNS },
    { name: 'promotionprice', component: PromotionPriceReport },
    { name: 'reportchecksell', component: ReportCheckSell },
    { name: 'surveyresultreport', component: SurveyResultReport },
    { name: 'displaycompetitor', component: DisplayCompetitorReport },
    { name: 'marketvisit', component: MarketVisit },
    { name: 'coachingemployee', component: FieldCoachingForEmployee },
    { name: 'photobylist', component: PhotoByList },
    { name: 'displaysituation', component: DisplaySituation },
    { name: 'deploypop', component: DeployPOP },
  ];
  const dashboardScreens = [
    { name: 'dashboardDetail', component: DashboardSellOutDetail },
    { name: 'dashboardhomesellin', component: DashboardHomeSellin },
    { name: 'attendanthistory', component: AttendantHistoryScreen },
    { name: 'horizontalPage', component: HorizontalPage },
    { name: 'dashboardsummaryssub', component: DashboardSummarySSub },
  ];
  const workingPlanScreens = [
    { name: 'mdplanLG', component: RegisterByDateScreen },
    { name: 'registerOT', component: OTRegisterScreen },
    { name: 'managerOT', component: HomeOTManager },
    { name: 'confirmplansr', component: ConfirmPlanSR },
  ];
  const fieldCoaching = [
    { name: 'fieldcoaching', component: FieldCoaching },
    { name: 'fieldcoachingfsmreport', component: FieldCoachingFSMReport },
    { name: 'trainingresult', component: TrainingList },
    { name: 'trainingaction', component: TrainingResults },
  ];

  const ScreenStack = ({}) => {
    const renderScreenGroup = screens =>
      screens.map(({ name, component }) => (
        <Stack.Screen key={name} name={name} component={component} />
      ));
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {renderScreenGroup(coreScreens)}
        {renderScreenGroup(menuScreens)}
        {renderScreenGroup(kpiScreens)}
        {renderScreenGroup(dashboardScreens)}
        {renderScreenGroup(workingPlanScreens)}
        {renderScreenGroup(fieldCoaching)}
      </Stack.Navigator>
    );
  };
  //
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeMain"
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          swipeEnabled: false,
        }}
        drawerContent={props => <DrawerMenu navigation={props.navigation} />}
      >
        <Drawer.Screen name="HomeMain" component={ScreenStack} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
