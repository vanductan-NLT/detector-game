
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import PlayerView from './components/PlayerView';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('spy_game_state');
    if (savedGame) {
      setGameState(JSON.parse(savedGame));
    }
  }, []);

  // Cloud Sync logic
  useEffect(() => {
    if (!gameState?.config.cloudUrl || gameState.status !== 'PLAYING') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${gameState.config.cloudUrl}?gameId=${gameState.gameId}`);
        const cloudData = await response.json();

        if (cloudData && JSON.stringify(cloudData) !== JSON.stringify(gameState)) {
          // Chỉ cập nhật nếu dữ liệu cloud mới hơn hoặc khác (để tránh loop)
          setGameState(cloudData);
          localStorage.setItem('spy_game_state', JSON.stringify(cloudData));
        }
      } catch (err) {
        console.error("Cloud Sync Error:", err);
      }
    }, 3000); // Kiểm tra mỗi 3 giây

    return () => clearInterval(interval);
  }, [gameState?.config?.cloudUrl, gameState?.gameId, gameState?.status]);

  const updateGameState = useCallback(async (newState: GameState | null) => {
    setGameState(newState);
    if (newState) {
      localStorage.setItem('spy_game_state', JSON.stringify(newState));

      // Push to Google Sheets if configured
      if (newState.config.cloudUrl) {
        try {
          console.log('📤 Syncing to Google Sheets...', {
            gameId: newState.gameId,
            players: newState.players.length,
            url: newState.config.cloudUrl
          });

          await fetch(newState.config.cloudUrl, {
            method: 'POST',
            body: JSON.stringify(newState),
            mode: 'no-cors' // Google Script requires this
          });

          console.log('✅ Synced successfully! Check your Google Sheet.');
          console.log(`📊 Format: Each player = 1 row | ${newState.players.length} rows added`);
        } catch (err) {
          console.error("❌ Cloud Sync Error:", err);
        }
      }
    } else {
      localStorage.removeItem('spy_game_state');
    }
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 pb-10">
        <header className="bg-white border-b border-gray-200 py-4 px-6 mb-6 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2">
              🕵️ <span className="hidden sm:inline">Tìm Gián Điệp</span>
            </h1>
            <div className="flex items-center gap-2">
              {gameState?.config.cloudUrl && (
                <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Cloud On
                </span>
              )}
              {gameState?.status === 'PLAYING' && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-widest">
                  Đang chơi
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4">
          <Routes>
            <Route
              path="/admin"
              element={<AdminPanel gameState={gameState} onUpdate={updateGameState} />}
            />
            <Route
              path="/play/:gameId"
              element={<PlayerView gameState={gameState} onUpdate={updateGameState} />}
            />
            <Route
              path="*"
              element={<Navigate to="/admin" replace />}
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
