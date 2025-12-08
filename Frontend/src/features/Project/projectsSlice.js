import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProjectInsertApi, ProjectFetchAllApi, ProjectAssignApi ,ProjectFetchAllDetailsApi,ProjectFetchAssignApi} from "../../api/authApi";

export const ProjectSave = createAsyncThunk("project/save", async (data, thunkAPI) => {
  try {
    const res = await ProjectInsertApi(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const ProjectGetAll = createAsyncThunk("project/fetchall", async (_, thunkAPI) => {
  try {
    const res = await ProjectFetchAllApi();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

// Assign Projects
export const ProjectAssign = createAsyncThunk(
  "project/assign",
  async ({ projectId, employeeId, role,employee_type }, thunkAPI) => {
    try {
      const res = await ProjectAssignApi(projectId, employeeId, role,employee_type);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

//Assigned Project
export const ProjectFetchAssign = createAsyncThunk(
  "employeeProjects/fetch",
  async (employeeId, { rejectWithValue }) => {
    try {
      const res = await ProjectFetchAssignApi(employeeId);
      return res.data;
     
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProjectAssignments = createAsyncThunk(
  "projects/fetchAssignments",
  async (_, thunkAPI) => {
    try {
      const response = await ProjectFetchAllDetailsApi();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Error fetching data");
    }
  }
);


const projectSlice = createSlice({
  name: "project",
  initialState: {
    project: null,
    projects:[],
      assignments: [],
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.project = null;
      state.list = [];
      state.projects = [];
      state.token = null;
      localStorage.removeItem("token");
    },

  },

  extraReducers: (builder) => {
    builder
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
      //fetch all Project
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
      }).addCase(ProjectAssign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ProjectAssign.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(ProjectAssign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) .addCase(ProjectFetchAssign.pending, (state) => {
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
      });

  }
})

export const { logout, } = projectSlice.actions;
export default projectSlice.reducer;