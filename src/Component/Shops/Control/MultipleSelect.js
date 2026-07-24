import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Icon } from '@rneui/themed';

const MultipleSelect = ({
  titleName,
  iconName,
  typeItem,
  isRequire = false,
  dataView,
  onItemChange,
  containerStyle,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataItem, setDataItem] = useState([]);
  const [_mutate, setMutate] = useState(false);

  const LoadData = async () => {
    setDataItem(dataView);
  };
  const handlerItemAction = (item, index) => {
    dataView[index].isChoose == 1;
    setMutate(e => !e);
    onItemChange(typeItem, dataView);
  };
  const renderItem = (item, index) => {
    const onPress = () => {
      item.isChoose = item.isChoose == 1 ? 0 : 1;
      handlerItemAction(item, index);
    };
    const styleView =
      item.isChoose == 1
        ? {
            ...styles.itemContent,
            borderWidth: 1,
            borderColor: appcolor.primary,
          }
        : styles.itemContent;
    const styleTitle =
      item.isChoose == 1
        ? { ...styles.itemName, fontWeight: '700', color: appcolor.primary }
        : styles.itemName;
    return (
      <TouchableOpacity
        key={`${typeItem}_${index}`}
        style={styleView}
        onPress={onPress}
      >
        <Text style={styleTitle}>{item.itemName}</Text>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    const _load = LoadData();
    return () => _load;
  }, [dataView]);
  const styles = StyleSheet.create({
    mainContainer: { flexGrow: 1, padding: 8, marginBottom: 1 },
    itemContent: {
      flexGrow: 1,
      backgroundColor: appcolor.light,
      borderRadius: 5,
      padding: 8,
      margin: 5,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '300',
      color: appcolor.dark,
      textAlign: 'center',
      marginStart: 8,
      marginEnd: 8,
    },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '700',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    filterItemContent: {
      width: '100%',
      backgroundColor: appcolor.surface,
      borderRadius: 5,
      padding: 3,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },

    itemMain: {
      borderRadius: 5,
      borderWidth: 0.3,
      borderColor: appcolor.placeholderText,
      marginEnd: 8,
      marginTop: 5,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    itemMainChoose: {
      borderRadius: 5,
      backgroundColor: appcolor.primary,
      marginEnd: 8,
      marginTop: 5,
      justifyContent: 'center',
      alignSelf: 'center',
    },
  });
  return (
    <View style={[styles.mainContainer, containerStyle]}>
      <View style={{ width: '100%', flexDirection: 'row' }}>
        {iconName && (
          <SpiralIcon
            name={iconName}
            type="font-awesome-5"
            size={15}
            color={appcolor.blacklight}
          />
        )}
        {titleName && (
          <Text style={styles.titleHeader}>
            {`${titleName} `}
            {isRequire && (
              <Text style={{ fontSize: 14, color: appcolor.red }}>*</Text>
            )}
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          minHeight: 50,
        }}
      >
        {dataView.map((item, i) => {
          return renderItem(item, i);
        })}
      </View>
    </View>
  );
};
export default MultipleSelect;
