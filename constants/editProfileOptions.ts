/** Gợi ý địa chỉ (lọc theo text người dùng nhập) — bổ sung từ API sau nếu cần */
export const ADDRESS_SUGGESTIONS: string[] = [
  "Quận 1, TP.HCM",
  "Quận 3, TP.HCM",
  "Quận 7, TP.HCM",
  "Thủ Đức, TP.HCM",
  "Bình Thạnh, TP.HCM",
  "Tân Bình, TP.HCM",
  "Hà Nội — Hoàn Kiếm",
  "Hà Nội — Cầu Giấy",
  "Hà Nội — Đống Đa",
  "Đà Nẵng — Hải Châu",
  "Cần Thơ — Ninh Kiều",
  "Hải Phòng — Hồng Bàng",
  "Huế — TP.Huế",
  "Nha Trang — Khánh Hòa",
  "Vũng Tàu — Bà Rịa",
  "Biên Hòa — Đồng Nai",
  "Bình Dương — Thủ Dầu Một",
];

/** Tình trạng mối quan hệ — lưu chuỗi hiển thị */
export const RELATIONSHIP_OPTIONS: { label: string; value: string }[] = [
  { label: "Độc thân", value: "Độc thân" },
  { label: "Đang hẹn hò", value: "Đang hẹn hò" },
  { label: "Đã kết hôn", value: "Đã kết hôn" },
  { label: "Đã ly hôn", value: "Đã ly hôn" },
  { label: "Không tiết lộ", value: "Không tiết lộ" },
];
