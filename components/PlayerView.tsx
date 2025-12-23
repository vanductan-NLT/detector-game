
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GameState, Player, Role } from '../types';

interface PlayerViewProps {
  gameState: GameState | null;
  onUpdate: (state: GameState | null) => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({ gameState, onUpdate }) => {
  const { gameId } = useParams();
  const [name, setName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPlayer = sessionStorage.getItem(`spy_player_${gameId}`);
    if (savedPlayer) {
      const p = JSON.parse(savedPlayer);
      setCurrentPlayer(p);
    }

    // If no gameState but have cloudUrl in env, try to load from cloud
    if (!gameState && gameId) {
      const cloudUrl = import.meta.env.VITE_CLOUD_SYNC_URL;
      if (cloudUrl) {
        setIsLoading(true);
        console.log('🔄 Game not found locally, loading from Google Sheets...');
        fetch(`${cloudUrl}?gameId=${gameId}`)
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(data => {
            setIsLoading(false);
            if (data && !data.error && data.gameId) {
              console.log('✅ Loaded game from cloud:', data);
              onUpdate(data);
            } else {
              console.warn('⚠️ Invalid data from cloud:', data);
              setError('Game không tồn tại!');
            }
          })
          .catch(err => {
            setIsLoading(false);
            console.error('❌ Cloud load error:', err);
            setError('Không thể tải game từ cloud. Vui lòng thử lại!');
          });
      }
    }
  }, [gameId, gameState, onUpdate]);

  const handleJoin = () => {
    if (!name.trim()) return;
    if (!gameState) return;

    if (gameState.players.length >= gameState.config.totalPlayers) {
      setError('Phòng đã đủ người chơi rồi!');
      return;
    }

    const usedRoles = gameState.players.map(p => p.role);
    const spyRem = gameState.config.spyCount - usedRoles.filter(r => r === Role.SPY).length;
    const whiteRem = gameState.config.whiteHatCount - usedRoles.filter(r => r === Role.WHITE_HAT).length;
    const totalRem = gameState.config.totalPlayers - usedRoles.length;

    let role: Role = Role.CIVILIAN;
    const rand = Math.random();
    const spyProb = spyRem / totalRem;
    const whiteProb = whiteRem / totalRem;

    if (rand < spyProb) {
      role = Role.SPY;
    } else if (rand < spyProb + whiteProb) {
      role = Role.WHITE_HAT;
    } else {
      role = Role.CIVILIAN;
    }

    const keyword = role === Role.CIVILIAN ? gameState.config.civilianKeyword :
      role === Role.SPY ? gameState.config.spyKeyword : null;

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      role,
      keyword,
      hasViewed: false,
      joinedAt: Date.now()
    };

    const updatedState: GameState = {
      ...gameState,
      players: [...gameState.players, newPlayer]
    };

