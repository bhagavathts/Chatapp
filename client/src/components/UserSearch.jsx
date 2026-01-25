import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Chip,
  Fade,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import {
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  PersonSearch as PersonSearchIcon,
  ArrowBack as ArrowBackIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

export default function UserSearch({ onSelectFriend, onBack }) {
  const { token } = useContext(AuthContext);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [users, setUsers] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setUsers([]);
      setUserStatuses({});
      return;
    }

    setLoading(true);
    axios
      .get(`https://chatapp-fkvw.onrender.com/users/search?q=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        setUsers(res.data);

        // Fetch status for each user
        const statuses = {};
        for (const user of res.data) {
          try {
            const statusRes = await axios.get(
              `https://chatapp-fkvw.onrender.com/friends/status/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            statuses[user._id] = statusRes.data.status;
          } catch (error) {
            console.error("Error fetching status:", error);
            statuses[user._id] = "none";
          }
        }
        setUserStatuses(statuses);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setUserStatuses({});
        setLoading(false);
      });
  }, [searchQuery, token]);

  const sendRequest = async (id) => {
    try {
      await axios.post(
        `https://chatapp-fkvw.onrender.com/friends/request/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update status to pending
      setUserStatuses((prev) => ({
        ...prev,
        [id]: "pending",
      }));
    } catch (error) {
      if (error.response?.data?.msg) {
        alert(error.response.data.msg);
      } else {
        alert("Failed to send friend request");
      }
    }
  };

  const acceptRequest = async (userId) => {
    try {
      // First find the friend request ID
      const requestsRes = await axios.get(
        "https://chatapp-fkvw.onrender.com/friends/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const friendRequest = requestsRes.data.find(
        (req) => req.from._id === userId
      );

      if (friendRequest) {
        await axios.post(
          `https://chatapp-fkvw.onrender.com/friends/accept/${friendRequest._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update status to friends
        setUserStatuses((prev) => ({
          ...prev,
          [userId]: "friends",
        }));
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept friend request");
    }
  };

  const handleChatClick = (user) => {
    if (onSelectFriend) {
      onSelectFriend(user);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      setSearchQuery("");
    }
  };

  const renderActionButton = (user) => {
    const status = userStatuses[user._id];

    switch (status) {
      case "friends":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ChatIcon sx={{ fontSize: "0.9rem" }} />}
              onClick={() => handleChatClick(user)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                py: 0.6,
                bgcolor: "#3b82f6",
                fontSize: "0.8rem",
                boxShadow: "0 2px 6px rgba(59, 130, 246, 0.2)",
                "&:hover": {
                  bgcolor: "#2563eb",
                  boxShadow: "0 3px 8px rgba(59, 130, 246, 0.3)",
                },
              }}
            >
              Chat
            </Button>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.7rem",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              Start conversation
            </Typography>
          </Box>
        );

      case "pending":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Chip
              icon={<ScheduleIcon sx={{ fontSize: "0.85rem" }} />}
              label="Pending"
              size="small"
              sx={{
                bgcolor: "#f59e0b",
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
                px: 1.2,
                height: 28,
                boxShadow: "0 2px 6px rgba(245, 158, 11, 0.2)",
                "& .MuiChip-icon": {
                  color: "white",
                  mr: 0.5,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.7rem",
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              Request sent
            </Typography>
          </Box>
        );

      case "received":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckIcon sx={{ fontSize: "0.9rem" }} />}
              onClick={() => acceptRequest(user._id)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                py: 0.6,
                bgcolor: "#10b981",
                fontSize: "0.8rem",
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                "&:hover": {
                  bgcolor: "#059669",
                  boxShadow: "0 3px 8px rgba(16, 185, 129, 0.3)",
                },
              }}
            >
              Accept
            </Button>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.7rem",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              Wants to connect
            </Typography>
          </Box>
        );

      case "none":
      default:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon sx={{ fontSize: "0.9rem" }} />}
              onClick={() => sendRequest(user._id)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                py: 0.6,
                fontSize: "0.8rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 2px 6px rgba(102, 126, 234, 0.2)",
                "&:hover": {
                  boxShadow: "0 3px 8px rgba(102, 126, 234, 0.3)",
                },
              }}
            >
              Add Friend
            </Button>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.7rem",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              Click to connect
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        position: "relative",
      }}
    >
      {/* Header */}
      {searchQuery && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 0,
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 2,
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={handleBackClick}
              sx={{
                mr: 1.5,
                color: "#64748b",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1e293b",
                  fontSize: "1.1rem",
                }}
              >
                Search Results
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {loading
                  ? "Searching..."
                  : `${users.length} ${users.length === 1 ? "user" : "users"} found`}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setSearchQuery("")}
              sx={{
                textTransform: "none",
                fontSize: "0.8rem",
                color: "#64748b",
                "&:hover": {
                  color: "#334155",
                  bgcolor: "#f1f5f9",
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Paper>
      )}

      {/* Results List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: { xs: 1.5, md: 2 },
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#cbd5e1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#94a3b8",
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              gap: 2,
            }}
          >
            <CircularProgress 
              size={48} 
              sx={{ 
                color: "#667eea",
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }} 
            />
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Searching users...
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {users.map((u, index) => (
              <Fade in={true} timeout={200 + index * 50} key={u._id}>
                <Paper
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      borderColor: "#cbd5e1",
                    },
                  }}
                >
                  <ListItem
                    sx={{
                      py: 2,
                      px: { xs: 2, md: 2.5 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {/* User Info Section */}
                    <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          width: 52,
                          height: 52,
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
                        }}
                      >
                        {u.name?.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#1e293b",
                            lineHeight: 1.3,
                            mb: 0.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            display: "block",
                          }}
                        >
                          {userStatuses[u._id] === "friends"
                            ? "Friend • Messages are end-to-end encrypted"
                            : userStatuses[u._id] === "pending"
                            ? "Friend request pending"
                            : userStatuses[u._id] === "received"
                            ? "Sent you a friend request"
                            : "Search result • Not connected yet"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Button Section */}
                    <Box sx={{ ml: 2, flexShrink: 0 }}>
                      {renderActionButton(u)}
                    </Box>
                  </ListItem>
                </Paper>
              </Fade>
            ))}
          </List>
        )}

        {/* Empty Search Results */}
        {searchQuery && users.length === 0 && !loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              textAlign: "center",
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "rgba(226, 232, 240, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <PersonSearchIcon 
                sx={{ 
                  fontSize: 48, 
                  color: "#94a3b8",
                  opacity: 0.7 
                }} 
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#475569",
                mb: 1,
                fontSize: "1.1rem",
              }}
            >
              No Users Found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                maxWidth: "300px",
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Try searching with a different name or username
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBackClick}
                startIcon={<ArrowBackIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "#cbd5e1",
                  color: "#64748b",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    borderColor: "#94a3b8",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                Back to Friends
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSearchQuery("")}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "#cbd5e1",
                  color: "#64748b",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    borderColor: "#94a3b8",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                Clear Search
              </Button>
            </Box>
          </Box>
        )}

        {/* Initial State - No Search */}
        {!searchQuery && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              textAlign: "center",
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "rgba(226, 232, 240, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <PersonSearchIcon 
                sx={{ 
                  fontSize: 48, 
                  color: "#667eea",
                  opacity: 0.7 
                }} 
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#475569",
                mb: 1,
                fontSize: "1.1rem",
              }}
            >
              Search for Friends
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                maxWidth: "300px",
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Use the search bar above to find and connect with friends
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "#f1f5f9",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                >
                  🔍 Search by name
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "#f1f5f9",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                >
                  👤 Search by username
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer Info */}
      {searchQuery && users.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            borderRadius: 0,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 500,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  display: "inline-block",
                }}
              />
              All connections are secured with end-to-end encryption
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: "#64748b",
                "&:hover": {
                  color: "#334155",
                  bgcolor: "#f1f5f9",
                },
              }}
            >
              Back to Friends
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}