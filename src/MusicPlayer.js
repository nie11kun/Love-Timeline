import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

// 定义播放列表
const playlist = [
  { title: "Can't Help Falling in Love", artist: "Elvis Presley", src: "/music/cant-help-falling-in-love.mp3" },
  { title: "All of Me", artist: "John Legend", src: "/music/all-of-me.mp3" },
  { title: "Perfect", artist: "Ed Sheeran", src: "/music/perfect.mp3" },
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
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-800">{playlist[currentTrack].title}</p>
          <p className="text-sm text-gray-600">{playlist[currentTrack].artist}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={prevTrack} className="text-gray-600 hover:text-pink-500 transition-colors">
            <SkipBack size={24} />
          </button>
          <button onClick={togglePlay} className="bg-pink-500 text-white rounded-full p-2 hover:bg-pink-600 transition-colors">
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button onClick={nextTrack} className="text-gray-600 hover:text-pink-500 transition-colors">
            <SkipForward size={24} />
          </button>
          <button onClick={toggleMute} className="text-gray-600 hover:text-pink-500 transition-colors">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;