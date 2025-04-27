import { useEffect, useRef } from "react";

interface TweetEmbedProps {
  tweetId: string;
}

const TweetEmbed = ({ tweetId }: TweetEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject script if not present
    const loadTwitterScript = () => {
      if (document.getElementById("twitter-wjs")) return;

      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    };

    loadTwitterScript();

    // Always trigger widgets load when tweet ID changes
    const interval = setInterval(() => {
      if ((window as { twttr?: { widgets?: { load: (element?: HTMLElement | null) => void } } }).twttr?.widgets?.load) {
        ((window as unknown) as { twttr: { widgets: { load: (element?: HTMLElement | null) => void } } }).twttr.widgets.load(containerRef.current);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [tweetId]);

  return (
    <div ref={containerRef}>
      <blockquote className="twitter-tweet">
        <a href={`https://twitter.com/i/web/status/${tweetId}`}></a>
      </blockquote>
    </div>
  );
};

export default TweetEmbed;