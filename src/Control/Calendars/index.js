import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ButtonArrow } from './Controls/ButtonArrow';
import { deviceWidth } from '../../Core/Utility';
import { TextHeader } from './Controls/TextHeader';
import moment from 'moment';
import { ListItem } from './Controls/ListItem';

export const ChooseDate = ({ onChangeData }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [itemDate, setItemDate] = useState({
    date: null,
    month: moment().month() + 1,
    year: moment().year(),
  });
  const [itemChoose, setItemChoose] = useState({
    data: [],
    visible: false,
    type: null,
  });
  const [_mutate, setMutate] = useState(false);

  //
  const onPressButton = type => {
    switch (type) {
      case 'BACK':
        break;
      case 'FORWARD':
        break;
    }
    setMutate(e => !e);
  };
  const onChooseHeader = type => {
    switch (type) {
      case 'YEAR':
        configDataYear();
        break;
      case 'MONTH':
        configDataMonth();
        break;
      case 'TODAY':
        const today = moment().format('YYYY-MM-DD');
        itemDate.date = today;
        itemDate.year = moment().year();
        itemDate.month = moment().month() + 1;
        onChangeData(today);
        break;
    }
    setMutate(e => !e);
  };
  const configDataYear = () => {
    const listYear = [];
    for (let index = 0; index < 1900; index++) {
      const _year = index + 1;
      console.log(_year);
    }

    itemChoose.visible = true;
    itemChoose.data = [];
    itemChoose.type = 'YEAR';
  };
  const configDataMonth = () => {
    itemChoose.visible = true;
    itemChoose.data = [];
    itemChoose.type = 'MONTH';
  };
  //
  useEffect(() => {
    return () => false;
  }, []);
  // View
  const styles = StyleSheet.create({
    mainContainer: { width: '100%', backgroundColor: appcolor.light },
    headerMain: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    contentMain: {
      width: '100%',
      minHeight: 200,
      marginBottom: 16,
      marginTop: 8,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
    },
    backPressView: { position: 'absolute', start: 0, top: 0, bottom: 0 },
    forwardPressView: { position: 'absolute', end: 0, top: 0, bottom: 0 },
    titleHeadView: {
      width: deviceWidth / 6,
      height: 38,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerMain}>
        <ButtonArrow
          type="BACK"
          iconName="chevron-back-outline"
          styleMain={styles.backPressView}
          handlerPress={onPressButton}
        />
        <TextHeader
          type="MONTH"
          title={`Tháng ${itemDate.month}`}
          styleMain={styles.titleHeadView}
          handlerPress={onChooseHeader}
        />
        <TextHeader
          type="YEAR"
          title={itemDate.year}
          styleMain={styles.titleHeadView}
          handlerPress={onChooseHeader}
        />
        <TextHeader
          type="TODAY"
          title="Hôm nay"
          styleMain={styles.titleHeadView}
          handlerPress={onChooseHeader}
        />
        <ButtonArrow
          type="FORWARD"
          iconName="chevron-forward-outline"
          styleMain={styles.forwardPressView}
          handlerPress={onPressButton}
        />
      </View>
      <View style={styles.contentMain}>
        {itemChoose.visible && (
          <ListItem
            typeAction={itemChoose.type}
            data={itemChoose.data}
            handlerChoose={onChooseHeader}
          />
        )}
      </View>
    </View>
  );
};
