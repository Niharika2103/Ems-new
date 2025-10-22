import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceSaveallApi,AttendanceFetchAllApi ,AttendanceFetchExistingWeekApi,
  // AttendanceFetchCurrentWeekApi,
  AttendanceFetchByEmployeeProjectApi,AttendanceReleaseWeekApi} from "../../api/authApi";

export const AttendanceSaveall = createAsyncThunk("attendance/saveall", async ({ employeeId, projectId, formData }, thunkAPI) => {
  try {
    const res = await AttendanceSaveallApi( employeeId, projectId, formData );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})

// export const AttendancCurrentWeek= createAsyncThunk("attendance/currentweek", async ({ employeeId, projectId }, thunkAPI) => {
//   try {
//     const res = await AttendanceFetchCurrentWeekApi( employeeId, projectId );
//     return res.data;
//   } catch (err) {
//     return thunkAPI.rejectWithValue(err.response?.data || err.message);
//   }
// })

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

export const AttendanceReleaseMonth= createAsyncThunk("attendance/release-Month", async ({ employeeId, projectId }, thunkAPI) => {
  try {
    const res = await AttendanceReleaseMonthApi( employeeId, projectId );
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})
const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendance:[],
     attendanceData: [], // 
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
      .addCase(AttendanceSaveall.fulfilled, (state) => {
        state.loading = false;
        state.attendanceData = action.payload; 
      })
      .addCase(AttendanceSaveall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // .addCase(AttendancCurrentWeek.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(AttendancCurrentWeek.fulfilled, (state,action) => {
      //   state.loading = false;
      //   state.attendanceData = action.payload; 
      // })
      // .addCase(AttendancCurrentWeek.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
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

  },
});

export const { logout, setAttendanceData} = attendanceSlice.actions;
export default attendanceSlice.reducer;
