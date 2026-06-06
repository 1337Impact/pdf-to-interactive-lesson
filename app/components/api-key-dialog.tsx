"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ExternalLink, Eye, EyeOff, Sparkles, Star, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { useMediaQuery } from "../hooks/use-media-query";
import {
  type ApiProvider,
  getApiKey,
  getDefaultProvider,
  saveApiKey,
  removeApiKey,
  setDefaultProvider,
} from "@/lib/api-key-storage";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const PROVIDERS: ApiProvider[] = ["together", "openai"];

const PROVIDER_CONFIG: Record<
  ApiProvider,
  {
    label: string;
    signupUrl: string;
    signupHost: string;
    signupText: string;
  }
> = {
  together: {
    label: "Together AI",
    signupUrl: "https://together.ai",
    signupHost: "together.ai",
    signupText: "and sign up for free",
  },
  openai: {
    label: "OpenAI",
    signupUrl: "https://platform.openai.com",
    signupHost: "platform.openai.com",
    signupText: "and create an account",
  },
};

interface ApiKeyFormProps {
  className?: string;
  provider: ApiProvider;
  defaultProvider: ApiProvider;
  apiKey: string;
  savedApiKey: string | null;
  showApiKey: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  submitButtonRef: React.RefObject<HTMLButtonElement | null>;
  onProviderChange: (provider: ApiProvider) => void;
  onSetDefaultProvider: (provider: ApiProvider) => void;
  onApiKeyChange: (value: string) => void;
  onShowApiKeyToggle: () => void;
  onSave: () => void;
  onRemove: () => void;
  savedKeys: Record<ApiProvider, string | null>;
}

