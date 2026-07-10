const CATEGORIES = [
  {
    title: "Filmen",
    icon: "🎥",
    tips: [
      "Houd de camera stil.",
      "Film met voldoende licht.",
      "Gebruik natuurlijk licht.",
      "Maak meerdere opnames.",
    ],
  },
  {
    title: "Geluid",
    icon: "🎙️",
    tips: ["Film op een rustige plek.", "Praat duidelijk.", "Controleer achtergrondgeluid."],
  },
  {
    title: "Presenteren",
    icon: "😄",
    tips: ["Lach.", "Kijk in de camera.", "Praat rustig.", "Wees jezelf."],
  },
  {
    title: "Bewerken",
    icon: "✂️",
    tips: ["Houd video's kort.", "Gebruik niet te veel effecten.", "Voeg muziek toe.", "Gebruik duidelijke overgangen."],
  },
];

export default function Tips() {
  return (
    <div>
      <div className="page-header">
        <h1>📖 Tips</h1>
      </div>
      {CATEGORIES.map((cat) => (
        <div key={cat.title} className="card tip-category">
          <h2>
            {cat.icon} {cat.title}
          </h2>
          <ul>
            {cat.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
