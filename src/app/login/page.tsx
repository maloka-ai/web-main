'use client';

import { Button, TextField, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box className={styles.container}>
      <Box className={styles.card}>
        <img src="/images/marca-medio@3x.png" alt="Lara Logo" className={styles.logo} />

        <Typography  variant='h5' className={styles.title}>
          Converse com seus dados
        </Typography>
        <Typography  variant='h5' className={`${styles.title} ${styles.subtitle}`}>
          e aumente suas vendas
        </Typography>

        <TextField
          fullWidth
          label="E-mail"
          type="email"
          variant="outlined"
          margin="normal"
          className={styles.input}
        />
        <TextField
          fullWidth
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="normal"
          className={styles.input}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Link href={'/home'}>
          <Button variant="contained" className={styles.button} fullWidth>
            Entrar
          </Button>
        </Link>

        <Typography className={styles.forgot}>Esqueci a senha</Typography>

        <Box className={styles.divider} />

        <Typography className={styles.accountTitle}>Ainda não tem uma conta?</Typography>
        <Typography className={styles.accountSubtitle}>Solicite agora uma versão demo</Typography>
        <Button variant="outlined" className={styles.outlined} fullWidth>
          Solicitar uma demonstração
        </Button>
      </Box>
    </Box>
  );
}