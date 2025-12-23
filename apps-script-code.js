// ========================================
// 🎮 GOOGLE APPS SCRIPT - DUAL SHEET VERSION
// ========================================

const SHEET_GAMES = "Games";     // Tab lưu trạng thái game
const SHEET_PLAYERS = "Players"; // Tab lưu danh sách người chơi

function doGet(e) {
    const gameId = e.parameter.gameId;
    const action = e.parameter.action; // 'check_status' or 'get_game'

    if (!gameId) return errorResponse("Missing gameId");

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Kiểm tra trạng thái Game trong Sheet 'Games'
    const gameSheet = ss.getSheetByName(SHEET_GAMES);
    if (!gameSheet) return errorResponse("Sheet 'Games' not found");

    const gameData = gameSheet.getDataRange().getValues();
    let gameRow = null;
    let config = null;

    // Tìm game (bỏ qua header)
    for (let i = 1; i < gameData.length; i++) {
        if (gameData[i][0] === gameId) {
            gameRow = {
                gameId: gameData[i][0],
                status: gameData[i][1],
                config: JSON.parse(gameData[i][2] || '{}'),
            };
            break;
        }
    }

    // Nếu không tìm thấy game hoặc Game đã ENDED/CANCELED
    if (!gameRow) return errorResponse("Game not found");

    // Nếu chỉ check status (nhẹ hơn)
    if (action === 'check_status') {
        return successResponse({ status: gameRow.status });
    }

    // Nếu game đã kết thúc, trả về status để client xử lý
    if (gameRow.status === 'ENDED') {
        return successResponse({
            gameId: gameId,
            status: 'ENDED',
            players: []
        });
    }

    // 2. Lấy danh sách Player từ Sheet 'Players'
    const playerSheet = ss.getSheetByName(SHEET_PLAYERS);
    if (!playerSheet) return errorResponse("Sheet 'Players' not found");

    const playerData = playerSheet.getDataRange().getValues();
    const players = [];

    for (let i = 1; i < playerData.length; i++) {
        if (playerData[i][0] === gameId) {
            players.push({
                id: `p-${i}`, // Tạo ID tạm
                name: playerData[i][1],
                role: playerData[i][2],
                keyword: playerData[i][3] === "null" ? null : playerData[i][3],
                hasViewed: true, // Mặc định là true nếu load từ sheet
                joinedAt: playerData[i][4]
            });
        }
    }

    return successResponse({
        gameId: gameId,
        status: gameRow.status,
        config: gameRow.config,
        players: players
    });
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    // Wait for up to 10 seconds for other processes to finish.
    if (!lock.tryLock(10000)) {
        return errorResponse("Server busy, try again.");
    }

    try {
        const gameState = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // --- XỬ LÝ SHEET "Games" ---
        let gameSheet = ss.getSheetByName(SHEET_GAMES);
        if (!gameSheet) { // Auto create if missing
            gameSheet = ss.insertSheet(SHEET_GAMES);
            gameSheet.appendRow(["gameId", "status", "config", "createdAt"]);
        }

        const gameData = gameSheet.getDataRange().getValues();
        let gameIndex = -1;

        // Tìm xem game đã tồn tại chưa
        for (let i = 1; i < gameData.length; i++) {
            if (gameData[i][0] === gameState.gameId) {
                gameIndex = i + 1; // Row index (1-based)
                break;
            }
        }

        const configJson = JSON.stringify(gameState.config);
        const timestamp = new Date().toISOString();

        if (gameIndex > 0) {
            // Update existing game
            // Nếu gameState gửi lên là null hoặc status ENDED -> Update status
            // Ở client logic: Nếu admin reset, gửi status="ENDED"
            gameSheet.getRange(gameIndex, 2).setValue(gameState.status); // Update Status
            gameSheet.getRange(gameIndex, 3).setValue(configJson);       // Update Config
        } else {
            // Create new game
            gameSheet.appendRow([gameState.gameId, gameState.status, configJson, timestamp]);
        }

        // --- XỬ LÝ SHEET "Players" ---
        // Chỉ update players nếu game đang PLAYING
        if (gameState.status === 'PLAYING') {
            let playerSheet = ss.getSheetByName(SHEET_PLAYERS);
            if (!playerSheet) {
                playerSheet = ss.insertSheet(SHEET_PLAYERS);
                playerSheet.appendRow(["gameId", "playerName", "role", "keyword", "joinedAt"]);
            }

            // Xóa players cũ của game này (để tránh duplicate)
            // Cách tối ưu: Filter data trong memory và viết lại (nhanh hơn delete từng dòng cho sheet lớn)
            // Nhưng với game nhỏ, xóa dòng loop ngược là OK.
            const pData = playerSheet.getDataRange().getValues();
            // Gom các rows cần xóa
            for (let i = pData.length - 1; i >= 1; i--) {
                if (pData[i][0] === gameState.gameId) {
                    playerSheet.deleteRow(i + 1);
                }
            }

            // Thêm players mới
            if (gameState.players && gameState.players.length > 0) {
                const newRows = gameState.players.map(p => [
                    gameState.gameId,
                    p.name,
                    p.role,
                    p.keyword || "null",
                    timestamp
                ]);
                // Write batch
                playerSheet.getRange(playerSheet.getLastRow() + 1, 1, newRows.length, 5).setValues(newRows);
            }
        }

        return successResponse({ success: true });

    } catch (err) {
        return errorResponse(err.toString());
    } finally {
        lock.releaseLock();
    }
}

function successResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
    return ContentService.createTextOutput(JSON.stringify({ error: msg })).setMimeType(ContentService.MimeType.JSON);
}
