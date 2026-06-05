# Mingo BE — FE Mobile Verification Checklist

Tài liệu này dùng để FE mobile đối chiếu **toàn bộ chức năng BE** đã implement, đảm bảo tích hợp đầy đủ và đúng theo đề cương KLTN.

> **Cách dùng:** Đọc từng module → tích checkbox sau khi đã test trên app → ghi note nếu lệch.

---

## 0. Quy ước chung

### Base URL

```
http://localhost:3000          # local dev
https://api.mingo.app          # production (placeholder)
```

### Authentication

Mọi endpoint yêu cầu auth dùng header:

```
Authorization: Bearer <accessToken>
```

`accessToken` lấy từ response của `POST /api/auth/login` hoặc `POST /api/auth/register`. Hết hạn sau **1 ngày** → gọi `POST /api/auth/refresh-token` (cookie httpOnly tự gửi).

### Response format chuẩn

**Success:**

```json
{
  "success": true,
  "message": "Thành công",
  "data": { },
  "timestamp": "2026-05-24T14:00:00.000Z"
}
```

**Paginated:**

```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1, "limit": 10, "total": 100,
    "totalPages": 10, "hasMore": true
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mật khẩu phải có ít nhất 6 ký tự"
  }
}
```

### HTTP status codes thường gặp

| Code | Ý nghĩa | Khi nào |
|---|---|---|
| 400 | VALIDATION_ERROR | Body sai format / thiếu field |
| 401 | UNAUTHORIZED | Token sai/hết hạn / chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền (vd: non-admin gọi admin) |
| 404 | NOT_FOUND | Resource không tồn tại |
| 409 | CONFLICT | Trùng (email/phone đã đăng ký) |

---

## 1. Authentication (đăng ký / đăng nhập / 2FA)

### Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | – | Đăng ký bằng email hoặc phone + password |
| POST | `/api/auth/login` | – | Login bằng email/phone + password |
| POST | `/api/auth/google` | – | Login Google (body: `{ idToken }`) |
| POST | `/api/auth/refresh-token` | cookie | Lấy accessToken mới |
| POST | `/api/auth/logout` | ✅ | body: `{ allDevices?: boolean }` |
| POST | `/api/auth/2fa/setup` | ✅ | Tạo secret + otpauthUrl để quét QR |
| POST | `/api/auth/2fa/enable` | ✅ | body: `{ secret, code }` — bật 2FA |
| POST | `/api/auth/2fa/disable` | ✅ | body: `{ code, password }` |
| POST | `/api/auth/2fa/complete-login` | – | body: `{ pendingToken, code }` |

### Body chi tiết

**Register / Login:**

```json
{
  "email": "u@a.com",
  "phoneNumber": "+84912345678",
  "password": "abcdef",
  "name": "Tên hiển thị"
}
```

> Cần có ít nhất 1 trong `email` hoặc `phoneNumber`. `password` ≥ 6 ký tự.

**Login response khi user đã bật 2FA:**

```json
{
  "data": {
    "requiresTwoFactor": true,
    "pendingToken": "eyJhbGciOi..."
  }
}
```

→ FE chuyển sang màn nhập code, gọi `/2fa/complete-login` với `pendingToken` + `code` 6 chữ số.

### Test checklist

- [ ] Đăng ký bằng email → nhận `accessToken` + `user` ở response
- [ ] Đăng ký bằng phone → nhận `accessToken`
- [ ] Đăng ký trùng email → 409 CONFLICT
- [ ] Login sai password → 401 UNAUTHORIZED
- [ ] Login đúng → app tự lưu `accessToken` và set header cho mọi request sau
- [ ] Login Google: gửi `idToken` (lấy từ Google Sign-In SDK)
- [ ] Bật 2FA: scan QR (otpauthUrl) bằng Google Authenticator → nhập code → bật thành công
- [ ] Login với account đã bật 2FA: nhận `requiresTwoFactor: true` → màn nhập code → login OK
- [ ] Tắt 2FA cần nhập password + code OTP đúng
- [ ] Refresh token tự động chạy khi accessToken 401
- [ ] Logout với `allDevices: true` → các thiết bị khác cùng user bị invalidate

---

## 2. Email Verification

### Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/email/send-verification` | ✅ | Gửi email xác thực (link + OTP) |
| POST | `/api/auth/email/verify` | – | body: `{ email, code }` (`code` = link token hoặc OTP) |

### Test checklist

- [ ] Sau register email → user nhận email với link `${CLIENT_URL}/auth/verify-email?token=...&email=...`
- [ ] Tap link mở app deep link → app POST `/email/verify` → user.verified = true
- [ ] Hoặc nhập OTP 6 số trong email → verify OK
- [ ] Gửi lại trong vòng 60s → 400 VERIFICATION_RATE_LIMITED
- [ ] Sai OTP 5 lần liên tục → mã bị invalidate, phải xin mới
- [ ] Token quá 30 phút → 404 VERIFICATION_NOT_FOUND
- [ ] Email đã verified rồi → 400 EMAIL_ALREADY_VERIFIED khi gọi send-verification

> **Dev mode** (chưa cấu hình SMTP): backend in email ra console — copy link/OTP từ log.

---

## 3. Phone OTP

### Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/phone/send-otp` | ✅ | Gửi OTP qua SMS đến phoneNumber của user |
| POST | `/api/auth/phone/verify-otp` | – | body: `{ phoneNumber, code }` |

### Test checklist

- [ ] Send OTP với account có phone thật → nhận SMS
- [ ] Send OTP cho account email-only (phone giả `e_xxx`/`g_xxx`) → 400 PHONE_INVALID
- [ ] Nhập OTP đúng → user.verified = true
- [ ] Nhập OTP sai → 400 VERIFICATION_CODE_INVALID, attempts tăng
- [ ] OTP hết 10 phút → 404

> **Dev mode**: backend in OTP ra console (chưa cài Twilio).

---

## 4. Forgot / Reset Password

### Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/forgot-password` | – | body: `{ email? \| phoneNumber? }` |
| POST | `/api/auth/reset-password` | – | body: `{ email \| phoneNumber, code, newPassword }` |

### Test checklist

- [ ] Forgot với email tồn tại → email hộp thư đến
- [ ] Forgot với email KHÔNG tồn tại → vẫn 200 (chống user enumeration)
- [ ] Forgot với phone tồn tại → SMS OTP
- [ ] Reset với code đúng + newPassword ≥ 6 ký tự → password đổi
- [ ] Sau reset, các session đang sống bị **revoke toàn bộ** → user bị logout khỏi mọi thiết bị
- [ ] Login lại bằng password mới → OK

---

## 5. User Profile

### Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/users/me` | ✅ | Lấy hồ sơ chính mình |
| PUT | `/api/users/me` | ✅ | Cập nhật profile |
| POST/PUT | `/api/users/me/avatar` | ✅ | Upload avatar (multipart `avatar`) |
| POST/PUT | `/api/users/me/background` | ✅ | Upload bìa (multipart `background`) |
| GET | `/api/users/:id` | ✅ | Lấy hồ sơ user khác |
| GET | `/api/users/:id/posts` | ✅ | Bài viết của user |
| GET | `/api/users/phone/:phoneNumber` | ✅ | Tìm user theo số điện thoại |

### Update profile body

```json
{
  "name": "...",
  "bio": "...",
  "hobby": ["..."],
  "work": "...",
  "currentAddress": "...",
  "hometown": "...",
  "dateOfBirth": "2000-01-01",
  "gender": "male"
}
```

### Test checklist

- [ ] GET `/me` trả đầy đủ thông tin (không có `passwordHash`, `twoFactorSecret`)
- [ ] PUT `/me` cập nhật từng field
- [ ] Upload avatar (jpg/png ≤ 10MB) → URL Cloudinary trong response
- [ ] Upload background tương tự
- [ ] GET `/users/:id` user khác trả info public
- [ ] GET `/users/phone/:phone` cho phép tìm bạn

---

