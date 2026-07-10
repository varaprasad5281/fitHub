/**
 * Replaces: base44/functions/generatePersonalizedWorkout/entry.ts
 */
const Profile = require('../../models/Profile');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const Workout = require('../../models/Workout');
const { invokeLLM } = require('../../services/ai');

module.exports = async (req, res) => {
  const user = req.user;

  // Profile is optional - use defaults if not set up yet
  const profile = await Profile.findOne({ created_by: user.email }) || {};

  const completions = await WorkoutCompletion.find({ created_by: user.email });
  const totalCompletions = completions.length;
  const customParams = req.body || {};

  // Determine workout focus
  let workoutFocus = customParams.focus;
  if (!workoutFocus) {
    const basePreference = profile.workout_preference || profile.fitness_goal;
    const variations = {
      gym: ['strength', 'hypertrophy', 'powerlifting', 'bodybuilding', 'explosive power', 'endurance strength'],
      home: ['bodyweight', 'calisthenics', 'functional', 'core focused', 'minimal equipment', 'movement quality'],
      outdoor: ['running intervals', 'park workout', 'hill training', 'outdoor circuit', 'functional movement', 'agility drills'],
      yoga: ['vinyasa flow', 'power yoga', 'flexibility', 'balance focused', 'restorative', 'mobility work'],
      hiit: ['tabata', 'circuit', 'intervals', 'metabolic conditioning', 'strength circuits', 'cardio bursts'],
      strength: ['upper body', 'lower body', 'push day', 'pull day', 'accessory focus', 'isometric training'],
      cardio: ['steady state', 'intervals', 'endurance', 'sprint training', 'circuit cardio', 'active recovery'],
      mixed: ['strength', 'cardio', 'functional', 'athletic', 'balanced training', 'sport specific'],
    };
    const variantList = variations[basePreference] || ['full body', 'upper body', 'lower body', 'core', 'balanced', 'functional'];
    const seedIndex = customParams.variation_seed != null
      ? Math.abs(customParams.variation_seed) % variantList.length
      : Math.floor(Math.random() * variantList.length);
    workoutFocus = variantList[seedIndex];
  }

  const workoutDuration = customParams.duration || profile.workout_duration || 45;
  const targetMuscles = customParams.target_muscles || '';
  let workoutDifficulty = customParams.difficulty || profile.experience_level || 'beginner';
  if (!customParams.difficulty) {
    if (totalCompletions >= 30) workoutDifficulty = 'advanced';
    else if (totalCompletions >= 15) workoutDifficulty = 'intermediate';
    else workoutDifficulty = profile.experience_level || 'beginner';
  }
  const workoutEquipment = customParams.equipment || profile.available_equipment || 'none';
  const userGoals = customParams.goals || [];

  const context = `
User Profile:
- Goal/Focus: ${workoutFocus}
- Activity Level: ${profile.activity_level}
- Available Equipment: ${workoutEquipment}
- Age: ${profile.age}
- Fitness Goal: ${profile.fitness_goal}
- Workout Preference: ${profile.workout_preference}
- Difficulty Level: ${workoutDifficulty}
- Duration: ${workoutDuration} minutes
${targetMuscles ? `- Target Muscles: ${targetMuscles}` : ''}
${userGoals.length > 0 ? `- Active Goals: ${userGoals.map((g) => `${g.name || g.type} (${g.target} ${g.unit})`).join(', ')}` : ''}
- Previous Completions: ${totalCompletions}`;

  let workoutPlan;
  try {
    workoutPlan = await invokeLLM({
      prompt: `${context}\n\nCreate a structured workout. There are no demo images or videos, so "instructions" is the user's only guidance for performing each exercise - write clear, step-by-step cues (starting position, the movement itself, breathing, and a common form mistake to avoid), in plain language, 2-4 sentences. Return ONLY compact JSON (no extra whitespace):\n{"workout_name":"...","exercises":[{"name":"...","sets":3,"reps":"10","weight_recommendation":"...","instructions":"..."}],"estimated_duration":${workoutDuration},"calories_burned":300,"difficulty":"${workoutDifficulty}","personalization_notes":"..."}`,
      response_json_schema: {
        type: 'object',
        properties: {
          workout_name: { type: 'string' },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name:                 { type: 'string' },
                sets:                 { type: 'number' },
                reps:                 { type: 'string' },
                weight_recommendation:{ type: 'string' },
                instructions:         { type: 'string' },
              },
            },
          },
          estimated_duration:   { type: 'number' },
          calories_burned:      { type: 'number' },
          difficulty:           { type: 'string' },
          personalization_notes:{ type: 'string' },
        },
      },
    });
  } catch (aiErr) {
    console.error('[generatePersonalizedWorkout] AI error, using fallback:', aiErr.message);
    workoutPlan = {
      workout_name: `${workoutFocus.charAt(0).toUpperCase() + workoutFocus.slice(1)} Workout`,
      exercises: [
        { name: 'Warm-up Jog / March in Place', sets: 1, reps: '5 min', weight_recommendation: 'Bodyweight', instructions: 'Stand tall and march or jog in place at a comfortable pace to gradually raise your heart rate. Breathe steadily through your nose. Avoid starting too fast - the goal is to warm up, not tire out.' },
        { name: 'Bodyweight Squat', sets: 3, reps: '15', weight_recommendation: 'Bodyweight', instructions: 'Stand with feet shoulder-width apart, toes slightly out. Bend your knees and push your hips back as if sitting into a chair, lowering until thighs are parallel to the floor, then drive through your heels back to standing. Keep your chest up and exhale on the way up. Avoid letting your knees cave inward.' },
        { name: 'Push-up', sets: 3, reps: '10-15', weight_recommendation: 'Bodyweight', instructions: 'Start in a plank with hands slightly wider than shoulders. Keep your core tight and body in a straight line as you lower your chest toward the floor, elbows at about a 45-degree angle, then push back up. Exhale as you push up. Avoid letting your hips sag or pike up.' },
        { name: 'Reverse Lunge', sets: 3, reps: '10 each leg', weight_recommendation: 'Bodyweight', instructions: 'Stand tall, then step one foot back and lower your rear knee toward the floor until both knees are bent about 90 degrees. Push through your front heel to return to standing. Keep your torso upright and breathe out as you rise. Avoid letting your front knee collapse inward or pass too far forward over your toes.' },
        { name: 'Plank Hold', sets: 3, reps: '30 sec', weight_recommendation: 'Bodyweight', instructions: 'Rest on your forearms and toes with elbows directly under your shoulders, body forming a straight line from head to heels. Squeeze your core and glutes, and breathe normally throughout. Avoid letting your hips sag down or pike up toward the ceiling.' },
        { name: 'Glute Bridge', sets: 3, reps: '15', weight_recommendation: 'Bodyweight', instructions: 'Lie on your back with knees bent and feet flat, hip-width apart. Drive through your heels to lift your hips up, squeezing your glutes at the top, then lower back down with control. Exhale as you lift. Avoid overarching your lower back at the top.' },
      ],
      estimated_duration: workoutDuration,
      calories_burned: 250,
      difficulty: workoutDifficulty,
      personalization_notes: 'Solid full-body workout suitable for all levels.',
    };
  }

  // Remove any existing incomplete single workouts so regenerating doesn't
  // leave behind duplicate entries for this user. Custom (user-created)
  // workouts are left untouched.
  await Workout.deleteMany({
    created_by: user.email,
    day_of_week: null,
    is_completed: false,
    is_custom: { $ne: true },
  });

  const savedWorkout = await Workout.create({
    created_by: user.email,
    workout_name: workoutPlan.workout_name,
    exercises: workoutPlan.exercises,
    estimated_duration: workoutPlan.estimated_duration,
    calories_burned: workoutPlan.calories_burned,
    difficulty: workoutPlan.difficulty,
  });

  res.json({
    success: true,
    workout: { ...savedWorkout.toObject(), personalization_notes: workoutPlan.personalization_notes },
  });
};
