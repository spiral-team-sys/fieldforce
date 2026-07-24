import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { uploadProfileShop } from '../../Controller/ShopController';
import {
  formatPhone,
  isPhone,
  Message,
  removeVietnameseTones,
  ToastError,
} from '../../Core/Helper';
import { checkNetwork, deviceHeight, deviceWidth } from '../../Core/Utility';
import dvhcvn from '../../Themes/filedata/dvhcvn.json';

const PROVINCE = 'Tỉnh/Thành phố';
const DISTRICT = 'Quận/Huyện';
const TOWN = 'Phường/Xã';

export const UploadShopInfo = ({ navigation, route }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [visibleModalAddress, setVisibleModalAddress] = useState(false);
  const [typeModal, setTypeModal] = useState('');
  const [shopinfo, setShopInfo] = useState(route.params?.shopinfo);
  const [dataModalAddress, setDataModalAddress] = useState({
    dataProvince: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
    dataDistrict: [],
    dataTown: [],
    dataProvinceF: JSON.parse(JSON.stringify(dvhcvn?.data || [])),
    dataDistrictF: [],
    dataTownF: [],
  });

  useEffect(() => {
    loadAddress(route.params?.shopinfo);
    return () => false;
  }, []);

  const loadAddress = async shopinfo => {
    let dataProvince = {};
    let dataDistrict = {};
    let dataTown = {};
    if (
      shopinfo.province !== null &&
      shopinfo.province !== 'null' &&
      shopinfo.province.length > 0
    ) {
      dataProvince = JSON.parse(JSON.stringify(dvhcvn?.data || [])).find(
        it => it.name === shopinfo.province,
      );
      if (
        shopinfo.district !== null &&
        shopinfo.district !== 'null' &&
        shopinfo.district.length > 0 &&
        dataProvince !== undefined &&
        Object.keys(dataProvince).length > 0
      ) {
        dataDistrict = JSON.parse(JSON.stringify(dataProvince.level2s)).find(
          it => it.name === shopinfo.district,
        );
        if (
          shopinfo.town !== null &&
          shopinfo.town !== 'null' &&
          shopinfo.town.length > 0 &&
          dataDistrict !== undefined &&
          Object.keys(dataDistrict).length > 0
        ) {
          dataTown = JSON.parse(JSON.stringify(dataDistrict.level3s)).find(
            it => it.name === shopinfo.town,
          );
        }
      }
    }
    setDataModalAddress({
      ...dataModalAddress,
      dataDistrict: dataProvince?.level2s || [],
      dataDistrictF: dataProvince?.level2s || [],
      dataTown: dataDistrict?.level3s || [],
      dataTownF: dataDistrict?.level3s || [],
    });
    setShopInfo({
      ...shopinfo,
      provinceCode: dataProvince?.level1_id || null,
      districtCode: dataDistrict?.level2_id || null,
      townCode: dataTown?.level3_id || null,
    });
  };

  const uploadAction = async () => {
    if (!shopinfo?.provinceCode) {
      ToastError(
        `Bạn chưa chọn ${PROVINCE}, vui lòng chọn ${PROVINCE} trước khi gửi!!`,
      );
      return;
    }
    if (!shopinfo?.districtCode) {
      ToastError(
        `Bạn chưa chọn ${DISTRICT}, vui lòng chọn ${DISTRICT} trước khi gửi!!`,
      );
      return;
    }
    if (!shopinfo?.townCode) {
      ToastError(
        `Bạn chưa chọn ${TOWN}, vui lòng chọn ${TOWN} trước khi gửi!!`,
      );
      return;
    }

    Message(
      'Chú ý',
      'Bạn có chắc chắn muốn cập nhật dữ liệu cửa hàng ?',
      async () => {
        // 24
        const work = {
          shopId: shopinfo.shopId,
          workDate: parseInt(moment(new Date()).format('YYYYMMDD')),
          reportId: 24,
        };
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
          ToastError(
            'Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.',
          );
          return;
        }
        const shopUpdate = [{ ...shopinfo }];
        await uploadProfileShop(
          shopUpdate,
          work,
          async () => {
            await navigation.goBack();
          },
          async () => {},
        );
        // console.log(shopUpdate);
      },
    );
  };

  const onEditShopinfo = (text, shopField) => {
    let itemShop = { ...shopinfo, [shopField]: text };
    if (shopField === 'storeSize') {
      let value =
        text !== null && text.length > 0
          ? text.toString().replace(/,/g, '')
          : '';
      let intValue = value === '' ? null : parseInt(value);
      itemShop = { ...itemShop, storeSize: intValue };
    }
    setShopInfo(itemShop);
  };
  const onEndEditShopinfo = async (text, shopField) => {
    const shop = (await route.params?.shopinfo) || {};
    let itemShop = { ...shopinfo, [shopField]: text };
    if (shopField === 'email' && text.length > 0) {
      if (text.includes(' ')) {
        ToastError('Email không được nhập khoảng trắng!', 'Thông báo', 'top');
        itemShop[shopField] = shop[shopField];
        setShopInfo(itemShop);
        return;
      } else if (!text.includes('@')) {
        ToastError('Email không đúng định dạng !', 'Thông báo', 'top');
        itemShop[shopField] = shop[shopField];
        setShopInfo(itemShop);
        return;
      }
    }
    if (shopField === 'phone') {
      const checkPhone = isPhone(shopinfo.phone || '');
      if (!checkPhone) {
        ToastError('Số điện thoại không đúng định dạng', 'Thông báo', 'top');
        itemShop[shopField] = shop[shopField];
        setShopInfo(itemShop);
        return;
      } else {
        itemShop[shopField] = shopinfo.phone;
        setShopInfo(itemShop);
        return;
      }
    }
    setShopInfo(itemShop);
  };

  const onSelectAddress = async (item, itemField, type) => {
    try {
      const shop = (await route.params?.shopinfo) || {};
      const isSelect =
        item.name?.toLowerCase() === shopinfo[itemField]?.toLowerCase();
      let itemShop = {
        ...shopinfo,
        [itemField]: isSelect ? shop[itemField] : item.name,
      };
      if (type === PROVINCE) {
        const level2s = item?.level2s || [];
        setDataModalAddress({
          ...dataModalAddress,
          dataDistrict: JSON.parse(JSON.stringify(level2s)),
          dataDistrictF: JSON.parse(JSON.stringify(level2s)),
          dataTown: [],
          dataTownF: [],
        });
        setShopInfo({
          ...itemShop,
          district: null,
          town: null,
          districtCode: null,
          townCode: null,
          provinceCode: item.level1_id,
        });
        setTypeModal(DISTRICT);
      } else if (type === DISTRICT) {
        const level3s = item?.level3s || [];
        setDataModalAddress({
          ...dataModalAddress,
          dataTown: JSON.parse(JSON.stringify(level3s)),
          dataTownF: JSON.parse(JSON.stringify(level3s)),
        });
        setShopInfo({
          ...itemShop,
          town: null,
          townCode: null,
          districtCode: item.level2_id,
        });
        setTypeModal(TOWN);
      } else {
        setShopInfo({
          ...itemShop,
          townCode: item.level3_id,
          townType: item.type,
        });
        setTypeModal('');
        setVisibleModalAddress(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onFilterModalAddress = (value, type, searchTitle, dataTitle) => {
    let dataFilter = [];
    if (value !== null && value !== undefined && value.length > 0) {
      dataFilter = dataModalAddress[
        type === PROVINCE
          ? 'dataProvinceF'
          : type === DISTRICT
          ? 'dataDistrictF'
          : 'dataTownF'
      ].filter(i =>
        removeVietnameseTones(i.name.toLowerCase()).match(
          removeVietnameseTones(value.toLowerCase()),
        ),
      );
    } else {
      dataFilter =
        dataModalAddress[
          type === PROVINCE
            ? 'dataProvinceF'
            : type === DISTRICT
            ? 'dataDistrictF'
            : 'dataTownF'
        ];
    }
    setDataModalAddress({
      ...dataModalAddress,
      [searchTitle]: value,
      [dataTitle]: dataFilter,
    });
  };
  const openSheet = (type, value) => {
    if (type === PROVINCE) {
      setTypeModal(PROVINCE);
      setVisibleModalAddress(value);
    } else if (type === DISTRICT) {
      setTypeModal(DISTRICT);
      setVisibleModalAddress(value);
    } else if (type === TOWN) {
      setTypeModal(TOWN);
      setVisibleModalAddress(value);
    }
  };
  const sheetGoBack = type => {
    if (type === DISTRICT) {
      setTypeModal(PROVINCE);
    } else if (type === TOWN) {
      setTypeModal(DISTRICT);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={'cập nhật thông tin cửa hàng'}
        iconRight={'cloud-upload-alt'}
        leftFunc={() => {
          navigation.goBack();
        }}
        rightFunc={() => uploadAction()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flex: 1, paddingTop: 10 }}>
            <View
              style={{
                padding: 5,
                paddingBottom: 150,
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <FormGroup title="Mã cửa hàng" value={shopinfo.shopCode} />
              <FormGroup
                title="Cửa hàng"
                value={shopinfo.shopName}
                editable
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập tên cửa hàng '}
                handleChangeForm={text => onEditShopinfo(text, 'shopName')}
                onEndEditing={e =>
                  onEndEditShopinfo(e.nativeEvent.text, 'shopName')
                }
              />
              <FormGroup
                key="province"
                title="Tỉnh/TP"
                placeholderTextColor={appcolor.greydark}
                placeholder={'Chọn Tỉnh/TP'}
                value={shopinfo.province}
                iconRight={'caret-down'}
                rightFunc={() => openSheet(PROVINCE, true)}
              />
              <FormGroup
                key="district"
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập quận/huyện'}
                title="Quận/huyện"
                value={shopinfo.district}
                iconRight={'caret-down'}
                rightFunc={() => openSheet(DISTRICT, true)}
              />
              <FormGroup
                key="town"
                title="Phường/xã"
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập phường/xã'}
                value={shopinfo.town}
                iconRight={'caret-down'}
                rightFunc={() => openSheet(TOWN, true)}
              />
              <FormGroup
                key="address"
                editable={true}
                title="Số nhà/Đường"
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập số nhà/Đường'}
                value={shopinfo.address}
                handleChangeForm={text => onEditShopinfo(text, 'address')}
              />
              <FormGroup key="region" title="Khu vực" value={shopinfo.region} />
              <FormGroup key="area" title="Vùng" value={shopinfo.area} />
              <FormGroup
                key="storeSize"
                title="Diện tích"
                editable
                value={shopinfo.storeSize?.toString() || ''}
                keyboardType="numeric"
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập diện tích'}
                handleChangeForm={text => onEditShopinfo(text, 'storeSize')}
              />
              <FormGroup
                key="contactName"
                title="Người liên hệ"
                editable
                value={shopinfo.contactName}
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập tên người liên hệ'}
                handleChangeForm={text => onEditShopinfo(text, 'contactName')}
              />
              <FormGroup
                key="phone"
                title="Số điện thoại"
                value={formatPhone(shopinfo.phone || '')}
                keyboardType="numeric"
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập số điện thoại'}
                editable
                handleChangeForm={text => onEditShopinfo(text, 'phone')}
                onEndEditing={e =>
                  onEndEditShopinfo(e.nativeEvent.text, 'phone')
                }
              />
              <FormGroup
                key="email"
                title="Email"
                value={shopinfo.email}
                editable
                handleChangeForm={text => onEditShopinfo(text, 'email')}
                placeholderTextColor={appcolor.greydark}
                placeholder={'Nhập email'}
                onEndEditing={e =>
                  onEndEditShopinfo(e.nativeEvent.text, 'email')
                }
              />
            </View>
          </View>
          <Modal visible={visibleModalAddress} animationType="slide">
            <SafeAreaView
              style={{
                backgroundColor: appcolor.light,
                width: deviceWidth,
                height: deviceHeight,
                padding: 10,
                overflow: 'hidden',
              }}
            >
              {typeModal === PROVINCE && (
                <View
                  key={1}
                  style={{
                    flex: 1,
                    backgroundColor: appcolor.light,
                    padding: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => console.log('close')}
                      style={{ padding: 15 }}
                    ></TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: appcolor.dark,
                      }}
                    >
                      {PROVINCE}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openSheet(PROVINCE, false)}
                      style={{ padding: 15 }}
                    >
                      <SpiralIcon
                        type="font-awesome-5"
                        name="times"
                        size={20}
                        color={appcolor.dark}
                      />
                    </TouchableOpacity>
                  </View>
                  <FormGroup
                    iconName="search"
                    editable={true}
                    value={dataModalAddress?.searchProvince || ''}
                    placeholder="Tìm kiếm..."
                    handleChangeForm={text =>
                      onFilterModalAddress(
                        text,
                        PROVINCE,
                        'searchProvince',
                        'dataProvince',
                      )
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <FlatList
                      data={dataModalAddress?.dataProvince || []}
                      keyExtractor={(_, index) => index.toString()}
                      initialNumToRender={50}
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      renderItem={({ item, index }) => {
                        return (
                          <View key={index} style={{ margin: 5 }}>
                            <TouchableOpacity
                              disabled={false}
                              onPress={() =>
                                onSelectAddress(item, 'province', PROVINCE)
                              }
                              style={{
                                backgroundColor:
                                  item.name === shopinfo.province
                                    ? appcolor.darklight
                                    : 'transparent',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 10,
                              }}
                            >
                              <SpiralIcon
                                type="font-awesome-5"
                                name="map-marker-alt"
                                size={16}
                                color={appcolor.dark}
                              />
                              <Text
                                style={{
                                  fontSize: 16,
                                  marginLeft: 10,
                                  color: appcolor.dark,
                                }}
                              >
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              )}
              {typeModal === DISTRICT && (
                <View
                  key={1}
                  style={{
                    flex: 1,
                    backgroundColor: appcolor.light,
                    padding: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => sheetGoBack(DISTRICT)}
                      style={{ padding: 15 }}
                    >
                      <SpiralIcon
                        type="font-awesome-5"
                        name="arrow-left"
                        size={20}
                        color={appcolor.dark}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: appcolor.dark,
                      }}
                    >
                      {DISTRICT}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openSheet(DISTRICT, false)}
                      style={{ padding: 15 }}
                    >
                      <SpiralIcon
                        type="font-awesome-5"
                        name="times"
                        size={20}
                        color={appcolor.dark}
                      />
                    </TouchableOpacity>
                  </View>
                  <FormGroup
                    iconName="search"
                    editable={true}
                    value={dataModalAddress?.searchDistrict || ''}
                    placeholder="Tìm kiếm..."
                    handleChangeForm={text =>
                      onFilterModalAddress(
                        text,
                        DISTRICT,
                        'searchDistrict',
                        'dataDistrict',
                      )
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <FlatList
                      data={dataModalAddress?.dataDistrict || []}
                      keyExtractor={(_, index) => index.toString()}
                      showsHorizontalScrollIndicator={false}
                      initialNumToRender={50}
                      nestedScrollEnabled={true}
                      renderItem={({ item, index }) => {
                        return (
                          <View key={index} style={{ margin: 5 }}>
                            <TouchableOpacity
                              disabled={false}
                              onPress={() =>
                                onSelectAddress(item, 'district', DISTRICT)
                              }
                              style={{
                                backgroundColor:
                                  item.name === shopinfo.district
                                    ? appcolor.darklight
                                    : 'transparent',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 10,
                              }}
                            >
                              <SpiralIcon
                                type="font-awesome-5"
                                name="map-marker-alt"
                                size={16}
                                color={appcolor.dark}
                              />
                              <Text
                                style={{
                                  fontSize: 16,
                                  marginLeft: 10,
                                  color: appcolor.dark,
                                }}
                              >
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              )}
              {typeModal === TOWN && (
                <View
                  key={1}
                  style={{
                    flex: 1,
                    backgroundColor: appcolor.light,
                    padding: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => sheetGoBack(TOWN)}
                      style={{ padding: 15, backgroundColor: 'Red' }}
                    >
                      <SpiralIcon
                        type="font-awesome-5"
                        name="arrow-left"
                        size={20}
                        color={appcolor.dark}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: appcolor.dark,
                      }}
                    >
                      {TOWN}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openSheet(TOWN, false)}
                      style={{ padding: 15 }}
                    >
                      <SpiralIcon
                        type="font-awesome-5"
                        name="times"
                        size={20}
                        color={appcolor.dark}
                      />
                    </TouchableOpacity>
                  </View>
                  <FormGroup
                    iconName="search"
                    editable={true}
                    value={dataModalAddress?.searchTown || ''}
                    placeholder="Tìm kiếm..."
                    handleChangeForm={text =>
                      onFilterModalAddress(text, TOWN, 'searchTown', 'dataTown')
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <FlatList
                      data={dataModalAddress?.dataTown || []}
                      keyExtractor={(_, index) => index.toString()}
                      showsHorizontalScrollIndicator={false}
                      initialNumToRender={50}
                      nestedScrollEnabled={true}
                      renderItem={({ item, index }) => {
                        return (
                          <View key={index} style={{ margin: 5 }}>
                            <TouchableOpacity
                              disabled={false}
                              onPress={() =>
                                onSelectAddress(item, 'town', TOWN)
                              }
                              style={{
                                backgroundColor:
                                  item.name === shopinfo.town
                                    ? appcolor.darklight
                                    : 'transparent',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 10,
                              }}
                            >
                              <SpiralIcon
                                type="font-awesome-5"
                                name="map-marker-alt"
                                size={16}
                                color={appcolor.dark}
                              />
                              <Text
                                style={{
                                  fontSize: 16,
                                  marginLeft: 10,
                                  color: appcolor.dark,
                                }}
                              >
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              )}
            </SafeAreaView>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
