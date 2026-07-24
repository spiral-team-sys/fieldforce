import _ from 'lodash';

const updateDetailData = (prevData, itemUpdate) => {
  const newData = [...prevData];
  for (let i = 0; i < newData.length; i++) {
    try {
      const detailDataArr = JSON.parse(newData[i].detailData || '[]');
      const index = detailDataArr.findIndex(d => d.POPId === itemUpdate.POPId);

      if (index !== -1) {
        detailDataArr[index] = { ...detailDataArr[index], ...itemUpdate };
        newData[i] = {
          ...newData[i],
          detailData: JSON.stringify(detailDataArr),
        };
        break;
      }
    } catch (e) {
      console.error('Parse error:', e);
    }
  }
  return newData;
};
const updateOrderData = (prevData, itemUpdate) => {
  let newData = _.cloneDeep(prevData);
  const index = _.findIndex(newData, d => d.POPId === itemUpdate.POPId);
  if (index !== -1) {
    if (itemUpdate.UserInput === 0) {
      newData = _.filter(newData, (d, i) => i !== index);
    } else {
      _.assign(newData[index], itemUpdate);
    }
  }
  return newData;
};
const updateMainData = (prevMain, orderList) => {
  const orderMap = _.keyBy(orderList, 'POPId');

  const newMain = _.map(prevMain, groupItem => {
    let detailArr = [];
    try {
      detailArr = JSON.parse(groupItem.detailData || '[]');
    } catch (e) {
      detailArr = [];
    }
    detailArr = detailArr.map(item => {
      const order = orderMap[item.POPId];
      return {
        ...item,
        UserInput: order ? order.UserInput : 0,
      };
    });
    return {
      ...groupItem,
      detailData: JSON.stringify(detailArr),
    };
  });

  return newMain;
};
// Edit Order
const updateContentOrder = (data, orderNo, newContent) => {
  const dataUpdate = _.map(data, order => {
    let detailData = JSON.parse(order.detailData);
    detailData = _.map(detailData, d => {
      if (d.OrderNo === orderNo) {
        return {
          ...d,
          Content: JSON.stringify(newContent),
        };
      }
      return d;
    });

    return {
      ...order,
      detailData: JSON.stringify(detailData),
    };
  });
  return dataUpdate;
};
//
export const POPController = {
  updateDetailData,
  updateOrderData,
  updateMainData,
  updateContentOrder,
};
