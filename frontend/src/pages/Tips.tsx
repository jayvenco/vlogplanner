import { useLanguage } from "../context/LanguageContext";

export default function Tips() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="page-header">
        <h1>{t.tips.title}</h1>
      </div>
      {t.tips.categories.map((cat) => (
        <div key={cat.title} className="card tip-category">
          <h2>{cat.title}</h2>
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
