import { Text } from '@rneui/base';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deviceHeight } from '../../../../../../Themes/AppsStyle';
import ScoreInput from './ScoreInput';
import ScoringHeader from './ScoringHeader';

const QuizView = ({
  styles,
  appcolor,
  item,
  total,
  currentIndex,
  currentQ,
  progress,
  allQuestionsAnswered,
  currentTargetsAnswered,
  scoreInputProps,
  onClose,
  onPrev,
  onNext,
  onSubmit,
}) => (
  <SafeAreaView style={styles.container}>
    <ScoringHeader
      styles={styles}
      appcolor={appcolor}
      item={item}
      onClose={onClose}
    />
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: deviceHeight / 3.5 }}
      >
        {/* Question card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMeta}>
            {currentQ.groupName && (
              <View style={styles.groupTag}>
                <Text style={styles.groupTagText}>{currentQ.groupName}</Text>
              </View>
            )}
            <Text style={styles.questionNumber}>{`${
              currentIndex + 1
            } / ${total}`}</Text>
          </View>
        </View>
        {/* Score input */}
        <ScoreInput styles={styles} appcolor={appcolor} {...scoreInputProps} />
      </ScrollView>
    </KeyboardAvoidingView>
    {/* Navigation */}
    <View style={styles.navRow}>
      <TouchableOpacity
        style={[styles.navBtn, currentIndex === 0 && { opacity: 0.35 }]}
        onPress={onPrev}
        disabled={currentIndex === 0}
      >
        <Text style={styles.navBtnText}>Trước</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.navBtn,
          styles.navBtnPrimary,
          currentIndex === total - 1 &&
            !allQuestionsAnswered &&
            styles.navBtnPrimaryDisabled,
          currentIndex < total - 1 &&
            !currentTargetsAnswered &&
            styles.navBtnPrimaryDisabled,
        ]}
        onPress={currentIndex < total - 1 ? onNext : onSubmit}
        disabled={
          (currentIndex === total - 1 && !allQuestionsAnswered) ||
          (currentIndex < total - 1 && !currentTargetsAnswered)
        }
      >
        <Text style={styles.navBtnTextPrimary}>
          {currentIndex < total - 1 ? 'Tiếp theo' : 'Hoàn thành'}
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

export default QuizView;
