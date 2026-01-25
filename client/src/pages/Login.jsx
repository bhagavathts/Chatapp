import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://chatapp-fkvw.onrender.com/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;

      const keysRes = await axios.get(
        "https://chatapp-fkvw.onrender.com/users/my-keys",
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("publicKey", keysRes.data.publicKey);
      localStorage.setItem("privateKey", keysRes.data.privateKey);

      setToken(data.token);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Card
              elevation={12}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                {/* Header */}
                <Box textAlign="center" mb={3}>
                  <Typography variant="h4" fontWeight={700}>
                    Welcome Back
                  </Typography>
                  <Typography color="text.secondary">
                    Login to continue chatting securely
                  </Typography>
                </Box>

                {/* Form */}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  disabled={loading}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 3,
                    py: 1.2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, #667eea, #764ba2)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    ":hover": {
                      background:
                        "linear-gradient(90deg, #5a6eea, #6a3ba2)",
                    },
                  }}
                  onClick={login}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* Footer */}
                <Box textAlign="center" mt={3}>
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate("/register")}
                    disabled={loading}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
