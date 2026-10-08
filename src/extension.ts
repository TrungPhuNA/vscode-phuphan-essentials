import * as vscode from 'vscode';

/**
 * Mục đích:
 * Định nghĩa bộ cấu hình chuẩn cho Senior Developer:
 * - Tab size = 4, Space = 4
 * - Không tự động đoán indentation (detectIndentation = false)
 * - Tự động format khi lưu (formatOnSave = true)
 * - Mặc định formatter là Prettier
 * - Prettier tabWidth = 4
 */
interface GlobalSettingEntry {
    section: string;
    key: string;
    value: unknown;
}

const PRETTIER_ID = 'esbenp.prettier-vscode';

// Danh sách các cấu hình chung toàn cục (Global editor & Prettier)
const CORE_GLOBAL_SETTINGS: GlobalSettingEntry[] = [
    { section: 'editor', key: 'tabSize', value: 4 },
    { section: 'editor', key: 'insertSpaces', value: true },
    { section: 'editor', key: 'detectIndentation', value: false },
    { section: 'editor', key: 'formatOnSave', value: true },
    { section: 'editor', key: 'formatOnPaste', value: false },
    { section: 'editor', key: 'renderWhitespace', value: 'selection' },
    { section: 'editor', key: 'defaultFormatter', value: PRETTIER_ID },
    { section: 'prettier', key: 'tabWidth', value: 4 },
    { section: 'prettier', key: 'useTabs', value: false }
];

// Danh sách các ngôn ngữ cần ép cấu hình riêng biệt theo chuẩn VS Code API scope
const TARGET_LANGUAGES = [
    'typescript',
    'typescriptreact',
    'javascript',
    'javascriptreact',
    'json',
    'jsonc',
    'html',
    'css',
    'scss'
];

/**
 * Áp dụng cấu hình chuẩn vào VS Code (Global User hoặc Workspace)
 * Sử dụng đúng chuẩn VS Code API:
 * - Cấu hình chung: vscode.workspace.getConfiguration(section).update(key, value, target)
 * - Cấu hình theo ngôn ngữ: vscode.workspace.getConfiguration('', { languageId }).update('editor.tabSize', 4, target)
 *
 * @param target Mục tiêu cấu hình: Global hoặc Workspace
 * @param silent Nếu là true, không hiển thị pop-up thông báo (dùng khi chạy tự động ngầm)
 */
async function applyStandardSettings(target: vscode.ConfigurationTarget, silent: boolean = false): Promise<void> {
    const isGlobal = target === vscode.ConfigurationTarget.Global;
    const targetLabel = isGlobal ? 'Global (User Settings)' : 'Workspace Settings';

    try {
        // 1. Áp dụng cấu hình Core Global (editor & prettier)
        for (const item of CORE_GLOBAL_SETTINGS) {
            const config = vscode.workspace.getConfiguration(item.section);
            const inspected = config.inspect(item.key);
            const currentVal = isGlobal ? inspected?.globalValue : inspected?.workspaceValue;

            if (currentVal !== item.value) {
                await config.update(item.key, item.value, target);
            }
        }

        // 2. Áp dụng cấu hình theo từng ngôn ngữ (languageId scope chuẩn VS Code API)
        for (const langId of TARGET_LANGUAGES) {
            const langConfig = vscode.workspace.getConfiguration('', { languageId: langId });

            // Cập nhật editor.tabSize = 4 cho ngôn ngữ
            await langConfig.update('editor.tabSize', 4, target);
            // Cập nhật editor.insertSpaces = true cho ngôn ngữ
            await langConfig.update('editor.insertSpaces', true, target);
            // Cập nhật editor.defaultFormatter = Prettier cho ngôn ngữ
            await langConfig.update('editor.defaultFormatter', PRETTIER_ID, target);
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
 * Format document hiện tại và ép tabSize của editor active về 4 spaces
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

    // Kích hoạt lệnh format document
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
    // 1. Command: Áp dụng Global User Settings thủ công
    const applyGlobalCommand = vscode.commands.registerCommand('phuphan.applyGlobalSettings', async () => {
        const confirm = await vscode.window.showQuickPick(['Có, áp dụng ngay', 'Hủy'], {
            placeHolder: 'Bạn có muốn ghi đè cấu hình chuẩn 4 Spaces vào User Settings toàn cục không?'
        });
        if (confirm === 'Có, áp dụng ngay') {
            await applyStandardSettings(vscode.ConfigurationTarget.Global, false);
        }
    });

    // 2. Command: Áp dụng Workspace Settings thủ công
    const applyWorkspaceCommand = vscode.commands.registerCommand('phuphan.applyWorkspaceSettings', async () => {
        await applyStandardSettings(vscode.ConfigurationTarget.Workspace, false);
    });

    // 3. Command: Format Document chuẩn 4 Spaces (gắn phím tắt Cmd+Alt+L & Shift+Alt+F)
    const formatCommand = vscode.commands.registerCommand('phuphan.formatDocument', async () => {
        await formatCurrentDocument();
    });

    // 4. Status Bar Item hiển thị nút tắt ở góc dưới cùng bên phải
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(zap) 4 Spaces';
    statusBarItem.tooltip = 'Phu Phan Essentials: Nhấn để áp dụng cấu hình 4 Spaces cho Workspace';
    statusBarItem.command = 'phuphan.applyWorkspaceSettings';
    statusBarItem.show();

    // 5. Lắng nghe khi mở hoặc chuyển sang file khác: Ép ngay tabSize = 4 cho editor active
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

    // 7. Tự động áp dụng cấu hình ngầm ngay khi khởi động
    const extConfig = vscode.workspace.getConfiguration('phuphan');
    const autoApply = extConfig.get<boolean>('autoApplyOnStartup', true);
    if (autoApply) {
        applyStandardSettings(vscode.ConfigurationTarget.Global, true);
    }
}

/**
 * Hàm hủy kích hoạt khi extension tắt
 */
export function deactivate(): void {
    // Dọn dẹp tài nguyên nếu cần
}
