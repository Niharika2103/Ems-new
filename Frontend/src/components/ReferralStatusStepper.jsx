import { Box, Typography } from "@mui/material";

// Step items & their colors
const steps = [
  { label: "Submitted", color: "#1E88E5" },      // Blue
  { label: "Shortlisted", color: "#8E24AA" },   // Purple
  { label: "Interview", color: "#FB8C00" },     // Orange
  { label: "Hired", color: "#43A047" },         // Green
  { label: "Rejected", color: "#E53935" }       // Red
];

export default function ReferralStatusStepper({ status }) {
  const activeIndex = steps.findIndex(
    (step) => step.label.toLowerCase() === status.toLowerCase()
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        py: 3
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <Box
            key={step.label}
            sx={{
              flex: 1,
              textAlign: "center",
              position: "relative"
            }}
          >
            {/* Line Connector */}
            {index !== 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "22px",
                  left: "-50%",
                  width: "100%",
                  height: "4px",
                  background:
                    index <= activeIndex
                      ? step.color
                      : "rgba(180,180,180,0.3)",
                  transition: "0.4s ease"
                }}
              />
            )}

            {/* Step Circle */}
            <Box
              sx={{
                width: 40,
                height: 40,
                margin: "0 auto",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: isActive
                  ? `linear-gradient(135deg, ${step.color}, #000)`
                  : isCompleted
                  ? step.color
                  : "rgba(200,200,200,0.3)",
                color: "white",
                fontWeight: 600,
                boxShadow: isActive
                  ? `0 0 12px ${step.color}`
                  : "0 0 5px rgba(150,150,150,0.4)",
                transition: "0.4s",
                fontSize: "14px"
              }}
            >
              {index + 1}
            </Box>

            {/* Step Label */}
            <Typography
              mt={1}
              fontSize="13px"
              fontWeight={isActive ? 700 : 500}
              color={isActive ? step.color : "#555"}
              sx={{ transition: "0.3s" }}
            >
              {step.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
