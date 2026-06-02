# Tài liệu tổng hợp công thức trọng số, CTR và Tracking

## 1. Công thức tính trọng số tương tác

Nguồn tham chiếu chính:
- `src/constants/interaction.constants.ts`
- `src/services/interaction-tracker.service.ts`
- `src/services/scoring.service.ts`

### 1.1. Trọng số cho từng loại tương tác

| Loại tương tác | Ký hiệu trong hệ thống | Trọng số |
| --- | --- | ---: |
| Xem bài viết | `view` | 1 |
| Thích bài viết | `like` | 3 |
| Bình luận | `comment` | 4 |
| Chia sẻ | `share` | 5 |
| Lưu bài viết | `save` | 4 |
| Theo dõi từ bài viết | `follow_from_post` | 6 |
| Ẩn bài viết | `hide` | -5 |
| Không quan tâm | `not_interested` | -3 |
| Xem thêm | `see_more` | 2 |

### 1.2. Hệ số suy giảm khi cập nhật hồ sơ sở thích người dùng

| Loại tương tác | Hệ số decay |
| --- | ---: |
| `view` | 0.6 |
| `like` | 1.0 |
| `comment` | 1.0 |
| `share` | 1.0 |
| `save` | 1.0 |
| `follow_from_post` | 1.2 |
| `hide` | 1.0 |
| `not_interested` | 1.0 |
| `see_more` | 0.8 |

### 1.3. Công thức cộng dồn trọng số trong Tracking

Khi người dùng phát sinh tương tác với bài viết, hệ thống ghi nhận theo cặp `(userId, postId)` và cộng dồn:

```text
weight_new = weight_old + INTERACTION_WEIGHTS[type]
```

Ví dụ:

```text
like (3) + comment (4) = weight = 7
```

Nếu là hành vi `view`, hệ thống chỉ ghi nhận khi:

```text
viewDuration >= 2 giây
```

### 1.4. Công thức cập nhật hồ sơ sở thích người dùng

Giá trị dùng để cập nhật sở thích:

```text
delta = weight * decay
```

Sau đó hệ thống cộng vào các nhóm điểm:

```text
topicScores[key]   += delta
authorScores[id]   += delta * 0.7
hashtagScores[tag] += delta * 0.9
interactionCount   += 1
```

## 2. Công thức CTR, engagement và điểm feed

Nguồn tham chiếu chính:
- `src/services/feed-analytics.service.ts`
- `src/constants/feed.constants.ts`
- `src/services/scoring.service.ts`

### 2.1. Công thức CTR

Hệ thống đang tính CTR của feed theo số lượt xem hợp lệ trên tổng số impression:

```text
CTR = views / impressions
```

Trong đó:
- `impressions`: số lần bài viết được đẩy vào feed.
- `views`: số lượt `UserInteraction` có cờ `viewed = true`.

### 2.2. Công thức engagement rate

```text
engagementActions = likes + comments + shares + saves
engagementRate = engagementActions / impressions
```

### 2.3. Công thức negative feedback rate

```text
negativeFeedbackRate = (hides + notInterested) / impressions
```

### 2.4. Công thức tính điểm xếp hạng feed

Điểm cuối cùng của một bài viết:

```text
finalScore =
  weights.content    * contentScore +
  weights.popularity * popularityScore +
  weights.social     * socialScore
```

Trọng số theo từng nhóm người dùng:

| Nhóm người dùng | `content` | `popularity` | `social` |
| --- | ---: | ---: | ---: |
| Cold start (`interactionCount < 10`) | 0.05 | 0.7 | 0.25 |
| Người dùng thông thường | 0.5 | 0.2 | 0.3 |

### 2.5. Công thức popularity score khi chưa có `hotScore`

```text
engagements =
  likesCount * 3 +
  commentsCount * 4 +
  sharesCount * 5 +
  savesCount * 4 +
  viewsCount * 0.1
```

