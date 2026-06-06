/**
 * Utility functions for managing API keys and default provider in localStorage
 */

export type ApiProvider = "together" | "openai";

const STORAGE_KEYS: Record<ApiProvider, string> = {
  together: "together_ai_api_key",
  openai: "openai_api_key",
};

const DEFAULT_PROVIDER_KEY = "api_key_default_provider";

export const API_KEY_CHANGE_EVENT = "api-key-storage-change";

function dispatchChangeEvent(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(API_KEY_CHANGE_EVENT));
  }
}

export function getDefaultProvider(): ApiProvider {
  if (typeof window === "undefined") return "openai";

  const stored = localStorage.getItem(DEFAULT_PROVIDER_KEY);
  if (stored === "together" || stored === "openai") return stored;

  // Migration: existing Together users keep Together as default
  if (localStorage.getItem(STORAGE_KEYS.together)) return "together";

  return "openai";
}

export function setDefaultProvider(provider: ApiProvider): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEFAULT_PROVIDER_KEY, provider);
    dispatchChangeEvent();
  }
}

export function saveApiKey(apiKey: string, provider?: ApiProvider): void {
  if (typeof window !== "undefined") {
    const p = provider ?? getDefaultProvider();
    localStorage.setItem(STORAGE_KEYS[p], apiKey);
    dispatchChangeEvent();
  }
}

export function getApiKey(provider?: ApiProvider): string | null {
  if (typeof window !== "undefined") {
    const p = provider ?? getDefaultProvider();
    return localStorage.getItem(STORAGE_KEYS[p]);
  }
  return null;
}

export function removeApiKey(provider?: ApiProvider): void {
  if (typeof window !== "undefined") {
    const p = provider ?? getDefaultProvider();
    localStorage.removeItem(STORAGE_KEYS[p]);
    dispatchChangeEvent();
  }
}

export function hasAnyApiKey(): boolean {
  return !!(getApiKey("together") || getApiKey("openai"));
}

export function getApiKeyHeaderName(provider?: ApiProvider): string {
  const p = provider ?? getDefaultProvider();
  return p === "openai" ? "X-OpenAI-API-Key" : "X-Together-API-Key";
}

export function getApiKeyHeaders(): Record<string, string> {
  const provider = getDefaultProvider();
  const key = getApiKey(provider);
  if (!key) return {};
  return { [getApiKeyHeaderName(provider)]: key };
}
