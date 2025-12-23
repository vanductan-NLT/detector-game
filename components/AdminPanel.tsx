
import React, { useState } from 'react';
import { GameState, GameConfig, Role, Player } from '../types';

interface AdminPanelProps {
  gameState: GameState | null;
  onUpdate: (state: GameState | null) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ gameState, onUpdate }) => {
  // Load Cloud URL: env variable → localStorage → empty
  const defaultCloudUrl = import.meta.env.VITE_CLOUD_SYNC_URL || localStorage.getItem('last_cloud_url') || '';

  const [config, setConfig] = useState<GameConfig>({
    civilianKeyword: '',
    spyKeyword: '',
    totalPlayers: 5,
    spyCount: 1,
    whiteHatCount: 0,
    cloudUrl: defaultCloudUrl,
  });

  const handleStartGame = () => {
    if (!config.civilianKeyword || !config.spyKeyword) {
      alert('Vui lòng nhập từ khóa cho Dân và Gián điệp!');
      return;
    }

    if (config.spyCount + config.whiteHatCount >= config.totalPlayers) {
      alert('Số lượng Gián điệp + Mũ Trắng phải nhỏ hơn tổng số người chơi!');
      return;
    }

    if (config.cloudUrl) {
      localStorage.setItem('last_cloud_url', config.cloudUrl);
    }

    const gameId = Math.random().toString(36).substring(2, 9);

    const newState: GameState = {
      gameId,
      config,
      players: [],
      status: 'PLAYING',
    };

    onUpdate(newState);
  };

  const handleReset = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa ván chơi hiện tại?')) {
      // 1. Notify Cloud if connected
      if (gameState && gameState.config.cloudUrl) {
        try {
          console.log('🚫 Sending ENDED signal to cloud...');
          await fetch(gameState.config.cloudUrl, {
            method: 'POST',
            body: JSON.stringify({
              ...gameState,
              status: 'ENDED',
              players: [] // Clear players on cloud logic handled by backend usually, but sending empty helps
            }),
            mode: 'no-cors'
          });
        } catch (e) {
          console.error("Failed to cancel on cloud", e);
        }
      }

      // 2. Clear Local
      localStorage.removeItem('spy_game_state');
      onUpdate(null);
    }
  };

  const copyRoomLink = () => {
    if (!gameState) return;
    const url = `${window.location.origin}${window.location.pathname}#/play/${gameState.gameId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('✅ Đã copy link phòng!'))
      .catch(() => {
        // Fallback for browsers that don't support clipboard API
        prompt('Copy link này:', url);
      });
  };

  const inputClasses = "w-full p-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 font-bold text-lg shadow-sm";
  const labelClasses = "block text-sm font-black text-indigo-900 mb-2 ml-1 uppercase tracking-wider";

  if (gameState && gameState.status === 'PLAYING') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-50">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-gray-800">
            <span className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">🎮</span>
            Quản lý ván chơi
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyRoomLink}
              className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔗</span> Copy Link Mời Bạn
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-white text-red-600 py-4 rounded-2xl font-black hover:bg-red-50 transition-all border-2 border-red-200 active:scale-95"
            >
              Hủy Game
            </button>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">ID PHÒNG:</span>
              <span className="font-mono font-black text-indigo-700 text-xl">{gameState.gameId}</span>
            </div>
            {gameState.config.cloudUrl && (
              <p className="text-[10px] text-indigo-400 font-bold italic">Đang đồng bộ qua Google Sheets...</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-2 text-gray-800">
              <span className="bg-green-500 p-2 rounded-xl text-white shadow-lg">👥</span>
              Người chơi ({gameState.players.length}/{gameState.config.totalPlayers})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {gameState.players.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-lg italic">Đang đợi mọi người vào link...</p>
              </div>
            ) : (
              gameState.players.sort((a, b) => b.joinedAt - a.joinedAt).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:border-indigo-300 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${p.hasViewed ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-gray-300 animate-pulse'}`}></div>
                    <span className="font-black text-gray-800 text-xl group-hover:text-indigo-600 transition-colors">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm ${p.role === Role.CIVILIAN ? 'bg-blue-600 text-white' :
                      p.role === Role.SPY ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
                      }`}>
                      {p.role}
                    </span>
                    <span className={`text-xs font-black uppercase tracking-widest ${p.hasViewed ? 'text-green-600' : 'text-gray-400'}`}>
                      {p.hasViewed ? 'Đã xem' : 'Chờ...'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border-2 border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-3xl font-black mb-10 text-gray-900 flex items-center gap-4">
        <span className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl">🛡️</span>
        Thiết Lập Ván Mới
      </h2>

      <div className="space-y-8">
        {/* Keywords Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Từ khóa cho Dân 👨‍👩‍👧‍👦</label>
            <input
              type="text"
              placeholder="Ví dụ: Táo"
              className={inputClasses}
              value={config.civilianKeyword}
              onChange={(e) => setConfig({ ...config, civilianKeyword: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClasses}>Từ khóa cho Gián điệp 🕵️</label>
            <input
              type="text"
              placeholder="Ví dụ: Cam"
              className={inputClasses}
              value={config.spyKeyword}
              onChange={(e) => setConfig({ ...config, spyKeyword: e.target.value })}
            />
          </div>
        </div>

        {/* Players Config Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses}>Tổng số người chơi</label>
            <input
              type="number"
              min="3"
              max="20"
              className={inputClasses}
              value={config.totalPlayers}
              onChange={(e) => setConfig({ ...config, totalPlayers: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClasses}>Số Gián điệp 🕵️</label>
            <select
              className={inputClasses}
              value={config.spyCount}
              onChange={(e) => setConfig({ ...config, spyCount: Number(e.target.value) })}
            >
              <option value={1}>1 người</option>
              <option value={2}>2 người</option>
            </select>
          </div>
          <div>
            <label className={labelClasses}>Số Mũ Trắng 🎩</label>
            <select
              className={inputClasses}
              value={config.whiteHatCount}
              onChange={(e) => setConfig({ ...config, whiteHatCount: Number(e.target.value) })}
            >
              <option value={0}>0 người</option>
              <option value={1}>1 người</option>
              <option value={2}>2 người</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-2xl shadow-indigo-300 active:scale-98 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🚀</span>
          Khởi Tạo Game
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;