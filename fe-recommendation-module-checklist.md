# FE Checklist - Hoan thien module Recommendation theo BE

Tai lieu nay danh cho FE de kiem tra va hoan thien luong Recommendation/Personalized Feed theo backend hien tai.

## 1. Tong quan luong BE dang ho tro

BE da co 2 lop tracking chinh:

- `FeedImpression`: tu dong ghi lai cac bai viet duoc tra ve trong feed `friends` va `explore`.
- `UserInteraction`: ghi lai hanh vi thuc te cua user voi post: `view`, `like`, `comment`, `share`, `save`, `hide`, `not_interested`, `see_more`, `follow_from_post`.

Luot impression duoc BE tu dong ghi khi FE goi feed. Cac interaction con lai can FE goi dung endpoint hoac dung action endpoint co san.

## 2. Lay feed recommendation

Endpoint:

```http
GET /api/posts/feed?page=1&limit=20&tab=explore
GET /api/posts/feed?page=1&limit=20&tab=friends
```

Header:

```http
Authorization: Bearer <accessToken>
```

Yeu cau FE:

- Dung `tab=explore` cho feed de xuat ca nhan hoa.
- Dung `tab=friends` cho feed bai viet tu nguoi dang follow.
- Luu lai `post.id` va `post.userId` tren moi card de gui tracking/action ve sau.
- Khi BE tra feed thanh cong, BE da tu dong ghi `FeedImpression`, FE khong can goi endpoint impression rieng.

## 3. Tracking view hop le

Endpoint:

```http
POST /api/interactions/track
```

Body khi user xem bai viet trong feed:

```json
{
  "postId": "<postId>",
  "type": "view",
  "viewDuration": 3,
  "scrollDepth": 0.75,
  "source": "explore",
  "deviceType": "mobile"
}
```

Quy tac:

- `viewDuration` phai >= 2 giay thi BE moi ghi nhan view.
- `scrollDepth` nam trong khoang `0` den `1`.
- `source` dung `explore` neu bai nam o tab Explore.
- `source` dung `feed` neu bai nam o tab Friends.

Goi y FE:

- Chi gui `view` khi card/post da hien thi du 2 giay.
- Neu co infinite scroll, tranh spam bang cach moi `postId` chi gui view 1 lan trong mot lan vao man hinh feed.

## 4. Tracking cac action co san

FE nen dung cac endpoint action hien co thay vi tu goi `/api/interactions/track` cho like/save/share/comment, vi BE da gan tracking vao cac action nay.

```http
POST /api/posts/:id/like
DELETE /api/posts/:id/like
POST /api/posts/:id/save
DELETE /api/posts/:id/save
POST /api/posts/:id/share
POST /api/posts/:postId/comments
```

Ket qua tracking BE ghi:

- Like: `type = like`, `weight = +3`.
- Comment: `type = comment`, `weight = +4`.
- Share: `type = share`, `weight = +5`.
- Save: `type = save`, `weight = +4`.

## 5. Feedback am va dieu chinh feed

Endpoint:

```http
POST /api/posts/feed/feedback
```

Body:

```json
{
  "postId": "<postId>",
  "feedbackType": "not_interested",
  "tab": "explore"
}
```

Gia tri `feedbackType` hop le:

- `hide`
- `not_interested`
- `see_more`

Mapping BE:

- `hide` -> `weight = -5`
- `not_interested` -> `weight = -3`
- `see_more` -> `weight = +2`

Yeu cau FE:

- Nut an bai viet gui `feedbackType = hide`.
- Nut khong quan tam gui `feedbackType = not_interested`.
- Nut xem them/noi dung tuong tu gui `feedbackType = see_more`.
- Gui dung `tab` hien tai de BE gan `source` dung `feed` hoac `explore`.

## 6. Follow tu post de hoan chinh `follow_from_post`

Endpoint khong doi:

```http
POST /api/follow/request
```

Body follow thong thuong:

```json
{
  "userId": "<authorId>"
}
```

Body khi user bam Follow tren card/bai viet trong feed:

