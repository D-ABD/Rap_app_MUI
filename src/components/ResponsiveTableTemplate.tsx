// src/components/ResponsiveTableTemplate.tsx
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Card,
  CardContent,
  Typography,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { ReactNode } from "react";

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  sticky?: "left" | "right";
  width?: number;
  render?: (row: T) => ReactNode;
};

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  actions?: (row: T) => ReactNode;
  stickyOffsetLeft?: number;
  stickyOffsetRight?: number;
  cardTitle?: (row: T) => string;
  onRowClick?: (row: T) => void; // ✅ ajout
}

export default function ResponsiveTableTemplate<T>({
  columns,
  data,
  getRowId,
  actions,
  stickyOffsetLeft = 50,
  stickyOffsetRight = 0,
  cardTitle,
  onRowClick, // ✅ ajout
}: Props<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    // 🔹 Affichage mobile en cartes
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        {data.map((row) => (
          <Card
            key={getRowId(row)}
            variant="outlined"
            onClick={() => onRowClick?.(row)} // ✅ support clic mobile
            sx={{ cursor: onRowClick ? "pointer" : "default" }}
          >
            <CardContent>
              <Stack spacing={1}>
                {cardTitle && (
                  <Typography variant="h6" fontWeight="bold">
                    {cardTitle(row)}
                  </Typography>
                )}
                {columns.map((col) => (
                  <Box key={String(col.key)}>
                    <Typography variant="body2" color="text.secondary">
                      {col.label}
                    </Typography>
                    <Typography variant="body1">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? "—")}
                    </Typography>
                  </Box>
                ))}
                {actions && <Box mt={1}>{actions(row)}</Box>}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // 🔹 Affichage desktop en table
  return (
    <TableContainer
      sx={{
        maxHeight: "calc(100vh - 64px)",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((col, idx) => (
              <TableCell
                key={String(col.key)}
                sx={{
                  position: col.sticky ? "sticky" : "static",
                  left:
                    col.sticky === "left" ? stickyOffsetLeft * idx : undefined,
                  right:
                    col.sticky === "right"
                      ? stickyOffsetRight * idx
                      : undefined,
                  zIndex: col.sticky ? 3 : 1,
                  minWidth: col.width,
                  backgroundColor: theme.palette.background.paper,
                  fontWeight: "bold",
                }}
              >
                {col.label}
              </TableCell>
            ))}
            {actions && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row) => (
            <TableRow
              hover
              key={getRowId(row)}
              onClick={() => onRowClick?.(row)} // ✅ support clic desktop
              sx={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((col, idx) => (
                <TableCell
                  key={String(col.key)}
                  sx={{
                    position: col.sticky ? "sticky" : "static",
                    left:
                      col.sticky === "left"
                        ? stickyOffsetLeft * idx
                        : undefined,
                    right:
                      col.sticky === "right"
                        ? stickyOffsetRight * idx
                        : undefined,
                    zIndex: col.sticky ? 2 : 1,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? "—")}
                </TableCell>
              ))}
              {actions && <TableCell>{actions(row)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
