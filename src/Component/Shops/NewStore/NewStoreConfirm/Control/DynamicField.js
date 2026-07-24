import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import FormGroup from '../../../../../Content/FormGroup';
import { MutipleItemSelected } from '../../../../../Control/MutipleItemSelected';
import RegionUpdate from '../../../../../Control/RegionControl/RegionUpdate';
import PhotoField from './PhotoField';
import {
  getSelectedLabel,
  getSelectedOptions,
  getSelectedValue,
} from '../StoreRequestUtils';

const getFieldIcon = item => {
  switch (item.Ref_Code) {
    case 'phone':
      return 'phone-alt';
    case 'number':
      return 'hashtag';
    case 'link':
      return 'link';
    case 'selected':
      return 'list-ul';
    case 'shop':
      return 'store';
    case 'gps':
      return 'map-marker-alt';
    case 'region':
      return 'map-marked-alt';
    default:
      return item.IconName || 'align-left';
  }
};

const getFieldPlaceholder = item => {
  if (item.Placeholder) return item.Placeholder;
  switch (item.Ref_Code) {
    case 'phone':
      return `Nhập ${item.NameVN?.toLowerCase() || 'số điện thoại'}`;
    case 'number':
      return `Nhập ${item.NameVN?.toLowerCase() || 'giá trị'}`;
    case 'link':
      return `Nhập hoặc quét ${item.NameVN?.toLowerCase() || 'link'}`;
    case 'selected':
      return `Chọn ${item.NameVN?.toLowerCase() || 'giá trị'}`;
    case 'shop':
      return `Chọn ${item.NameVN?.toLowerCase() || 'cửa hàng'}`;
    case 'gps':
      return 'Tự động lấy vị trí hiện tại';
    case 'region':
      return `Chọn ${item.NameVN?.toLowerCase() || 'tỉnh/phường xã'}`;
    default:
      return `Nhập ${item.NameVN?.toLowerCase() || 'thông tin'}`;
  }
};

