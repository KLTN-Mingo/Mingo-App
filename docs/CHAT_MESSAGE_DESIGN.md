# Chat / Message Feature – Design Document

This document describes how to implement the chat/message feature in **Mingo-App**, following the existing architecture (services, DTOs, context, components, navigation) and inspired by the reference implementation in `C:\AppMingo\Mingo_App`.

---

## 1. Proposed Folder Structure

```
Mingo-App/
├── app/
│   ├── _layout.tsx                    # Add ChatProvider (and optional PusherProvider)
│   ├── (tabs)/
│   │   ├── _layout.tsx                # Add "Message" tab
│   │   ├── home.tsx
│   │   ├── friend.tsx
│   │   ├── message.tsx               # NEW: Chat list screen
│   │   ├── notification.tsx
│   │   └── profile.tsx
│   └── chat/
│       ├── _layout.tsx                # NEW: Stack for chat stack (list → room)
│       └── [id].tsx                   # NEW: Single conversation screen
├── components/
│   └── chat/                          # NEW: feature folder
│       ├── index.ts
│       ├── ChatListItem.tsx          # Row in chat list
│       ├── MessageBubble.tsx          # Single message in thread
│       ├── MessageInput.tsx           # Text + attach + send
│       ├── ChatListHeader.tsx         # Search, new group (optional)
│       ├── CreateGroupModal.tsx       # Optional: create group
│       └── ChatInfoModal.tsx          # Optional: chat info, media, leave
├── context/
│   └── ChatContext.tsx                # UNCOMMENT & ADAPT: list + optional thread state
├── dtos/
│   ├── message.dto.ts                # NEW: all message/chat types
│   └── index.ts                      # Add: export * from './message.dto'
├── hooks/
│   ├── use-chat-list.ts               # NEW: fetch + filter chat list
│   └── use-chat-messages.ts           # NEW: fetch + send + realtime for one room
├── services/
│   ├── message.service.ts           # NEW: class-based, same pattern as notification.service
│   └── (existing services)
└── lib/                              # Optional: if using Pusher
    └── pusher.ts                     # NEW: Pusher client singleton
```

**Rationale**

- **`app/(tabs)/message.tsx`** – Fits existing tabs (home, friend, notification, profile). One screen = chat list.
- **`app/chat/[id].tsx`** – Conversation screen in a dedicated stack so navigation is `(tabs)/message` → `chat/123` with back to list. Keeps tabs and chat stack separate (no modal needed for list).
- **`components/chat/`** – Same feature-based grouping as `components/notification`, `components/post`, `components/friend`.
- **`services/message.service.ts`** – Same class + `request()` + `ApiResponse<T>` pattern as `auth.service`, `notification.service`.
- **`dtos/message.dto.ts`** – Same style as `notification.dto.ts` (enums, request/response DTOs, barrel from `dtos/index.ts`).
- **`context/ChatContext.tsx`** – Reuse and uncomment existing file; adapt types to `@/dtos` and project naming.
- **`hooks/use-chat-list.ts` and `use-chat-messages.ts`** – Encapsulate fetch + realtime + state so screens stay thin and testable.
- **`lib/pusher.ts`** – Only if backend uses Pusher; otherwise realtime can be omitted or use Socket.io later.

---

## 2. Components Needed

