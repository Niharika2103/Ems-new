import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  employeeRegisterApi, employeeLoginApi, employeeResetPasswordApi, employeeForgotPasswordApi, employeeUploadExcelApi,
  employeeBulkInsertApi,
} from "../../api/authApi";

export const employeeRegister = createAsyncThunk("employee/register", async (data, thunkAPI) => {
  try {
    const res = await employeeRegisterApi(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const employeeLogin = createAsyncThunk("employee/login", async (data, thunkAPI) => {
  try {
    const res = await employeeLoginApi(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});
export const employeeForgotPassword = createAsyncThunk("employee/forgot-password", async (data, thunkAPI) => {
  try {
    const response = await employeeForgotPasswordApi(data);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});
export const employeeResetPassword = createAsyncThunk("employee/reset-password", async (data, thunkAPI) => {
  try {
    const response = await employeeResetPasswordApi(data);
    return response.data;

  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
})
//  Bulk Insert
export const employeeBulkInsert = createAsyncThunk(
  "employee/bulkInsert",
  async (data, thunkAPI) => {
    try {
      const res = await employeeBulkInsertApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
// Upload Excel (Preview)
export const employeeUploadExcel = createAsyncThunk(
  "employee/uploadExcel",
  async (formData, thunkAPI) => {
    try {
      const res = await employeeUploadExcelApi(formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    Id: localStorage.getItem("empId") || null,
    empUUID: localStorage.getItem("empUUID") || null,
    loading: false,
    error: null,
    preview: [],
    is_temp_admin: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      state.is_temp_admin = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("is_temp_admin");
    },
    clearPreview: (state) => {
      state.preview = [];
    },
    updatePreviewRow: (state, action) => {
      const { index, updatedRow } = action.payload;
      state.preview[index] = updatedRow;
    },
    deletePreviewRow: (state, action) => {
      state.preview.splice(action.payload, 1);
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(employeeRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(employeeRegister.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(employeeRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(employeeLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(employeeLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.employee || null;
        state.token = action.payload.token || null;
        const role = action.payload.employee?.role || "employee";
        state.role = role;
        const employment_type = action.payload.employee?.employment_type || null;
        state.employment_type = employment_type;

        // EXTRACT is_temp_admin FLAG
        const is_temp_admin = action.payload.employee?.is_temp_admin || false;
        state.is_temp_admin = is_temp_admin;

        //  Save to localStorage (optional but recommended)

        if (action.payload.employee?.id) {
  localStorage.setItem("empUUID", action.payload.employee.id);
}

        if (action.payload.employee) {
          localStorage.setItem("user", JSON.stringify(action.payload.employee));
        }
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
        localStorage.setItem("role", role);
        localStorage.setItem("employment_type", employment_type);
        localStorage.setItem("is_temp_admin", is_temp_admin);

        const uuid = action.payload.employee?.id;
  if (uuid) {
    localStorage.setItem("empUUID", uuid);
  }
      })
      .addCase(employeeLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(employeeResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(employeeResetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(employeeResetPassword.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(employeeUploadExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(employeeUploadExcel.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.preview || action.payload || [];

        state.preview = Array.isArray(data)
          ? data.map((emp) => ({
            fullName: emp.fullName || emp.name || "",
            email: emp.email || "",
            phone: emp.phone || "",
            address: emp.address || "",
            department: emp.department || "",
            dateOfJoining: emp.dateOfJoining || emp.date_of_joining || "",
          }))
          : [];
      })

      // Upload Excel
      .addCase(employeeUploadExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Insert
      .addCase(employeeBulkInsert.pending, (state) => {
        state.loading = true;
      })
      .addCase(employeeBulkInsert.fulfilled, (state) => {
        state.loading = false;
        state.preview = [];
      })
      .addCase(employeeBulkInsert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, clearPreview, updatePreviewRow,
  deletePreviewRow } = employeeSlice.actions;
export default employeeSlice.reducer;
