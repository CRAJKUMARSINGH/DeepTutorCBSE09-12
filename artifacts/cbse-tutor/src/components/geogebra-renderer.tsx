import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Maximize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeoGebraRendererProps {
  id: string;
  title: string;
}

export function GeoGebraRenderer({ id, title }: GeoGebraRendererProps) {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const iframeUrl = `https://www.geogebra.org/material/iframe/id/${id}/width/800/height/600/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`;

  return (
    <Card className={`overflow-hidden border shadow-md transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-[100] rounded-none' : 'relative rounded-2xl'}`}>
      <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Interactive Construction
          </CardTitle>
          <CardDescription className="text-xs">{title}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <a href={`https://www.geogebra.org/m/${id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </CardHeader>
      <CardContent className={`p-0 bg-white ${isFullScreen ? 'h-[calc(100vh-64px)]' : 'aspect-video'}`}>
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          allowFullScreen
          title={title}
        />
      </CardContent>
      {isFullScreen && (
        <button 
          onClick={() => setIsFullScreen(false)}
          className="fixed top-4 right-16 z-[110] bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          Close Fullscreen
        </button>
      )}
    </Card>
  );
}
