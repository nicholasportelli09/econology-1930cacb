import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { getCreators } from "@/data/youtubeCreators";
import { supabase } from "@/integrations/supabase/client";
import { Play, ExternalLink, RefreshCw, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  published: string;
  thumbnail: string;
  description: string;
}

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

const Videos = () => {
  const profile = useMemo(getProfile, []);
  const creators = useMemo(getCreators, []);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const channelIds = creators.map((c) => c.channelId);
      const { data, error: fnError } = await supabase.functions.invoke(
        "youtube-videos",
        {
          body: {
            channelIds,
            userProfile: {
              financialGoals: profile.financialGoals,
              topicsOfInterest: profile.topicsOfInterest,
              studentStatus: profile.studentStatus,
              learningStyle: profile.learningStyle,
            },
          },
        }
      );

      if (fnError) throw new Error(fnError.message);
      setVideos(data?.videos ?? []);
    } catch (e: any) {
      console.error("Failed to fetch videos:", e);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-8 space-y-8">
        {/* Header */}
        <section className="flex items-start justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Recommended Videos
            </h1>
            <p className="text-muted-foreground">
              AI-curated from trusted financial educators — personalized for you
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Info size={18} />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">How This Works</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    We pull the latest videos from a curated list of <strong className="text-foreground">trusted financial educators</strong> — no clickbait, no scams, no "get rich quick" nonsense.
                  </p>
                  <p>
                    Our AI then <strong className="text-foreground">ranks these videos</strong> based on your profile — your financial goals, topics of interest, and learning style — so you see the most relevant content first.
                  </p>
                  <p>
                    You can <strong className="text-foreground">manage your creator list</strong> in Settings to add or remove channels.
                  </p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs">
                      Videos are sourced from public YouTube RSS feeds. We have no affiliation with any creator.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video, i) => (
              <div
                key={video.id}
                className="group rounded-xl border border-border bg-card overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Thumbnail / Player */}
                <div className="relative aspect-video bg-muted">
                  {selectedVideo === video.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                      title={video.title}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      onClick={() => setSelectedVideo(video.id)}
                      className="w-full h-full relative"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play size={24} className="text-primary-foreground ml-1" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate">
                      {video.channelName}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(video.published)}
                    </span>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors pt-1"
                  >
                    Watch on YouTube <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && !error && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No videos found</p>
            <p className="text-sm mt-1">
              Try adding creators in Settings or refreshing.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;
