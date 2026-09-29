import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, Plus, Send, X, ThumbsUp } from 'lucide-react';
import { sound } from '../utils/audio';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [comment, setComment] = useState('');
  const [favoriteItem, setFavoriteItem] = useState('Paneer Tikka Grilled Sandwich');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.warn('Could not fetch reviews:', e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim() || 'Happy Customer',
          rating,
          comment: comment.trim(),
          item: favoriteItem
        })
      });

      if (res.ok) {
        sound.playSuccess();
        const data = await res.json();
        setReviews((prev) => [data.review, ...prev]);
        setComment('');
        setShowAddReview(false);
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 4000);
      }
    } catch (err) {
      alert('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Average Rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <section className="my-10 bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-stone-800 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute -top-10 right-0 w-72 h-72 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-950/80 px-2.5 py-0.5 rounded-full border border-orange-800/60">
              Community Love
            </span>
            <div className="flex items-center text-amber-400 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              <span>{avgRating} / 5.0</span>
              <span className="text-stone-400 font-medium ml-1.5">({reviews.length}+ ratings)</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            What Adda Lovers Say 🥪
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real feedback from our happy foodies in Meerut.
          </p>
        </div>

        <button
          onClick={() => setShowAddReview(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {successNotice && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl flex items-center gap-2 text-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Thank you! Your review is now live on Sandwich Adda! 🎉</span>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {reviews.slice(0, 6).map((rev) => (
          <div
            key={rev.id}
            className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/40 transition-colors"
          >
            <div>
              {/* Star Rating & Verified */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                      }`}
                    />
                  ))}
                </div>
                {rev.verified && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Order
                  </span>
                )}
              </div>

              {/* Comment */}
              <p className="text-xs text-stone-200 leading-relaxed font-medium mb-3 italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Author and item */}
            <div className="pt-2.5 border-t border-stone-700/50 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-white block">{rev.customerName}</span>
                <span className="text-orange-400 text-[10px] block truncate max-w-[170px]">
                  Ordered: {rev.item || 'Grilled Sandwich'}
                </span>
              </div>
              <span className="text-stone-400 text-[10px]">{rev.date || 'Recent'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      {showAddReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddReview(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⭐</span>
              <h3 className="text-lg font-black text-white">Rate Sandwich Adda</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Share your experience with crispy, cheesy grilled goodness!
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              {/* Star Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-extrabold text-amber-300">
                    {rating === 5 ? 'Loved it! 😍' : rating === 4 ? 'Great! 👍' : 'Good'}
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Item Enjoyed */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  What did you order?
                </label>
                <select
                  value={favoriteItem}
                  onChange={(e) => setFavoriteItem(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-orange-500"
                >
                  <option value="Paneer Tikka Grilled Sandwich">Paneer Tikka Grilled Sandwich</option>
                  <option value="Cheese Burst Sandwich">Cheese Burst Sandwich</option>
                  <option value="Custom Chef Sandwich">Custom Chef Sandwich</option>
                  <option value="Corn & Cheese Burst Sandwich">Corn & Cheese Burst Sandwich</option>
                  <option value="Thick Chocolate Cold Coffee">Thick Chocolate Cold Coffee</option>
                  <option value="Peri Peri Crispy French Fries">Peri Peri Crispy French Fries</option>
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Your Review / Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the taste, crispiness, and delivery speed?"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Review...' : 'Publish Review'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