    onUpdate(updatedState);
    setCurrentPlayer(newPlayer);
    sessionStorage.setItem(`spy_player_${gameId}`, JSON.stringify(newPlayer));
  };

  const handleViewRole = () => {
    if (!currentPlayer || !gameState) return;

    setIsViewing(true);
    const updatedPlayers = gameState.players.map(p =>
      p.id === currentPlayer.id ? { ...p, hasViewed: true } : p
    );

    const updatedState = { ...gameState, players: updatedPlayers };
    onUpdate(updatedState);

    const updatedMe = { ...currentPlayer, hasViewed: true };
    setCurrentPlayer(updatedMe);
    sessionStorage.setItem(`spy_player_${gameId}`, JSON.stringify(updatedMe));
  };

  const handleHideRole = () => {
    setIsViewing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-blue-50 text-center animate-in zoom-in duration-300">
        <div className="text-8xl mb-8 animate-spin">⏳</div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Đang tải game...</h2>
        <p className="text-gray-500 font-bold text-lg">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  if (gameState && gameState.status === 'ENDED') {
    return (
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-gray-200 text-center animate-in zoom-in duration-300">
        <div className="text-8xl mb-8">🏁</div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Ván Chơi Đã Kết Thúc</h2>
        <p className="text-gray-500 font-bold text-lg mb-8 leading-relaxed">
          Admin đã hủy hoặc kết thúc ván này.
        </p>
        <button
          onClick={() => window.location.href = '#/'}
          className="bg-gray-800 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all"
        >
          Về Trang Chủ
        </button>
      </div>
    );
  }

  if (!gameState || gameState.gameId !== gameId) {
    return (
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-red-50 text-center animate-in zoom-in duration-300">
        <div className="text-8xl mb-8">🚫</div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">Phòng Không Tồn Tại</h2>
        <p className="text-gray-500 font-bold text-lg mb-8 leading-relaxed">
          Có thể ván chơi đã kết thúc hoặc bạn đang mở link trên một máy tính/trình duyệt khác.
        </p>
        <button
          onClick={() => window.location.href = '#/'}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-indigo-100"
        >
          Trang chủ
        </button>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="bg-white p-10 sm:p-16 rounded-[40px] shadow-2xl border-2 border-indigo-50 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="inline-block p-6 bg-indigo-600 text-white rounded-[32px] shadow-2xl mb-8 transform -rotate-3">
          <span className="text-4xl font-black">HELLO!</span>
        </div>
        <h2 className="text-3xl font-black mb-10 text-gray-900">Bạn tên là gì?</h2>

        {error && (
          <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl border-2 border-red-100 font-black animate-bounce text-lg">
            ❌ {error}
          </div>
        )}

        <div className="space-y-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Ví dụ: Anh Tuấn"
            className="w-full p-6 bg-white border-4 border-gray-200 rounded-[28px] text-center text-3xl font-black text-gray-900 focus:ring-8 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all placeholder-gray-300 shadow-inner"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleJoin()}
            autoFocus
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim()}
            className="w-full bg-indigo-600 text-white py-6 rounded-[28px] font-black text-2xl hover:bg-indigo-700 disabled:bg-gray-300 transition-all shadow-2xl shadow-indigo-200 active:scale-95"
          >
            VÀO PHÒNG NGAY 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 sm:p-16 rounded-[40px] shadow-2xl border-2 border-indigo-50 text-center animate-in fade-in duration-500">
      <div className="mb-12">
        <p className="text-indigo-400 font-black uppercase tracking-widest text-sm mb-2">Đã kết nối</p>
        <h2 className="text-5xl font-black text-gray-900 mb-2">{currentPlayer.name}</h2>
        <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full"></div>
      </div>

      {!isViewing ? (
        <div className="space-y-10">
          <div
            onClick={handleViewRole}
            className="bg-gray-50 py-24 rounded-[40px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-indigo-400 transition-all shadow-inner"
          >
            <span className="text-7xl group-hover:scale-125 transition-transform duration-500">🕵️‍♂️</span>
            <p className="text-gray-400 font-black text-2xl uppercase tracking-widest">Bấm để lật bài</p>
          </div>

          <button
            onClick={handleViewRole}
            className="w-full bg-indigo-600 text-white py-7 rounded-[30px] font-black text-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-4"
          >
            {currentPlayer.hasViewed ? 'XEM LẠI VAI TRÒ' : 'LẬT BÀI NGAY!'}
          </button>
        </div>
      ) : (
        <div className="space-y-10 animate-in zoom-in fade-in duration-300">
          <div className={`p-12 rounded-[40px] border-4 shadow-2xl ${currentPlayer.role === Role.CIVILIAN ? 'bg-blue-50 border-blue-400' :
            currentPlayer.role === Role.SPY ? 'bg-red-50 border-red-400' :
              'bg-gray-100 border-gray-400'
            }`}>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">VAI TRÒ CỦA BẠN</p>
            <h3 className={`text-6xl font-black mb-10 ${currentPlayer.role === Role.CIVILIAN ? 'text-blue-700' :
              currentPlayer.role === Role.SPY ? 'text-red-700' :
                'text-gray-800'
              }`}>
              {currentPlayer.role.toUpperCase()}
            </h3>

            <div className="h-1 bg-gray-200 w-full mb-10 rounded-full opacity-50"></div>

            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">TỪ KHÓA BÍ MẬT</p>
            <div className="bg-white p-10 rounded-[30px] shadow-xl border-2 border-gray-50 inline-block min-w-[250px]">
              <p className="text-5xl font-black text-gray-900 tracking-tight">
                {currentPlayer.keyword || '---'}
              </p>
            </div>

            {currentPlayer.role === Role.WHITE_HAT && (
              <p className="text-lg text-gray-600 mt-8 font-bold italic leading-relaxed">
                "Bạn không có từ khóa. Hãy cố gắng trà trộn và đoán xem mọi người đang nói về cái gì!"
              </p>
            )}
          </div>

          <button
            onClick={handleHideRole}
            className="w-full bg-gray-900 text-white py-7 rounded-[30px] font-black text-2xl hover:bg-black transition-all shadow-2xl active:scale-95 uppercase tracking-widest"
          >
            ẨN BÀI (XONG) ✅
          </button>
        </div>
      )}

      <div className="mt-16 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
          <span className="text-green-500 text-lg">●</span>
          <span className="text-gray-600 font-black text-sm uppercase tracking-widest">
            {gameState.players.length} / {gameState.config.totalPlayers} NGƯỜI
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
