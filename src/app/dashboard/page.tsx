"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  Menu,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const drawerWidth = 260;

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Chats");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const router = useRouter();

  const sidebarItems = [
    { text: "Chats", icon: <MessageCircle size={20} />, route: "/dashboard/chats" },
    { text: "Groups", icon: <Users size={20} />, route: "/dashboard/groups" },
    { text: "Settings", icon: <Settings size={20} />, route: "/dashboard/settings" },
    { text: "Logout", icon: <LogOut size={20} />, route: "" },
  ];

  const handleItemClick = (item: string, route: string) => {
    if (item === "Logout") {
      setLogoutOpen(true);
    } else {
      setSelectedItem(item);
      router.push(route);
    }
    setMobileOpen(false);
  };

  const handleUserClick = (username: string) => {
    router.push(`/dashboard/chats/${username.toLowerCase()}`);
    setMobileOpen(false);
  };

  const SidebarContent = (
    <>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          ChatApp
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={selectedItem === item.text}
              onClick={() => handleItemClick(item.text, item.route)}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  "&:hover": { bgcolor: "primary.light" },
                },
              }}
            >
              <ListItemIcon sx={{ color: "primary.main" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* WhatsApp-style user list */}
      <List sx={{ mt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleUserClick("Alice")}>
            <ListItemIcon>
              <Avatar src="/user1.jpg" alt="Alice" />
            </ListItemIcon>
            <ListItemText
              primary="Alice"
              secondary="Hey! Are you there?"
              primaryTypographyProps={{ fontWeight: "medium" }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleUserClick("Bob")}>
            <ListItemIcon>
              <Avatar src="/user2.jpg" alt="Bob" />
            </ListItemIcon>
            <ListItemText
              primary="Bob"
              secondary="Let's catch up later!"
              primaryTypographyProps={{ fontWeight: "medium" }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { md: "none" } }}
          >
            <Menu />
          </IconButton>

          {/* Search */}
          <TextField
            placeholder="Search..."
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400, mx: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />

          {/* Right side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton>
              <Bell />
            </IconButton>
            <Avatar alt="User Profile" src="/profile.jpg" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid #e5e5e5",
          },
        }}
        open
      >
        {SidebarContent}
      </Drawer>

      {/* Sidebar Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: "background.paper",
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Chat Window */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          pt: 8,
        }}
      >
        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
          }}
        >
          <Paper
            sx={{
              p: 2,
              mb: 1,
              maxWidth: "60%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "12px 12px 12px 0px",
            }}
          >
            Hello! How are you doing today?
          </Paper>
          <Paper
            sx={{
              p: 2,
              mb: 1,
              maxWidth: "60%",
              ml: "auto",
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              borderRadius: "12px 12px 0px 12px",
            }}
          >
            I'm doing great, thanks! How about you?
          </Paper>
        </Box>

        {/* Chat Input */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            borderTop: "1px solid #e5e5e5",
            bgcolor: "background.paper",
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            size="small"
          />
          <IconButton
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <Send size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Logout Confirmation Modal */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLogoutOpen(false);
              console.log("User logged out"); // Replace with real logout logic
            }}
            color="primary"
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
