import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const FITNESS_GOALS = ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'];
const ACTIVITY_LEVELS = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'];
const WORKOUT_PREFS = ['home', 'gym', 'outdoor', 'mixed'];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.entities.Profile.list(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: points = [] } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.entities.Points.list(),
    staleTime: 1000 * 60 * 2,
  });

  const profile = profiles[0];
  const totalPoints = points[0]?.total_points || 0;

  const [age, setAge]             = useState('');
  const [weight, setWeight]       = useState('');
  const [height, setHeight]       = useState('');
  const [gender, setGender]       = useState('');
  const [fitnessGoal, setFitnessGoal]       = useState('');
  const [activityLevel, setActivityLevel]   = useState('');
  const [workoutPref, setWorkoutPref]       = useState('');

  const openEdit = () => {
    if (profile) {
      setAge(String(profile.age || ''));
      setWeight(String(profile.weight_kg || ''));
      setHeight(String(profile.height_cm || ''));
      setGender(profile.gender || '');
      setFitnessGoal(profile.fitness_goal || '');
      setActivityLevel(profile.activity_level || '');
      setWorkoutPref(profile.workout_preference || '');
    }
    setEditMode(true);
  };

  const saveProfile = useMutation({
    mutationFn: async () => {
      const data = {
        age: parseInt(age) || undefined,
        weight_kg: parseFloat(weight) || undefined,
        height_cm: parseFloat(height) || undefined,
        gender,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        workout_preference: workoutPref,
      };
      if (profile?.id) {
        return api.entities.Profile.update(profile.id, data);
      } else {
        return api.entities.Profile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditMode(false);
    },
  });

  const menuItems = [
    { icon: '🏆', label: 'Challenges',   screen: 'Challenges' },
    { icon: '🥇', label: 'Leaderboard',  screen: 'Leaderboard' },
    { icon: '🎖', label: 'Badges',       screen: 'Badges' },
    { icon: '👥', label: 'Friends',      screen: 'Friends' },
    { icon: '✨', label: 'Coaching',     screen: 'Coaching' },
    { icon: '💳', label: 'Subscription', screen: 'Subscription' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || '—'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>⚡ {totalPoints.toLocaleString()} points</Text>
          </View>
        </View>

        {/* Profile card */}
        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <Text style={styles.profileCardTitle}>Fitness Profile</Text>
              <TouchableOpacity onPress={openEdit} style={styles.editBtn}>
                <Text style={styles.editBtnText}>✏ Edit</Text>
              </TouchableOpacity>
            </View>
            {profile ? (
              <View style={styles.profileGrid}>
                {profile.age && <ProfileField label="Age" value={`${profile.age} yrs`} />}
                {profile.weight_kg && <ProfileField label="Weight" value={`${profile.weight_kg} kg`} />}
                {profile.height_cm && <ProfileField label="Height" value={`${profile.height_cm} cm`} />}
                {profile.gender && <ProfileField label="Gender" value={profile.gender} />}
                {profile.fitness_goal && <ProfileField label="Goal" value={profile.fitness_goal.replace('_', ' ')} />}
                {profile.activity_level && <ProfileField label="Activity" value={profile.activity_level.replace('_', ' ')} />}
                {profile.workout_preference && <ProfileField label="Prefers" value={profile.workout_preference} />}
              </View>
            ) : (
              <View style={styles.noProfile}>
                <Text style={styles.noProfileText}>No profile yet. Set up your fitness profile to get personalised workouts and meals.</Text>
                <Button onPress={openEdit} style={{ marginTop: 12 }}>Set Up Profile</Button>
              </View>
            )}
          </View>
        )}

        {/* Menu items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>More</Text>
          <View style={styles.menuGrid}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.screen}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={logout} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editMode} animationType="slide" transparent onRequestClose={() => setEditMode(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.formSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditMode(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}><Input label="Age" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><Input label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><Input label="Height (cm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="numeric" /></View>
                </View>

                <PickerField label="Gender" value={gender} options={['male', 'female', 'other']} onChange={setGender} />
                <PickerField label="Fitness Goal" value={fitnessGoal} options={FITNESS_GOALS} onChange={setFitnessGoal} />
                <PickerField label="Activity Level" value={activityLevel} options={ACTIVITY_LEVELS} onChange={setActivityLevel} />
                <PickerField label="Workout Preference" value={workoutPref} options={WORKOUT_PREFS} onChange={setWorkoutPref} />

                <Button onPress={() => saveProfile.mutate()} loading={saveProfile.isPending} style={{ marginTop: 8 }}>
                  Save Profile
                </Button>
                <View style={{ height: 32 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ProfileField({ label, value }) {
  return (
    <View style={styles.profileField}>
      <Text style={styles.profileFieldLabel}>{label}</Text>
      <Text style={styles.profileFieldValue}>{value}</Text>
    </View>
  );
}

function PickerField({ label, value, options, onChange }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pickerRow}>
        {options.map(o => (
          <TouchableOpacity
            key={o}
            onPress={() => onChange(o)}
            style={[styles.pickerBtn, value === o && styles.pickerBtnActive]}
          >
            <Text style={[styles.pickerBtnText, value === o && styles.pickerBtnTextActive]}>
              {o.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accentBg, borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.accent },
  userName: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  userEmail: { fontSize: 13, color: COLORS.textMuted, marginBottom: 10 },
  pointsBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
    backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  pointsBadgeText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },

  profileCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 20, marginBottom: 24,
  },
  profileCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  profileCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  editBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 99, backgroundColor: COLORS.accentBg,
    borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  editBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  profileField: {
    minWidth: '30%', flexGrow: 1,
    backgroundColor: COLORS.background, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 10,
  },
  profileFieldLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  profileFieldValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize' },
  noProfile: { alignItems: 'center', paddingVertical: 8 },
  noProfileText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  menuSection: { marginBottom: 24 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuItem: {
    width: '30%', flexGrow: 1,
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 16, alignItems: 'center',
  },
  menuIcon: { fontSize: 22, marginBottom: 6 },
  menuLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  signOutBtn: {
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    backgroundColor: COLORS.dangerBg, padding: 14, alignItems: 'center',
  },
  signOutText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  formSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', borderWidth: 1, borderColor: COLORS.border,
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
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pickerBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  pickerBtnActive: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accentBorder },
  pickerBtnText: { color: COLORS.textMuted, fontSize: 12, textTransform: 'capitalize' },
  pickerBtnTextActive: { color: COLORS.accent, fontWeight: '600' },
});
