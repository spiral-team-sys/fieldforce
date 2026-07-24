import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { useSelector } from 'react-redux';

export const ListItem = ({ typeAction, data, handlerChoose }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [value, setValue] = useState(null);

  const onChooseItem = () => {
    handlerChoose(typeAction);
  };

  const styles = StyleSheet.create({
    mainContainer: { width: '100%' },
    itemMain: { width: '100%', padding: 8 },
    titleValue: { fontSize: 13, fontWeight: '500', color: appcolor.blacklight },
  });

  const renderItem = ({ item, index }) => {
    return (
      <View key={`iitc_${typeAction}_${index}`} style={styles.itemMain}>
        <Text style={styles.titleValue}>{item.value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <FlashList
        key={`data_${typeAction}`}
        keyExtractor={(_item, index) => index.toString()}
        extraData={value}
        data={data || []}
        renderItem={renderItem}
      />
    </View>
  );
};