```json
{
  "userId": "<authorId>",
  "postId": "<postId>",
  "source": "explore",
  "deviceType": "mobile"
}
```

Yeu cau FE:

- Khi nut Follow nam tren post card hoac post detail duoc mo tu feed, gui them `postId`.
- `userId` la id cua tac gia can follow, khong phai id cua user dang dang nhap.
- `source` nen la `explore` hoac `feed` theo tab hien tai. Neu FE khong gui, BE mac dinh `feed`.
- `deviceType` la optional, co the gui `mobile`, `web`, `tablet`.

Ket qua BE ghi vao `UserInteraction`:

- `type = follow_from_post`
- `weight = +6`
- `followedFromPost = true`
- `feedbackType = organic`
- `source = feed` hoac `explore`

## 7. Metrics de FE/Admin kiem tra

Endpoint:

```http
GET /api/posts/feed/metrics?days=7&tab=explore
GET /api/posts/feed/metrics?days=7&tab=friends
```

Response gom cac chi so:

```json
{
  "windowDays": 7,
  "tab": "explore",
  "impressions": 100,
  "views": 60,
  "likes": 12,
  "comments": 4,
  "shares": 2,
  "saves": 5,
  "hides": 1,
  "notInterested": 3,
  "ctr": 0.6,
  "engagementRate": 0.23,
  "negativeFeedbackRate": 0.04
}
```

Cong thuc BE:

```text
ctr = views / impressions
engagementRate = (likes + comments + shares + saves) / impressions
negativeFeedbackRate = (hides + notInterested) / impressions
```

## 8. Checklist FE can tick

- Goi `GET /api/posts/feed` cho ca `explore` va `friends`.
- Khi post/card hien thi >= 2 giay, goi `/api/interactions/track` voi `type = view`.
- Like, save, share, comment dung endpoint action cua post.
- Hide, not interested, see more goi `/api/posts/feed/feedback`.
- Follow tren post card goi `/api/follow/request` kem `postId`, `source`, `deviceType`.
- Moi request co `Authorization: Bearer <accessToken>`.
- Khong gui lap view qua nhieu lan cho cung 1 post trong cung 1 session feed.
- Sau khi thao tac, goi `/api/posts/feed/metrics?days=7&tab=explore` de xem `views`, `ctr`, `engagementRate` thay doi.

## 9. Quick test bang curl

Lay feed:

```bash
curl -X GET "http://localhost:3000/api/posts/feed?page=1&limit=10&tab=explore" \
  -H "Authorization: Bearer <accessToken>"
```

Track view:

```bash
curl -X POST "http://localhost:3000/api/interactions/track" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"postId\":\"<postId>\",\"type\":\"view\",\"viewDuration\":3,\"scrollDepth\":0.8,\"source\":\"explore\",\"deviceType\":\"web\"}"
```

Follow tu post:

```bash
curl -X POST "http://localhost:3000/api/follow/request" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"<authorId>\",\"postId\":\"<postId>\",\"source\":\"explore\",\"deviceType\":\"web\"}"
```

Gui feedback khong quan tam:

```bash
curl -X POST "http://localhost:3000/api/posts/feed/feedback" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d "{\"postId\":\"<postId>\",\"feedbackType\":\"not_interested\",\"tab\":\"explore\"}"
```

Xem metrics:

```bash
curl -X GET "http://localhost:3000/api/posts/feed/metrics?days=7&tab=explore" \
  -H "Authorization: Bearer <accessToken>"
```

## 10. Ghi chu quan trong

- `follow_from_post` chi duoc ghi khi FE gui `postId` trong `POST /api/follow/request`.
- Tracking `follow_from_post` khong lam thay doi response follow. Neu tracking phu bi loi, follow request van co the thanh cong.
- Metrics hien tai tinh theo `feed` va `explore`; cac source khac nhu `profile`, `search`, `notification` khong nam trong metrics feed.
- Recommendation se ro hon sau khi user co it nhat 10 interactions. Duoi nguong nay BE xem la cold start va uu tien popularity/social nhieu hon content.
