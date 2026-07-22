// Config app here
export const AppNameBuild = 'lg';
// Declare App Work
export const aquaApp = 'affm';
export const epsonApp = 'eps';
export const hpiApp = 'hpi';
export const hafeleApp = 'hfl';
export const psvApp = 'pns';
export const mitsuApp = 'mevn';
// export const nokiaApp = 'hmd'; Dong
export const artApp = 'art';
export const bekoApp = 'bk';
export const lgApp = 'lg';
export const dsmHvnApp = 'dsm-hvn';
export const hisenApp = 'hisense';
export const cuckooApp = 'cuckoo';
export const casperApp = 'casper';
export const pdaApp = 'pda';
export const demoApp = 'demoApp';
export const daikinApp = 'daikin';
export const viessmannApp = 'vsm';
export const tefalApp = 'gsv';
export const officeApp = 'office';
export const toshibaApp = 'toshiba'
export const sharpApp = 'sharp'
export const bshApp = 'bsh'
export var email_suppport = "it.support@spiral.com.vn";
export var AppStoreURL = "https://apps.spiral.com.vn";
export const signifyApp = 'stt';
export const mraApp = 'mra'
export const honorApp = 'honor'
export const tekaApp = 'teka'
// 
export const GOOGLE_API_KEY = "AIzaSyAgJtsjOIvLrReL55e9bFSuqnCc4dkM3T0"
// Val use
var url_root = '';
var url_root_web = '';
var color_root = '';
var color_root_content = '';
var color_light_root = '';
var color_light2_root = '';
var number_attendant = 2;
var valueCompetitor = 0;
var competitorName = '';
var app_name = '';
var bundleAndroid = '';
var traineeKey = 'EMPTY'
var projectCode = '';
var icon_notify_root = require('../Themes/Images/logo_spiral.png')

