# Plan: Web App quản lý Todo List cá nhân online

## 1. Mục tiêu

Xây dựng một web app quản lý todo list cá nhân, chạy online trên **Vercel**, sử dụng **Google Sheet** làm nơi lưu dữ liệu.

Ứng dụng cần:

- Giao diện dễ nhìn, dễ thao tác trên điện thoại.
- Quản lý nhiều danh sách công việc cá nhân.
- Xem được các việc đang làm.
- Xem được các việc đã hoàn thành.
- Đánh dấu công việc hoàn thành / chưa hoàn thành.
- Check list việc đã hoàn thành theo tháng.
- Dễ triển khai, dễ bảo trì, chi phí thấp.

---

## 2. Công nghệ đề xuất

### Frontend / Full-stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel

### Database

- Google Sheet

Có thể kết nối Google Sheet bằng một trong hai cách:

1. Google Sheets API với Service Account
2. Google Apps Script Web App API

Khuyến nghị dùng **Google Sheets API + Service Account** nếu muốn triển khai chuyên nghiệp hơn trên Vercel.

---

## 3. Kiến trúc tổng quan

```text
User Mobile / Desktop
        |
        v
Next.js Web App on Vercel
        |
        v
API Routes / Server Actions
        |
        v
Google Sheets API
        |
        v
Google Sheet Database
```

---

## 4. Tính năng chính

### 4.1. Dashboard

Màn hình chính hiển thị nhanh:

- Tổng số việc đang làm.
- Tổng số việc đã hoàn thành trong tháng hiện tại.
- Danh sách việc ưu tiên hôm nay.
- Nút thêm công việc nhanh.

Giao diện ưu tiên mobile:

- Header gọn.
- Nút thêm task dễ bấm.
- Card công việc rõ ràng.
- Checkbox lớn, dễ thao tác bằng ngón tay.

---

### 4.2. Quản lý Todo List

Người dùng có thể tạo nhiều list, ví dụ:

- Công việc
- Cá nhân
- Học tập
- Gia đình
- Dự án
- Mua sắm

Mỗi list có:

- Tên list
- Mô tả ngắn
- Màu hoặc icon đại diện
- Số lượng task đang làm
- Số lượng task đã hoàn thành

---

### 4.3. Quản lý Task

Mỗi task gồm:

- Tên công việc
- Mô tả chi tiết
- Thuộc list nào
- Trạng thái:
  - Đang làm
  - Đã hoàn thành
- Độ ưu tiên:
  - Thấp
  - Trung bình
  - Cao
- Ngày tạo
- Ngày cần hoàn thành
- Ngày hoàn thành thực tế
- Ghi chú

Các thao tác cần có:

- Thêm task mới
- Sửa task
- Xóa task
- Đánh dấu hoàn thành
- Bỏ đánh dấu hoàn thành
- Lọc theo list
- Lọc theo trạng thái
- Lọc theo tháng hoàn thành

---

## 5. Màn hình chính của ứng dụng

### 5.1. Màn hình Đang làm

Hiển thị tất cả task chưa hoàn thành.

Chức năng:

- Xem theo từng list.
- Sắp xếp theo deadline.
- Sắp xếp theo độ ưu tiên.
- Checkbox để đánh dấu hoàn thành nhanh.
- Tìm kiếm task theo từ khóa.

Giao diện mobile:

```text
Header: Todo của tôi
Search box
Filter theo list

Task Card 1
Task Card 2
Task Card 3

Floating Button: +
```

---

### 5.2. Màn hình Đã hoàn thành

Hiển thị task đã hoàn thành.

Chức năng:

- Lọc theo tháng.
- Lọc theo năm.
- Lọc theo list.
- Tìm kiếm task đã hoàn thành.
- Khôi phục task về trạng thái đang làm.

Giao diện:

```text
Header: Việc đã hoàn thành
Bộ chọn tháng/năm
Filter theo list

Tổng: 28 việc

Task hoàn thành 1
Task hoàn thành 2
Task hoàn thành 3
```

---

### 5.3. Màn hình thống kê theo tháng

Mục tiêu:

- Người dùng chọn tháng / năm.
- App hiển thị toàn bộ task đã hoàn thành trong tháng đó.
- Có thống kê tổng số task hoàn thành.
- Có thể nhóm theo list.

Ví dụ:

```text
Tháng 07/2026
Tổng việc hoàn thành: 28

Công việc: 15
Cá nhân: 7
Học tập: 6
```

Có thể thêm biểu đồ:

- Số task hoàn thành theo ngày trong tháng.
- Số task hoàn thành theo list.

---

## 6. Thiết kế giao diện mobile-first

### 6.1. Nguyên tắc UI

- Ưu tiên mobile trước.
- Font chữ rõ ràng.
- Nút bấm đủ lớn.
- Checkbox dễ chạm.
- Màu sắc nhẹ, không rối mắt.
- Task card có khoảng cách rõ.
- Không nhồi quá nhiều thông tin trên một màn hình.

### 6.2. Thanh điều hướng dưới cùng

```text
[Đang làm] [Đã xong] [Thống kê] [Lists]
```