const ProviderTabs = ({
  selected,
  defaultProvider,
  savedKeys,
  onProviderChange,
}: {
  selected: ApiProvider;
  defaultProvider: ApiProvider;
  savedKeys: Record<ApiProvider, string | null>;
  onProviderChange: (provider: ApiProvider) => void;
}) => (
  <div className="flex rounded-xl bg-neutral-100 p-1 gap-1">
    {PROVIDERS.map((provider) => {
      const isSelected = selected === provider;
      const hasKey = !!savedKeys[provider];
      const isDefault = defaultProvider === provider;
      const config = PROVIDER_CONFIG[provider];

      return (
        <button
          key={provider}
          type="button"
          onClick={() => onProviderChange(provider)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            isSelected
              ? "bg-white shadow-sm border border-neutral-200 text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          {config.label}
          {hasKey && <Check className="w-3.5 h-3.5 shrink-0" />}
          {isDefault && (
            <Star className="w-3 h-3 fill-neutral-900 text-neutral-900 shrink-0" />
          )}
        </button>
      );
    })}
  </div>
);

const ApiKeyForm = ({
  className,
  provider,
  defaultProvider,
  apiKey,
  savedApiKey,
  showApiKey,
  inputRef,
  submitButtonRef,
  onProviderChange,
  onSetDefaultProvider,
  onApiKeyChange,
  onShowApiKeyToggle,
  onSave,
  onRemove,
  savedKeys,
}: ApiKeyFormProps) => {
  const config = PROVIDER_CONFIG[provider];

  return (
    <div className={className}>
      <ProviderTabs
        selected={provider}
        defaultProvider={defaultProvider}
        savedKeys={savedKeys}
        onProviderChange={onProviderChange}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (apiKey.trim()) {
            onSave();
          }
        }}
        className="space-y-4 mt-5"
      >
        <div className="text-base text-neutral-900">
          {savedApiKey ? "Update" : "Add"} your{" "}
          <span className="font-semibold underline">{config.label}</span> API key
        </div>
        <div className="relative">
          <input
            ref={inputRef}
            type={showApiKey ? "text" : "password"}
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            onPaste={() => {
              setTimeout(() => {
                submitButtonRef.current?.focus();
              }, 0);
            }}
            className="w-full px-4 py-2 pr-20 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900 placeholder:text-neutral-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  onApiKeyChange("");
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors touch-manipulation"
                aria-label="Clear API key"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onShowApiKeyToggle}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors touch-manipulation"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Visit{" "}
              <a
                href={config.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-900"
              >
                {config.signupHost}
              </a>{" "}
              {config.signupText}
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Copy your API key and paste it above</span>
          </li>
        </ul>
        <div className="flex flex-col gap-3">
          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={!apiKey.trim()}
            shape="lg"
            className="w-full"
          >
            {savedApiKey ? "Update API Key" : "Save API Key"}
          </Button>
          {provider === defaultProvider ? (
            <div className="flex items-center justify-center gap-1.5 text-sm text-neutral-500">
              <Star className="w-3.5 h-3.5 fill-neutral-400 text-neutral-400" />
              {config.label} is your default provider
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSetDefaultProvider(provider)}
              className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              Use {config.label} as default provider
            </button>
          )}
          <div className="flex items-center justify-between text-sm pt-1 gap-6">
            <a
              href={config.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1"
            >
              Get your API key
              <ExternalLink className="w-3 h-3" />
            </a>
            {savedApiKey && (
              <button
                type="button"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 underline text-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export function ApiKeyDialog({ open, onOpenChange, message }: ApiKeyDialogProps) {
  const [provider, setProvider] = useState<ApiProvider>("openai");
  const [defaultProvider, setDefaultProviderState] = useState<ApiProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [savedKeys, setSavedKeys] = useState<Record<ApiProvider, string | null>>({
    together: null,
    openai: null,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const inputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const hasLoadedRef = useRef(false);

  const savedApiKey = savedKeys[provider];

  useEffect(() => {
    if (!open) {
      hasLoadedRef.current = false;
      return;
    }

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const defaultP = getDefaultProvider();
    const keys: Record<ApiProvider, string | null> = {
      together: getApiKey("together"),
      openai: getApiKey("openai"),
    };

    const timeoutId = setTimeout(() => {
      setDefaultProviderState(defaultP);
      setProvider(defaultP);
      setSavedKeys(keys);
      setApiKey(keys[defaultP] || "");
      setShowApiKey(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [open]);

  const handleProviderChange = (next: ApiProvider) => {
    setProvider(next);
    setApiKey(savedKeys[next] || "");
    setShowApiKey(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSetDefaultProvider = (next: ApiProvider) => {
    setDefaultProvider(next);
    setDefaultProviderState(next);
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      const trimmed = apiKey.trim();
      saveApiKey(trimmed, provider);
      setSavedKeys((prev) => ({ ...prev, [provider]: trimmed }));
      onOpenChange(false);
    }
  };

  const handleRemoveApiKey = () => {
    removeApiKey(provider);
    setSavedKeys((prev) => ({ ...prev, [provider]: null }));
    setApiKey("");
  };

  const config = PROVIDER_CONFIG[provider];
  const title = `${config.label} API key`;

  const formProps = {
    provider,
    defaultProvider,
    apiKey,
    savedApiKey,
    showApiKey,
    inputRef,
    submitButtonRef,
    savedKeys,
    onProviderChange: handleProviderChange,
    onSetDefaultProvider: handleSetDefaultProvider,
    onApiKeyChange: setApiKey,
    onShowApiKeyToggle: () => setShowApiKey(!showApiKey),
    onSave: handleSaveApiKey,
    onRemove: handleRemoveApiKey,
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-600" />
              <DialogTitle className="text-left text-lg font-semibold text-neutral-900">
                {title}
              </DialogTitle>
            </div>
          </DialogHeader>
          {message && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
              {message}
            </p>
          )}
          <ApiKeyForm {...formProps} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-600" />
            <DrawerTitle className="text-left text-neutral-900">{title}</DrawerTitle>
          </div>
        </DrawerHeader>
        {message && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mx-4 mb-2">
            {message}
          </p>
        )}
        <ApiKeyForm className="px-4 pb-6" {...formProps} />
      </DrawerContent>
    </Drawer>
  );
}
