import React, { useState } from 'react';
import { ReelItem } from '../types';
import { Heart, Eye, Play, MapPin, Share2 } from 'lucide-react';

interface ReelsViewProps {
  reels: ReelItem[];
  onOpenAd?: (adId: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({ reels }) => {
  const [likesState, setLikesState] = useState<{ [id: string]: boolean }>({});
  const [likesCountState, setLikesCountState] = useState<{ [id: string]: number }>(() =>
    reels.reduce((acc, r) => ({ ...acc, [r.id]: r.likesCount }), {})
  );

  const toggleLike = (id: string) => {
    const isLiked = !!likesState[id];
    setLikesState((prev) => ({ ...prev, [id]: !isLiked }));
    setLikesCountState((prev) => ({
      ...prev,
      [id]: isLiked ? prev[id] - 1 : prev[id] + 1
    }));
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-black text-navy-900">ريلز فلسطين 🎬</h2>
        <p className="text-xs text-slate-500">فيديوهات قصيرة وعروض منتجات ومطاعم وأجواء فلسطينية</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reels.map((reel) => {
          const isLiked = !!likesState[reel.id];
          const likes = likesCountState[reel.id] ?? reel.likesCount;

          return (
            <div
              key={reel.id}
              className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[9/14] shadow-lg group"
            >
              <img
                src={reel.thumbnailUrl}
                alt={reel.title}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

              {/* Play Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current mr-0.5" />
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-navy-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {reel.category}
                </span>
              </div>

              {/* Right Side Social Actions */}
              <div className="absolute bottom-16 left-3 flex flex-col items-center gap-3 text-white">
                <button
                  onClick={() => toggleLike(reel.id)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition active:scale-90 ${
                    isLiked ? 'bg-palestine-red text-white' : 'bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <span className="text-[10px] font-bold -mt-2">{likes}</span>

                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold -mt-2">{reel.viewsCount}</span>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: reel.title, url: window.location.href });
                    }
                  }}
                  className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-3 right-3 left-16 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{reel.city}</span>
                  <span>· {reel.publisherName}</span>
                </div>
                <h3 className="text-sm font-extrabold line-clamp-2 leading-tight">
                  {reel.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
