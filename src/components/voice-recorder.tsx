// "use client";

// import {
//   useEffect,
//   useRef,
//   useState,
//   forwardRef,
//   useImperativeHandle,
// } from "react";

// import { Box, IconButton, CircularProgress, Typography } from "@mui/material";
// import { useTheme } from "@mui/material/styles";

// import {
//   Play,
//   Pause,
//   Send,
//   X,
//   Mic,
//   Square,
// } from "lucide-react";

// import WaveSurfer from "wavesurfer.js";

// import { useCurrentUser } from "@/react-query/query-hooks";
// import { useSendVoice } from "@/react-query/chat-hook";
// import { getSocket } from "@/lib/socket";

// import toast from "react-hot-toast";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// // ============================================================
// // TYPES
// // ============================================================

// type Props = {
//   conversationId?: string;
// };

// export type VoiceRecorderHandle = {
//   startRecording: () => void;
//   stopRecording: () => void;
// };

// // ============================================================
// // HELPERS
// // ============================================================

// const formatDuration = (seconds: number) => {
//   if (!Number.isFinite(seconds) || seconds < 0) {
//     return "0:00";
//   }

//   const safeSeconds = Math.floor(seconds);

//   const minutes = Math.floor(safeSeconds / 60);
//   const remainingSeconds = safeSeconds % 60;

//   return `${minutes}:${remainingSeconds
//     .toString()
//     .padStart(2, "0")}`;
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// const VoiceRecorder = forwardRef<VoiceRecorderHandle, Props>(
//   ({ conversationId }, ref) => {
//     // ==========================================================
//     // STATE
//     // ==========================================================

//     const [isRecording, setIsRecording] = useState(false);

//     const [isPreviewing, setIsPreviewing] = useState(false);

//     const [isPlaying, setIsPlaying] = useState(false);

//     const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

//     const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//     const [liveBars, setLiveBars] = useState<number[]>(
//       new Array(28).fill(5)
//     );

//     // ----------------------------------------------------------
//     // PLAYBACK / DURATION STATE
//     // ----------------------------------------------------------

//     const [recordingDuration, setRecordingDuration] = useState(0);

//     const [playbackDuration, setPlaybackDuration] = useState(0);

//     const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0);

//     const [waveReady, setWaveReady] = useState(false);

//     // ==========================================================
//     // REFS
//     // ==========================================================

//     const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//     const mediaStreamRef = useRef<MediaStream | null>(null);

//     const audioChunksRef = useRef<Blob[]>([]);

//     const waveRef = useRef<HTMLDivElement | null>(null);

//     const waveSurferRef = useRef<WaveSurfer | null>(null);

//     const audioRef = useRef<HTMLAudioElement | null>(null);

//     // ==========================================================
//     // RECORDING TIMER REF
//     // ==========================================================

//     const recordingStartTimeRef = useRef<number | null>(null);

//     const recordingTimerRef =
//       useRef<ReturnType<typeof setInterval> | null>(null);

//     // ==========================================================
//     // MICROPHONE MONITOR REFS
//     // ==========================================================

//     const audioContextRef = useRef<AudioContext | null>(null);

//     const analyserRef = useRef<AnalyserNode | null>(null);

//     const microphoneSourceRef =
//       useRef<MediaStreamAudioSourceNode | null>(null);

//     const micMonitorIntervalRef =
//       useRef<ReturnType<typeof setInterval> | null>(null);

//     // ==========================================================
//     // REACT QUERY
//     // ==========================================================

//     const { data: currentUser } = useCurrentUser();

//     const {
//       mutate: sendVoice,
//       isPending,
//     } = useSendVoice();

//     // ==========================================================
//     // REDUX
//     // ==========================================================

//     const selectedChat = useSelector(
//       (state: RootState) =>
//         state.chatReducer.selectedChat
//     );

//     // ==========================================================
//     // OTHER USER
//     // ==========================================================

//     const otherUser =
//       selectedChat?.participants?.find(
//         (participant) =>
//           participant.user.id !== currentUser?.id
//       );

//     // THEME
//     const theme = useTheme();
//     const mode = theme.palette.mode;
//     // ==========================================================
//     // DEBUG STATE
//     // ==========================================================

//     useEffect(() => {
//       console.log(
//         "🎤 [VoiceRecorder] STATE:",
//         {
//           isRecording,
//           isPreviewing,
//           isPlaying,
//           hasAudioBlob: !!audioBlob,
//           audioBlobSize: audioBlob?.size,
//           audioBlobType: audioBlob?.type,
//           previewUrl,
//           conversationId,
//           currentUserId: currentUser?.id,
//           selectedChatId: selectedChat?.id,
//           receiverId: otherUser?.user.id,
//           recordingDuration,
//           playbackCurrentTime,
//           playbackDuration,
//         }
//       );
//     }, [
//       isRecording,
//       isPreviewing,
//       isPlaying,
//       audioBlob,
//       previewUrl,
//       conversationId,
//       currentUser,
//       selectedChat,
//       otherUser,
//       recordingDuration,
//       playbackCurrentTime,
//       playbackDuration,
//     ]);

//     // ==========================================================
//     // OTHER USER DEBUG
//     // ==========================================================

//     useEffect(() => {
//       console.log(
//         "👤 [VoiceRecorder] OTHER USER:",
//         otherUser
//       );
//     }, [otherUser]);

//     // ==========================================================
//     // RECORDING TIMER
//     // ==========================================================

//     const stopRecordingTimer = () => {
//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//         recordingTimerRef.current = null;
//       }
//     };

//     const startRecordingTimer = () => {
//       stopRecordingTimer();

//       recordingStartTimeRef.current = Date.now();

//       setRecordingDuration(0);

//       recordingTimerRef.current = setInterval(() => {
//         if (!recordingStartTimeRef.current) {
//           return;
//         }

//         const elapsed =
//           (Date.now() -
//             recordingStartTimeRef.current) /
//           1000;

//         setRecordingDuration(elapsed);
//       }, 250);
//     };

//     // ==========================================================
//     // CLEAN MICROPHONE MONITOR
//     // ==========================================================

//     const stopMicMonitor = () => {
//       console.log(
//         "🧹 [MicMonitor] Stopping monitor"
//       );

//       if (micMonitorIntervalRef.current) {
//         clearInterval(
//           micMonitorIntervalRef.current
//         );

//         micMonitorIntervalRef.current = null;
//       }

//       if (microphoneSourceRef.current) {
//         try {
//           microphoneSourceRef.current.disconnect();
//         } catch { }

//         microphoneSourceRef.current = null;
//       }

//       if (audioContextRef.current) {
//         try {
//           audioContextRef.current.close();
//         } catch { }

//         audioContextRef.current = null;
//       }

//       analyserRef.current = null;
//     };

//     // ==========================================================
//     // DEEP MICROPHONE DIAGNOSTICS
//     // ==========================================================

//     const diagnoseMicrophone = async (
//       stream: MediaStream
//     ) => {
//       console.log(
//         "════════════════════════════════════"
//       );

//       console.log(
//         "🔎 [MIC DIAGNOSTICS] START"
//       );

//       console.log(
//         "════════════════════════════════════"
//       );

//       try {
//         // ------------------------------------------------------
//         // BROWSER
//         // ------------------------------------------------------

//         console.log("🌐 Browser:", {
//           userAgent: navigator.userAgent,
//           platform: navigator.platform,
//           online: navigator.onLine,
//         });

//         // ------------------------------------------------------
//         // MEDIA DEVICES
//         // ------------------------------------------------------

//         console.log(
//           "🎤 [MIC DIAGNOSTICS] Enumerating devices..."
//         );

//         const devices =
//           await navigator.mediaDevices.enumerateDevices();

//         console.table(
//           devices.map((device) => ({
//             kind: device.kind,
//             deviceId: device.deviceId
//               ? device.deviceId.slice(0, 12) + "..."
//               : "",
//             groupId: device.groupId
//               ? device.groupId.slice(0, 12) + "..."
//               : "",
//             label: device.label || "(NO LABEL)",
//           }))
//         );

//         const microphones =
//           devices.filter(
//             (device) =>
//               device.kind === "audioinput"
//           );

//         console.log(
//           "🎤 [MIC DIAGNOSTICS] Microphone count:",
//           microphones.length
//         );

//         // ------------------------------------------------------
//         // TRACK
//         // ------------------------------------------------------

//         const track =
//           stream.getAudioTracks()[0];

//         if (!track) {
//           console.error(
//             "❌ [MIC DIAGNOSTICS] NO AUDIO TRACK"
//           );

//           return;
//         }

//         console.log(
//           "🎤 [MIC DIAGNOSTICS] TRACK:",
//           {
//             id: track.id,
//             label: track.label,
//             kind: track.kind,
//             enabled: track.enabled,
//             muted: track.muted,
//             readyState: track.readyState,
//             contentHint: track.contentHint,
//           }
//         );

//         // ------------------------------------------------------
//         // TRACK SETTINGS
//         // ------------------------------------------------------

//         console.log(
//           "⚙️ [MIC DIAGNOSTICS] SETTINGS:",
//           track.getSettings()
//         );

//         // ------------------------------------------------------
//         // TRACK CONSTRAINTS
//         // ------------------------------------------------------

//         console.log(
//           "⚙️ [MIC DIAGNOSTICS] CONSTRAINTS:",
//           track.getConstraints()
//         );

//         // ------------------------------------------------------
//         // TRACK CAPABILITIES
//         // ------------------------------------------------------

//         if (
//           typeof track.getCapabilities ===
//           "function"
//         ) {
//           console.log(
//             "⚙️ [MIC DIAGNOSTICS] CAPABILITIES:",
//             track.getCapabilities()
//           );
//         }

//         // ------------------------------------------------------
//         // TRACK EVENTS
//         // ------------------------------------------------------

//         track.onmute = () => {
//           console.error(
//             "🔇 [MIC DIAGNOSTICS] TRACK MUTED EVENT"
//           );
//         };

//         track.onunmute = () => {
//           console.log(
//             "🔊 [MIC DIAGNOSTICS] TRACK UNMUTED EVENT"
//           );
//         };

//         track.onended = () => {
//           console.error(
//             "🛑 [MIC DIAGNOSTICS] TRACK ENDED EVENT"
//           );
//         };

//         // ------------------------------------------------------
//         // GLOBAL MEDIA SUPPORT
//         // ------------------------------------------------------

//         console.log(
//           "🧩 [MIC DIAGNOSTICS] Supported constraints:",
//           navigator.mediaDevices.getSupportedConstraints()
//         );

//         // ------------------------------------------------------
//         // AUDIO CONTEXT
//         // ------------------------------------------------------

//         const AudioContextClass =
//           window.AudioContext ||
//           (
//             window as typeof window & {
//               webkitAudioContext?: typeof AudioContext;
//             }
//           ).webkitAudioContext;

//         if (!AudioContextClass) {
//           console.error(
//             "❌ [MIC DIAGNOSTICS] AudioContext unavailable"
//           );

//           return;
//         }

//         const context =
//           new AudioContextClass();

//         console.log(
//           "🎵 [MIC DIAGNOSTICS] AudioContext:",
//           {
//             state: context.state,
//             sampleRate: context.sampleRate,
//             baseLatency: context.baseLatency,
//             outputLatency:
//               "outputLatency" in context
//                 ? (
//                   context as AudioContext & {
//                     outputLatency?: number;
//                   }
//                 ).outputLatency
//                 : undefined,
//           }
//         );

//         if (
//           context.state ===
//           "suspended"
//         ) {
//           await context.resume();
//         }

//         const source =
//           context.createMediaStreamSource(
//             stream
//           );

//         const analyser =
//           context.createAnalyser();

//         analyser.fftSize = 2048;

//         analyser.smoothingTimeConstant = 0;

//         source.connect(analyser);

//         const data =
//           new Float32Array(
//             analyser.fftSize
//           );

//         // ------------------------------------------------------
//         // SAMPLE MICROPHONE FOR 3 SECONDS
//         // ------------------------------------------------------

//         console.log(
//           "🎧 [MIC DIAGNOSTICS] Sampling microphone for 3 seconds..."
//         );

//         let maxRms = 0;

//         let maxPeak = 0;

//         let samples = 0;

//         const start =
//           performance.now();

//         await new Promise<void>(
//           (resolve) => {
//             const interval =
//               setInterval(() => {
//                 analyser.getFloatTimeDomainData(
//                   data
//                 );

//                 let sum = 0;

//                 let peak = 0;

//                 for (
//                   let i = 0;
//                   i < data.length;
//                   i++
//                 ) {
//                   const value =
//                     data[i];

//                   sum +=
//                     value *
//                     value;

//                   peak = Math.max(
//                     peak,
//                     Math.abs(value)
//                   );
//                 }

//                 const rms =
//                   Math.sqrt(
//                     sum /
//                     data.length
//                   );

//                 maxRms = Math.max(
//                   maxRms,
//                   rms
//                 );

//                 maxPeak = Math.max(
//                   maxPeak,
//                   peak
//                 );

//                 samples++;

//                 console.log(
//                   "🎙️ [MIC SIGNAL]",
//                   {
//                     rms,
//                     peak,
//                     trackMuted:
//                       track.muted,
//                     trackEnabled:
//                       track.enabled,
//                     readyState:
//                       track.readyState,
//                   }
//                 );

//                 if (
//                   performance.now() -
//                   start >=
//                   3000
//                 ) {
//                   clearInterval(
//                     interval
//                   );

//                   resolve();
//                 }
//               }, 250);
//           }
//         );

//         source.disconnect();

//         analyser.disconnect();

//         await context.close();

//         console.log(
//           "════════════════════════════════════"
//         );

//         console.log(
//           "🏁 [MIC DIAGNOSTICS] RESULT:",
//           {
//             samples,
//             maxRms,
//             maxPeak,
//             trackMuted:
//               track.muted,
//             trackEnabled:
//               track.enabled,
//             readyState:
//               track.readyState,
//           }
//         );

//         if (
//           maxRms === 0 &&
//           maxPeak === 0
//         ) {
//           console.error(
//             "🚨🚨🚨 [MIC DIAGNOSTICS] ZERO MICROPHONE SIGNAL 🚨🚨🚨"
//           );

//           console.error(
//             "The browser has a microphone track, but NO AUDIO DATA is reaching the Web Audio API."
//           );
//         } else {
//           console.log(
//             "✅ [MIC DIAGNOSTICS] REAL MICROPHONE SIGNAL DETECTED"
//           );
//         }

//         console.log(
//           "════════════════════════════════════"
//         );
//       } catch (error) {
//         console.error(
//           "❌ [MIC DIAGNOSTICS] FAILED:",
//           error
//         );
//       }
//     };

//     // ==========================================================
//     // START MICROPHONE MONITOR
//     // ==========================================================

//     const startMicMonitor = async (
//       stream: MediaStream
//     ) => {
//       try {
//         console.log(
//           "🎤 [MicMonitor] Creating AudioContext"
//         );

