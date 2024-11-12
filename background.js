chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    let authHeader = null;

    details.requestHeaders.forEach((header) => {
      if (header.name.toLowerCase() === "authorization") {
        authHeader = header.value;
      }
    });

    if (authHeader) {
      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request.action === "getAuthorizationToken") {
          sendResponse({ token: authHeader });
        }
      });
    }

    return { requestHeaders: details.requestHeaders };
  },
  {
    urls: ["http://*/*", "https://*/*"],
  },
  ["requestHeaders"]
);

chrome.runtime.onInstalled.addListener(() => {
  console.log("Azure DevOps Download Attachments Extension installed.");
});
