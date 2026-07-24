import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Icon } from '@rneui/base';
import AnswerItem from './AnswerItem';
import { useSelector } from 'react-redux';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { saveJsonData } from '../../../../Controller/ReportController';
import { TODAY } from '../../../../Core/Utility';

const QuestionItem = React.memo(
  ({ data, item, index, onAnswerPress, onFlagQuestion }) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState);
    const [listAnswer, setListAnswer] = useState([]);

    useEffect(() => {
      setListAnswer(item.listAnswer);
    }, [item]);

    const styles = useMemo(
      () =>
        StyleSheet.create({
          textQuestion: {
            fontSize: 13,
            color: appcolor.dark,
            fontWeight: fontWeightBold,
            marginBottom: 8,
          },
          containerQuestion: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          },
          containerFlag: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            width: '25%',
            height: '100%',
            marginRight: 8,
          },
          textFlag: {
            fontSize: 12,
            color: appcolor.dark,
            fontWeight: fontWeightBold,
            marginRight: 8,
            textAlign: 'justify',
          },
          textQuestion1: {
            fontSize: 14,
            color: appcolor.dark,
            marginBottom: 8,
            width: '75%',
          },
          containerFlagIcon: { flexDirection: 'row', marginRight: 6 },
          flagQuestion: {
            flex: 1,
            borderColor: item.isFlag ? appcolor.primary : appcolor.surface,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
          },
        }),
      [appcolor, item],
    );

    const onFlag = useCallback(() => {
      const updateData = _.map(data, it => {
        if (it.questionSysCode === item.questionSysCode) {
          return {
            ...it,
            isFlag: !it.isFlag,
          };
        }
        return it;
      });
      onFlagQuestion(updateData);
      saveJsonData(0, kpiinfo.id || 3, TODAY, updateData);
    }, [data, item, onFlagQuestion, kpiinfo.id]);

    return (
      <View key={index} style={styles.flagQuestion}>
        <View style={styles.containerQuestion}>
          <Text style={styles.textQuestion1}>Câu {index + 1}. </Text>
          <TouchableOpacity style={styles.containerFlag} onPress={onFlag}>
            <View style={styles.containerFlagIcon}>
              <Text style={styles.textFlag}>{'Đánh dấu'}</Text>
              <SpiralIcon
                name={item.isFlag ? 'flag' : 'flag-o'}
                type="font-awesome"
                size={20}
                color={appcolor.primary}
              />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.textQuestion}>{item.content}</Text>

        {listAnswer.map((itemChild, indexChild) => {
          return (
            <AnswerItem
              key={indexChild}
              item={itemChild}
              index={indexChild}
              itemParent={item}
              onPress={() => onAnswerPress(itemChild, indexChild, item)}
              styles={styles}
              appcolor={appcolor}
            />
          );
        })}
      </View>
    );
  },
);

export default QuestionItem;
