import * as vscode from 'vscode';

/**
 * Danh sách các thiết lập chuẩn cho Senior Developer:
 * - Tab size = 4, Space = 4
 * - Không tự động đoán indentation sai lệch (detectIndentation = false)
 * - Tự động format khi lưu (formatOnSave = true)
 * - Format code gọn gàng, đồng bộ
 */
interface SettingEntry {
    section: string;
    value: unknown;
}

const STANDARD_EDITOR_SETTINGS: SettingEntry[] = [
    { section: 'editor.tabSize', value: 4 },
    { section: 'editor.insertSpaces', value: true },
    { section: 'editor.detectIndentation', value: false },
    { section: 'editor.formatOnSave', value: true },
    { section: 'editor.formatOnPaste', value: false },
    { section: 'editor.renderWhitespace', value: 'selection' },
    // Cấu hình riêng cho các ngôn ngữ phổ biến để đảm bảo luôn tuân thủ 4 spaces
    { section: '[typescript].editor.tabSize', value: 4 },
    { section: '[typescript].editor.insertSpaces', value: true },
    { section: '[typescriptreact].editor.tabSize', value: 4 },
    { section: '[typescriptreact].editor.insertSpaces', value: true },
    { section: '[javascript].editor.tabSize', value: 4 },
    { section: '[javascript].editor.insertSpaces', value: true },
    { section: '[javascriptreact].editor.tabSize', value: 4 },
    { section: '[javascriptreact].editor.insertSpaces', value: true },
    { section: '[json].editor.tabSize', value: 4 },
    { section: '[json].editor.insertSpaces', value: true },
    { section: '[jsonc].editor.tabSize', value: 4 },
    { section: '[jsonc].editor.insertSpaces', value: true },
    { section: '[html].editor.tabSize', value: 4 },
    { section: '[html].editor.insertSpaces', value: true },
    { section: '[css].editor.tabSize', value: 4 },
    { section: '[css].editor.insertSpaces', value: true },
    { section: '[scss].editor.tabSize', value: 4 },
    { section: '[scss].editor.insertSpaces', value: true }
];

/**
 * Áp dụng cấu hình chuẩn vào VS Code (Global User hoặc Workspace)
 * @param target Mục tiêu cấu hình: Global hoặc Workspace
 */
async function applyStandardSettings(target: vscode.ConfigurationTarget): Promise<void> {
    const isGlobal = target === vscode.ConfigurationTarget.Global;
    const targetLabel = isGlobal ? 'Global (User Settings)' : 'Workspace Settings';

    try {
        const config = vscode.workspace.getConfiguration();

        for (const setting of STANDARD_EDITOR_SETTINGS) {
            // Tách phần prefix và key nếu là cấu hình lồng nhau như editor.tabSize
            const lastDotIndex = setting.section.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                const sectionPrefix = setting.section.substring(0, lastDotIndex);
                const sectionKey = setting.section.substring(lastDotIndex + 1);
                const subConfig = vscode.workspace.getConfiguration(sectionPrefix);
                await subConfig.update(sectionKey, setting.value, target);
            } else {
                await config.update(setting.section, setting.value, target);
            }
        }

        vscode.window.showInformationMessage(`[Phu Phan Essentials] Đã áp dụng cấu hình chuẩn 4 Spaces thành công vào ${targetLabel}!`);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`[Phu Phan Essentials] Lỗi khi cập nhật cấu hình: ${errorMsg}`);
    }
}

/**
 * Thực thi lệnh format document hiện tại, đồng thời đảm bảo tabSize active là 4 spaces
 */
async function formatCurrentDocument(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('[Phu Phan Essentials] Vui lòng mở 1 file để format!');
        return;
    }

    // Ép editor options hiện tại về 4 spaces ngay lập tức
    editor.options.tabSize = 4;
    editor.options.insertSpaces = true;

    // Gọi lệnh format document mặc định của VS Code
    try {
        await vscode.commands.executeCommand('editor.action.formatDocument');
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`[Phu Phan Essentials] Lỗi khi format: ${errorMsg}`);
    }
}

/**
 * Hàm kích hoạt Extension khi VS Code khởi động
 */
export function activate(context: vscode.ExtensionContext): void {
    // 1. Đăng ký Command: Áp dụng Global User Settings
    const applyGlobalCommand = vscode.commands.registerCommand('phuphan.applyGlobalSettings', async () => {
        const confirm = await vscode.window.showQuickPick(['Có, áp dụng ngay', 'Hủy'], {
            placeHolder: 'Bạn có muốn ghi đè cấu hình chuẩn 4 Spaces vào User Settings toàn cục không?'
        });
        if (confirm === 'Có, áp dụng ngay') {
            await applyStandardSettings(vscode.ConfigurationTarget.Global);
        }
    });

    // 2. Đăng ký Command: Áp dụng Workspace Settings
    const applyWorkspaceCommand = vscode.commands.registerCommand('phuphan.applyWorkspaceSettings', async () => {
        await applyStandardSettings(vscode.ConfigurationTarget.Workspace);
    });

    // 3. Đăng ký Command: Format Document chuẩn 4 Spaces (gắn phím tắt Cmd+Alt+L & Shift+Alt+F)
    const formatCommand = vscode.commands.registerCommand('phuphan.formatDocument', async () => {
        await formatCurrentDocument();
    });

    // 4. Tạo Status Bar Item hiển thị góc dưới thanh trạng thái
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(zap) 4 Spaces';
    statusBarItem.tooltip = 'Phu Phan Essentials: Nhấn để áp dụng nhanh cấu hình 4 Spaces';
    statusBarItem.command = 'phuphan.applyWorkspaceSettings';
    statusBarItem.show();

    // 5. Thêm vào subscriptions để VS Code tự dọn dẹp khi deactivate
    context.subscriptions.push(
        applyGlobalCommand,
        applyWorkspaceCommand,
        formatCommand,
        statusBarItem
    );

    // 6. Tự động kiểm tra và áp dụng nếu bật tùy chọn autoApplyOnStartup
    const extConfig = vscode.workspace.getConfiguration('phuphan');
    const autoApply = extConfig.get<boolean>('autoApplyOnStartup', true);
    if (autoApply) {
        const editorConfig = vscode.workspace.getConfiguration('editor');
        const currentTabSize = editorConfig.get<number>('tabSize');
        // Nếu chưa phải là 4, thông báo người dùng 1 lần để áp dụng
        if (currentTabSize !== 4) {
            vscode.window.showInformationMessage(
                '[Phu Phan Essentials] Tab size hiện tại chưa là 4. Bạn có muốn kích hoạt chuẩn 4 spaces?',
                'Áp dụng ngay'
            ).then(selection => {
                if (selection === 'Áp dụng ngay') {
                    applyStandardSettings(vscode.ConfigurationTarget.Global);
                }
            });
        }
    }
}

/**
 * Hàm hủy kích hoạt khi extension tắt
 */
export function deactivate(): void {
    // Dọn dẹp tài nguyên nếu cần
}
