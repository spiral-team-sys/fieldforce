import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import FormGroup from '../../Content/FormGroup';

export const SearchData = ({
  placeholder,
  value = null,
  iconName = 'search',
  onSearchData,
  containerStyle,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [search, setItemSearch] = useState({ text: '', isSearch: false });
  const [_mutate, setMutate] = useState(false);
  //
  const hanlerChangeValue = text => {
    search.text = text;
    setMutate(e => !e);
    //
    onSearchData && onSearchData(text);
  };
  const onFocusSearch = () => {
    search.isSearch = true;
    setMutate(e => !e);
  };
  const onBlurSearch = () => {
    search.isSearch = false;
    setMutate(e => !e);
  };
  //
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;
    setItemSearch({ text: value, isSearch: false });
    return () => {
      isMounted = false;
    };
  }, [value]);
  // View
  const styles = StyleSheet.create({
    searchContainer: {
      padding: Platform.OS == 'android' ? 0 : 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 0.5,
      borderColor: appcolor.primary,
      margin: 8,
      containerStyle,
    },
    searchContainerInput: {
      padding: Platform.OS == 'android' ? 0 : 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: appcolor.primary,
      borderWidth: 0.5,
      margin: 8,
    },
    searchInputStyle: {
      fontSize: 13,
      color: appcolor.light,
      fontWeight: '500',
    },
    searchStyle: { fontSize: 13, color: appcolor.primary },
  });
  return (
    <FormGroup
      editable
      placeholder={placeholder}
      iconName={iconName}
      value={search.text}
      iconColor={search.isSearch ? appcolor.light : appcolor.primary}
      useClearAndroid={search.text !== null && search.text.length > 0}
      placeholderColor={search.isSearch ? appcolor.surface : appcolor.primary}
      containerStyle={[
        search.isSearch ? styles.searchContainerInput : styles.searchContainer,
        containerStyle,
      ]}
      inputStyle={
        search.isSearch ? styles.searchInputStyle : styles.searchStyle
      }
      handleChangeForm={hanlerChangeValue}
      onClearTextAndroid={hanlerChangeValue}
      onFocus={onFocusSearch}
      onEndEditing={onBlurSearch}
    />
  );
};
