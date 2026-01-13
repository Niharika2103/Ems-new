import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  superadminRegisterApi,
  superadminLoginApi,
  superadminVerifyOtpApi,
  checkEmailApi,
  FetchallAdminApi,
  superadminApproveAdminApi,
} from "../../api/authApi";

/* ---------------- THUNKS ---------------- */

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await superadminRegisterApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const checkEmail = createAsyncThunk(
  "auth/checkEmail",
  async (email, thunkAPI) => {
    try {
      const res = await checkEmailApi(email);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await superadminLoginApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data, thunkAPI) => {
    try {
      const res = await superadminVerifyOtpApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchallAdmin = createAsyncThunk(
  "auth/fetchallAdmin",
  async (_, thunkAPI) => {
    try {
      const res = await FetchallAdminApi();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const approveAdmin = createAsyncThunk(
  "auth/approveAdmin",
  async ({ id, is_approved }, thunkAPI) => {
    try {
      const res = await superadminApproveAdminApi(id, is_approved);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ---------------- SLICE ---------------- */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,

    // 🔐 REAL BACKEND ROLE ONLY
    role: localStorage.getItem("role") || null,

    loading: false,
    error: null,
    emailStatus: null,
    list: [],
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("active_role");
    },

    resetEmailStatus: (state) => {
      state.emailStatus = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------- EMAIL CHECK -------- */
      .addCase(checkEmail.pending, (state) => {
        state.emailStatus = null;
      })
      .addCase(checkEmail.fulfilled, (state, action) => {
        state.emailStatus = !!action.payload.authorized;
      })
      .addCase(checkEmail.rejected, (state) => {
        state.emailStatus = false;
      })

      /* -------- REGISTER -------- */
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- LOGIN -------- */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        const { token, user } = action.payload || {};
        if (!user) return;

        // 🔐 REAL ROLE (never changes)
        state.role = user.role;
        localStorage.setItem("role", user.role);

        // 🧭 DEFAULT UI ROLE
        if (!localStorage.getItem("active_role")) {
          localStorage.setItem("active_role", user.role);
        }

        // 🧩 ENRICH USER OBJECT
        const enrichedUser = {
          id: user.id,
          name: user.name,
          email: user.email,

          role: user.role,
          role_1: user.role_1 || "admin",
          role_2: user.role_2 || "employee",

          employment_type: user.employment_type || "fulltime",
          is_temp_admin: false,
        };

        state.user = enrichedUser;
        localStorage.setItem("user", JSON.stringify(enrichedUser));

        if (token) {
          state.token = token;
          localStorage.setItem("token", token);
        }
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- VERIFY OTP -------- */
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })

      /* -------- FETCH ADMINS -------- */
      .addCase(fetchallAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchallAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchallAdmin.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, resetEmailStatus } = authSlice.actions;
export default authSlice.reducer;
