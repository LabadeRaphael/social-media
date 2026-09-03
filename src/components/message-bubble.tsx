"use client";

import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import moment from "moment";

import {
  CheckCheck,
  Play,
  Pause,
  FileText,
  FileImage,
  FileMusic,
  FileVideo,
  File,
  Download,
  AlertCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTheme } from "@mui/material/styles";

import { getFileType } from "./file-type-formater";
import FileCard from "./file-card";
import TypingIndicator from "./typing-indicator";

import { MessageBubbleProps } from "../types/message-bubbles";

export default function MessageBubble({
  text,
  isSender,
  timeStamp,
  isRead,
  type,
  mediaUrl,
  duration: messageDuration,
  fileName,
  fileSize,
  selectedId,
  currentUserId,
  highlight,
  searchKeyword,
  highlightText,
}: MessageBubbleProps) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  // console.log("duration", duration);

  /*
  
  * ---
  * TIME
  * ---
  
  */

  const formatTime = (timestamp: string) => {
    const now = moment();
    const msgTime = moment(timestamp);


    if (now.isSame(msgTime, "day")) {
      return `Today ${msgTime.format("hh:mm A")}`;
    }

    if (
      now
        .clone()
        .subtract(1, "day")
        .isSame(msgTime, "day")
    ) {
      return `Yesterday ${msgTime.format("hh:mm A")}`;
    }

    return msgTime.format("MMM D, hh:mm A");


  };

  /*
  
  * ---
  * MESSAGE TICKS
  * ---
  
  */

  const getTickIcon = () => {
    if (!isSender) return null;


    return (
      <CheckCheck
        size={15}
        strokeWidth={2.4}
        color={
          isRead
            ? "#0084ff" : "#888"
        }
      />
    );


  };
  /*
  
  * ---
  * VOICE PLAYER
  * ---
  
  */

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [audioDuration, setAudioDuration] =
    useState(
      typeof messageDuration === "number" &&
        Number.isFinite(messageDuration)
        ? messageDuration
        : 0
    );

  const [audioError, setAudioError] =
    useState(false);

  const [audioLoading, setAudioLoading] =
    useState(false);

  /*
  
  * Prefer the duration saved in Prisma.
  *
  * Browser metadata becomes the fallback.
    */
  useEffect(() => {
    if (
      typeof messageDuration === "number" &&
      Number.isFinite(messageDuration) &&
      messageDuration > 0
    ) {
      setAudioDuration(messageDuration);
    }
  }, [messageDuration]);

  /*
  
  * Reset player when media URL changes.
    */
  useEffect(() => {
    const audio = audioRef.current;


    if (!audio) return;



    audio.pause();

    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
    setAudioLoading(false);

    if (
      typeof messageDuration === "number" &&
      Number.isFinite(messageDuration)
    ) {
      setAudioDuration(messageDuration);
    } else {
      setAudioDuration(0);
    }

    audio.load();


  }, [mediaUrl, messageDuration]);

  /*
  
  * Audio event listeners.
    */
  useEffect(() => {
    const audio = audioRef.current;


    if (!audio) return;



    const handleLoadedMetadata = () => {
      if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        /*
         * Only use browser duration if
         * backend duration isn't available.
         */
        if (
          !messageDuration ||
          !Number.isFinite(messageDuration) ||
          messageDuration <= 0
        ) {
          setAudioDuration(audio.duration);
        }
      }

      setAudioLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setAudioLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleWaiting = () => {
      setAudioLoading(true);
    };

    const handleCanPlay = () => {
      setAudioLoading(false);
    };

    const handleError = () => {
      setAudioLoading(false);
      setIsPlaying(false);
      setAudioError(true);
    };

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
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
      "waiting",
      handleWaiting
    );

    audio.addEventListener(
      "canplay",
      handleCanPlay
    );

    audio.addEventListener(
      "error",
      handleError
    );

    return () => {
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
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
        "waiting",
        handleWaiting
      );

      audio.removeEventListener(
        "canplay",
        handleCanPlay
      );

      audio.removeEventListener(
        "error",
        handleError
      );
    };


  }, [mediaUrl, messageDuration]);

  /*
  
  * Play / pause.
    */
  const togglePlay = async () => {
    const audio = audioRef.current;


    if (!audio || !mediaUrl) return;



    try {
      setAudioError(false);

      if (audio.paused) {
        setAudioLoading(true);

        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error(
        "Voice playback failed:",
        error
      );

      setIsPlaying(false);
      setAudioLoading(false);
      setAudioError(true);
    }


  };

  /*
  
  * Seek through the waveform.
    */
  const handleSeek = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const audio = audioRef.current;


    if (!audio) return;



    const duration =
      audio.duration ||
      audioDuration;

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const clickPosition =
      event.clientX - rect.left;

    const percentage =
      clickPosition / rect.width;

    const newTime =
      Math.max(
        0,
        Math.min(
          duration,
          percentage * duration
        )
      );

    audio.currentTime = newTime;
    setCurrentTime(newTime);


  };

  /*
  
  * ---
  * WAVEFORM
  * ---
  *
  * IMPORTANT:
  * Never use Math.random() during render.
  *
  * This waveform is deterministic.
    */

  const waveform = useMemo(
    () => [
      32, 48, 65, 42, 78,
      55, 36, 70, 88, 52,
      40, 62, 82, 46, 72,
      94, 58, 38, 67, 50,
      34, 60, 76, 44, 84,
      56, 40, 68, 90, 48,
      36, 64, 78, 52, 70,
      86, 46, 58, 74, 42,
    ],
    []
  );

  const playbackPercentage =
    audioDuration > 0
      ? Math.min(
        100,
        Math.max(
          0,
          (currentTime / audioDuration) * 100
        )
      )
      : 0;

  /*
  
  * Format audio time.
    */
  const formatDuration = (seconds: number) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(



      seconds / 60
    );

    const remainingSeconds = Math.floor(
      seconds % 60
    );

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;


  };

  /*
  
  * ---
  * FILE HELPERS
  * ---
  
  */

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }


    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(
        bytes /
        1024 /
        1024
      ).toFixed(1)} MB`;
    }

    return `${(
      bytes /
      1024 /
      1024 /
      1024
    ).toFixed(1)} GB`;


  };

  const getFileIcon = (
    name?: string | null
  ) => {
    const ext = name
      ?.split(".")
      .pop()
      ?.toLowerCase();


    if (!ext) return File;

    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
      ].includes(ext)
    ) {
      return FileImage;
    }

    if (
      [
        "mp3",
        "wav",
        "ogg",
        "webm",
      ].includes(ext)
    ) {
      return FileMusic;
    }

    if (
      [
        "mp4",
        "mov",
        "webm",
      ].includes(ext)
    ) {
      return FileVideo;
    }

    if (
      [
        "pdf",
        "doc",
        "docx",
        "txt",
        "xlsx",
        "xls",
        "ppt",
        "pptx",
      ].includes(ext)
    ) {
      return FileText;
    }

    return File;


  };

  const fileType =
    type === "DOCUMENT" && fileName
      ? getFileType(fileName)
      : "";

  /*
  
  * ---
  * DOWNLOAD
  * ---
  
  */

  const [downloading, setDownloading] =
    useState(false);

  const handleDownload = async () => {
    if (!mediaUrl) return;


    setDownloading(true);

    try {
      const response =
        await fetch(mediaUrl);

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status}`
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        fileName || "download";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );
    } finally {
      setDownloading(false);
    }


  };

  /*
  
  * ---
  * COLORS
  * ---
  
  */

  const bubbleBackground = isSender
    ? mode === "light"
      ? theme.palette.chat.sender
      : theme.palette.primary.main
    : mode === "light"
      ? theme.palette.primary.contrastText
      : theme.palette.secondary.contrastText;

  const bubbleTextColor =
    mode === "light"
      ? theme.palette.secondary.contrastText
      : theme.palette.primary.contrastText;

  const voiceColor =
    isSender && mode === "light"
      ? theme.palette.secondary.contrastText
      : theme.palette.background.default;
  /*
  
  * ---
  * RENDER
  * ---
  
  */
  console.log("🎵 VOICE STATE", {
    mode,
    messageDuration,
    audioDuration,
    currentTime,
    playbackPercentage,
  });

  return (
    <Box
      mb={2}
      display="flex"
      flexDirection="column"
      alignItems={
        isSender
          ? "flex-end"
          : "flex-start"
      }
      width="100%"
    >
      {/*
* ===================================================
* TEXT + VOICE BUBBLE
* ===================================================
*/}

      {(
        (type === "TEXT" && text) ||
        (type === "VOICE" && mediaUrl)
      ) && (
          <Box
            sx={{
              bgcolor:
                bubbleBackground,

              color:
                bubbleTextColor,

              p:
                type === "VOICE"
                  ? 1
                  : 1.2,

              borderRadius:
                "18px",

              borderBottomRightRadius:
                isSender
                  ? "5px"
                  : "18px",

              borderBottomLeftRadius:
                isSender
                  ? "18px"
                  : "5px",

              maxWidth: {
                xs: "85%",
                sm: "70%",
              },

              minWidth:
                type === "VOICE"
                  ? {
                    xs: 230,
                    sm: 290,
                  }
                  : undefined,

              wordBreak:
                "break-word",

              boxShadow:
                mode === "light"
                  ? "0 1px 2px rgba(0,0,0,0.08)"
                  : "0 1px 2px rgba(0,0,0,0.18)",
            }}
          >
            {/*
       * =================================================
       * TEXT
       * =================================================
       */}

            {type === "TEXT" &&
              text != null && (
                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        "0.95rem",
                      lineHeight: 1.45,
                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {highlight &&
                      searchKeyword
                      ? highlightText?.(
                        text,
                        searchKeyword
                      )
                      : text}
                  </Typography>

                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    mt={0.3}
                  >
                    {getTickIcon()}
                  </Box>
                </Box>
              )}

            {/*
       * =================================================
       * VOICE
       * =================================================
       */}

            {type === "VOICE" &&
              mediaUrl && (
                <>
                  <audio
                    ref={audioRef}
                    src={mediaUrl}
                    preload="metadata"
                  />

                  <Box
                    sx={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 1.1,
                      minWidth:
                      {
                        xs: 215,
                        sm: 270,
                      },
                      maxWidth:
                      {
                        xs: 280,
                        sm: 340,
                      },
                      py: 0.35,
                    }}
                  >
                    {/*
               * PLAY BUTTON
               */}

                    <Tooltip
                      title={
                        audioError
                          ? "Audio unavailable"
                          : isPlaying
                            ? "Pause"
                            : "Play"
                      }
                    >
                      <span>
                        <IconButton
                          onClick={
                            togglePlay
                          }
                          disabled={
                            audioError
                          }
                          aria-label={
                            isPlaying
                              ? "Pause voice message"
                              : "Play voice message"
                          }
                          size="small"
                          sx={{
                            width: 38,
                            height: 38,
                            flexShrink: 0,

                            bgcolor:
                              voiceColor,

                            color:
                              isSender &&
                                mode ===
                                "light"
                                ? theme
                                  .palette
                                  .chat
                                  .sender
                                : theme
                                  .palette
                                  .text
                                  .primary,

                            "&:hover":
                            {
                              bgcolor:
                                voiceColor,
                              opacity:
                                0.88,
                            },

                            "&:active":
                            {
                              transform:
                                "scale(0.94)",
                            },

                            transition:
                              "transform 0.15s ease, opacity 0.15s ease",
                          }}
                        >
                          {audioLoading ? (
                            <CircularProgress
                              size={17}
                              thickness={
                                3
                              }
                              color="inherit"
                            />
                          ) : audioError ? (
                            <AlertCircle
                              size={18}
                            />
                          ) : isPlaying ? (
                            <Pause
                              size={18}
                              strokeWidth={
                                2.5
                              }
                            />
                          ) : (
                            <Play
                              size={18}
                              strokeWidth={
                                2.5
                              }
                              style={{
                                marginLeft:
                                  2,
                              }}
                            />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>

                    {/*
               * WAVEFORM
               */}

                    <Box
                      onClick={
                        handleSeek
                      }
                      role="slider"
                      aria-label="Voice message progress"
                      aria-valuemin={0}
                      aria-valuemax={
                        audioDuration || 0
                      }
                      aria-valuenow={
                        currentTime
                      }
                      tabIndex={0}
                      sx={{
                        position:
                          "relative",
                        flex: 1,
                        height: 34,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "3px",
                        cursor:
                          audioDuration >
                            0
                            ? "pointer"
                            : "default",
                        overflow:
                          "hidden",

                        "&:focus-visible":
                        {
                          outline:
                            `2px solid ${voiceColor}`,
                          outlineOffset:
                            2,
                          borderRadius:
                            1,
                        },
                      }}
                    >
                      {waveform.map(
                        (
                          height,
                          index
                        ) => {
                          const barProgress =
                            (index /
                              waveform.length) *
                            100;

                          const played =
                            barProgress <=
                            playbackPercentage;

                          return (
                            <Box
                              key={
                                index
                              }
                              sx={{
                                width: 3,
                                height: `${height}%`,
                                minHeight: 5,
                                maxHeight: 30,
                                flexShrink:
                                  0,
                                borderRadius:
                                  999,

                                bgcolor:
                                  played
                                    ? voiceColor
                                    : voiceColor,


                                opacity:
                                  played
                                    ? 1
                                    : 0.32,

                                transformOrigin:
                                  "center",

                                transform:
                                  isPlaying &&
                                    played
                                    ? `scaleY(${index %
                                      3 ===
                                      0
                                      ? 1.08
                                      : index %
                                        2 ===
                                        0
                                        ? 0.92
                                        : 1
                                    })`
                                    : "scaleY(1)",

                                transition:
                                  "opacity 0.18s ease, transform 0.18s ease",
                              }}
                            />
                          );
                        }
                      )}
                    </Box>

                    {/*
               * DURATION
               */}

                    <Typography
                      variant="caption"
                      sx={{
                        minWidth:
                          38,
                        textAlign:
                          "right",
                        fontSize:
                          "0.7rem",
                        lineHeight: 1,
                        fontWeight: 500,
                        opacity: 0.8,
                        color:
                          voiceColor,
                        fontVariantNumeric:
                          "tabular-nums",
                      }}
                    >
                      {formatDuration(
                        isPlaying
                          ? currentTime
                          : audioDuration
                      )}
                    </Typography>

                    {/*
               * READ STATUS
               */}

                    <Box
                      sx={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        ml: 0.15,
                      }}
                    >
                      {getTickIcon()}
                    </Box>
                  </Box>

                  {audioError && (
                    <Typography
                      variant="caption"
                      sx={{
                        display:
                          "block",
                        px: 0.8,
                        pb: 0.3,
                        color:
                          "error.main",
                        opacity:
                          0.9,
                      }}
                    >
                      Unable to play
                      this voice
                      message.
                    </Typography>
                  )}
                </>
              )}
          </Box>
        )}

      {/*
   * ===================================================
   * DOCUMENT
   * ===================================================
   */}

      {type ===
        "DOCUMENT" && (
          <Box
            sx={{
              display:
                "flex",
              flexDirection:
                "column",
              ml: isSender
                ? 0
                : 2,
              mb: 1,
              border:
                "1px solid",
              borderColor:
                mode ===
                  "light"
                  ? theme
                    .palette
                    .secondary
                    .main
                  : theme
                    .palette
                    .secondary
                    .contrastText,
              borderRadius: 2,
              width: {
                xs: 230,
                sm: 250,
              },
              overflow:
                "hidden",
              bgcolor:
                theme.palette
                  .background
                  .paper,
            }}
          >
            <Box
              sx={{
                width:
                  "100%",
                height: 190,
                display:
                  "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                backgroundColor:
                  mode ===
                    "light"
                    ? theme
                      .palette
                      .secondary
                      .main
                    : theme
                      .palette
                      .secondary
                      .contrastText,
                overflow:
                  "hidden",
              }}
            >
              <FileCard
                mediaUrl={
                  mediaUrl
                }
                fileName={
                  fileName
                }
                theme={
                  theme
                }
              />
            </Box>

            <Box
              sx={{
                px: 1.2,
                pt: 1,
                pb: 1,
              }}
            >
              <Typography
                fontWeight={600}
                noWrap
                title={
                  fileName
                }
              >
                {fileName ||
                  "Document"}
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                gap={0.8}
                mt={0.7}
              >

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {fileType}
                </Typography>

                {typeof fileSize ===
                  "number" && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      •{" "}
                      {formatFileSize(
                        fileSize
                      )}
                    </Typography>
                  )}

                {mediaUrl && (
                  <Tooltip title="Download">
                    <IconButton
                      onClick={
                        handleDownload
                      }
                      disabled={
                        downloading
                      }
                      size="small"
                      sx={{
                        ml: "auto",
                        width: 30,
                        height: 30,
                        bgcolor:
                          mode ===
                            "light"
                            ? theme
                              .palette
                              .secondary
                              .main
                            : theme
                              .palette
                              .secondary
                              .contrastText,
                        color:
                          mode ===
                            "light"
                            ? theme
                              .palette
                              .secondary
                              .contrastText
                            : theme
                              .palette
                              .secondary
                              .main,

                        "&:hover":
                        {
                          backgroundColor: mode ===
                            "light"
                            ? theme
                              .palette
                              .secondary
                              .main
                            : theme
                              .palette
                              .secondary
                              .contrastText,

                          opacity:
                            0.85,
                        },
                      }}
                    >
                      {downloading ? (
                        <CircularProgress
                          size={15}
                          color="inherit"
                        />
                      ) : (
                        <Download
                          size={16}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Box>
        )}

      {/*
   * ===================================================
   * MESSAGE TIMESTAMP
   * ===================================================
   */}

      <Typography
        variant="body2"
        sx={{
          mt: 0.3,
          fontSize:
            "0.72rem",
          color:
            "text.secondary",
          px: 0.4,
        }}
      >
        {formatTime(
          timeStamp
        )}
      </Typography>

      {/*
   * ===================================================
   * TYPING INDICATOR
   * ===================================================
   */}

      {type ===
        "TEXT" &&
        text != null &&
        !isSender && (
          <TypingIndicator
            conversationId={
              selectedId!
            }
            currentUserId={
              currentUserId!
            }
          />
        )}
    </Box>

  );
}
