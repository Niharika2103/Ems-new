import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  adminRegisterApi,
  adminLoginApi,
  fetchNewEmployeeApi,
  adminVerifyOtpApi,
  DeleteAdminApi,
  uploadEmployeeDocumentsApi,
  getAllReferralsAdminApi,
  getReferralByIdAdminApi,
  updateReferralStatusAdminApi,
} from "../../api/authApi";

/* -------------------- THUNKS -------------------- */

export const adminRegister = createAsyncThunk(
  "admin/register",
  async (data, thunkAPI) => {
    try {
      const res = await adminRegisterApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (data, thunkAPI) => {
    try {
      const res = await adminLoginApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const adminverifyOtp = createAsyncThunk(
  "admin/mfa-verify",
  async (data, thunkAPI) => {
    try {
      const res = await adminVerifyOtpApi(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  "admin/status",
  async ({ id, status }, thunkAPI) => {
    try {
      await DeleteAdminApi(id, status);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const uploadEmployeeDocuments = createAsyncThunk(
  "admin/uploadEmployeeDocuments",
  async ({ employeeId, data }, thunkAPI) => {
    try {
      const res = await uploadEmployeeDocumentsApi(employeeId, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getAllReferralsAdmin = createAsyncThunk(
  "admin/getAllReferrals",
  async (_, thunkAPI) => {
    try {
      const res = await getAllReferralsAdminApi();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getReferralByIdAdmin = createAsyncThunk(
  "admin/getReferralById",
  async (id, thunkAPI) => {
    try {
      const res = await getReferralByIdAdminApi(id);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateReferralStatusAdmin = createAsyncThunk(
  "admin/updateReferralStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const res = await updateReferralStatusAdminApi(id, status);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchNewEmployees = createAsyncThunk(
  "admin/fetchNewEmployees",
  async (_, thunkAPI) => {
    try {
      const res = await fetchNewEmployeeApi();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* -------------------- SLICE -------------------- */

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,

    // 🔐 REAL BACKEND ROLE (DO NOT USE FOR UI)
    role: localStorage.getItem("role") || null,

    loading: false,
    error: null,

    newEmpList: [],

    allReferrals: [],
    selectedReferral: null,
    referralsLoading: false,
    referralActionLoading: false,
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
  },

  extraReducers: (builder) => {
    builder

      /* ---------- ADMIN LOGIN ---------- */
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;

        const { token, user } = action.payload || {};
        if (!user) return;

        // 🔐 REAL ROLE (never changes)
        state.role = user.role;
        localStorage.setItem("role", user.role);

        // 🧭 ACTIVE ROLE (UI mode)
        if (!localStorage.getItem("active_role")) {
          localStorage.setItem("active_role", user.role);
        }

        // 🧩 ENRICH USER OBJECT (VERY IMPORTANT)
        const enrichedUser = {
          id: user.id,
          name: user.name,
          email: user.email,

          role: user.role,
          role_1: user.role_1 || null,
          role_2: user.role_2 || "employee",

          employment_type: user.employment_type || "fulltime",
          is_temp_admin: user.is_temp_admin || false,
        };

        state.user = enrichedUser;
        localStorage.setItem("user", JSON.stringify(enrichedUser));

        if (token) {
          state.token = token;
          localStorage.setItem("token", token);
        }
      })

      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- MFA VERIFY ---------- */
      .addCase(adminverifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(adminverifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })

      .addCase(adminverifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- DOCUMENT UPLOAD ---------- */
      .addCase(uploadEmployeeDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadEmployeeDocuments.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadEmployeeDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- REFERRALS ---------- */
      .addCase(getAllReferralsAdmin.pending, (state) => {
        state.referralsLoading = true;
      })
      .addCase(getAllReferralsAdmin.fulfilled, (state, action) => {
        state.referralsLoading = false;
        state.allReferrals = action.payload?.referrals || [];
      })
      .addCase(getAllReferralsAdmin.rejected, (state, action) => {
        state.referralsLoading = false;
        state.error = action.payload;
      })

      .addCase(getReferralByIdAdmin.pending, (state) => {
        state.referralsLoading = true;
        state.selectedReferral = null;
      })
      .addCase(getReferralByIdAdmin.fulfilled, (state, action) => {
        state.referralsLoading = false;
        state.selectedReferral = action.payload;
      })
      .addCase(getReferralByIdAdmin.rejected, (state, action) => {
        state.referralsLoading = false;
        state.error = action.payload;
      })

      .addCase(updateReferralStatusAdmin.pending, (state) => {
        state.referralActionLoading = true;
      })
      .addCase(updateReferralStatusAdmin.fulfilled, (state, action) => {
        state.referralActionLoading = false;
        const updated = action.payload?.updated_referral;
        if (updated) {
          state.allReferrals = state.allReferrals.map((r) =>
            r.id === updated.id ? updated : r
          );
          if (state.selectedReferral?.id === updated.id) {
            state.selectedReferral = updated;
          }
        }
      })
      .addCase(updateReferralStatusAdmin.rejected, (state, action) => {
        state.referralActionLoading = false;
        state.error = action.payload;
      })

      /* ---------- NEW EMPLOYEES ---------- */
      .addCase(fetchNewEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNewEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.newEmpList = action.payload?.data || [];
      })
      .addCase(fetchNewEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
