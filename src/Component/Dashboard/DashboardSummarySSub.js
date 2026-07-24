import React, { useEffect, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { LoadingView } from '../../Control/ItemLoading';
import { YearMonthSelected } from '../../Control/YearMonthSelected';
import { DataDetailSummarySSub } from '../../Controller/DashboardController';
import { ToastError } from '../../Core/Helper';
import { deviceWidth } from '../Home';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DATE = new Date();

export const DashboardSummarySSub = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState({ dataSummary: [], dataSummaryF: [] });
  var [monthFilter, setMonthFilter] = useState({
    year: DATE.getFullYear(),
    yearname: `Năm ${DATE.getFullYear()}`,
    month: DATE.getMonth() + 1,
    monthname: `Tháng ${DATE.getMonth() + 1}`,
  });
  const [search, setSearch] = useState('');

  const loadData = async () => {
    await setLoading(true);
    // const dataJson = jsonCalendar || JSON.stringify({ year: moment().year(), month: moment().month() + 1 })
    const dataJson = {
      year: monthFilter.year,
      month: monthFilter.month,
      shopId: shopinfo.shopId,
    };
    await DataDetailSummarySSub(dataJson, async result => {
      if (result.statusId === 200) {
        setData({ dataSummary: result.data, dataSummaryF: result.data });
      } else {
        ToastError(result.messager);
      }
    });
    await setLoading(false);
  };

  useEffect(() => {
    loadData();
    return () => false;
  }, []);

  const handleChooseMonth = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await loadData();
    await SheetManager.hide('sheetYearSSub');
  };

  const onFilterChange = searchInfo => {
    setMonthFilter({ ...monthFilter, ...searchInfo });
  };

  const renderItem = ({ item, index }) => {
    // const lastStock = ((item.fistStock || 0) + (item.sellInByMonth || 0)) - (item.sellOutByMonth || 0)

    return (
      <View
        style={{
          minHeight: 30,
          flexDirection: 'row',
          paddingTop: 5,
          paddingHorizontal: 5,
          width: deviceWidth,
          marginTop: index == 0 ? 10 : 0,
        }}
      >
        <View
          style={{
            width: '40%',
            backgroundColor:
              index % 2 == 0 ? appcolor.homebackground : appcolor.light,
            justifyContent: 'center',
            paddingLeft: 5,
          }}
        >
          <Text
            style={{ fontWeight: '400', fontSize: 12, color: appcolor.dark }}
          >
            {item.productName}
          </Text>
        </View>
        {/* <View style={{ height: '80%', width: 0.6, backgroundColor: index % 2 == 0 ? appcolor.light : appcolor.surface }}></View> */}
        <View
          style={{
            width: '15%',
            backgroundColor:
              index % 2 == 0 ? appcolor.homebackground : appcolor.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            {item.fistStock == 0 ? 0 : item.fistStock || '-'}
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor:
              index % 2 == 0 ? appcolor.homebackground : appcolor.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            {item.sellOutByMonth == 0 ? 0 : item.sellOutByMonth || '-'}
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor:
              index % 2 == 0 ? appcolor.homebackground : appcolor.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            {item.sellInByMonth == 0 ? 0 : item.sellInByMonth || '-'}
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor:
              index % 2 == 0 ? appcolor.homebackground : appcolor.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            {item.lastStock == 0 && item.fistStock !== null
              ? 0
              : item.lastStock || '-'}
          </Text>
        </View>
      </View>
    );
  };
  const TitleDashboard = () => {
    return (
      <View
        style={{
          minHeight: 30,
          marginTop: 10,
          paddingHorizontal: 5,
          flexDirection: 'row',
          width: deviceWidth,
        }}
      >
        <View
          style={{
            width: '40%',
            paddingVertical: 5,
            backgroundColor: appcolor.homebackground,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 13,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            Sản phẩm
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor: appcolor.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 13,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            Đầu kì
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor: appcolor.homebackground,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 13,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            SellOut
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor: appcolor.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 13,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            SellIn
          </Text>
        </View>
        <View
          style={{
            width: '15%',
            backgroundColor: appcolor.homebackground,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 13,
              color: appcolor.dark,
              textAlign: 'center',
            }}
          >
            Cuối kì
          </Text>
        </View>
      </View>
    );
  };
  const filterProduct = async text => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (text) {
      const newDataShow = data.dataSummaryF.filter(it => {
        const nameProduct = it.productName
          ? it.productName.toUpperCase()
          : ''.toUpperCase();
        const textSearch = text.toUpperCase();
        return nameProduct.indexOf(textSearch) > -1;
      });
      data.dataSummary = newDataShow;
      setSearch(text);
    } else {
      data.dataSummary = data.dataSummaryF;
      setSearch(text);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.surface }}>
      <HeaderCustom
        title={
          shopinfo?.shopName +
          ' (' +
          monthFilter.month +
          '/' +
          monthFilter.year +
          ')'
        }
        leftFunc={() => navigation.goBack()}
        iconRight="calendar-alt"
        rightFunc={() => SheetManager.show('sheetYearSSub')}
      />
      <View style={{ flex: 1 }}>
        <FormGroup
          containerStyle={{
            backgroundColor: appcolor.light,
            margin: 8,
            marginBottom: 0,
            alignSelf: 'center',
          }}
          inputStyle={{ fontSize: 13, color: appcolor.dark }}
          placeholder="Tìm kiếm sản phẩm"
          editable
          onClearTextAndroid={filterProduct}
          iconName="search"
          value={search}
          handleChangeForm={filterProduct}
        />
        <TitleDashboard />

        <LoadingView isLoading={isLoading} title="Đang đồng bộ dữ liệu" />

        {!isLoading && (
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            data={data.dataSummary}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            initialNumToRender={20}
            ListFooterComponent={<View style={{ height: deviceWidth / 2 }} />}
          />
        )}
      </View>
      <ActionSheet
        id="sheetYearSSub"
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <YearMonthSelected
          option={monthFilter}
          onYearMonth={search => onFilterChange(search)}
          numMonth={4}
        />
        <TouchableOpacity
          onPress={() => handleChooseMonth()}
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
