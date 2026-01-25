import {
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Paper,
  Fade
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  PersonOutline as PersonOutlineIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon
} from "@mui/icons-material";

export default function FriendsList({ onSelect }) {
  const [friends, setFriends] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    axios
      .get("https://chatapp-fkvw.onrender.com/friends/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setFriends(res.data))
      .catch(() => setFriends([]));
  }, []);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          bgcolor: "#ffffff"
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1a1a1a",
            fontSize: "1.25rem"
          }}
        >
          Messages
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#65676b",
            fontSize: "0.8rem"
          }}
        >
          {friends.length} {friends.length === 1 ? 'conversation' : 'conversations'}
        </Typography>
      </Paper>

      {/* Friends List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          bgcolor: "#f5f7fa",
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#bcc0c4',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8adb3',
          },
        }}
      >
        <List sx={{ p: 1.5 }}>
          {friends.map((friend, index) => (
            <Fade in={true} timeout={300 + index * 50} key={friend._id}>
              <Paper
                elevation={activeId === friend._id ? 3 : 0}
                sx={{
                  mb: 1,
                  borderRadius: 3,
                  overflow: "hidden",
                  border: activeId === friend._id 
                    ? "2px solid #667eea" 
                    : "1px solid rgba(0, 0, 0, 0.06)",
                  transition: "all 0.2s ease",
                  '&:hover': {
                    transform: activeId === friend._id ? 'none' : 'translateX(4px)',
                    boxShadow: activeId === friend._id 
                      ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <ListItemButton
                  selected={activeId === friend._id}
                  onClick={() => {
                    setActiveId(friend._id);
                    onSelect(friend);
                  }}
                  sx={{
                    py: 2,
                    px: 2,
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      "& .MuiTypography-root": {
                        color: "#fff",
                      },
                      "& .MuiAvatar-root": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      },
                    },
                    "&:hover": {
                      backgroundColor: activeId === friend._id
                        ? undefined
                        : "rgba(0, 0, 0, 0.02)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: "#667eea",
                      width: 50,
                      height: 50,
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {friend.name?.charAt(0).toUpperCase()}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={600}
                        sx={{
                          fontSize: "1rem",
                          mb: 0.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {friend.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: activeId === friend._id 
                            ? "rgba(255, 255, 255, 0.8)" 
                            : "#65676b",
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5
                        }}
                      >
                        <ChatBubbleOutlineIcon sx={{ fontSize: "0.9rem" }} />
                        Click to open chat
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Paper>
            </Fade>
          ))}
        </List>

        {/* Empty State */}
        {friends.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100% - 80px)",
              px: 3,
              textAlign: "center"
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#f3f4f6",
                color: "#9ca3af",
                mb: 2
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              variant="h6"
              fontWeight={600}
              color="text.secondary"
              gutterBottom
            >
              No Friends Yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 280 }}
            >
              Add friends to start chatting with them securely
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}