## 6. Follow / Friends / Bestfriend / Block

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/follow/request` | body: `{ targetUserId }` — gửi follow request |
| PUT | `/api/follow/request/:requestId/respond` | body: `{ action: "accept"\|"reject" }` |
| DELETE | `/api/follow/request/:userId` | Hủy request đã gửi |
| DELETE | `/api/follow/:userId` | Unfollow |
| DELETE | `/api/follow/follower/:userId` | Xóa follower (không follow lại mình) |
| POST | `/api/follow/close-friend/request` | body: `{ targetUserId }` — gửi yêu cầu bestfriend |
| PUT | `/api/follow/close-friend/request/:requestId/respond` | accept/reject bestfriend |
| DELETE | `/api/follow/close-friend/:userId` | Xóa khỏi bestfriend |
| GET | `/api/follow/requests/pending` | Follow request mình nhận |
| GET | `/api/follow/requests/sent` | Follow request mình đã gửi |
| GET | `/api/follow/close-friend/requests/pending` | Bestfriend request nhận |
| GET | `/api/follow/stats` | Stats của mình (followers/following counts) |
| GET | `/api/follow/stats/:userId` | Stats user khác |
| GET | `/api/follow/relationship/:userId` | Trạng thái mối quan hệ với user X |
| GET | `/api/follow/:userId/followers` | Danh sách followers |
| GET | `/api/follow/:userId/following` | Danh sách following |
| GET | `/api/follow/:userId/friends` | Bạn bè (mutual follow) |
| GET | `/api/follow/close-friends` | Bestfriend của mình |
| GET | `/api/follow/:userId/close-friends` | Bestfriend của user khác |
| POST | `/api/follow/blocks` | body: `{ userId }` — chặn user |
| DELETE | `/api/follow/blocks/:userId` | Bỏ chặn |
| GET | `/api/follow/blocks` | Danh sách user mình đã chặn |

### Test checklist

- [ ] User A gửi follow B → B nhận notification `follow_request`
- [ ] B accept → A nhận notification `follow_accepted`, A xuất hiện trong followers của B
- [ ] Mutual follow (A↔B) → cả hai thấy nhau trong `/friends`
- [ ] Bestfriend phải là friend trước (mutual) — gửi request → accept → 2 chiều
- [ ] Block user X → bài của X biến mất khỏi feed của mình; X không thấy bài của mình
- [ ] Block xong unblock → quan hệ trước đó (follow) bị xóa, phải follow lại

---

## 7. Posts (đăng bài đa phương tiện)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/posts/trending` | Top 10 trending public |
| GET | `/api/posts/feed?tab=friends\|explore&page=&limit=` | Feed |
| POST | `/api/posts/feed/feedback` | Feedback ẩn/không quan tâm/xem thêm |
| GET | `/api/posts/feed/metrics?days=7&tab=` | CTR, engagement (FE thường không cần) |
| GET | `/api/posts/stats/count` | Tổng số bài của mình |
| GET | `/api/posts` | Tất cả posts (admin/dev) |
| POST | `/api/posts` | Tạo post (JSON, không upload file ở đây) |
| GET | `/api/posts/:id` | Chi tiết 1 post + topComments + aiScores |
| PUT | `/api/posts/:id` | Sửa post |
| DELETE | `/api/posts/:id` | Xóa post |
| GET | `/api/posts/user/:userId` | Bài của 1 user |
| POST | `/api/posts/:postId/media` | Upload media (multipart `files[]`, max 10) |
| GET | `/api/posts/:postId/media` | Lấy media của post |
| POST | `/api/posts/:id/like` / DELETE | Like / Unlike |
| POST | `/api/posts/:id/save` / DELETE | Save / Unsave |
| POST | `/api/posts/:id/share` | Share — body: `{ sharedTo, caption? }` |

### Create post body

```json
{
  "contentText": "Hôm nay #đẹp với @huynh",
  "contentRichText": "<p>HTML tuỳ chọn</p>",
  "visibility": "public",
  "hashtags": ["đẹp", "trời"],
  "mentions": ["64fa..."],
  "locationName": "Đà Lạt",
  "locationLatitude": 11.94,
  "locationLongitude": 108.43
}
```

`visibility`: `"public" | "friends" | "bestfriends" | "private"`

### Quy trình tạo post có media

1. `POST /api/posts` (JSON) → nhận `postId`
2. `POST /api/posts/:postId/media` (multipart) — `files[]` chứa ảnh/video, max 10 file

### Test checklist

