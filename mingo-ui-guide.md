# Mingo UI Design Guide — v2 (Updated Color Palette)

> **Mục tiêu:** Điều chỉnh UI trong repo hiện tại để đồng nhất với thiết kế Mingo. Nếu logic/data/cấu trúc code khác thiết kế → giữ nguyên theo repo, nhưng **giao diện (màu sắc, spacing, typography, component shape)** phải khớp với hướng dẫn dưới đây.

---

## 1. Design Tokens (Biến toàn cục)

### 1.1 Color Palette — Chính xác theo Figma

```ts
// ─── PRIMARY ──────────────────────────────────────────────
// Sage green — dùng cho button chính, active tab, toggle ON
const primary = '#768D85';

// ─── LIGHT MODE ───────────────────────────────────────────
const lightColors = {
  primary:        '#768D85',   // Sage green — button, active, toggle ON
  primaryMuted:   '#BAC6C2',   // Sage nhạt — hover, border accent, chip inactive bg

  background:     '#FFFFFF',   // Nền trắng tuyệt đối
  surface:        '#F1F4F3',   // Card, input field, secondary surface
  surfaceLight:   '#FAFAFA',   // Surface nhẹ hơn — background alt sections

  textPrimary:    '#1E2021',   // Near-black — heading, body text
  textSecondary:  '#6B6B6B',   // Gray — subtitle, timestamp, placeholder label
  textMuted:      '#CCCCCC',   // Rất nhạt — disabled, hint text

  border:         '#BAC6C2',   // Sage-tinted border (dùng primaryMuted)
  borderSubtle:   '#F1F4F3',   // Subtle separator (dùng surface)

  online:         '#22C55E',   // Chấm xanh online (không đổi)
  danger:         '#EF4444',   // Destructive action
  white:          '#FFFFFF',
};

// ─── DARK MODE ────────────────────────────────────────────
const darkColors = {
  primary:        '#515E5A',   // Dark sage — button, active state trong dark
  primaryAccent:  '#CFBFAD',   // Warm beige — accent highlight trong dark mode

  background:     '#1E2021',   // Nền tối (không dùng pure black)
  surface:        '#252525',   // Card, input, bottom sheet
  surfaceElevated:'#2D2F2F',   // Surface nổi — modal, dropdown

  textPrimary:    '#FAFAFA',   // Gần trắng — heading, body
  textSecondary:  '#6B6B6B',   // Gray — giữ nguyên cả 2 mode
  textMuted:      '#CCCCCC',   // Disabled, hint — giữ nguyên

  border:         '#2D2F2F',   // Subtle dark border
  borderAccent:   '#515E5A',   // Sage border trong dark

  online:         '#22C55E',   // Không đổi
  danger:         '#FF453A',   // iOS-style red trong dark
  white:          '#FFFFFF',
};
```

> **So sánh với v1:** Primary thay từ `#4A7C6A` → `#768D85` (sage nhạt hơn, desaturated hơn). Dark mode có thêm warm beige accent `#CFBFAD` là điểm nhấn đặc trưng.

---

### 1.2 Typography

```ts
const typography = {
  brandFont:      'System Bold',

  h1:             { fontSize: 28, fontWeight: '700', color: '#1E2021' },
  h2:             { fontSize: 22, fontWeight: '700', color: '#1E2021' },

  bodyLarge:      { fontSize: 16, fontWeight: '400' },
  bodyMedium:     { fontSize: 14, fontWeight: '400' },
  bodySmall:      { fontSize: 13, fontWeight: '400' },

  caption:        { fontSize: 12, fontWeight: '400', color: '#6B6B6B' },
  usernameBold:   { fontWeight: '700', color: '#1E2021' },
};
```

### 1.3 Spacing & Radius

```ts
const spacing = {
  xs: 4,   sm: 8,   md: 12,   lg: 16,   xl: 20,   xxl: 24,
};

const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  full: 9999,
};
```

---

## 2. Global Components

### 2.1 Bottom Navigation Bar

```
- Nền: #FFFFFF (light) / #1E2021 (dark)
- Active icon: #768D85 (light) / #515E5A (dark)
- Inactive icon: #6B6B6B
- Icon size: 24px | Tab bar height: 56px + safe area
- Không có border top, không có label text
```

