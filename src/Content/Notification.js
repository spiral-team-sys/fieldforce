import moment from 'moment';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { ICON_NOTIFY } from '../Core/URLs';
import { deviceHeight } from '../Core/Utility';

export const Notification = ({ props }) => {
  const { navigation, data, onClose } = props;
  const { appcolor } = useSelector(state => state.GAppState);

  const styles = StyleSheet.create({
    mainContainer: {
      zIndex: 1000,
      width: '92%',
      margin: 8,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      alignSelf: 'center',
      position: 'absolute',
      top: deviceHeight / 20 + 16,
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    closeStyle: {
      zIndex: 1000,
      width: 30,
      height: 30,
      alignItems: 'center',
      backgroundColor: appcolor.surface,
      borderRadius: 50,
      padding: 8,
      end: -10,
      top: -10,
      position: 'absolute',
      shadowColor: appcolor.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    titleView: {
      margin: 8,
      marginBottom: 3,
      fontSize: 15,
      fontWeight: '700',
      color: appcolor.dark,
    },
    bodyView: {
      margin: 8,
      marginTop: 0,
      fontSize: 13,
      fontWeight: '400',
      color: appcolor.greylight,
    },
    dateView: {
      textAlign: 'right',
      marginBottom: 5,
      marginEnd: 8,
      fontSize: 11,
      fontWeight: '400',
      color: appcolor.dark,
      fontStyle: 'italic',
    },
  });
  const handlerView = () => {
    // navigation.navigate('Notification')
    onClose();
  };
  return (
    <SafeAreaView style={styles.mainContainer}>
      <TouchableOpacity onPress={handlerView}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}
        >
          <View style={{ width: '15%', alignItems: 'center' }}>
            <Avatar rounded source={ICON_NOTIFY} size={38} />
          </View>
          <View style={{ width: '85%' }}>
            <Text style={styles.titleView}>{data?.notification.title}</Text>
            <Text style={styles.bodyView}>{data?.notification.body}</Text>
            <Text style={styles.dateView}>
              {moment(data.sentTime).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeStyle} onPress={onClose}>
        <SpiralIcon size={15} name="close" color={appcolor.dark} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
