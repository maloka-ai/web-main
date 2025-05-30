'use client';

import AssistantChat from "@/components/AssistantChat/AssistantChat";

import styles from "./page.module.css"
import { Box } from "@mui/material";
import Analises from "@/components/Analises/Analises";
import HeaderSistema from "@/components/Layouts/SystemHeader/SystemHeader";

export default function Home(){
  return (
    <Box className={styles.container}>
      <AssistantChat />
      <Box className={styles.content}>
        <HeaderSistema />
        <Analises />
      </Box>
    </Box>
  );
}