import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceSaveallApi,AttendanceFetchAllApi ,AttendanceFetchByEmployeeProjectApi,AttendanceReleaseWeekApi} from "../../api/authApi";

export const AttendanceSaveall = createAsyncThunk("attendance/saveall", async ({ employeeId, projectId, formData }, thunkAPI) => {
  try {
    const res = await AttendanceSaveallApi( employeeId, projectId, formData );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

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
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const AttendanceReleaseWeek= createAsyncThunk("attendance/release-week", async ({ employeeId, projectId, formData }, thunkAPI) => {
  try {
    const res = await AttendanceReleaseWeekApi( employeeId, projectId, formData );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendance:[],
      loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.attendance = [];
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(AttendanceSaveall.pending, (state) => {
        state.loading = true;
      })
      .addCase(AttendanceSaveall.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(AttendanceSaveall.rejected, (state, action) => {
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

  },
});

export const { logout } = attendanceSlice.actions;
export default attendanceSlice.reducer;
