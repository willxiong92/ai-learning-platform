"use client";

export function PronunciationButton({ name }: { name: string }) {
  function handleClick() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(name);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  }

  return (
    <button
      type="button"
      className="pronunciation-button"
      aria-label={`听 ${name} 的英文发音`}
      title={`听 ${name} 的英文发音`}
      onClick={handleClick}
    >
      <i className="ti ti-volume" aria-hidden="true" />
    </button>
  );
}
