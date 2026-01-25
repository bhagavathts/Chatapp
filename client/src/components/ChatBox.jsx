import { useEffect, useState, useRef } from "react";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  IconButton,
  Paper,
  Avatar,
  Divider,
  InputAdornment
} from "@mui/material";
import { 
  Image as ImageIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon
} from "@mui/icons-material";
import axios from "axios";

const base64ToBuffer = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
};

const importPublicKey = (key) =>
  crypto.subtle.importKey(
    "spki",
    base64ToBuffer(key),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

const importPrivateKey = (key) =>
  crypto.subtle.importKey(
    "pkcs8",
    base64ToBuffer(key),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );

const encryptMessage = async (text, publicKey) => {
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    new TextEncoder().encode(text)
  );
  return bufferToBase64(encrypted);
};

const safeDecrypt = async (cipher, privateKey) => {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      base64ToBuffer(cipher)
    );
    const text = new TextDecoder().decode(decrypted);
    return text;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "[Encrypted message - cannot decrypt]";
  }
};

const generateAESKey = async () => {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

const encryptImageWithAES = async (imageData, aesKey) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    imageData
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return bufferToBase64(combined.buffer);
};

const decryptImageWithAES = async (encryptedData, aesKey) => {
  const combined = base64ToBuffer(encryptedData);
  const iv = new Uint8Array(combined.slice(0, 12));
  const data = new Uint8Array(combined.slice(12));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    data
  );
  
  return decrypted;
};

const exportAESKey = async (aesKey) => {
  const exported = await crypto.subtle.exportKey("raw", aesKey);
  return bufferToBase64(exported);
};

const importAESKey = async (keyData) => {
  return await crypto.subtle.importKey(
    "raw",
    base64ToBuffer(keyData),
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
};

const encryptAESKeyWithRSA = async (aesKeyString, rsaPublicKey) => {
  return await encryptMessage(aesKeyString, rsaPublicKey);
};

const decryptAESKeyWithRSA = async (encryptedAESKey, rsaPrivateKey) => {
  return await safeDecrypt(encryptedAESKey, rsaPrivateKey);
};

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return "Yesterday";
  } else {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

const getDateKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const groupMessagesByDate = (messages) => {
  const grouped = {};
  
  messages.forEach((msg) => {
    const dateKey = getDateKey(msg.createdAt);
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: msg.createdAt,
        messages: []
      };
    }
    grouped[dateKey].messages.push(msg);
  });

  return Object.values(grouped).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
};

