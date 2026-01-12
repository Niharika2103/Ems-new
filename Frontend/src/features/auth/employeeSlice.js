import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  employeeRegisterApi,
  employeeLoginApi,
  employeeResetPasswordApi,
  employeeForgotPasswordApi,
  employeeUploadExcelApi,
  employeeBulkInsertApi,
  createReferralApi,
  getMyReferralsApi,
} from "../../api/authApi";

/* ---------------- THUNKS ---------------- */

export const employeeRegister = createAsyncThunk(
  "employee/register",
  async (data, thunkAPI) => {
    try {
      const res = await employeeRegisterApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const employeeLogin = createAsyncThunk(
  "employee/login",
  async (data, thunkAPI) => {
    try {
      const res = await employeeLoginApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const employeeForgotPassword = createAsyncThunk(
  "employee/forgot-password",
  async (data, thunkAPI) => {
    try {
      const res = await employeeForgotPasswordApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const employeeResetPassword = createAsyncThunk(
  "employee/reset-password",
  async (data, thunkAPI) => {
    try {
      const res = await employeeResetPasswordApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

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

export const createReferral = createAsyncThunk(
  "employee/createReferral",
  async (formData, thunkAPI) => {
    try {
      const res = await createReferralApi(formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getMyReferrals = createAsyncThunk(
  "employee/getMyReferrals",
  async (employeeId, thunkAPI) => {
    try {
      if (!employeeId) {
        return thunkAPI.rejectWithValue("Employee ID missing");
      }
      const res = await getMyReferralsApi(employeeId);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ---------------- SLICE ---------------- */

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,

    // 🔐 REAL BACKEND ROLE (never change)
    role: localStorage.getItem("role") || null,

    employment_type: localStorage.getItem("employment_type") || null,
    is_temp_admin: localStorage.getItem("is_temp_admin") === "true",

    empUUID: localStorage.getItem("empUUID") || null,

    loading: false,
    error: null,

    preview: [],

    myReferrals: [],
    referralLoading: false,
    referralError: null,
    referralSuccess: false,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.is_temp_admin = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("active_role");
      localStorage.removeItem("employment_type");
      localStorage.removeItem("is_temp_admin");
      localStorage.removeItem("empUUID");
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

      /* -------- EMPLOYEE LOGIN -------- */
      .addCase(employeeLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(employeeLogin.fulfilled, (state, action) => {
        state.loading = false;

        const { token, employee } = action.payload || {};
        if (!employee) return;

        // 🔐 DO NOT overwrite backend role
        const backendRole =
          localStorage.getItem("role") || employee.role || "employee";

        localStorage.setItem("role", backendRole);
        state.role = backendRole;

        // 🧭 SET UI ROLE
        localStorage.setItem("active_role", "employee");

        // 🧩 ENRICH USER
        const enrichedUser = {
          ...employee,
          employment_type: employee.employment_type || "fulltime",
          role_1: employee.role_1 || null,
          role_2: employee.role_2 || null,
          is_temp_admin: employee.is_temp_admin || false,
        };

        state.user = enrichedUser;
        localStorage.setItem("user", JSON.stringify(enrichedUser));

        state.employment_type = enrichedUser.employment_type;
        state.is_temp_admin = enrichedUser.is_temp_admin;

        if (employee.id) {
          state.empUUID = employee.id;
          localStorage.setItem("empUUID", employee.id);
        }

        if (token) {
          state.token = token;
          localStorage.setItem("token", token);
        }

        localStorage.setItem(
          "employment_type",
          enrichedUser.employment_type
        );
        localStorage.setItem(
          "is_temp_admin",
          String(enrichedUser.is_temp_admin)
        );
      })

      .addCase(employeeLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- RESET PASSWORD -------- */
      .addCase(employeeResetPassword.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })

      /* -------- UPLOAD EXCEL -------- */
      .addCase(employeeUploadExcel.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.preview || [];
        state.preview = Array.isArray(data) ? data : [];
      })

      /* -------- BULK INSERT -------- */
      .addCase(employeeBulkInsert.fulfilled, (state) => {
        state.loading = false;
        state.preview = [];
      })

      /* -------- REFERRALS -------- */
      .addCase(createReferral.pending, (state) => {
        state.referralLoading = true;
        state.referralSuccess = false;
      })
      .addCase(createReferral.fulfilled, (state) => {
        state.referralLoading = false;
        state.referralSuccess = true;
      })
      .addCase(createReferral.rejected, (state, action) => {
        state.referralLoading = false;
        state.referralError = action.payload;
      })

      .addCase(getMyReferrals.fulfilled, (state, action) => {
        state.referralLoading = false;
        state.myReferrals = action.payload.referrals || [];
      });
  },
});

export const {
  logout,
  clearPreview,
  updatePreviewRow,
  deletePreviewRow,
} = employeeSlice.actions;

export default employeeSlice.reducer;
