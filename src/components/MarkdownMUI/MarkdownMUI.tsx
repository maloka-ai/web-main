import Markdown from "markdown-to-jsx";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface MarkdownMUIProps {
  children: string;
}

const MDTh = ({ children, align, colspan, rowspan, ...rest }: any) => (
  <TableCell
    component="th"
    scope="col"
    align={align ?? "left"}
    colSpan={colspan ?? rest.colSpan}
    rowSpan={rowspan ?? rest.rowSpan}
    sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
    title={typeof children === "string" ? children : undefined}
  >
    {children}
  </TableCell>
);

const MDTd = ({ children, align, colspan, rowspan, ...rest }: any) => (
  <TableCell
    component="td"
    align={align ?? "left"}
    colSpan={colspan ?? rest.colSpan}
    rowSpan={rowspan ?? rest.rowSpan}
    sx={{ whiteSpace: "nowrap" }}
    title={typeof children === "string" ? children : undefined}
  >
    {children}
  </TableCell>
);

const MDTable = ({ children }: any) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{
      my: 1.5,
      borderRadius: 2,
      borderColor: "divider",
      overflowX: "auto",
      maxWidth: "100%",
    }}
  >
    <Table
      size="small"
      stickyHeader
      sx={{
        minWidth: 720,
        tableLayout: "auto",
        "& th, & td": { px: 1.5, py: 1 },
      }}
    >
      {children}
    </Table>
  </TableContainer>
);

const MDThead = ({ children }: any) => <TableHead>{children}</TableHead>;
const MDTbody = ({ children }: any) => <TableBody>{children}</TableBody>;
const MDTr = ({ children }: any) => <TableRow>{children}</TableRow>;

export default function MarkdownMUI({ children }: MarkdownMUIProps) {
  return (
    <Box sx={{ color: "#4b4b4b", fontSize: "1rem", lineHeight: 1.7 }}>
      <Markdown
        options={{
          overrides: {
            // Tipos
            h1: {
              component: Typography,
              props: { variant: "h5", gutterBottom: true, fontWeight: 700 },
            },
            h2: {
              component: Typography,
              props: { variant: "h6", gutterBottom: true, fontWeight: 600 },
            },
            p: {
              component: Typography,
              props: { variant: "body1", gutterBottom: true },
            },
            li: {
              component: (props: any) => (
                <Typography component="li" variant="body1" sx={{ mb: 0.5, ml: 4}}>
                  {props.children}
                </Typography>
              ),
            },
            strong: {
              component: Typography,
              props: {
                component: "strong",
                sx: { fontWeight: 600, display: "inline" },
              },
            },

            // Tabela -> MUI responsiva para chat
            table: { component: MDTable },
            thead: { component: MDThead },
            tbody: { component: MDTbody },
            tr: { component: MDTr },
            th: { component: MDTh },
            td: { component: MDTd },
          },
        }}
      >
        {children}
      </Markdown>
    </Box>
  );
}
