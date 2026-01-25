import { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import FriendsList from "../components/FriendsList";
import ChatBox from "../components/ChatBox";
import UserSearch from "../components/UserSearch";
import { Box, Typography, Grid, Paper, IconButton } from "@mui/material";
import { SearchContext } from "../context/SearchContext";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

export default function Chat() {
  const [activeFriend, setActiveFriend] = useState(null);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);

  const handleSelectFriend = (friend) => {
    setActiveFriend(friend);
    // Clear search query when selecting a friend to chat with
    setSearchQuery("");
  };

  const handleBackToList = () => {
    setActiveFriend(null);
  };

  const handleBackFromSearch = () => {
    // Clear search query to go back to friends list
    setSearchQuery("");
  };

  return (
    <>
      <Navbar />

      {/* ROOT CHAT WRAPPER */}
      <Box
        sx={{
          height: "calc(100vh - 64px)",
          width: "100%",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* When searching, show UserSearch in full screen */}
        {searchQuery ? (
          <Paper
            elevation={3}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
              boxShadow: { xs: "none", md: 3 },
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: "1px solid #eee",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconButton
                onClick={handleBackFromSearch}
                sx={{
                  color: "#667eea",
                  "&:hover": {
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography fontWeight={600}>
                Search Results
              </Typography>
            </Box>
            
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflowY: "auto",
                width: "100%",
              }}
            >
              <UserSearch 
                onSelectFriend={handleSelectFriend} 
                onBack={handleBackFromSearch}
              />
            </Box>
          </Paper>
        ) : (
          <Grid
            container
            sx={{
              height: "100%",
              width: "100%",
              flexWrap: "nowrap",
              margin: 0,
            }}
          >
            {/* SIDEBAR - Hidden on mobile when chat is active */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                height: "100%",
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                flexShrink: 0,
                display: { 
                  xs: activeFriend ? "none" : "flex",
                  md: "flex"
                },
                flexDirection: "column",
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  height: "100%",
                  width: "100%",
                  borderRadius: 0,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: { xs: "none", md: 3 },
                  borderRight: { xs: "none", md: "none" },
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: "1px solid #eee",
                    flexShrink: 0,
                  }}
                >
                  <Typography fontWeight={600}>
                    Chats
                  </Typography>
                </Box>

                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflowY: "auto",
                    width: "100%",
                  }}
                >
                  <FriendsList onSelect={handleSelectFriend} />
                </Box>
              </Paper>
            </Grid>

            {/* CHAT AREA - Hidden on mobile when no chat is active */}
            <Grid
              item
              xs={12}
              md={9}
              sx={{
                height: "100%",
                flexGrow: 1,
                minWidth: 0,
                display: { 
                  xs: activeFriend ? "flex" : "none",
                  md: "flex"
                },
                flexDirection: "column",
                borderLeft: { md: "none" },
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  height: "100%",
                  width: "100%",
                  borderRadius: 0,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: { xs: "none", md: 3 },
                }}
              >
                {activeFriend ? (
                  <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    {/* Mobile Back Button */}
                    <Box
                      sx={{
                        display: { xs: "flex", md: "none" },
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                        bgcolor: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        onClick={handleBackToList}
                        sx={{
                          color: "#667eea",
                          "&:hover": {
                            bgcolor: "rgba(102, 126, 234, 0.1)",
                          },
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                      <Typography variant="h6" fontWeight={600} sx={{ color: "#1a1a1a" }}>
                        Back to Chats
                      </Typography>
                    </Box>

                    {/* ChatBox */}
                    <Box sx={{ flexGrow: 1, overflow: "hidden", width: "100%" }}>
                      <ChatBox
                        activeFriendId={activeFriend._id}
                        activeFriendName={activeFriend.name}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      p: 3,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={600}>
                        Welcome to Secure Chat
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Select a conversation to start chatting securely
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
}