//         const AudioContextClass =
//           window.AudioContext ||
//           (
//             window as typeof window & {
//               webkitAudioContext?: typeof AudioContext;
//             }
//           ).webkitAudioContext;

//         if (!AudioContextClass) {
//           console.warn(
//             "⚠️ [MicMonitor] AudioContext not supported"
//           );

//           return;
//         }

//         const audioContext =
//           new AudioContextClass();

//         console.log(
//           "🎤 [MicMonitor] AudioContext:",
//           {
//             state:
//               audioContext.state,
//             sampleRate:
//               audioContext.sampleRate,
//           }
//         );

//         if (
//           audioContext.state ===
//           "suspended"
//         ) {
//           console.log(
//             "🎤 [MicMonitor] Resuming AudioContext"
//           );

//           await audioContext.resume();
//         }

//         const analyser =
//           audioContext.createAnalyser();

//         analyser.fftSize = 2048;

//         analyser.smoothingTimeConstant =
//           0.8;

//         const microphone =
//           audioContext.createMediaStreamSource(
//             stream
//           );

//         microphone.connect(
//           analyser
//         );

//         audioContextRef.current =
//           audioContext;

//         analyserRef.current =
//           analyser;

//         microphoneSourceRef.current =
//           microphone;

//         const dataArray =
//           new Uint8Array(
//             analyser.fftSize
//           );

//         console.log(
//           "✅ [MicMonitor] Monitor started"
//         );

//         micMonitorIntervalRef.current =
//           setInterval(() => {
//             if (
//               !analyserRef.current
//             ) {
//               return;
//             }

//             analyserRef.current.getByteTimeDomainData(
//               dataArray
//             );

//             let sum = 0;

//             let peak = 0;

//             for (
//               let i = 0;
//               i <
//               dataArray.length;
//               i++
//             ) {
//               const normalized =
//                 (dataArray[i] -
//                   128) /
//                 128;

//               sum +=
//                 normalized *
//                 normalized;

//               peak = Math.max(
//                 peak,
//                 Math.abs(
//                   normalized
//                 )
//               );
//             }

//             const rms =
//               Math.sqrt(
//                 sum /
//                 dataArray.length
//               );

//             console.log(
//               "🎤 [MicMonitor] LEVEL:",
//               {
//                 rms,
//                 peak,
//                 audioContextState:
//                   audioContext.state,
//                 trackEnabled:
//                   stream.getAudioTracks()[0]
//                     ?.enabled,
//                 trackMuted:
//                   stream.getAudioTracks()[0]
//                     ?.muted,
//                 trackReadyState:
//                   stream.getAudioTracks()[0]
//                     ?.readyState,
//               }
//             );
//           }, 500);
//       } catch (error) {
//         console.error(
//           "❌ [MicMonitor] Failed:",
//           error
//         );
//       }
//     };

//     // ==========================================================
//     // EXPOSE START / STOP
//     // ==========================================================

//     useImperativeHandle(
//       ref,
//       () => ({
//         startRecording,
//         stopRecording,
//       }),
//       []
//     );

//     // ==========================================================
//     // WAVESURFER
//     // ==========================================================

//     useEffect(() => {
//       if (
//         !previewUrl ||
//         !waveRef.current
//       ) {
//         console.log(
//           "🌊 [WaveSurfer] Waiting:",
//           {
//             hasPreviewUrl:
//               !!previewUrl,
//             hasContainer:
//               !!waveRef.current,
//           }
//         );

//         setWaveReady(false);

//         return;
//       }

//       console.log(
//         "🌊 [WaveSurfer] Initializing"
//       );

//       setWaveReady(false);

//       if (
//         waveSurferRef.current
//       ) {
//         try {
//           waveSurferRef.current.destroy();
//         } catch { }

//         waveSurferRef.current =
//           null;
//       }

//       const ws =
//         WaveSurfer.create({
//           container:
//             waveRef.current,

//           waveColor:
//             "#c8c8c8",

//           progressColor:
//             "#ffb300",

//           cursorColor:
//             "transparent",

//           barWidth: 3,

//           barGap: 2,

//           barRadius: 4,

//           height: 52,

//           normalize: true,

//           interact: false,
//         });

//       waveSurferRef.current =
//         ws;

//       console.log(
//         "🌊 [WaveSurfer] Loading:",
//         previewUrl
//       );

//       ws.load(previewUrl);

//       ws.on(
//         "ready",
//         () => {
//           console.log(
//             "🌊 [WaveSurfer] READY"
//           );

//           setWaveReady(true);

//           const duration =
//             ws.getDuration();

//           if (
//             Number.isFinite(
//               duration
//             ) &&
//             duration > 0
//           ) {
//             setPlaybackDuration(
//               duration
//             );
//           }
//         }
//       );

//       ws.on(
//         "error",
//         (error) => {
//           console.error(
//             "❌ [WaveSurfer] ERROR:",
//             error
//           );

//           setWaveReady(false);
//         }
//       );

//       return () => {
//         console.log(
//           "🧹 [WaveSurfer] Cleanup"
//         );

//         try {
//           ws.destroy();
//         } catch { }

//         if (
//           waveSurferRef.current ===
//           ws
//         ) {
//           waveSurferRef.current =
//             null;
//         }
//       };
//     }, [previewUrl]);

//     // ==========================================================
//     // LIVE RECORDING BARS
//     // ==========================================================

//     useEffect(() => {
//       let interval:
//         | ReturnType<
//           typeof setInterval
//         >
//         | undefined;

//       if (isRecording) {
//         console.log(
//           "📊 [LiveBars] Animation started"
//         );

//         interval =
//           setInterval(() => {
//             setLiveBars(
//               (bars) =>
//                 bars.map(
//                   (_, index) => {
//                     const center =
//                       bars.length / 2;

//                     const distance =
//                       Math.abs(
//                         index -
//                         center
//                       );

//                     const natural =
//                       Math.max(
//                         10,
//                         55 -
//                         distance *
//                         2
//                       );

//                     return (
//                       Math.random() *
//                       natural +
//                       8
//                     );
//                   }
//                 )
//             );
//           }, 100);
//       } else {
//         setLiveBars(
//           new Array(28).fill(5)
//         );
//       }

//       return () => {
//         if (interval) {
//           clearInterval(
//             interval
//           );
//         }
//       };
//     }, [isRecording]);

//     // ==========================================================
//     // NATIVE AUDIO EVENTS
//     // ==========================================================

//     useEffect(() => {
//       const audio =
//         audioRef.current;

//       if (!audio) {
//         return;
//       }

//       console.log(
//         "🎵 [NativeAudio] Setting up events"
//       );

//       const handleLoadedMetadata =
//         () => {
//           console.log(
//             "🎵 [NativeAudio] METADATA:",
//             {
//               duration:
//                 audio.duration,
//               readyState:
//                 audio.readyState,
//               networkState:
//                 audio.networkState,
//               volume:
//                 audio.volume,
//               muted:
//                 audio.muted,
//               paused:
//                 audio.paused,
//             }
//           );

//           if (
//             Number.isFinite(
//               audio.duration
//             ) &&
//             audio.duration > 0
//           ) {
//             setPlaybackDuration(
//               audio.duration
//             );
//           }
//         };

//       const handleCanPlay =
//         () => {
//           console.log(
//             "🎵 [NativeAudio] CAN PLAY",
//             {
//               readyState:
//                 audio.readyState,
//               duration:
//                 audio.duration,
//             }
//           );
//         };

//       const handlePlay =
//         () => {
//           console.log(
//             "▶️ [NativeAudio] PLAY EVENT"
//           );

//           setIsPlaying(true);
//         };

//       const handlePause =
//         () => {
//           console.log(
//             "⏸️ [NativeAudio] PAUSE EVENT"
//           );

//           setIsPlaying(false);
//         };

//       const handleEnded =
//         () => {
//           console.log(
//             "🏁 [NativeAudio] ENDED"
//           );

//           setIsPlaying(false);

//           setPlaybackCurrentTime(
//             audio.duration || 0
//           );

//           if (
//             waveSurferRef.current &&
//             Number.isFinite(
//               audio.duration
//             ) &&
//             audio.duration > 0
//           ) {
//             waveSurferRef.current.seekTo(
//               1
//             );
//           }
//         };

//       const handleError =
//         () => {
//           console.error(
//             "❌ [NativeAudio] ERROR:",
//             {
//               error:
//                 audio.error,
//               code:
//                 audio.error?.code,
//               message:
//                 audio.error?.message,
//               src:
//                 audio.src,
//               readyState:
//                 audio.readyState,
//               networkState:
//                 audio.networkState,
//             }
//           );

//           setIsPlaying(false);
//         };

//       const handleTimeUpdate =
//         () => {
//           const duration =
//             audio.duration;

//           const currentTime =
//             audio.currentTime;

//           setPlaybackCurrentTime(
//             currentTime
//           );

//           if (
//             Number.isFinite(
//               duration
//             ) &&
//             duration > 0
//           ) {
//             setPlaybackDuration(
//               duration
//             );

//             const progress =
//               Math.min(
//                 1,
//                 Math.max(
//                   0,
//                   currentTime /
//                   duration
//                 )
//               );

//             if (
//               waveSurferRef.current
//             ) {
//               waveSurferRef.current.seekTo(
//                 progress
//               );
//             }
//           }

//           console.log(
//             "🎵 [NativeAudio] TIME:",
//             {
//               currentTime,
//               duration,
//             }
//           );
//         };

//       audio.addEventListener(
//         "loadedmetadata",
//         handleLoadedMetadata
//       );

//       audio.addEventListener(
//         "canplay",
//         handleCanPlay
//       );

//       audio.addEventListener(
//         "play",
//         handlePlay
//       );

//       audio.addEventListener(
//         "pause",
//         handlePause
//       );

//       audio.addEventListener(
//         "ended",
//         handleEnded
//       );

//       audio.addEventListener(
//         "error",
//         handleError
//       );

//       audio.addEventListener(
//         "timeupdate",
//         handleTimeUpdate
//       );

//       return () => {
//         audio.removeEventListener(
//           "loadedmetadata",
//           handleLoadedMetadata
//         );

//         audio.removeEventListener(
//           "canplay",
//           handleCanPlay
//         );

//         audio.removeEventListener(
//           "play",
//           handlePlay
//         );

//         audio.removeEventListener(
//           "pause",
//           handlePause
//         );

//         audio.removeEventListener(
//           "ended",
//           handleEnded
//         );

//         audio.removeEventListener(
//           "error",
//           handleError
//         );

//         audio.removeEventListener(
//           "timeupdate",
//           handleTimeUpdate
//         );
//       };
//     }, [previewUrl]);

//     // ==========================================================
//     // FORCE NATIVE AUDIO TO LOAD BLOB
//     // ==========================================================

//     useEffect(() => {
//       const audio =
//         audioRef.current;

//       if (
//         !audio ||
//         !previewUrl
//       ) {
//         return;
//       }

//       audio.pause();

//       audio.currentTime = 0;

//       audio.muted = false;

//       audio.volume = 1;

//       audio.src = previewUrl;

//       audio.load();

//       setPlaybackCurrentTime(0);

//       console.log(
//         "🎧 [NativeAudio] BLOB SOURCE:",
//         {
//           src: audio.src,
//           readyState:
//             audio.readyState,
//           networkState:
//             audio.networkState,
//           muted:
//             audio.muted,
//           volume:
//             audio.volume,
//         }
//       );
//     }, [previewUrl]);

//     // ==========================================================
//     // START RECORDING
//     // ==========================================================

//     const startRecording =
//       async () => {
//         console.log(
//           "🎤 [Recording] START requested"
//         );

//         if (isRecording) {
//           console.warn(
//             "⚠️ [Recording] Already recording"
//           );

//           return;
//         }

//         if (isPreviewing) {
//           console.warn(
//             "⚠️ [Recording] Preview exists"
//           );

//           return;
//         }

//         try {
//           // ----------------------------------------------------
//           // BROWSER SUPPORT
//           // ----------------------------------------------------

//           if (
//             !navigator.mediaDevices ||
//             !navigator.mediaDevices
//               .getUserMedia
//           ) {
//             toast.error(
//               "Microphone recording is not supported."
//             );

//             return;
//           }

//           // ----------------------------------------------------
//           // CLEAN PREVIOUS MONITOR
//           // ----------------------------------------------------

//           stopMicMonitor();

//           // ----------------------------------------------------
//           // REQUEST MICROPHONE
//           // ----------------------------------------------------

//           console.log(
//             "🎤 [Recording] Requesting microphone..."
//           );

//           const stream =
//             await navigator.mediaDevices.getUserMedia(
//               {
//                 audio: {
//                   channelCount: {
//                     ideal: 1,
//                   },

//                   sampleRate: {
//                     ideal: 48000,
//                   },

//                   sampleSize: {
//                     ideal: 16,
//                   },

//                   echoCancellation:
//                     false,

//                   noiseSuppression:
//                     false,

//                   autoGainControl:
//                     false,
//                 },
//               }
//             );

//           const tracks =
//             stream.getAudioTracks();

//           const track =
//             tracks[0];

//           console.log(
//             "🔎 [MIC CHECK] AFTER getUserMedia:",
//             {
//               count:
//                 tracks.length,

//               label:
//                 track?.label,

//               muted:
//                 track?.muted,

//               enabled:
//                 track?.enabled,

//               readyState:
//                 track?.readyState,

//               settings:
//                 track?.getSettings(),
//             }
//           );

//           if (!track) {
//             throw new Error(
//               "Chrome did not provide an audio track."
//             );
//           }

//           track.enabled = true;

//           track.onmute = () => {
//             console.error(
//               "🚨 [MIC CHECK] TRACK MUTED — Chrome is receiving no microphone audio."
//             );
//           };

//           track.onunmute = () => {
//             console.log(
//               "🔊 [MIC CHECK] TRACK UNMUTED — microphone audio resumed."
//             );
//           };

//           track.onended = () => {
//             console.error(
//               "🛑 [MIC CHECK] TRACK ENDED — microphone source stopped."
//             );
//           };

//           // ----------------------------------------------------
//           // MIME TYPE
//           // ----------------------------------------------------

//           const mimeTypes = [
//             "audio/webm;codecs=opus",
//             "audio/webm",
//             "audio/ogg;codecs=opus",
//             "audio/mp4",
//           ];

//           let selectedMimeType =
//             "";

//           for (
//             const mimeType of mimeTypes
//           ) {
//             if (
//               MediaRecorder.isTypeSupported(
//                 mimeType
//               )
//             ) {
//               selectedMimeType =
//                 mimeType;

//               break;
//             }
//           }

//           console.log(
//             "🎤 [Recording] Selected MIME:",
//             selectedMimeType ||
//             "Browser default"
//           );

//           // Give Chrome a moment to start delivering microphone frames.

//           await new Promise(
//             (resolve) =>
//               setTimeout(
//                 resolve,
//                 800
//               )
//           );

