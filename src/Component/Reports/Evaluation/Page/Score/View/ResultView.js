import { Icon, Text } from '@rneui/base';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingView } from '../../../../../../Control/ItemLoading';
import ScoringHeader from './ScoringHeader';
import SpiralIcon from '../../../../../../Control/Icon/SpiralIcon';

const ResultView = ({
  styles,
  appcolor,
  item,
  questions,
  scoringTargets,
  scores,
  notes,
  tasks,
  totalScore,
  isUploading,
  getQuestionTitle,
  onClose,
  onRetry,
  onUpload,
}) => {
  const groupMap = {};
  questions.forEach((question, qIdx) => {
    const gName = question.groupName || getQuestionTitle(question);
    if (!groupMap[gName]) groupMap[gName] = { groupName: gName, targets: [] };
    scoringTargets
      .filter(t => t.questionIndex === qIdx)
      .forEach(t => groupMap[gName].targets.push(t));
  });
  const round1 = n => Math.round(n * 10) / 10;
  const groupSummaryList = Object.values(groupMap).map(g => {
    const gSum = round1(
      g.targets.reduce((sum, t) => sum + (scores[t.key] ?? 0), 0),
    );
    const gScore = g.targets.length > 0 ? round1(gSum / g.targets.length) : 0;
    const gMax = round1(
      g.targets.reduce((sum, t) => sum + t.maxScore, 0) / g.targets.length,
    );
    return { ...g, gScore, gMax };
  });
  return (
    <SafeAreaView style={styles.container}>
      <ScoringHeader
        styles={styles}
        appcolor={appcolor}
        item={item}
        onClose={onClose}
      />
      <LoadingView
        isLoading={isUploading}
        styles={styles.loadingView}
        title="Đang gửi dữ liệu"
      />
      <ScrollView
        style={styles.resultScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Score banner */}
        <View
          style={[styles.resultBanner, { backgroundColor: appcolor.primary }]}
        >
          <View style={styles.resultScoreWrap}>
            <Text style={styles.resultScoreValue}>{totalScore.toFixed(1)}</Text>
          </View>
          <View style={styles.resultBannerText}>
            <Text style={styles.resultBannerTitle}>Điểm trung bình</Text>
            <Text style={styles.resultBannerSub}>
              {groupSummaryList.length} tiêu chí
            </Text>
          </View>
        </View>
        {/* Per-group summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>
            Tổng hợp điểm trung bình theo mục
          </Text>
          {groupSummaryList.map(
            ({ groupName, targets, gScore, gMax }, gIdx) => {
              return (
                <View key={gIdx} style={styles.summaryQCard}>
                  <View style={styles.summaryQHeader}>
                    <Text style={styles.summaryQName} numberOfLines={2}>
                      {groupName}
                    </Text>
                    <View style={styles.summaryQScoreWrap}>
                      <Text style={styles.summaryQScore}>
                        {gScore.toFixed(1)}
                      </Text>
                      <Text style={styles.summaryQMax}>/{gMax.toFixed(1)}</Text>
                    </View>
                  </View>
                  {targets.map((target, tIdx) => {
                    const tScore = scores[target.key];
                    const tNote = notes[target.key];
                    const isLast = tIdx === targets.length - 1;
                    if (target.mode === 'group') {
                      if (!tNote) return null;
                      return (
                        <View
                          key={target.key}
                          style={[
                            styles.summaryNoteRow,
                            isLast && { borderBottomWidth: 0 },
                          ]}
                        >
                          <Text style={styles.summaryNoteText}>
                            Ghi chú: {tNote}
                          </Text>
                        </View>
                      );
                    }
                    return (
                      <View key={target.key}>
                        <View
                          style={[
                            styles.summarySubRow,
                            isLast && !tNote && { borderBottomWidth: 0 },
                          ]}
                        >
                          <Text style={styles.summarySubName} numberOfLines={1}>
                            {target.label}
                          </Text>
                          <Text style={styles.summarySubScore}>
                            {tScore != null ? tScore.toFixed(1) : '~'}
                          </Text>
                          <Text style={styles.summarySubMax}>
                            /{target.maxScore.toFixed(1)}
                          </Text>
                        </View>
                        {tNote ? (
                          <View
                            style={[
                              styles.summaryNoteRow,
                              isLast && { borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.summaryNoteText}>
                              Ghi chú: {tNote}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              );
            },
          )}
        </View>
        {/* Tasks summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Công việc cần làm</Text>
          <View style={styles.summaryTasksCard}>
            {tasks?.trim() ? (
              <Text style={styles.summaryTasksText}>{tasks}</Text>
            ) : (
              <Text style={styles.summaryTasksEmpty}>
                Không có công việc được ghi nhận
              </Text>
            )}
          </View>
        </View>
        {/* Retry */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <SpiralIcon
              type="ionicon"
              name="refresh"
              size={15}
              color={appcolor.dark}
            />
            <Text style={styles.actionBtnText}>Đánh giá lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: appcolor.primary }]}
            onPress={onUpload}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, { color: appcolor.light }]}>
              Hoàn thành
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResultView;
