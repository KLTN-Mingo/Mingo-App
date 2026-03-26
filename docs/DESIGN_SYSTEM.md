# Design system — Mingle

## Bảng màu Dark

| Token | Hex | Dùng cho |
|-------|-----|----------|
| `dark.500` | `#1E2021` | Nền toàn màn hình |
| `dark.400` | `#2D2F2F` | Card, khối nổi |
| `dark.200` | `#252525` | Surface phụ |
| `dark.100` | `#CFBFAD` | Chữ / icon chính |
| `dark.300` | `#515E5A` | Chữ phụ, placeholder, ô nhập pill |
| `primary.100` | `#768D85` | Tab active, nút Accept, logo accent |

**Dark — component đặc thù**

- Tab **active**: nền `primary.100`, chữ `dark.100`.
- Tab **inactive**: nền trong suốt, viền cream mờ, chữ `dark.100`.
- Nút **Decline**: outline, nền trong, chữ `dark.100`.

## Bảng màu Light

| Token | Hex | Dùng cho |
|-------|-----|----------|
| `light.500` | `#FFFFFF` | Nền + card |
| `light.200` | `#F2F2F2` | Chip / tab inactive, nút phụ |
| `light.100` | `#1E2021` | Chữ chính |
| `light.300` | `#515E5A` | Chữ phụ |
| `light.400` | `#F0F2F5` | Ô input |
| `primary.100` | `#768D85` | Tab active, CTA |

**Light — component đặc thù**

- Tab **active**: nền `primary.100`, chữ **trắng** (`light.500`).
- Tab **inactive**: nền `light.200`, chữ `light.100`.

## Tailwind (NativeWind)

Dùng cặp class `*-light` / `*-dark` với variant `dark:` (theo `Appearance` — đồng bộ với `ThemeContext` + `Appearance.setColorScheme`):

- `bg-background-light` / `dark:bg-background-dark`
- `bg-surface-light` / `dark:bg-surface-dark`
- `bg-surface-muted-light` / `dark:bg-surface-muted-dark`
- `bg-input-light` / `dark:bg-input-dark`
- `text-text-light` / `dark:text-text-dark`
- `text-text-muted-light` / `dark:text-text-muted-dark`
- `text-primary-foreground-light` / `dark:text-primary-foreground-dark` (chữ trên nút primary)
- `border-border-light` / `dark:border-border-dark`
- `border-pill-light` / `dark:border-pill-dark` (viền chip/tab inactive)
- `bg-primary-100`

## TypeScript

```ts
import { colors, getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";

const { colorScheme } = useTheme();
const sem = getSemantic(colorScheme);
// sem.background, sem.surface, sem.input, sem.placeholder, ...
```

## Component UI (`@/components/ui`)

| Component | Mô tả |
|-----------|--------|
| `ScreenHeader` | Tiêu đề trái, `leftSlot` / `rightSlot` (icon search, add…) |
| `FilterPill` | Alias của `Tab` — chip ngang (Requests, Friends, …) |
| `FriendRequestCard` | Card lời mời: avatar, tên + subtitle, mutual + Accept / Decline |
| `Button`, `Tab`, `Input`, `TextArea`, `Card`, `Text` | Đã map theo token |

### Ví dụ nhanh

```tsx
import {
  ScreenHeader,
  FilterPill,
  FriendRequestCard,
  Icon,
} from "@/components/ui";

<ScreenHeader
  title="Friends"
  rightSlot={
    <>
      <Icon name="magnifyingglass" size={22} color="#CFBFAD" />
      <Icon name="plus" size={22} color="#CFBFAD" />
    </>
  }
/>

<FilterPill content="Requests" isActive onClick={() => {}} />
<FilterPill content="Friends" onClick={() => {}} />

<FriendRequestCard
  name="Alex"
  mutualCount={5}
  mutualAvatars={["https://...", "https://..."]}
  onAccept={() => {}}
  onDecline={() => {}}
/>
```
