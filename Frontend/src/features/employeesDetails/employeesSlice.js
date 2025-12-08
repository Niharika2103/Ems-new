import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProfileApi, editProfileApi, employeeFetchApi,
  employeeDeleteApi, getAdminProfileApi, getSuperadminProfileApi,
  updateAdminProfileApi, updateSuperAdminProfileApi, adminUpdateEmployeeApi,fetchallemployeeApi,
  employeeUploadDocFecthApi
} from "../../api/authApi";

// Fetch Employee profile by EMail
export const fetchEmployeeProfile = createAsyncThunk(
  "employee/fetchProfile",
  async (email, thunkAPI) => {
    try {
      const response = await getProfileApi(email);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
//fetch all employee role role1 role2
export const fetchallemployee = createAsyncThunk(
  "employee/fetchallemployee",
  async (email, thunkAPI) => {
    try {
      const response = await fetchallemployeeApi(email);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update employee profile
export const updateEmployeeProfile = createAsyncThunk(
  "employee/updateProfile",
  async ({ data, id }, thunkAPI) => {
    try {
      const response = await editProfileApi(data, id);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);
// Fetch admin profile using Email
export const fetchAdminProfile = createAsyncThunk(
  "admin/fetchProfile",
  async (id, thunkAPI) => {
    try {
      const response = await getAdminProfileApi(id);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
// Update Admin profile
export const updateAdminProfile = createAsyncThunk(
  "admin/updateProfile",
  async ({ data, id }, thunkAPI) => {
    try {
      const response = await updateAdminProfileApi(data, id);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);
// Fetch superadmin profile by EMail
export const fetchSuperAdminProfile = createAsyncThunk(
  "superadmin/fetchProfile",
  async (id, thunkAPI) => {
    try {
      const response = await getSuperadminProfileApi(id);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
// Update SuperAdmin profile
export const updateSuperAdminProfile = createAsyncThunk(
  "superadmin/updateProfile",
  async ({ data, id }, thunkAPI) => {
    try {
      const response = await updateSuperAdminProfileApi(data, id);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);
//fetch all employee 
export const fetchAllEmployees = createAsyncThunk(
  "employee/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await employeeFetchApi();
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);



//Delete Employee
export const deleteEmployee = createAsyncThunk(
  "employee/status",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await employeeDeleteApi(id, status);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

//Employee Update by Admin
export const updateEmployeebyAdmin = createAsyncThunk(
  "employee/updatebyadmin",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await adminUpdateEmployeeApi(data, id);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

//doc fetch api
export const employeeUploadDocFecth = createAsyncThunk(
  "employee/docfetch",
  async (_, thunkAPI) => {
    try {
      const response = await employeeUploadDocFecthApi();
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);



const empDetailsSlice = createSlice({
  name: "employeeDetails",
  initialState: {
    profile: null,
    list: [],
    freelancerlist:[],
    loading: false,
    error: null,
    success: false,
    doclist:[],
  },
  reducers: {
    clearEmployeeState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch employee
      .addCase(fetchEmployeeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchEmployeeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetch admin
      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch superadmin
      .addCase(fetchSuperAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchSuperAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update
      .addCase(updateEmployeeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(updateEmployeeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      //superadmin update
      .addCase(updateSuperAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSuperAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(updateSuperAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      //admin update
      .addCase(updateAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      //fetch all employee
      .addCase(fetchAllEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })  
      // delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((emp) => emp.id !== action.payload);
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //EmployeeUpdatebyAdmin
      .addCase(updateEmployeebyAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEmployeebyAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEmployee = action.payload?.employee;

        if (updatedEmployee) {
          state.list = state.list.map((emp) =>
            emp.id === updatedEmployee.id ? updatedEmployee : emp
          );
        }

        state.success = true;
        state.error = null;
      })
      .addCase(fetchallemployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchallemployee.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchallemployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
   .addCase(employeeUploadDocFecth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(employeeUploadDocFecth.fulfilled, (state, action) => {
        state.loading = false;
        state.doclist = action.payload;
      })
      .addCase(employeeUploadDocFecth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearEmployeeState } = empDetailsSlice.actions;
export default empDetailsSlice.reducer;
