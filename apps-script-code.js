// ========================================
// 🎮 GOOGLE APPS SCRIPT - PLAYER-BASED VERSION v2
// ========================================
// Cấu trúc Sheet: gameId | playerName | role | keyword | allKeywords | config
// Mỗi row = 1 người chơi
// Row đầu tiên của mỗi game lưu config (playerName = "__CONFIG__")
// ========================================

const SHEET_NAME = "Sheet1"; // ⚠️ Đổi nếu sheet của bạn có tên khác

// ========================================
// GET: Lấy danh sách người chơi theo gameId
// ========================================
function doGet(e) {
    const gameId = e.parameter.gameId;

    if (!gameId) {
        return ContentService.createTextOutput(JSON.stringify({
            error: "Missing gameId parameter"
        })).setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Tìm tất cả người chơi của game này
    const players = [];
    let config = null;
    let allKeywords = "";

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === gameId) {
            // Row đầu tiên là config
            if (data[i][1] === "__CONFIG__") {
                config = JSON.parse(data[i][5] || '{}');
                allKeywords = data[i][4];
            } else {
                // Rows sau là players
                players.push({
                    id: data[i][1] + "-" + i,  // Unique ID
                    name: data[i][1],
                    role: data[i][2],
                    keyword: data[i][3] === "null" ? null : data[i][3],
                    hasViewed: data[i][2] !== "",  // Nếu có role = đã viewed
                    joinedAt: Date.now()
                });
            }
        }
    }

    if (!config) {
        return ContentService.createTextOutput(JSON.stringify({
            error: "Game not found"
        })).setMimeType(ContentService.MimeType.JSON);
    }

    const gameState = {
        gameId: gameId,
        config: config,
        players: players,
        status: "PLAYING"
    };

    return ContentService.createTextOutput(JSON.stringify(gameState))
        .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// POST: Lưu người chơi mới
// ========================================
function doPost(e) {
    try {
        const gameState = JSON.parse(e.postData.contents);
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

        // Xóa các row cũ của game này trước
        const data = sheet.getDataRange().getValues();
        for (let i = data.length - 1; i >= 1; i--) {
            if (data[i][0] === gameState.gameId) {
                sheet.deleteRow(i + 1);
            }
        }

        const allKeywords = `${gameState.config.civilianKeyword} / ${gameState.config.spyKeyword}`;

        // Row đầu tiên: Lưu config
        sheet.appendRow([
            gameState.gameId,
            "__CONFIG__",
            "",
            "",
            allKeywords,
            JSON.stringify(gameState.config)
        ]);

        // Các rows tiếp theo: Lưu players
        gameState.players.forEach(player => {
            sheet.appendRow([
                gameState.gameId,           // Column A: gameId
                player.name,                 // Column B: playerName
                player.role,                 // Column C: role
                player.keyword || "null",    // Column D: keyword
                allKeywords,                 // Column E: allKeywords
                ""                           // Column F: config (empty for players)
            ]);
        });

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: `Saved config + ${gameState.players.length} players for gameId: ${gameState.gameId}`
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}
