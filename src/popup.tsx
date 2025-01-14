import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { Settings } from "lucide-react"
// import "./style.css"
import "./popup.css"

const storage = new Storage()

export default function Popup() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    storage.get("darkMode").then((value) => {
      setIsDarkMode(value === "true")
    })
  }, [])

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode
    setIsDarkMode(newValue)
    await storage.set("darkMode", newValue.toString())
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { darkMode: newValue })
      }
    })
  }

  const openSettings = () => {
    chrome.tabs.create({ url: "options.html" })
  }

  return (
    <div className="w-80 bg-gray-900">
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Header with Settings Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-100 to-white bg-clip-text text-transparent">
              Amazon Dark Mode
            </h1>
          </div>
          <button
            onClick={openSettings}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            title="Open Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Rest of the popup content remains the same */}
        <div className="relative p-4 backdrop-blur-xl bg-gray-800/50 rounded-xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-100">
                Dark Mode
              </span>
              <span className="text-xs text-gray-400">
                {isDarkMode ? 'Night time browsing enabled' : 'Standard browsing mode'}
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="relative inline-flex h-7 w-14 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(to right, #f97316, #fb923c)' 
                  : 'linear-gradient(to right, #374151, #4B5563)'
              }}
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                className={`
                  ${isDarkMode ? 'translate-x-8 bg-white' : 'translate-x-1 bg-gray-300'}
                  inline-block h-5 w-5 transform rounded-full transition-all duration-300 ease-spring
                  shadow-[0_2px_4px_rgba(0,0,0,0.2)]
                  ${isDarkMode ? 'shadow-orange-500/50' : ''}
                `}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-center text-gray-400">
          <p className="font-medium">Enhance your Amazon browsing experience</p>
        </div>
      </div>
    </div>
  )
}