//           if (track.muted) {
//             console.error(
//               "🚨 [MIC CHECK] FINAL RESULT: microphone is still muted."
//             );

//             console.error(
//               "🚨 [MIC CHECK] This is an input/OS/browser-source problem, not WaveSurfer or MediaRecorder."
//             );

//             stream
//               .getTracks()
//               .forEach(
//                 (t) =>
//                   t.stop()
//               );

//             mediaStreamRef.current =
//               null;

//             toast.error(
//               "Chrome is receiving no microphone audio. Check Windows microphone input/permissions."
//             );

//             setIsRecording(
//               false
//             );

//             return;
//           }

//           console.log(
//             "✅ [MIC CHECK] Track is not muted. Starting recorder."
//           );

//           // ----------------------------------------------------
//           // CREATE RECORDER
//           // ----------------------------------------------------

//           const recorder =
//             selectedMimeType
//               ? new MediaRecorder(
//                 stream,
//                 {
//                   mimeType:
//                     selectedMimeType,
//                 }
//               )
//               : new MediaRecorder(
//                 stream
//               );

//           mediaRecorderRef.current =
//             recorder;

//           mediaStreamRef.current =
//             stream;

//           audioChunksRef.current =
//             [];

//           console.log(
//             "🎤 [Recording] MediaRecorder:",
//             {
//               state:
//                 recorder.state,
//               mimeType:
//                 recorder.mimeType,
//             }
//           );

//           // ----------------------------------------------------
//           // DATA AVAILABLE
//           // ----------------------------------------------------

//           recorder.ondataavailable =
//             (event) => {
//               console.log(
//                 "🎤 [Recording] DATA:",
//                 {
//                   size:
//                     event.data
//                       .size,
//                   type:
//                     event.data
//                       .type,
//                 }
//               );

//               if (
//                 event.data.size >
//                 0
//               ) {
//                 audioChunksRef.current.push(
//                   event.data
//                 );

//                 console.log(
//                   "🎤 [Recording] Chunks:",
//                   audioChunksRef.current
//                     .length
//                 );
//               }
//             };

//           // ----------------------------------------------------
//           // RECORDER ERROR
//           // ----------------------------------------------------

//           recorder.onerror =
//             (event) => {
//               console.error(
//                 "❌ [Recording] MediaRecorder ERROR:",
//                 event
//               );
//             };

//           // ----------------------------------------------------
//           // STOP
//           // ----------------------------------------------------

//           recorder.onstop =
//             () => {
//               console.log(
//                 "🛑 [Recording] STOP EVENT"
//               );

//               console.log(
//                 "🎤 [Recording] Total chunks:",
//                 audioChunksRef.current
//                   .length
//               );

//               stopMicMonitor();

//               stopRecordingTimer();

//               if (
//                 recordingStartTimeRef.current
//               ) {
//                 const finalDuration =
//                   (Date.now() -
//                     recordingStartTimeRef.current) /
//                   1000;

//                 setRecordingDuration(
//                   finalDuration
//                 );
//               }

//               recordingStartTimeRef.current =
//                 null;

//               if (
//                 audioChunksRef.current
//                   .length === 0
//               ) {
//                 console.error(
//                   "❌ [Recording] No audio chunks"
//                 );

//                 toast.error(
//                   "No audio was recorded."
//                 );

//                 setIsRecording(
//                   false
//                 );

//                 return;
//               }

//               // ------------------------------------------------
//               // CREATE BLOB
//               // ------------------------------------------------

//               const blob =
//                 new Blob(
//                   audioChunksRef.current,
//                   {
//                     type:
//                       recorder.mimeType ||
//                       "audio/webm",
//                   }
//                 );

//               console.log(
//                 "🎵 [Recording] BLOB CREATED:",
//                 {
//                   size:
//                     blob.size,

//                   type:
//                     blob.type,

//                   chunks:
//                     audioChunksRef.current
//                       .length,

//                   trackMuted:
//                     track.muted,

//                   trackEnabled:
//                     track.enabled,

//                   trackReadyState:
//                     track.readyState,
//                 }
//               );

//               if (
//                 blob.size < 12000
//               ) {
//                 console.warn(
//                   "⚠️ [Recording] Blob is unusually small for a voice recording. This strongly suggests silence/no microphone signal.",
//                   {
//                     size:
//                       blob.size,
//                   }
//                 );
//               }

//               if (
//                 blob.size === 0
//               ) {
//                 console.error(
//                   "❌ [Recording] Empty blob"
//                 );

//                 toast.error(
//                   "The recording is empty."
//                 );

//                 return;
//               }

//               // ------------------------------------------------
//               // CREATE URL
//               // ------------------------------------------------

//               const url =
//                 URL.createObjectURL(
//                   blob
//                 );

//               console.log(
//                 "🔗 [Recording] Preview URL:",
//                 url
//               );

//               // ------------------------------------------------
//               // SAVE RECORDING
//               // ------------------------------------------------

//               setAudioBlob(
//                 blob
//               );

//               setPreviewUrl(
//                 url
//               );

//               setIsRecording(
//                 false
//               );

//               setIsPreviewing(
//                 true
//               );

//               setPlaybackCurrentTime(
//                 0
//               );

//               setPlaybackDuration(
//                 0
//               );

//               // ------------------------------------------------
//               // STOP MICROPHONE
//               // ------------------------------------------------

//               console.log(
//                 "🎤 [Recording] Stopping microphone tracks"
//               );

//               mediaStreamRef.current
//                 ?.getTracks()
//                 .forEach(
//                   (
//                     track
//                   ) => {
//                     console.log(
//                       "🎤 [Recording] Stopping:",
//                       track.label
//                     );

//                     track.stop();
//                   }
//                 );

//               mediaStreamRef.current =
//                 null;

//               mediaRecorderRef.current =
//                 null;
//             };

//           // ----------------------------------------------------
//           // START
//           // ----------------------------------------------------

//           recorder.start(250);

//           console.log(
//             "🔴 [Recording] recorder.start() called"
//           );

//           console.log(
//             "🎤 [Recording] State:",
//             recorder.state
//           );

//           setRecordingDuration(
//             0
//           );

//           startRecordingTimer();

//           setIsRecording(
//             true
//           );

//           // Keep existing monitor behavior.

//           startMicMonitor(
//             stream
//           );

//           // Keep diagnostics available without changing
//           // recording flow.
//           //
//           // diagnoseMicrophone(stream);
//         } catch (error: any) {
//           console.error(
//             "❌ [Recording] START FAILED:",
//             error
//           );

//           stopMicMonitor();

//           stopRecordingTimer();

//           mediaStreamRef.current
//             ?.getTracks()
//             .forEach(
//               (track) =>
//                 track.stop()
//             );

//           mediaStreamRef.current =
//             null;

//           mediaRecorderRef.current =
//             null;

//           recordingStartTimeRef.current =
//             null;

//           setIsRecording(
//             false
//           );

//           toast.error(
//             "Unable to start recording: " +
//             (
//               error?.message ||
//               "Unknown microphone error"
//             )
//           );
//         }
//       };

//     // ==========================================================
//     // STOP RECORDING
//     // ==========================================================

//     const stopRecording =
//       () => {
//         console.log(
//           "🛑 [Recording] STOP requested"
//         );

//         const recorder =
//           mediaRecorderRef.current;

//         if (!recorder) {
//           console.warn(
//             "⚠️ [Recording] No MediaRecorder"
//           );

//           setIsRecording(
//             false
//           );

//           stopRecordingTimer();

//           stopMicMonitor();

//           return;
//         }

//         console.log(
//           "🎤 [Recording] Current state:",
//           recorder.state
//         );

//         if (
//           recorder.state ===
//           "recording"
//         ) {
//           recorder.stop();

//           console.log(
//             "🛑 [Recording] stop() called"
//           );
//         } else {
//           console.warn(
//             "⚠️ [Recording] Not recording:",
//             recorder.state
//           );
//         }

//         stopRecordingTimer();

//         setIsRecording(
//           false
//         );
//       };

//     // ==========================================================
//     // PLAY / PAUSE
//     // ==========================================================

//     const togglePlay =
//       async () => {
//         console.log(
//           "▶️ [NativeAudio] PLAY/PAUSE clicked"
//         );

//         if (!previewUrl) {
//           console.error(
//             "❌ [NativeAudio] No preview URL"
//           );

//           toast.error(
//             "No recording available."
//           );

//           return;
//         }

//         const audio =
//           audioRef.current;

//         if (!audio) {
//           console.error(
//             "❌ [NativeAudio] Audio element missing"
//           );

//           return;
//         }

//         console.log(
//           "🎵 [NativeAudio] Before play:",
//           {
//             src:
//               audio.src,

//             expectedSrc:
//               previewUrl,

//             paused:
//               audio.paused,

//             ended:
//               audio.ended,

//             currentTime:
//               audio.currentTime,

//             duration:
//               audio.duration,

//             volume:
//               audio.volume,

//             muted:
//               audio.muted,

//             readyState:
//               audio.readyState,

//             networkState:
//               audio.networkState,

//             error:
//               audio.error,
//           }
//         );

//         try {
//           // ----------------------------------------------------
//           // PAUSE
//           // ----------------------------------------------------

//           if (!audio.paused) {
//             console.log(
//               "⏸️ [NativeAudio] Calling pause()"
//             );

//             audio.pause();

//             setIsPlaying(
//               false
//             );

//             return;
//           }

//           // ----------------------------------------------------
//           // RESET IF ENDED
//           // ----------------------------------------------------

//           if (audio.ended) {
//             console.log(
//               "🔄 [NativeAudio] Resetting ended audio"
//             );

//             audio.currentTime =
//               0;

//             setPlaybackCurrentTime(
//               0
//             );

//             if (
//               waveSurferRef.current
//             ) {
//               waveSurferRef.current.seekTo(
//                 0
//               );
//             }
//           }

//           // ----------------------------------------------------
//           // ENSURE SOURCE
//           // ----------------------------------------------------

//           if (
//             audio.src !==
//             previewUrl
//           ) {
//             console.log(
//               "🔗 [NativeAudio] Setting source"
//             );

//             audio.src =
//               previewUrl;

//             audio.load();

//             await new Promise<void>(
//               (
//                 resolve
//               ) => {
//                 const onLoaded =
//                   () => {
//                     audio.removeEventListener(
//                       "loadedmetadata",
//                       onLoaded
//                     );

//                     resolve();
//                   };

//                 audio.addEventListener(
//                   "loadedmetadata",
//                   onLoaded
//                 );
//               }
//             );
//           }

//           // ----------------------------------------------------
//           // AUDIO CONFIG
//           // ----------------------------------------------------

//           audio.volume = 1;

//           audio.muted = false;

//           // ----------------------------------------------------
//           // PLAY
//           // ----------------------------------------------------

//           console.log(
//             "▶️ [NativeAudio] Calling play()"
//           );

//           await audio.play();

//           console.log(
//             "✅ [NativeAudio] play() resolved:",
//             {
//               paused:
//                 audio.paused,

//               currentTime:
//                 audio.currentTime,

//               duration:
//                 audio.duration,

//               volume:
//                 audio.volume,

//               muted:
//                 audio.muted,

//               readyState:
//                 audio.readyState,

//               error:
//                 audio.error,
//             }
//           );

//           setIsPlaying(
//             true
//           );
//         } catch (error) {
//           console.error(
//             "❌ [NativeAudio] PLAY FAILED:",
//             error
//           );

//           console.error(
//             "❌ [NativeAudio] Audio element:",
//             {
//               src:
//                 audio.src,

//               paused:
//                 audio.paused,

//               currentTime:
//                 audio.currentTime,

//               duration:
//                 audio.duration,

//               volume:
//                 audio.volume,

//               muted:
//                 audio.muted,

//               readyState:
//                 audio.readyState,

//               networkState:
//                 audio.networkState,

//               error:
//                 audio.error,
//             }
//           );

//           setIsPlaying(
//             false
//           );

//           toast.error(
//             "Unable to play recording."
//           );
//         }
//       };

//     // ==========================================================
//     // CANCEL PREVIEW
//     // ==========================================================

//     const cancelPreview =
//       () => {
//         console.log(
//           "🧹 [Preview] CANCEL"
//         );

//         // ------------------------------------------------------
//         // STOP AUDIO
//         // ------------------------------------------------------

//         const audio =
//           audioRef.current;

//         if (audio) {
//           try {
//             audio.pause();

//             audio.currentTime = 0;

//             audio.removeAttribute(
//               "src"
//             );

//             audio.load();
//           } catch (error) {
//             console.error(
//               "❌ [NativeAudio] Cleanup error:",
//               error
//             );
//           }
//         }

//         // ------------------------------------------------------
//         // DESTROY WAVESURFER
//         // ------------------------------------------------------

//         if (
//           waveSurferRef.current
//         ) {
//           try {
//             waveSurferRef.current.destroy();
//           } catch { }

//           waveSurferRef.current =
//             null;
//         }

//         // ------------------------------------------------------
//         // REVOKE URL
//         // ------------------------------------------------------

//         if (previewUrl) {
//           console.log(
//             "🧹 [Preview] Revoking:",
//             previewUrl
//           );

//           URL.revokeObjectURL(
//             previewUrl
//           );
//         }

//         // ------------------------------------------------------
//         // RESET
//         // ------------------------------------------------------

//         setAudioBlob(
//           null
//         );

//         setPreviewUrl(
//           null
//         );

//         setIsPreviewing(
//           false
//         );

//         setIsPlaying(
//           false
//         );

//         setPlaybackCurrentTime(
//           0
//         );

//         setPlaybackDuration(
//           0
//         );

//         setRecordingDuration(
//           0
//         );

//         setWaveReady(
//           false
//         );

//         audioChunksRef.current =
//           [];
//       };

//     // ==========================================================
//     // SEND RECORDING
//     // ==========================================================

//     const sendRecording =
//       () => {
//         console.log(
//           "📤 [Voice] SEND requested"
//         );

//         if (!audioBlob) {
//           console.error(
//             "❌ [Voice] No audio blob"
//           );

//           toast.error(
//             "No recording available."
//           );

//           return;
//         }

//         if (!conversationId) {
//           console.error(
//             "❌ [Voice] No conversation ID"
//           );

//           toast.error(
//             "Conversation not found."
//           );

//           return;
//         }

//         if (
//           !otherUser?.user?.id
//         ) {
//           console.error(
//             "❌ [Voice] Receiver not found"
//           );

//           toast.error(
//             "Receiver not found."
//           );

//           return;
//         }

//         console.log(
//           "📤 [Voice] Preparing upload:",
//           {
//             blobSize:
//               audioBlob.size,

//             blobType:
//               audioBlob.type,

//             conversationId,

//             receiverId:
//               otherUser.user.id,
//           }
//         );

//         const file =
//           new File(
//             [audioBlob],
//             "voice-note.webm",
//             {
//               type:
//                 audioBlob.type ||
//                 "audio/webm",
//             }
//           );

