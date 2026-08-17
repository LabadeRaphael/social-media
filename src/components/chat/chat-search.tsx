"use client";

import {
  Box,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowLeft,
  X,
} from "lucide-react";

interface ChatSearchProps {
  search: string;
  setSearch: (value: string) => void;
  onClose: () => void;
  isSearching: boolean;
  searchResults: any[];
}

export default function ChatSearch({
  search,
  setSearch,
  onClose,
  isSearching,
  searchResults,
}: ChatSearchProps) {
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        p={2}
      >
        <IconButton onClick={onClose}>
          <ArrowLeft />
        </IconButton>

        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search messages..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          InputProps={{
            endAdornment:
              search && (
                <IconButton
                  size="small"
                  onClick={() => setSearch("")}
                >
                  <X size={18} />
                </IconButton>
              ),
          }}
        />
      </Box>

      {search.trim() !== "" && (
        <Box
          sx={{
            maxHeight: 220,
            overflowY: "auto",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {isSearching && (
            <Box p={2}>
              <LinearProgress
                sx={{
                  height: 4,
                  borderRadius: 2,
                }}
              />
            </Box>
          )}

          {!isSearching &&
            searchResults.length === 0 && (
              <Box
                p={3}
                textAlign="center"
              >
                <Typography color="text.secondary">
                  No matching messages
                </Typography>
              </Box>
            )}
        </Box>
      )}
    </>
  );
}