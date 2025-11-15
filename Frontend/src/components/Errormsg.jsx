import React from "react";
import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';


const ErrorMsg = ({ message, showIcon = true, bgcolor = "#fdecea", color = "#b71c1c" }) => {
  if (!message) return null; 

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
