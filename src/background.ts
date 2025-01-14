chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url?.match(/^https:\/\/(www\.)?amazon\.[a-z.]+/)) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      }).catch((err) => console.error("Error injecting script:", err));
    }
  });