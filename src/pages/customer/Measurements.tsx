import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/auth';
import { Measurement, CustomerProfile } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Measurements: React.FC = () => {
  const { profile } = useAuthStore();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    height_cm: '',
    bust_cm: '',
    waist_cm: '',
    hip_cm: '',
    shoulder_cm: '',
    arm_length_cm: '',
    inseam_cm: '',
    chest_cm: '',
    neck_cm: '',
    notes: '',
  });

  useEffect(() => {
    fetchMeasurements();
  }, [profile]);

  const fetchMeasurements = async () => {
    if (!profile || profile.id === undefined) return;

    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('customer_id', (profile as CustomerProfile).id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setMeasurements(data);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const data = {
        ...formData,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        bust_cm: formData.bust_cm ? parseFloat(formData.bust_cm) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
        shoulder_cm: formData.shoulder_cm ? parseFloat(formData.shoulder_cm) : null,
        arm_length_cm: formData.arm_length_cm ? parseFloat(formData.arm_length_cm) : null,
        inseam_cm: formData.inseam_cm ? parseFloat(formData.inseam_cm) : null,
        chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
        neck_cm: formData.neck_cm ? parseFloat(formData.neck_cm) : null,
        customer_id: (profile as CustomerProfile).id,
        is_primary: measurements.length === 0,
      };

      if (editingId) {
        const { error } = await supabase
          .from('measurements')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('measurements').insert(data);
        if (error) throw error;
      }

      setFormData({
        height_cm: '',
        bust_cm: '',
        waist_cm: '',
        hip_cm: '',
        shoulder_cm: '',
        arm_length_cm: '',
        inseam_cm: '',
        chest_cm: '',
        neck_cm: '',
        notes: '',
      });
      setEditingId(null);
      setShowForm(false);
      await fetchMeasurements();
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      try {
        const { error } = await supabase
          .from('measurements')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchMeasurements();
      } catch (error) {
        console.error('Error deleting measurement:', error);
      }
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setFormData({
      height_cm: measurement.height_cm?.toString() || '',
      bust_cm: measurement.bust_cm?.toString() || '',
      waist_cm: measurement.waist_cm?.toString() || '',
      hip_cm: measurement.hip_cm?.toString() || '',
      shoulder_cm: measurement.shoulder_cm?.toString() || '',
      arm_length_cm: measurement.arm_length_cm?.toString() || '',
      inseam_cm: measurement.inseam_cm?.toString() || '',
      chest_cm: measurement.chest_cm?.toString() || '',
      neck_cm: measurement.neck_cm?.toString() || '',
      notes: measurement.notes || '',
    });
    setEditingId(measurement.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Measurements</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Add Measurement
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Measurement' : 'Add New Measurement'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Height (cm)', name: 'height_cm' },
                  { label: 'Bust (cm)', name: 'bust_cm' },
                  { label: 'Waist (cm)', name: 'waist_cm' },
                  { label: 'Hip (cm)', name: 'hip_cm' },
                  { label: 'Shoulder (cm)', name: 'shoulder_cm' },
                  { label: 'Arm Length (cm)', name: 'arm_length_cm' },
                  { label: 'Inseam (cm)', name: 'inseam_cm' },
                  { label: 'Chest (cm)', name: 'chest_cm' },
                  { label: 'Neck (cm)', name: 'neck_cm' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  {editingId ? 'Update' : 'Save'} Measurement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {measurements.map((measurement) => (
            <div key={measurement.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {measurement.is_primary ? 'Primary Measurement' : 'Alternative Measurement'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(measurement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(measurement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Height', value: measurement.height_cm },
                  { label: 'Bust', value: measurement.bust_cm },
                  { label: 'Waist', value: measurement.waist_cm },
                  { label: 'Hip', value: measurement.hip_cm },
                  { label: 'Shoulder', value: measurement.shoulder_cm },
                  { label: 'Arm Length', value: measurement.arm_length_cm },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-semibold text-gray-900">
                      {item.value ? `${item.value} cm` : '—'}
                    </span>
                  </div>
                ))}
              </div>

              {measurement.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Notes:</p>
                  <p className="text-sm text-gray-600">{measurement.notes}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                Added: {new Date(measurement.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {measurements.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No measurements yet. Add your first one to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              <Plus size={20} />
              Add Measurement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Measurements;
