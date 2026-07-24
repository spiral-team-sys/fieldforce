import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import CustomListView from '../../../../Control/Custom/CustomListView';
import MenuPSVHeader from './PSV/Control/MenuPSVHeader';
import MenuPSVCard from './PSV/Items/MenuPSVCard';

const MenuPSV = ({ menus = [], onPress, onRefresh }) => {
  const { appcolor } = useSelector(state => state.GAppState);

  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  const listHeader = useMemo(
    () => <MenuPSVHeader appcolor={appcolor} menuCount={menus.length} />,
    [appcolor, menus.length],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <MenuPSVCard item={item} onPress={onPress} appcolor={appcolor} />
    ),
    [appcolor, onPress],
  );

  return (
    <View style={styles.container}>
      <CustomListView
        data={menus}
        numColumns={2}
        ListHeader={listHeader}
        renderItem={renderItem}
        onRefresh={onRefresh}
        bottomView={{ paddingBottom: 0 }}
      />
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: appcolor.surface,
    },
  });

export default MenuPSV;
