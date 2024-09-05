import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

// 定义播放列表
const playlist = [
  { title: "愛上你", artist: "S.H.E", src: "/music/S.H.E__愛上你.m4a" },
  { title: "流星雨", artist: "F4", src: "/music/F4_-_流星雨.m4a" },
  { title: "Ghibli Relaxing Music", artist: "スターバック", src: "/music/Ghibli_Relaxing_Music.m4a" },
  // 可以根据需要添加更多歌曲
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(new Audio(playlist[0].src));

  useEffect(() => {
    audioRef.current.src = playlist[currentTrack].src;
    if (isPlaying) {
      audioRef.current.play().catch(error => console.error("播放出错:", error));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 下一首
  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  // 上一首
  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  // 切换静音
  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-90 shadow-lg p-4">
      <div className="max-w-3xl mx-auto flex items-center">
        <div className="flex-shrink min-w-0 w-1/2 mr-4">
          <p className="text-lg font-semibold text-gray-800 truncate">{playlist[currentTrack].title}</p>
          <p className="text-sm text-gray-600 truncate">{playlist[currentTrack].artist}</p>
        </div>
        <div className="flex-shrink-0 flex items-center space-x-4 sm:space-x-6">
          <button onClick={prevTrack} className="text-gray-600 hover:text-pink-500 transition-colors p-2">
            <SkipBack size={28} className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
          <button onClick={togglePlay} className="bg-pink-500 text-white rounded-full p-3 sm:p-4 hover:bg-pink-600 transition-colors">
            {isPlaying ? <Pause size={32} className="w-8 h-8 sm:w-10 sm:h-10" /> : <Play size={32} className="w-8 h-8 sm:w-10 sm:h-10" />}
          </button>
          <button onClick={nextTrack} className="text-gray-600 hover:text-pink-500 transition-colors p-2">
            <SkipForward size={28} className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
          <button onClick={toggleMute} className="text-gray-600 hover:text-pink-500 transition-colors hidden sm:block">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;