import { useState, useEffect, useRef } from "react";
import { Storage } from "@plasmohq/storage";
import { Undo2, Moon, Palette } from "lucide-react";
import { HexColorPicker } from "react-colorful";
// import "./style.css";
import "./popup.css";

const storage = new Storage();

const DEFAULT_COLORS = {
  backgroundColor: "#121212",
  surfaceColor: "#1e1e1e",
  containerColor: "#242424",
  inputBackground: "#2d2d2d",
  borderColor: "#404040",
  textPrimary: "#ffffff",
  textSecondary: "#b3b3b3",
  accentColor: "#ff9900"
};

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

// Utility function to validate hex color
const isValidHexColor = (hex: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
};

// Utility function to normalize hex color (ensure it has #)
const normalizeHexColor = (hex: string): string => {
  if (hex.startsWith('#')) {
    return hex;
  }
  return `#${hex}`;
};

export default function Settings() {
  const [colors, setColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    loadStoredColors();
  }, []);

  const loadStoredColors = async () => {
    const storedColors = await storage.get("colorSettings");
    if (storedColors) {
      setColors(JSON.parse(storedColors));
    }
  };

  const handleColorChange = async (key: keyof ColorSettings, value: string): Promise<void> => {
    const newColors: ColorSettings = { ...colors, [key]: value };
    setColors(newColors);
    await storage.set("colorSettings", JSON.stringify(newColors));

    // Update all Amazon tabs
    const amazonUrls: string[] = [
      "*://*.amazon.com/*",
      "*://*.amazon.co.uk/*",
      "*://*.amazon.de/*",
      "*://*.amazon.fr/*",
      "*://*.amazon.it/*",
      "*://*.amazon.es/*",
      "*://*.amazon.ca/*",
      "*://*.amazon.co.jp/*",
      "*://*.amazon.cn/*",
      "*://*.amazon.in/*",
      "*://*.amazon.com.br/*",
      "*://*.amazon.com.be/*",
      "*://*.amazon.com.mx/*",
      "*://*.amazon.com.au/*",
      "*://*.amazon.com.tr/*",
      "*://*.amazon.nl/*",
      "*://*.amazon.sg/*",
      "*://*.amazon.sa/*",
      "*://*.amazon.ae/*",
      "*://*.amazon.pl/*",
      "*://*.amazon.se/*",
      "*://*.amazon.eg/*",
      "*://*.amazon.tr/*"
    ];

    chrome.tabs.query({ url: amazonUrls }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "updateColors",
            colors: newColors
          } as UpdateColorsMessage);
        }
      });
    });
  };

  const resetColor = async (key: keyof ColorSettings) => {
    await handleColorChange(key, DEFAULT_COLORS[key]);
  };

  interface ColorPickerProps {
    label: string;
    color: string;
    colorKey: keyof ColorSettings;
    icon?: 'default' | 'background' | 'accent';
  }

  const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, colorKey, icon = 'default' }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [tempColor, setTempColor] = useState<string>(color);
    const [hexInput, setHexInput] = useState<string>(color);
    const [isValidHex, setIsValidHex] = useState<boolean>(true);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Update local state when color prop changes
    useEffect(() => {
      setTempColor(color);
      setHexInput(color);
    }, [color]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          handleColorChange(colorKey, tempColor);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, tempColor]);

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setHexInput(value);

      const normalizedHex = normalizeHexColor(value);
      const isValid = isValidHexColor(normalizedHex);
      setIsValidHex(isValid);

      if (isValid) {
        setTempColor(normalizedHex);
      }
    };

    const handleHexInputBlur = () => {
      if (isValidHex && tempColor !== color) {
        handleColorChange(colorKey, tempColor);
      } else if (!isValidHex) {
        // Reset to current valid color if invalid
        setHexInput(color);
        setTempColor(color);
        setIsValidHex(true);
      }
    };

    const handleHexInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    };

    return (
      <div ref={pickerRef} className="group relative flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 transition-all duration-200 hover:border-gray-600/50 hover:bg-gray-800/70">
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700/50">
            {icon === "background" && <Moon size={20} className="text-gray-300" />}
            {icon === "accent" && <Palette size={20} className="text-gray-300" />}
            {icon === "default" && <div className="h-5 w-5 rounded-full" style={{ backgroundColor: tempColor }} />}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-200">{label}</span>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              onKeyDown={handleHexInputKeyDown}
              className={`font-mono text-sm bg-gray-700/40 border border-gray-600/50 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/60 w-20 ${isValidHex ? 'text-gray-200' : 'text-red-400'
                }`}
              placeholder="#000000"
              maxLength={7}
            />
            {!isValidHex && (
              <span className="text-xs text-red-400 mt-1">Invalid hex color</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className="h-10 w-10 rounded border-2 border-gray-600 cursor-pointer transition-all duration-200 hover:border-gray-500"
              style={{ backgroundColor: isValidHex ? tempColor : '#666666' }}
              onClick={() => setIsOpen((prev) => !prev)}
            />
            {isOpen && (
              <div className="absolute z-10 mt-2 bg-white p-2 rounded shadow-lg right-0">
                <HexColorPicker
                  color={tempColor}
                  onChange={(newColor) => {
                    setTempColor(newColor);
                    setHexInput(newColor);
                    setIsValidHex(true);
                  }}
                />
              </div>
            )}
          </div>
          <button
            onClick={() => resetColor(colorKey)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-700 hover:text-white"
            title="Reset to default"
          >
            <Undo2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-auto">
      <div className="p-8">
        <div className="mx-auto max-w-2xl pb-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center space-x-3">
              <Moon size={32} className="text-orange-500" />
              <h1 className="text-3xl font-bold text-white">Dark Mode Settings</h1>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-200">
                  <span>Background Colors</span>
                </h2>
                <ColorPicker
                  label="Background"
                  color={colors.backgroundColor}
                  colorKey="backgroundColor"
                  icon="background"
                />
                <ColorPicker
                  label="Buttons"
                  color={colors.surfaceColor}
                  colorKey="surfaceColor"
                />
                <ColorPicker
                  label="Container"
                  color={colors.containerColor}
                  colorKey="containerColor"
                />
              </div>

              <div className="space-y-4">
                <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-200">
                  <span>UI Elements</span>
                </h2>
                <ColorPicker
                  label="Input Background"
                  color={colors.inputBackground}
                  colorKey="inputBackground"
                />
                <ColorPicker
                  label="Borders"
                  color={colors.borderColor}
                  colorKey="borderColor"
                />
              </div>

              <div className="space-y-4">
                <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-200">
                  <span>Typography</span>
                </h2>
                <ColorPicker
                  label="Primary Text"
                  color={colors.textPrimary}
                  colorKey="textPrimary"
                />
                <ColorPicker
                  label="Secondary Text"
                  color={colors.textSecondary}
                  colorKey="textSecondary"
                />
              </div>

              <div className="space-y-4">
                <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-200">
                  <span>Accent</span>
                </h2>
                <ColorPicker
                  label="Accent Color"
                  color={colors.accentColor}
                  colorKey="accentColor"
                  icon="accent"
                />
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-200">
              <p>Changes are saved automatically when the color picker is closed and will be applied immediately to any open Amazon tabs. You can also edit hex codes directly by clicking on them.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}