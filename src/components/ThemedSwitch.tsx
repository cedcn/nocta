import React from 'react';
import { Switch, SwitchProps } from 'react-native';
import { colors } from '../theme';

export default function ThemedSwitch({ value, ...rest }: SwitchProps) {
  return (
    <Switch
      value={value}
      trackColor={{ true: colors.accentDark, false: colors.trackInactive }}
      // Android otherwise paints the thumb with the Material default teal
      thumbColor={value ? colors.textOnColor : colors.textSecondary}
      ios_backgroundColor={colors.trackInactive}
      {...rest}
    />
  );
}
