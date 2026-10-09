import * as vscode from 'vscode';

/**
 * Danh sách các thiết lập chuẩn bắt buộc cho môi trường lập trình Senior:
 * - Tab size = 4, Space = 4
 * - Không tự động đoán indentation (detectIndentation = false)
 * - Tự động format khi lưu (formatOnSave = true)
 * - Đặt defaultFormatter chuẩn là Prettier (nếu có)
 * - Ép cấu hình Prettier sang tabWidth = 4
 */
interface SettingEntry {
    section: string;
    value: unknown;
}

const PRETTIER_ID = 'esbenp.prettier-vscode';

const STANDARD_EDITOR_SETTINGS: SettingEntry[] = [
    // Editor core settings
    { section: 'editor.tabSize', value: 4 },
    { section: 'editor.insertSpaces', value: true },
    { section: 'editor.detectIndentation', value: false },
    { section: 'editor.formatOnSave', value: true },
    { section: 'editor.formatOnPaste', value: false },
    { section: 'editor.renderWhitespace', value: 'selection' },
    { section: 'editor.defaultFormatter', value: PRETTIER_ID },

    // Prettier global settings
    { section: 'prettier.tabWidth', value: 4 },
    { section: 'prettier.useTabs', value: false },

    // Cấu hình riêng cho từng ngôn ngữ để ghi đè mọi thiết lập mặc định của VS Code
    { section: '[typescript].editor.tabSize', value: 4 },
    { section: '[typescript].editor.insertSpaces', value: true },
    { section: '[typescript].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[typescriptreact].editor.tabSize', value: 4 },
    { section: '[typescriptreact].editor.insertSpaces', value: true },
    { section: '[typescriptreact].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[javascript].editor.tabSize', value: 4 },
    { section: '[javascript].editor.insertSpaces', value: true },
    { section: '[javascript].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[javascriptreact].editor.tabSize', value: 4 },
    { section: '[javascriptreact].editor.insertSpaces', value: true },
    { section: '[javascriptreact].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[json].editor.tabSize', value: 4 },
    { section: '[json].editor.insertSpaces', value: true },
    { section: '[json].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[jsonc].editor.tabSize', value: 4 },
    { section: '[jsonc].editor.insertSpaces', value: true },
    { section: '[jsonc].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[html].editor.tabSize', value: 4 },
    { section: '[html].editor.insertSpaces', value: true },
    { section: '[html].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[css].editor.tabSize', value: 4 },
    { section: '[css].editor.insertSpaces', value: true },
    { section: '[css].editor.defaultFormatter', value: PRETTIER_ID },

    { section: '[scss].editor.tabSize', value: 4 },
    { section: '[scss].editor.insertSpaces', value: true },
    { section: '[scss].editor.defaultFormatter', value: PRETTIER_ID }
];

/**
 * Cập nhật cấu hình vào target (Global hoặc Workspace)
 * @param target Mục tiêu cấu hình: Global hoặc Workspace
 * @param silent Nếu là true, không hiển thị notification popup (dùng khi auto-run ngầm)
 */
async function applyStandardSettings(target: vscode.ConfigurationTarget, silent: boolean = false): Promise<void> {
    const isGlobal = target === vscode.ConfigurationTarget.Global;
    const targetLabel = isGlobal ? 'Global (User Settings)' : 'Workspace Settings';

    try {
        const config = vscode.workspace.getConfiguration();

        for (const setting of STANDARD_EDITOR_SETTINGS) {
            const lastDotIndex = setting.section.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                const sectionPrefix = setting.section.substring(0, lastDotIndex);
                const sectionKey = setting.section.substring(lastDotIndex + 1);
                const subConfig = vscode.workspace.getConfiguration(sectionPrefix);

                // Kiểm tra nếu giá trị hiện tại đã đúng chuẩn thì bỏ qua để tối ưu hiệu năng
                const currentVal = subConfig.inspect(sectionKey);
                const effectiveVal = isGlobal ? currentVal?.globalValue : currentVal?.workspaceValue;
                if (effectiveVal !== setting.value) {
                    await subConfig.update(sectionKey, setting.value, target);
                }
            } else {
                const currentVal = config.inspect(setting.section);
                const effectiveVal = isGlobal ? currentVal?.globalValue : currentVal?.workspaceValue;
                if (effectiveVal !== setting.value) {
                    await config.update(setting.section, setting.value, target);
                }
            }
        }

        if (!silent) {
            vscode.window.showInformationMessage(`[Phu Phan Essentials] Đã áp dụng cấu hình chuẩn 4 Spaces thành công vào ${targetLabel}!`);
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`[Phu Phan Essentials] Lỗi khi cập nhật cấu hình: ${errorMsg}`);
    }
}

/**
 * Thực thi lệnh format document hiện tại, đồng thời đảm bảo tabSize của editor active là 4 spaces
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

    // Gọi lệnh format document
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
    // 1. Đăng ký Command: Áp dụng Global User Settings thủ công
    const applyGlobalCommand = vscode.commands.registerCommand('phuphan.applyGlobalSettings', async () => {
        const confirm = await vscode.window.showQuickPick(['Có, áp dụng ngay', 'Hủy'], {
            placeHolder: 'Bạn có muốn ghi đè cấu hình chuẩn 4 Spaces vào User Settings toàn cục không?'
        });
        if (confirm === 'Có, áp dụng ngay') {
            await applyStandardSettings(vscode.ConfigurationTarget.Global, false);
        }
    });

    // 2. Đăng ký Command: Áp dụng Workspace Settings thủ công
    const applyWorkspaceCommand = vscode.commands.registerCommand('phuphan.applyWorkspaceSettings', async () => {
        await applyStandardSettings(vscode.ConfigurationTarget.Workspace, false);
    });

    // 3. Đăng ký Command: Format Document chuẩn 4 Spaces
    const formatCommand = vscode.commands.registerCommand('phuphan.formatDocument', async () => {
        await formatCurrentDocument();
    });

    // 4. Tạo Status Bar Item hiển thị góc dưới thanh trạng thái
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(zap) 4 Spaces';
    statusBarItem.tooltip = 'Phu Phan Essentials: Nhấn để áp dụng cấu hình 4 Spaces cho Workspace';
    statusBarItem.command = 'phuphan.applyWorkspaceSettings';
    statusBarItem.show();

    // 5. Lắng nghe mỗi khi mở hoặc chuyển sang 1 editor mới: Ép ngay tabSize = 4
    const changeEditorListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            editor.options.tabSize = 4;
            editor.options.insertSpaces = true;
        }
    });

    // 6. Đăng ký các subscriptions
    context.subscriptions.push(
        applyGlobalCommand,
        applyWorkspaceCommand,
        formatCommand,
        statusBarItem,
        changeEditorListener
    );

    // 7. TỰ ĐỘNG ÉP CẤU HÌNH NGAY KHI KHỞI ĐỘNG (Không cần chờ user bấm confirm)
    const extConfig = vscode.workspace.getConfiguration('phuphan');
    const autoApply = extConfig.get<boolean>('autoApplyOnStartup', true);
    if (autoApply) {
        // Tự động kiểm tra và đồng bộ thẳng vào Global User Settings ngầm
        applyStandardSettings(vscode.ConfigurationTarget.Global, true);
    }
}

/**
 * Hàm hủy kích hoạt khi extension tắt
 */
export function deactivate(): void {
    // Dọn dẹp tài nguyên
}