| Component | Path | Responsibility |
|-----------|------|-----------------|
| **ChatListItem** | `components/chat/ChatListItem.tsx` | One row in the list: avatar, title (name/group), last message preview, time, unread indicator. Uses `ChatConversationDto`. On press → `router.push(\`/chat/${item.id}\`)`. |
| **MessageBubble** | `components/chat/MessageBubble.tsx` | Renders one message: text, image, or file placeholder; align left/right by `isOwn`; optional date separator. Uses `MessageResponseDto`. Optional long-press → delete/revoke. |
| **MessageInput** | `components/chat/MessageInput.tsx` | TextInput + send button; optional attach (gallery/file) and voice. Calls `messageService.sendMessage()` and/or parent callback. No direct Pusher; parent (screen or hook) handles realtime. |
| **ChatListHeader** | `components/chat/ChatListHeader.tsx` | Optional. Back/Title “Messages” + search Input + “New group” button. Search filters list in memory (from context or hook). |
| **CreateGroupModal** | `components/chat/CreateGroupModal.tsx` | Optional. Modal: group name, multi-select friends (reuse friend list or user picker), submit → `messageService.createGroup()`, then refresh list and close. |
| **ChatInfoModal** | `components/chat/ChatInfoModal.tsx` | Optional. Chat details: media/files, search in chat, leave/delete conversation; can use `messageService` for media list and leave. |

**Shared UI**

- Reuse `@/components/ui` (Avatar, Text, Input, Button, Icon, etc.) and theme (e.g. `useTheme()`, theme colors) so chat matches the rest of the app.

**Barrel**

- `components/chat/index.ts` – export `ChatListItem`, `MessageBubble`, `MessageInput`, `ChatListHeader`, `CreateGroupModal`, `ChatInfoModal` so screens can `import { ChatListItem, ... } from '@/components/chat'`.

---

## 3. Hooks and State Management

### 3.1 Context (global chat state)

Use **one** context for the **chat list** only (no need to store every thread’s messages globally).

**ChatContext** (uncomment and adapt `context/ChatContext.tsx`):

- **State:**  
  - `conversations: ChatConversationDto[]`  
  - `setConversations`  
  - `filteredConversations: ChatConversationDto[]`  
  - `setFilteredConversations`  
  (Same idea as Mingo_App’s `allChat` / `filteredChat`; naming aligned with DTOs below.)
- **Provider:** Wraps the part of the app that needs the list (e.g. inside `AuthProvider` in `_layout.tsx`).
- **Consumers:** `(tabs)/message.tsx` (list screen) and `use-chat-list.ts` (read/update list).

Optional: add `isOnlineByUserId: Record<string, boolean>` if the backend exposes online status and you want to show it in the list (e.g. green dot).

**Thread state (messages for one room)**

- **Do not** keep full message list in context. Keep it in **screen-local state** (or in a hook that returns `[messages, setMessages, send, ...]`).
- **Reason:** Avoid storing large arrays in context and re-renders on every new message; only the open chat screen needs the thread.

### 3.2 Hooks

| Hook | Path | Responsibility |
|------|------|----------------|
| **useChatList** | `hooks/use-chat-list.ts` | 1) On mount (and when list should refresh): call `messageService.getConversations()` (or getListChat + getListGroupChat if API is split). 2) Set result in ChatContext (`setConversations` / `setFilteredConversations`). 3) Optionally subscribe to Pusher per conversation for `new-message` and update list (last message, sort). 4) Return `{ conversations, filteredConversations, refetch, searchQuery, setSearchQuery }` (search = filter in memory by name). |
| **useChatMessages** | `hooks/use-chat-messages.ts` | 1) Params: `conversationId: string`. 2) On mount: fetch `messageService.getMessages(conversationId)`, set in local state. 3) Subscribe to Pusher channel `private-{conversationId}` for `new-message`, `delete-message`, `revoke-message`; update local state. 4) Return `{ messages, sendMessage, isLoading, markAsRead }` (send and markAsRead call message.service). |

State flow:

- **List:** ChatContext holds `conversations` and `filteredConversations`; `useChatList` fetches and updates context and handles list-level Pusher.
- **Thread:** `app/chat/[id].tsx` uses `useChatMessages(id)` and renders `MessageBubble` + `MessageInput`; no context for the thread array.

---

## 4. API Services

### 4.1 Class and URL pattern

