import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: [
    "https://*.amazon.com/*",
    "https://*.amazon.co.uk/*",
    "https://*.amazon.de/*",
    "https://*.amazon.fr/*",
    "https://*.amazon.it/*",
    "https://*.amazon.es/*",
    "https://*.amazon.ca/*",
    "https://*.amazon.co.jp/*",
    "https://*.amazon.cn/*",
    "https://*.amazon.in/*",
    "https://*.amazon.com.br/*",
    "https://*.amazon.com.be/*",
    "https://*.amazon.com.mx/*",
    "https://*.amazon.com.au/*",
    "https://*.amazon.com.tr/*",
    "https://*.amazon.nl/*",
    "https://*.amazon.sg/*",
    "https://*.amazon.sa/*",
    "https://*.amazon.ae/*",
    "https://*.amazon.pl/*",
    "https://*.amazon.se/*",
    "https://*.amazon.eg/*",
    "https://*.amazon.tr/*"
  ],
  css: ["style.css"],
  run_at: "document_start"
}

interface ColorSettings {
  backgroundColor: string;
  surfaceColor: string;
  containerColor: string;
  inputBackground: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
}

interface UpdateColorsMessage {
  type: "updateColors";
  colors: ColorSettings;
}

interface DarkModeMessage {
  darkMode: boolean;
}

type ChromeMessage = UpdateColorsMessage | DarkModeMessage;

const storage = new Storage()

// Apply colors from settings
const applyCustomColors = async (): Promise<void> => {
  const storedColors = await storage.get("colorSettings");
  const colors: ColorSettings | null = storedColors ? JSON.parse(storedColors) : null;
  
  if (colors) {
    const root = document.documentElement
    
    // Save current scroll position
    const scrollPos = window.scrollY

    // Apply colors
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    // Restore scroll position to prevent jumping
    window.scrollTo(0, scrollPos)
  }
}

// Listen for messages from popup and settings
chrome.runtime.onMessage.addListener((
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): void => {
  if ('type' in message && message.type === "updateColors") {
    if (message.colors) {
      const root = document.documentElement;
      const scrollPos = window.scrollY;

      Object.entries(message.colors).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVar, value);
      });

      window.scrollTo(0, scrollPos);
    }
  } else if ('darkMode' in message) {
    if (message.darkMode) {
      document.documentElement.classList.add("amazon-dark-mode");
      applyCustomColors().catch(console.error);
    } else {
      document.documentElement.classList.remove("amazon-dark-mode");
    }
  }
});

// Check initial state
storage.get("darkMode").then((value) => {
  if (value === "true") {
    document.documentElement.classList.add("amazon-dark-mode")
    applyCustomColors()
  }
})