import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpenCheck, LoaderCircle, Search, Volume2, Wifi, WifiOff } from "lucide-react";
import { fetchDictionaryEntry, DictionaryLookupError, type DictionaryEntry } from "@/services/dictionary";
import { loadDictionaryEntry, saveDictionaryEntry } from "@/db/database";
import { ALL_WORDS } from "@/data/words";

export function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const localWord = entry ? ALL_WORDS.find((item) => item.word.toLowerCase() === entry.word.toLowerCase()) : undefined;

  useEffect(() => () => controller.current?.abort(), []);

  async function search(event: FormEvent) {
    event.preventDefault();
    const word = query.trim().toLowerCase();
    if (!word) return;
    controller.current?.abort();
    controller.current = new AbortController();
    setLoading(true); setError(""); setEntry(null); setFromCache(false);
    const cached = await loadDictionaryEntry(word);
    if (!navigator.onLine && cached) {
      setEntry(cached); setFromCache(true); setLoading(false); return;
    }
    try {
      const result = await fetchDictionaryEntry(word, controller.current.signal);
      setEntry(result);
      await saveDictionaryEntry(result);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      if (cached) { setEntry(cached); setFromCache(true); }
      else setError(reason instanceof DictionaryLookupError ? reason.message : "查询失败，请稍后重试。");
    } finally { setLoading(false); }
  }

  function pronounce() {
    if (!entry) return;
    if (entry.audio) { void new Audio(entry.audio).play(); return; }
    const utterance = new SpeechSynthesisUtterance(entry.word); utterance.lang = "en-US"; speechSynthesis.cancel(); speechSynthesis.speak(utterance);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header><p className="flex items-center gap-2 text-sm font-medium text-primary"><Wifi className="h-4 w-4" />联网功能</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">在线查词</h1><p className="mt-2 text-sm text-muted-foreground">查询任意英文单词的词性、英文释义、例句和近义词。查过的词会缓存在本机。</p></header>
      <form onSubmit={search} className="flex gap-2 rounded-2xl border bg-card p-2 shadow-sm"><label htmlFor="dictionary-query" className="sr-only">输入英文单词</label><input id="dictionary-query" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" placeholder="例如：orchestrate" className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-lg outline-none placeholder:text-muted-foreground" /><button disabled={loading || !query.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}查询</button></form>
      {error && <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><WifiOff className="h-5 w-5 shrink-0" />{error}</div>}
      {!entry && !error && !loading && <section className="rounded-3xl border border-dashed p-12 text-center"><BookOpenCheck className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 font-medium">输入一个想查询的英文单词</p><p className="mt-1 text-sm text-muted-foreground">该功能需要网络，已查询结果可离线再次查看。</p></section>}
      {entry && <article className="space-y-4"><section className="rounded-3xl border bg-card p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><h2 className="text-4xl font-bold tracking-tight">{entry.word}</h2>{entry.phonetic && <p className="mt-2 text-muted-foreground">{entry.phonetic}</p>}{localWord && <><p className="mt-4 text-lg font-semibold text-primary">{localWord.coreTranslation}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{localWord.aiMeaning}</p></>}</div><button onClick={pronounce} aria-label={`朗读 ${entry.word}`} className="rounded-full bg-primary/10 p-3 text-primary hover:bg-primary/15"><Volume2 className="h-5 w-5" /></button></div>{fromCache && <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"><WifiOff className="h-3 w-3" />当前显示本机缓存</p>}</section>{entry.meanings.map((meaning, meaningIndex) => <section key={`${meaning.partOfSpeech}-${meaningIndex}`} className="rounded-2xl border bg-card p-5"><h3 className="text-sm font-semibold uppercase tracking-wide text-primary">{meaning.partOfSpeech}</h3><ol className="mt-4 space-y-5">{meaning.definitions.map((definition, index) => <li key={`${definition.definition}-${index}`} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs">{index + 1}</span><div className="min-w-0"><p className="leading-6">{definition.definition}</p>{definition.example && <p className="mt-2 border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground">{definition.example}</p>}{definition.synonyms.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{definition.synonyms.map((synonym) => <button key={synonym} onClick={() => setQuery(synonym)} className="rounded-full bg-secondary px-2.5 py-1 text-xs hover:bg-primary/10 hover:text-primary">{synonym}</button>)}</div>}</div></li>)}</ol></section>)}{entry.sourceUrl && <a href={entry.sourceUrl} target="_blank" rel="noreferrer" className="block text-right text-xs text-muted-foreground hover:text-primary">查看词典来源</a>}</article>}
    </div>
  );
}
