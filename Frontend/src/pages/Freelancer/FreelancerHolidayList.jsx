import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Popover,
  Button,
  Modal,
  TextField,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { AttendanceClient } from "../../api/axiosClient";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { saveHoliday, updateHoliday, deleteHolidays } from "../../features/attendance/attendanceSlice"

const FreelancerHolidayList = () => {
  const role = localStorage.getItem("role");
  const dispatch = useDispatch();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [originalData, setOriginalData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleCalendarOpen = (event) => setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);
  const openCalendar = Boolean(anchorEl);

  // ADD / EDIT MODAL 
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [reload, setReload] = useState(false);

  const emptyForm = {
    id: null,
    name: "",
    date: "",
    year: currentYear,
    description: "",
    holidayType: "",
    isOptional: false,
    source: "manual",
    country: "IN",
  };

  const [formData, setFormData] = useState(emptyForm);

  const openAddModal = () => {
    setIsEdit(false);
    setFormData(emptyForm);
    setOpenModal(true);
  };

  const openEditModal = (holiday) => {
    if (role !== "admin") return;
    setIsEdit(true);
    setFormData(holiday);
    setOriginalData(holiday);
    setOpenModal(true);
  };


  const handleModalClose = () => setOpenModal(false);

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //  FETCH HOLIDAYS 
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await AttendanceClient.get(`/holidays/${currentYear}`);
        setHolidays(response.data || []);
      } catch (error) {
        console.error("Failed to load holidays:", error);
        setHolidays([]);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchHolidays();
  }, [currentYear, reload]);

  //  SAVE HOLIDAY (ADD/EDIT) 
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Holiday name is required!");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date!");
      return;
    }

    if (!formData.year) {
      toast.error("Year cannot be empty!");
      return;
    }
    if (!formData.holidayType.trim()) {
      toast.error("Holiday type is required!");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required!");
      return;
    }
    if (isEdit) {
      dispatch(updateHoliday(formData))
        .unwrap()
        .then(() => {
          toast.success("Holiday updated successfully!");
          setReload(prev => !prev);
          handleModalClose();
          setCurrentYear(formData.year);
        })
        .catch(() => {
          toast.error("Failed to save holiday!");
        });
    } else {
      dispatch(saveHoliday(formData))
        .unwrap()
        .then(() => {
          toast.success("Holiday added successfully!");
          setReload(prev => !prev);
          handleModalClose();
          setCurrentYear(formData.year);
        })
        .catch(() => {
          toast.error("Failed to save holiday!");
        });
    }
  };


  //  DELETE 
  const deleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    try {
      await dispatch(deleteHolidays(id)).unwrap();

      toast.success("Holiday deleted successfully!");
      setReload((prev) => !prev);
      setCurrentYear(currentYear); // triggers useEffect fetch
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete holiday!");
    }
  };


  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)",
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <ToastContainer position="top-right" autoClose={2500} />
      <Card
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 700,
          borderRadius: "20px",
          background: "white",
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 5 },
            display: "flex",
            flexDirection: "column",
            height: "80vh",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <IconButton onClick={handleCalendarOpen}>
                <CalendarMonthIcon color="primary" sx={{ fontSize: 36 }} />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {currentYear} Manage Holidays
              </Typography>
            </Box>
            {role === "admin" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddModal}
              >
                Add
              </Button>
            )}
          </Box>

          {/* Calendar Popover */}
          <Popover
            open={openCalendar}
            anchorEl={anchorEl}
            onClose={handleCalendarClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                defaultValue={new Date()}
                onChange={(date) => {
                  if (date) {
                    setCurrentYear(date.getFullYear());
                    handleCalendarClose();
                  }
                }}
              />
            </LocalizationProvider>
          </Popover>

          <Divider sx={{ mb: 2 }} />

          {loading && <CircularProgress sx={{ mx: "auto" }} />}

          {/* Holiday List */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              pr: 1,
              mt: 1,
            }}
          >
            {holidays.length === 0 && !loading ? (
              <Typography align="center" sx={{ mt: 2, color: "gray" }}>
                No holidays found for {currentYear}.
              </Typography>
            ) : (
              <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {holidays.map((holiday, index) => {
                  const date = new Date(holiday.date);
                  const day = date.toLocaleDateString("en-IN", {
                    weekday: "long",
                  });
                  const formattedDate = date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <ListItem
                      key={holiday.id}
                      sx={{
                        borderRadius: "12px",
                        backgroundColor:
                          index % 2 === 0 ? "#f9fafb" : "#f3f4f6",
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <EventAvailableIcon sx={{ color: "#16a34a", fontSize: 28 }} />

                        <ListItemText
                          primary={holiday.name}
                          secondary={`${day} • ${formattedDate}`}
                        />
                      </Box>
                      {role === "admin" && (
                        <Box>
                          <IconButton onClick={() => openEditModal(holiday)}>
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => deleteHoliday(holiday.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Box>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </CardContent>
      </Card>

      {/*  Add/Edit Modal  */}
      <Modal open={openModal} onClose={handleModalClose}>
        <Card
          sx={{
            p: 3,
            width: 600,
            mx: "auto",
            mt: "10%",
            outline: "none",
          }}
        >
          <Typography variant="h6" mb={2}>
            {isEdit ? "Edit Holiday" : "Add Holiday"}
          </Typography>

          <TextField
            label="Name"
            name="name"
            fullWidth
            sx={{ mb: 2 }}
            value={formData.name}
            onChange={handleFormChange}
          />

          <TextField
            label="Date"
            type="date"
            name="date"
            fullWidth
            sx={{ mb: 2 }}
            value={formData.date}
            onChange={handleFormChange}
          />

          <TextField
            label="Year"
            name="year"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={formData.year}
            onChange={handleFormChange}
          />

          <TextField
            label="Type"
            name="holidayType"
            fullWidth
            sx={{ mb: 2 }}
            value={formData.holidayType}
            onChange={handleFormChange}
          />

          <TextField
            label="Description"
            name="description"
            fullWidth
            sx={{ mb: 2 }}
            value={formData.description}
            onChange={handleFormChange}
          />


          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                if (isEdit && originalData) {
                  setFormData(originalData); // reset to original for edit mode
                } else {
                  setFormData(emptyForm);   // reset empty for add mode
                }
                handleModalClose();
              }}
            >
              Cancel
            </Button>

            <Button variant="contained" fullWidth onClick={handleSave}>
              {isEdit ? "Update" : "Save"}
            </Button>
          </Box>

        </Card>
      </Modal>
    </Box>
  );
};

export default FreelancerHolidayList;