- **File:** `services/message.service.ts`
- **Pattern:** Same as `notification.service.ts` and `auth.service.ts`:
  - `API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'`
  - Private `getAuthHeaders()` using `AsyncStorage.getItem('accessToken')` and `Authorization: Bearer ${token}`.
  - Private `request<T>(endpoint, options)` that uses `getAuthHeaders()`, calls `fetch(API_URL + '/messages' + endpoint)`, parses JSON, checks `response.ok`, throws on error, returns `json.data` (assuming backend wraps in `{ data }` like your existing APIs). If your backend returns `ApiResponse<T>` with `data`, use that.

### 4.2 Endpoints and methods

Assume base path `/messages` (e.g. `API_URL + '/messages' + endpoint`). Adjust to match your backend.

| Method | HTTP | Endpoint (example) | Purpose |
|--------|------|---------------------|--------|
| `getConversations()` | GET | `/conversations` or `/list` | List DMs + groups (or two calls: `/list-chat`, `/list-group-chat`). Returns `ChatConversationDto[]`. |
| `getMessages(conversationId, page?)` | GET | `/${conversationId}/messages?page=1&limit=20` | Paginated messages for one conversation. Returns `PaginatedMessagesDto` or `MessageResponseDto[]`. |
| `sendMessage(conversationId, body)` | POST | `/${conversationId}/send` or `/send` with body `{ conversationId, content }` or FormData for files | Send text (and optionally file). Body shape depends on backend. |
| `markAsRead(conversationId)` | POST | `/${conversationId}/read` | Mark conversation as read. |
| `deleteMessage(messageId)` | DELETE | `/messages/${messageId}` | Delete for me / revoke for everyone (backend defines). |
| `createGroup(payload)` | POST | `/conversations/group` or `/group` | Create group; payload `{ name, memberIds }`. |
| `getConversationMedia(conversationId, type?)` | GET | `/${conversationId}/media?type=image` | Optional: for ChatInfoModal. |
| `leaveConversation(conversationId)` | POST | `/${conversationId}/leave` | Optional: for groups. |

Implement only what the backend provides; start with list, get messages, send (text), and mark as read.

---

## 5. Socket / Realtime Integration

### 5.1 Option A: Pusher (recommended if backend already uses it)

- **File:** `lib/pusher.ts`
- **Content:** Create Pusher client with `EXPO_PUBLIC_PUSHER_KEY`, `EXPO_PUBLIC_PUSHER_CLUSTER`, and `authEndpoint: EXPO_PUBLIC_API_URL + '/pusher/auth'` (or your backend auth route). Export a singleton (e.g. `pusherClient`).
- **Channels:** Private channel per conversation: `private-conversation-{id}` (or `private-{id}` to match Mingo_App).
- **Events:**  
  - `new-message` – payload = message object; list screen and room screen update state.  
  - `delete-message` – payload = `{ messageId }`; remove from list/thread.  
  - `revoke-message` – payload = `{ messageId }`; show as “unsent” or remove.
- **Where to subscribe:**
  - **List:** In `useChatList`, subscribe to each conversation’s channel (or a single “user” channel that receives all new-message events); on `new-message`, update `conversations` in context (last message, sort by time).
  - **Room:** In `useChatMessages(conversationId)`, subscribe to `private-conversation-{conversationId}`; on events, update local `messages` state.

No Socket.io for chat messages; use Pusher only for realtime message events.

### 5.2 Option B: No realtime initially

- Omit `lib/pusher.ts` and Pusher subscriptions.
- List and thread are updated only on fetch (e.g. refetch on focus or pull-to-refresh). Still implement `message.service` and UI; add Pusher later when backend is ready.

### 5.3 Voice/video calls (future)

- If you add calls later, use a **separate** channel or Socket.io for signaling (e.g. `CallContext` + `app/(modals)/[roomId].tsx` like Mingo_App). Keep call logic out of the message service and message Pusher channels.

---

## 6. Navigation Structure

### 6.1 Current structure (no chat)

- Root: `Stack` with `(tabs)`, `(auth)`, `modal`.
- Tabs: home, friend, notification, profile.

### 6.2 Proposed structure

