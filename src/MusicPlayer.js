import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const playlist = [
  { title: "愛上你", artist: "S.H.E", src: "/music/S.H.E__愛上你.m4a" },
  { title: "流星雨", artist: "F4", src: "/music/F4_-_流星雨.m4a" },
  { title: "Ghibli Relaxing Music", artist: "スターバック", src: "/music/Ghibli_Relaxing_Music.m4a" },
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio(playlist[0].src));
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(new Uint8Array(256));

  useEffect(() => {
    const audio = audioRef.current;
    
    const setupAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    const playAudio = async () => {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await audio.play();
    };

    const pauseAudio = () => {
      audio.pause();
    };

    setupAudioContext();

    if (isPlaying) {
      playAudio().catch(error => console.error("播放出错:", error));
    } else {
      pauseAudio();
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', nextTrack);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', nextTrack);
    };
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    audioRef.current.src = playlist[currentTrack].src;
    if (isPlaying) {
      audioRef.current.play().catch(error => console.error("更换曲目时播放出错:", error));
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyserRef.current.fftSize = 512; // 增加 fftSize 以获得更多数据点
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 1.5; // 减小频谱条宽度
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // 平滑频谱数据
        dataArrayRef.current[i] = dataArrayRef.current[i] * 0.9 + dataArray[i] * 0.1;
        const barHeight = (dataArrayRef.current[i] / 255) * HEIGHT;

        // 创建彩色渐变
        const gradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
        gradient.addColorStop(0, `hsla(${(i / bufferLength) * 360}, 100%, 50%, 0.8)`);
        gradient.addColorStop(1, `hsla(${((i / bufferLength) * 360 + 40) % 360}, 100%, 70%, 0.8)`);
        ctx.fillStyle = gradient;

        // 绘制圆角矩形
        ctx.beginPath();
        ctx.moveTo(x + 1, HEIGHT);
        ctx.lineTo(x + 1, HEIGHT - barHeight + 2);
        ctx.quadraticCurveTo(x + 1, HEIGHT - barHeight, x + 3, HEIGHT - barHeight);
        ctx.lineTo(x + barWidth - 2, HEIGHT - barHeight);
        ctx.quadraticCurveTo(x + barWidth, HEIGHT - barHeight, x + barWidth, HEIGHT - barHeight + 2);
        ctx.lineTo(x + barWidth, HEIGHT);
        ctx.fill();

        x += barWidth + 0.5; // 减小频谱条之间的间隔
      }
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const togglePlay = async () => {
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg shadow-lg p-4 overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center mb-2">
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
        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 ml-2">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;