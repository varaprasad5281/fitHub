import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, X } from "lucide-react";

export default function WorkoutCustomizer({ workout, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exercises, setExercises] = useState(workout?.exercises || []);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '10-12',
    instructions: ''
  });

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;
    setExercises([...exercises, newExercise]);
    setNewExercise({ name: '', sets: 3, reps: '10-12', instructions: '' });
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSave = () => {
    onSave({ ...workout, exercises });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Pencil className="w-3 h-3 mr-1" /> Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Customize Workout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Exercises */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Exercises</h3>
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-start justify-between mb-2">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm flex-1"
                      placeholder="Exercise name"
                    />
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="ml-2 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Sets</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Reps</label>
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
                        placeholder="8-12"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Intensity</label>
                      <select
                        onChange={(e) => handleUpdateExercise(index, 'difficulty', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
                      >
                        <option>Medium</option>
                        <option>Light</option>
                        <option>Heavy</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-zinc-500 block mb-1">Instructions</label>
                    <textarea
                      value={exercise.instructions}
                      onChange={(e) => handleUpdateExercise(index, 'instructions', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs resize-none"
                      rows="2"
                      placeholder="Form tips, breathing, etc."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Exercise */}
          <div className="p-4 rounded-lg border-2 border-dashed border-zinc-700">
            <h3 className="text-sm font-semibold text-white mb-3">Add Exercise</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Exercise name"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
                  placeholder="Sets"
                  min="1"
                />
                <input
                  type="text"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
                  placeholder="Reps"
                />
                <input
                  type="text"
                  value={newExercise.instructions}
                  onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm"
                  placeholder="Notes"
                />
              </div>
              <Button
                onClick={handleAddExercise}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg h-10"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Exercise
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-lg"
            >
              Save Workout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}