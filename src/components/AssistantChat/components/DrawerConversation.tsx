import styles from '@/components/AssistantChat/assistantChat.module.css';
import {
  Box,
  IconButton,
  List,
  ListItem,
  Typography,
  ListSubheader,
} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { AssistantThreadResume } from '@/services/AssistantService';

type Props = {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  conversations: AssistantThreadResume[]; // precisa ter thread_id, title, created_at
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  handleMenuOpen: (
    event: React.MouseEvent<HTMLButtonElement>,
    conversation: any,
  ) => void;
};

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysDiff(from: Date, to: Date) {
  const msInDay = 24 * 60 * 60 * 1000;
  return Math.floor(
    (startOfDay(from).getTime() - startOfDay(to).getTime()) / msInDay,
  );
}

function formatDayBR(d: Date) {
  // dd/MM/yyyy
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

type Section = { key: string; title: string; items: AssistantThreadResume[] };

function buildSections(conversations: AssistantThreadResume[]): Section[] {
  // ordena por data desc
  const sorted = [...conversations].sort(
    (a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime(),
  );

  const today = new Date();
  const sectionsMap: Record<string, Section> = {};

  // Seções fixas
  sectionsMap['today'] = { key: 'today', title: 'Hoje', items: [] };
  sectionsMap['yesterday'] = { key: 'yesterday', title: 'Ontem', items: [] };
  sectionsMap['last7'] = { key: 'last7', title: 'Últimos 7 dias', items: [] };

  // Demais dias (dinâmicos)
  const dynamicSections: Record<string, Section> = {};

  for (const c of sorted) {
    const created = toDate(c.created_at);
    const diff = daysDiff(today, created);

    if (diff === 0) {
      sectionsMap['today'].items.push(c);
    } else if (diff === 1) {
      sectionsMap['yesterday'].items.push(c);
    } else if (diff >= 2 && diff <= 7) {
      sectionsMap['last7'].items.push(c);
    } else {
      const key = formatDayBR(created); // dd/MM/yyyy
      if (!dynamicSections[key]) {
        dynamicSections[key] = { key, title: key, items: [] };
      }
      dynamicSections[key].items.push(c);
    }
  }

  // monta array final: Hoje, Ontem, Últimos 7 dias, depois dias (desc)
  const fixed: Section[] = ['today', 'yesterday', 'last7']
    .map((k) => sectionsMap[k])
    .filter((s) => s.items.length > 0);

  const dyn: Section[] = Object.values(dynamicSections).sort((a, b) => {
    // ordenar pelas datas dos títulos (dd/MM/yyyy) desc
    const [da, ma, ya] = a.title.split('/').map(Number);
    const [db, mb, yb] = b.title.split('/').map(Number);
    const A = new Date(ya, ma - 1, da).getTime();
    const B = new Date(yb, mb - 1, db).getTime();
    return B - A;
  });

  return [...fixed, ...dyn];
}

export function DrawerConversation({
  drawerOpen,
  setDrawerOpen,
  conversations,
  activeConversationId,
  setActiveConversationId,
  handleMenuOpen,
}: Props) {
  const sections = buildSections(conversations);

  return (
    <Box
      className={styles.drawerOverlay}
      sx={{
        display: drawerOpen ? 'block' : 'none',
        top: { xs: '0', md: '40px' },
      }}
    >
      <Box className={styles.drawer}>
        <Box className={styles.drawerHeader}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <MenuOpenIcon color="primary" />
          </IconButton>
          <Typography
            variant="h6"
            className={styles.drawerTitle}
            sx={{ flexGrow: 1 }}
          >
            Histórico
          </Typography>
          <IconButton>
            <SearchOutlinedIcon color="primary" />
          </IconButton>
        </Box>

        <List subheader={<li />}>
          {sections.map((section) => (
            <li key={`section-${section.key}`}>
              <ul style={{ padding: 0, margin: 0 }}>
                <ListSubheader
                  disableSticky
                  sx={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#4b4b4b',
                    letterSpacing: 0,
                  }}
                >
                  {section.title}
                </ListSubheader>

                {section.items.map(({ thread_id: id, title }) => (
                  <ListItem
                    key={`${section.key}-${id}`}
                    className={`${styles.conversationItem} ${id === activeConversationId ? styles.activeConversation : ''}`}
                    onClick={() => {
                      setActiveConversationId(id);
                      setDrawerOpen(false);
                    }}
                  >
                    <span
                      className={`${styles.marquee} ${styles.conversationName}`}
                      onMouseEnter={(e) => {
                        const container = e.currentTarget as HTMLSpanElement;
                        const content = container.querySelector(
                          `.${styles.marqueeContent}`,
                        ) as HTMLSpanElement | null;
                        if (!content) return;

                        // calcula quanto precisa mover (conteúdo - container)
                        const distance =
                          content.scrollWidth - container.clientWidth;
                        if (distance > 0) {
                          content.style.setProperty(
                            '--scroll-distance',
                            `${distance}px`,
                          );
                          const durationSec = Math.max(3, distance / 40);
                          content.style.setProperty(
                            '--scroll-duration',
                            `${durationSec}s`,
                          );

                          content.classList.add(styles.marqueeRunning);
                        }
                      }}
                      onMouseLeave={(e) => {
                        const container = e.currentTarget as HTMLSpanElement;
                        const content = container.querySelector(
                          `.${styles.marqueeContent}`,
                        ) as HTMLSpanElement | null;
                        if (!content) return;

                        content.classList.remove(styles.marqueeRunning);
                        content.style.removeProperty('--scroll-distance');
                        content.style.removeProperty('--scroll-duration');
                        content.style.transform = 'translateX(0)';
                      }}
                    >
                      <span className={styles.marqueeContent}>{title}</span>
                    </span>
                    <Box
                      sx={{
                        bgcolor: 'inherit',
                      }}
                    >
                      <IconButton
                        edge="end"
                        className={styles.menuButton}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, { thread_id: id, title });
                        }}
                      >
                        <MoreHorizOutlinedIcon
                          fontSize="small"
                          sx={{ color: '#df8157' }}
                        />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </ul>
            </li>
          ))}
        </List>
      </Box>

      <Box
        className={styles.drawerBackdrop}
        onClick={() => setDrawerOpen(false)}
      />
    </Box>
  );
}
