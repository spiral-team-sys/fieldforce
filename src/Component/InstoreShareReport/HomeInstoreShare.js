import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { Text } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { Platform } from 'react-native';
import { _competitorId } from '../../Core/URLs';
import RNFS from 'react-native-fs';
import { deviceWidth, scaleSize } from '../../Themes/AppsStyle';
import { ItemHomeResRow } from './ItemHomeResRow';
import { Icon } from '@rneui/themed';
import { ReportInstoreShare } from './ReportInstoreShare';
import { Message, ToastError, ToastSuccess } from '../../Core/Helper';
import {
  getInstoreShareByShop,
  sendInstoreShareByShop,
} from '../../Controller/SellOutController';
import { LoadingView } from '../../Control/ItemLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const HomeInstoreShare = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [data, setData] = useState({
    dataCategory: '',
    dataCompetitor: '',
    dataByMonth: [],
  });
  const [filterMonth, setFilterMonth] = useState({
    year: new Date().getFullYear(),
    yearname: `Năm ${new Date().getFullYear()}`,
    month: new Date().getMonth() + 1,
    monthname: `Tháng ${new Date().getMonth() + 1}`,
    loadYearMonth: false,
    jsonFilter: {},
  });
  const [isVisible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const loadData = async () => {
    await setLoading(true);
    const dataByShop = await getInstoreShareByShop({
      shopId: shopinfo.shopId,
      year: filterMonth.year,
      month: filterMonth.month,
    });
    console.log(dataByShop, 'filterMonth.monthfilterMonth.month');
    if (dataByShop !== null) {
      const listByMonth = JSON.parse(dataByShop?.data[0]?.listByMonth || '[]');
      setData({
        dataCategory: dataByShop?.data[0]?.listCategory || '[]',
        dataCompetitor: dataByShop?.data[0]?.listCompetitor || '[]',
        dataByMonth: listByMonth,
      });
    }
    await setLoading(false);
  };
  const onFilterChange = search => {
    if (search.year && search.month) {
      setFilterMonth({ ...search });
    }
  };
  const submitSearch = async () => {
    await loadData();
    await SheetManager.hide('SheetInstoreShare');
  };
  const handleCloseModal = () => {
    loadData();
    setVisible(false);
  };
  const handleDeleteItem = async item => {
    Message('Chú ý', `Bạn có chắc chắn muốn xoá?`, async () => {
      await sendInstoreShareByShop({ ...item, typeSend: 'DELETE' }, result => {
        if (result.status == 200) {
          ToastSuccess('Đã xoá', 'Thông báo', 'top');
          loadData();
        } else {
          ToastError('Xảy ra lỗi khi xoá dữ liệu', 'Thông báo', 'top');
        }
      });
    });
  };
  useEffect(() => {
    const _Load = loadData();
    return () => _Load;
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        leftFunc={() => navigation.goBack()}
        title="Báo cáo số bán"
        iconRight="cloud-upload-alt"
        iconMiddle="filter"
        middleFunc={() => SheetManager.show('SheetInstoreShare')}
      // rightFunc={(this.state.lockReport) ? null : () => this.uploadSellout()}
      />
      <LoadingView isLoading={isLoading} title={'Đang cập nhật dữ liệu'} />
      {!isLoading && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={data.dataByMonth}
            renderItem={({ item, index }) => (
              <ItemHomeResRow
                item={item}
                index={index}
                handleDelete={handleDeleteItem}
              />
            )}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            ListFooterComponent={<View style={{ height: deviceWidth / 2 }} />}
          />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              position: 'absolute',
              zIndex: 10,
              right: 12,
              bottom: 30,
            }}
            // disabled={this.state.idHaveNosell === false ? false : true}
            onPress={() => setVisible(true)}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center', //, opacity: idHaveNosell === false ? 1 : 0.3,
                borderRadius: 30,
                backgroundColor: appcolor.primary,
              }}
            >
              {/* s */}
              <SpiralIcon
                raised
                size={20}
                name="add-circle-outline"
                type="ionicon"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={isVisible} animationType="fade">
        <ReportInstoreShare
          closeModal={handleCloseModal}
          dataCategory={JSON.parse(data.dataCategory || '[]')}
          dataCompetitor={JSON.parse(data.dataCompetitor || '[]')}
        />
      </Modal>
      <ActionSheet
        id={'SheetInstoreShare'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View style={{ height: 200 }}>
          <YearMonthSelected
            option={filterMonth}
            onYearMonth={search => onFilterChange(search)}
            numMonth={4}
          />
        </View>
        <TouchableOpacity
          onPress={() => submitSearch()}
          style={{
            marginBottom: 12,
            borderTopWidth: 0.31,
            borderTopColor: appcolor.primary,
          }}
        >
          <Text
            style={{
              padding: 12,
              textAlign: 'center',
              color: appcolor.primary,
            }}
          >
            Áp dụng
          </Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
  );
};
