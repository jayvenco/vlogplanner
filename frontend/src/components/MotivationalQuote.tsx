export default function MotivationalQuote({ text }: { text: string }) {
  return (
    <div className="quote-banner">
      <span>✨</span> {text}
    </div>
  );
}