- [ ] Tạo post text, post hiện trong feed
- [ ] Tạo post với hashtag `#abc` → lưu vào `post.hashtags`
- [ ] Tạo post mention `@user` → user được mention nhận notification
- [ ] Upload nhiều ảnh + video cùng post → đúng thứ tự `orderIndex`
- [ ] Đổi visibility friends → bài không hiện cho user không phải friend
- [ ] Like/unlike → counter +/- 1, `isLiked` đảo
- [ ] Save/unsave → bài xuất hiện ở `/saved-posts`
- [ ] Share `feed` → tạo repost; share `message` → mở picker chat; share `external` → trả URL
- [ ] Edit post → `isEdited: true`, culture translation re-analyze
- [ ] Bài chứa từ tục → moderationStatus = `rejected`, isHidden = true
- [ ] Author vẫn thấy bài của mình kể cả khi bị ẩn (FE hiện badge "Đang ẩn")

---

## 8. Comments + Replies (phân cấp)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/posts/:postId/comments?page=&limit=` | List top-level comment |
| POST | `/api/posts/:postId/comments` | body: `{ contentText }` — comment cho post |
| POST | `/api/posts/:postId/comments/:commentId/replies` | Reply cho 1 comment |
| GET | `/api/comments/:commentId` | Chi tiết comment |
| PUT | `/api/comments/:commentId` | Sửa comment |
| DELETE | `/api/comments/:commentId` | Xóa comment |
| GET | `/api/comments/:commentId/replies` | List reply của 1 comment |
| POST | `/api/comments/:commentId/like` / DELETE | Like / Unlike comment |

### Test checklist

- [ ] Comment cho post → owner nhận notification `post_comment`
- [ ] Reply comment → comment owner nhận notification `comment_reply`
- [ ] Reply lồng cấp 2+ → vẫn flatten hiển thị 1 cấp ở UI (parent gốc)
- [ ] Like comment → counter tăng, `isLiked` đảo
- [ ] Edit comment → `isEdited: true`
- [ ] Comment chứa hate speech → tự động ẩn

---

## 9. Search

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/search?q=&type=&page=&limit=` | Search global |

`type`: `users \| posts \| hashtags \| all` (default `all`)

### Test checklist

- [ ] Search user theo tên/phone → trả list users
- [ ] Search post theo content → trả posts (text-index)
- [ ] Search hashtag → trả top hashtags + post liên quan

---

## 10. Personalized Feed + Interaction Tracking

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/posts/feed?tab=friends&page=&limit=` | Feed bạn bè (mới nhất từ following) |
| GET | `/api/posts/feed?tab=explore&page=&limit=` | Feed Khám phá (cá nhân hóa) |
| POST | `/api/posts/feed/feedback` | Feedback hide/not_interested/see_more |
| POST | `/api/interactions/track` | Báo BE biết user vừa view/like/comment/share/save |

### Body track

```json
{
  "postId": "...",
  "type": "view",
  "viewDuration": 5.2,
  "scrollDepth": 0.8,
  "source": "explore",
  "deviceType": "ios"
}
```

`type`: `view | like | comment | share | save | follow_from_post | hide | not_interested | see_more | report`

`source`: `feed | explore | profile | search | notification`

### Body feedback

```json
{
  "postId": "...",
  "feedbackType": "not_interested",
  "tab": "explore"
}
```

### Test checklist

- [ ] Tab Friends: chỉ hiển thị bài từ user đang follow, sort mới nhất
- [ ] Tab Explore: gồm cả bài ngoài vòng follow, sắp xếp theo score
- [ ] User mới (cold start) → Explore ưu tiên trending posts
- [ ] Track view khi user xem ≥ 2s; track like ngay khi nhấn
- [ ] Feedback "không quan tâm" 1 bài → bài tương tự author/topic giảm xuất hiện ở refresh sau
- [ ] Refresh feed không hiện lại bài đã xem (viewed=true)
- [ ] Bài đã block author không hiện
- [ ] Bài private/friends/bestfriends ẩn đúng theo quan hệ

---

