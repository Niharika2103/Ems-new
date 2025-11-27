import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminRegisterApi, adminLoginApi, adminVerifyOtpApi, DeleteAdminApi, uploadEmployeeDocumentsApi, getAllReferralsAdminApi, getReferralByIdAdminApi, updateReferralStatusAdminApi, } from "../../api/authApi";

export const adminRegister = createAsyncThunk("admin/register", async (data, thunkAPI) => {
  try {
    const res = await adminRegisterApi(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const adminLogin = createAsyncThunk("admin/login", async (data, thunkAPI) => {
  try {
    const res = await adminLoginApi(data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const adminverifyOtp = createAsyncThunk("admin/mfa-verify", async (data, thunkAPI) => {
  try {
    const response = await adminVerifyOtpApi(data);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

//deleteadmin
export const deleteAdmin = createAsyncThunk(
  "admin/status",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await DeleteAdminApi(id, status);
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
      return res.data; // returns { message, documents }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Get all referrals (Admin)
export const getAllReferralsAdmin = createAsyncThunk(
  "admin/getAllReferrals",
  async (_, thunkAPI) => {
    try {
      const response = await getAllReferralsAdminApi();
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Get referral by ID (Admin)
export const getReferralByIdAdmin = createAsyncThunk(
  "admin/getReferralById",
  async (referral_id, thunkAPI) => {
    try {
      const response = await getReferralByIdAdminApi(referral_id);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update referral status (Admin)
export const updateReferralStatusAdmin = createAsyncThunk(
  "admin/updateReferralStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await updateReferralStatusAdminApi(id, status);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


const adminSlice = createSlice({
  name: "admin",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    loading: false,
    error: null,
    allReferrals: [],          // for referral list
  selectedReferral: null,    // for detail view
  referralsLoading: false,   // for list/detail loading
  referralActionLoading: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminRegister.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(adminRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        const role = action.payload.user?.role;
        const id = action.payload.user?.id || null;
        state.id = id;
        if (id) {
          localStorage.setItem("userId", id);
        }
        if (role) {
          state.role = role;
          localStorage.setItem("role", role);
        }
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
        if (action.payload.user) {
          state.user = action.payload.user;
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })

      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })
      .addCase(adminverifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminverifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
        if (action.payload.role) {
          state.role = action.payload.role;
          localStorage.setItem("role", action.payload.role);
        }
      })
      .addCase(adminverifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OTP verification failed";
      })

      // Upload Employee Documents
.addCase(uploadEmployeeDocuments.pending, (state) => {
    state.loading = true;
    state.error = null;
})
.addCase(uploadEmployeeDocuments.fulfilled, (state, action) => {
    state.loading = false;
    state.error = null;

    // success → store uploaded documents if needed
    state.uploadedDocuments = action.payload.documents;
})
.addCase(uploadEmployeeDocuments.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Document upload failed";
})

// Get All Referrals
.addCase(getAllReferralsAdmin.pending, (state) => {
  state.referralsLoading = true;
  state.error = null;
})
.addCase(getAllReferralsAdmin.fulfilled, (state, action) => {
  state.referralsLoading = false;
  state.allReferrals = action.payload.referrals || [];
})
.addCase(getAllReferralsAdmin.rejected, (state, action) => {
  state.referralsLoading = false;
  state.error = action.payload;
})

// Get Referral By ID
.addCase(getReferralByIdAdmin.pending, (state) => {
  state.referralsLoading = true;
  state.error = null;
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

// Update Referral Status
.addCase(updateReferralStatusAdmin.pending, (state) => {
  state.referralActionLoading = true;
  state.error = null;
})
.addCase(updateReferralStatusAdmin.fulfilled, (state, action) => {
  state.referralActionLoading = false;
  // ✅ Optimistically update the list
  const updatedReferral = action.payload.updated_referral;
  state.allReferrals = state.allReferrals.map(ref =>
    ref.id === updatedReferral.id ? updatedReferral : ref
  );
  // ✅ Also update selectedReferral if open
  if (state.selectedReferral && state.selectedReferral.id === updatedReferral.id) {
    state.selectedReferral = updatedReferral;
  }
})
.addCase(updateReferralStatusAdmin.rejected, (state, action) => {
  state.referralActionLoading = false;
  state.error = action.payload;
})
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
