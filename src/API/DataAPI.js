import { fetchGet } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
import { isNetworkConnection } from '../Core/Utility';

const GetDrawMenu = async actionResult => {
  const connected = await isNetworkConnection();
  if (connected) {
    try {
      const result = await fetchGet(`${URLDEFAULT}data/drawmenu`);
      if (result.statusId == 200) {
        actionResult && actionResult(result.data);
      } else {
        actionResult && actionResult([]);
      }
    } catch (err) {
      console.log('GetDrawMenu error: ', err);
      actionResult && actionResult([]);
    }
  }
};

export const DataAPI = { GetDrawMenu };
