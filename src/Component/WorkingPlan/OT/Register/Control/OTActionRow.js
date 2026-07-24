import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon } from '@rneui/themed';

const OTActionRow = ({
  appcolor,
  isRegistered,
  onClose,
  onSubmit,
  submitting,
}) => {
  const styles = useMemo(() => createStyles(appcolor), [appcolor]);

  if (isRegistered) {
    return <View style={styles.actionRow} />;
  }

  return (
    <View style={styles.actionRow}>
      <Button
        type="outline"
        icon={
          <SpiralIcon
            name="chevron-left"
            type="font-awesome-5"
            size={13}
            color={appcolor.primary}
            style={styles.buttonIcon}
          />
        }
        title="Huỷ"
        buttonStyle={styles.cancelButton}
        titleStyle={styles.cancelTitle}
        containerStyle={styles.buttonContainer}
        onPress={onClose}
      />
      <View style={styles.buttonSpacer} />
      <Button
        loading={submitting}
        icon={
          !submitting ? (
            <SpiralIcon
              name="paper-plane"
              type="font-awesome-5"
              size={13}
              color={appcolor.light}
              style={styles.buttonIcon}
            />
          ) : null
        }
        title="Xác nhận"
        buttonStyle={styles.submitButton}
        titleStyle={styles.submitTitle}
        containerStyle={styles.buttonContainer}
        onPress={onSubmit}
      />
    </View>
  );
};

const createStyles = appcolor =>
  StyleSheet.create({
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      paddingTop: 4,
      marginBottom: 12,
      backgroundColor: appcolor.light,
    },
    cancelButton: {
      borderColor: appcolor.primary,
      backgroundColor: appcolor.light,
      borderRadius: 12,
    },
    cancelTitle: {
      color: appcolor.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    submitButton: {
      backgroundColor: appcolor.primary,
      borderRadius: 12,
    },
    submitTitle: {
      color: appcolor.light,
      fontSize: 13,
      fontWeight: '700',
    },
    buttonContainer: {
      flex: 1,
    },
    buttonSpacer: {
      width: 8,
    },
    buttonIcon: {
      marginRight: 6,
    },
  });

export default memo(OTActionRow);
