import { Platform } from 'react-native';
import { fetchGet, getDeviceInfo, GetToken } from '../Core/Helper';
import {
  DeleteAll,
  Insert,
  QueryStringSql,
  UpGradeDB,
} from '../Core/SqliteDbContext';
import {
  auditDisplayItems,
  competitor,
  dealer,
  displayHistory,
  displayTarget,
  masterList,
  menulist,
  mobileKPIList,
  posm,
  posmGuid,
  products,
  promotionList,
  regions,
  shopFormat,
  shopProfile,
  stockHistory,
  storeList,
  taskList,
  taskListHistory,
  trackingCompetitor,
  trackingDetail,
} from '../Core/Table';
import {
  URL_DOWNLOAD,
  URL_DOWNLOAD_HISTORY_DISPLAY,
  URL_DOWNLOAD_HISTORY_MARKET,
  URLDEFAULT,
} from '../Core/URLs';
import { isNetworkConnection, TODAY } from '../Core/Utility';
import { toastError } from '../Utils/configToast';
import { CountProduct } from '../Controller/ProductController';
import {
  historyDisplay,
  historyMarket,
  trackingDetailHistory,
} from '../Core/TableLocal';
import { ATTENDANT_API } from './AttendantAPI';

const getTaskListByWorkDate = (items, workDate) => {
  return (items || []).map(item => ({ ...item, workDate }));
};
const hasUnauthorizedResult = (...items) => {
  return items.some(item => Number(item?.statusId) === 401);
};
const saveTaskListHistory = async workDate => {
  const { res } = await QueryStringSql(
    `SELECT COUNT(*) AS total FROM ${taskList.tableName} WHERE workDate IS NOT NULL AND workDate<>${workDate}`,
  );
  if ((res?.[0]?.total || 0) === 0) return;

  await QueryStringSql(`
        UPDATE ${taskListHistory.tableName}
        SET
            fistTask=(SELECT t.fistTask FROM ${taskList.tableName} t WHERE t.shopId=${taskListHistory.tableName}.shopId AND t.reportId=${taskListHistory.tableName}.reportId AND t.workDate=${taskListHistory.tableName}.workDate LIMIT 1),
            taskDone=(SELECT t.taskDone FROM ${taskList.tableName} t WHERE t.shopId=${taskListHistory.tableName}.shopId AND t.reportId=${taskListHistory.tableName}.reportId AND t.workDate=${taskListHistory.tableName}.workDate LIMIT 1),
            taskAlter=(SELECT t.taskAlter FROM ${taskList.tableName} t WHERE t.shopId=${taskListHistory.tableName}.shopId AND t.reportId=${taskListHistory.tableName}.reportId AND t.workDate=${taskListHistory.tableName}.workDate LIMIT 1)
        WHERE EXISTS (
            SELECT 1
            FROM ${taskList.tableName} t
            WHERE t.shopId=${taskListHistory.tableName}.shopId
                AND t.reportId=${taskListHistory.tableName}.reportId
                AND t.workDate=${taskListHistory.tableName}.workDate
                AND t.workDate IS NOT NULL
                AND t.workDate<>${workDate}
        )
    `);
  await QueryStringSql(`
        INSERT INTO ${taskListHistory.tableName}(shopId,reportId,fistTask,taskDone,taskAlter,workDate)
        SELECT t.shopId,t.reportId,t.fistTask,t.taskDone,t.taskAlter,t.workDate
        FROM ${taskList.tableName} t
        WHERE t.workDate IS NOT NULL
            AND t.workDate<>${workDate}
            AND NOT EXISTS (
                SELECT 1
                FROM ${taskListHistory.tableName} h
                WHERE h.shopId=t.shopId
                    AND h.reportId=t.reportId
                    AND h.workDate=t.workDate
            )
    `);
};