## 11. Network Culture Translation (dịch văn hóa mạng)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/culture/posts/:postId/culture-terms` | Lấy danh sách từ slang đã phát hiện trong post |
| POST | `/api/culture/posts/:postId/reanalyze` | Re-analyze (sau khi user edit post) |
| POST | `/api/culture/posts/:postId/report-term` | body: `{ term }` — báo nghĩa sai |
| GET | `/api/culture/admin/slang-dictionary` | (admin) list từ điển |
| POST | `/api/culture/admin/slang-dictionary` | (admin) thêm slang |
| PATCH | `/api/culture/admin/slang-dictionary/:id/toggle` | (admin) bật/tắt entry |

### Response item

```json
{
  "term": "flex",
  "startIndex": 12,
  "endIndex": 16,
  "meaning": "Khoe khoang một cách hài hước",
  "origin": "TikTok",
  "tone": "hài hước",
  "contextNote": "Trong bài này dùng để khoe điện thoại mới"
}
```

### Test checklist

- [ ] Đăng post chứa "ib4l flex chill" → 1-2s sau GET culture-terms trả 3 entries
- [ ] FE highlight các đoạn `[startIndex, endIndex]` trong text
- [ ] Tap vào từ → hiển thị tooltip với `meaning`, `origin`, `tone`, `contextNote`
- [ ] Báo từ sai → reportCount tăng, admin có thể remove
- [ ] Edit post → terms tự re-analyze

---

## 12. AI Content Moderation (transparent với client)

FE không gọi AI trực tiếp — moderation chạy ngầm khi tạo post/comment. Client chỉ cần xử lý các trạng thái:

### Field response cần xem

```typescript
{
  moderationStatus: "pending" | "approved" | "rejected" | "flagged" | "violated",
  isHidden: boolean,
  hiddenReason?: string,        // chỉ trong PostDetail
  aiScores?: {                  // chỉ PostDetail
    toxic, hateSpeech, spam, overallRisk    // 0..1
  }
}
```

### Test checklist

- [ ] Đăng post bình thường → moderationStatus = `approved` ngay lập tức
- [ ] Đăng post có từ tục → moderationStatus = `rejected`, isHidden = true
- [ ] Author vẫn thấy bài của mình (FE hiện banner "Bài đang bị ẩn vì vi phạm")
- [ ] User khác không thấy bài isHidden
- [ ] Bài flagged (nghi vấn) vẫn hiện nhưng admin có thể xét duyệt

---

## 13. Reports (user báo cáo)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/reports` | body: `{ entityType, entityId, reason, description? }` |
| GET | `/api/reports/my` | Báo cáo do mình tạo |
| GET | `/api/reports/related/:userId` | Báo cáo liên quan tới user |
| POST | `/api/users/:userId/report` | Báo cáo user (shortcut) |

`entityType`: `post | comment` — báo cáo user thì gọi route `/users/:userId/report`.

`reason`: `spam | harassment | hate_speech | inappropriate | scam | copyright | violence | misinformation | other`

### Test checklist

- [ ] Báo cáo post → status = pending, admin thấy ở `/api/admin/reports/pending`
- [ ] Không thể báo cáo cùng 1 entity 2 lần → 409 CONFLICT
- [ ] Sau khi admin resolve → cả mình và người liên quan thấy status `resolved`

---

## 14. Notifications (in-app)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/notifications?page=&limit=&type=&isRead=` | List có filter |
| GET | `/api/notifications/unread` | Chỉ chưa đọc |
| GET | `/api/notifications/count` | `{ total, unread, unseen }` |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/api/notifications/read-all` | Đọc hết |
| PUT | `/api/notifications/seen-all` | Xem hết (badge số) |
| DELETE | `/api/notifications/:id` | Xóa 1 |
| DELETE | `/api/notifications/read` | Xóa các đã đọc |
| DELETE | `/api/notifications/all` | Xóa toàn bộ |

### Notification types

```
post_like, post_comment, post_share, post_mention,
media_like, media_comment, media_share,
comment_like, comment_reply, comment_mention,
follow_request, follow_accepted, follow_new,
close_friend_request, close_friend_accepted,
message_new, system
```

### Test checklist

- [ ] Khi A like bài B → B nhận notification `post_like` (in-app + push)
- [ ] Badge count cập nhật realtime qua Socket.IO event `notification:count`
- [ ] Tap notification → deep link đúng entity (post/comment/user)
- [ ] Mark all as read → badge về 0

---

## 15. Push Notification (FCM/APNs)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/notifications/devices` | Đăng ký device token |
| GET | `/api/notifications/devices` | List thiết bị active |
| DELETE | `/api/notifications/devices/:token` | Bỏ đăng ký (logout) |

