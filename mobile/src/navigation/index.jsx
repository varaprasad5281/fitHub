import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { enableScreens } from 'react-native-screens';

// Must be called before any navigator renders
enableScreens();

import { useAuth } from '../lib/AuthContext';
import { COLORS } from '../lib/theme';

// Auth screens
import LoginScreen        from '../screens/auth/LoginScreen';
import RegisterScreen     from '../screens/auth/RegisterScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main screens
import HomeScreen         from '../screens/main/HomeScreen';
import WorkoutsScreen     from '../screens/main/WorkoutsScreen';
import NutritionScreen    from '../screens/main/NutritionScreen';
import ProgressScreen     from '../screens/main/ProgressScreen';
import ProfileScreen      from '../screens/main/ProfileScreen';
import CoachingScreen     from '../screens/main/CoachingScreen';
import ChallengesScreen   from '../screens/main/ChallengesScreen';
import LeaderboardScreen  from '../screens/main/LeaderboardScreen';
import BadgesScreen       from '../screens/main/BadgesScreen';
import FriendsScreen      from '../screens/main/FriendsScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS = {
  Home:      { active: '🏠', inactive: '🏠' },
  Workouts:  { active: '🏋️', inactive: '🏋️' },
  Nutrition: { active: '🥗', inactive: '🥗' },
  Progress:  { active: '📈', inactive: '📈' },
  Profile:   { active: '👤', inactive: '👤' },
};

const screenOptions = {
  headerStyle:      { backgroundColor: COLORS.background },
  headerTintColor:  COLORS.text,
  headerTitleStyle: { fontWeight: '700', fontSize: 16 },
  headerShadowVisible: false,
  contentStyle:     { backgroundColor: COLORS.background },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 68,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSubtle,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
              {icons?.active || '●'}
            </Text>
          );
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      />
      <Tab.Screen name="Workouts"  component={WorkoutsScreen}  />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Progress"  component={ProgressScreen}  />
      <Tab.Screen name="Profile"   component={ProfileScreen}   />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs"    component={TabNavigator}       options={{ headerShown: false }} />
      <Stack.Screen name="Coaching"    component={CoachingScreen}     options={{ title: 'AI Coaching' }} />
      <Stack.Screen name="Challenges"  component={ChallengesScreen}   options={{ title: 'Challenges' }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen}  options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="Badges"      component={BadgesScreen}       options={{ title: 'Badges' }} />
      <Stack.Screen name="Friends"     component={FriendsScreen}      options={{ title: 'Friends' }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Subscription' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login"         component={LoginScreen} />
      <Stack.Screen name="Register"      component={RegisterScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoText}>7%</Text>
        </View>
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: COLORS.accentBg,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoText: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.accent,
  },
});