### 2.2 App Logo / Brand Header

```
- "Min" màu #1E2021 bold + "gle" màu #768D85 bold
- Font size: 22–24px, weight 700
```

### 2.3 Avatar

```
- Shape: circle (borderRadius: 9999)
- Sizes: sm=32px, md=40px, lg=48px, xl=80px
- Online badge: #22C55E, 10px, bottom-right
```

### 2.4 Buttons

**Primary (Filled):**
```
- Background: #768D85
- Text: #FFFFFF, 14px, weight 600
- Border radius: full (pill)
- Hover/Pressed: #BAC6C2 (primaryMuted)
```

**Secondary (Outlined):**
```
- Background: transparent
- Border: 1px solid #BAC6C2
- Text: #1E2021, 14px, weight 500
- Border radius: full (pill)
```

**Icon Button (Circle):**
```
- Background: #F1F4F3 (light) / #252525 (dark)
- Size: 36px circle
- Icon: 18–20px, #6B6B6B
```

### 2.5 Search / Input Bar

```
- Background: #F1F4F3 (light) / #252525 (dark)
- Border radius: full (pill)
- Placeholder text: #CCCCCC
- Height: 44px | Padding: 10px 16px
- Không có border stroke khi idle
```

### 2.6 Chip / Filter Tab

```
- Active: background #768D85, text #FFFFFF, border radius full
- Inactive: background transparent, text #6B6B6B, border radius full
- Padding: 8px 16px | Font: 14px weight 500
```

### 2.7 Toggle Switch

```
- ON: thumb #FFFFFF, track #768D85
- OFF: thumb #FFFFFF, track #BAC6C2
```

---

## 3. Screens Chi Tiết

### 3.1 Home Feed Screen

**Header:**
```
- Left: Logo "Mingle" — "Min" (#1E2021) + "gle" (#768D85)
- Right: Search icon + Chat icon — màu #1E2021, 24px
- Padding: 16px horizontal, 12px vertical
```

**Create Post Bar:**
```
- Avatar (40px) + Input pill "Share something..." (placeholder #CCCCCC)
- Icons dưới: music, video, image — màu #6B6B6B
- Separator: đường kẻ #F1F4F3
```

**Post Card:**
```
Header: Avatar (40px) + username (#1E2021 bold) + time (#6B6B6B, 12px) + menu icon
Content: Caption #1E2021 15px | Location + music: #6B6B6B, 13px
Footer: Heart + Like count + Comment icon — #6B6B6B, 14px
Comment input: avatar 32px + pill "Write comment..." (#CCCCCC placeholder)
```

### 3.2 Friends Screen

```
Header: "Friends" h1 #1E2021 + Search + Plus icon
Tab filter: chip scroll — active #768D85, inactive #6B6B6B
Friend item: Avatar 48px | Name bold | mutual friends #6B6B6B
Buttons: Accept (#768D85 filled) + Decline (outlined #BAC6C2 border)
```

### 3.3 Add Friend Screen

```
- Back arrow + "Add friend" title
- Search bar: full-width pill #F1F4F3, placeholder #CCCCCC
- Arrow button: circle #F1F4F3, icon #6B6B6B
```

**Not Found (Dark):**
```
- Background: #1E2021
- Text "not found": #6B6B6B centered
- Back: text button top-left
```

### 3.4 Notifications Screen

```
Header: "Notifications" h1 + Search icon
Section label: "Recently" #1E2021 14px weight 600
Item: Avatar 44px | username bold + action | timestamp #6B6B6B 12px
Unread dot: 8px, màu #768D85, bên phải
```

### 3.5 Search Screen

```
Search bar: full-width pill, back arrow trái, placeholder "Enter key"
Tab: "Users" | "Posts" — active #768D85, inactive #F1F4F3 bordered
```

### 3.6 Message List Screen

```
Header: "Message" h2 + X close icon
Conversation item: Avatar 48px (online badge #22C55E) | username bold | preview #6B6B6B | timestamp #6B6B6B 12px
```

### 3.7 Chat Detail Screen

