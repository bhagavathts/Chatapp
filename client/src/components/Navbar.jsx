import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Box,
  IconButton,
  Drawer,
  TextField,
  InputAdornment,
  Tooltip,
  alpha,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { SearchContext } from "../context/SearchContext";
import { NotificationContext } from "../context/NotificationContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { setSearchQuery } = useContext(SearchContext);
  const { counts } = useContext(NotificationContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("publicKey");
    localStorage.removeItem("privateKey");
    navigate("/");
  };

  // Function to handle opening search
  const handleOpenSearch = () => {
    setSearchOpen(true);
    // Navigate to chat page when opening search
    navigate("/chat");
  };

  // Function to handle closing search
  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchText("");
    setSearchQuery("");
  };

  // Function to handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchText);
    setSearchOpen(false); // Close the drawer after search
  };

  // Auto-focus search input when drawer opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [searchOpen]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          backdropFilter: "blur(20px)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, py: 0.5 }}>
          {/* Logo / Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
            onClick={() => navigate("/chat")}
          >
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                p: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                letterSpacing: "0.5px",
                display: { xs: "none", sm: "block" },
              }}
            >
              SecureChat
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Search Button - Now visible on all screen sizes */}
            <Tooltip title="Search users" arrow>
              <IconButton
                sx={{
                  color: "#fff",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={handleOpenSearch}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            {/* Chat Button */}
            <Tooltip title="Messages" arrow>
              <IconButton
                sx={{
                  color: "#fff",
                  bgcolor:
                    counts.unreadChats > 0
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={() => navigate("/chat")}
              >
                <Badge
                  color="error"
                  badgeContent={counts.unreadChats}
                  invisible={counts.unreadChats === 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Friend Requests Button */}
            <Tooltip title="Friend Requests" arrow>
              <IconButton
                sx={{
                  color: "#fff",
                  bgcolor:
                    counts.friendRequests > 0
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={() => navigate("/requests")}
              >
                <Badge
                  color="error"
                  badgeContent={counts.friendRequests}
                  invisible={counts.friendRequests === 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <PersonAddAltIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Divider */}
            <Box
              sx={{
                width: 1,
                height: 32,
                bgcolor: "rgba(255, 255, 255, 0.2)",
                mx: 0.5,
              }}
            />

            {/* Logout Button */}
            <Tooltip title="Logout" arrow>
              <IconButton
                sx={{
                  color: "#fff",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 82, 82, 0.2)",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={logout}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Full Screen Search Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={handleCloseSearch}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100%",
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {/* Search Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton onClick={handleCloseSearch}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Search Users
          </Typography>
        </Box>

        {/* Search Form */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            maxWidth: 600,
            mx: "auto",
            width: "100%",
          }}
        >
          <TextField
            inputRef={searchInputRef}
            fullWidth
            variant="outlined"
            placeholder="Search by username, name, or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#667eea" }} />
                </InputAdornment>
              ),
              sx: {
                fontSize: "1.1rem",
                py: 1.5,
                borderRadius: 3,
                bgcolor: alpha("#667eea", 0.05),
              },
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: alpha("#667eea", 0.3),
                  borderWidth: 2,
                },
                "&:hover fieldset": {
                  borderColor: "#667eea",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                },
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <IconButton
              type="submit"
              sx={{
                bgcolor: "#667eea",
                color: "white",
                flexGrow: 1,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#5a67d8",
                },
              }}
            >
              <SearchIcon />
              <Typography sx={{ ml: 1 }}>Search</Typography>
            </IconButton>
            <IconButton
              onClick={handleCloseSearch}
              sx={{
                border: "2px solid #667eea",
                color: "#667eea",
                flexGrow: 1,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: alpha("#667eea", 0.1),
                },
              }}
            >
              <CloseIcon />
              <Typography sx={{ ml: 1 }}>Cancel</Typography>
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}