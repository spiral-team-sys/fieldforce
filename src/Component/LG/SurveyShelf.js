import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import {
  getLstResShelfPG,
  insertItemShelfPG,
} from '../../Controller/ShelfPGController';
import { getListTrackLG } from '../../Controller/TrackingDetailController';
import UploadController from '../../Controller/UploadController';
import { Message, ToastError, ToastSuccess } from '../../Core/Helper';
import { RadioButton } from '../../Core/RadioButton';
import { checkNetwork } from '../../Core/Utility';
import { LoadingView } from '../../Control/ItemLoading/index';
import { deviceHeight } from '../../Themes/AppsStyle';
import moment from 'moment';

export const SurveyShelf = ({ navigation, route }) => {
  const [LstTrack, setLstTrack] = useState([]);
  const [LstShow, setLstShow] = useState([]);
  const [Status, setStatus] = useState(0);
  const { shopinfo, appcolor, workinfo, kpiinfo } = useSelector(
    state => state.GAppState,
  );
  const [showProgress, setProgress] = useState(false);

  const uploadAction = async () => {
    const work = { ...workinfo, reportId: kpiinfo.kpiId };
    let isNetwork = await checkNetwork();
    if (!isNetwork) {
      ToastError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    let lstRes = await getLstResShelfPG(workinfo);
    if (lstRes.length === 0) {
      ToastError('Bạn chưa làm báo cáo.');
      return;
    }
    Message(
      'Chú ý',
      'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?',
      () => UploadData(lstRes, work),
    );
  };
  const UploadData = async (lstRes, work) => {
    await setProgress(true);
    UploadController.DataShelfPG(
      lstRes,
      work,
      async () => {
        await setProgress(false);
        await reloadData();
      },
      async () => {
        await setProgress(false);
      },
    );
  };
  const getData = async () => {
    if (LstShow.length === 0) {
      let lstTrack = await getListTrackLG(34);

      await setLstTrack(lstTrack);
      let lstRes = await getLstResShelfPG(workinfo);
      await MaptoRes(lstTrack, lstRes);
    }
  };
  const reloadData = async () => {
    let lstRes = await getLstResShelfPG(workinfo);
    await MaptoRes(LstTrack, lstRes);
  };
  const MaptoRes = async (trackList, resList) => {
    let lstData = [];
    let isheader = false;

    trackList.map(it => {
      let lstF = resList || [];

      let itemPut = null;

      if (isheader === false) {
        isheader = true;
        lstData.push({
          id: 1,
          title1: 'Hãng',
          title2: 'Quầy kệ',
          title3: 'PG',
        });
      }

      let itemsHave = lstF.filter(r => r.idItem === it.id);
      if (itemsHave && itemsHave.length > 0) {
        let day = parseInt(moment(new Date()).format('YYYYMMDD'));
        if (workinfo.workDate === day) {
          setStatus(itemsHave[0].upload);
        } else {
          setStatus(1);
        }
        itemPut = {
          ...it,
          name: it.competitorName,
          shelfvalue: itemsHave[0].shelfvalue,
          pgvalue: itemsHave[0].pgvalue,
        };
        lstData.push(itemPut);
      } else {
        lstData.push({ ...it, name: it.competitorName });
      }
    });
    // console.log(lstData, "LstShow")
    await setLstShow(lstData);
  };
  useEffect(() => {
    getData();
    return () => false;
  });
  const createItem = item => {
    let itemGen = {
      workId: workinfo.workId,
      upload: 0,
      trackingId: item.trackingId,
      idItem: item.id,
      competitorId: item.competitorId,
      competitorName: item.competitorName,
      categoryId: item.categoryId,
      category_viVN: item.category_viVN,
    };
    return itemGen;
  };
  const pressItemShelf = async (item, val) => {
    let itemTem = createItem(item);
    itemTem = { ...itemTem, shelfvalue: val ? 1 : 0 };
    await insertItemShelfPG(itemTem, workinfo.workId, 'SHELF');
    await reloadData();
  };
  const pressItemPG = async (item, val) => {
    let itemTem = createItem(item);
    itemTem = { ...itemTem, pgvalue: val ? 1 : 0 };
    await insertItemShelfPG(itemTem, workinfo.workId, 'PG');
    await reloadData();
  };
  const styles = StyleSheet.create({
    mainItemView: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: appcolor.primary,
      margin: 8,
      borderRadius: 5,
    },
    viewHeader: {
      padding: 8,
      color: appcolor.white,
      fontWeight: '600',
      fontSize: 15,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    lineLeft: { width: 0.5, height: '100%', backgroundColor: appcolor.white },
    itemView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: appcolor.light,
      margin: 5,
      borderRadius: 5,
    },
    itemTitle: {
      width: '40%',
      color: appcolor.dark,
      padding: 12,
      fontSize: 14,
      fontWeight: '500',
    },
    valueStyle: {
      marginLeft: 5,
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: 13,
      fontWeight: '500',
    },
  });
  const renderItem = ({ item }) => {
    const colorSheftYes =
      item.shelfvalue === null
        ? appcolor.dark
        : item.shelfvalue === 1
        ? appcolor.success
        : appcolor.dark;
    const colorSheftNo =
      item.shelfvalue === null
        ? appcolor.dark
        : item.shelfvalue === 0
        ? appcolor.danger
        : appcolor.dark;
    const colorPGYes =
      item.pgvalue === null
        ? appcolor.dark
        : item.pgvalue === 1
        ? appcolor.success
        : appcolor.dark;
    const colorPGNo =
      item.pgvalue === null
        ? appcolor.dark
        : item.pgvalue === 0
        ? appcolor.danger
        : appcolor.dark;

    const sheftValueYes =
      item.shelfvalue === null ? null : item.shelfvalue === 1;
    const sheftValueNo =
      item.shelfvalue === null ? null : item.shelfvalue === 0;
    const pgValueYes = item.pgvalue === null ? null : item.pgvalue === 1;
    const pgValueNo = item.pgvalue === null ? null : item.pgvalue === 0;
    return (
      <View>
        {'title1' in item ? (
          <View style={styles.mainItemView}>
            <Text
              lineBreakMode="middle"
              style={{ ...styles.viewHeader, textAlign: 'left', width: '40%' }}
            >
              {item.title1}
            </Text>
            <Text
              lineBreakMode="middle"
              style={{ ...styles.viewHeader, width: '30%' }}
            >
              {item.title2}
            </Text>
            <Text
              lineBreakMode="middle"
              style={{ ...styles.viewHeader, width: '30%' }}
            >
              {item.title3}
            </Text>
          </View>
        ) : (
          <View style={styles.itemView}>
            <Text
              lineBreakMode="middle"
              numberOfLines={2}
              style={styles.itemTitle}
            >
              {item.name}
            </Text>
            <View
              style={{
                width: '28%',
                flexDirection: 'column',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  borderRadius: 40,
                  width: '80%',
                  margin: 5,
                }}
                onPress={() => pressItemShelf(item, true)}
                disabled={Status === 0 ? false : true}
              >
                <RadioButton
                  styleSelect={{ backgroundColor: colorSheftYes }}
                  style={{ borderColor: colorSheftYes }}
                  selected={sheftValueYes}
                />
                <Text style={{ ...styles.valueStyle, color: colorSheftYes }}>
                  Có
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  borderRadius: 40,
                  width: '80%',
                  margin: 5,
                }}
                onPress={() => pressItemShelf(item, false)}
                disabled={Status === 0 ? false : true}
              >
                <RadioButton
                  styleSelect={{ backgroundColor: colorSheftNo }}
                  style={{ borderColor: colorSheftNo }}
                  selected={sheftValueNo}
                />
                <Text style={{ ...styles.valueStyle, color: colorSheftNo }}>
                  Không
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '28%',
                flexDirection: 'column',
                alignSelf: 'flex-end',
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  borderRadius: 40,
                  width: '80%',
                  margin: 5,
                }}
                onPress={() => pressItemPG(item, true)}
                disabled={Status === 0 ? false : true}
              >
                <RadioButton
                  styleSelect={{ backgroundColor: colorPGYes }}
                  style={{ borderColor: colorPGYes }}
                  selected={pgValueYes}
                />
                <Text style={{ ...styles.valueStyle, color: colorPGYes }}>
                  Có
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  borderRadius: 40,
                  width: '80%',
                  margin: 5,
                }}
                onPress={() => pressItemPG(item, false)}
                disabled={Status === 0 ? false : true}
              >
                <RadioButton
                  styleSelect={{ backgroundColor: colorPGNo }}
                  style={{ borderColor: colorPGNo }}
                  selected={pgValueNo}
                />
                <Text style={{ ...styles.valueStyle, color: colorPGNo }}>
                  Không
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        title={route.params.titlePage}
        leftFunc={() => navigation.goBack()}
        iconRight="cloud-upload-alt"
        rightFunc={Status !== 1 ? () => uploadAction() : null}
      />
      <LoadingView
        isLoading={showProgress}
        title="Vui lòng chờ ..."
        styles={{ marginTop: 8 }}
      />
      {!showProgress && (
        <FlatList
          keyExtractor={(_, index) => index.toString()}
          data={LstShow}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: deviceHeight / 2 }} />}
        />
      )}
    </View>
  );
};
