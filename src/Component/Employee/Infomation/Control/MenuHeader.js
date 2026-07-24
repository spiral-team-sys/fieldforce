import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { ButtonAction } from './ButtonAction';

export const MenuHeader = ({ navigation }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [edit, setEdit] = useState({
    isOpen: false,
    iconName: 'settings-outline',
    type: 'VIEW',
  });
  const [_mutate, setMutate] = useState(false);

  const SaveEmployeeInfo = () => {
    edit.isOpen = false;
    edit.iconName = 'settings-outline';
    edit.type = 'VIEW';
    setMutate(e => !e);
  };
  // Handler
  const handlerPressAction = typeAction => {
    switch (typeAction) {
      case 'CLOSE':
        navigation.goBack();
        break;
      case 'VIEW':
        edit.isOpen = true;
        edit.iconName = 'save';
        edit.type = 'EDIT';
        setMutate(e => !e);
        break;
      case 'EDIT':
        SaveEmployeeInfo();
        break;
    }
  };
  //
  useEffect(() => {
    return () => false;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      minHeight: 42,
      marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      padding: 8,
      backgroundColor: 'red',
    },
    buttonCloseView: { position: 'absolute', top: 8, start: 8 },
    buttonEditView: { position: 'absolute', top: 8, end: 8 },
  });

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.buttonCloseView}>
        <ButtonAction
          iconName="close-outline"
          typeAction="CLOSE"
          onPress={handlerPressAction}
        />
      </View>
      <View style={styles.buttonEditView}>
        <ButtonAction
          iconName={edit.iconName}
          typeAction={edit.type}
          onPress={handlerPressAction}
        />
      </View>
    </SafeAreaView>
  );
};
