import {
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Paper,
  Fade,
  Chip
} from "@mui/material";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/friends/requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(() => {
        setRequests([]);
        setLoading(false);
      });
  }, []);

  const accept = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/friends/accept/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const reject = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/friends/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Navbar />

      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 4
        }}
      >
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 56,
                height: 56
              }}
            >
              <PersonAddIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Friend Requests
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {requests.length === 0
                  ? "No pending requests"
                  : `${requests.length} pending ${requests.length === 1 ? 'request' : 'requests'}`}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Requests Grid */}
        {requests.length > 0 ? (
          <Grid container spacing={3}>
            {requests.map((r, index) => (
              <Grid item xs={12} sm={6} md={4} key={r._id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                      transition: "all 0.3s ease",
                      border: "1px solid rgba(0,0,0,0.06)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2.5}>
                        {/* User Info */}
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: "#667eea",
                              width: 56,
                              height: 56,
                              fontSize: "1.5rem",
                              fontWeight: 600,
                              boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
                            }}
                          >
                            {r.from.name?.charAt(0).toUpperCase()}
                          </Avatar>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h6" 
                              fontWeight={600}
                              sx={{ 
                                mb: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {r.from.name}
                            </Typography>
                            <Chip
                              label="Friend Request"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                bgcolor: "#e3f2fd",
                                color: "#1976d2",
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Stack>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1.5}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => accept(r._id)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              py: 1.2,
                              borderRadius: 2,
                              bgcolor: "#10b981",
                              boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                              "&:hover": {
                                bgcolor: "#059669",
                                boxShadow: "0 6px 16px rgba(16,185,129,0.4)",
                              },
                            }}
                          >
                            Accept
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => reject(r._id)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              py: 1.2,
                              borderRadius: 2,
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              borderWidth: 2,
                              "&:hover": {
                                borderWidth: 2,
                                borderColor: "#dc2626",
                                bgcolor: "#fef2f2",
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        ) : (
          // Empty State
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "2px dashed rgba(0,0,0,0.1)",
              bgcolor: "white"
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: "0 auto 16px",
                bgcolor: "#f3f4f6",
                color: "#9ca3af"
              }}
            >
              <PersonAddIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              variant="h6"
              fontWeight={600}
              color="text.secondary"
              gutterBottom
            >
              No Pending Friend Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When someone sends you a friend request, it will appear here
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}