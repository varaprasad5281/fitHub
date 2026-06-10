const Profile = require('../../models/Profile');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const Workout = require('../../models/Workout');
const { invokeLLM } = require('../../services/ai');
const { getExerciseImage } = require('../../services/exerciseMedia');

const DAY_TEMPLATES = {
  1: [
    { day: 'monday',    focus: 'full body',         muscles: 'all major muscle groups' },
  ],
  2: [
    { day: 'monday',    focus: 'upper body',        muscles: 'chest, back, shoulders, arms' },
    { day: 'thursday',  focus: 'lower body',        muscles: 'quads, hamstrings, glutes, calves' },
  ],
  3: [
    { day: 'monday',    focus: 'upper body push',   muscles: 'chest, shoulders, triceps' },
    { day: 'wednesday', focus: 'lower body',        muscles: 'quads, hamstrings, glutes, calves' },
    { day: 'friday',    focus: 'full body',         muscles: 'all major muscle groups' },
  ],
  4: [
    { day: 'monday',    focus: 'upper body push',   muscles: 'chest, shoulders, triceps' },
    { day: 'tuesday',   focus: 'lower body',        muscles: 'quads, hamstrings, glutes' },
    { day: 'thursday',  focus: 'upper body pull',   muscles: 'back, biceps, rear delts' },
    { day: 'saturday',  focus: 'full body circuit', muscles: 'all major muscle groups' },
  ],
  5: [
    { day: 'monday',    focus: 'chest and triceps',  muscles: 'chest, triceps' },
    { day: 'tuesday',   focus: 'back and biceps',    muscles: 'back, biceps, rear delts' },
    { day: 'wednesday', focus: 'legs',               muscles: 'quads, hamstrings, glutes, calves' },
    { day: 'thursday',  focus: 'shoulders and core', muscles: 'shoulders, core, abs' },
    { day: 'saturday',  focus: 'full body HIIT',     muscles: 'all major muscle groups' },
  ],
  6: [
    { day: 'monday',    focus: 'chest',             muscles: 'chest, front delts' },
    { day: 'tuesday',   focus: 'back',              muscles: 'lats, rhomboids, rear delts' },
    { day: 'wednesday', focus: 'legs',              muscles: 'quads, hamstrings, glutes, calves' },
    { day: 'thursday',  focus: 'shoulders',         muscles: 'front, lateral and rear delts' },
    { day: 'friday',    focus: 'arms',              muscles: 'biceps, triceps, forearms' },
    { day: 'saturday',  focus: 'full body cardio',  muscles: 'all muscle groups with cardio emphasis' },
  ],
  7: [
    { day: 'monday',    focus: 'chest and triceps',       muscles: 'chest, triceps, front delts' },
    { day: 'tuesday',   focus: 'back and biceps',         muscles: 'lats, rhomboids, biceps, rear delts' },
    { day: 'wednesday', focus: 'legs',                    muscles: 'quads, hamstrings, glutes, calves' },
    { day: 'thursday',  focus: 'shoulders',               muscles: 'front, lateral and rear delts, traps' },
    { day: 'friday',    focus: 'arms and core',           muscles: 'biceps, triceps, forearms, abs' },
    { day: 'saturday',  focus: 'full body HIIT',          muscles: 'all major muscle groups' },
    { day: 'sunday',    focus: 'active recovery and core',muscles: 'core, mobility, light cardio' },
  ],
};

const FALLBACK_EXERCISES = [
  { name: 'Warm-up March in Place', sets: 1, reps: '3 min', weight_recommendation: 'Bodyweight', instructions: 'Light march to raise heart rate.' },
  { name: 'Bodyweight Squat',        sets: 3, reps: '15',    weight_recommendation: 'Bodyweight', instructions: 'Feet shoulder-width apart, lower until thighs parallel.' },
  { name: 'Push-up',                 sets: 3, reps: '12',    weight_recommendation: 'Bodyweight', instructions: 'Keep core tight, chest to floor, push back up.' },
  { name: 'Reverse Lunge',           sets: 3, reps: '10 each leg', weight_recommendation: 'Bodyweight', instructions: 'Step back, lower rear knee toward floor.' },
  { name: 'Plank Hold',              sets: 3, reps: '30 sec',weight_recommendation: 'Bodyweight', instructions: 'Elbows under shoulders, body in a straight line.' },
];