```text
ageHours = (thời điểm hiện tại - createdAt) / 3600000
raw = engagements / (ageHours + 2) ^ 1.5
popularityScore = min(raw * 2, 100)
```

## 3. Kết quả Tracking đang được lưu trong hệ thống

Nguồn tham chiếu chính:
- `src/services/interaction-tracker.service.ts`
- `docs/database-erd.md`
- `src/controllers/post.controller.ts`

### 3.1. Kết quả lưu trong `UserInteraction`

Mỗi document Tracking đang lưu các thông tin chính:
- `userId`, `postId`
- Các cờ hành vi: `viewed`, `liked`, `commented`, `shared`, `saved`
- `weight` cộng dồn
- `feedbackType`
- `viewDuration`, `scrollDepth`
- `source`, `deviceType`
- `createdAt`

Đặc điểm lưu trữ:
- Mỗi cặp `(userId, postId)` chỉ có 1 document.
- Tracking dùng `findOneAndUpdate(..., { upsert: true })` để cập nhật đè cờ hành vi nhưng vẫn cộng dồn `weight`.
- Dữ liệu có TTL 90 ngày theo tài liệu ERD.

### 3.2. Kết quả lưu trong `FeedImpression`

Mỗi lần feed trả về danh sách bài viết, hệ thống lưu:
- `userId`
- `postId`
- `requestId`
- `tab`
- `source`
- `position`
- `score`
- `scoreContent`
- `scorePopularity`
- `scoreSocial`

Ý nghĩa:
- Đây là dữ liệu đầu vào để tính `impressions`.
- Dữ liệu này được đối chiếu với `UserInteraction` để suy ra `CTR`, `engagementRate` và `negativeFeedbackRate`.

### 3.3. Kết quả Tracking suy ra cho báo cáo

Từ luồng hiện tại, có thể kết luận:
- Hệ thống đã Tracking đầy đủ 2 lớp dữ liệu: `impression` và `interaction`.
- `CTR` không tính theo click truyền thống, mà đang được quy đổi theo lượt xem hợp lệ trên tổng impression.
- `weight` là chỉ số thể hiện mức độ quan tâm tích lũy của người dùng đối với từng bài viết.
- Dữ liệu Tracking còn được dùng để cập nhật `UserProfile`, từ đó cá nhân hóa feed ở các lần phân phối tiếp theo.

## 4. Trích dẫn nhanh theo mã nguồn

- Bảng trọng số tương tác: `src/constants/interaction.constants.ts:3`
- Bảng decay tương tác: `src/constants/interaction.constants.ts:15`
- Ngưỡng view hợp lệ 2 giây: `src/constants/interaction.constants.ts:27`
- Cộng dồn `weight` trong tracking: `src/services/interaction-tracker.service.ts:48`
- Công thức `delta = weight * decay`: `src/services/interaction-tracker.service.ts:90`
- Cập nhật `topicScores`, `authorScores`, `hashtagScores`: `src/services/interaction-tracker.service.ts:97`, `:104`, `:113`
- Công thức CTR: `src/services/feed-analytics.service.ts:128`
- Công thức engagement rate: `src/services/feed-analytics.service.ts:129`
- Công thức negative feedback rate: `src/services/feed-analytics.service.ts:132`
- Công thức final score: `src/services/scoring.service.ts:70`
- Công thức popularity fallback: `src/services/scoring.service.ts:125`, `:134`

## 5. Ghi chú đưa vào báo cáo

Nếu cần viết theo văn phong báo cáo học thuật, có thể diễn đạt ngắn gọn như sau:

> Hệ thống sử dụng cơ chế Tracking hai tầng gồm ghi nhận lần hiển thị bài viết trên feed (`FeedImpression`) và ghi nhận hành vi tương tác thực tế (`UserInteraction`). Từ hai nguồn dữ liệu này, hệ thống tính được các chỉ số `CTR`, `engagementRate` và `negativeFeedbackRate`, đồng thời xây dựng trọng số quan tâm của từng người dùng đối với từng bài viết để phục vụ cá nhân hóa nội dung.
