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
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  MoreVertical,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";

interface User {
  id: string;
  userName: string;
}

interface SidebarProps {
  selectedUser: string | null;
  onSelectUser: (user: string) => void;
  users: string[];
}

export default function Sidebar({ 
  selectedUser, 
  onSelectUser, 
  users: initialUsers 
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Debounced fetch function
  const fetchUsers = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        // Use initial users when no search term
        setSearchedUsers(
          initialUsers.map(name => ({ 
            id: name.toLowerCase(), 
            userName: name 
          }))
        );
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
    }, 300),
    [initialUsers]
  );

  // Trigger search when term changes
  useEffect(() => {
    fetchUsers(searchTerm);
  }, [searchTerm, fetchUsers]);

  // Extract userNames for display
  const displayUsers = searchedUsers.length > 0 
    ? searchedUsers.map(user => user.userName)
    : initialUsers;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (error) setError(null);
  };

  const getUserForDisplay = (userName: string) => {
    return searchedUsers.find(u => u.userName === userName) || 
           initialUsers.find(name => name === userName);
  };

  return (
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
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src="/logo.png"
            alt="Nestfinity logo"
            width={45}
            height={45}
            style={{ borderRadius: "50%" }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Nestfinity
          </Typography>
        </Box>
        <Box>
          <IconButton size="small">
            <MessageCircle size={20} />
          </IconButton>
          <IconButton size="small">
            <MoreVertical size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Search */}
      <Box p={1.5}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={handleSearchChange}
          error={!!error}
          helperText={error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Search size={18} color={error ? "error" : "inherit"} />
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      {/* Chat List */}
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {isLoading && searchTerm ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={100}
          >
            <CircularProgress size={24} />
          </Box>
        ) : error && searchTerm ? (
          <Box p={2} textAlign="center">
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        ) : displayUsers.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary" variant="body2">
              {searchTerm ? `No users found for "${searchTerm}"` : "No users available"}
            </Typography>
          </Box>
        ) : (
          displayUsers.map((userName, index) => {
            const user = getUserForDisplay(userName);
            return (
              <ListItem
                key={user?.id || `user-${index}`}
                disablePadding
              >
                <ListItemButton
                  selected={selectedUser === userName}
                  onClick={() => onSelectUser(userName)}
                  sx={{ 
                    px: 2,
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 56 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.main',
                      fontSize: '1rem'
                    }}>
                      {userName[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText 
                    primary={userName}
                    secondary="Click to start chat"
                    primaryTypographyProps={{
                      fontWeight: selectedUser === userName ? 600 : 400,
                      color: selectedUser === userName ? 'primary.main' : 'text.primary',
                    }}
                    secondaryTypographyProps={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                    }}
                    sx={{ flex: 1, ml: 1 }}
                  />
                  
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.75rem',
                      whiteSpace: "nowrap",
                      ml: 1,
                    }}
                  >
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>
    </Box>
  );
}