//         console.log(
//           "📤 [Voice] FILE:",
//           {
//             name:
//               file.name,

//             size:
//               file.size,

//             type:
//               file.type,
//           }
//         );

//         sendVoice(
//           {
//             file,
//             conversationId,
//           },
//           {
//             onSuccess:
//               (res) => {
//                 console.log(
//                   "✅ [Voice] Upload SUCCESS:",
//                   res
//                 );

//                 const socket =
//                   getSocket();

//                 console.log(
//                   "🔌 [Socket] Sending voice:",
//                   {
//                     conversationId,

//                     type:
//                       "VOICE",

//                     receiverId:
//                       otherUser.user.id,

//                     mediaUrl:
//                       res.mediaUrl,

//                     duration:
//                       res.duration,
//                   }
//                 );

//                 socket.emit(
//                   "send_message",
//                   {
//                     conversationId,

//                     type:
//                       "VOICE",

//                     receiverId:
//                       otherUser.user.id,

//                     mediaUrl:
//                       res.mediaUrl,

//                     duration:
//                       res.duration,
//                   }
//                 );

//                 console.log(
//                   "✅ [Socket] Voice emitted"
//                 );

//                 cancelPreview();
//               },

//             onError:
//               (error: any) => {
//                 console.error(
//                   "❌ [Voice] Upload FAILED:",
//                   error
//                 );

//                 toast.error(
//                   "Upload failed: " +
//                   (
//                     error?.message ||
//                     "Unknown error"
//                   )
//                 );
//               },
//           }
//         );
//       };

//     // ==========================================================
//     // GLOBAL CLEANUP
//     // ==========================================================

//     useEffect(() => {
//       return () => {
//         console.log(
//           "🧹 [VoiceRecorder] UNMOUNT CLEANUP"
//         );

//         // ------------------------------------------------------
//         // STOP RECORDING TIMER
//         // ------------------------------------------------------

//         stopRecordingTimer();

//         recordingStartTimeRef.current =
//           null;

//         // ------------------------------------------------------
//         // STOP MEDIA RECORDER
//         // ------------------------------------------------------

//         const recorder =
//           mediaRecorderRef.current;

//         if (
//           recorder &&
//           recorder.state ===
//           "recording"
//         ) {
//           try {
//             recorder.stop();
//           } catch { }
//         }

//         // ------------------------------------------------------
//         // STOP MIC MONITOR
//         // ------------------------------------------------------

//         stopMicMonitor();

//         // ------------------------------------------------------
//         // STOP MICROPHONE
//         // ------------------------------------------------------

//         mediaStreamRef.current
//           ?.getTracks()
//           .forEach(
//             (track) =>
//               track.stop()
//           );

//         mediaStreamRef.current =
//           null;

//         // ------------------------------------------------------
//         // STOP AUDIO
//         // ------------------------------------------------------

//         if (
//           audioRef.current
//         ) {
//           try {
//             audioRef.current.pause();
//           } catch { }
//         }

//         // ------------------------------------------------------
//         // DESTROY WAVESURFER
//         // ------------------------------------------------------

//         if (
//           waveSurferRef.current
//         ) {
//           try {
//             waveSurferRef.current.destroy();
//           } catch { }

//           waveSurferRef.current =
//             null;
//         }

//         // ------------------------------------------------------
//         // REVOKE URL
//         // ------------------------------------------------------

//         if (previewUrl) {
//           URL.revokeObjectURL(
//             previewUrl
//           );
//         }
//       };
//     }, [previewUrl]);

//     // ==========================================================
//     // DERIVED PLAYBACK VALUES
//     // ==========================================================

//     const hasPlaybackDuration =
//       Number.isFinite(
//         playbackDuration
//       ) &&
//       playbackDuration > 0;

//     const playbackPercentage =
//       hasPlaybackDuration
//         ? Math.min(
//           100,
//           Math.max(
//             0,
//             (playbackCurrentTime /
//               playbackDuration) *
//             100
//           )
//         )
//         : 0;

//     // ==========================================================
//     // RENDER
//     // ==========================================================

//     return (
//       <Box
//         sx={{
//           width: "100%",
//           minWidth: 0,
//           display: "flex",
//           alignItems: "center",
//         }}
//       >
//         {/* ====================================================
//             RECORDING UI
//         ==================================================== */}

//         {isRecording && !isPreviewing && (
//           <Box
//             sx={{
//               width: "100%",
//               minWidth: 0,
//               display: "flex",
//               alignItems: "center",
//               gap: {
//                 xs: 1,
//                 sm: 1.5,
//               },
//               px: {
//                 xs: 1,
//                 sm: 1.5,
//               },
//               py: {
//                 xs: 0.75,
//                 sm: 1,
//               },
//               borderRadius: "18px",
//               background:
//                 "linear-gradient(135deg, rgba(255,179,0,0.10), rgba(255,179,0,0.04))",
//               border:
//                 "1px solid rgba(255,179,0,0.20)",
//               boxShadow:
//                 "0 8px 30px rgba(0,0,0,0.06)",
//               overflow: "hidden",
//             }}
//           >
//             {/* Recording indicator */}

//             <Box
//               sx={{
//                 width: {
//                   xs: 38,
//                   sm: 42,
//                 },
//                 height: {
//                   xs: 38,
//                   sm: 42,
//                 },
//                 flexShrink: 0,
//                 borderRadius: "50%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 position: "relative",
//                 bgcolor:
//                   "rgba(255,179,0,0.13)",
//               }}
//             >
//               <Box
//                 sx={{
//                   width: 9,
//                   height: 9,
//                   borderRadius: "50%",
//                   bgcolor:
//                     "error.main",
//                   animation:
//                     "voiceRecorderPulse 1.2s ease-in-out infinite",
//                   "@keyframes voiceRecorderPulse":
//                   {
//                     "0%": {
//                       transform:
//                         "scale(1)",
//                       opacity: 1,
//                     },
//                     "50%": {
//                       transform:
//                         "scale(1.45)",
//                       opacity: 0.55,
//                     },
//                     "100%": {
//                       transform:
//                         "scale(1)",
//                       opacity: 1,
//                     },
//                   },
//                 }}
//               />
//             </Box>

//             {/* Live waveform */}