switch (AppNameBuild) {
	case tekaApp:
		url_root = 'https://teka-api.sucbat.com.vn/';
		// url_root = 'https://edev.spiral.com.vn/';
		color_root = '#d11313';
		color_light_root = '#e41f21';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 405;
		app_name = 'Teka Vietnam';
		competitorName = 'Teka';
		traineeKey = ''
		break;
	case daikinApp:
		url_root = 'https://daikin-api.sucbat.com.vn/';
		color_root = '#00A0E4';
		color_light_root = '#44C8F5';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 56;
		app_name = 'DKV Spiral';
		competitorName = 'DAIKIN';
		traineeKey = 'id0256';
		break;
	case hafeleApp:
		url_root = 'https://hfl-api.spiral.com.vn/';
		color_root = '#f00c2e';
		color_light_root = '#DC7F8A';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 156;
		app_name = 'HFL Spiral';
		competitorName = 'Hafele';
		break;
	case aquaApp:
		url_root = 'https://aqua-api.spiral.com.vn/';
		url_root_web = 'https://aqua.spiral.com.vn/';
		color_root = '#085CA7';
		color_light_root = '#83ADD3';
		color_root_content = '#ffffff';
		bundleAndroid = 'com.spiralaffm';
		traineeKey = 'id0797';
		number_attendant = 2;
		valueCompetitor = 150;
		app_name = 'AQUA Spiral';
		break;
	case epsonApp:
		url_root = 'https://eps-api.sucbat.com.vn/';
		color_root = '#142185';
		color_light_root = '#8990C1';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 151;
		app_name = 'EPS Spiral';
		bundleAndroid = 'com.spiral.eps';
		break;
	case hpiApp:
		url_root = 'https://hpi-api.spiral.com.vn/';
		// url_root = "https://edev.spiral.com.vn/"
		color_root = '#4987CE';
		color_light_root = '#91B7E1';
		color_root_content = '#ffffff';
		number_attendant = 4;
		valueCompetitor = 109;
		traineeKey = 'id0844';
		app_name = 'HPI';
		bundleAndroid = 'com.spiral.hpi';
		break;
	case psvApp:
		url_root = 'https://pns-v2-api.sucbat.com.vn/';
		// url_root = 'https://edev.spiral.com.vn/';
		color_root = '#1a4088';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		number_attendant = 4;
		valueCompetitor = 30;
		competitorName = 'Panasonic';
		app_name = 'PNS Spiral';
		traineeKey = 'id0097';
		bundleAndroid = 'com.spiral.pns';
		icon_notify_root = require('../Themes/Images/notify_pns.png');
		break;
	case mitsuApp:
		// url_root = "https://edev.spiral.com.vn/"
		url_root = 'https://mse-api.spiral.com.vn/';
		color_root = '#ED1A3B';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 40;
		competitorName = 'Spiral';
		app_name = 'MEVN Spiral';
		bundleAndroid = 'com.spiral.mevn';
		icon_notify_root = require('../Themes/Images/notify_mevn.png');
		break;
	// case nokiaApp:
	// 	url_root = 'https://api.hmdretail.vn/';
	// 	color_root = '#00313C'; //'#8CD0AF';
	// 	color_light_root = '#8CD0AF';
	// 	color_light2_root = '#8CD0AF';
	// 	color_root_content = '#ffffff';
	// 	number_attendant = 2;
	// 	valueCompetitor = 168;
	// 	competitorName = 'Nokia';
	// 	url_root_web = 'https://hmd.spiral.com.vn/';
	// 	app_name = 'HMD CMIS';
	// 	bundleAndroid = 'com.spiralhmd';
	// 	imeilimit = 15;
	// 	icon_notify_root = require('../Themes/Images/notify_hmd.png');
	// 	break;
	case artApp:
		url_root = 'https://art-api.spiral.com.vn/';
		color_root = '#9e2932';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 0;
		competitorName = 'Ariston';
		app_name = 'Spiral ART';
		break;
	case bekoApp:
		url_root = 'https://bk-api.spiral.com.vn/';
		url_root_web = 'https://bk.spiral.com.vn';
		color_root = '#0181cf';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 190;
		competitorName = 'Beko';
		app_name = 'Beko Spiral';
		bundleAndroid = 'com.spiral.bk';
		break;
	// case casperApp:
	// 	url_root = 'https://casper-api.sucbat.com.vn/';
	// 	color_root = '#4397af';
	// 	color_light_root = '#8d98aa';
	// 	color_light2_root = '#c2c2c2';
	// 	color_root_content = '#ffffff';
	// 	number_attendant = 2;
	// 	valueCompetitor = 221;
	// 	competitorName = 'Casper';
	// 	app_name = 'Casper Spiral';
	// 	bundleAndroid = 'com.spiral.casper';`
	// 	break;
	case lgApp:
		// url_root = 'https://asm-api.sucbat.com.vn/'
		// url_root = 'https://md-api.sucbat.com.vn/';
		url_root = 'https://lge-api.sucbat.com.vn/';
		// url_root = "https://edev.spiral.com.vn/"
		color_root = '#981E37';
		color_light_root = '#8d98aa';
		color_light2_root = '#8CD0AF';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 62;
		traineeKey = 'id0255';
		competitorName = 'LG';
		url_root_web = 'https://lg-e.spiral.com.vn/';
		app_name = 'LGE 2.0';
		bundleAndroid = 'com.spiral.lge';
		imeilimit = 15;
		projectCode = 'LGE';
		icon_notify_root = require('../Themes/Images/notify_lge.png');
		break;
	case hisenApp:
		url_root = 'https://hss-api.sucbat.com.vn/';
		// url_root = 'https://edev.spiral.com.vn/';
		color_root = '#00ada8';
		color_light_root = '#8d98aa';
		color_light2_root = '#8CD0AF';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 269;
		traineeKey = 'id0477';
		competitorName = 'Hisense';
		url_root_web = 'https://hss.spiral.com.vn/';
		app_name = 'Hisense';
		bundleAndroid = 'com.spiral.hss';
		imeilimit = 12;
		break;
	case demoApp:
		url_root = 'https://sfm-api.spiral.com.vn/';
		color_root = '#ED1A3B';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 269;
		traineeKey = 'id0477';
		competitorName = 'Spiral Sales';
		app_name = 'SFM Spiral';
		break;
	case dsmHvnApp:
		url_root = 'https://dsmhvn-api.sucbat.com.vn/';
		color_root = '#008200';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		bundleAndroid = 'com.spiral.dsmhvn';
		number_attendant = 2;
		valueCompetitor = 198;
		traineeKey = 'id0176-1';
		competitorName = 'DSM HVN';
		app_name = 'DSM HVN';
		break;
	case cuckooApp:
		url_root = 'https://cuckoo-api.sucbat.com.vn/';
		color_root = '#71152e';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		bundleAndroid = 'com.spiral.cuckoo';
		number_attendant = 2;
		valueCompetitor = 212;
		traineeKey = 'id0620';
		competitorName = 'Cuckoo';
		app_name = 'Cuckoo';
		break;
	case pdaApp:
		url_root = 'https://pda-api.sucbat.com.vn/';
		color_root = '#1a53a3';
		color_light_root = '#8d98aa';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		bundleAndroid = 'com.spiral.pda';
		number_attendant = 2;
		valueCompetitor = 253;
		traineeKey = '';
		competitorName = 'Nhà máy';
		app_name = 'Production';
		break;
	case mraApp:
		url_root = 'https://mra-api.sucbat.com.vn/';
		color_root = '#05943B';
		color_light_root = '#026013';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		bundleAndroid = 'com.spiral.mra';
		number_attendant = 2;
		valueCompetitor = 253;
		traineeKey = '';
		competitorName = 'Marico';
		app_name = 'Marico PGI';
		break;
	case signifyApp:
		url_root = 'https://snf-api.sucbat.com.vn/';
		color_root = '#00841e';
		color_light_root = '#3cdd60';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		bundleAndroid = 'com.spiral.snf';
		number_attendant = 2;
		valueCompetitor = 341;
		traineeKey = '';
		competitorName = 'Signify';
		email_suppport = 'it.support@spiral.com.vn';
		AppStoreURL = 'https://apps.spiral.com.vn/stt';
		url_root_web = 'https://stt.spiral.com.vn/';
		app_name = 'STT';
		break;
	case viessmannApp:
		// url_root = 'https://edev.spiral.com.vn/';
		url_root = 'https://vsm-api.sucbat.com.vn/';
		color_root = '#DD0000';
		color_light_root = '#ff8364';
		color_light2_root = '#FFCC00';
		color_root_content = '#fff';
		bundleAndroid = 'com.spiral.vsm';
		number_attendant = 2;
		valueCompetitor = 279;
		traineeKey = 'id0480';
		competitorName = 'Viessmann';
		app_name = 'VSM Spiral';
		break;
	case tefalApp:
		// url_root = 'https://edev.spiral.com.vn/';
		url_root = 'https://tefal-api.sucbat.com.vn/';
		color_root = '#e02f2b';
		color_light_root = '#e65955';
		color_light2_root = '#ffd633';
		color_root_content = '#fff';
		bundleAndroid = 'com.spiral.gsv';
		number_attendant = 2;
		valueCompetitor = 295;
		traineeKey = 'id0574';
		competitorName = 'GSV';
		app_name = 'GSV Spiral';
		break;
	case officeApp:
		url_root = 'https://sone-api.spiral.com.vn/';
		color_root = '#ec2028';
		color_light_root = '#b22f34';
		color_light2_root = '#fff';
		color_root_content = '#fff';
		bundleAndroid = 'com.spiral.one';
		number_attendant = 2;
		valueCompetitor = 0;
		traineeKey = '';
		competitorName = 'SPIRAL';
		app_name = 'Spiral One';
		break;
	case toshibaApp:
		// url_root = 'https://edev.spiral.com.vn/';
		url_root = 'https://tvcp-api.sucbat.com.vn/';
		color_root = '#ec1b23';
		color_light_root = '#fc8c8c';
		color_light2_root = '#fccdcb';
		color_root_content = '#fff';
		bundleAndroid = 'com.spiral.tsb';
		number_attendant = 2;
		valueCompetitor = 297;
		traineeKey = 'id0605';
		competitorName = 'Toshiba';
		app_name = 'TVCP Spiral';
		break;
	case bshApp:
		url_root = 'https://bsh-api.sucbat.com.vn/';
		// url_root = 'https://edev.spiral.com.vn/';
		color_root = '#E00420';
		color_light_root = '#31343A';
		color_light2_root = '#B6BBBE';
		color_root_content = '#DFE2E4';
		number_attendant = 2;
		valueCompetitor = 324;
		traineeKey = 'id0623';
		competitorName = 'Bosch';
		url_root_web = 'https://bsh.spiral.com.vn/';
		app_name = 'Bosch Spiral';
		bundleAndroid = 'com.spiral.bsh';
		imeilimit = 12;
		break;
	case sharpApp:
		url_root = 'https://sharp-api.sucbat.com.vn/';
		color_root = '#e6010b';
		color_light_root = '#f26b68';
		color_light2_root = '#faaeaa';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 323;
		traineeKey = 'id0477';
		competitorName = 'Sharp';
		url_root_web = 'https://sharp.spiral.com.vn/';
		app_name = 'Sharp';
		bundleAndroid = 'com.spiral.sharp';
		imeilimit = 12;
		break;
	case honorApp:
		url_root = 'https://honor-api.sucbat.com.vn/';
		color_root = '#146EF5';
		color_light_root = '#8023F6';
		color_light2_root = '#c2c2c2';
		color_root_content = '#ffffff';
		number_attendant = 2;
		valueCompetitor = 404;
		competitorName = 'Honor';
		url_root_web = 'https://honor.spiral.com.vn/';
		app_name = 'Honor Spiral';
		traineeKey = 'id1666';
		bundleAndroid = 'com.spiral.honor';
		break;
	default:
		break;
}
export const TRAINEEKEY = traineeKey
export const APPNAME = app_name
export const _competitorId = valueCompetitor;
export const _competitorName = competitorName;
export const NUMBER_ATTENDANT = number_attendant;
export const URLDEFAULT = url_root;
export const URL_WEB = url_root_web;
export const DEFAULT_COLOR = color_root;
export const DEFAULT_LIGHT_COLOR = color_light_root;
export const DEFAULT_LIGHT_COLOR2 = color_light2_root;
export const CONTENT_COLOR = color_root_content;
export const BUNDLE_ANDROID = bundleAndroid;
export const ICON_NOTIFY = icon_notify_root;
export const MENU_TYPE = 'MENU_TYPE';
export const MENU_KPI = 'MENU_KPI';
export const SYNC_DATA_SHOPS = 'SYNC_DATA_SHOPS'
export const SYNC_DATA_ATT = 'SYNC_DATA_ATT'
export const SYNC_DATA_CONFIG = 'SYNC_DATA_CONFIG';
export const CAMERA_NOTE = 'CAMERA_NOTE'
export const SYNC_DATA = 'SYNC_DATA'
export const GO_OVERVIEW = 'GO_OVERVIEW'
export const PLACE_HOLDER_TEXT = '-- Chọn --'
export const PROJECTCODE = projectCode
// Export url
export const URLLogin = URLDEFAULT + 'users/login/';
export const URLLogout = URLDEFAULT + 'employee/logout';
export const URL_GetShops = URLDEFAULT + 'shops/shopslist';
export const URL_UPDATE_SHOP = URLDEFAULT + 'shops/updateShopInfo';
export const URL_CHANGEPASS = URLDEFAULT + 'employee/changepass'
export const URL_EMPLOYEEINFO = URLDEFAULT + 'employee/GetById'
export const URL_EMPLOYEEINFO_UPDATE = URLDEFAULT + 'employee/updatebyid'
export const URL_DOWNLOAD = URLDEFAULT + 'download/all';
export const URL_DOWNLOAD_MENULIST = URLDEFAULT + 'employee/formlist';
export const URL_SELLOUTMONTHLY = URLDEFAULT + 'sellouts/dashboardmonth';
export const URL_POST_SELLOUTUPLOAD = URLDEFAULT + 'sellouts/upload';
export const URL_POST_SELLOUTUPLOAD_DB = URLDEFAULT + 'sellouts/uploadSO';
export const URL_LATED = URL_WEB + 'RegisterPlan?';
export const URL_SUPCONFIRM = URL_WEB + 'SupConfirm?';
export const URL_FIELD_COACHING = URL_WEB + 'form/formresult?publicKey=';
export const URL_TIME = `${URLDEFAULT}public/time`
export const URL_DOWNLOAD_HISTORY_DISPLAY = URLDEFAULT + 'display/history';
export const URL_DOWNLOAD_HISTORY_DISPLAYCOMPETITOR = URLDEFAULT + 'display/historycompetitor';
export const URL_DOWNLOAD_HISTORY_MARKET = URLDEFAULT + 'sellouts/GetMarketHistory';
export const URL_DOWNLOAD_PRODUCT = URLDEFAULT + 'download/product';
export const URL_REPORT = URLDEFAULT + 'WebPage/ProgressReport.aspx?';
export const URL_REPORT_ATT_MEVN = URLDEFAULT + 'MEVNKpi';
export const GOOGLE_GETADDRESS = `https://maps.googleapis.com/maps/api/geocode/json?key=${GOOGLE_API_KEY}&latlng=`
export const URL_LATE_CONFIRM = URLDEFAULT + 'WebPage/ConfirmLateNote.aspx?';
export const URL_UPLOAD_ATTENDANT = URLDEFAULT + 'attendants/upload'
export const URL_GET_ATTENDANT = URLDEFAULT + 'attendants/lists'
export const URL_SAVE_NOTE_ATTENDANT = URLDEFAULT + 'attendants/insertnote'
export const URL_ICON = URLDEFAULT + 'icon/';
export const URL_PRIVACY = URL_WEB + 'privacy.html?';
// export const URL_UPLOAD_DISPLAY_COMPETITOR = URLDEFAULT + 'sellouts/uploadcompetitor';
export const URL_UPLOAD_AUDIT_DISPLAY = URLDEFAULT + 'sellouts/uploadAuditDisplay';
export const URL_UPLOAD_PHOTOS = URLDEFAULT + 'photos/upload';
export const URL_UPLOAD_PHOTODATA = URLDEFAULT + 'photos/uploaddata';
export const URL_UPLOAD_PHOTOALLDATA = URLDEFAULT + 'photos/uploadAllData';
export const URL_POST_PROMOTIONUPLOAD = URLDEFAULT + 'sellouts/uploadPromotion';
export const URL_POST_MARKET_UPLOAD = URLDEFAULT + 'sellouts/uploadMarket';
export const URL_GET_REQUEST_ITEMS = URLDEFAULT + 'download/RequestItem';
export const URL_POST_SURVEY_UPLOAD = URLDEFAULT + 'sellouts/uploadSurvey';
export const URL_DOWNLOAD_MESSENGER = URLDEFAULT + 'notify/byuser';
export const URL_UPDATE_MESSENGER = URLDEFAULT + 'notify/update';
export const URL_SELLOUT_DUPLICATE = URLDEFAULT + 'sellouts/getduplicate';
export const URL_SELLOUT_DUPLICATE_CONFIRM = URLDEFAULT + 'sellouts/duplicateRemove';
export const URL_SELLOUT_UPDATE_PHONE = URLDEFAULT + 'sellouts/updatePhoneNumber';
export const URL_SELLOUT_EVIDENT = URLDEFAULT + 'sellouts/getevident';
export const URL_UPLOAD_EVIDENT = URLDEFAULT + 'sellouts/uploadEvident';
export const URL_GETIMEI = URLDEFAULT + 'sellouts/get_imei';
export const URL_GET_CTSS_HISTORY = URLDEFAULT + 'sellouts/GetCTSSHistory';
export const URL_UPLOAD_DISPLAY = URLDEFAULT + 'display/upload'
export const URL_UPLOAD_DISPLAY_COMPETITOR = URLDEFAULT + 'display/uploadcompetitor'
export const URL_UPLOAD_STOCK = URLDEFAULT + 'stock/upload'
export const URL_CHECK_IMEI = URLDEFAULT + 'sellouts/CHECK_IMEI';
export const URL_CHECK_IMEI2 = URLDEFAULT + 'sellouts/CHECK_IMEI2';
export const URL_DOWNLOAD_MENUPOP = URLDEFAULT + 'PSVPOP/GET_MENU';
export const URL_DOWNLOAD_TOTALPOP = URLDEFAULT + 'PSVPOP/GET_TotalWareHouse';
export const URL_DOWNLOAD_WARNINGPOP = URLDEFAULT + 'PSVPOP/GET_WARNING';
export const URL_UPLOADPOP = URLDEFAULT + 'PSVPOP/INSERT_ORDER';
export const URL_ORDERSPOP = URLDEFAULT + 'PSVPOP/GET_ORDERS';
export const URL_CONFIRM_ORDERS = URLDEFAULT + 'PSVPOP/CONFIRM_ORDERS';
export const URL_UPDATE_WAREHOUSE = URLDEFAULT + 'PSVPOP/UPDATE_WAREHOUSE';
export const URL_UPDATE_ORDER = URLDEFAULT + 'PSVPOP/UPDATE_ORDER';
export const URL_INSTALL_POP = URLDEFAULT + 'PSVPOP/GET_INSTALL_POP';
export const URL_INSERT_POPSHOP = URLDEFAULT + 'PSVPOP/INSERT_POPSHOP';
export const URL_UPLOAD_OT_TIME = URLDEFAULT + 'attendants/uploadot'
export const URL_WORKINGPLAN_BYDATE = URLDEFAULT + 'workingplan/workplanbydate';
export const URL_UPLOAD_WORKING_SCHEDULE = URLDEFAULT + 'workingschedule/uploadWorkingSchedule';
export const URL_REGIONS = URLDEFAULT + 'shops/province';
export const URL_WORKING_SCHEDULE = URLDEFAULT + 'WorkingSchedule/getlist';
// LG -KTV
export const URL_DOWNLOAD_KTV = URLDEFAULT + 'lgdownload/CUSTOMER_KTV';
export const URL_UPLOAD_STATUS_KTV = URLDEFAULT + 'lgdownload/UPLOAD_STATUS_KTV';
export const URL_CHECKMOBILE_CUSTOMER = URLDEFAULT + 'lgdownload/CHECK_MOBILE_CUSTOMER';
export const URL_PHOTOS_KTV = URLDEFAULT + 'photos/GetListPhotos';
export const EMPLOYEE_TYPE_PHOTO = 'EMPLOYEE_INFO'
export const TYPE_CMND_BEFORE = 'CMND_BEFORE'
export const TYPE_CMND_AFTER = 'CMND_AFTER'
export const URL_UPLOAD_OOS = URLDEFAULT + 'oos/upload';
export const URL_HISTORY_OOS = URLDEFAULT + 'oos/gethistory';
export const URL_WORKINGPLAN_GETLIST = URLDEFAULT + 'workingplan/getlist';
export const URL_WORKINGPLAN_CHANGE = URLDEFAULT + 'workingplan/changework';
export const URL_WORKINGPLAN_CHANGESHIFT = URLDEFAULT + 'workingplan/changeshift';
export const URL_WORKINGPLAN_WORKINGLATE = URLDEFAULT + 'workingplan/workinglate';
export const URL_WORKINGPLAN_UPLOAD_IMAGE = URLDEFAULT + 'workingplan/uploadfile';
export const URL_REGISTERPLAN_GETLIST = URLDEFAULT + 'workingplan/planbyweek';
export const URL_GET_LISTWEEK = URLDEFAULT + 'workingplan/listweek';
export const URL_REGISTERPLAN_LISTWEEK = URLDEFAULT + 'workingplan/listweek';
export const URL_REGISTERPLAN_COPY = URLDEFAULT + 'workingplan/copyplan';
export const URL_REGISTERPLAN_SAVE = URLDEFAULT + 'workingplan/saveregister';
export const URL_GET_SHIFTTYPE = URLDEFAULT + 'workingplan/listshift';
export const URL_PROGRESS_REPORT = URLDEFAULT + 'history/progressreport';
export const WEBVIEW_REGISTERPLAN = URLDEFAULT + 'registerplan?data=';
export const WEBVIEW_SUPCONFIRM_PLAN = URLDEFAULT + 'supconfirm?data=';
export const URL_GET_ATTENDANT_RESULT = URLDEFAULT + 'attendants/getAttendantResult';
export const URL_UPLOAD_ATTENDANT_RESULT = URLDEFAULT + 'attendants/uploadAttendantResult';
export const TRAINING_RESULT = "http://trainingsystem.spiral.com.vn/ffspanasonic/report/";
export const DATETIME_START = 'DATETIME_START'
export const DATETIME_END = 'DATETIME_END'
export const URL_GET_SELLOUT_CHART_HMD = URLDEFAULT + 'sellouts/GetChartSelloutHMD';
export const URL_POST_TRACKING_DISPLAY = URLDEFAULT + 'sellouts/uploadTrackingDisplay';
export const URL_PUBLIC = "https://public-api.spiral.com.vn/"