Ưu điểm:

- Dễ thao tác bằng một tay trên điện thoại.
- Người dùng chuyển màn hình nhanh.

---

## 7. Cấu trúc Google Sheet

Tạo một Google Sheet gồm các sheet/tab sau:

### 7.1. Sheet: lists

| Cột | Tên trường | Mô tả |
|---|---|---|
| A | id | ID của list |
| B | name | Tên list |
| C | description | Mô tả |
| D | color | Màu đại diện |
| E | icon | Icon nếu có |
| F | created_at | Ngày tạo |
| G | updated_at | Ngày cập nhật |
| H | archived | TRUE/FALSE |

### 7.2. Sheet: tasks

| Cột | Tên trường | Mô tả |
|---|---|---|
| A | id | ID task |
| B | list_id | ID list chứa task |
| C | title | Tên công việc |
| D | description | Mô tả |
| E | status | doing/completed |
| F | priority | low/medium/high |
| G | due_date | Ngày cần hoàn thành |
| H | created_at | Ngày tạo |
| I | updated_at | Ngày cập nhật |
| J | completed_at | Ngày hoàn thành |
| K | note | Ghi chú |
| L | deleted | TRUE/FALSE |

---

## 8. API cần xây dựng

### 8.1. Lists API

```text
GET    /api/lists
POST   /api/lists
PATCH  /api/lists/:id
DELETE /api/lists/:id
```

Chức năng:

- Lấy danh sách list.
- Tạo list mới.
- Cập nhật list.
- Ẩn hoặc xóa mềm list.

### 8.2. Tasks API

```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Query cần hỗ trợ:

```text
/api/tasks?status=doing
/api/tasks?status=completed
/api/tasks?list_id=list_001
/api/tasks?completed_month=2026-07
/api/tasks?keyword=bao-cao
```

Chức năng:

- Lấy task theo trạng thái.
- Lấy task theo list.
- Lấy task hoàn thành theo tháng.
- Thêm task.
- Sửa task.
- Đánh dấu hoàn thành.
- Khôi phục task về đang làm.
- Xóa mềm task.

---

## 9. Luồng xử lý quan trọng

### 9.1. Thêm task mới

```text
Người dùng bấm “Thêm việc”
        ↓
Nhập tên việc, list, deadline, priority
        ↓
Bấm lưu
        ↓
App gọi POST /api/tasks
        ↓
API ghi dòng mới vào Google Sheet
        ↓
App refresh danh sách task
```

### 9.2. Đánh dấu task hoàn thành

```text
Người dùng check vào checkbox
        ↓
App gọi PATCH /api/tasks/:id
        ↓
Cập nhật status = completed
        ↓
Cập nhật completed_at = ngày hiện tại
        ↓
Task chuyển từ tab “Đang làm” sang “Đã hoàn thành”
```

### 9.3. Xem việc đã hoàn thành theo tháng

```text
Người dùng vào màn hình “Đã hoàn thành”
        ↓
Chọn tháng và năm
        ↓
App gọi /api/tasks?status=completed&completed_month=YYYY-MM
        ↓
API lọc các task có completed_at thuộc tháng đã chọn
        ↓
UI hiển thị danh sách + thống kê tổng số
```

---

## 10. Cấu trúc thư mục dự án

```text
todo-google-sheet-app/
├── app/
│   ├── page.tsx
│   ├── doing/page.tsx
│   ├── completed/page.tsx
│   ├── stats/page.tsx
│   ├── lists/page.tsx
│   └── api/
│       ├── lists/route.ts
│       └── tasks/route.ts
├── components/
│   ├── BottomNav.tsx
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── ListFilter.tsx
│   ├── MonthPicker.tsx
│   └── StatCard.tsx
├── lib/
│   ├── googleSheets.ts
│   ├── tasks.ts
│   ├── lists.ts
│   └── date.ts
├── types/
│   ├── task.ts
│   └── list.ts
├── .env.local
├── package.json
└── README.md
```

---

## 11. Biến môi trường

Nếu dùng Google Sheets API với Service Account:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
```

Lưu ý:

- Google Sheet cần được share quyền Editor cho email Service Account.
- Không commit file `.env.local` lên GitHub.
- Trên Vercel, cần thêm các biến môi trường trong Project Settings.

---

## 12. Data model TypeScript

```ts
export type TodoList = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
};

export type TaskStatus = 'doing' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  note?: string;
  deleted: boolean;
};
```

---

## 13. Kế hoạch triển khai

### Giai đoạn 1: Khởi tạo dự án

- Tạo project Next.js.
- Cài Tailwind CSS.
- Tạo layout cơ bản.
- Tạo bottom navigation.
- Tạo các page chính: Đang làm, Đã hoàn thành, Thống kê, Lists.

Kết quả:

- App chạy local.
- Có giao diện nền tảng trên mobile.

### Giai đoạn 2: Chuẩn bị Google Sheet

- Tạo Google Sheet mới.
- Tạo tab `lists`.
- Tạo tab `tasks`.
- Tạo Service Account trong Google Cloud.
- Bật Google Sheets API.
- Share Google Sheet cho Service Account.
- Tạo file `.env.local`.

