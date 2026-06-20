import { api } from "./api.js";
import { burstAt } from "./effects.js";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initMessages({
  conversationListEl,
  conversationEmptyEl,
  threadEl,
  threadEmptyEl,
  threadTitleEl,
  threadSubtitleEl,
  threadMessagesEl,
  messageFormEl,
  messageInputEl,
  newGroupBtnEl,
  groupModalEl,
  groupFormEl,
  groupNameEl,
  groupMembersEl,
  groupMessageEl,
  groupCancelEl,
  getFriends,
}) {
  let conversations = [];
  let activeId = null;
  let pollTimer = null;

  function renderConversationList() {
    conversationEmptyEl.hidden = conversations.length > 0;
    conversationListEl.innerHTML = conversations
      .map((conversation) => {
        const preview = conversation.lastMessage
          ? escapeHtml(conversation.lastMessage.body)
          : "No messages yet";
        const typeLabel = conversation.type === "group" ? "Group" : "Direct";
        const activeClass = conversation.id === activeId ? " conversation-active" : "";
        return `
          <button type="button" class="conversation-item${activeClass}" data-conversation="${conversation.id}">
            <span class="conversation-title">${escapeHtml(conversation.title)}</span>
            <span class="conversation-meta">${typeLabel}</span>
            <span class="conversation-preview muted">${preview}</span>
          </button>
        `;
      })
      .join("");

    conversationListEl.querySelectorAll("[data-conversation]").forEach((btn) => {
      btn.addEventListener("click", () => openConversation(btn.dataset.conversation));
    });
  }

  function renderMessages(messages) {
    threadMessagesEl.innerHTML = messages
      .map((message) => {
        const side = message.mine ? "message-mine" : "message-theirs";
        const name = message.mine ? "" : `<span class="message-sender">${escapeHtml(message.senderName)}</span>`;
        return `
          <div class="message-row ${side}">
            <div class="message-bubble">
              ${name}
              <span class="message-body">${escapeHtml(message.body)}</span>
              <span class="message-time">${formatTime(message.createdAt)}</span>
            </div>
          </div>
        `;
      })
      .join("");
    threadMessagesEl.scrollTop = threadMessagesEl.scrollHeight;
  }

  async function loadMessages(conversationId, { scroll = true } = {}) {
    try {
      const data = await api.getMessages(conversationId);
      if (activeId !== conversationId) {
        return;
      }
      renderMessages(data.messages || []);
      if (!scroll) {
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  function activeConversation() {
    return conversations.find((conversation) => conversation.id === activeId) || null;
  }

  async function openConversation(conversationId) {
    activeId = conversationId;
    const conversation = activeConversation();

    threadEmptyEl.hidden = true;
    threadEl.hidden = false;

    if (conversation) {
      threadTitleEl.textContent = conversation.title;
      threadSubtitleEl.textContent =
        conversation.type === "group"
          ? conversation.members.map((member) => member.name).join(", ")
          : "Direct message";
    }

    renderConversationList();
    await loadMessages(conversationId);
    startPolling();
    messageInputEl.focus();
  }

  async function loadConversations() {
    try {
      const data = await api.getConversations();
      conversations = data.conversations || [];
      renderConversationList();
    } catch (error) {
      console.error(error);
    }
  }

  async function openWithUser(userId) {
    try {
      const data = await api.startDirectConversation(userId);
      await loadConversations();
      await openConversation(data.conversation.id);
    } catch (error) {
      console.error(error);
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(async () => {
      if (!activeId) {
        return;
      }
      await loadMessages(activeId, { scroll: false });
      await loadConversations();
    }, 4000);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  messageFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = messageInputEl.value.trim();
    if (!body || !activeId) {
      return;
    }
    try {
      await api.sendMessage(activeId, body);
      messageInputEl.value = "";
      await loadMessages(activeId);
      await loadConversations();
    } catch (error) {
      console.error(error);
    }
  });

  function openGroupModal() {
    const friends = getFriends();
    groupMessageEl.hidden = true;
    groupNameEl.value = "";

    if (friends.length === 0) {
      groupMembersEl.innerHTML =
        '<p class="muted">Add some connections first to create a group.</p>';
    } else {
      groupMembersEl.innerHTML = friends
        .map(
          (friend) => `
          <label class="checkbox-row">
            <input type="checkbox" value="${friend.id}" />
            ${escapeHtml(friend.name)} <span class="muted">· ${escapeHtml(friend.department)}</span>
          </label>
        `
        )
        .join("");
    }

    groupModalEl.hidden = false;
  }

  function closeGroupModal() {
    groupModalEl.hidden = true;
  }

  newGroupBtnEl.addEventListener("click", openGroupModal);
  groupCancelEl.addEventListener("click", closeGroupModal);
  groupModalEl.addEventListener("click", (event) => {
    if (event.target === groupModalEl) {
      closeGroupModal();
    }
  });

  groupFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = groupNameEl.value.trim();
    const memberIds = [...groupMembersEl.querySelectorAll("input:checked")].map(
      (input) => input.value
    );

    if (!name) {
      showGroupMessage("Group name is required.");
      return;
    }
    if (memberIds.length === 0) {
      showGroupMessage("Select at least one member.");
      return;
    }

    try {
      const data = await api.createGroupConversation(name, memberIds);
      closeGroupModal();
      burstAt(window.innerWidth / 2, window.innerHeight / 3, { count: 48, power: 11 });
      await loadConversations();
      await openConversation(data.conversation.id);
    } catch (error) {
      showGroupMessage(error.message);
    }
  });

  function showGroupMessage(text) {
    groupMessageEl.textContent = text;
    groupMessageEl.className = "form-message error";
    groupMessageEl.hidden = !text;
  }

  return { loadConversations, openWithUser, startPolling, stopPolling };
}
