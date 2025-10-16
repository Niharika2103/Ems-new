import React from "react";
import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorMsg Component
 * Props:
 *  - message: string (required) → The error message to display
 *  - showIcon: boolean (optional, default: true) → Whether to show the error icon
 *  - bgcolor: string (optional) → Background color of the error box
 *  - color: string (optional) → Text color
 */
const ErrorMsg = ({ message, showIcon = true, bgcolor = "#fdecea", color = "#b71c1c" }) => {
  if (!message) return null; // Don't render if no message

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.5,
        borderRadius: 1,
        bgcolor: bgcolor,
        color: color,
        fontWeight: 500,
        mb: 1,
      }}
    >
      {showIcon && <ErrorOutlineIcon />}
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
};

export default ErrorMsg;
