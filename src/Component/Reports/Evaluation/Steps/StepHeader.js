import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '@rneui/base';
import { fontWeightBold } from '../../../../Themes/AppsStyle';

/**
 * StepHeader - horizontal step progress bar with tap-to-navigate
 * Props: stepItems, currentStep, onChangeStep
 */
const StepHeader = ({ stepItems = [], currentStep, onChangeStep }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const styles = StyleSheet.create({
    stepContainer: { width: '100%', marginVertical: 8, paddingHorizontal: 2 },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    stepItem: { flex: 1, alignItems: 'center' },
    stepCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepCircleActive: {
      backgroundColor: appcolor.primary,
      borderColor: appcolor.primary,
    },
    stepCircleDone: {
      backgroundColor: appcolor.blacklight,
      borderColor: appcolor.blacklight,
    },
    stepCircleText: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      color: appcolor.placeholderText,
    },
    stepCircleTextActive: { color: appcolor.light },
    stepLabel: {
      marginTop: 4,
      fontSize: 10,
      color: appcolor.placeholderText,
      textAlign: 'center',
    },
    stepLabelActive: { color: appcolor.primary, fontWeight: '600' },
    stepLine: {
      height: 2,
      flex: 1,
      backgroundColor: appcolor.grayLight,
      marginBottom: 18,
    },
    stepLineDone: { backgroundColor: appcolor.blacklight },
  });
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepRow}>
        {stepItems.map((step, index) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <React.Fragment key={step.id}>
              <TouchableOpacity
                style={styles.stepItem}
                onPress={() => onChangeStep(step.id)}
              >
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isDone && styles.stepCircleDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepCircleText,
                      (isActive || isDone) && styles.stepCircleTextActive,
                    ]}
                  >
                    {step.id}
                  </Text>
                </View>
                <Text
                  style={[styles.stepLabel, isActive && styles.stepLabelActive]}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>
              {index < stepItems.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > step.id && styles.stepLineDone,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default StepHeader;
