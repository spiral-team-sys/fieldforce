import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { UtilityOffice } from '../UtilityOffice';
import { OverTime } from './Page/OverTime';
import { Attendant } from './Page/Attendant';
import { deviceHeight, deviceWidth } from '../../../../Core/Utility';
import { WorkLate } from './Page/WorkLate';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import _ from 'lodash';
import { OffWork } from './Page/OffWork';
import { WorkEarlier } from './Page/WorkEarlier';
import { RegisterOverTime } from './Register/RegisterOverTime';
import { RegisterWorkEarlier } from './Register/RegisterWorkEarlier';
import { RegisterWorkLate } from './Register/RegisterWorkLate';
import { RegisterOffWork } from './Register/RegisterOffWork';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PlanDetailByDay = ({ dataDetails, itemDay, onCallBackData }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataAttendant, setDataAttendant] = useState([]);
  const [dataRegister, setDataRegister] = useState([]);
  const [itemMain, setItemMain] = useState({});
  const [itemRegister, setItemRegister] = useState({});
  const [isRegister, setRegister] = useState(false);
  //
  const LoadDataDetail = () => {
    const _attendants = _.filter(dataDetails, e => {
      return e.typePage == 'ATTENDANT';
    });
    setDataAttendant(_attendants);
    const _register = _.filter(dataDetails, e => {
      return e.typePage !== 'ATTENDANT';
    });
    setDataRegister(_register);

    setItemMain(dataDetails[0] || {});
  };
  // Handler
  const handlerShowRegisterWork = () => {
    SheetManager.show('officework');
  };
  const handlerBackRegister = () => {
    if (isRegister) {
      setItemRegister({});
      setRegister(false);
    } else {
      SheetManager.hide('officework');
    }
  };
  const handlerRegister = item => {
    setItemRegister(item);
    setRegister(e => !e);
  };
  //
  useEffect(() => {
    const _detail = LoadDataDetail();
    return () => _detail;
  }, [dataDetails]);
  // View
  const renderPageAttendant = () => {
    const itemView = item => {
      const dataDetail = JSON.parse(item.dataDetail || '[]');
      switch (item.typePage) {
        case UtilityOffice.typeATTENDANT:
          return <Attendant dataDetails={dataDetail} itemMain={item} />;
        default:
          return null;
      }
    };
    return (
      dataAttendant !== null &&
      dataAttendant.length > 0 &&
      dataAttendant.map((item, index) => {
        return (
          <View key={`pid_${index}`} style={{ width: deviceWidth }}>
            {itemView(item)}
          </View>
        );
      })
    );
  };
  const renderPageView = () => {
    const itemView = item => {
      const dataDetail = JSON.parse(item.dataDetail || '[]');
      switch (item.typePage) {
        case UtilityOffice.typeOT:
          return <OverTime dataDetail={dataDetail} itemMain={item} />;
        case UtilityOffice.typeOFF:
          return <OffWork dataDetail={dataDetail} itemMain={item} />;
        case UtilityOffice.typeLATE:
          return <WorkLate dataDetail={dataDetail} itemMain={item} />;
        case UtilityOffice.typeEARLIER:
          return <WorkEarlier dataDetail={dataDetail} itemMain={item} />;
        default:
          return null;
      }
    };
    return (
      dataRegister !== null &&
      dataRegister.length > 0 &&
      dataRegister.map((item, index) => {
        const onRegister = () => {
          if (item?.isChange == 1) handlerRegister(item);
        };
        return (
          <TouchableOpacity
            key={`pid_${index}`}
            style={{ width: deviceWidth }}
            onPress={onRegister}
          >
            {itemView(item)}
          </TouchableOpacity>
        );
      })
    );
  };
  const renderRegisterMain = item => {
    const itemView = () => {
      const dataDetail = JSON.parse(item.dataDetail || '[]');
      const onCallBack = () => {
        onCallBackData(itemDay);
        handlerBackRegister();
      };
      switch (item.typePage) {
        case UtilityOffice.typeOT:
          return (
            <RegisterOverTime
              dataDetail={dataDetail}
              itemMain={item}
              actionBack={onCallBack}
            />
          );
        case UtilityOffice.typeOFF:
          return (
            <RegisterOffWork
              dataDetail={dataDetail}
              itemMain={item}
              actionBack={onCallBack}
            />
          );
        case UtilityOffice.typeLATE:
          return (
            <RegisterWorkLate
              dataDetail={dataDetail}
              itemMain={item}
              actionBack={onCallBack}
            />
          );
        case UtilityOffice.typeEARLIER:
          return (
            <RegisterWorkEarlier
              dataDetail={dataDetail}
              itemMain={item}
              actionBack={onCallBack}
            />
          );
        default:
          return null;
      }
    };
    return itemView();
  };
  const styles = StyleSheet.create({
    mainContainer: { backgroundColor: appcolor.light },
    titleDate: { fontSize: 14, fontWeight: '700' },
    contentMain: { width: deviceWidth, alignItems: 'center' },
    titleSheet: {
      width: '80%',
      fontSize: 18,
      fontWeight: '700',
      color: appcolor.blacklight,
    },
    contentRegister: { width: deviceWidth - 16, padding: 8 },
    backMain: {
      width: '15%',
      padding: 8,
      alignItems: 'flex-end',
      marginEnd: 8,
    },
    backRegisterView: {
      backgroundColor: appcolor.blacklight,
      padding: 8,
      borderRadius: 20,
    },
  });
  return (
    <View style={styles.mainContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.titleDate}>{`${itemMain.dateView || ''}`}</Text>
        {itemDay.isRegisterByDay == 1 && (
          <TouchableOpacity
            style={{
              width: 80,
              backgroundColor: appcolor.yellowdark,
              alignItems: 'center',
              padding: 6,
              borderRadius: 5,
              position: 'absolute',
              end: 0,
            }}
            onPress={handlerShowRegisterWork}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '400',
                color: appcolor.blacklight,
              }}
            >{`Đăng kí`}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.contentMain}>
        {renderPageAttendant()}
        <ActionSheet
          id="officework"
          gestureEnabled={false}
          closeOnTouchBackdrop={!isRegister}
          closable={!isRegister}
          containerStyle={{ paddingBottom: insets.bottom }}
        >
          <SafeAreaView
            style={{ width: '100%', height: deviceHeight / 1.5, margin: 8 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.titleSheet}>{itemMain.dateView}</Text>
              <TouchableOpacity
                style={styles.backMain}
                onPress={handlerBackRegister}
              >
                <View style={styles.backRegisterView}>
                  <SpiralIcon
                    name={isRegister ? 'arrow-back' : 'close'}
                    size={21}
                    color={appcolor.light}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.contentRegister}>
              {isRegister ? renderRegisterMain(itemRegister) : renderPageView()}
            </View>
          </SafeAreaView>
        </ActionSheet>
      </View>
    </View>
  );
};