Kết quả:

- App có thể đọc dữ liệu từ Google Sheet.

### Giai đoạn 3: Xây API

- Tạo helper kết nối Google Sheet.
- Xây API lấy lists.
- Xây API thêm/sửa/xóa list.
- Xây API lấy tasks.
- Xây API thêm/sửa/xóa task.
- Xây API đánh dấu hoàn thành.
- Xây API lọc task theo tháng hoàn thành.

Kết quả:

- Data được đọc/ghi qua Google Sheet.

### Giai đoạn 4: Xây giao diện chức năng

- Màn hình Đang làm.
- Màn hình Đã hoàn thành.
- Màn hình Lists.
- Form thêm/sửa task.
- Form thêm/sửa list.
- Bộ lọc theo list.
- Bộ lọc tháng/năm.
- Search box.

Kết quả:

- Người dùng có thể quản lý todo thật sự.

### Giai đoạn 5: Thống kê theo tháng

- Tính tổng task hoàn thành theo tháng.
- Nhóm task hoàn thành theo list.
- Hiển thị số lượng hoàn thành theo ngày.
- Tạo card thống kê.
- Có thể thêm biểu đồ nhỏ.

Kết quả:

- Người dùng check được hiệu suất hoàn thành công việc theo tháng.

### Giai đoạn 6: Deploy Vercel

- Push code lên GitHub.
- Import project vào Vercel.
- Thêm Environment Variables.
- Deploy production.
- Test trên điện thoại.

Kết quả:

- App có URL online để sử dụng mỗi ngày.

---

## 14. Checklist nghiệm thu

### Chức năng

- [ ] Tạo được list mới.
- [ ] Sửa được list.
- [ ] Ẩn/xóa mềm được list.
- [ ] Tạo được task mới.
- [ ] Sửa được task.
- [ ] Xóa mềm được task.
- [ ] Đánh dấu task hoàn thành.
- [ ] Khôi phục task về đang làm.
- [ ] Xem task đang làm.
- [ ] Xem task đã hoàn thành.
- [ ] Lọc task hoàn thành theo tháng.
- [ ] Tìm kiếm task.
- [ ] Lọc task theo list.
- [ ] Dữ liệu lưu vào Google Sheet.
- [ ] Deploy thành công lên Vercel.

### Giao diện mobile

- [ ] Dễ đọc trên màn hình điện thoại.
- [ ] Checkbox dễ bấm.
- [ ] Nút thêm task dễ thấy.
- [ ] Bottom navigation hoạt động tốt.
- [ ] Form không quá dài hoặc khó nhập.
- [ ] Loading state rõ ràng.
- [ ] Empty state thân thiện khi chưa có task.

---

## 15. Rủi ro và cách xử lý

### 15.1. Google Sheet chậm khi dữ liệu lớn

- Chỉ phù hợp cho app cá nhân hoặc team nhỏ.
- Dùng cache ngắn hạn nếu cần.
- Khi dữ liệu lớn có thể chuyển sang Supabase, Firebase hoặc PostgreSQL.

### 15.2. Lỗi quyền truy cập Google Sheet

- Kiểm tra Google Sheet đã share cho Service Account chưa.
- Kiểm tra đúng `GOOGLE_SHEET_ID`.
- Kiểm tra private key trên Vercel có xuống dòng đúng định dạng.

### 15.3. Dữ liệu ngày tháng sai timezone

- Lưu ngày theo định dạng ISO.
- Hiển thị theo timezone Việt Nam.
- Khi lọc tháng, dùng `completed_at` theo local date.

---

## 16. Ưu tiên phát triển MVP

Phiên bản đầu tiên nên tập trung vào:

1. Tạo/xem/sửa/xóa task.
2. Đánh dấu hoàn thành.
3. Xem việc đang làm.
4. Xem việc đã hoàn thành.
5. Lọc việc hoàn thành theo tháng.
6. Lưu dữ liệu vào Google Sheet.
7. Deploy lên Vercel.

Các tính năng có thể để sau:

- Đăng nhập.
- Biểu đồ nâng cao.
- Reminder/thông báo.
- Chia sẻ list cho người khác.
- Đồng bộ lịch.
- PWA offline mode.

---

## 17. Roadmap nâng cấp

### Version 1.0

- Todo cơ bản.
- Google Sheet database.
- Mobile-first UI.
- Deploy Vercel.

### Version 1.1

- Thống kê hoàn thành theo tháng.
- Chart đơn giản.
- Search và filter tốt hơn.

### Version 1.2

- Đăng nhập bằng Google.
- Mỗi user có dữ liệu riêng.

### Version 1.3

- Reminder.
- PWA cài như app điện thoại.
- Dark mode.

---

## 18. Kết luận

Web app này nên được xây theo hướng đơn giản, nhẹ, dễ dùng trên điện thoại.

Google Sheet phù hợp cho giai đoạn đầu vì dễ quản lý dữ liệu và chi phí thấp. Next.js + Vercel giúp triển khai nhanh, có thể mở rộng thêm API, thống kê và giao diện đẹp hơn trong các phiên bản sau.
