import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Play, Pause } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext_new';
import { getUserById } from '../services/firestoreService';
import { format } from 'date-fns';

const MessageBubble = ({ message, isGroup }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sender, setSender] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const isOwnMessage = message.senderId === user.uid;

  useEffect(() => {
    if (!isOwnMessage) {
      loadSender();
    }

    // Load audio if it's a voice note
    if (message.type === 'voice' && message.mediaData) {
      loadAudio();
    }
  }, [message.senderId, isOwnMessage, message.type, message.mediaData]);

  const loadSender = async () => {
    try {
      const senderData = await getUserById(message.senderId);
      setSender(senderData);
    } catch (error) {
      console.error('Error loading sender:', error);
    }
  };

  const loadAudio = () => {
    if (message.mediaData && message.mediaData.startsWith('data:audio/')) {
      try {
        const audio = new Audio(message.mediaData);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration);
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };

        audio.onerror = (e) => {
          console.error('Audio loading error:', e);
        };
      } catch (error) {
        console.error('Error creating audio element:', error);
      }
    } else {
      console.warn('Invalid audio data format:', message.mediaData);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeString = message.timestamp ? format(message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp, 'HH:mm') : '';

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm ${
          isOwnMessage
            ? theme === 'dark'
              ? 'bg-[#005C4B]'
              : 'bg-[#D9FDD3]'
            : theme === 'dark'
            ? 'bg-[#202C33]'
            : 'bg-white'
        }`}
      >
        {isGroup && !isOwnMessage && sender && (
          <p className={`text-xs font-semibold mb-1 ${
            theme === 'dark' ? 'text-[#00A884]' : 'text-[#008069]'
          }`}>
            {sender.displayName}
          </p>
        )}

        {message.type === 'voice' && message.mediaData ? (
          <div className="flex items-center gap-3 py-2">
            <button
              onClick={togglePlayback}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-[#00A884] hover:bg-[#06CF9C]'
                  : 'bg-[#25D366] hover:bg-[#128C7E]'
              }`}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 1}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#2A3942] [&::-webkit-slider-thumb]:bg-[#00A884] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-track]:bg-[#2A3942]'
                      : 'bg-gray-200 [&::-webkit-slider-thumb]:bg-[#25D366] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-track]:bg-gray-200'
                  }`}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
                  }`}>
                    {formatTime(currentTime)}
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
                  }`}>
                    {formatTime(audioDuration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className={`text-sm whitespace-pre-wrap break-words ${
            theme === 'dark' ? 'text-[#E9EDEF]' : 'text-[#111B21]'
          }`}>
            {message.text}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
          }`}>
            {timeString}
          </span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.status === 'read' ? (
                <CheckCheck className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-[#53BDEB]' : 'text-[#4FC3F7]'
                }`} />
              ) : message.status === 'delivered' ? (
                <CheckCheck className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
                }`} />
              ) : (
                <Check className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-[#8696A0]' : 'text-[#667781]'
                }`} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
