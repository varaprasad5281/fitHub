import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { api } from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../lib/theme';

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.functions.invoke('requestPasswordReset', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (e) {
      setError(e.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Reset password</Text>
        <Text style={styles.subheading}>
          Enter your email and we'll send you a reset link.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✓ Reset email sent! Check your inbox and follow the link to set a new password.
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <Button onPress={handleReset} loading={loading} style={{ marginTop: 8 }}>
              Send Reset Link
            </Button>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remembered it? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  backBtn: { marginBottom: 32 },
  backText: { color: COLORS.accent, fontSize: 14, fontWeight: '500' },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subheading: { fontSize: 15, color: COLORS.textMuted, marginBottom: 28 },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 13 },
  successBox: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: 12,
    padding: 16,
  },
  successText: { color: COLORS.success, fontSize: 14, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  footerLink: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
});