### Body register

```json
{
  "token": "<FCM registration token>",
  "platform": "ios",
  "deviceLabel": "iPhone 15 Pro",
  "appVersion": "1.0.0"
}
```

`platform`: `ios | android | web`

### Push payload structure

Khi BE gọi FCM, payload data sẽ có dạng:

```json
{
  "notification": {
    "title": "Tên người gửi",
    "body": "Nội dung thông báo",
    "imageUrl": "https://..."
  },
  "data": {
    "notificationId": "...",
    "type": "post_like",
    "entityType": "post",
    "entityId": "...",
    "postId": "...",
    "commentId": "...",
    "mediaId": "..."
  }
}
```

### Test checklist

- [ ] Sau login: app gọi `POST /devices` với FCM token vừa lấy
- [ ] Sau logout: gọi `DELETE /devices/:token`
- [ ] Khi user A like bài B (tab background): B nhận push notification trên thiết bị
- [ ] Tap notification → app open + deep link tới post (qua `data.entityId`)
- [ ] Token thay đổi (FCM refresh) → app gọi lại `POST /devices` (upsert)
- [ ] Uninstall app trên máy A → token chết, sau lần push tiếp theo BE tự deactivate

---

## 16. Messaging (1-1 + Group)

### Endpoints chính

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/messages/boxes` | Tạo group (1-1 hoặc nhiều người) |
| GET | `/api/messages/boxes` | List 1-1 conversation |
| GET | `/api/messages/conversations` | Alias của `/boxes` |
| GET | `/api/messages/boxes/groups` | List nhóm |
| GET | `/api/messages/boxes/groups/category/:category` | Theo category |
| GET | `/api/messages/boxes/:boxId/detail` | Detail group |
| GET | `/api/messages/boxes/:boxId` | Detail 1-1 |
| DELETE | `/api/messages/boxes/:boxId` | Xóa box |
| PATCH | `/api/messages/boxes/:boxId/info` | Đổi tên/mô tả group |
| PATCH | `/api/messages/boxes/:boxId/avatar` | Upload avatar group |
| PATCH | `/api/messages/boxes/:boxId/category` | Đổi category |
| POST | `/api/messages/boxes/:boxId/members` | Thêm member |
| DELETE | `/api/messages/boxes/:boxId/members/:memberId` | Kick |
| POST | `/api/messages/boxes/:boxId/leave` | Rời group |
| PATCH | `/api/messages/boxes/:boxId/admins/promote` | Promote admin |
| PATCH | `/api/messages/boxes/:boxId/admins/demote` | Demote admin |
| GET | `/api/messages/boxes/read-status` | Trạng thái đọc batch |
| POST | `/api/messages/boxes/:boxId/read` | Đánh dấu đã đọc |
| POST | `/api/messages/:boxId` | Gửi message (multipart `files[]` hoặc JSON) |
| GET | `/api/messages/:boxId` | List message 1-1 |
| GET | `/api/messages/:boxId/group` | List message group |
| PATCH | `/api/messages/:messageId/edit` | Sửa message |
| DELETE | `/api/messages/:messageId?type=for_me\|recall` | Xóa hoặc thu hồi |
| GET | `/api/messages/:boxId/search?q=` | Search trong box |
| GET | `/api/messages/:boxId/media/images` | Tab ảnh |
| GET | `/api/messages/:boxId/media/videos` | Tab video |
| GET | `/api/messages/:boxId/media/audio` | Tab voice |
| GET | `/api/messages/:boxId/media/files` | Tab file |
| PUT | `/api/messages/status/online` | Set online |
| PUT | `/api/messages/status/offline` | Set offline |

### Send message

**JSON (text only):**

```json
{
  "contentType": "text",
  "content": "Hello!",
  "replyToMessageId": "..."
}
```

**Multipart (image/video/voice/file):**

- field `files[]`: 1+ file
- field `contentType`: `image | video | voice | file`
- field `content`: caption (optional)

### Test checklist

- [ ] Mở chat 1-1 với user X → tự động tạo box nếu chưa có
- [ ] Gửi text → message hiện ngay (optimistic), socket emit `message:new` cho người nhận
- [ ] Gửi ảnh/video/voice qua multipart → URL Cloudinary
- [ ] Người nhận online → realtime nhận; offline → khi mở app gọi `GET /:boxId` lấy lịch sử
- [ ] Đánh dấu đã đọc khi mở chat → emit `read-status:update`
- [ ] Tin nhắn typing indicator → emit socket event
- [ ] Edit message trong 5 phút → có dấu `(đã chỉnh sửa)`
- [ ] Recall message → cả 2 phía đều thấy `(tin đã thu hồi)`
- [ ] Delete `for_me` → chỉ ẩn ở phía mình
- [ ] Tạo group, thêm/xóa member, đổi avatar/tên đều hoạt động
- [ ] Online/offline status thấy ở conversation list

---

## 17. Calls (WebRTC signaling)

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/messages/calls/history` | Lịch sử cuộc gọi |
| POST | `/api/messages/calls` | Tạo cuộc gọi mới (signaling) |
| PATCH | `/api/messages/calls/:callId` | Cập nhật status (`ringing\|accepted\|declined\|ended\|missed`) |