const FieldLabel = ({ item, caption, isActive = false }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.surface,
    },
    iconWrapActive: { backgroundColor: appcolor.primary },
    textWrap: { flex: 1, marginStart: 10 },
    title: { color: appcolor.blacklight, fontSize: 14, fontWeight: '800' },
    caption: {
      color: appcolor.greylight,
      fontSize: 11,
      fontWeight: '500',
      marginTop: 2,
    },
    captionActive: { color: appcolor.primary, fontWeight: '800' },
    required: { color: appcolor.red, fontSize: 14 },
  });
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
        <SpiralIcon
          name={getFieldIcon(item)}
          type="font-awesome-5"
          size={13}
          color={isActive ? appcolor.light : appcolor.primary}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {item.NameVN}{' '}
          {item.IsRequired && <Text style={styles.required}>*</Text>}
        </Text>
        {caption ? (
          <Text
            style={[styles.caption, isActive && styles.captionActive]}
            numberOfLines={2}
          >
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const FieldError = ({ error }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  if (!error) return null;
  return (
    <Text
      style={{
        color: appcolor.red,
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 4,
        marginStart: 8,
      }}
    >
      * {error}
    </Text>
  );
};

const getRegionIdValue = value => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const DynamicField = ({
  item,
  value,
  displayValue,
  error,
  photo,
  gpsValue,
  disabled = false,
  onChange,
  onSelect,
  onRegionSelect,
  onScanLink,
  onOpenShopSelector,
  onTakePhoto,
  onSelectPhoto,
  onRemovePhoto,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const placeholder = getFieldPlaceholder(item);
  const selectedOptions = useMemo(
    () => (item.Ref_Code === 'selected' ? getSelectedOptions(item) : []),
    [item],
  );
  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 10,
      marginVertical: 7,
      padding: 13,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: error ? appcolor.red : appcolor.grayLight,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    input: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      marginBottom: 0,
      borderWidth: 0,
      overflow: 'hidden',
    },
    inputText: {
      color: appcolor.dark,
      fontSize: 14,
      fontWeight: '500',
      paddingVertical: 10,
    },
    linkIcon: { paddingHorizontal: 10 },
    selectorInner: { padding: 0, marginBottom: 0 },
    shopButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      paddingVertical: 13,
      paddingHorizontal: 12,
      borderWidth: 0,
    },
    shopText: {
      flex: 1,
      color: displayValue ? appcolor.dark : appcolor.placeholderText,
      fontSize: 14,
      fontWeight: '600',
    },
    trailingIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appcolor.light,
    },
    gpsBox: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 0,
    },
    gpsText: { color: appcolor.dark, fontSize: 13, fontWeight: '600' },
    regionBox: {
      backgroundColor: appcolor.surface,
      borderRadius: 8,
      padding: 8,
    },
  });

  if (item.Ref_Code === 'photo') {
    return (
      <PhotoField
        item={item}
        photo={photo}
        error={error}
        disabled={disabled}
        onTakePhoto={onTakePhoto}
        onSelectPhoto={onSelectPhoto}
        onRemovePhoto={onRemovePhoto}
      />
    );
  }

  if (item.Ref_Code === 'selected') {
    const options = selectedOptions;
    const selectedOption = options.find(
      option => `${getSelectedValue(option)}` === `${value}`,
    );
    const selectedLabel =
      displayValue || getSelectedLabel(selectedOption) || value;
    const caption = selectedLabel ? `Đã chọn: ${selectedLabel}` : placeholder;
    return (
      <View style={styles.container}>
        <FieldLabel item={item} caption={caption} isActive={!!selectedLabel} />
        <MutipleItemSelected
          isRequire={item.IsRequired}
          typeItem={item.Ref_Name}
          isFilter={options.length > 5}
          titleName={null}
          iconName={null}
          dataItems={options}
          placeholder={placeholder}
          defaultValue={selectedLabel}
          onItemChoose={onSelect}
          isUploaded={disabled}
          containerStyle={styles.selectorInner}
          filterStyle={styles.input}
          focusSelected
        />
        <FieldError error={error} />
      </View>
    );
  }

  if (item.Ref_Code === 'shop') {
    return (
      <View style={styles.container}>
        <FieldLabel item={item} caption={placeholder} />
        <TouchableOpacity
          disabled={disabled}
          style={styles.shopButton}
          onPress={() => onOpenShopSelector(item)}
        >
          <Text style={styles.shopText} numberOfLines={2}>
            {displayValue || placeholder}
          </Text>
          <View style={styles.trailingIcon}>
            <SpiralIcon
              name="search"
              type="font-awesome-5"
              size={14}
              color={appcolor.primary}
            />
          </View>
        </TouchableOpacity>
        <FieldError error={error} />
      </View>
    );
  }

  if (item.Ref_Code === 'gps') {
    return (
      <View style={styles.container}>
        <FieldLabel item={item} caption={placeholder} />
        <View style={styles.gpsBox}>
          <Text style={styles.gpsText}>
            {gpsValue || 'Chưa lấy được vị trí hiện tại'}
          </Text>
        </View>
      </View>
    );
  }

  if (item.Ref_Code === 'region') {
    return (
      <View style={styles.container}>
        <FieldLabel item={item} caption={displayValue || placeholder} />
        <View style={styles.regionBox}>
          <RegionUpdate
            typeFilter={item.Ref_Name}
            isRequire={false}
            titleName={null}
            actionResult={onRegionSelect}
            newRegionId={getRegionIdValue(value)}
            isView={disabled}
          />
        </View>
        <FieldError error={error} />
      </View>
    );
  }

  if (item.Ref_Code === 'link') {
    const textValue =
      value === null || value === undefined ? '' : value.toString();
    return (
      <View style={styles.container}>
        <FieldLabel item={item} caption={placeholder} />
        <FormGroup
          editable={!disabled}
          keyboardType="url"
          containerStyle={styles.input}
          inputStyle={styles.inputText}
          value={textValue}
          placeholder={placeholder}
          multiline={false}
          iconRight={disabled ? null : 'qrcode'}
          iconRightStyle={styles.linkIcon}
          iconColorRight={appcolor.primary}
          rightFunc={() => onScanLink(item)}
          useClearAndroid={false}
          handleChangeForm={text => onChange(item, text)}
        />
        <FieldError error={error} />
      </View>
    );
  }

  const keyboardType =
    item.Ref_Code === 'phone' || item.Ref_Code === 'number'
      ? 'numeric'
      : 'default';
  const textValue =
    value === null || value === undefined ? '' : value.toString();

  return (
    <View style={styles.container}>
      <FieldLabel item={item} caption={placeholder} />
      <FormGroup
        editable={!disabled}
        keyboardType={keyboardType}
        containerStyle={styles.input}
        inputStyle={styles.inputText}
        value={textValue}
        placeholder={placeholder}
        multiline={false}
        useClearAndroid={false}
        handleChangeForm={text => onChange(item, text)}
      />
      <FieldError error={error} />
    </View>
  );
};

export default DynamicField;
