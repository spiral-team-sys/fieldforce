import { Token } from '../Core/Helper';
import { InsertItems, Store } from '../Core/SqliteDbContext';
import { URL_DOWNLOAD_MESSENGER } from '../Core/URLs';
import { getIdMaxMessenger } from './WorkController';
const delay = ms => new Promise(res => setTimeout(res, ms));
export const LoadDataMessenger = async loadBadge => {
  var IdMax = 0;
  let lstMax = await getIdMaxMessenger();

  if (lstMax !== undefined) {
    if (Array.isArray(lstMax) && lstMax.length > 0) {
      if (lstMax[0].max !== null) {
        IdMax = lstMax[0].max;
      }
    }
  }

  try {
    let token = await Token();
    await fetch(URL_DOWNLOAD_MESSENGER, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        LastId: IdMax,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        insertMessenger(responseJson, () => loadBadge());
      });
  } catch (error) {
    // alert(error);
  }
};
export const insertMessenger = async (lst, finish) => {
  if (Array.isArray(lst) && lst.length > 0 && lst !== undefined) {
    await Store().then(async db => {
      try {
        lst.forEach(async element => {
          await InsertItems(db, 'messenger', [
            {
              id: element.id,
              title: element.title,
              body: element.body,
              typeReport: element.typeReport,
              createdDate: element.createdDate,
              seen: 0,
              hyperLinks: element.hyperLinks,
            },
          ]);
        });
        await delay(500);
        finish();
      } catch (errorStr) {
        console.log('EEE ' + errorStr);
      }
    });
  }
};
