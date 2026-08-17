"use client";

import { useSyncExternalStore } from "react";
import { getServerState, getState, subscribe } from "@/lib/store";

/** 订阅本地应用状态（React 内置状态方案，无额外依赖） */
export function useAppState() {
  return useSyncExternalStore(subscribe, getState, getServerState);
}
