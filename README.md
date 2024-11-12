
# Task Attachment Downloader for Azure DevOps

This Chrome extension allows you to easily download all attachments from a specific task in Azure DevOps as a `.zip` file. It adds a convenient download button to task cards on Azure DevOps boards, enabling quick access to task-related files.

## Features

- **Download all task attachments**: One click to download all attachments from an Azure DevOps task.
- **Auto-generate `.zip` files**: The extension bundles all attachments into a `.zip` file for easy downloading.
- **Simple UI**: The extension adds a download button to each task card in Azure DevOps for quick access.
- **Token-based authentication**: The extension uses an OAuth bearer token for authentication to Azure DevOps.

## Prerequisites

- A working Azure DevOps account.
- **Bearer token**: The extension will request a bearer token to authenticate with Azure DevOps via Chrome's runtime messaging API. The token is retrieved from the background script (e.g., a popup or an authentication service).

## Installation

1. Clone or download the repository to your local machine.
2. Open Chrome and go to `chrome://extensions`.
3. Enable Developer Mode by toggling the switch in the top right corner.
4. Click on the **Load unpacked** button and select the folder containing the extension files.
5. The extension should now be installed and visible in your Chrome extensions list.

## How to Use

1. **Navigate to an Azure DevOps board where tasks are listed**.
2. The extension will automatically add a download button (↓) to each task card that contains attachments.
3. Click on the download button to retrieve all attachments associated with that task.
4. The attachments will be downloaded as a `.zip` file with the task ID as the filename.

## How It Works

- The extension listens for click events on task cards within the Azure DevOps boards.
- Upon clicking the download button, the extension fetches the task details (including attachments) from the Azure DevOps REST API.
- If attachments are found, the extension creates a `.zip` file containing all the attachments.
- The `.zip` file is then automatically downloaded by the browser.

### **Background Script: Token Management**

The extension uses a background script (`background.js`) to handle authentication and retrieve the OAuth bearer token required to access Azure DevOps. The script listens for HTTP requests and extracts the `Authorization` header containing the token.

- **How It Works:**

  - The `chrome.webRequest.onBeforeSendHeaders` listener intercepts HTTP requests.
  - It looks for the `Authorization` header in the request headers and stores its value as `authHeader`.
  - When the extension is triggered to get the authorization token (via messaging), it sends the stored token back to the content script.
  - The token is then used for authentication in API requests to Azure DevOps.

- **Message Handling:**
  - The background script listens for messages from the content script via `chrome.runtime.onMessage`.
  - When the action `"getAuthorizationToken"` is received, the stored authorization token (`authHeader`) is sent back to the content script.

```javascript
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
```

## Code Overview

### Key Components:

- **Token Management**: The extension retrieves the bearer token through `chrome.runtime.sendMessage` to authenticate requests to the Azure DevOps API. The `background.js` script listens for HTTP requests and extracts the authorization token when it's present.
- **Attachment Downloading**: The extension fetches task details via Azure DevOps REST API, filters attachments, and bundles them into a `.zip` file using the JSZip library.

- **UI Interaction**: A download button is injected into each task card, which, when clicked, triggers the downloading process.

### Icons:

- **Download Icon**: A down-arrow icon (↓) is used to represent the download button.
- **Spinner Icon**: A spinning circle is displayed when attachments are being downloaded.

### Dependencies:

- **JSZip**: A JavaScript library for creating `.zip` archives in the browser.

### Main Functions:

- `downloadAttachments(taskId, button)`: Fetches attachments and downloads them as a `.zip` file.
- `addDownloadButton()`: Adds a download button to each task card on the board.

## Troubleshooting

- **No attachments found**: If the task has no attachments, a message will appear notifying you that no files are available for download.
- **Token not found**: The extension requires an authentication token. If the token is missing or invalid, the download will not proceed.

- **No download button**: Ensure the extension is active and loaded on the correct page in Azure DevOps.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### Notes:

- **Token Management**: Make sure the token used is securely stored and never exposed publicly.
- **Cross-Origin Restrictions**: Ensure that the necessary permissions are granted in your extension's manifest to handle cross-origin API requests.

---

Now, the README includes information about how the background script works to manage authentication and retrieve the token from requests. This addition provides context on how the extension ensures secure access to the Azure DevOps API.

!['azure_card_img'](/image.png)
