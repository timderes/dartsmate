import { Badge } from "@mantine/core";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

type VideoStreamProps = {
  stream: MediaStream | null;
  muted?: boolean;
  label?: string;
  autoPlay?: boolean;
  mirrored?: boolean;
};

const VideoStream = forwardRef<HTMLVideoElement, VideoStreamProps>(
  (
    { stream, muted = false, label, autoPlay = true, mirrored = false },
    ref,
  ) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => localVideoRef.current!);

    useEffect(() => {
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "200px",
          backgroundColor: "#000",
          overflow: "hidden",
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay={autoPlay}
          playsInline
          muted={muted}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: mirrored ? "scaleX(-1)" : "none",
          }}
        />
        {label && (
          <Badge
            color="dark"
            style={{ position: "absolute", bottom: 10, left: 10, opacity: 0.8 }}
          >
            {label}
          </Badge>
        )}
      </div>
    );
  },
);

VideoStream.displayName = "VideoStream";

export default VideoStream;
