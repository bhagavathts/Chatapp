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
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ---------- KEY GENERATION (UNCHANGED) ---------- */

const generateKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  return {
    publicKey: btoa(
      String.fromCharCode(...new Uint8Array(publicKey))
    ),
    privateKey: btoa(
      String.fromCharCode(...new Uint8Array(privateKey))
    ),
  };
};

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const { publicKey, privateKey } = await generateKeyPair();

      const res = await axios.post(
        "http://localhost:5000/auth/register",
        {
          name,
          email,
          password,
          publicKey,
          privateKey,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 201 || res.status === 200) {
        alert("Registered successfully! Please login.");
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1f4037, #99f2c8)",
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
                    Create Account
                  </Typography>
                  <Typography color="text.secondary">
                    Secure your chats with end-to-end encryption
                  </Typography>
                </Box>

                {/* Form */}
                <TextField
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />

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
                      "linear-gradient(90deg, #11998e, #38ef7d)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    ":hover": {
                      background:
                        "linear-gradient(90deg, #0f857c, #2fd16c)",
                    },
                  }}
                  onClick={register}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Register"
                  )}
                </Button>

                {/* Footer */}
                <Box textAlign="center" mt={3}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate("/")}
                    disabled={loading}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Login
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
