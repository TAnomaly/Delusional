"use client";

import { useEffect, useRef } from "react";
import styles from "./VideoBackground.module.css";

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    let reqId: number;

    const fade = (targetOpacity: number, duration: number, callback?: () => void) => {
      cancelAnimationFrame(reqId);
      const startObj = parseFloat(vid.style.opacity) || 0;
      const start = performance.now();
      
      const animate = (time: number) => {
        const p = Math.min((time - start) / duration, 1);
        vid.style.opacity = (startObj + (targetOpacity - startObj) * p).toString();
        if (p < 1) {
          reqId = requestAnimationFrame(animate);
        } else if (callback) {
          callback();
        }
      };
      reqId = requestAnimationFrame(animate);
    };

    const handleLoadedData = () => {
      vid.style.opacity = '0';
      fade(1, 500);
    };

    const handleTimeUpdate = () => {
      // 500ms fade-out when 0.55s remain
      if (vid.duration - vid.currentTime <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        fade(0, 500);
      }
    };

    const handleEnded = () => {
      vid.style.opacity = '0';
      setTimeout(() => {
        vid.currentTime = 0;
        vid.play().catch(() => {});
        fadingOutRef.current = false;
        fade(1, 500);
      }, 100);
    };

    vid.addEventListener('loadeddata', handleLoadedData);
    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('ended', handleEnded);

    return () => {
      cancelAnimationFrame(reqId);
      vid.removeEventListener('loadeddata', handleLoadedData);
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        className={styles.video}
        autoPlay
        muted
        playsInline
        style={{ opacity: 0 }}
      />
      <div className={styles.overlay} />
    </div>
  );
}
