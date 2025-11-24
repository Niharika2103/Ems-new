import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Typography
} from "@mui/material";

import ReferralStatusStepper from "./ReferralStatusStepper";

const mockData = [
  { name: "Kumar", status: "Shortlisted" },
  { name: "Priya", status: "Interview" },
  { name: "Rohit", status: "Submitted" },
  { name: "Meena", status: "Hired" },
  { name: "Sam", status: "Rejected" },
];

export default function ReferralStatusTable() {
  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: "16px" }}>
      <Typography variant="h5" mb={3} fontWeight={600}>
        Referral Status Tracking
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Candidate Name</strong>
            </TableCell>
            <TableCell>
              <strong>Status Progress</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {mockData.map((row, index) => (
            <TableRow key={index}>
              <TableCell width="20%">{row.name}</TableCell>

              <TableCell>
                <Box>
                  <ReferralStatusStepper status={row.status} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