```
Header: back + avatar 32px + name + "Active X min ago" (#6B6B6B 11px) + phone/video/info icons

Bubble sent:
  - Background: #768D85 | Text: #FFFFFF
  - Border radius: 18px, bottom-right: 4px | Align right

Bubble received:
  - Background: #F1F4F3 (light) / #252525 (dark)
  - Text: #1E2021 | Border radius: 18px, bottom-left: 4px | Align left
  - Avatar 28px trái của chuỗi cuối

Timestamp: centered, #6B6B6B, 12px
Input bar: "Aa" pill, icons emoji/mic/image/plus, bg #F1F4F3
```

### 3.8 Chat Info Screen

```
Avatar 72px centered + Name h2 centered
Menu items: Icon #1E2021 + label bodyLarge | Toggle nếu có
Padding 16px vertical | Không divider
```

### 3.9 Profile Screen

```
Cover: full-width ~180px | Avatar 72px overlap (margin-top: -36px), border 3px #FFFFFF

Info: Nickname #6B6B6B 12px | Name h2 | Bio #6B6B6B bodyMedium
Info list: icon 20px #6B6B6B + text bodyMedium, padding 12px vertical
Hobby tags: pill chip, border #BAC6C2, text #1E2021, radius full
Social icons: 24px #1E2021

Content tabs: active = underline #768D85 + text #768D85 | inactive #6B6B6B
Image grid: 3 columns, gap 2px, square cells
```

---

## 4. Dark Mode Mapping

| Light token | Giá trị Light | Giá trị Dark |
|-------------|--------------|--------------|
| `background` | `#FFFFFF` | `#1E2021` |
| `surface` | `#F1F4F3` | `#252525` |
| `surfaceElevated` | `#FAFAFA` | `#2D2F2F` |
| `textPrimary` | `#1E2021` | `#FAFAFA` |
| `textSecondary` | `#6B6B6B` | `#6B6B6B` |
| `textMuted` | `#CCCCCC` | `#CCCCCC` |
| `primary` | `#768D85` | `#515E5A` |
| `primaryMuted` | `#BAC6C2` | `#CFBFAD` *(warm beige — đặc trưng dark mode)* |
| `border` | `#BAC6C2` | `#2D2F2F` |
| `online` | `#22C55E` | `#22C55E` |
| `danger` | `#EF4444` | `#FF453A` |

---

## 5. Icons

Dùng bộ **outline** icons:
- Size: **24px** (nav, headers) / **20px** (inline) / **18px** (small actions)
- Màu: `#1E2021` (actions chính) / `#6B6B6B` (secondary / nav inactive)
- Active nav: `#768D85`

---

## 6. Quy tắc điều chỉnh khi repo khác thiết kế

| Tình huống | Xử lý |
|------------|-------|
| Repo dùng `FlatList` | Giữ `FlatList`, chỉ style items |
| Repo có thêm field | Thêm vào layout phù hợp theo style |
| Repo thiếu screen | Không tạo mới — chỉ style screens đã có |
| Repo dùng thư viện icon khác | Map icon name sang bộ icon đang dùng |
| Repo không có dark mode | Implement light mode trước theo đúng light palette |
| Màu trong repo không khớp | Override bằng design tokens trong section 1 |

---

## 7. Checklist trước khi done

- [ ] Logo "Mingle": "Min" = `#1E2021`, "gle" = `#768D85`
- [ ] Bottom tab: active `#768D85` (light) / `#515E5A` (dark)
- [ ] Primary `#768D85` nhất quán: buttons, active states, toggles, unread dots
- [ ] Surface: `#F1F4F3` (light) / `#252525` (dark) — KHÔNG dùng `#F5F5F5` hay `#2C2C2E`
- [ ] Background: `#FFFFFF` (light) / `#1E2021` (dark)
- [ ] Text primary: `#1E2021` (light) / `#FAFAFA` (dark)
- [ ] Avatar: circle, online badge `#22C55E`
- [ ] Input pill: `#F1F4F3` bg, placeholder `#CCCCCC`
- [ ] Message bubble sent: `#768D85`, received: `#F1F4F3` / `#252525`
- [ ] Dark mode accent: `#CFBFAD` (warm beige) dùng cho highlight, không dùng làm primary
- [ ] Spacing: 16px horizontal padding toàn app
- [ ] Không có divider lines — dùng spacing thay thế
- [ ] Border/chip border: `#BAC6C2` (light) / `#2D2F2F` (dark)