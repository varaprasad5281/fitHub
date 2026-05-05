import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/theme';

export default function Card({ children, style, accent = false }) {
  return (
    <View style={[styles.card, accent && styles.accent, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  accent: {
    borderColor: COLORS.accentBorder,
  },
});
