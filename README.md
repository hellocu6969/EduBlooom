# BLOOM TOGETHER – A11K65

Class activity and student point tracking application.

## Local development

Requirements: Node.js 22 or later.

```powershell
npm install
npm run dev
```

Development uses `data/database.json` as its only writable data source. Firestore is not written by the browser.

## Góc Tử Tế

The `/community` page includes class challenges based on approved positive points, class events, student goals, public thank-you messages, plant gifts, activity timelines, and consecutive-day streaks. Teachers can configure a shared initial student PIN; students can sign in with their student code, change to a private 4–6 digit PIN, and manage their own goal. Student PINs are stored only as bcrypt hashes.

Teachers can create student-specific activity reports for a selected date range and export them as Excel or print/save them as PDF. The report API is teacher-only. The feature data is stored in JSON during local development and in the `weeklyChallenges`, `classEvents`, `studentGoals`, `studentGratitude`, and `plantRewards` Firestore collections in production.

## Production data storage

Production uses Cloud Firestore through the Firebase Admin SDK. The browser only talks to this Express API; Firestore rules deny direct client access.

Configure the following in the deployment secret manager:

- `FIREBASE_PROJECT_ID`
- `FIRESTORE_DATABASE_ID` (optional; defaults to `(default)`)
- Either `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` using the deployment platform's supported credential setup.

Never commit service-account credentials. Do not configure production to fall back to `database.json`: the server fails closed if Firestore has not been initialized.

The in-process cache, write queue, and login sessions are intended for a **single Railway replica**. Do not scale horizontally without moving sessions and coordination to shared infrastructure.

Uploaded banner, logo, and teacher images are files under `data/uploads`; they are not stored in Firestore. Attach a persistent Railway volume at the app's `data` directory and include that directory in backups, or uploaded images may disappear after a redeploy. The JSON-to-Firestore migration does not copy image files.

## Import local JSON into Firestore

Stop application writes while preparing a migration. Confirm `data/database.json` is the authoritative, current export. Configure Firebase Admin credentials in the environment where the migration is run.

Review the source and current Firestore counts first:

```powershell
npm run migrate:firestore -- --dry-run
```

The migration validates document IDs, duplicate IDs and student codes, required collections, team/student references, and transaction records. It makes no writes during dry-run. A migration with overwrite confirmation first saves a timestamped Firestore backup under `data/backups/`, then replaces the application collections and metadata:

```powershell
npm run migrate:firestore -- --confirm-overwrite
```

Do not run the confirmed command until the dry-run output and source JSON have been reviewed. The JSON source is never deleted or modified by the migration script.

## Deploy to Railway

Ứng dụng được deploy từ GitHub lên Railway; không cần chạy server trên máy cá nhân. Repository đã có lệnh `npm run build` và `npm start`.

### 1. Chuẩn bị Firestore

Production chỉ dùng Firestore và cố ý không tự chuyển sang `data/database.json` nếu Firestore trống.

1. Tạo Firebase project và Firestore database.
2. Tạo service account có quyền đọc/ghi dữ liệu Firestore (ví dụ role **Cloud Datastore User**) và tải JSON key. Không commit key này vào GitHub.
3. Chạy migration **một lần** từ môi trường tin cậy có Node.js 22+, repository và file JSON key. Trong PowerShell:

   ```powershell
   npm ci
   $env:FIREBASE_PROJECT_ID = "your-firebase-project-id"
   $env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content "C:\path\to\service-account.json" -Raw
   npm run migrate:firestore -- --dry-run
   npm run migrate:firestore -- --confirm-overwrite
   ```

   Chỉ chạy `--confirm-overwrite` sau khi đã kiểm tra số lượng dữ liệu của dry run. Migration tạo bản sao lưu Firestore trong `data/backups/`; giữ bản sao này ở nơi an toàn.

### 2. Tạo Railway service

1. Đẩy thay đổi lên GitHub, đăng nhập Railway và chọn **New Project → Deploy from GitHub repo**.
2. Chọn `hellocu6969/EduBlooom`, giữ **Root Directory** là `/`.
3. Trong **Settings → Build**, đặt **Build Command** là `npm run build`.
4. Trong **Settings → Deploy**, đặt **Start Command** là `npm start`, **Healthcheck Path** là `/api/health`, và chỉ chạy **1 replica**.
5. Trong **Variables**, thêm:
   - `NODE_ENV` = `production`
   - `FIREBASE_PROJECT_ID` = ID Firebase project
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = toàn bộ nội dung JSON key (dạng JSON hợp lệ; không thêm dấu ngoặc kép bao ngoài)
   - `FIRESTORE_DATABASE_ID` = `(default)` nếu dùng database mặc định

   Không cần tự đặt `PORT`; Railway cấp cổng động cho ứng dụng.

### 3. Ảnh tải lên và xác nhận

Nếu muốn giữ banner/logo/ảnh giáo viên sau mỗi lần deploy, vào **Settings → Volumes**, tạo volume và mount tại `/app/data` (nếu Root Directory vẫn là `/`). Dữ liệu ứng dụng chính được lưu trong Firestore; volume này chỉ cần cho tệp tải lên và bản sao lưu.

Sau khi deploy, tạo domain Railway và mở `https://<domain>/api/health`. Kết quả phải có `"ok": true` và `"database": "firestore"`. Nếu deploy thất bại, kiểm tra **Deploy Logs** và xác nhận Firestore đã được migrate, biến môi trường hợp lệ, service account có quyền truy cập.

### Lưu ý bảo mật dữ liệu

`data/database.json` có thể chứa thông tin học sinh. Nếu đây là dữ liệu thật, hãy đặt repository ở chế độ private và rà soát lịch sử Git trước khi public hoặc chia sẻ repository. Xóa file trong commit mới không xóa dữ liệu khỏi các commit cũ. Không đưa service-account key hoặc bản sao lưu dữ liệu lên GitHub.
