import { useLanguage } from "../context/LanguageContext";

export default function VideoPlanner() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="page-header">
        <h1>{t.videoPlanner.title}</h1>
      </div>
      <p>{t.videoPlanner.intro}</p>
      {t.videoPlanner.steps.map((step) => (
        <div key={step.title} className="card planner-step">
          <h2>{step.title}</h2>
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
