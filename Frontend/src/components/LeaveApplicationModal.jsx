// import React, { useState } from "react";
// import { Modal, Box, Typography, TextField, Button, Grid } from "@mui/material";
// import { toast } from "react-toastify";

// const LeaveApplicationModal = ({ open, onClose, leaveType, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     startDate: "",
//     reason: "",
//     document: null,
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData({
//       ...formData,
//       [name]: files ? files[0] : value,
//     });
//   };

//   const handleSubmit = () => {
//     onSubmit(formData);                   // Submit data to parent
//     toast.success("Leave applied successfully!"); // Show success toast
//     onClose();                             // Close modal
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box
//         sx={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           width: 450,
//           bgcolor: "background.paper",
//           boxShadow: 24,
//           borderRadius: 3,
//           p: 4,
//         }}
//       >
//         <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
//           {leaveType} Application
//         </Typography>

//         <Grid container spacing={2}>
//           {/* Start Date */}
//           <Grid item xs={12}>
//             <TextField
//               label="Start Date"
//               name="startDate"
//               type="date"
//               fullWidth
//               value={formData.startDate}
//               onChange={handleChange}
//               InputLabelProps={{ shrink: true }}
//             />
//           </Grid>

//           {/* Reason */}
//           <Grid item xs={12}>
//             <TextField
//               label="Reason"
//               name="reason"
//               fullWidth
//               multiline
//               rows={3}
//               value={formData.reason}
//               onChange={handleChange}
//             />
//           </Grid>

//           {/* Upload Supporting Document */}
//           <Grid item xs={12}>
//             <Button variant="outlined" component="label">
//               Upload Supporting Document
//               <input
//                 hidden
//                 type="file"
//                 name="document"
//                 accept=".pdf,.jpg,.png"
//                 onChange={handleChange}
//               />
//             </Button>
//             {formData.document && (
//               <Typography variant="body2" sx={{ mt: 1 }}>
//                 {formData.document.name}
//               </Typography>
//             )}
//           </Grid>

//           {/* Action Buttons */}
//           <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
//             <Button onClick={onClose} sx={{ mr: 2 }}>
//               Cancel
//             </Button>
//             <Button variant="contained" onClick={handleSubmit}>
//               Submit
//             </Button>
//           </Grid>
//         </Grid>
//       </Box>
//     </Modal>
//   );
// };

// export default LeaveApplicationModal;



import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const LeaveApplicationModal = ({ open, onClose, leaveType, onSubmit }) => {
  const [startDate, setStartDate] = useState("");

  const handleSubmit = () => {
    if (startDate) {
      onSubmit({ startDate });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Apply for {leaveType}
        </Typography>

        <TextField
          label="Start Date"
          type="date"
          fullWidth
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!startDate}>
            Submit
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default LeaveApplicationModal; 