### Test checklist

- [ ] Khởi tạo call → callee nhận event socket `call:incoming`
- [ ] Accept/decline → status update
- [ ] End call → log vào history với duration
- [ ] WebRTC offer/answer/ice-candidate trao đổi qua socket events `call:signal`

> **Note**: BE chỉ làm signaling. Truyền media qua P2P/STUN/TURN — FE tự cấu hình `react-native-webrtc`.

---

## 18. Realtime Events (Socket.IO)

### Connect

```javascript
const socket = io("https://api.mingo.app", {
  auth: { token: accessToken },   // hoặc cookie
});
```

### Events FE cần lắng nghe

| Event | Payload | Mô tả |
|---|---|---|
| `notification:new` | NotificationDto | Thông báo mới |
| `notification` | NotificationDto | Alias (legacy) |
| `notification:count` | `{ total, unread, unseen }` | Cập nhật badge |
| `message:new` | MessageDto | Tin nhắn mới |
| `message:edited` | MessageDto | Tin nhắn được sửa |
| `message:deleted` | `{ messageId, boxId }` | Tin nhắn bị xóa/recall |
| `read-status:update` | `{ boxId, userId, lastReadAt }` | User khác đã đọc |
| `typing:start` / `typing:stop` | `{ boxId, userId }` | Typing indicator |
| `presence:online` / `presence:offline` | `{ userId }` | Friend online/offline |
| `call:incoming` | `{ callId, from, type }` | Call đến |
| `call:signal` | WebRTC signal | offer/answer/candidate |
| `call:ended` | `{ callId }` | Cuộc gọi kết thúc |

### Events FE emit

| Event | Payload | Mô tả |
|---|---|---|
| `message:typing` | `{ boxId, isTyping }` | Báo đang gõ |
| `presence:heartbeat` | – | Giữ online status |
| `call:signal` | `{ callId, type, payload }` | WebRTC signaling |

### Test checklist

- [ ] Connect socket sau login → server xác thực bằng token
- [ ] Disconnect/reconnect tự động khi mất mạng
- [ ] Listen `notification:new` → push toast trong app
- [ ] Listen `message:new` → chèn vào ChatScreen, tăng unread ở list
- [ ] Multi-device cùng user: cả 2 thiết bị cùng nhận event

---

## 19. Admin (chỉ admin role)

> Mobile app thường KHÔNG cần — đây là webview admin. List để FE biết có gì sẵn.

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Số liệu tổng |
| GET | `/api/admin/violations/daily` | Vi phạm theo ngày |
| GET | `/api/admin/ai/performance` | Accuracy, false-positive, cost |
| GET | `/api/admin/audit-logs` | Audit logs (TTL 1 năm) |
| GET | `/api/admin/users` | List user |
| PATCH | `/api/admin/users/:id/block` | Ban user (preset reasons) |
| PATCH | `/api/admin/users/:id/unblock` | Unban |
| PATCH | `/api/admin/users/:id/toggle-active` | Active/deactive |
| DELETE | `/api/admin/users/:id` | Soft delete |
| GET | `/api/admin/posts` / `/comments` | List để moderate |
| PATCH | `/api/admin/posts/:id` | body: `{ action: "hide"\|"unhide"\|"delete" }` |
| GET | `/api/admin/reports` | Reports |
| PATCH | `/api/admin/reports/:reportId` | Resolve |

