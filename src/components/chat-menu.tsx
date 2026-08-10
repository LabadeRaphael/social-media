"use client";

import {
  Menu,
  MenuItem,
} from "@mui/material";

import {
  Ban,
  Check,
  Trash2,
} from "lucide-react";

import DynamicModal from "./dynamic-modal";

interface ChatMenuProps {
  anchorEl: HTMLElement | null;
  isBlock: boolean;

  showBlockModal: boolean;
  showClearModal: boolean;

  onClose: () => void;

  onBlock: () => void;
  onUnblock: () => void;
  onClearChat: () => void;

  setShowBlockModal: (
    value: boolean
  ) => void;

  setShowClearModal: (
    value: boolean
  ) => void;
}

export default function ChatMenu({
  anchorEl,
  isBlock,
  showBlockModal,
  showClearModal,
  onClose,
  onBlock,
  onUnblock,
  onClearChat,
  setShowBlockModal,
  setShowClearModal,
}: ChatMenuProps) {
  const open = Boolean(anchorEl);

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
      >
        {isBlock ? (
          <MenuItem
            onClick={onUnblock}
          >
            <Check
              size={18}
              style={{
                marginRight: 8,
              }}
            />

            Unblock User
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              setShowBlockModal(true);
              onClose();
            }}
          >
            <Ban
              size={18}
              style={{
                marginRight: 8,
              }}
            />

            Block User
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            setShowClearModal(true);
            onClose();
          }}
        >
          <Trash2
            size={18}
            style={{
              marginRight: 8,
            }}
          />

          Clear Chat
        </MenuItem>
      </Menu>

      <DynamicModal
        open={showBlockModal}
        title="Block User?"
        description="You and this user will no longer be able to send messages to each other."
        confirmText="Block"
        confirmColor="error"
        onClose={() =>
          setShowBlockModal(false)
        }
        onConfirm={() => {
          onBlock();
          setShowBlockModal(false);
        }}
      />

      <DynamicModal
        open={showClearModal}
        title="Clear Chat?"
        description="This action will permanently delete all messages in this conversation."
        confirmText="Clear Chat"
        confirmColor="error"
        onClose={() =>
          setShowClearModal(false)
        }
        onConfirm={() => {
          onClearChat();
          setShowClearModal(false);
        }}
      />
    </>
  );
}