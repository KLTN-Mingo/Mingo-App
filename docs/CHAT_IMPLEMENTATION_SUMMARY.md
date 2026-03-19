# Chat / Message Feature – Implementation Summary

## 1. Folder structure created for messaging

```
Mingo-App/
├── app/
│   ├── _layout.tsx                    MODIFIED (ChatProvider, chat stack)
│   ├── (tabs)/
│   │   ├── _layout.tsx                MODIFIED (Message tab + MessageIcon)
│   │   └── message.tsx                NEW – conversation list screen
│   └── chat/                          NEW folder
│       ├── _layout.tsx                NEW – stack layout for chat
│       └── [id].tsx                   NEW – single conversation screen
├── components/
│   └── chat/                          NEW folder
│       ├── index.ts                   NEW – barrel exports
│       ├── ChatListItem.tsx           NEW – row in conversation list
│       ├── MessageBubble.tsx           NEW – one message in thread
│       └── MessageInput.tsx           NEW – text input + send
├── context/
│   └── ChatContext.tsx                MODIFIED (uncommented, adapted)
├── dtos/
│   ├── message.dto.ts                NEW – message/chat types
│   └── index.ts                       MODIFIED (export message.dto)
├── hooks/
│   ├── use-chat-list.ts               NEW – fetch & filter conversations
│   └── use-chat-messages.ts           NEW – fetch, send, state for one room
├── services/
│   └── message.service.ts             NEW – message API (class-based)
└── docs/
    ├── CHAT_MESSAGE_DESIGN.md         (existing design)
    └── CHAT_IMPLEMENTATION_SUMMARY.md NEW – this file
```

---

## 2. Files created or modified

### Created

| File | Purpose |
|------|--------|
| `app/(tabs)/message.tsx` | Messages tab: conversation list, search, pull-to-refresh. |
| `app/chat/_layout.tsx` | Stack layout for chat (headerless). |
| `app/chat/[id].tsx` | Conversation screen: messages, input, back, mark as read. |
| `components/chat/ChatListItem.tsx` | One conversation row (avatar, name, last message, time). |
| `components/chat/MessageBubble.tsx` | One message bubble (own vs other, date separator, unsent). |
| `components/chat/MessageInput.tsx` | Text input + send button, KeyboardAvoidingView. |
| `components/chat/index.ts` | Barrel: ChatListItem, MessageBubble, MessageInput. |
| `context/ChatContext.tsx` | Replaced commented stub with working ChatProvider (conversations, filteredConversations). |
| `dtos/message.dto.ts` | Enums, request/response DTOs for conversations and messages. |
| `hooks/use-chat-list.ts` | Fetches conversations, updates ChatContext, search filter. |
| `hooks/use-chat-messages.ts` | Fetches messages for one conversation, sendMessage, markAsRead. |
| `services/message.service.ts` | Class-based API: getConversations, getMessages, sendMessage, markAsRead, deleteMessage. |
| `docs/CHAT_IMPLEMENTATION_SUMMARY.md` | This summary. |

### Modified

| File | Change |
|------|--------|
| `app/_layout.tsx` | Wrapped app in `ChatProvider`; added `Stack.Screen name="chat"`. |
| `app/(tabs)/_layout.tsx` | Added Message tab and `MessageIcon` (Svg). |
| `dtos/index.ts` | `export * from './message.dto'`. |

---

## 3. Message flow

### 3.1 Opening the Messages tab

1. User taps the **Messages** tab in the tab bar.
2. `app/(tabs)/message.tsx` mounts.
3. `useChatList()` runs: calls `messageService.getConversations()` and puts the result into `ChatContext` (conversations + filteredConversations).
4. The screen shows a search bar and a `FlatList` of `ChatListItem` for each conversation.
5. Search updates `filteredConversations` via `setSearchQuery` (in-memory filter by name).

### 3.2 Opening a conversation (list → chat)

1. User taps a row; `ChatListItem` calls `router.push(\`/chat/${conversation.id}\`)`.
2. Expo Router pushes the **chat** stack and shows `app/chat/[id].tsx` with `id` from the URL.
3. `useChatMessages(id)` runs: calls `messageService.getMessages(conversationId)` and stores messages in local state.
4. `markAsRead(conversationId)` is called so the backend can mark the conversation as read.
5. The screen shows a header (Back + conversation name), a `FlatList` of `MessageBubble`, and `MessageInput` at the bottom.

### 3.3 Sending a message

