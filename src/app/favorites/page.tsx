"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderPlus, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getWord } from "@/data/words";
import { useAppState } from "@/hooks/use-app-state";
import { createFolder, deleteFolder, removeFavorite } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export default function FavoritesPage() {
  const state = useAppState();
  const [activeFolder, setActiveFolder] = useState("默认收藏夹");
  const [newFolder, setNewFolder] = useState("");

  const folders = state.folders.length ? state.folders : ["默认收藏夹"];
  const items = state.favorites.filter((f) => f.folderName === activeFolder);

  const handleCreate = () => {
    if (!newFolder.trim()) return;
    createFolder(newFolder);
    setActiveFolder(newFolder.trim());
    setNewFolder("");
    toast.success("收藏夹已创建");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">我的收藏</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          收藏重要单词，按文件夹分类整理
        </p>
      </div>

      {/* 收藏夹 Tab */}
      <div className="flex flex-wrap gap-2">
        {folders.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFolder(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              activeFolder === f ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 新建收藏夹 */}
      <div className="flex gap-2">
        <Input
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
          placeholder="新建收藏夹，如：Cursor 编程词汇"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button variant="outline" onClick={handleCreate} className="gap-1">
          <FolderPlus className="h-4 w-4" /> 新建
        </Button>
      </div>

      {folders.length > 1 && activeFolder !== "默认收藏夹" && (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={() => {
            deleteFolder(activeFolder);
            setActiveFolder("默认收藏夹");
            toast.success("收藏夹已删除");
          }}
        >
          <Trash2 className="h-3.5 w-3.5" /> 删除该收藏夹
        </Button>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title={`「${activeFolder}」还没有单词`}
          description="在单词卡片上点 ♥ 即可收藏到默认收藏夹"
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border bg-card">
          {items.map((f) => {
            const word = getWord(f.wordId);
            if (!word) return null;
            return (
              <div key={f.wordId} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/learn/${word.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium hover:text-primary">{word.word}</p>
                  <p className="truncate text-xs text-muted-foreground">{word.coreTranslation}</p>
                </Link>
                <button
                  onClick={() => {
                    removeFavorite(word.id, activeFolder);
                    toast.success("已移出收藏夹");
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="移出收藏"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
