# Phu Phan Dev Essentials - VS Code Extension

Extension cá nhân hóa giúp thiết lập môi trường lập trình tức thì mà không cần cài đặt cấu hình thủ công.

## 🚀 Tính năng nổi bật

1. **Chuẩn Indentation 4 Spaces Toàn Diện**:
   - `editor.tabSize`: `4`
   - `editor.insertSpaces`: `true`
   - `editor.detectIndentation`: `false` (ngăn VS Code tự đoán đổi sang 2 spaces)
   - Cấu hình riêng cho TypeScript, JavaScript, HTML, CSS, SCSS, JSON,...

2. **Tự Động Format Khi Lưu (Format on Save)**:
   - Tự động format chuẩn hóa mã nguồn mỗi khi bấm `Cmd + S` (hoặc `Ctrl + S`).

3. **Phím Tắt Format Cực Tiện**:
   - macOS: `Cmd + Option + L` (phím tắt kiểu JetBrains quen tay) hoặc `Shift + Option + F`.
   - Windows/Linux: `Ctrl + Alt + L` hoặc `Shift + Alt + F`.

4. **1-Click Áp Dụng Cấu Hình**:
   - Lệnh `Apply My Coding Standards (Global)`: Tự động ghi vào User Settings toàn cục.
   - Lệnh `Apply Standards to Current Workspace`: Ghi vào `.vscode/settings.json` của dự án.
   - Nút tắt `⚡ 4 Spaces` ngay tại thanh Status Bar góc dưới cùng bên phải.

## 📦 Cách Đóng Gói và Cài Đặt File `.vsix`

### 1. Đóng gói ra file `.vsix`
Chạy lệnh sau trong terminal:
```bash
npx @vscode/vsce package
```
Lệnh trên sẽ tạo ra file `phuphan-dev-essentials-1.0.0.vsix`.

### 2. Cài đặt vào VS Code
- **Cách 1 (Kéo thả)**: Kéo file `.vsix` thả vào cửa sổ VS Code, hoặc mở tab Extensions (`Cmd + Shift + X`) -> Click vào icon `...` (Views and More Actions) ở góc trên -> Chọn **Install from VSIX...** và chọn file.
- **Cách 2 (Terminal)**:
```bash
code --install-extension phuphan-dev-essentials-1.0.0.vsix
```
