import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { Icon } from '@rneui/base';
import { useSelector } from 'react-redux';
import { TrainingAPI } from '../../../../API/TrainingAPI';
import _ from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const activeList = {
  ALL: '0',
  EXPIRED: '1',
  ACTIVE: '2, 3',
};
const LessonSheet = ({ onUpdateData, onActiveOptions, activeOptions }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, tokenAutoLogin } = useSelector(state => state.GAppState);
  const [selected, setSelected] = useState();

  useEffect(() => {
    if (activeOptions !== undefined) {
      setSelected(activeOptions);
    }
  }, [activeOptions]);

  const onExpired = async () => {
    const activeOptions =
      selected === activeList.EXPIRED ? activeList.ALL : activeList.EXPIRED;
    const searchLessonInfo = {
      statusList: 0,
      activeList: activeOptions,
      isCountResult: 1,
    };
    setSelected(activeOptions);
    await TrainingAPI.SearchLesson(searchLessonInfo, tokenAutoLogin, res => {
      onUpdateData(res);
      onActiveOptions(activeOptions);
    });
  };
  const onActive = async () => {
    const activeOptions =
      selected === activeList.ACTIVE ? activeList.ALL : activeList.ACTIVE;
    setSelected(activeOptions);
    const searchLessonInfo = {
      statusList: 0,
      activeList: activeOptions,
      isCountResult: 1,
    };
    await TrainingAPI.SearchLesson(searchLessonInfo, tokenAutoLogin, res => {
      onUpdateData(res);
      onActiveOptions(activeOptions);
    });
  };

  const getColorOptions = () => {
    return selected !== undefined ? selected : activeOptions;
  };

  const styles = StyleSheet.create({
    mainContainer: { justifyContent: 'space-between' },
    text: { fontSize: 12, fontWeight: 'bold', color: appcolor.dark },
    sheetContainer: {
      backgroundColor: appcolor.light,
      padding: 8,
      paddingBottom: 32,
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
      color: appcolor.dark,
    },
    button: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.primary,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });

  return (
    <ActionSheet
      id="sheetLesson"
      containerStyle={StyleSheet.flatten([
        styles.sheetContainer,
        { paddingBottom: insets.bottom },
      ])}
    >
      <Text style={styles.title}>{'Lọc bài học'}</Text>
      <View style={styles.mainContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                getColorOptions() === activeList.EXPIRED
                  ? appcolor.primary
                  : appcolor.light,
            },
          ]}
          onPress={onExpired}
        >
          <SpiralIcon
            name="close"
            type="font-awesome"
            size={16}
            color={
              getColorOptions() === activeList.EXPIRED
                ? appcolor.light
                : appcolor.primary
            }
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.text,
              {
                color:
                  getColorOptions() === activeList.EXPIRED
                    ? appcolor.light
                    : appcolor.primary,
              },
            ]}
          >
            Hết hạn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                getColorOptions() === activeList.ACTIVE
                  ? appcolor.primary
                  : appcolor.light,
            },
          ]}
          onPress={onActive}
        >
          <SpiralIcon
            name="check"
            type="font-awesome"
            size={16}
            color={
              getColorOptions() === activeList.ACTIVE
                ? appcolor.light
                : appcolor.primary
            }
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.text,
              {
                color:
                  getColorOptions() === activeList.ACTIVE
                    ? appcolor.light
                    : appcolor.primary,
              },
            ]}
          >
            Còn hạn
          </Text>
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
};

export default LessonSheet;
