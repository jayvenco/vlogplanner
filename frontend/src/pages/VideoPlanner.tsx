const STEPS = [
  {
    title: "1. Intro (5-10 sec)",
    icon: "🎬",
    points: ["Wie ben je?", "Wat gaan we vandaag doen?", "Maak nieuwsgierig."],
  },
  {
    title: "2. Begin",
    icon: "🚀",
    points: ["Leg uit wat je gaat doen."],
  },
  {
    title: "3. Midden",
    icon: "🌟",
    points: ["Laat de leukste momenten zien.", "Gebruik verschillende camerastandpunten."],
  },
  {
    title: "4. Einde",
    icon: "🏁",
    points: ["Vertel wat je hebt geleerd.", "Vraag om een like of abonnement.", "Bedank de kijker."],
  },
];

export default function VideoPlanner() {
  return (
    <div>
      <div className="page-header">
        <h1>📝 Video Planner</h1>
      </div>
      <p>Zo bouw je een leuke video op:</p>
      {STEPS.map((step) => (
        <div key={step.title} className="card planner-step">
          <h2>
            {step.icon} {step.title}
          </h2>
          <ul>
            {step.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
