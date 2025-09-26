"use client";

import {
  Box,
  Typography,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
  Theme,
} from "@mui/material";
import {
  Search,
  MoreVertical,
  MessageCircle,
  Smile,
  Paperclip,
  Mic,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
export default function WhatsAppClone() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const users = ["Alice", "Bob", "Charlie", "David"];

  return (
    <Box display="flex" height="100vh" bgcolor="background.default">
      {/* Sidebar */}
      {(!isMobile || (isMobile && !selectedChat)) && (
        <Box
          width={{ xs: "100%", md: "30%" }}
          borderRight="1px solid"
          borderColor="divider"
          display="flex"
          flexDirection="column"
        >
          {/* Sidebar Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            bgcolor="background.paper"
          >
            <Image
              src="/logo.png"
              alt="Nestfinity logo"
              width={45}
              height={45}
              style={{ borderRadius: "50%" }}
            />
            <Typography variant="h5"
              sx={{
                color: mode === "light" ? theme.palette.text.primary : theme.palette.secondary.contrastText,
                fontWeight: "bold",
              }
              }
            >
              Nestfinity
            </Typography>
            {/* <Avatar alt="Me" src="/me.png" /> */}
            <Box>
              <IconButton>
                <MessageCircle />
              </IconButton>
              <IconButton>
                <MoreVertical />
              </IconButton>
            </Box>
          </Box>

          {/* Search */}
          <Box p={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search or start new chat"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Divider />

          {/* Chat List */}
          <List sx={{ overflowY: "auto", flex: 1 }}>
            {users.map((user, i) => (
              <ListItem
                button
                key={i}
                onClick={() => setSelectedChat(user)}
              >
                <ListItemAvatar>
                  <Avatar>{user[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user} secondary="Last message..." />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  12:45pm
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Chat Area */}
      {(!isMobile || (isMobile && selectedChat)) && (
        <Box flex={1} display="flex" flexDirection="column">
          {/* Chat Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            bgcolor="background.paper"
            borderBottom="1px solid"
            borderColor="divider"
          >
            <Box display="flex" alignItems="center" gap={2}>
              {isMobile && (
                <IconButton onClick={() => setSelectedChat(null)}>
                  <ArrowLeft />
                </IconButton>
              )}
              <Avatar>{selectedChat ? selectedChat[0] : "?"}</Avatar>
              <Box>
                <Typography variant="subtitle1">{selectedChat}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Online
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton>
                <Search />
              </IconButton>
              <IconButton>
                <MoreVertical />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box flex={1} p={2} overflow="auto" bgcolor="background.default">
            <Box mb={2}>
              <Typography
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "inline-block",
                  p: 1.2,
                  borderRadius: 2,
                }}
              >
                Hello 👋
              </Typography>
            </Box>
            <Box mb={2} display="flex" justifyContent="flex-end">
              <Typography
                sx={{
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  display: "inline-block",
                  p: 1.2,
                  borderRadius: 2,
                }}
              >
                Hi {selectedChat}! 😄
              </Typography>
            </Box>
          </Box>

          {/* Chat Input */}
          <Box
            display="flex"
            alignItems="center"
            p={1}
            borderTop="1px solid"
            borderColor="divider"
            bgcolor="background.paper"
          >
            <IconButton>
              <Smile />
            </IconButton>
            <IconButton>
              <Paperclip />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              size="small"
              sx={{ mx: 1 }}
            />
            <IconButton color="primary">
              <Mic />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
