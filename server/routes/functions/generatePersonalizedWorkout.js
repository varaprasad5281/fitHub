/**
 * Replaces: base44/functions/generatePersonalizedWorkout/entry.ts
 */
const https = require('https');
const Profile = require('../../models/Profile');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const Workout = require('../../models/Workout');
const { invokeLLM } = require('../../services/ai');

/** Fire-and-forget GET - warms the Pollinations cache before the user opens the modal */
function prewarm(url) {
  https.get(url, (res) => res.resume()).on('error', () => {});
}

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
      prompt: `${context}\n\nCreate a structured workout. Return ONLY compact JSON (no extra whitespace):\n{"workout_name":"...","exercises":[{"name":"...","sets":3,"reps":"10","weight_recommendation":"...","instructions":"..."}],"estimated_duration":${workoutDuration},"calories_burned":300,"difficulty":"${workoutDifficulty}","personalization_notes":"..."}`,
      response_json_schema: {
        type: 'object',
        properties: {
          workout_name: { type: 'string' },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'string' },
                weight_recommendation: { type: 'string' },
                instructions: { type: 'string' },
              },
            },
          },
          estimated_duration: { type: 'number' },
          calories_burned: { type: 'number' },
          difficulty: { type: 'string' },
          personalization_notes: { type: 'string' },
        },
      },
    });
  } catch (aiErr) {
    console.error('[generatePersonalizedWorkout] AI error, using fallback:', aiErr.message);
    workoutPlan = {
      workout_name: `${workoutFocus.charAt(0).toUpperCase() + workoutFocus.slice(1)} Workout`,
      exercises: [
        { name: 'Warm-up Jog / March in Place', sets: 1, reps: '5 min', weight_recommendation: 'Bodyweight', instructions: 'Keep a comfortable pace to raise heart rate.' },
        { name: 'Bodyweight Squat', sets: 3, reps: '15', weight_recommendation: 'Bodyweight', instructions: 'Feet shoulder-width apart, lower until thighs parallel to floor.' },
        { name: 'Push-up', sets: 3, reps: '10-15', weight_recommendation: 'Bodyweight', instructions: 'Keep core tight, lower chest to floor, push back up.' },
        { name: 'Reverse Lunge', sets: 3, reps: '10 each leg', weight_recommendation: 'Bodyweight', instructions: 'Step back, lower rear knee toward floor, return to standing.' },
        { name: 'Plank Hold', sets: 3, reps: '30 sec', weight_recommendation: 'Bodyweight', instructions: 'Elbows under shoulders, body in a straight line.' },
        { name: 'Glute Bridge', sets: 3, reps: '15', weight_recommendation: 'Bodyweight', instructions: 'Lie on back, feet flat, drive hips up and squeeze glutes.' },
      ],
      estimated_duration: workoutDuration,
      calories_burned: 250,
      difficulty: workoutDifficulty,
      personalization_notes: 'Solid full-body workout suitable for all levels.',
    };
  }

  // Attach a deterministic Pollinations image URL to every exercise
  const exercisesWithImages = workoutPlan.exercises.map((ex) => {
    const seed = ex.name.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const prompt = encodeURIComponent(
      `man doing ${ex.name} exercise in gym, fitness, correct form, realistic photo`
    );
    return {
      ...ex,
      image_url: `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&seed=${seed}&nologo=true`,
    };
  });

  // Pre-warm all exercise images so Pollinations caches them before the user opens the modal
  exercisesWithImages.forEach((ex) => prewarm(ex.image_url));

  const savedWorkout = await Workout.create({
    created_by: user.email,
    workout_name: workoutPlan.workout_name,
    exercises: exercisesWithImages,
    estimated_duration: workoutPlan.estimated_duration,
    calories_burned: workoutPlan.calories_burned,
    difficulty: workoutPlan.difficulty,
  });

  res.json({
    success: true,
    workout: { ...savedWorkout.toObject(), personalization_notes: workoutPlan.personalization_notes },
  });
};
