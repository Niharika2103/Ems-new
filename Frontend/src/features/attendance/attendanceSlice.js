import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceSaveallApi,AttendanceFetchAllApi ,AttendanceFetchExistingWeekApi,
  AttendanceReleaseMonthApi,AttendanceFetchExistingMonthApi,
  AttendanceFetchByEmployeeProjectApi,AttendanceReleaseWeekApi,
AdminAttendancFetchWeeklyDataByIdApi,Admin_Approve_Weekly_Attendance_Api,
AdminAttendancFetchMonthlyDataByIdApi,
Admin_Approve_monthly_Attendance_Api} from "../../api/authApi";


//Employee
export const AttendanceSaveall = createAsyncThunk("attendance/saveall", async ({ employeeId, projectId, formData }, thunkAPI) => {
  try {
    const res = await AttendanceSaveallApi( employeeId, projectId, formData );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

export const AttendanceFetchExistingMonth = createAsyncThunk(
  "attendance/currentmonth",
  async ({ employeeId, startDate, endDate }, thunkAPI) => {
    try {
      const res = await AttendanceFetchExistingMonthApi({ employeeId, startDate, endDate });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


// slice/attendanceSlice.js
export const AttendanceFetchExistingWeek = createAsyncThunk(
  "attendance/fetchExistingWeek",
  async ({ employeeId, projectId, startDate }, thunkAPI) => {
    try {
      const res = await AttendanceFetchExistingWeekApi({ employeeId, projectId, startDate });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const AttendanceFetchAll = createAsyncThunk("attendance/fetchall", async (_, thunkAPI) => {
  try {
    const res = await AttendanceFetchAllApi(  );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

// Fetch by employee & project
export const AttendanceFetchByEmployeeProject = createAsyncThunk(
  "attendance/fetchByEmployeeProject",
  async ({ employeeId, projectId }, thunkAPI) => {
    try {
      const res = await AttendanceFetchByEmployeeProjectApi(employeeId, projectId);
      console.log("✅ Response received:", res.data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const AttendanceReleaseWeek= createAsyncThunk("attendance/release-week", async ({ employeeId, weekStart,weekEnd }, thunkAPI) => {
  try {
    const res = await AttendanceReleaseWeekApi( employeeId, weekStart,weekEnd );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

export const AttendanceReleaseMonth= createAsyncThunk("attendance/release-Month", async ({ employeeId,  monthStart,monthEnd }, thunkAPI) => {
  try {
    const res = await AttendanceReleaseMonthApi( employeeId,  monthStart,monthEnd );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})
//Admin
export const AdminAttendancFetchWeeklyDataById = createAsyncThunk("admin/fetchweekly", async ({ employeeId, from, to }, thunkAPI) => {
  try {
    const res = await AdminAttendancFetchWeeklyDataByIdApi( employeeId, from, to );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})
export const AdminAttendancFetchMonthlyDataById= createAsyncThunk("admin/fetchMonthly", async ({ employeeId,from , to }, thunkAPI) => {
  try {
    const res = await AdminAttendancFetchMonthlyDataByIdApi( employeeId, from, to );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})
export const Admin_Approve_Weekly_Attendance = createAsyncThunk(
  "admin/approveweekly",
  async ({ employeeId, from, to }, thunkAPI) => {
    try {
      const res = await Admin_Approve_Weekly_Attendance_Api(employeeId, from, to );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const Admin_Approve_monthly_Attendance = createAsyncThunk(
  "admin/approvemonthly",
  async ({ employeeId, from, to }, thunkAPI) => {
    try {
      const res = await Admin_Approve_monthly_Attendance_Api(employeeId, from, to);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);



const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendance:[],
     attendanceData: [], 
      loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.attendance = [];
      localStorage.removeItem("token");
    },
     setAttendanceData: (state, action) => {
      state.attendanceData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(AttendanceSaveall.pending, (state) => {
        state.loading = true;
      })
      .addCase(AttendanceSaveall.fulfilled, (state,action ) => {
        state.loading = false;
        state.attendanceData = action.payload; 
      })
      .addCase(AttendanceSaveall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(AttendanceFetchExistingMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(AttendanceFetchExistingMonth.fulfilled, (state,action) => {
        state.loading = false;
        state.attendanceData = action.payload; 
      })
      .addCase(AttendanceFetchExistingMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(AttendanceFetchExistingWeek.pending, (state) => {
      state.loading = true;
    })
    .addCase(AttendanceFetchExistingWeek.fulfilled, (state, action) => {
      state.loading = false;
      state.attendanceData = action.payload; 
    })
    .addCase(AttendanceFetchExistingWeek.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
       .addCase(AttendanceFetchAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(AttendanceFetchAll.fulfilled, (state,action) => {
        state.loading = false;
         state.attendance = action.payload;
      })
      .addCase(AttendanceFetchAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by employee & project
      .addCase(AttendanceFetchByEmployeeProject.pending, (state) => { state.loading = true; })
      .addCase(AttendanceFetchByEmployeeProject.fulfilled, (state, action) => { state.loading = false; state.attendance = action.payload; })
      .addCase(AttendanceFetchByEmployeeProject.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
       .addCase(AttendanceReleaseWeek.pending, (state) => {
        state.loading = true;
      })
      .addCase(AttendanceReleaseWeek.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(AttendanceReleaseWeek.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(AttendanceReleaseMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(AttendanceReleaseMonth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(AttendanceReleaseMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       // --- Admin Thunks ---
    .addCase(AdminAttendancFetchWeeklyDataById.pending, (state) => { state.loading = true; })
    .addCase(AdminAttendancFetchWeeklyDataById.fulfilled, (state, action) => { state.loading = false; state.attendanceData = action.payload; })
    .addCase(AdminAttendancFetchWeeklyDataById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

    .addCase(AdminAttendancFetchMonthlyDataById.pending, (state) => { state.loading = true; })
    .addCase(AdminAttendancFetchMonthlyDataById.fulfilled, (state, action) => { state.loading = false; state.attendanceData = action.payload; })
    .addCase(AdminAttendancFetchMonthlyDataById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

    .addCase(Admin_Approve_Weekly_Attendance.pending, (state) => { state.loading = true; })
    .addCase(Admin_Approve_Weekly_Attendance.fulfilled, (state) => { state.loading = false; })
    .addCase(Admin_Approve_Weekly_Attendance.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

    .addCase(Admin_Approve_monthly_Attendance.pending, (state) => { state.loading = true; })
    .addCase(Admin_Approve_monthly_Attendance.fulfilled, (state) => { state.loading = false; })
    .addCase(Admin_Approve_monthly_Attendance.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

  },
});

export const { logout, setAttendanceData} = attendanceSlice.actions;
export default attendanceSlice.reducer;
