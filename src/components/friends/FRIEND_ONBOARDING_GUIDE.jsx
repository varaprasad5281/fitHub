# Friend Onboarding & Suggested Friends System

## Overview
Premium, optional friend onboarding system that encourages early social adoption without being pushy or spammy. All features are fully opt-in and respect user privacy.

## Components Implemented

### 1. **FriendOnboarding.jsx**
Multi-step modal shown after signup (first time only).

**Steps:**
- **Intro**: Brief explanation of benefits ("Consistency is stronger with accountability")
- **Suggested**: AI-powered friend suggestions
- **Search**: Manual username search

**Features:**
- Always has "Skip" button
- Non-intrusive modal design
- Three clear options to explore
- Fully optional

### 2. **SuggestedFriendsCard.jsx**
Reusable card component for displaying individual suggestions.

**Shows:**
- Avatar
- Username
- Context reasons (e.g., "Similar activity level", "3 mutual connections")
- "Add" button

### 3. **FriendComparison.jsx**
Accountability view shown after user adds first friend.

**Displays:**
- Current streak comparison
- Weekly points comparison
- Workouts completed comparison
- Badge count comparison
- Motivational message

### 4. **FriendSocialNudge.jsx**
Smart, non-spammy nudges at right times.

**Rules:**
- Shows max once every 3 days
- Only when user has 0 friends
- Small bottom-right toast style
- Easy to dismiss
- Professional tone

**Nudge Types:**
- "You're building momentum. Add someone to stay accountable."
- "Streak's looking strong. Share progress with a friend."
- "Achievement unlocked. Your circle should see this."

### 5. **FriendPrivacySettings.jsx**
Privacy controls integrated into profile/settings.

**Options:**
- Who can send friend requests (Everyone, Friends of Friends, Nobody)
- Hide from search results
- Disable from appearing in suggestions

---

## Backend Function: suggestedFriends.js

**Endpoint:** `/api/suggested-friends`

**Algorithm:**
Scores candidates based on:
1. **Similar fitness goal** (+30 points)
2. **Similar activity level** (+20 points)
3. **Same experience level** (+20 points)
4. **Same country** (+15 points)
5. **Mutual connections** (+25 points per mutual)
6. **Recently joined** (+10 points)

**Returns:** Top 10 scored candidates with reasons

**Privacy:**
- Excludes already-connected users
- Excludes users who have disabled suggestions
- Respects privacy settings

---

## Integration Points

### In Pages/Friends.jsx:
1. **Suggested Friends Section** - Top of Friends tab
2. **FriendOnboarding Modal** - Auto-shows on first visit
3. **FriendSocialNudge** - Renders for smart nudging

### In Pages/Profile.jsx:
1. **FriendPrivacySettings** - In settings section
2. **FriendComparison** - Shows after first friend added

---

## User Flow

### First-Time Users
1. Complete onboarding
2. See "Build Your Circle" modal
3. Option to:
   - View suggested friends
   - Search by username
   - Skip (always available)
4. After adding first friend → See accountability comparison

### Active Users
1. Smart nudges at right times (max once/3 days)
2. Suggested section in Friends tab
3. Privacy controls always available

---

## Privacy Safeguards

✅ **Fully Opt-In**
- No forced invites
- No auto-messaging
- No contact import without consent

✅ **User Control**
- Can disable suggestions
- Can hide from search
- Can control who requests them

✅ **Respectful Timing**
- Max one nudge per 3 days
- Never interrupts important actions
- Professional tone (no spam language)

✅ **Data Protection**
- Excludes opted-out users
- Respects privacy settings
- No PII in suggestions

---

## Success Metrics

Track these to measure effectiveness:
- % of new users adding ≥1 friend within 7 days
- Average friends added in first 30 days
- Time to first friend connection
- Nudge engagement rate
- Privacy setting adoption

---

## Future Enhancements

1. **Contact Import** - Phone contacts matching (fully opt-in)
2. **Referral Incentives** - Subtle badges for network growth
3. **Group Challenges** - Friends compete together
4. **Activity Notifications** - Friend milestone celebrations
5. **Leaderboard Friends Filter** - See how friends rank

---

## Notes

- System avoids childish rewards or gamification
- Tone is professional and motivational
- Privacy-first approach
- All features optional and easily skippable
- Designed for retention through accountability, not addiction