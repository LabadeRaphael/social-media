"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Box, IconButton, CircularProgress } from "@mui/material";
import { Play, Pause, Send, X } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { useCurrentUser, useSendVoice } from "@/react-query/query-hooks";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type Props = {
  conversationId?: string;
};

export type VoiceRecorderHandle = {
  startRecording: () => void;
  stopRecording: () => void;
};

const VoiceRecorder = forwardRef<VoiceRecorderHandle, Props>(({ conversationId }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const { mutate: sendVoice, isPending } = useSendVoice();

  // Make start/stop accessible from parent
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
  }));

  // 🌀 Initialize WaveSurfer for preview
  useEffect(() => {
    if (previewUrl && waveRef.current) {
      const ws = WaveSurfer.create({
        container: waveRef.current,
        waveColor: "#bdbdbd",
        progressColor: "#ffb300",
        cursorColor: "transparent",
        barWidth: 3,
        barRadius: 2,
        responsive: true,
        height: 60,
      });
      ws.load(previewUrl);
      waveSurferRef.current = ws;
      ws.on("finish", () => setIsPlaying(false));
      return () => ws.destroy();
    }
  }, [previewUrl]);

  // 🎙 Live bars animation while recording
  const [liveBars, setLiveBars] = useState<number[]>(new Array(20).fill(0));
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setLiveBars((bars) => bars.map(() => Math.random() * 50));
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 🔴 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        setIsPreviewing(true);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone error:", err);
      toast.error("Unable to start recording: " + err.message);
      // alert("Unable to start recording: " + err.message);
    }
  };

  // ⏹ Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 🧹 Cancel preview
  const cancelPreview = () => {
    setAudioBlob(null);
    setPreviewUrl(null);
    setIsPreviewing(false);
    setIsPlaying(false);
  };
  const { data: currentUser } = useCurrentUser();
  const selectedChat = useSelector(
    (state: RootState) => state.chatReducer.selectedChat
  );
  if (!selectedChat || !currentUser) return;

  const otherUser = selectedChat?.participants.find(
    (p) => p.user.id !== currentUser?.id
  );
  console.log("From voice recorder", otherUser);

  // 📤 Send voice message
  const sendRecording = () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });

    sendVoice(
      { file, conversationId },
      {
        onSuccess: (res) => {
          const socket = getSocket();

          socket.emit("send_message", {
            conversationId,
            type: "VOICE",
            receiverId: otherUser?.user.id,
            mediaUrl: res.mediaUrl,
            duration: res.duration
          });
          cancelPreview();
        },
        onError: (err) => {
          toast.error("Upload failed: " + err.message);
          // console.error("❌ Upload failed", err),
        }
      }
    );
  };

  // ▶️ Play / Pause toggle
  const togglePlay = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying((p) => !p);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} width="100%">
      {/* 🎙 Recording Wave */}
      {isRecording && !isPreviewing && (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            height: 40,
            alignItems: "flex-end",
          }}
        >
          {liveBars.map((height, i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                height: `${height}%`,
                bgcolor: "primary.main",
                borderRadius: 1,
                transition: "height 0.1s ease",
              }}
            />
          ))}
        </Box>
      )}

      {/* 🎧 Preview */}
      {isPreviewing && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 2,
            p: 1,
            ml:2,
            mr:2,
            mb:2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box ref={waveRef} sx={{ flex: 1 }} />
          <Box display="flex" alignItems="center" gap={1} ml={2}>
            <IconButton size="small" onClick={togglePlay}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </IconButton>

            <IconButton
              size="small"
              color="success"
              onClick={sendRecording}
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={18} /> : <Send size={20} />}
            </IconButton>

            <IconButton size="small" color="error" onClick={cancelPreview}>
              <X size={20} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
});

VoiceRecorder.displayName = "VoiceRecorder";
export default VoiceRecorder;
