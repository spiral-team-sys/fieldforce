import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
export const PSVManagerSONW = async filter => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(filter)),
    };
    const response = await fetch(
      URLDEFAULT + 'dashboard/psvmanagernw',
      requestInfo,
    );
    //
    const result = await response.json();
    if (result.statusId === 200) {
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};
export const PSVManagerSObyRegion = async filter => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(filter)),
    };
    const response = await fetch(
      URLDEFAULT + 'dashboard/psvmanagerbyregion',
      requestInfo,
    );
    //
    const result = await response.json();
    if (result.statusId === 200) {
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};

export const PSVManagerSObyCate = async filter => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(filter)),
    };
    const response = await fetch(
      URLDEFAULT + 'dashboard/psvmanagerbycate',
      requestInfo,
    );
    //
    const result = await response.json();
    if (result.statusId === 200) {
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};
export const PSVManagerSOTopSKU = async filter => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(filter)),
    };
    const response = await fetch(
      URLDEFAULT + 'dashboard/psvmanagertopsku',
      requestInfo,
    );
    //
    const result = await response.json();
    if (result.statusId === 200) {
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};
export const PSVManagerSOTopStore = async filter => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(filter)),
    };
    const response = await fetch(
      URLDEFAULT + 'dashboard/psvmanagertopstore',
      requestInfo,
    );
    //
    const result = await response.json();
    if (result.statusId === 200) {
      // console.log(result,"PSVManagerSOTopStore")
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};
export const PSVManagerSObyDealer = async filter => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(filter)),
    };
    const response = await fetch(
      URLDEFAULT + 'dashboard/psvmanagerbydealer',
      requestInfo,
    );
    //
    const result = await response.json();
    if (result.statusId === 200) {
      // console.log(result,"PSVManagerSObyDealer")
      return result.data;
    } else {
      return [];
    }
  } catch (err) {
    alert(JSON.stringify(err));
    return [];
  }
};
