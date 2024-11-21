let token = "";
let baseUrl = "";

const downloadIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="white">
    <path d="M12 3a1 1 0 0 1 1 1v10.585l3.293-3.293a1 1 0 0 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L11 14.585V4a1 1 0 0 1 1-1zm-7 16a1 1 0 1 1 0-2h14a1 1 0 1 1 0 2H5z"></path>
  </svg>
`;
const spinnerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="16" height="16" fill="white">
    <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="10" fill="none" stroke-dasharray="164.93361431346415 56.97787143782138">
      <animateTransform
        attributeName="transform"
        type="rotate"
        repeatCount="indefinite"
        dur="1s"
        values="0 50 50;360 50 50"
        keyTimes="0;1"
      />
    </circle>
  </svg>
`;

async function downloadAttachments(taskId, button) {
  if (!token) {
    alert("Bearer token not found.");
    return;
  }

  button.innerHTML = spinnerIcon;

  const url = `${baseUrl}_apis/wit/workitems/${taskId}?api-version=7.0&$expand=all`;
  let response, data;

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await response.json();
  } catch (error) {
    console.error("Error fetching work item data:", error);
    button.innerHTML = downloadIcon;
    return;
  }

  const attachments = data.relations?.filter(
    (relation) => relation.rel === "AttachedFile"
  );

  if (!attachments || attachments.length === 0) {
    alert("No additional files were found to download.");
    button.innerHTML = downloadIcon;
    return;
  }

  const zip = new JSZip();

  for (let index = 0; index < attachments.length; index++) {
    const attachment = attachments[index];
    try {
      const attachmentUrl = attachment.url;
      const attachmentResponse = await fetch(attachmentUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await attachmentResponse.blob();
      const filename = attachment.attributes?.name || `attachment-${index + 1}`;
      zip.file(filename, blob);
    } catch (error) {
      console.log("Download error:", error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `attachments-${taskId}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    button.innerHTML = downloadIcon;
  });
}

function addDownloadButtonCards() {
  const taskCards = document.querySelectorAll(".wit-card");
  taskCards.forEach((card) => {
    const taskId = card.getAttribute("data-itemid");
    if (!taskId) return;

    const button = document.createElement("button");
    button.innerHTML = downloadIcon;
    button.title = "Attachments Download";
    button.classList.add("download-btn");
    button.style.position = "absolute";
    button.style.bottom = "10px";
    button.style.right = "10px";
    button.style.backgroundColor = "#005595";
    button.style.color = "white";
    button.style.padding = "10px";
    button.style.border = "none";
    button.style.borderRadius = "20px";
    button.style.cursor = "pointer";

    button.addEventListener("click", () => {
      chrome.runtime.sendMessage(
        { action: "getAuthorizationToken" },
        (response) => {
          if (response && response.token) {
            token = response.token.split("Bearer ")[1];
            baseUrl = window.location.href.split("_sprints")[0];
            downloadAttachments(taskId, button);
          } else {
            console.log("Token could not be received.");
          }
        }
      );
    });

    card.style.position = "relative";
    card.appendChild(button);
  });
}

function addDownloadButtonWorkItems() {
  const taskRows = document.querySelectorAll(".bolt-pill");

  taskRows.forEach((row) => {
    const taskIdElement = row
      .closest(".ms-DetailsRow-fields")
      ?.querySelector(
        '[data-automation-key="System.Id"] .work-item-simple-cell'
      );

    if (!taskIdElement) return;

    const taskId = taskIdElement.textContent.trim();

    const button = document.createElement("button");
    button.innerHTML = downloadIcon;
    button.title = "Attachments Download";
    button.classList.add("download-btn");
    button.style.backgroundColor = "#005595";
    button.style.color = "white";
    button.style.padding = "10px";
    button.style.border = "none";
    button.style.borderRadius = "20px";
    button.style.cursor = "pointer";
    button.style.marginLeft = "5px";

    button.addEventListener("click", () => {
      chrome.runtime.sendMessage(
        { action: "getAuthorizationToken" },
        (response) => {
          if (response && response.token) {
            token = response.token.split("Bearer ")[1];
            baseUrl = window.location.href.split("_workitems")[0];
            downloadAttachments(taskId, button);
          } else {
            console.log("Token could not be received.");
          }
        }
      );
    });
    row.style.position = "relative";
    row.appendChild(button);
  });
}

addDownloadButtonCards();
addDownloadButtonWorkItems();
