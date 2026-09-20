import { useLanguage } from "../context/LanguageContext";
import DiarySection from "../components/DiarySection";

export default function Diary() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1>{t.diary.title}</h1>
      </div>
      <DiarySection />
    </div>
  );
}
