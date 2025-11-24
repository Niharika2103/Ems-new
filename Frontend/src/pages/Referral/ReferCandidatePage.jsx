import { Box, Typography } from "@mui/material";
import ReferralForm from "../../components/ReferralForm";
import ReferralStatusTable from "../../components/ReferralStatusTable";

export default function ReferCandidatePage() {
  return (
    <Box p={4} sx={{ background: "#f4f7fb", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={600} mb={4}>
        Employee Referral Portal
      </Typography>

      <ReferralForm />
      <ReferralStatusTable />
    </Box>
  );
}
