export default function AudioPlayer({ src, ...props }) {
  if (!src) {
    return <p>Audio is not available yet.</p>;
  }

  return <audio className="audio-player" controls src={src} {...props} />;
}
