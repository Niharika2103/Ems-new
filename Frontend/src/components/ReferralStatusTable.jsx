// import {
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
//   Box,
//   Typography
// } from "@mui/material";

// import ReferralStatusStepper from "./ReferralStatusStepper";

// const mockData = [
//   { name: "Kumar", status: "Shortlisted" },
//   { name: "Priya", status: "Interview" },
//   { name: "Rohit", status: "Submitted" },
//   { name: "Meena", status: "Hired" },
//   { name: "Sam", status: "Rejected" },
// ];

// export default function ReferralStatusTable() {
//   return (
//     <Paper elevation={4} sx={{ p: 3, borderRadius: "16px" }}>
//       <Typography variant="h5" mb={3} fontWeight={600}>
//         Referral Status Tracking
//       </Typography>

//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>
//               <strong>Candidate Name</strong>
//             </TableCell>
//             <TableCell>
//               <strong>Status Progress</strong>
//             </TableCell>
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {mockData.map((row, index) => (
//             <TableRow key={index}>
//               <TableCell width="20%">{row.name}</TableCell>

//               <TableCell>
//                 <Box>
//                   <ReferralStatusStepper status={row.status} />
//                 </Box>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </Paper>
//   );
// }

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyReferrals } from "../features/auth/employeeSlice"; // ✅ adjust path if needed
import ReferralStatusStepper from "./ReferralStatusStepper";
import { decodeToken } from "../api/decodeToekn";


// export default function ReferralStatusTable() {
//   const dispatch = useDispatch();
  
//   const { myReferrals, referralLoading, referralError } = useSelector(
//     (state) => state.employee
//   );

//   useEffect(() => {
//     dispatch(getMyReferrals());
//   }, [dispatch]);

export default function ReferralStatusTable() {
  const dispatch = useDispatch();

  const empUUID =
    useSelector((state) => state.employee.empUUID) || // from Redux state
    decodeToken()?.id || // fallback from JWT unique id
    localStorage.getItem("empUUID"); // fallback from localStorage

    console.log("Employee UUID:", empUUID);

  const { myReferrals, referralLoading, referralError } = useSelector(
    (state) => state.employee
  );

  useEffect(() => {
    if (empUUID) {
      dispatch(getMyReferrals(empUUID));   // <-- FIXED
    }
  }, [dispatch, empUUID]);

  // Loading state
  if (referralLoading) {
    return (
      <Paper elevation={4} sx={{ p: 4, borderRadius: "16px", textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading your referrals...</Typography>
      </Paper>
    );
  }

  // Error state
  if (referralError) {
    return (
      <Paper elevation={4} sx={{ p: 3, borderRadius: "16px" }}>
        <Alert severity="error">
          Failed to load referrals: {referralError.error || referralError}
        </Alert>
      </Paper>
    );
  }

  // Empty state
  if (!myReferrals || myReferrals.length === 0) {
    return (
      <Paper elevation={4} sx={{ p: 3, borderRadius: "16px", textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          No referrals submitted yet.
        </Typography>
        <Typography mt={1}>
          Submit your first referral to track its status!
        </Typography>
      </Paper>
    );
  }

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
          {myReferrals.map((referral) => (
            <TableRow key={referral.referral_id}>
              <TableCell width="20%">{referral.candidate_name}</TableCell>
              <TableCell>
                <Box sx={{ py: 1 }}>
                  <ReferralStatusStepper status={referral.status} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}