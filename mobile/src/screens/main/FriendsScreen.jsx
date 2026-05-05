import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function FriendsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');

  const { data: friendships = [], isLoading } = useQuery({
    queryKey: ['friendships'],
    queryFn: () => api.entities.Friendship.list(),
    staleTime: 1000 * 60 * 5,
  });

  const sendRequest = useMutation({
    mutationFn: () => api.functions.invoke('sendFriendRequest', { to_email: searchEmail.trim().toLowerCase() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      setShowAdd(false);
      setSearchEmail('');
    },
  });

  const respondRequest = useMutation({
    mutationFn: ({ id, action }) => api.functions.invoke('respondFriendRequest', { friendship_id: id, action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships'] }),
  });

  const accepted = friendships.filter(f => f.status === 'accepted');
  const pending  = friendships.filter(f => f.status === 'pending');

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>👥 Friends</Text>
            <Text style={styles.title}>Friends</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Pending requests */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requests ({pending.length})</Text>
            {pending.map(f => {
              const isIncoming = f.to_email === user?.email;
              return (
                <View key={f.id} style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {(isIncoming ? f.from_name : f.to_name || f.to_email)?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{isIncoming ? f.from_name : f.to_name || f.to_email}</Text>
                    <Text style={styles.friendMeta}>{isIncoming ? 'wants to be friends' : 'request sent'}</Text>
                  </View>
                  {isIncoming && (
                    <View style={styles.requestActions}>
                      <TouchableOpacity onPress={() => respondRequest.mutate({ id: f.id, action: 'accept' })} style={styles.acceptBtn}>
                        <Text style={styles.acceptBtnText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => respondRequest.mutate({ id: f.id, action: 'decline' })} style={styles.declineBtn}>
                        <Text style={styles.declineBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Friends list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends ({accepted.length})</Text>
          {accepted.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No friends yet. Add friends to see their progress and compete together!</Text>
            </View>
          ) : (
            accepted.map(f => {
              const friendName = f.from_email === user?.email ? f.to_name : f.from_name;
              const friendEmail = f.from_email === user?.email ? f.to_email : f.from_email;
              return (
                <View key={f.id} style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>{friendName?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{friendName || friendEmail}</Text>
                    {f.weekly_points !== undefined && (
                      <Text style={styles.friendMeta}>⚡ {f.weekly_points} pts this week</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.formSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Add Friend</Text>
                <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={{ padding: 20 }}>
                <Input
                  label="Friend's Email"
                  value={searchEmail}
                  onChangeText={setSearchEmail}
                  placeholder="friend@example.com"
                  keyboardType="email-address"
                />
                <Button onPress={() => sendRequest.mutate()} loading={sendRequest.isPending}>
                  Send Request
                </Button>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  addBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 99, backgroundColor: COLORS.accentBg,
    borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  addBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  friendAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accentBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  friendAvatarText: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  friendName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  friendMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    width: 32, height: 32, borderRadius: 99,
    backgroundColor: COLORS.successBg, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  acceptBtnText: { color: COLORS.success, fontSize: 14, fontWeight: '700' },
  declineBtn: {
    width: 32, height: 32, borderRadius: 99,
    backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  declineBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },
  emptyState: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, padding: 32, alignItems: 'center',
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  formSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 99,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 99, backgroundColor: COLORS.cardHover,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});