//             <Box
//               sx={{
//                 flex: 1,
//                 minWidth: 0,
//                 height: {
//                   xs: 42,
//                   sm: 48,
//                 },
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: {
//                   xs: "2px",
//                   sm: "3px",
//                 },
//                 overflow: "hidden",
//               }}
//             >
//               {liveBars.map(
//                 (
//                   height,
//                   index
//                 ) => (
//                   <Box
//                     key={index}
//                     sx={{
//                       width: {
//                         xs: 2.5,
//                         sm: 3,
//                       },
//                       minWidth: {
//                         xs: 2.5,
//                         sm: 3,
//                       },
//                       height: `${Math.max(
//                         8,
//                         height
//                       )}%`,
//                       borderRadius: 10,
//                       bgcolor:
//                         "primary.main",
//                       opacity:
//                         0.45 +
//                         (height /
//                           100) *
//                         0.55,
//                       transition:
//                         "height 100ms ease, opacity 100ms ease",
//                       boxShadow:
//                         "0 0 8px rgba(255,179,0,0.16)",
//                     }}
//                   />
//                 )
//               )}
//             </Box>

//             {/* Duration */}

//             <Box
//               sx={{
//                 flexShrink: 0,
//                 minWidth: {
//                   xs: 40,
//                   sm: 48,
//                 },
//                 textAlign: "center",
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontSize: {
//                     xs: 12,
//                     sm: 13,
//                   },
//                   fontWeight: 700,
//                   fontVariantNumeric:
//                     "tabular-nums",
//                   color:
//                     "text.primary",
//                   letterSpacing:
//                     "0.02em",
//                 }}
//               >
//                 {formatDuration(
//                   recordingDuration
//                 )}
//               </Typography>

//               <Typography
//                 sx={{
//                   fontSize: 9,
//                   fontWeight: 600,
//                   color:
//                     "text.secondary",
//                   textTransform:
//                     "uppercase",
//                   letterSpacing:
//                     "0.08em",
//                   mt: 0.1,
//                 }}
//               >
//                 Recording
//               </Typography>
//             </Box>

//             {/* Stop */}

//             <IconButton
//               onClick={
//                 stopRecording
//               }
//               aria-label="Stop recording"
//               sx={{
//                 width: {
//                   xs: 40,
//                   sm: 44,
//                 },
//                 height: {
//                   xs: 40,
//                   sm: 44,
//                 },
//                 flexShrink: 0,
//                 color: "#fff",
//                 bgcolor:
//                   "error.main",
//                 boxShadow:
//                   "0 6px 18px rgba(211,47,47,0.25)",
//                 "&:hover": {
//                   bgcolor:
//                     "error.dark",
//                   transform:
//                     "translateY(-1px)",
//                 },
//                 transition:
//                   "all 0.2s ease",
//               }}
//             >
//               <Square
//                 size={16}
//                 fill="currentColor"
//               />
//             </IconButton>
//           </Box>
//         )}

//         {/* ====================================================
//             PREVIEW UI
//         ==================================================== */}

//         {isPreviewing && (
//           <Box
//             sx={{
//               width: "100%",
//               minWidth: 0,
//               display: "flex",
//               alignItems: "center",
//               gap: {
//                 xs: 0.75,
//                 sm: 1,
//               },
//               px: {
//                 xs: 0.75,
//                 sm: 1,
//               },
//               py: {
//                 xs: 0.75,
//                 sm: 1,
//               },
//               borderRadius: "20px",
//               background:
//               mode === 'light' ? (theme) => theme.palette.chat.sender : "rgba(211,47,47,0.25)",
//               // "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,248,248,0.98))",
//               border:
//                 "1px solid rgba(0,0,0,0.08)",
//               boxShadow:
//                 "0 8px 30px rgba(0,0,0,0.07)",
//               overflow: "hidden",
//             }}
//           >
//             {/* Play / Pause */}

//             <IconButton
//               onClick={
//                 togglePlay
//               }
//               disabled={
//                 !previewUrl
//               }
//               aria-label={
//                 isPlaying
//                   ? "Pause recording"
//                   : "Play recording"
//               }
//               sx={{
//                 width: {
//                   xs: 40,
//                   sm: 44,
//                 },
//                 height: {
//                   xs: 40,
//                   sm: 44,
//                 },
//                 flexShrink: 0,
//                 color: "#fff",
//                 bgcolor:
//                   "primary.main",
//                 boxShadow:
//                   "0 6px 18px rgba(255,179,0,0.28)",
//                 "&:hover": {
//                   bgcolor:
//                     "primary.dark",
//                   transform:
//                     "translateY(-1px)",
//                 },
//                 "&:disabled": {
//                   bgcolor:
//                     "action.disabledBackground",
//                 },
//                 transition:
//                   "all 0.2s ease",
//               }}
//             >
//               {isPlaying ? (
//                 <Pause
//                   size={18}
//                   fill="currentColor"
//                 />
//               ) : (
//                 <Play
//                   size={18}
//                   fill="currentColor"
//                 />
//               )}
//             </IconButton>

//             {/* Waveform area */}

//             <Box
//               sx={{
//                 flex: 1,
//                 minWidth: 0,
//                 position: "relative",
//                 overflow: "hidden",
//                 py: 0.2,
//               }}
//             >
//               {/* Waveform */}

//               <Box
//                 ref={waveRef}
//                 sx={{
//                   width: "100%",
//                   height: {
//                     xs: 48,
//                     sm: 52,
//                   },
//                   minWidth: 0,
//                   opacity:
//                     waveReady
//                       ? 1
//                       : 0.35,
//                   transition:
//                     "opacity 0.25s ease",

//                   "& wave": {
//                     overflow:
//                       "hidden !important",
//                   },
//                 }}
//               />

//               {/* Subtle playback glow */}

//               {isPlaying && (
//                 <Box
//                   sx={{
//                     position:
//                       "absolute",
//                     left: `${Math.min(
//                       100,
//                       playbackPercentage
//                     )}%`,
//                     top: 7,
//                     bottom: 7,
//                     width: 2,
//                     borderRadius: 2,
//                     bgcolor:
//                       "primary.main",
//                     boxShadow:
//                       "0 0 12px rgba(255,179,0,0.75)",
//                     transform:
//                       "translateX(-1px)",
//                     pointerEvents:
//                       "none",
//                     transition:
//                       "left 80ms linear",
//                     opacity: 0.9,
//                   }}
//                 />
//               )}

//               {/* Loading state */}

//               {!waveReady && (
//                 <Box
//                   sx={{
//                     position:
//                       "absolute",
//                     inset: 0,
//                     display:
//                       "flex",
//                     alignItems:
//                       "center",
//                     pointerEvents:
//                       "none",
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display:
//                         "flex",
//                       alignItems:
//                         "center",
//                       gap: 0.6,
//                       px: 1,
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         width: 5,
//                         height: 5,
//                         borderRadius:
//                           "50%",
//                         bgcolor:
//                           "primary.main",
//                         animation:
//                           "voiceWaveDot 1s infinite ease-in-out",
//                         "@keyframes voiceWaveDot":
//                         {
//                           "0%, 100%":
//                           {
//                             opacity:
//                               0.3,
//                           },
//                           "50%": {
//                             opacity: 1,
//                           },
//                         },
//                       }}
//                     />

//                     <Typography
//                       sx={{
//                         fontSize: 11,
//                         color:
//                           "text.secondary",
//                       }}
//                     >
//                       Preparing voice note…
//                     </Typography>
//                   </Box>
//                 </Box>
//               )}

//               {/* Playback time */}

//               <Box
//                 sx={{
//                   position:
//                     "absolute",
//                   right: 0,
//                   bottom: -1,
//                   px: 0.5,
//                   borderRadius: 1,
//                   bgcolor:
//                     "rgba(255,255,255,0.88)",
//                   backdropFilter:
//                     "blur(4px)",
//                 }}
//               >
//                 <Typography
//                   sx={{
//                     fontSize: {
//                       xs: 10,
//                       sm: 11,
//                     },
//                     fontWeight: 700,
//                     color:
//                       "text.secondary",
//                     fontVariantNumeric:
//                       "tabular-nums",
//                     whiteSpace:
//                       "nowrap",
//                   }}
//                 >
//                   {formatDuration(
//                     playbackCurrentTime
//                   )}
//                   {hasPlaybackDuration
//                     ? ` / ${formatDuration(
//                       playbackDuration
//                     )}`
//                     : ""}
//                 </Typography>
//               </Box>
//             </Box>

//             {/* Controls */}

//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems:
//                   "center",
//                 gap: {
//                   xs: 0.25,
//                   sm: 0.5,
//                 },
//                 flexShrink: 0,
//               }}
//             >
//               {/* Send */}

//               <IconButton
//                 onClick={
//                   sendRecording
//                 }
//                 disabled={
//                   isPending ||
//                   !audioBlob
//                 }
//                 aria-label="Send voice note"
//                 sx={{
//                   width: {
//                     xs: 38,
//                     sm: 42,
//                   },
//                   height: {
//                     xs: 38,
//                     sm: 42,
//                   },
//                   color:
//                     "success.main",
//                   bgcolor:mode === "light" ? (theme) => theme.palette.background.paper : "Blue",
//                     // "rgba(46,125,50,0.08)",
//                     // "red",
//                   "&:hover": {
//                     bgcolor:
//                       (theme) => theme.palette.error.light,
//                       // "rgba(46,125,50,0.14)",
//                     transform:
//                       "translateY(-1px)",
//                   },
//                   "&:disabled": {
//                     bgcolor:
//                       "action.disabledBackground",
//                   },
//                   transition:
//                     "all 0.2s ease",
//                 }}
//               >
//                 {isPending ? (
//                   <CircularProgress
//                     size={18}
//                     color="inherit"
//                   />
//                 ) : (
//                   <Send
//                     size={17}
//                     strokeWidth={
//                       2.3
//                     }
//                   />
//                 )}
//               </IconButton>

//               {/* Cancel */}

//               <IconButton
//                 onClick={
//                   cancelPreview
//                 }
//                 disabled={
//                   isPending
//                 }
//                 aria-label="Cancel voice note"
//                 sx={{
//                   width: {
//                     xs: 38,
//                     sm: 42,
//                   },
//                   height: {
//                     xs: 38,
//                     sm: 42,
//                   },
//                   color:
//                     "text.secondary",
//                   bgcolor:
//                     "rgba(0,0,0,0.04)",
//                   "&:hover": {
//                     color:
//                       "error.main",
//                     bgcolor:
//                       "rgba(211,47,47,0.08)",
//                     transform:
//                       "translateY(-1px)",
//                   },
//                   transition:
//                     "all 0.2s ease",
//                 }}
//               >
//                 <X
//                   size={18}
//                   strokeWidth={
//                     2.2
//                   }
//                 />
//               </IconButton>
//             </Box>

//             {/* Actual audio player */}

//             <audio
//               ref={audioRef}
//               src={
//                 previewUrl ??
//                 undefined
//               }
//               preload="auto"
//               playsInline
//               controls={false}
//               style={{
//                 display: "none",
//               }}
//             />
//           </Box>
//         )}

//         {/* ====================================================
//             IDLE STATE
//         ==================================================== */}

//         {!isRecording &&
//           !isPreviewing && (
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent:
//                   "center",
//                 width: "100%",
//                 minHeight: 8,
//               }}
//             >
//               {/*

//                 The parent component can continue controlling
//                 this recorder through:

//                     ref.current?.startRecording()

//                 and:

//                     ref.current?.stopRecording()

//                 No recording logic has been moved here.

//               */}

//               <Mic
//                 size={0}
//                 style={{
//                   display: "none",
//                 }}
//               />
//             </Box>
//           )}
//       </Box>
//     );
//   }
// );

// // ============================================================
// // DISPLAY NAME
// // ============================================================

// VoiceRecorder.displayName =
//   "VoiceRecorder";

// export default VoiceRecorder;

"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import {
  Box,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";

import { alpha, useTheme } from "@mui/material/styles";

import {
  Play,
  Pause,
  Send,
  X,
  Mic,
  Square,
} from "lucide-react";

import WaveSurfer from "wavesurfer.js";

import { useCurrentUser } from "@/react-query/query-hooks";
import { useSendVoice } from "@/react-query/chat-hook";
import { getSocket } from "@/lib/socket";

import toast from "react-hot-toast";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// ============================================================
// TYPES
// ============================================================

type Props = {
  conversationId?: string;
};

export type VoiceRecorderHandle = {
  startRecording: () => void;
  stopRecording: () => void;
};

// ============================================================
// HELPERS
// ============================================================

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const safeSeconds = Math.floor(seconds);

  const minutes = Math.floor(safeSeconds / 60);

  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// ============================================================
// COMPONENT
// ============================================================

const VoiceRecorder = forwardRef<VoiceRecorderHandle, Props>(
  ({ conversationId }, ref) => {
    // ==========================================================
    // THEME
    // ==========================================================

    const theme = useTheme();

    const mode = theme.palette.mode;

    // ==========================================================
    // STATE
    // ==========================================================

    const [isRecording, setIsRecording] =
      useState(false);

    const [isPreviewing, setIsPreviewing] =
      useState(false);

    const [isPlaying, setIsPlaying] =
      useState(false);

    const [audioBlob, setAudioBlob] =
      useState<Blob | null>(null);

    const [previewUrl, setPreviewUrl] =
      useState<string | null>(null);

    // ==========================================================
    // LIVE RECORDING WAVEFORM
    // ==========================================================

    const [liveBars, setLiveBars] =
      useState<number[]>(
        new Array(32).fill(8)
      );

    // ==========================================================
    // PLAYBACK / DURATION STATE
    // ==========================================================

    const [recordingDuration, setRecordingDuration] =
      useState(0);

    const [playbackDuration, setPlaybackDuration] =
      useState(0);

    const [playbackCurrentTime, setPlaybackCurrentTime] =
      useState(0);

    const [waveReady, setWaveReady] =
      useState(false);

    // ==========================================================
    // REFS
    // ==========================================================

    const mediaRecorderRef =
      useRef<MediaRecorder | null>(null);

    const mediaStreamRef =
      useRef<MediaStream | null>(null);

    const audioChunksRef =
      useRef<Blob[]>([]);

    const waveRef =
      useRef<HTMLDivElement | null>(null);

    const waveSurferRef =
      useRef<WaveSurfer | null>(null);

    const audioRef =
      useRef<HTMLAudioElement | null>(null);

    // ==========================================================
    // RECORDING TIMER
    // ==========================================================

    const recordingStartTimeRef =
      useRef<number | null>(null);

    const recordingTimerRef =
      useRef<ReturnType<typeof setInterval> | null>(null);

    // ==========================================================
    // MICROPHONE MONITOR
    // ==========================================================

    const audioContextRef =
      useRef<AudioContext | null>(null);

    const analyserRef =
      useRef<AnalyserNode | null>(null);

    const microphoneSourceRef =
      useRef<MediaStreamAudioSourceNode | null>(null);

    const micAnimationFrameRef =
      useRef<number | null>(null);

    // ==========================================================
    // REACT QUERY
    // ==========================================================

    const { data: currentUser } =
      useCurrentUser();

    const {
      mutate: sendVoice,
      isPending,
    } = useSendVoice();

    // ==========================================================
    // REDUX
    // ==========================================================

    const selectedChat =
      useSelector(
        (state: RootState) =>
          state.chatReducer.selectedChat
      );

    // ==========================================================
    // OTHER USER
    // ==========================================================

    const otherUser =
      selectedChat?.participants?.find(
        (participant) =>
          participant.user.id !==
          currentUser?.id
      );

    // ==========================================================
    // DEBUG STATE
    // ==========================================================

    useEffect(() => {
      console.log(
        "🎤 [VoiceRecorder] STATE:",
        {
          isRecording,
          isPreviewing,
          isPlaying,
          hasAudioBlob: !!audioBlob,
          audioBlobSize:
            audioBlob?.size,
          audioBlobType:
            audioBlob?.type,
          previewUrl,
          conversationId,
          currentUserId:
            currentUser?.id,
          selectedChatId:
            selectedChat?.id,
          receiverId:
            otherUser?.user.id,
          recordingDuration,
          playbackCurrentTime,
          playbackDuration,
        }
      );
    }, [
      isRecording,
      isPreviewing,
      isPlaying,
      audioBlob,
      previewUrl,
      conversationId,
      currentUser,
      selectedChat,
      otherUser,
      recordingDuration,
      playbackCurrentTime,
      playbackDuration,
    ]);

    // ==========================================================
    // OTHER USER DEBUG
    // ==========================================================

    useEffect(() => {
      console.log(
        "👤 [VoiceRecorder] OTHER USER:",
        otherUser
      );
    }, [otherUser]);

    // ==========================================================
    // RECORDING TIMER
    // ==========================================================

    const stopRecordingTimer = () => {
      if (recordingTimerRef.current) {
        clearInterval(
          recordingTimerRef.current
        );

        recordingTimerRef.current = null;
      }
    };

    const startRecordingTimer = () => {
      stopRecordingTimer();

      recordingStartTimeRef.current =
        Date.now();

      setRecordingDuration(0);

      recordingTimerRef.current =
        setInterval(() => {
          if (
            !recordingStartTimeRef.current
          ) {
            return;
          }

          const elapsed =
            (Date.now() -
              recordingStartTimeRef.current) /
            1000;

          setRecordingDuration(
            elapsed
          );
        }, 250);
    };

    // ==========================================================
    // RESET LIVE WAVEFORM
    // ==========================================================

    const resetLiveBars = () => {
      setLiveBars(
        new Array(32).fill(8)
      );
    };

    // ==========================================================
    // CLEAN MICROPHONE MONITOR
    // ==========================================================

    const stopMicMonitor = () => {
      console.log(
        "🧹 [MicMonitor] Stopping monitor"
      );

      if (
        micAnimationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          micAnimationFrameRef.current
        );

        micAnimationFrameRef.current =
          null;
      }

      if (
        microphoneSourceRef.current
      ) {
        try {
          microphoneSourceRef.current.disconnect();
        } catch {}

        microphoneSourceRef.current =
          null;
      }

      if (
        audioContextRef.current
      ) {
        try {
          audioContextRef.current.close();
        } catch {}

        audioContextRef.current =
          null;
      }

      analyserRef.current =
        null;

      resetLiveBars();
    };

    // ==========================================================
    // DEEP MICROPHONE DIAGNOSTICS
    // ==========================================================

    const diagnoseMicrophone =
      async (
        stream: MediaStream
      ) => {
        console.log(
          "════════════════════════════════════"
        );

        console.log(
          "🔎 [MIC DIAGNOSTICS] START"
        );

        console.log(
          "════════════════════════════════════"
        );

        try {
          // ----------------------------------------------------
          // BROWSER
          // ----------------------------------------------------

          console.log(
            "🌐 Browser:",
            {
              userAgent:
                navigator.userAgent,
              platform:
                navigator.platform,
              online:
                navigator.onLine,
            }
          );

          // ----------------------------------------------------
          // MEDIA DEVICES
          // ----------------------------------------------------

          console.log(
            "🎤 [MIC DIAGNOSTICS] Enumerating devices..."
          );

          const devices =
            await navigator.mediaDevices.enumerateDevices();

          console.table(
            devices.map(
              (device) => ({
                kind:
                  device.kind,
                deviceId:
                  device.deviceId
                    ? device.deviceId.slice(
                        0,
                        12
                      ) + "..."
                    : "",
                groupId:
                  device.groupId
                    ? device.groupId.slice(
                        0,
                        12
                      ) + "..."
                    : "",
                label:
                  device.label ||
                  "(NO LABEL)",
              })
            )
          );

          const microphones =
            devices.filter(
              (device) =>
                device.kind ===
                "audioinput"
            );

          console.log(
            "🎤 [MIC DIAGNOSTICS] Microphone count:",
            microphones.length
          );

          // ----------------------------------------------------
          // TRACK
          // ----------------------------------------------------

          const track =
            stream.getAudioTracks()[0];

          if (!track) {
            console.error(
              "❌ [MIC DIAGNOSTICS] NO AUDIO TRACK"
            );

            return;
          }

          console.log(
            "🎤 [MIC DIAGNOSTICS] TRACK:",
            {
              id: track.id,
              label:
                track.label,
              kind:
                track.kind,
              enabled:
                track.enabled,
              muted:
                track.muted,
              readyState:
                track.readyState,
              contentHint:
                track.contentHint,
            }
          );

          // ----------------------------------------------------
          // TRACK SETTINGS
          // ----------------------------------------------------

          console.log(
            "⚙️ [MIC DIAGNOSTICS] SETTINGS:",
            track.getSettings()
          );

          // ----------------------------------------------------
          // TRACK CONSTRAINTS
          // ----------------------------------------------------

          console.log(
            "⚙️ [MIC DIAGNOSTICS] CONSTRAINTS:",
            track.getConstraints()
          );

          // ----------------------------------------------------
          // TRACK CAPABILITIES
          // ----------------------------------------------------

          if (
            typeof track.getCapabilities ===
            "function"
          ) {
            console.log(
              "⚙️ [MIC DIAGNOSTICS] CAPABILITIES:",
              track.getCapabilities()
            );
          }

          // ----------------------------------------------------
          // TRACK EVENTS
          // ----------------------------------------------------

          track.onmute = () => {
            console.error(
              "🔇 [MIC DIAGNOSTICS] TRACK MUTED EVENT"
            );
          };

          track.onunmute = () => {
            console.log(
              "🔊 [MIC DIAGNOSTICS] TRACK UNMUTED EVENT"
            );
          };

          track.onended = () => {
            console.error(
              "🛑 [MIC DIAGNOSTICS] TRACK ENDED EVENT"
            );
          };

          // ----------------------------------------------------
          // GLOBAL MEDIA SUPPORT
          // ----------------------------------------------------

          console.log(
            "🧩 [MIC DIAGNOSTICS] Supported constraints:",
            navigator.mediaDevices.getSupportedConstraints()
          );

          // ----------------------------------------------------
          // AUDIO CONTEXT
          // ----------------------------------------------------

          const AudioContextClass =
            window.AudioContext ||
            (
              window as typeof window & {
                webkitAudioContext?: typeof AudioContext;
              }
            ).webkitAudioContext;

          if (!AudioContextClass) {
            console.error(
              "❌ [MIC DIAGNOSTICS] AudioContext unavailable"
            );

            return;
          }

          const context =
            new AudioContextClass();

          console.log(
            "🎵 [MIC DIAGNOSTICS] AudioContext:",
            {
              state:
                context.state,
              sampleRate:
                context.sampleRate,
              baseLatency:
                context.baseLatency,
              outputLatency:
                "outputLatency" in
                context
                  ? (
                      context as AudioContext & {
                        outputLatency?: number;
                      }
                    )
                      .outputLatency
                  : undefined,
            }
          );

          if (
            context.state ===
            "suspended"
          ) {
            await context.resume();
          }

          const source =
            context.createMediaStreamSource(
              stream
            );

          const analyser =
            context.createAnalyser();

          analyser.fftSize =
            2048;

          analyser.smoothingTimeConstant =
            0;

          source.connect(
            analyser
          );

          const data =
            new Float32Array(
              analyser.fftSize
            );

          // ----------------------------------------------------
          // SAMPLE MICROPHONE
          // ----------------------------------------------------

          console.log(
            "🎧 [MIC DIAGNOSTICS] Sampling microphone for 3 seconds..."
          );

          let maxRms = 0;

          let maxPeak = 0;

          let samples = 0;

          const start =
            performance.now();

          await new Promise<void>(
            (resolve) => {
              const interval =
                setInterval(
                  () => {
                    analyser.getFloatTimeDomainData(
                      data
                    );

                    let sum =
                      0;

                    let peak =
                      0;

                    for (
                      let i = 0;
                      i <
                      data.length;
                      i++
                    ) {
                      const value =
                        data[i];

                      sum +=
                        value *
                        value;

                      peak =
                        Math.max(
                          peak,
                          Math.abs(
                            value
                          )
                        );
                    }

                    const rms =
                      Math.sqrt(
                        sum /
                          data.length
                      );

                    maxRms =
                      Math.max(
                        maxRms,
                        rms
                      );

                    maxPeak =
                      Math.max(
                        maxPeak,
                        peak
                      );

                    samples++;

                    console.log(
                      "🎙️ [MIC SIGNAL]",
                      {
                        rms,
                        peak,
                        trackMuted:
                          track.muted,
                        trackEnabled:
                          track.enabled,
                        readyState:
                          track.readyState,
                      }
                    );

                    if (
                      performance.now() -
                        start >=
                      3000
                    ) {
                      clearInterval(
                        interval
                      );

                      resolve();
                    }
                  },
                  250
                );
            }
          );

          source.disconnect();

          analyser.disconnect();

          await context.close();

          console.log(
            "════════════════════════════════════"
          );

          console.log(
            "🏁 [MIC DIAGNOSTICS] RESULT:",
            {
              samples,
              maxRms,
              maxPeak,
              trackMuted:
                track.muted,
              trackEnabled:
                track.enabled,
              readyState:
                track.readyState,
            }
          );

          if (
            maxRms === 0 &&
            maxPeak === 0
          ) {
            console.error(
              "🚨🚨🚨 [MIC DIAGNOSTICS] ZERO MICROPHONE SIGNAL 🚨🚨🚨"
            );

            console.error(
              "The browser has a microphone track, but NO AUDIO DATA is reaching the Web Audio API."
            );
          } else {
            console.log(
              "✅ [MIC DIAGNOSTICS] REAL MICROPHONE SIGNAL DETECTED"
            );
          }

          console.log(
            "════════════════════════════════════"
          );
        } catch (error) {
          console.error(
            "❌ [MIC DIAGNOSTICS] FAILED:",
            error
          );
        }
      };

    // ==========================================================
    // START MICROPHONE MONITOR
    // ==========================================================

    const startMicMonitor =
      async (
        stream: MediaStream
      ) => {
        try {
          console.log(
            "🎤 [MicMonitor] Creating AudioContext"
          );

          const AudioContextClass =
            window.AudioContext ||
            (
              window as typeof window & {
                webkitAudioContext?: typeof AudioContext;
              }
            ).webkitAudioContext;

          if (!AudioContextClass) {
            console.warn(
              "⚠️ [MicMonitor] AudioContext not supported"
            );

            return;
          }

          const audioContext =
            new AudioContextClass();

          if (
            audioContext.state ===
            "suspended"
          ) {
            await audioContext.resume();
          }

          const analyser =
            audioContext.createAnalyser();

          /*
           * Higher FFT size gives us enough
           * microphone samples to create
           * smooth waveform bars.
           */
          analyser.fftSize =
            2048;

          /*
           * We want the live waveform to
           * respond quickly to the voice.
           */
          analyser.smoothingTimeConstant =
            0.65;

          const microphone =
            audioContext.createMediaStreamSource(
              stream
            );

          microphone.connect(
            analyser
          );

          audioContextRef.current =
            audioContext;

          analyserRef.current =
            analyser;

          microphoneSourceRef.current =
            microphone;

          const dataArray =
            new Uint8Array(
              analyser.fftSize
            );

          console.log(
            "✅ [MicMonitor] Monitor started"
          );

          // ====================================================
          // REAL-TIME WAVEFORM ANIMATION
          // ====================================================

          const animate =
            () => {
              if (
                !analyserRef.current ||
                !audioContextRef.current
              ) {
                return;
              }

              analyserRef.current.getByteTimeDomainData(
                dataArray
              );

              const barsCount =
                32;

              const samplesPerBar =
                Math.floor(
                  dataArray.length /
                    barsCount
                );

              const nextBars =
                new Array(
                  barsCount
                ).fill(8);

              for (
                let bar = 0;
                bar < barsCount;
                bar++
              ) {
                const start =
                  bar *
                  samplesPerBar;

                const end =
                  Math.min(
                    start +
                      samplesPerBar,
                    dataArray.length
                  );

                let sum = 0;

                let peak = 0;

                for (
                  let i = start;
                  i < end;
                  i++
                ) {
                  const normalized =
                    (dataArray[i] -
                      128) /
                    128;

                  sum +=
                    normalized *
                    normalized;

                  peak =
                    Math.max(
                      peak,
                      Math.abs(
                        normalized
                      )
                    );
                }

                const count =
                  Math.max(
                    1,
                    end - start
                  );

                const rms =
                  Math.sqrt(
                    sum / count
                  );

                /*
                 * Combine RMS and peak so
                 * quiet speech still produces
                 * visible movement while louder
                 * speech creates taller bars.
                 */
                const strength =
                  Math.min(
                    1,
                    rms * 5 +
                      peak * 0.45
                  );

                const variation =
                  Math.sin(
                    bar * 0.8 +
                      performance.now() /
                        180
                  ) *
                  0.12;

                const height =
                  Math.min(
                    100,
                    Math.max(
                      10,
                      12 +
                        strength *
                          78 +
                        variation *
                          25
                    )
                  );

                nextBars[bar] =
                  height;
              }

              setLiveBars(
                nextBars
              );

              micAnimationFrameRef.current =
                requestAnimationFrame(
                  animate
                );
            };

          animate();
        } catch (error) {
          console.error(
            "❌ [MicMonitor] Failed:",
            error
          );
        }
      };

    // ==========================================================
    // EXPOSE START / STOP
    // ==========================================================

    useImperativeHandle(
      ref,
      () => ({
        startRecording,
        stopRecording,
      }),
      []
    );

    // ==========================================================
    // WAVESURFER
    // ==========================================================

    useEffect(() => {
      if (
        !previewUrl ||
        !waveRef.current
      ) {
        console.log(
          "🌊 [WaveSurfer] Waiting:",
          {
            hasPreviewUrl:
              !!previewUrl,
            hasContainer:
              !!waveRef.current,
          }
        );

        setWaveReady(false);

        return;
      }

      console.log(
        "🌊 [WaveSurfer] Initializing"
      );

      setWaveReady(false);

      if (
        waveSurferRef.current
      ) {
        try {
          waveSurferRef.current.destroy();
        } catch {}

        waveSurferRef.current =
          null;
      }

      const ws =
        WaveSurfer.create({
          container:
            waveRef.current,

          /*
           * Cream/chocolate/gold palette.
           *
           * The inactive waveform is subtle.
           * The active portion uses your gold.
           */
          waveColor:
            mode === "light"
              ? alpha(
                  theme.palette.secondary.main,
                  0.18
                )
              : alpha(
                  theme.palette.text.primary,
                  0.28
                ),

          progressColor:
            theme.palette.primary.main,

          cursorColor:
            "transparent",

          barWidth: 3,

          barGap: 2,

          barRadius: 4,

          height: 52,

          normalize: true,

          interact: false,
        });

      waveSurferRef.current =
        ws;

      console.log(
        "🌊 [WaveSurfer] Loading:",
        previewUrl
      );

      ws.load(previewUrl);

      ws.on(
        "ready",
        () => {
          console.log(
            "🌊 [WaveSurfer] READY"
          );

          setWaveReady(true);

          const duration =
            ws.getDuration();

          if (
            Number.isFinite(
              duration
            ) &&
            duration > 0
          ) {
            setPlaybackDuration(
              duration
            );
          }
        }
      );

      ws.on(
        "error",
        (error) => {
          console.error(
            "❌ [WaveSurfer] ERROR:",
            error
          );

          setWaveReady(false);
        }
      );

      return () => {
        console.log(
          "🧹 [WaveSurfer] Cleanup"
        );

        try {
          ws.destroy();
        } catch {}

        if (
          waveSurferRef.current ===
          ws
        ) {
          waveSurferRef.current =
            null;
        }
      };
    }, [
      previewUrl,
      mode,
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.text.primary,
    ]);

    // ==========================================================
    // NATIVE AUDIO EVENTS
    // ==========================================================

    useEffect(() => {
      const audio =
        audioRef.current;

      if (!audio) {
        return;
      }

      console.log(
        "🎵 [NativeAudio] Setting up events"
      );

      const handleLoadedMetadata =
        () => {
          console.log(
            "🎵 [NativeAudio] METADATA:",
            {
              duration:
                audio.duration,
              readyState:
                audio.readyState,
            }
          );

          if (
            Number.isFinite(
              audio.duration
            ) &&
            audio.duration > 0
          ) {
            setPlaybackDuration(
              audio.duration
            );
          }
        };

      const handleCanPlay =
        () => {
          console.log(
            "🎵 [NativeAudio] CAN PLAY",
            {
              readyState:
                audio.readyState,
              duration:
                audio.duration,
            }
          );
        };

      const handlePlay =
        () => {
          console.log(
            "▶️ [NativeAudio] PLAY EVENT"
          );

          setIsPlaying(true);
        };

      const handlePause =
        () => {
          console.log(
            "⏸️ [NativeAudio] PAUSE EVENT"
          );

          setIsPlaying(false);
        };

      const handleEnded =
        () => {
          console.log(
            "🏁 [NativeAudio] ENDED"
          );

          setIsPlaying(false);

          const finalTime =
            Number.isFinite(
              audio.duration
            )
              ? audio.duration
              : 0;

          setPlaybackCurrentTime(
            finalTime
          );

          if (
            waveSurferRef.current
          ) {
            waveSurferRef.current.seekTo(
              1
            );
          }
        };

      const handleError =
        () => {
          console.error(
            "❌ [NativeAudio] ERROR:",
            {
              error:
                audio.error,
              code:
                audio.error?.code,
              message:
                audio.error?.message,
              src:
                audio.src,
              readyState:
                audio.readyState,
              networkState:
                audio.networkState,
            }
          );

          setIsPlaying(false);
        };

      const handleTimeUpdate =
        () => {
          const duration =
            audio.duration;

          const currentTime =
            audio.currentTime;

          setPlaybackCurrentTime(
            currentTime
          );

          if (
            Number.isFinite(
              duration
            ) &&
            duration > 0
          ) {
            setPlaybackDuration(
              duration
            );

            const progress =
              Math.min(
                1,
                Math.max(
                  0,
                  currentTime /
                    duration
                )
              );

            /*
             * This is what synchronizes
             * WaveSurfer with the real
             * native audio playback.
             */
            if (
              waveSurferRef.current
            ) {
              waveSurferRef.current.seekTo(
                progress
              );
            }
          }
        };

      audio.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.addEventListener(
        "canplay",
        handleCanPlay
      );

      audio.addEventListener(
        "play",
        handlePlay
      );

      audio.addEventListener(
        "pause",
        handlePause
      );

      audio.addEventListener(
        "ended",
        handleEnded
      );

      audio.addEventListener(
        "error",
        handleError
      );

      audio.addEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      return () => {
        audio.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );

        audio.removeEventListener(
          "canplay",
          handleCanPlay
        );

        audio.removeEventListener(
          "play",
          handlePlay
        );

        audio.removeEventListener(
          "pause",
          handlePause
        );

        audio.removeEventListener(
          "ended",
          handleEnded
        );

        audio.removeEventListener(
          "error",
          handleError
        );

        audio.removeEventListener(
          "timeupdate",
          handleTimeUpdate
        );
      };
    }, [previewUrl]);

    // ==========================================================
    // FORCE NATIVE AUDIO TO LOAD BLOB
    // ==========================================================

    useEffect(() => {
      const audio =
        audioRef.current;

      if (
        !audio ||
        !previewUrl
      ) {
        return;
      }

      audio.pause();

      audio.currentTime = 0;

      audio.muted = false;

      audio.volume = 1;

      audio.src =
        previewUrl;

      audio.load();

      setPlaybackCurrentTime(
        0
      );

      console.log(
        "🎧 [NativeAudio] BLOB SOURCE:",
        {
          src:
            audio.src,
          readyState:
            audio.readyState,
          networkState:
            audio.networkState,
          muted:
            audio.muted,
          volume:
            audio.volume,
        }
      );
    }, [previewUrl]);

    // ==========================================================
    // START RECORDING
    // ==========================================================

    const startRecording =
      async () => {
        console.log(
          "🎤 [Recording] START requested"
        );

        if (isRecording) {
          console.warn(
            "⚠️ [Recording] Already recording"
          );

          return;
        }

        if (isPreviewing) {
          console.warn(
            "⚠️ [Recording] Preview exists"
          );

          return;
        }

        try {
          // ----------------------------------------------------
          // BROWSER SUPPORT
          // ----------------------------------------------------

          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices
              .getUserMedia
          ) {
            toast.error(
              "Microphone recording is not supported."
            );

            return;
          }

          // ----------------------------------------------------
          // CLEAN PREVIOUS MONITOR
          // ----------------------------------------------------

          stopMicMonitor();

          // ----------------------------------------------------
          // REQUEST MICROPHONE
          // ----------------------------------------------------

          console.log(
            "🎤 [Recording] Requesting microphone..."
          );

          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: {
                  channelCount: {
                    ideal: 1,
                  },

                  sampleRate: {
                    ideal: 48000,
                  },

                  sampleSize: {
                    ideal: 16,
                  },

                  echoCancellation:
                    false,

                  noiseSuppression:
                    false,

                  autoGainControl:
                    false,
                },
              }
            );

          const tracks =
            stream.getAudioTracks();

          const track =
            tracks[0];

          console.log(
            "🔎 [MIC CHECK] AFTER getUserMedia:",
            {
              count:
                tracks.length,

              label:
                track?.label,

              muted:
                track?.muted,

              enabled:
                track?.enabled,

              readyState:
                track?.readyState,

              settings:
                track?.getSettings(),
            }
          );

          if (!track) {
            throw new Error(
              "Chrome did not provide an audio track."
            );
          }

          track.enabled = true;

          track.onmute = () => {
            console.error(
              "🚨 [MIC CHECK] TRACK MUTED — Chrome is receiving no microphone audio."
            );
          };

          track.onunmute = () => {
            console.log(
              "🔊 [MIC CHECK] TRACK UNMUTED — microphone audio resumed."
            );
          };

          track.onended = () => {
            console.error(
              "🛑 [MIC CHECK] TRACK ENDED — microphone source stopped."
            );
          };

          // ----------------------------------------------------
          // MIME TYPE
          // ----------------------------------------------------

          const mimeTypes = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/mp4",
          ];

          let selectedMimeType =
            "";

          for (
            const mimeType of mimeTypes
          ) {
            if (
              MediaRecorder.isTypeSupported(
                mimeType
              )
            ) {
              selectedMimeType =
                mimeType;

              break;
            }
          }

          console.log(
            "🎤 [Recording] Selected MIME:",
            selectedMimeType ||
              "Browser default"
          );

          // ----------------------------------------------------
          // GIVE CHROME TIME TO START
          // ----------------------------------------------------

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                800
              )
          );

          if (track.muted) {
            console.error(
              "🚨 [MIC CHECK] FINAL RESULT: microphone is still muted."
            );

            stream
              .getTracks()
              .forEach(
                (t) =>
                  t.stop()
              );

            mediaStreamRef.current =
              null;

            toast.error(
              "Chrome is receiving no microphone audio. Check Windows microphone input/permissions."
            );

            setIsRecording(
              false
            );

            return;
          }

          console.log(
            "✅ [MIC CHECK] Track is not muted. Starting recorder."
          );

          // ----------------------------------------------------
          // CREATE RECORDER
          // ----------------------------------------------------

          const recorder =
            selectedMimeType
              ? new MediaRecorder(
                  stream,
                  {
                    mimeType:
                      selectedMimeType,
                  }
                )
              : new MediaRecorder(
                  stream
                );

          mediaRecorderRef.current =
            recorder;

          mediaStreamRef.current =
            stream;

          audioChunksRef.current =
            [];

          console.log(
            "🎤 [Recording] MediaRecorder:",
            {
              state:
                recorder.state,
              mimeType:
                recorder.mimeType,
            }
          );

          // ----------------------------------------------------
          // DATA AVAILABLE
          // ----------------------------------------------------

          recorder.ondataavailable =
            (event) => {
              console.log(
                "🎤 [Recording] DATA:",
                {
                  size:
                    event.data
                      .size,
                  type:
                    event.data
                      .type,
                }
              );

              if (
                event.data.size >
                0
              ) {
                audioChunksRef.current.push(
                  event.data
                );
              }
            };

          // ----------------------------------------------------
          // RECORDER ERROR
          // ----------------------------------------------------

          recorder.onerror =
            (event) => {
              console.error(
                "❌ [Recording] MediaRecorder ERROR:",
                event
              );
            };

          // ----------------------------------------------------
          // STOP
          // ----------------------------------------------------

          recorder.onstop =
            () => {
              console.log(
                "🛑 [Recording] STOP EVENT"
              );

              stopMicMonitor();

              stopRecordingTimer();

              if (
                recordingStartTimeRef.current
              ) {
                const finalDuration =
                  (Date.now() -
                    recordingStartTimeRef.current) /
                  1000;

                setRecordingDuration(
                  finalDuration
                );
              }

              recordingStartTimeRef.current =
                null;

              if (
                audioChunksRef.current
                  .length === 0
              ) {
                console.error(
                  "❌ [Recording] No audio chunks"
                );

                toast.error(
                  "No audio was recorded."
                );

                setIsRecording(
                  false
                );

                return;
              }

              // ------------------------------------------------
              // CREATE BLOB
              // ------------------------------------------------

              const blob =
                new Blob(
                  audioChunksRef.current,
                  {
                    type:
                      recorder.mimeType ||
                      "audio/webm",
                  }
                );

              console.log(
                "🎵 [Recording] BLOB CREATED:",
                {
                  size:
                    blob.size,

                  type:
                    blob.type,

                  chunks:
                    audioChunksRef.current
                      .length,

                  trackMuted:
                    track.muted,

                  trackEnabled:
                    track.enabled,

                  trackReadyState:
                    track.readyState,
                }
              );

              if (
                blob.size < 12000
              ) {
                console.warn(
                  "⚠️ [Recording] Blob is unusually small.",
                  {
                    size:
                      blob.size,
                  }
                );
              }

              if (
                blob.size === 0
              ) {
                console.error(
                  "❌ [Recording] Empty blob"
                );

                toast.error(
                  "The recording is empty."
                );

                return;
              }

              // ------------------------------------------------
              // CREATE URL
              // ------------------------------------------------

              const url =
                URL.createObjectURL(
                  blob
                );

              console.log(
                "🔗 [Recording] Preview URL:",
                url
              );

              // ------------------------------------------------
              // SAVE RECORDING
              // ------------------------------------------------

              setAudioBlob(
                blob
              );

              setPreviewUrl(
                url
              );

              setIsRecording(
                false
              );

              setIsPreviewing(
                true
              );

              setPlaybackCurrentTime(
                0
              );

              setPlaybackDuration(
                0
              );

              // ------------------------------------------------
              // STOP MICROPHONE
              // ------------------------------------------------

              mediaStreamRef.current
                ?.getTracks()
                .forEach(
                  (
                    currentTrack
                  ) => {
                    console.log(
                      "🎤 [Recording] Stopping:",
                      currentTrack.label
                    );

                    currentTrack.stop();
                  }
                );

              mediaStreamRef.current =
                null;

              mediaRecorderRef.current =
                null;
            };

          // ----------------------------------------------------
          // START
          // ----------------------------------------------------

          recorder.start(250);

          console.log(
            "🔴 [Recording] recorder.start() called"
          );

          setRecordingDuration(
            0
          );

          startRecordingTimer();

          setIsRecording(
            true
          );

          // ----------------------------------------------------
          // START REAL LIVE WAVEFORM
          // ----------------------------------------------------

          startMicMonitor(
            stream
          );

          // Diagnostics remain available
          // without changing the recording flow.
          //
          // diagnoseMicrophone(stream);
        } catch (error: any) {
          console.error(
            "❌ [Recording] START FAILED:",
            error
          );

          stopMicMonitor();

          stopRecordingTimer();

          mediaStreamRef.current
            ?.getTracks()
            .forEach(
              (track) =>
                track.stop()
            );

          mediaStreamRef.current =
            null;

          mediaRecorderRef.current =
            null;

          recordingStartTimeRef.current =
            null;

          setIsRecording(
            false
          );

          toast.error(
            "Unable to start recording: " +
              (
                error?.message ||
                "Unknown microphone error"
              )
          );
        }
      };

    // ==========================================================
    // STOP RECORDING
    // ==========================================================

    const stopRecording =
      () => {
        console.log(
          "🛑 [Recording] STOP requested"
        );

        const recorder =
          mediaRecorderRef.current;

        if (!recorder) {
          console.warn(
            "⚠️ [Recording] No MediaRecorder"
          );

          setIsRecording(
            false
          );

          stopRecordingTimer();

          stopMicMonitor();

          return;
        }

        console.log(
          "🎤 [Recording] Current state:",
          recorder.state
        );

        if (
          recorder.state ===
          "recording"
        ) {
          recorder.stop();

          console.log(
            "🛑 [Recording] stop() called"
          );
        } else {
          console.warn(
            "⚠️ [Recording] Not recording:",
            recorder.state
          );
        }

        stopRecordingTimer();

        setIsRecording(
          false
        );

        stopMicMonitor();
      };

    // ==========================================================
    // PLAY / PAUSE
    // ==========================================================

    const togglePlay =
      async () => {
        console.log(
          "▶️ [NativeAudio] PLAY/PAUSE clicked"
        );

        if (!previewUrl) {
          toast.error(
            "No recording available."
          );

          return;
        }

        const audio =
          audioRef.current;

        if (!audio) {
          console.error(
            "❌ [NativeAudio] Audio element missing"
          );

          return;
        }

        try {
          // ----------------------------------------------------
          // PAUSE
          // ----------------------------------------------------

          if (!audio.paused) {
            audio.pause();

            setIsPlaying(
              false
            );

            return;
          }

          // ----------------------------------------------------
          // RESET IF ENDED
          // ----------------------------------------------------

          if (audio.ended) {
            audio.currentTime =
              0;

            setPlaybackCurrentTime(
              0
            );

            if (
              waveSurferRef.current
            ) {
              waveSurferRef.current.seekTo(
                0
              );
            }
          }

          // ----------------------------------------------------
          // ENSURE SOURCE
          // ----------------------------------------------------

          if (
            audio.src !==
            previewUrl
          ) {
            audio.src =
              previewUrl;

            audio.load();

            await new Promise<void>(
              (resolve) => {
                const onLoaded =
                  () => {
                    audio.removeEventListener(
                      "loadedmetadata",
                      onLoaded
                    );

                    resolve();
                  };

                audio.addEventListener(
                  "loadedmetadata",
                  onLoaded
                );
              }
            );
          }

          // ----------------------------------------------------
          // AUDIO CONFIG
          // ----------------------------------------------------

          audio.volume = 1;

          audio.muted = false;

          // ----------------------------------------------------
          // PLAY
          // ----------------------------------------------------

          await audio.play();

          setIsPlaying(
            true
          );
        } catch (error) {
          console.error(
            "❌ [NativeAudio] PLAY FAILED:",
            error
          );

          setIsPlaying(
            false
          );

          toast.error(
            "Unable to play recording."
          );
        }
      };

    // ==========================================================
    // CANCEL PREVIEW
    // ==========================================================

    const cancelPreview =
      () => {
        console.log(
          "🧹 [Preview] CANCEL"
        );

        // ------------------------------------------------------
        // STOP AUDIO
        // ------------------------------------------------------

        const audio =
          audioRef.current;

        if (audio) {
          try {
            audio.pause();

            audio.currentTime =
              0;

            audio.removeAttribute(
              "src"
            );

            audio.load();
          } catch (error) {
            console.error(
              "❌ [NativeAudio] Cleanup error:",
              error
            );
          }
        }

        // ------------------------------------------------------
        // DESTROY WAVESURFER
        // ------------------------------------------------------

        if (
          waveSurferRef.current
        ) {
          try {
            waveSurferRef.current.destroy();
          } catch {}

          waveSurferRef.current =
            null;
        }

        // ------------------------------------------------------
        // REVOKE URL
        // ------------------------------------------------------

        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl
          );
        }

        // ------------------------------------------------------
        // RESET
        // ------------------------------------------------------

        setAudioBlob(
          null
        );

        setPreviewUrl(
          null
        );

        setIsPreviewing(
          false
        );

        setIsPlaying(
          false
        );

        setPlaybackCurrentTime(
          0
        );

        setPlaybackDuration(
          0
        );

        setRecordingDuration(
          0
        );

        setWaveReady(
          false
        );

        audioChunksRef.current =
          [];

        resetLiveBars();
      };

    // ==========================================================
    // SEND RECORDING
    // ==========================================================

    const sendRecording =
      () => {
        console.log(
          "📤 [Voice] SEND requested"
        );

        if (!audioBlob) {
          toast.error(
            "No recording available."
          );

          return;
        }

        if (!conversationId) {
          toast.error(
            "Conversation not found."
          );

          return;
        }

        if (
          !otherUser?.user?.id
        ) {
          toast.error(
            "Receiver not found."
          );

          return;
        }

        const file =
          new File(
            [audioBlob],
            "voice-note.webm",
            {
              type:
                audioBlob.type ||
                "audio/webm",
            }
          );

        sendVoice(
          {
            file,
            conversationId,
          },
          {
            onSuccess:
              (res) => {
                console.log(
                  "✅ [Voice] Upload SUCCESS:",
                  res
                );

                const socket =
                  getSocket();

                socket.emit(
                  "send_message",
                  {
                    conversationId,

                    type:
                      "VOICE",

                    mediaUrl:
                      res.mediaUrl,

                    duration:
                      res.duration,
                  }
                );

                cancelPreview();
              },

            onError:
              (error: any) => {
                console.error(
                  "❌ [Voice] Upload FAILED:",
                  error
                );

                toast.error(
                  "Upload failed: " +
                    (
                      error?.message ||
                      "Unknown error"
                    )
                );
              },
          }
        );
      };

    // ==========================================================
    // GLOBAL CLEANUP
    // ==========================================================

    useEffect(() => {
      return () => {
        console.log(
          "🧹 [VoiceRecorder] UNMOUNT CLEANUP"
        );

        // ------------------------------------------------------
        // TIMER
        // ------------------------------------------------------

        stopRecordingTimer();

        recordingStartTimeRef.current =
          null;

        // ------------------------------------------------------
        // MEDIA RECORDER
        // ------------------------------------------------------

        const recorder =
          mediaRecorderRef.current;

        if (
          recorder &&
          recorder.state ===
            "recording"
        ) {
          try {
            recorder.stop();
          } catch {}
        }

        // ------------------------------------------------------
        // MICROPHONE MONITOR
        // ------------------------------------------------------

        stopMicMonitor();

        // ------------------------------------------------------
        // MICROPHONE
        // ------------------------------------------------------

        mediaStreamRef.current
          ?.getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        mediaStreamRef.current =
          null;

        // ------------------------------------------------------
        // AUDIO
        // ------------------------------------------------------

        if (
          audioRef.current
        ) {
          try {
            audioRef.current.pause();
          } catch {}
        }

        // ------------------------------------------------------
        // WAVESURFER
        // ------------------------------------------------------

        if (
          waveSurferRef.current
        ) {
          try {
            waveSurferRef.current.destroy();
          } catch {}

          waveSurferRef.current =
            null;
        }

        // ------------------------------------------------------
        // URL
        // ------------------------------------------------------

        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl
          );
        }
      };
    }, [previewUrl]);

    // ==========================================================
    // DERIVED PLAYBACK VALUES
    // ==========================================================

    const hasPlaybackDuration =
      Number.isFinite(
        playbackDuration
      ) &&
      playbackDuration > 0;

    const playbackPercentage =
      hasPlaybackDuration
        ? Math.min(
            100,
            Math.max(
              0,
              (playbackCurrentTime /
                playbackDuration) *
                100
            )
          )
        : 0;

    // ==========================================================
    // COLOR SYSTEM
    // ==========================================================

    const gold =
      theme.palette.primary.main;

    const chocolate =
      theme.palette.secondary.main;

    const pageBackground =
      theme.palette.background.default;

    const paperBackground =
      theme.palette.background.paper;

    const primaryText =
      theme.palette.text.primary;

    const secondaryText =
      theme.palette.text.secondary;

    const recordingBackground =
      mode === "light"
        ? `linear-gradient(135deg, ${alpha(
            gold,
            0.12
          )}, ${alpha(
            chocolate,
            0.035
          )})`
        : `linear-gradient(135deg, ${alpha(
            gold,
            0.11
          )}, ${alpha(
            chocolate,
            0.28
          )})`;

    const previewBackground =
      mode === "light"
        ? `linear-gradient(135deg, ${alpha(
            paperBackground,
            0.98
          )}, ${alpha(
            gold,
            0.055
          )})`
        : `linear-gradient(135deg, ${alpha(
            paperBackground,
            0.98
          )}, ${alpha(
            chocolate,
            0.48
          )})`;

    const softBorder =
      mode === "light"
        ? alpha(
            chocolate,
            0.10
          )
        : alpha(
            theme.palette.text.primary,
            0.10
          );

    const subtleShadow =
      mode === "light"
        ? `0 8px 30px ${alpha(
            chocolate,
            0.09
          )}`
        : `0 8px 30px ${alpha(
            "#000000",
            0.32
          )}`;

    const buttonShadow =
      `0 6px 18px ${alpha(
        gold,
        0.30
      )}`;

    // ==========================================================
    // RENDER
    // ==========================================================

    return (
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* ====================================================
            RECORDING UI
        ==================================================== */}

        {isRecording &&
          !isPreviewing && (
            <Box
              sx={{
                width: "100%",
                minWidth: 0,

                display: "flex",
                alignItems: "center",

                gap: {
                  xs: 0.75,
                  sm: 1.25,
                },

                px: {
                  xs: 0.75,
                  sm: 1.25,
                },

                py: {
                  xs: 0.65,
                  sm: 0.85,
                },

                borderRadius: {
                  xs: "16px",
                  sm: "18px",
                },

                background:
                  recordingBackground,

                border:
                  `1px solid ${alpha(
                    gold,
                    0.20
                  )}`,

                boxShadow:
                  subtleShadow,

                overflow:
                  "hidden",
              }}
            >
              {/* Recording indicator */}

              <Box
                sx={{
                  width: {
                    xs: 38,
                    sm: 42,
                  },

                  height: {
                    xs: 38,
                    sm: 42,
                  },

                  flexShrink: 0,

                  borderRadius:
                    "50%",

                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",

                  position:
                    "relative",

                  bgcolor:
                    alpha(
                      gold,
                      mode ===
                        "light"
                        ? 0.14
                        : 0.18
                    ),

                  border:
                    `1px solid ${alpha(
                      gold,
                      0.18
                    )}`,
                }}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,

                    borderRadius:
                      "50%",

                    bgcolor:
                      theme.palette.error
                        .main,

                    animation:
                      "voiceRecorderPulse 1.2s ease-in-out infinite",

                    "@keyframes voiceRecorderPulse":
                      {
                        "0%": {
                          transform:
                            "scale(1)",
                          opacity: 1,
                          boxShadow:
                            `0 0 0 0 ${alpha(
                              theme
                                .palette
                                .error
                                .main,
                              0.4
                            )}`,
                        },

                        "50%": {
                          transform:
                            "scale(1.4)",
                          opacity: 0.6,
                          boxShadow:
                            `0 0 0 7px ${alpha(
                              theme
                                .palette
                                .error
                                .main,
                              0
                            )}`,
                        },

                        "100%": {
                          transform:
                            "scale(1)",
                          opacity: 1,
                          boxShadow:
                            `0 0 0 0 ${alpha(
                              theme
                                .palette
                                .error
                                .main,
                              0
                            )}`,
                        },
                      },
                  }}
                />
              </Box>

              {/* =================================================
                  REAL MICROPHONE WAVEFORM
              ================================================= */}

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,

                  height: {
                    xs: 44,
                    sm: 50,
                  },

                  display: "flex",
                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  gap: {
                    xs: "2px",
                    sm: "2.5px",
                  },

                  overflow:
                    "hidden",

                  px: {
                    xs: 0.25,
                    sm: 0.5,
                  },
                }}
              >
                {liveBars.map(
                  (
                    height,
                    index
                  ) => (
                    <Box
                      key={
                        index
                      }
                      sx={{
                        width: {
                          xs: 2.5,
                          sm: 3,
                        },

                        minWidth: {
                          xs: 2.5,
                          sm: 3,
                        },

                        height: `${Math.max(
                          8,
                          height
                        )}%`,

                        borderRadius:
                          999,

                        bgcolor:
                          gold,

                        opacity:
                          0.45 +
                          (height /
                            100) *
                            0.55,

                        transformOrigin:
                          "center",

                        transition:
                          "height 80ms linear, opacity 80ms linear",

                        boxShadow:
                          `0 0 7px ${alpha(
                            gold,
                            0.16
                          )}`,
                      }}
                    />
                  )
                )}
              </Box>

              {/* =================================================
                  RECORDING DURATION
              ================================================= */}

              <Box
                sx={{
                  flexShrink: 0,

                  minWidth: {
                    xs: 43,
                    sm: 50,
                  },

                  textAlign:
                    "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: 12,
                      sm: 13,
                    },

                    fontWeight: 700,

                    fontVariantNumeric:
                      "tabular-nums",

                    color:
                      primaryText,

                    lineHeight: 1.1,

                    letterSpacing:
                      "0.02em",
                  }}
                >
                  {formatDuration(
                    recordingDuration
                  )}
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 8,
                      sm: 9,
                    },

                    fontWeight: 600,

                    color:
                      secondaryText,

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      "0.07em",

                    mt: 0.25,

                    whiteSpace:
                      "nowrap",
                  }}
                >
                  Recording
                </Typography>
              </Box>

              {/* =================================================
                  STOP
              ================================================= */}

              <IconButton
                onClick={
                  stopRecording
                }
                aria-label="Stop recording"
                sx={{
                  width: {
                    xs: 40,
                    sm: 44,
                  },

                  height: {
                    xs: 40,
                    sm: 44,
                  },

                  flexShrink: 0,

                  color:
                    theme
                      .palette
                      .error
                      .contrastText,

                  bgcolor:
                    theme
                      .palette
                      .error
                      .main,

                  boxShadow:
                    `0 6px 18px ${alpha(
                      theme
                        .palette
                        .error
                        .main,
                      0.25
                    )}`,

                  "&:hover": {
                    bgcolor:
                      theme
                        .palette
                        .error
                        .dark,

                    transform:
                      "translateY(-1px)",
                  },

                  transition:
                    "all 0.2s ease",
                }}
              >
                <Square
                  size={16}
                  fill="currentColor"
                />
              </IconButton>
            </Box>
          )}

        {/* ====================================================
            PREVIEW UI
        ==================================================== */}

        {isPreviewing && (
          <Box
            sx={{
              width: "100%",
              minWidth: 0,

              display: "flex",
              alignItems:
                "center",

              gap: {
                xs: 0.5,
                sm: 0.75,
              },

              px: {
                xs: 0.65,
                sm: 0.9,
              },

              py: {
                xs: 0.65,
                sm: 0.8,
              },

              borderRadius: {
                xs: "17px",
                sm: "20px",
              },

              background:
                previewBackground,

              border:
                `1px solid ${softBorder}`,

              boxShadow:
                subtleShadow,

              overflow:
                "hidden",

              /*
               * Prevent the voice note from
               * becoming too tall on phones.
               */
              maxWidth:
                "100%",
            }}
          >
            {/* =================================================
                PLAY / PAUSE
            ================================================= */}

            <IconButton
              onClick={
                togglePlay
              }
              disabled={
                !previewUrl
              }
              aria-label={
                isPlaying
                  ? "Pause recording"
                  : "Play recording"
              }
              sx={{
                width: {
                  xs: 40,
                  sm: 44,
                },

                height: {
                  xs: 40,
                  sm: 44,
                },

                flexShrink: 0,

                color:
                  theme
                    .palette
                    .primary
                    .contrastText,

                bgcolor:
                  gold,

                boxShadow:
                  buttonShadow,

                "&:hover": {
                  bgcolor:
                    theme
                      .palette
                      .primary
                      .dark,

                  transform:
                    "translateY(-1px)",

                  boxShadow:
                    `0 8px 22px ${alpha(
                      gold,
                      0.38
                    )}`,
                },

                "&:disabled": {
                  bgcolor:
                    theme
                      .palette
                      .action
                      .disabledBackground,

                  color:
                    theme
                      .palette
                      .action
                      .disabled,
                },

                transition:
                  "all 0.2s ease",
              }}
            >
              {isPlaying ? (
                <Pause
                  size={18}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={18}
                  fill="currentColor"
                />
              )}
            </IconButton>

            {/* =================================================
                WAVEFORM AREA
            ================================================= */}

            <Box
              sx={{
                flex: 1,
                minWidth: 0,

                position:
                  "relative",

                overflow:
                  "hidden",

                py: 0.1,
              }}
            >
              {/* Waveform */}

              <Box
                ref={
                  waveRef
                }
                sx={{
                  width:
                    "100%",

                  height: {
                    xs: 48,
                    sm: 52,
                  },

                  minWidth: 0,

                  opacity:
                    waveReady
                      ? 1
                      : 0.35,

                  transition:
                    "opacity 0.25s ease",

                  "& wave": {
                    overflow:
                      "hidden !important",
                  },

                  /*
                   * WaveSurfer's shadow DOM
                   * wrapper needs to remain
                   * inside the responsive
                   * container.
                   */
                  "& > div": {
                    maxWidth:
                      "100%",
                  },
                }}
              />

              {/* =================================================
                  PLAYBACK POSITION INDICATOR
              ================================================= */}

              {isPlaying && (
                <Box
                  sx={{
                    position:
                      "absolute",

                    left: `${Math.min(
                      100,
                      playbackPercentage
                    )}%`,

                    top: 6,

                    bottom: 6,

                    width: 2,

                    borderRadius: 2,

                    bgcolor:
                      gold,

                    boxShadow:
                      `0 0 12px ${alpha(
                        gold,
                        0.8
                      )}`,

                    transform:
                      "translateX(-1px)",

                    pointerEvents:
                      "none",

                    transition:
                      "left 80ms linear",

                    opacity: 0.95,

                    zIndex: 2,
                  }}
                />
              )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {!waveReady && (
                <Box
                  sx={{
                    position:
                      "absolute",

                    inset: 0,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    pointerEvents:
                      "none",
                  }}
                >
                  <Box
                    sx={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: 0.6,

                      px: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: 5,
                        height: 5,

                        borderRadius:
                          "50%",

                        bgcolor:
                          gold,

                        animation:
                          "voiceWaveDot 1s infinite ease-in-out",

                        "@keyframes voiceWaveDot":
                          {
                            "0%, 100%":
                              {
                                opacity:
                                  0.3,
                                transform:
                                  "scale(0.8)",
                              },

                            "50%":
                              {
                                opacity:
                                  1,
                                transform:
                                  "scale(1.2)",
                              },
                          },
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: {
                          xs: 10,
                          sm: 11,
                        },

                        color:
                          secondaryText,

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      Preparing voice note…
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* =================================================
                  DURATION
              ================================================= */}

              <Box
                sx={{
                  position:
                    "absolute",

                  right: 0,

                  bottom: -1,

                  px: 0.65,

                  py: 0.15,

                  borderRadius: 1.5,

                  bgcolor:
                    mode ===
                    "light"
                      ? alpha(
                          paperBackground,
                          0.9
                        )
                      : alpha(
                          paperBackground,
                          0.88
                        ),

                  backdropFilter:
                    "blur(6px)",

                  border:
                    `1px solid ${alpha(
                      theme
                        .palette
                        .divider,
                      0.35
                    )}`,

                  zIndex: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: 10,
                      sm: 11,
                    },

                    fontWeight: 700,

                    color:
                      secondaryText,

                    fontVariantNumeric:
                      "tabular-nums",

                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {formatDuration(
                    playbackCurrentTime
                  )}

                  {hasPlaybackDuration
                    ? ` / ${formatDuration(
                        playbackDuration
                      )}`
                    : ""}
                </Typography>
              </Box>
            </Box>

            {/* =================================================
                CONTROLS
            ================================================= */}

            <Box
              sx={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: {
                  xs: 0.15,
                  sm: 0.4,
                },

                flexShrink: 0,
              }}
            >
              {/* =================================================
                  SEND
              ================================================= */}

              <IconButton
                onClick={
                  sendRecording
                }
                disabled={
                  isPending ||
                  !audioBlob
                }
                aria-label="Send voice note"
                sx={{
                  width: {
                    xs: 38,
                    sm: 42,
                  },

                  height: {
                    xs: 38,
                    sm: 42,
                  },

                  color:
                    theme
                      .palette
                      .success
                      .main,

                  bgcolor:
                    mode ===
                    "light"
                      ? alpha(
                          theme
                            .palette
                            .success
                            .main,
                          0.07
                        )
                      : alpha(
                          theme
                            .palette
                            .success
                            .main,
                          0.13
                        ),

                  border:
                    `1px solid ${alpha(
                      theme
                        .palette
                        .success
                        .main,
                      0.12
                    )}`,

                  "&:hover": {
                    bgcolor:
                      alpha(
                        theme
                          .palette
                          .success
                          .main,
                        0.15
                      ),

                    transform:
                      "translateY(-1px)",
                  },

                  "&:disabled": {
                    bgcolor:
                      theme
                        .palette
                        .action
                        .disabledBackground,

                    color:
                      theme
                        .palette
                        .action
                        .disabled,
                  },

                  transition:
                    "all 0.2s ease",
                }}
              >
                {isPending ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <Send
                    size={17}
                    strokeWidth={
                      2.3
                    }
                  />
                )}
              </IconButton>

              {/* =================================================
                  CANCEL
              ================================================= */}

              <IconButton
                onClick={
                  cancelPreview
                }
                disabled={
                  isPending
                }
                aria-label="Cancel voice note"
                sx={{
                  width: {
                    xs: 38,
                    sm: 42,
                  },

                  height: {
                    xs: 38,
                    sm: 42,
                  },

                  color:
                    secondaryText,

                  bgcolor:
                    mode ===
                    "light"
                      ? alpha(
                          chocolate,
                          0.045
                        )
                      : alpha(
                          theme
                            .palette
                            .text
                            .primary,
                          0.055
                        ),

                  border:
                    `1px solid ${alpha(
                      theme
                        .palette
                        .divider,
                      0.5
                    )}`,

                  "&:hover": {
                    color:
                      theme
                        .palette
                        .error
                        .main,

                    bgcolor:
                      alpha(
                        theme
                          .palette
                          .error
                          .main,
                        0.09
                      ),

                    borderColor:
                      alpha(
                        theme
                          .palette
                          .error
                          .main,
                        0.16
                      ),

                    transform:
                      "translateY(-1px)",
                  },

                  "&:disabled": {
                    opacity:
                      0.5,
                  },

                  transition:
                    "all 0.2s ease",
                }}
              >
                <X
                  size={18}
                  strokeWidth={
                    2.2
                  }
                />
              </IconButton>
            </Box>

            {/* =================================================
                ACTUAL AUDIO PLAYER
            ================================================= */}

            <audio
              ref={
                audioRef
              }
              src={
                previewUrl ??
                undefined
              }
              preload="auto"
              playsInline
              controls={false}
              style={{
                display: "none",
              }}
            />
          </Box>
        )}

        {/* ====================================================
            IDLE STATE
        ==================================================== */}

        {!isRecording &&
          !isPreviewing && (
            <Box
              sx={{
                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                width: "100%",

                minHeight: 8,
              }}
            >
              <Mic
                size={0}
                style={{
                  display:
                    "none",
                }}
              />
            </Box>
          )}
      </Box>
    );
  }
);

// ============================================================
// DISPLAY NAME
// ============================================================

VoiceRecorder.displayName =
  "VoiceRecorder";

export default VoiceRecorder;