- **Root Stack** (`app/_layout.tsx`):
  - Keep: `(tabs)`, `(auth)`, `modal`.
  - Add: **`chat`** group (stack) for conversation screen.
  - Wrap with **ChatProvider** (and optionally a small Pusher init wrapper if you use Pusher).

- **Tabs** (`app/(tabs)/_layout.tsx`):
  - Add a **Message** tab: `message.tsx` (chat list). Icon: message bubble (reuse or add to your icon set).

- **Chat stack** (`app/chat/_layout.tsx`):
  - Stack with one screen: `[id].tsx` (conversation).
  - Options: `headerShown: false` and use custom header in `[id].tsx`, or minimal header with back button.

- **Flows:**
  - **List → Room:** From `(tabs)/message`, user taps a conversation → `router.push(\`/chat/${id}\`)` → `chat/[id].tsx`.
  - **Back:** From `chat/[id]`, back goes to `(tabs)/message`.
  - **Deep link / notification:** Open `/chat/[id]` directly (Expo Router handles it).

No modal required for the list; the list is a tab. Optional: `CreateGroupModal` can be a modal presented from the message tab (e.g. `app/modal.tsx` reused with a param, or a local Modal in `message.tsx`).

### 6.3 Route summary

| Route | Screen | Purpose |
|-------|--------|--------|
| `/(tabs)/message` | `app/(tabs)/message.tsx` | Chat list (conversations). |
| `/chat/[id]` | `app/chat/[id].tsx` | Single conversation. |

---

## 7. DTOs (message.dto.ts)

Align with existing style (e.g. `notification.dto.ts`): enums, request/response types, optional helpers.

```ts
// dtos/message.dto.ts – adapt to your backend field names

import { PaginationDto, PaginationParams } from './common.dto';
import { UserMinimalDto } from './user.dto';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface SendMessageRequestDto {
  content: string;
  // or FormData when attaching file
}

export interface CreateGroupRequestDto {
  name: string;
  memberIds: string[];
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface MessageAttachmentDto {
  id?: string;
  url: string;
  type: string;
  fileName?: string;
  width?: string;
  height?: string;
}

export interface MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: UserMinimalDto;
  content: string;
  attachment?: MessageAttachmentDto;
  contentType: MessageContentType;
  createdAt: string;
  updatedAt?: string;
  isRevoked?: boolean;
  readBy?: string[];
}

export interface ChatConversationDto {
  id: string;
  type: 'dm' | 'group';
  name: string;           // display name (user name or group name)
  avatarUrl?: string;
  lastMessage?: MessageResponseDto;
  unreadCount?: number;
  updatedAt: string;
  participantIds?: string[];
  // ... other fields your API returns
}

export interface PaginatedMessagesDto {
  messages: MessageResponseDto[];
  pagination: PaginationDto;
}
```

Export from `dtos/index.ts`: `export * from './message.dto';`.

---

## 8. Implementation Order

1. **DTOs** – Add `message.dto.ts` and export from `dtos/index.ts`.
2. **Service** – Implement `message.service.ts` (getConversations, getMessages, sendMessage, markAsRead) with your real or mock API.
3. **Context** – Uncomment and adapt `ChatContext.tsx` (conversations + filteredConversations; use DTOs from `@/dtos`).
4. **Hooks** – `use-chat-list.ts` (fetch list, optional search), then `use-chat-messages.ts` (fetch thread, send, optional Pusher).
5. **Components** – `ChatListItem`, `MessageBubble`, `MessageInput`, then optional header/modals.
6. **Screens** – `app/(tabs)/message.tsx` (list), `app/chat/_layout.tsx` + `app/chat/[id].tsx` (room).
7. **Navigation** – Add Message tab and chat stack in layouts; wrap with ChatProvider.
8. **Realtime** – Add `lib/pusher.ts` and subscriptions in hooks when backend supports it.

This keeps the architecture consistent with your current project (services, DTOs, context, feature components, Expo Router) while reusing the chat flow and realtime ideas from Mingo_App without copying its folder structure or legacy patterns.
