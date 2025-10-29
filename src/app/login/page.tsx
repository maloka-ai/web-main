'use client';

import {
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      await authService.login({ email, password });
      router.push('/home');
    } catch (error) {
      setErrorMessage('E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={styles.container}>
      <Box
        className={styles.card}
        sx={{
          p: {
            xs: 2,
            sm: 4,
          },
          overflow: 'auto',
        }}
      >
        <img
          src="/images/marca-medio@3x.png"
          alt="Lara Logo"
          className={styles.logo}
        />
        <Typography variant="h6" className={styles.title}>
          Converse com seus dados
        </Typography>
        <Typography
          variant="h6"
          className={`${styles.title} ${styles.subtitle}`}
        >
          e aumente suas vendas
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          fullWidth
          label="E-mail"
          type="email"
          variant="outlined"
          margin="normal"
          size={'small'}
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Senha"
          size={'small'}
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="normal"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlined />
                    ) : (
                      <VisibilityOutlined />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          className={styles.button}
          fullWidth
          size={'small'}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
        </Button>

        <Typography className={styles.forgot}>Esqueci a senha</Typography>

        <Box className={styles.divider} />

        <Typography className={styles.accountTitle}>
          Ainda não tem uma conta?
        </Typography>
        <Typography className={styles.accountSubtitle}>
          Solicite agora uma versão demo
        </Typography>
        <Button variant="outlined" className={styles.outlined} fullWidth>
          Solicitar uma demonstração
        </Button>
      </Box>
    </Box>
  );
}
