import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ItemDetailView } from './ItemDetailView';
import { deviceWidth } from '../../../../Themes/AppsStyle';
import { AppNameBuild, lgApp } from '../../../../Core/URLs';
import { ItemDetailViewLG } from './ItemDetailViewLG';

export const ActualTrip = ({
  type,
  indexMain,
  data,
  dataPlan,
  isCheckData = false,
  handlerConfirm,
  handlerNote,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const onConfirm = value => {
    handlerConfirm(value, type, JSON.stringify(data));
  };
  const onNote = () => {
    handlerNote(type, JSON.stringify(data));
  };
  const styles = StyleSheet.create({
    mainContainer: {
      width:
        isCheckData == 1
          ? dataPlan?.length > 0
            ? deviceWidth / 2
            : deviceWidth
          : deviceWidth / 2,
      backgroundColor: appcolor.light,
    },
  });
  const ViewItem = () => {
    switch (AppNameBuild) {
      case lgApp:
        return (
          <ItemDetailViewLG
            title="Actual"
            key={`aa_p_${indexMain}`}
            styles={styles}
            index={indexMain}
            item={data[0] || {}}
            handlerConfirmTrip={onConfirm}
            handlerNote={onNote}
          />
        );
      default:
        return (
          <ItemDetailView
            title="Actual"
            key={`aa_p_${indexMain}`}
            styles={styles}
            index={indexMain}
            item={data[0] || {}}
            handlerConfirmTrip={onConfirm}
            handlerNote={onNote}
          />
        );
    }
  };
  return <View style={styles.mainContainer}>{ViewItem()}</View>;
};
