import { Icon, Text } from '@rneui/base';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import regionData from '../../../../Utils/Region/region.json';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { LocationAPI } from '../../../../API/LocationAPI';
import { LOCATION_INFO } from '../../../../Utils/LocationInfo';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const ItemAddress = ({ item, onUpdateItem }) => {
  const { appcolor, shopinfo } = useSelector(state => state.GAppState);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [addressInput, setAddressInput] = useState('');
  const [searchProvince, setSearchProvince] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('province');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const mapRef = useRef();
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState(null);

  const parseAddressValue = (value = '') => {
    if (!value)
      return {
        houseNumber: '',
        streetName: '',
        province: null,
        district: null,
      };
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch {
      return {
        houseNumber: '',
        streetName: '',
        province: null,
        district: null,
      };
    }
  };

  const getDisplayAddress = () => {
    const savedAddress = `${item?.Value || ''}`.trim();
    if (savedAddress) return savedAddress;
    if (!selectedProvince || !selectedDistrict || !addressInput) {
      return 'Chọn địa chỉ';
    }
    const parts = [addressInput, selectedDistrict.name, selectedProvince.name];
    return parts.filter(Boolean).join(', ');
  };

  const getRegionId = () => {
    const parsed = parseAddressValue(item?.Value);
    const regionId = Number(
      item?.regionId ??
        item?.RegionId ??
        parsed?.regionId ??
        parsed?.district?.level2_id,
    );
    return Number.isFinite(regionId) ? regionId : null;
  };

  const normalizeText = (value = '') => {
    return `${value}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const filteredProvinces = normalizeText(searchProvince)
    ? provinces.filter(x =>
        normalizeText(x?.name).includes(normalizeText(searchProvince)),
      )
    : provinces;

  const filteredDistricts = normalizeText(searchDistrict)
    ? districts.filter(x =>
        normalizeText(x?.name).includes(normalizeText(searchDistrict)),
      )
    : districts;

  const getItemCoordinate = () => {
    const parsed = parseAddressValue(item?.Value);
    const latitude = Number(
      item?.Latitude ??
        item?.latitude ??
        item?.Lat ??
        item?.lat ??
        parsed?.latitude ??
        parsed?.Latitude,
    );
    const longitude = Number(
      item?.Longitude ??
        item?.longitude ??
        item?.Lng ??
        item?.lng ??
        parsed?.longitude ??
        parsed?.Longitude,
    );
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  };

  const hasDetailedAddress = () => {
    return typeof item?.Value === 'string' && item.Value.trim().length > 0;
  };

  const getLocationFromAddress = async addressText => {
    return new Promise(resolve => {
      LocationAPI.getLocationPoint(addressText, resLocation => {
        const lat = Number(resLocation?.location?.lat);
        const lng = Number(resLocation?.location?.lng);
        const formattedAddress = `${resLocation?.address || ''}`.trim();
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          resolve({
            coordinate: { latitude: lat, longitude: lng },
            formattedAddress: formattedAddress || null,
          });
          return;
        }
        resolve({
          coordinate: null,
          formattedAddress: formattedAddress || null,
        });
      });
    });
  };

  const getMyLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(region);
        mapRef.current?.animateToRegion(region, 500);
      },
      () => {
        const itemCoordinate = getItemCoordinate();
        const regionId = getRegionId();
        if (itemCoordinate && (regionId || hasDetailedAddress())) {
          const region = {
            ...itemCoordinate,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setMapRegion(region);
          setMarkerCoordinate(itemCoordinate);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  };

  const openModal = () => {
    setModalStep('province');
    setSearchProvince('');
    setSearchDistrict('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const onSelectProvince = province => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setDistricts(province.level2s || []);
    setSearchDistrict('');
    setModalStep('district');
  };

  const onSelectDistrict = district => {
    setSelectedDistrict(district);
    setModalStep('address');
  };

  const goBackToProvinces = () => {
    setModalStep('province');
  };

  const goBackToDistricts = () => {
    setModalStep('district');
  };

  const completeAddress = async () => {
    if (isSavingAddress || !addressInput.trim()) return;

    setIsSavingAddress(true);
    try {
      const fullAddress = [
        addressInput.trim(),
        selectedDistrict?.name,
        selectedProvince?.name,
      ]
        .filter(Boolean)
        .join(', ');
      const apiResult = await getLocationFromAddress(fullAddress);
      const apiCoordinate = apiResult?.coordinate;
      const formattedAddress = apiResult?.formattedAddress;
      const fallbackCoordinate = getItemCoordinate();
      const finalCoordinate = apiCoordinate || fallbackCoordinate;
      const finalAddress = formattedAddress || fullAddress;
      const regionId = selectedDistrict?.level2_id || null;

      if (finalCoordinate) {
        const region = {
          ...finalCoordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(region);
        setMarkerCoordinate(finalCoordinate);
        mapRef.current?.animateToRegion(region, 500);
      }

      item.Value = finalAddress;
      setAddressInput(finalAddress);
      item.regionId = regionId;
      item.RegionId = regionId;
      if (finalCoordinate) {
        item.Latitude = finalCoordinate.latitude;
        item.Longitude = finalCoordinate.longitude;
        const shopLat = Number(shopinfo?.latitude);
        const shopLng = Number(shopinfo?.longitude);
        if (
          Number.isFinite(shopLat) &&
          Number.isFinite(shopLng) &&
          shopLat !== 0 &&
          shopLng !== 0
        ) {
          const distance = LOCATION_INFO.getDistance(
            shopLat,
            shopLng,
            finalCoordinate.latitude,
            finalCoordinate.longitude,
          );
          item.distance = distance > 0 ? distance : 1;
        } else {
          item.distance = null;
        }
      }
      onUpdateItem && onUpdateItem(item);
      closeModal();
    } finally {
      setIsSavingAddress(false);
    }
  };

  const onChangeAddressInput = text => {
    setAddressInput(text);
  };

  const moveToSelectedMarker = () => {
    if (!markerCoordinate) return;
    const region = {
      ...markerCoordinate,
      latitudeDelta: mapRegion.latitudeDelta || 0.01,
      longitudeDelta: mapRegion.longitudeDelta || 0.01,
    };
    setMapRegion(region);
    mapRef.current?.animateToRegion(region, 500);
  };

  useEffect(() => {
    setProvinces(regionData.data || []);
    const parsed = parseAddressValue(item?.Value);
    const regionId = getRegionId();
    let foundProv = null;
    let foundDist = null;

    if (regionId) {
      foundProv = (regionData.data || []).find(p =>
        (p.level2s || []).some(d => d.level2_id === regionId),
      );
      if (foundProv) {
        foundDist = (foundProv.level2s || []).find(
          d => d.level2_id === regionId,
        );
        setSelectedProvince(foundProv);
        setDistricts(foundProv.level2s || []);
        setSelectedDistrict(foundDist || null);
      }
    } else if (parsed.province) {
      // Backward compatibility for old JSON Value format.
      const oldProv = regionData.data.find(
        p => p.level1_id === parsed.province.level1_id,
      );
      if (oldProv) {
        setSelectedProvince(oldProv);
        setDistricts(oldProv.level2s || []);
        if (parsed.district) {
          const oldDist = oldProv.level2s.find(
            d => d.level2_id === parsed.district.level2_id,
          );
          if (oldDist) setSelectedDistrict(oldDist);
          foundProv = oldProv;
          foundDist = oldDist;
        }
      }
    }

    let initialInput = '';
    if (parsed.houseNumber || parsed.streetName) {
      initialInput = [parsed.houseNumber, parsed.streetName]
        .filter(Boolean)
        .join(', ');
    } else if (typeof item?.Value === 'string') {
      initialInput = item.Value;
      if (foundProv && foundDist) {
        const suffix = `, ${foundDist.name}, ${foundProv.name}`;
        if (initialInput.endsWith(suffix)) {
          initialInput = initialInput.slice(0, -suffix.length).trim();
        }
      }
    }
    setAddressInput(initialInput);

    const itemCoordinate = getItemCoordinate();
    if (itemCoordinate && (regionId || hasDetailedAddress())) {
      const region = {
        ...itemCoordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);
      setMarkerCoordinate(itemCoordinate);
    } else {
      setMarkerCoordinate(null);
      getMyLocation();
    }
  }, [item]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: appcolor.light },
    sectionHeader: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginTop: 12,
      marginBottom: 8,
    },
    selectorButton: {
      padding: 12,
      borderRadius: 8,
      borderColor: appcolor.grayLight,
      borderWidth: 0.5,
      backgroundColor: appcolor.white,
      marginTop: 8,
    },
    selectorButtonIncomplete: { borderColor: appcolor.red },
    selectorButtonText: { fontSize: 12, color: appcolor.dark },
    inputContainer: {
      padding: 10,
      borderRadius: 8,
      borderColor: appcolor.grayLight,
      borderWidth: 0.5,
      backgroundColor: appcolor.white,
      marginBottom: 8,
    },
    input: { fontSize: 12, color: appcolor.dark },
    buttonRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 },
    button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    saveButton: { backgroundColor: appcolor.primary },
    resetButton: { backgroundColor: appcolor.greydark },
    buttonText: {
      fontSize: 12,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
    },
    displayAddress: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      marginTop: 8,
      borderColor: appcolor.greydark,
      borderWidth: 0.5,
    },
    displayAddressLabel: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.dark,
      marginBottom: 4,
    },
    displayAddressText: { fontSize: 12, color: appcolor.dark },
    // Modal styles
    modalBackdrop: { flex: 1 },
    modalContent: {
      flex: 1,
      backgroundColor: appcolor.white,
      overflow: 'hidden',
    },
    modalHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: appcolor.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 13,
      fontWeight: fontWeightBold,
      color: appcolor.white,
      flex: 1,
    },
    modalCloseButton: { padding: 6, marginLeft: 12 },
    modalCloseIcon: {
      fontSize: 18,
      color: appcolor.white,
      fontWeight: fontWeightBold,
    },
    listItem: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 0.5,
    },
    listItemText: { fontSize: 13, color: appcolor.dark },
    listItemSelected: {
      fontWeight: fontWeightBold,
      color: appcolor.primary,
      backgroundColor: appcolor.surface,
    },
    modalFooter: {
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 0 : 16,
      paddingHorizontal: 16,
      borderTopColor: appcolor.grayLight,
      borderTopWidth: 1,
      backgroundColor: appcolor.light,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    backButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: appcolor.blacklight,
    },
    backButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: appcolor.white,
      textAlign: 'center',
    },
    modalInputContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 0.5,
    },
    modalInput: {
      fontSize: 13,
      color: appcolor.dark,
      minHeight: 38,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderColor: appcolor.grayLight,
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: appcolor.white,
    },
    modalInputError: { borderColor: appcolor.red, borderWidth: 1 },
    buttonContainerRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 20,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
    },
    primaryButtonDisabled: { opacity: 0.7 },
    secondaryButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      borderColor: appcolor.blacklight,
      borderWidth: 1,
      alignItems: 'center',
    },
    loadingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    addressResultContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: appcolor.surface,
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 10,
      borderLeftColor: appcolor.primary,
      borderLeftWidth: 3,
    },
    addressResultLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: appcolor.greydark,
      marginBottom: 6,
    },
    addressResultText: {
      fontSize: 12,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
    },
    searchWrapper: {
      paddingHorizontal: 8,
      paddingTop: 4,
      borderBottomColor: appcolor.grayLight,
      borderBottomWidth: 0.5,
    },
    cardViewMap: {
      backgroundColor: appcolor.surface,
      width: '100%',
      height: 250,
      borderRadius: 8,
      marginTop: 8,
      borderColor: appcolor.grayLight,
      borderWidth: 0.5,
      overflow: 'hidden',
    },
    moveMarkerButton: {
      position: 'absolute',
      right: 10,
      top: 10,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: appcolor.white,
      borderColor: appcolor.grayLight,
      borderWidth: 0.8,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    moveMarkerButtonDisabled: { opacity: 0.5 },
  });

  const renderProvinceItem = ({ item }) => {
    const isSelected = selectedProvince?.level1_id === item.level1_id;
    return (
      <TouchableOpacity
        onPress={() => onSelectProvince(item)}
        style={[styles.listItem, isSelected && styles.listItemSelected]}
      >
        <Text
          style={[styles.listItemText, isSelected && styles.listItemSelected]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderDistrictItem = ({ item }) => {
    const isSelected = selectedDistrict?.level2_id === item.level2_id;
    return (
      <TouchableOpacity
        onPress={() => onSelectDistrict(item)}
        style={[styles.listItem, isSelected && styles.listItemSelected]}
      >
        <Text
          style={[styles.listItemText, isSelected && styles.listItemSelected]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      {/* Main Address Button */}
      <TouchableOpacity
        onPress={openModal}
        style={[
          styles.selectorButton,
          !item?.Value && styles.selectorButtonIncomplete,
        ]}
      >
        <Text style={styles.selectorButtonText}>
          {item?.Value ? getDisplayAddress() : 'Nhấn để chọn địa chỉ'}
        </Text>
      </TouchableOpacity>
      {/* // MapView */}
      <View style={styles.cardViewMap}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          zoomEnabled
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton={false}
          scrollingEnabled
        >
          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              title={'Vị trí tìm kiếm'}
              description={getDisplayAddress()}
            />
          )}
        </MapView>
        {markerCoordinate && (
          <TouchableOpacity
            onPress={moveToSelectedMarker}
            style={styles.moveMarkerButton}
          >
            <SpiralIcon
              name="my-location"
              type="material-icons"
              size={20}
              color={appcolor.dark}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* Modal for selecting Province and District */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        statusBarTranslucent={false}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalStep === 'province'
                    ? 'Chọn Tỉnh/Thành phố'
                    : modalStep === 'district'
                    ? `Chọn Quận/Huyện/Phường - ${selectedProvince?.name}`
                    : `Nhập Địa Chỉ - ${selectedDistrict?.name}, ${selectedProvince?.name}`}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Content Based on Step */}
              {modalStep === 'address' ? (
                <View style={{ flex: 1 }}>
                  <View style={styles.modalInputContainer}>
                    <Text style={styles.addressResultLabel}>
                      Số nhà, Tên đường
                    </Text>
                    <TextInput
                      placeholder="VD: 123 Nguyễn Huệ"
                      value={addressInput}
                      onChangeText={onChangeAddressInput}
                      style={[
                        styles.modalInput,
                        !addressInput && styles.modalInputError,
                      ]}
                      placeholderTextColor={appcolor.placeholderText}
                    />
                  </View>
                  <View style={styles.addressResultContainer}>
                    <Text style={styles.addressResultLabel}>Xem trước:</Text>
                    <Text style={styles.addressResultText}>
                      {[
                        addressInput,
                        selectedDistrict?.name,
                        selectedProvince?.name,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'Chưa nhập địa chỉ'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.buttonContainerRow,
                      { justifyContent: 'space-between' },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={goBackToDistricts}
                      style={[
                        styles.secondaryButton,
                        { flex: 0, minWidth: 100 },
                      ]}
                    >
                      <Text style={styles.buttonText}>Quay lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={completeAddress}
                      disabled={isSavingAddress}
                      style={[
                        styles.primaryButton,
                        { flex: 0, minWidth: 120 },
                        isSavingAddress && styles.primaryButtonDisabled,
                      ]}
                    >
                      {isSavingAddress ? (
                        <View style={styles.loadingContent}>
                          <ActivityIndicator
                            size="small"
                            color={appcolor.white}
                          />
                          <Text
                            style={[
                              styles.buttonText,
                              { color: appcolor.white },
                            ]}
                          >
                            Đang xử lý...
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[styles.buttonText, { color: appcolor.white }]}
                        >
                          Hoàn tất
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <View style={styles.searchWrapper}>
                    <SearchData
                      placeholder={
                        modalStep === 'province'
                          ? 'Tìm tỉnh/thành phố'
                          : 'Tìm quận/huyện/phường'
                      }
                      value={
                        modalStep === 'province'
                          ? searchProvince
                          : searchDistrict
                      }
                      onSearchData={
                        modalStep === 'province'
                          ? setSearchProvince
                          : setSearchDistrict
                      }
                    />
                  </View>
                  <CustomListView
                    data={
                      modalStep === 'province'
                        ? filteredProvinces
                        : filteredDistricts
                    }
                    renderItem={
                      modalStep === 'province'
                        ? renderProvinceItem
                        : renderDistrictItem
                    }
                    extraData={[
                      modalStep,
                      selectedProvince,
                      selectedDistrict,
                      searchProvince,
                      searchDistrict,
                    ]}
                    bottomView={{ paddingBottom: 0 }}
                  />
                  {modalStep === 'district' && (
                    <View style={styles.modalFooter}>
                      <TouchableOpacity
                        onPress={goBackToProvinces}
                        style={styles.backButton}
                      >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

export default ItemAddress;
