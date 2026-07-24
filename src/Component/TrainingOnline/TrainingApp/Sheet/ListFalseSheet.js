import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { fontWeightBold } from '../../../../Themes/AppsStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ListFalseSheet = ({ data }) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    containerAnswer: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: appcolor.grayLight,
      padding: 12,
      marginBottom: 12,
    },
    textAnswer: { fontSize: 12, color: appcolor.dark, marginBottom: 8 },
    textQuestion: {
      fontSize: 13,
      color: appcolor.dark,
      fontWeight: fontWeightBold,
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      textAlign: 'center',
      color: appcolor.dark,
      marginBottom: 12,
    },
    textEmpty: {
      fontSize: 13,
      color: appcolor.dark,
      textAlign: 'center',
      marginTop: 12,
    },
  });
  const renderItem = ({ item, index }) => {
    const listAnswer = _.filter(
      item.listAnswer || [],
      it => it.code == item.answerKey,
    );
    return (
      <View key={index}>
        <Text style={styles.textQuestion}>
          Câu {index + 1}: {item.content}
        </Text>
        {listAnswer.map((itemAnswer, indexAnswer) => {
          return (
            <View key={indexAnswer} style={styles.containerAnswer}>
              <Text style={styles.textAnswer}>{itemAnswer.content}</Text>
            </View>
          );
        })}
        {listAnswer.length == 0 && (
          <Text style={styles.textAnswer}>Bạn chưa chọn câu trả lời</Text>
        )}
      </View>
    );
  };
  return (
    <ActionSheet
      containerStyle={{
        backgroundColor: appcolor.light,
        height: '90%',
        padding: 12,
        paddingBottom: insets.bottom,
      }}
      id="detailListFalse"
    >
      <Text style={styles.title}>Danh sách câu hỏi sai</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.textEmpty}>Không có câu sai</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </ActionSheet>
  );
};

export default ListFalseSheet;