1. User types in `MessageInput` and taps send (or submit).
2. `MessageInput` calls `onSend(trimmedContent)` → in the chat screen this is `sendMessage(trimmedContent)` from `useChatMessages`.
3. `messageService.sendMessage(conversationId, { content })` is called (POST to the API).
4. The API persists the message and returns the created message (e.g. `MessageResponseDto`).
5. `useChatMessages` appends the returned message to local state: `setMessages(prev => [...prev, sent])`.
6. The new message appears in the list without a full refetch.

### 3.4 Back to list

1. User taps **Back** in the chat header.
2. `router.back()` pops the chat screen and returns to the Messages tab.
3. The list is still in `ChatContext`; if the user had sent a message, the list’s last message can be updated when you later add realtime or refetch on focus.

### 3.5 Realtime (optional, not implemented yet)

- The backend may support realtime (e.g. Pusher or Socket.io). To add it:
  - In `useChatList`: subscribe to a channel (e.g. per conversation or a user channel) and on `new-message` update the conversation’s `lastMessage` in context.
  - In `useChatMessages`: subscribe to the current conversation’s channel and on `new-message` call `appendMessage(data)` so new messages from others appear without refresh.
- Auth and API base URL are unchanged; use the same token and `EXPO_PUBLIC_API_URL` for any realtime auth endpoint.

---

## 4. Backend API expectations

The app assumes the following. Adjust `services/message.service.ts` and/or `dtos/message.dto.ts` if your backend differs.

- **Base URL:** `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:3000/api`). All message endpoints live under `/messages`.
- **Auth:** `Authorization: Bearer <accessToken>` (same as other services; token from `AsyncStorage.getItem('accessToken')`).
- **Response shape:** `{ success, data, message }`; the service uses `json.data`.

| Method | Endpoint | Request | Response `data` |
|--------|----------|--------|------------------|
| GET | `/messages/conversations` | - | `ChatConversationDto[]` |
| GET | `/messages/conversations/:id/messages?page=1&limit=50` | - | `MessageResponseDto[]` or `{ messages, pagination }` |
| POST | `/messages/conversations/:id/messages` | `{ content: string }` | `MessageResponseDto` |
| PUT | `/messages/conversations/:id/read` | - | - |

DTOs are in `dtos/message.dto.ts` (e.g. `ChatConversationDto`, `MessageResponseDto`). If your API uses different field names (e.g. `created_at` instead of `createdAt`), add a mapping in the service or in the hooks.

---

## 5. Steps to test the feature

### Prerequisites

1. Backend running with message endpoints under `/api/messages` (or set `EXPO_PUBLIC_API_URL` to your API base).
2. Logged-in user (so `accessToken` is in AsyncStorage and `AuthContext.profile` is set).

### Manual test steps

1. **Messages tab**
   - Open the app and log in.
   - Tap the **Messages** tab (message icon in the tab bar).
   - You should see the conversation list (or “No conversations yet” if the API returns an empty array).
   - If you have conversations: pull to refresh and use the search box to filter by name.

2. **Open a conversation**
   - Tap a conversation row.
   - You should navigate to the chat screen with a “Back” header and the conversation name.
   - Messages should load (or “No messages yet. Say hi!” if empty).

3. **Send a message**
   - Type in the input and tap the send button (↑).
   - The new message should appear in the list immediately (own messages on the right).
   - If the API returns an error (e.g. 401), the token may be expired; try logging out and back in.

4. **Back navigation**
   - Tap “← Back” in the chat header.
   - You should return to the Messages tab and see the list again.

5. **Without backend**
   - If the message API is not ready, you will see errors or empty lists; the UI and navigation should still work. You can mock `messageService` or use a test backend that returns the expected DTOs.

### Optional checks

- Toggle dark/light theme and confirm list and chat screens look correct.
- Test with a long conversation name and long message text (layout and truncation).
- Test keyboard (e.g. on iOS) and confirm the input stays visible (KeyboardAvoidingView).

---

## 6. Reuse of existing project pieces

- **Auth:** `useAuth()` from `@/context/AuthContext` (profile, current user id for “own” messages).
- **API pattern:** Same as `notification.service.ts`: class, `getAuthHeaders()`, `request<T>()`, `authService.handleUnauthorizedResponse` on non-OK response.
- **Navigation:** Expo Router; `router.push(\`/chat/${id}\`)` and `router.back()`.
- **UI:** `Avatar`, `Text`, `Input` from `@/components/ui`; theme via existing class names (e.g. `bg-background-light dark:bg-background-dark`).
- **Safe area:** `SafeAreaView` from `react-native-safe-area-context` (same as notification and friend screens).

No code was copied from the old repository; types, service, and screens were written to match this project’s structure and style.