---

## 20. Phụ lục — Enums quan trọng

### `PostVisibility`

```
public | friends | bestfriends | private
```

### `ModerationStatus`

```
pending | approved | rejected | flagged | violated
```

### `NotificationType`

Xem mục 14.

### `RelationshipStatus` (từ `/api/follow/relationship/:userId`)

```typescript
{
  isFollowing: boolean,
  isFollowedBy: boolean,
  isFriend: boolean,
  isCloseFriend: boolean,
  isBlocked: boolean,
  isBlockedBy: boolean,
  followRequestSent: boolean,
  followRequestReceived: boolean,
  closeFriendRequestSent: boolean,
  closeFriendRequestReceived: boolean
}
```

### `ContentType` (message)

```
text | image | video | voice | file | system
```

### Reason codes (báo cáo)

```
spam | harassment | hate_speech | inappropriate |
scam | copyright | violence | misinformation | other
```

---

## 21. Smoke test toàn hệ thống (E2E)

Mục đích: chạy 1 lần qua flow này để chắc app hoạt động end-to-end.

1. [ ] Register A bằng email → verify email → login OK
2. [ ] Register B bằng phone → verify OTP → login OK
3. [ ] Forgot password A → reset → login lại bằng password mới
4. [ ] A bật 2FA → logout → login lại với code 2FA
5. [ ] A upload avatar → cập nhật profile
6. [ ] A đăng FCM device token → BE lưu OK
7. [ ] A gửi follow B → B nhận push + in-app notification
8. [ ] B accept → A nhận `follow_accepted`
9. [ ] B đăng post có ảnh + hashtag + mention A → A nhận push `post_mention`
10. [ ] A like + comment post → B nhận push
11. [ ] A vào explore feed → thấy bài B + các trending
12. [ ] A track view 5s rồi feedback "không quan tâm" → refresh không hiện lại
13. [ ] A nhắn tin với B (text + ảnh + voice) → realtime
14. [ ] A gọi video B → signaling thành công
15. [ ] A báo cáo 1 post tục → admin thấy ở reports/pending
16. [ ] Admin hide post → user không còn thấy; author vẫn thấy badge
17. [ ] B set bestfriend với A → A nhận thông báo
18. [ ] A đăng post chứa từ slang ("flex", "ib4l") → tap từ → tooltip dịch văn hóa
19. [ ] A block C → bài C biến mất
20. [ ] A logout → device token deactivate → push không còn đến A nữa

---

## 22. Lưu ý chung khi tích hợp

1. **Token storage**: lưu `accessToken` ở Keychain/Keystore (không AsyncStorage thuần).
2. **Refresh flow**: dùng axios interceptor — gặp 401 → gọi `/refresh-token` → retry request gốc.
3. **Cloudinary upload**: BE đã proxy upload — FE chỉ cần multipart, không cần signed URL.
4. **Pagination**: tất cả list endpoint hỗ trợ `?page=&limit=` (default `page=1, limit=10`).
5. **Date format**: ISO 8601 UTC (`2026-05-24T14:00:00.000Z`).
6. **ObjectId**: là string 24 hex chars (vd: `"64fa1234abcd5678ef901234"`).
7. **Multilang**: hiện tại response message đa số tiếng Việt — FE tự i18n nếu cần.
8. **Rate limit**: gửi OTP/email verify cooldown 60s/lần.
9. **Image deep link**: build URL `mingo://post/:id`, `mingo://chat/:boxId`, `mingo://user/:id` để map từ `data` của push.
10. **Offline-first**: nên cache feed + conversation list, sync khi online lại.

---

> **Tài liệu chi tiết hơn cho từng module**: xem các file `FE-COMPLETE-API-GUIDE.md`, `FE-MESSAGING-COMPLETE-GUIDE.md`, `FE-NOTIFICATION-GUIDE.md`, `FE-RECOMMENDATION-INTEGRATION-GUIDE.md` (nếu có) trong root repo BE.

