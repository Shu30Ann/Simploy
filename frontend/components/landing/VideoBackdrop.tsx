export default function VideoBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "sepia(0.3) hue-rotate(175deg) saturate(1.6) contrast(1.2) brightness(0.85)",
        }}
        src="/videos/busy_street.mp4"
      />
      {/* Blue tint */}
      <div className="absolute inset-0 bg-[#16345E]/35 mix-blend-multiply" />
      {/* CRT scanlines + vignette */}
      <div className="absolute inset-0 crt-scanlines" />
      <div className="absolute inset-0 crt-vignette" />
      {/* Dark scrim behind hero text for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(8,16,35,0.55) 0%, rgba(8,16,35,0.30) 55%, transparent 80%)",
        }}
      />
      {/* Cream blend under navbar */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(247,243,234,0.5) 0%, transparent 20%)",
        }}
      />
    </div>
  );
}
