import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { REPORT } from '../../API/ReportAPI';
import { HeaderCustom } from '../../Content/HeaderCustom';
import InputIdea from './Page/InputIdea';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toastError, toastSuccess } from '../../Utils/configToast';
import {
  TODAY,
  alertConfirm,
  alertError,
  checkNetwork,
} from '../../Core/Utility';
import { removeStore } from '../../Core/Helper';
import { Icon } from '@rneui/themed';
import SurveyListScreen from './Page/SurveyListScreen';
import { getDataPhotos } from '../../Controller/PhotoController';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { fontWeightBold } from '../../Themes/AppsStyle';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

const DATE = new Date();
const normalizeKaizenList = (list = []) => {
  const dataMap = new Map();

  list.forEach((item, index) => {
    const key =
      item?.guid ||
      `${item?.id || 'item'}_${item?.createdDate || index}_${item?.employeeId || item?.employeeName || ''
      }`;
    if (!dataMap.has(key)) {
      dataMap.set(key, { ...item, _rowKey: key });
    }
  });

  return Array.from(dataMap.values());
};

const HomeKaizen = ({ navigation }) => {
  const { appcolor, kpiinfo, userinfo } = useSelector(state => state.GAppState);
  const insets = useSafeAreaInsets();
  const [dataMain, setDataMain] = useState([]);
  const [dataInput, setDataInput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter] = useState({
    year: DATE.getFullYear(),
    month: DATE.getMonth() + 1,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [reload, setReload] = useState(0);
  const KeyStore = `KAIZEN_INPUTIDEA`;

  const loadDataMain = async () => {
    const params = {
      shopId: 0,
      reportId: kpiinfo.id,
      typeReport: 'LOADDATA',
      month: filter.month,
      year: filter.year,
    };
    await REPORT.GetDataReportByShop_RealTime(params, mData => {
      setDataMain(normalizeKaizenList(mData || []));
    });
  };
  const loadDataInput = async () => {
    const params = {
      shopId: 0,
      reportId: kpiinfo.id,
      typeReport: 'LISTINPUT',
      month: filter.month,
      year: filter.year,
    };
    await REPORT.GetDataReportByShop_RealTime(params, mData => {
      setDataInput(mData || []);
    });
  };
  const onBack = () => {
    navigation.goBack();
  };
  const onInputData = () => {
    setIsVisible(true);
  };
  const onCloseModal = () => {
    setIsVisible(false);
  };
  const validData = async itemInput => {
    for (let index = 0; index < dataInput.length; index++) {
      const item = dataInput[index];
      if (item.isRequired == 1) {
        if (item.ref_Code == 'text') {
          if (
            itemInput[item.ref_Name] == null ||
            itemInput[item.ref_Name] == '' ||
            itemInput[item.ref_Name].length < 10
          ) {
            toastError(
              'Dữ liệu bắt buộc',
              `Dữ liệu "${item.nameVN}" là bắt buộc và lớn hơn 10 ký tự, vui lòng kiểm tra lại!`,
            );
            return false;
          }
        }
        if (item.ref_Code == 'select') {
          if (
            itemInput[item.ref_Name] == null ||
            Object.keys(itemInput[item.ref_Name]).length === 0
          ) {
            toastError(
              'Dữ liệu bắt buộc',
              `Dữ liệu "${item.nameVN}" là bắt buộc, vui lòng kiểm tra lại!`,
            );
            return false;
          }
          const itemSelect = JSON.parse(itemInput[item.ref_Name] || '{}');
          if (
            itemSelect.id == 100 &&
            (itemInput[item.links] == null ||
              itemInput[item.links] == '' ||
              itemInput[item.links].length < 5)
          ) {
            toastError(
              'Dữ liệu bắt buộc',
              `Dữ liệu "${item.nameVN}" bạn chọn là "Khác", vui lòng nhập thông tin và lớn hơn 5 ký tự!`,
            );
            return false;
          }
        }
        if (item.ref_Code == 'image') {
          const listPhotoLocal =
            (await getDataPhotos(
              userinfo.employeeId,
              TODAY,
              null,
              kpiinfo.id,
              itemInput.guid,
              false,
            )) || [];
          if (
            !listPhotoLocal ||
            listPhotoLocal.length == 0 ||
            listPhotoLocal.length < (item.numberValue || 1)
          ) {
            toastError(
              'Dữ liệu bắt buộc',
              `Số lượng "${item.nameVN}" không đủ, vui lòng kiểm tra lại(${listPhotoLocal.length
              }/${item.numberValue || 1})!`,
            );
            return false;
          }
        }
      }
    }
    return true;
  };
  const onSubmit = async () => {
    const localStore = await AsyncStorage.getItem(KeyStore);
    const itemInput = JSON.parse(localStore);
    if (!itemInput) {
      alertError('Bạn chưa nhập dữ liệu , vui lòng kiểm tra lại!');
      return;
    }
    const isValid = await validData(itemInput);
    if (!isValid) return;
    const isNetwork = await checkNetwork();
    if (!isNetwork) {
      alertError(
        'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
      );
      return;
    }
    alertConfirm(
      'Gửi thông tin',
      'Bạn có chắc chắn muốn gửi thông tin không ?',
      async () => {
        await setLoading(true);
        const shop = { shopId: userinfo.employeeId, auditDate: TODAY };
        const result = await REPORT.UploadDataRaw_Realtime(
          itemInput,
          shop,
          kpiinfo.id,
        );
        if (result.statusId == 200) {
          toastSuccess(
            'Thông báo',
            result.messager || 'Gửi đề xuất thành công',
          );
          await removeStore(KeyStore);
          setReload(r => r + 1);
          setIsVisible(false);
          await loadDataMain();
        } else {
          await alertError(result.messager);
        }
        await setLoading(false);
      },
    );
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDataMain(), loadDataInput()]).finally(() =>
      setLoading(false),
    );
  }, []);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.primary },
    contentMain: { flex: 1, backgroundColor: appcolor.light },
    headerTab: { backgroundColor: appcolor.primary },
  });
  const addButtonBottom = Math.max(32, insets.bottom);

  return (
    <View style={styles.mainContainer}>
      <HeaderCustom title={kpiinfo.menuNameVN} leftFunc={onBack} />
      <View style={styles.contentMain}>
        <SurveyListScreen data={dataMain} />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            position: 'absolute',
            zIndex: 10,
            right: 28,
            bottom: addButtonBottom,
          }}
          onPress={onInputData}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              opacity: 1,
              borderRadius: 40,
              padding: 12,
              backgroundColor: appcolor.primary,
            }}
          >
            <SpiralIcon
              size={24}
              name="add"
              type="fontawe-some-5"
              color={appcolor.light}
            />
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isVisible}
        animationType="fade"
        statusBarTranslucent
        backdropColor={appcolor.black}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ alignContent: 'center' }}
                onPress={onCloseModal}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: 1,
                    borderRadius: 40,
                    padding: 12,
                  }}
                >
                  <SpiralIcon
                    name="arrow-left"
                    type="fontawe-some-5"
                    color={appcolor.primary}
                    size={28}
                  />
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: fontWeightBold,
                  color: appcolor.dark,
                }}
              >
                Nhập thông tin
              </Text>
            </View>
            {dataInput.length > 0 && (
              <InputIdea
                key={`kaizen_input_${reload}_${isVisible ? 'open' : 'close'}`}
                dataInput={dataInput}
                reload={reload}
              />
            )}
            <TouchableOpacity
              style={{
                position: 'absolute',
                zIndex: 10,
                bottom: addButtonBottom,
                width: '100%',
              }}
              onPress={onSubmit}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: 1,
                  borderRadius: 40,
                  padding: 12,
                  backgroundColor: appcolor.primary,
                  marginHorizontal: 20,
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: appcolor.light,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: fontWeightBold,
                  }}
                >
                  Gửi đề xuất
                </Text>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};
export default HomeKaizen;
