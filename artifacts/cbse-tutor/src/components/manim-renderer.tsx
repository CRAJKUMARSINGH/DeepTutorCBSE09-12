import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManimRendererProps {
  url: string;
  title: string;
  thumbnail?: string;
}

export function ManimRenderer({ url, title, thumbnail }: ManimRendererProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <Card className="rounded-2xl overflow-hidden border shadow-md bg-zinc-950 text-white relative group">
      <CardHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent py-4 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          Mathematical Animation
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs">{title}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 aspect-video relative">
        <video
          ref={videoRef}
          src={url}
          poster={thumbnail}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-110 transition-transform">
              <Play className="h-8 w-8 fill-white text-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Custom Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 px-3 gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 text-white"
            onClick={restart}
          >
            <RotateCcw className="h-4 w-4" /> Restart
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 text-white"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
