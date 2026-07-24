import React from 'react';
import { useSelector } from 'react-redux';
const { View, Text, Platform } = require('react-native');

export const RadioButton = props => {
  const { appcolor } = useSelector(state => state.GAppState);
  return (
    <View
      style={[
        {
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: appcolor.dark,
          alignItems: 'center',
          justifyContent: 'center',
        },
        props.style,
      ]}
    >
      {props.selected
        ? Platform.select({
            android: (
              <Text
                style={[
                  {
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: appcolor.dark,
                  },
                  props.styleSelect,
                ]}
              />
            ),
            ios: (
              <View
                style={[
                  {
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: appcolor.dark,
                  },
                  props.styleSelect,
                ]}
              />
            ),
          })
        : null}
    </View>
  );
};