const downloadAll = async actionResult => {
  const connected = await isNetworkConnection();
  if (connected) {
    try {
      //Upgrade db
      await UpGradeDB();
      await uploadDeviceInfo();
      var data = await fetchGet(URL_DOWNLOAD);
      if (hasUnauthorizedResult(data)) {
        actionResult &&
          (await actionResult(
            'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
          ));
        return false;
      }
      var dataHistoryDisplay = await fetchGet(URL_DOWNLOAD_HISTORY_DISPLAY);
      var dataHistoryMarket = await fetchGet(URL_DOWNLOAD_HISTORY_MARKET);
      if (hasUnauthorizedResult(dataHistoryDisplay, dataHistoryMarket)) {
        actionResult &&
          (await actionResult(
            'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
          ));
        return false;
      }
      const countProduct = await CountProduct();
      await Promise.all([
        data,
        dataHistoryDisplay,
        dataHistoryMarket,
        countProduct,
      ]).then(async result => {
        await DeleteAll(competitor).then(async () => {
          await Insert(competitor, data?.competitor || []);
        });
        await DeleteAll(dealer).then(async () => {
          await Insert(dealer, data?.dealer || []);
        });
        await DeleteAll(displayHistory).then(async () => {
          await Insert(displayHistory, data?.displayHistory || []);
        });
        await DeleteAll(historyDisplay).then(async () => {
          await Insert(historyDisplay, dataHistoryDisplay || []);
        });
        await DeleteAll(stockHistory).then(async () => {
          await Insert(stockHistory, data?.stockHistory || []);
        });
        await DeleteAll(trackingCompetitor).then(async () => {
          await Insert(trackingCompetitor, data?.trackingCompetitor || []);
        });
        await DeleteAll(promotionList).then(async () => {
          await Insert(promotionList, data?.promotionList || []);
        });
        await DeleteAll(shopFormat).then(async () => {
          await Insert(shopFormat, data?.shopFormat || []);
        });
        await DeleteAll(auditDisplayItems).then(async () => {
          await Insert(auditDisplayItems, data?.auditDisplayItems || []);
        });
        await DeleteAll(historyMarket).then(async () => {
          await Insert(historyMarket, dataHistoryMarket || []);
        });
        await DeleteAll(posm).then(async () => {
          await Insert(posm, data?.posm || []);
        });
        await DeleteAll(mobileKPIList).then(async () => {
          await Insert(mobileKPIList, data?.mobileKPIList || []);
        });
        const shops = (await data?.storeList) || [];
        await DeleteAll(storeList).then(async () => {
          await Insert(storeList, shops);
        });
        await DeleteAll(masterList).then(async () => {
          await Insert(masterList, data?.masterList || []);
        });
        if (
          countProduct !== 0 &&
          countProduct === (await data?.products?.length)
        )
          console.log('no update new product ', countProduct);
        else
          await DeleteAll(products).then(async () => {
            await Insert(products, data?.products || []);
          });
        await DeleteAll(regions).then(async () => {
          await Insert(regions, data?.regions || []);
        });
        await DeleteAll(trackingDetail).then(async () => {
          await Insert(trackingDetail, data?.trackingDetail || []);
        });
        await DeleteAll(shopProfile).then(async () => {
          await Insert(shopProfile, data?.shopProfiles || []);
        });
        await DeleteAll(displayTarget).then(async () => {
          await Insert(displayTarget, data?.displayTarget || []);
        });
        await saveTaskListHistory(TODAY);
        await DeleteAll(taskList).then(async () => {
          await Insert(taskList, getTaskListByWorkDate(data?.taskList, TODAY));
        });
        await DeleteAll(posmGuid).then(async () => {
          await Insert(posmGuid, data?.posmGuid || []);
        });
        await DeleteAll(trackingDetailHistory).then(async () => {
          await Insert(
            trackingDetailHistory,
            data?.trackingDetailHistory || [],
          );
        });
        //
        if ((await shops.length) > 0) {
          await ATTENDANT_API.GetDataAttendance({ shopId: 0, workDate: TODAY });
          // await AttendantController.SyncFromServer({ shopId: 0, workDate: TODAY })
        }
        actionResult && (await actionResult('Đã đồng bộ dữ liệu'));
      });
      return true;
    } catch (err) {
      actionResult && (await actionResult(`Lỗi: ${err}`));
      return false;
    }
  }
  return false;
};
const downloadTaskList = async () => {
  const connected = await isNetworkConnection();
  if (connected) {
    try {
      await UpGradeDB();
      const data = await fetchGet(URLDEFAULT + 'download/tasklist');
      await saveTaskListHistory(TODAY);
      await DeleteAll(taskList).then(async () => {
        await Insert(taskList, getTaskListByWorkDate(data?.data, TODAY));
      });
    } catch (err) {
      toastError('Lỗi tải TaskList', `${err}`);
    }
  }
};
const downloadMenu = async finish => {
  try {
    const connected = await isNetworkConnection();
    if (connected) {
      const token = await GetToken();
      const requestInfo = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
        },
      };
      const response = await fetch(
        URLDEFAULT + 'download/listMenu',
        requestInfo,
      );
      const result = await response.json();
      if (result.statusId === 200) {
        await DeleteAll(menulist).then(async e => {
          await Insert(menulist, result.data);
        });
      }
      if (typeof finish === 'function') {
        await finish(result);
      }
    }
  } catch (err) {
    toastError('Lỗi tải Menu', err?.message || `${err}`);
  }
};
const uploadDeviceInfo = async () => {
  const _device = await getDeviceInfo();
  const data = {
    deviceInfo: JSON.stringify(_device),
    deviceId: _device.getDeviceId,
    platform: Platform.OS.toString(),
  };
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(data),
    };
    await fetch(URLDEFAULT + 'download/devicelog', requestInfo);
  } catch (err) {
    toastError('Lỗi gửi thông tin thiết bị', `${err}`);
  }
};
export const DOWNLOADAPI = {
  downloadAll,
  downloadTaskList,
  downloadMenu,
  uploadDeviceInfo,
};