export default function ChatBox({ activeFriendId, activeFriendName }) {
  const [ws, setWs] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendPublicKey, setFriendPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [myPublicKey, setMyPublicKey] = useState(null);

  const myUserId = localStorage.getItem("userId");
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadKeys = async () => {
      const storedPrivate = localStorage.getItem("privateKey");
      const storedPublic = localStorage.getItem("publicKey");
      
      if (storedPrivate) {
        const privKey = await importPrivateKey(storedPrivate);
        setPrivateKey(privKey);
      }
      
      if (storedPublic) {
        const pubKey = await importPublicKey(storedPublic);
        setMyPublicKey(pubKey);
      }
    };
    
    loadKeys();
  }, []);

  useEffect(() => {
    if (!activeFriendId) return;

    axios
      .get(`http://localhost:5000/users/public-key/${activeFriendId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(async (res) => {
        const key = await importPublicKey(res.data.publicKey);
        setFriendPublicKey(key);
      })
      .catch((err) => {
        console.error("Failed to load friend public key:", err);
        setFriendPublicKey(null);
      });
  }, [activeFriendId]);

  useEffect(() => {
    if (!activeFriendId || !privateKey) return;

    axios
      .get(`http://localhost:5000/messages/${activeFriendId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(async (res) => {
        const out = [];

        for (const m of res.data) {
          const senderId = m.sender.toString();
          const isMine = senderId === myUserId;

          if (m.type === 'image') {
            try {
              const aesKeyString = await decryptAESKeyWithRSA(m.encryptedAESKey, privateKey);
              const aesKey = await importAESKey(aesKeyString);
              const decryptedImageBuffer = await decryptImageWithAES(m.encryptedImage, aesKey);
              
              const blob = new Blob([decryptedImageBuffer], { type: m.imageMetadata.mimetype });
              const imageUrl = URL.createObjectURL(blob);

              out.push({
                sender: isMine ? "me" : senderId,
                type: 'image',
                imageUrl: imageUrl,
                imageMetadata: m.imageMetadata,
                createdAt: m.createdAt,
              });
            } catch (error) {
              console.error("Failed to decrypt image:", error);
              out.push({
                sender: isMine ? "me" : senderId,
                type: 'image',
                text: "[Failed to decrypt image]",
                createdAt: m.createdAt,
              });
            }
          } else {
            const decrypted = await safeDecrypt(m.text, privateKey);
            out.push({
              sender: isMine ? "me" : senderId,
              type: 'text',
              text: decrypted,
              createdAt: m.createdAt,
            });
          }
        }

        setMessages(out);
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [activeFriendId, privateKey, myUserId]);

  useEffect(() => {
    if (!privateKey) return;

    if (wsRef.current) {
      console.log("Closing existing WebSocket connection");
      wsRef.current.close();
    }

    console.log("Creating new WebSocket connection");
    const socket = new WebSocket(
      `ws://localhost:5000?token=${localStorage.getItem("token")}`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      const senderId = String(data.from);
      
      console.log("Received message from:", senderId);

      if (data.type === 'image') {
        try {
          const aesKeyString = await decryptAESKeyWithRSA(data.encryptedAESKey, privateKey);
          const aesKey = await importAESKey(aesKeyString);
          const decryptedImageBuffer = await decryptImageWithAES(data.encryptedImage, aesKey);
          
          const blob = new Blob([decryptedImageBuffer], { type: data.imageMetadata.mimetype });
          const imageUrl = URL.createObjectURL(blob);

          setMessages((prev) => [
            ...prev,
            { 
              sender: senderId === myUserId ? "me" : senderId, 
              type: 'image',
              imageUrl: imageUrl,
              imageMetadata: data.imageMetadata,
              createdAt: new Date().toISOString(),
            },
          ]);
        } catch (error) {
          console.error("Failed to decrypt image:", error);
        }
      } else {
        const decrypted = await safeDecrypt(data.text, privateKey);

        setMessages((prev) => [
          ...prev,
          { 
            sender: senderId === myUserId ? "me" : senderId, 
            type: 'text',
            text: decrypted,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = socket;
    setWs(socket);

    return () => {
      console.log("Cleaning up WebSocket");
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [privateKey, myUserId]); 

  const sendMessage = async () => {
    if (!msg.trim() || !friendPublicKey || !myPublicKey || !ws) {
      console.log("Cannot send message - missing requirements");
      return;
    }

    if (ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    try {
      const plainText = msg;

      const encryptedForFriend = await encryptMessage(plainText, friendPublicKey);
      const encryptedForMe = await encryptMessage(plainText, myPublicKey);

      ws.send(
        JSON.stringify({
          to: activeFriendId,
          type: 'text',
          text: encryptedForFriend,
          textForSender: encryptedForMe,
        })
      );

      console.log("Message sent");

      setMessages((prev) => [
        ...prev, 
        { 
          sender: "me",
          type: 'text',
          text: plainText,
          createdAt: new Date().toISOString(),
        }
      ]);
      setMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !friendPublicKey || !myPublicKey || !ws) return;

    if (ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    try {
      console.log("Encrypting image...");

      const arrayBuffer = await file.arrayBuffer();
      const aesKey = await generateAESKey();
      const encryptedImage = await encryptImageWithAES(arrayBuffer, aesKey);
      const aesKeyString = await exportAESKey(aesKey);
      const encryptedAESKeyForFriend = await encryptAESKeyWithRSA(aesKeyString, friendPublicKey);
      const encryptedAESKeyForMe = await encryptAESKeyWithRSA(aesKeyString, myPublicKey);
      const imageUrl = URL.createObjectURL(file);

      ws.send(
        JSON.stringify({
          to: activeFriendId,
          type: 'image',
          encryptedImage: encryptedImage,
          encryptedAESKey: encryptedAESKeyForFriend,
          senderEncryptedAESKey: encryptedAESKeyForMe,
          imageMetadata: {
            filename: file.name,
            mimetype: file.type,
            size: file.size
          }
        })
      );

      console.log("Image sent");

      setMessages((prev) => [
        ...prev,
        {
          sender: "me",
          type: 'image',
          imageUrl: imageUrl,
          imageMetadata: {
            filename: file.name,
            mimetype: file.type,
            size: file.size
          },
          createdAt: new Date().toISOString(),
        }
      ]);

      fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Box 
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        bgcolor: "#f5f5f5"
      }}
    >
      {/* Header - FIXED */}
      <Paper 
        elevation={2}
        sx={{ 
          px: 3,
          py: 2,
          borderRadius: 0,
          bgcolor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          flexShrink: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: "#1976d2",
              width: 45,
              height: 45,
              fontSize: "1.1rem",
              fontWeight: 600
            }}
          >
            {activeFriendName ? activeFriendName.charAt(0).toUpperCase() : "?"}
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "#1a1a1a",
                lineHeight: 1.2
              }}
            >
              {activeFriendName || "Select a chat"}
            </Typography>
           
          </Box>
        </Box>
      </Paper>

      {/* Messages Area - SCROLLABLE */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: "auto", 
          px: 3,
          py: 2,
          bgcolor: "#f0f2f5",
          backgroundImage: 'linear-gradient(to bottom, #f0f2f5 0%, #e4e6eb 100%)',
          '&::-webkit-scrollbar': {
            width: '8px',
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
        {groupedMessages.map((group, groupIndex) => (
          <Box key={groupIndex}>
            {/* Date Divider */}
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  px: 3,
                  py: 0.75,
                  borderRadius: 3,
                  border: "1px solid rgba(0, 0, 0, 0.06)"
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#65676b",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.3px"
                  }}
                >
                  {formatDate(group.date)}
                </Typography>
              </Paper>
            </Box>

            {/* Messages */}
            {group.messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: m.sender === "me" ? "flex-end" : "flex-start",
                  mb: 1.5,
                  animation: "fadeIn 0.3s ease-in"
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    maxWidth: m.type === 'image' ? "400px" : "65%",
                    px: m.type === 'image' ? 0.5 : 2,
                    py: m.type === 'image' ? 0.5 : 1.5,
                    borderRadius: m.sender === "me" 
                      ? "18px 18px 4px 18px" 
                      : "18px 18px 18px 4px",
                    bgcolor: m.sender === "me" ? "#0084ff" : "#ffffff",
                    color: m.sender === "me" ? "#ffffff" : "#1a1a1a",
                    boxShadow: m.sender === "me"
                      ? "0 1px 2px rgba(0, 132, 255, 0.3)"
                      : "0 1px 2px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s ease",
                    '&:hover': {
                      boxShadow: m.sender === "me"
                        ? "0 2px 8px rgba(0, 132, 255, 0.4)"
                        : "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }
                  }}
                >
                  {m.type === 'image' ? (
                    <Box>
                      {m.imageUrl ? (
                        <img 
                          src={m.imageUrl} 
                          alt="Shared" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '350px',
                            borderRadius: '14px',
                            display: 'block',
                            objectFit: 'cover'
                          }} 
                        />
                      ) : (
                        <Typography sx={{ p: 1.5 }}>
                          {m.text || "[Image]"}
                        </Typography>
                      )}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: "block", 
                          px: 1.5,
                          pb: 0.5,
                          pt: 0.5,
                          textAlign: "right",
                          color: m.sender === "me" ? "rgba(255,255,255,0.8)" : "#65676b",
                          fontSize: "0.7rem",
                          fontWeight: 500
                        }}
                      >
                        {formatTime(m.createdAt)}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography 
                        sx={{ 
                          wordWrap: "break-word",
                          fontSize: "0.95rem",
                          lineHeight: 1.4,
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        {m.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: "block", 
                          mt: 0.5, 
                          textAlign: "right",
                          color: m.sender === "me" ? "rgba(255,255,255,0.8)" : "#65676b",
                          fontSize: "0.7rem",
                          fontWeight: 500
                        }}
                      >
                        {formatTime(m.createdAt)}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area - FIXED */}
      <Paper 
        elevation={3}
        sx={{ 
          px: 2.5,
          py: 2,
          bgcolor: "#ffffff",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: 0,
          flexShrink: 0
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          
          <IconButton 
            onClick={() => fileInputRef.current?.click()}
            sx={{ 
              color: '#1976d2',
              bgcolor: '#e3f2fd',
              '&:hover': { 
                bgcolor: '#bbdefb',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s',
              width: 42,
              height: 42
            }}
          >
            <ImageIcon />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                bgcolor: '#f0f2f5',
                fontSize: '0.95rem',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                  borderWidth: '1px',
                },
              },
              '& .MuiOutlinedInput-input': {
                py: 1.5,
                px: 2.5,
              }
            }}
          />

          <IconButton 
            onClick={sendMessage}
            disabled={!msg.trim()}
            sx={{ 
              bgcolor: '#0084ff',
              color: '#ffffff',
              '&:hover': { 
                bgcolor: '#0073e6',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                bgcolor: '#e4e6eb',
                color: '#bcc0c4'
              },
              transition: 'all 0.2s',
              width: 42,
              height: 42
            }}
          >
            <SendIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}