async function generateOneDayWorkout(template, { profile, difficulty, duration, equipment }) {
  const { day, focus, muscles } = template;

  let workoutPlan;
  try {
    workoutPlan = await invokeLLM({
      prompt: `Create a structured ${focus} workout for ${day}.
User: difficulty=${difficulty}, duration=${duration}min, equipment=${equipment}, fitness_goal=${profile.fitness_goal || 'general fitness'}.
Target muscles: ${muscles}.
Return ONLY compact JSON (no extra whitespace):
{"workout_name":"...","exercises":[{"name":"...","sets":3,"reps":"10","weight_recommendation":"...","instructions":"..."}],"estimated_duration":${duration},"calories_burned":300,"difficulty":"${difficulty}","personalization_notes":"..."}`,
      response_json_schema: {
        type: 'object',
        properties: {
          workout_name:         { type: 'string' },
          exercises:            { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, sets: { type: 'number' }, reps: { type: 'string' }, weight_recommendation: { type: 'string' }, instructions: { type: 'string' } } } },
          estimated_duration:   { type: 'number' },
          calories_burned:      { type: 'number' },
          difficulty:           { type: 'string' },
          personalization_notes:{ type: 'string' },
        },
      },
    });
  } catch {
    workoutPlan = {
      workout_name: `${focus.charAt(0).toUpperCase() + focus.slice(1)} Workout`,
      exercises: FALLBACK_EXERCISES,
      estimated_duration: duration,
      calories_burned: 250,
      difficulty,
      personalization_notes: `${focus} session for ${day}.`,
    };
  }

  const exercisesWithMedia = await Promise.all(
    (workoutPlan.exercises || []).map(async (ex) => {
      const imageUrl = await getExerciseImage(ex.name);
      return { ...ex, image_url: imageUrl || '' };
    })
  );

  return { workoutPlan, exercisesWithMedia };
}

module.exports = async (req, res) => {
  const user = req.user;
  const profile = await Profile.findOne({ created_by: user.email }) || {};
  const completions = await WorkoutCompletion.find({ created_by: user.email });
  const totalCompletions = completions.length;
  const customParams = req.body || {};

  const daysPerWeek = parseInt(customParams.days_per_week, 10) || 1;
  const selectedDays = [1, 2, 3, 4, 5, 6, 7].includes(daysPerWeek) ? daysPerWeek : 1;

  let difficulty = customParams.difficulty || profile.experience_level || 'beginner';
  if (!customParams.difficulty) {
    if (totalCompletions >= 30)      difficulty = 'advanced';
    else if (totalCompletions >= 15) difficulty = 'intermediate';
  }

  const duration  = parseInt(customParams.duration, 10) || profile.workout_duration || 45;
  const equipment = customParams.equipment || profile.available_equipment || 'none';

  const templates = DAY_TEMPLATES[selectedDays];

  // Generate all day workouts in parallel
  const generated = await Promise.all(
    templates.map(template =>
      generateOneDayWorkout(template, { profile, difficulty, duration, equipment })
    )
  );

  // Save all to the database
  const savedWorkouts = await Promise.all(
    templates.map(async (template, i) => {
      const { workoutPlan, exercisesWithMedia } = generated[i];
      return Workout.create({
        created_by:         user.email,
        workout_name:       workoutPlan.workout_name,
        exercises:          exercisesWithMedia,
        estimated_duration: workoutPlan.estimated_duration,
        calories_burned:    workoutPlan.calories_burned,
        difficulty:         workoutPlan.difficulty,
        day_of_week:        template.day,
      });
    })
  );

  return res.json({
    success:  true,
    workouts: savedWorkouts.map(w => w.toObject()),
    count:    savedWorkouts.length,
  });
};
