import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { TailorProfile, TailorReview } from '../../types';
import { Star, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';

export const TailorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tailor, setTailor] = useState<TailorProfile | null>(null);
  const [reviews, setReviews] = useState<TailorReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tailorData } = await supabase
          .from('tailor_profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (tailorData) {
          setTailor(tailorData);

          const { data: reviewsData } = await supabase
            .from('tailor_reviews')
            .select('*')
            .eq('tailor_id', tailorData.id)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

          if (reviewsData) {
            setReviews(reviewsData);
          }
        }
      } catch (error) {
        console.error('Error fetching tailor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tailor details...</p>
        </div>
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tailor not found</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {tailor.business_image_url && (
            <img
              src={tailor.business_image_url}
              alt={tailor.business_name}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{tailor.business_name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(tailor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">{tailor.rating.toFixed(1)}</span>
                <span className="text-gray-600">({tailor.total_orders} orders)</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-600 mb-6">{tailor.bio || 'Professional tailor with quality stitching expertise.'}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{tailor.address}, {tailor.city}, {tailor.state} {tailor.postal_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{tailor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{tailor.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Experience</p>
                    <p className="text-2xl font-bold text-gray-900">{tailor.experience_years || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Radius</p>
                    <p className="text-2xl font-bold text-gray-900">{tailor.service_radius_km} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {tailor.specializations.map((spec) => (
                        <span key={spec} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/customer/place-order/${tailor.user_id}`)}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">{review.title}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TailorDetail;
