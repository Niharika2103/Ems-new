import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ProjectInsertApi,
  ProjectFetchAllApi,
  ProjectAssignApi,
  ProjectFetchAllDetailsApi,
  ProjectFetchAssignApi,
  ProjectFinishApi   // ✅ FINISH API
} from "../../api/authApi";

/* ===================== SAVE PROJECT ===================== */
export const ProjectSave = createAsyncThunk(
  "project/save",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ProjectInsertApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ??
        err.response?.data ??
        err.message
      );
    }
  }
);

/* ===================== FETCH ALL PROJECTS ===================== */
export const ProjectGetAll = createAsyncThunk(
  "project/fetchall",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ProjectFetchAllApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ??
        err.response?.data ??
        err.message
      );
    }
  }
);

/* ===================== ASSIGN PROJECT ===================== */
export const ProjectAssign = createAsyncThunk(
  "project/assign",
  async (
    { projectId, employeeId, role, employee_type },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await ProjectAssignApi(
        projectId,
        employeeId,
        role,
        employee_type
      );

      // refresh assignments
      dispatch(fetchProjectAssignments());
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ??
        err.response?.data ??
        err.message
      );
    }
  }
);

/* ===================== FETCH EMPLOYEE PROJECTS ===================== */
export const ProjectFetchAssign = createAsyncThunk(
  "employeeProjects/fetch",
  async (employeeId, { rejectWithValue }) => {
    try {
      const res = await ProjectFetchAssignApi(employeeId);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ??
        err.response?.data ??
        err.message
      );
    }
  }
);

/* ===================== FETCH ALL PROJECT ASSIGNMENTS ===================== */
export const fetchProjectAssignments = createAsyncThunk(
  "projects/fetchAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProjectFetchAllDetailsApi();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ??
        err.response?.data ??
        "Error fetching assignments"
      );
    }
  }
);

/* ===================== FINISH PROJECT ===================== */
export const ProjectFinish = createAsyncThunk(
  "project/finish",
  async (assignmentId, { dispatch, rejectWithValue }) => {
    try {
      await ProjectFinishApi(assignmentId);

      // refresh updated status
      dispatch(fetchProjectAssignments());
      return assignmentId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ??
        err.response?.data ??
        err.message
      );
    }
  }
);

/* ===================== SLICE ===================== */
const projectSlice = createSlice({
  name: "project",
  initialState: {
    project: null,
    projects: [],
    assignments: [], // includes status field from backend
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.project = null;
      state.list = [];
      state.projects = [];
      state.assignments = [];
      state.error = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder

      /* SAVE PROJECT */
      .addCase(ProjectSave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ProjectSave.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(ProjectSave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH ALL PROJECTS */
      .addCase(ProjectGetAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ProjectGetAll.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(ProjectGetAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ASSIGN PROJECT */
      .addCase(ProjectAssign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ProjectAssign.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(ProjectAssign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Project assignment failed";
      })

      /* FETCH EMPLOYEE PROJECTS */
      .addCase(ProjectFetchAssign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ProjectFetchAssign.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(ProjectFetchAssign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH ALL ASSIGNMENTS */
      .addCase(fetchProjectAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchProjectAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FINISH PROJECT */
      .addCase(ProjectFinish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ProjectFinish.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(ProjectFinish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = projectSlice.actions;
export default projectSlice.reducer;
