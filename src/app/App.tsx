import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { WordDetailPage } from "@/pages/WordDetailPage";
import { StudySessionPage } from "@/pages/StudySessionPage";
import { DictionaryPage } from "@/pages/DictionaryPage";
import { useLearningStore } from "@/stores/learning-store";

export function App() {
  const hydrated = useLearningStore((state) => state.hydrated);
  const initialize = useLearningStore((state) => state.initialize);
  useEffect(() => { void initialize(); }, [initialize]);

  if (!hydrated) return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">正在读取本地学习数据…</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="library/:categoryId" element={<CategoryPage />} />
          <Route path="words/:wordId" element={<WordDetailPage />} />
          <Route path="learn" element={<StudySessionPage />} />
          <Route path="dictionary" element={<DictionaryPage />} />
          <Route path="settings" element={<ComingSoon title="设置" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border bg-card p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">这个页面将在后续阶段接入本地数据功能。</p>
    </section>
  );
}
