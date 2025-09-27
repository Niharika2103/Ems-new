import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { superadminRegisterApi, superadminLoginApi, superadminVerifyOtpApi, checkEmailApi, FetchallAdminApi, superadminApproveAdminApi } from "../../api/authApi";

export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  try {
    const response = await superadminRegisterApi(data);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

// Async thunk to check email
export const checkEmail = createAsyncThunk(
  "auth/checkEmail",
  async (email, thunkAPI) => {
    try {
      const response = await checkEmailApi(email);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const response = await superadminLoginApi(data);
    return response.data;

  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (data, thunkAPI) => {
  try {
    const response = await superadminVerifyOtpApi(data);
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});
//fetch all admin 
export const fetchallAdmin = createAsyncThunk("auth/fetchallAdmin", async (_, thunkAPI) => {
  try {
    const response = await FetchallAdminApi();
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});
//superAdmin given access to admin 
export const approveAdmin = createAsyncThunk(
  "auth/approveAdmin",
  async ({ id, is_approved }, thunkAPI) => {
    try {
      const response = await superadminApproveAdminApi(id, is_approved);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
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
      localStorage.removeItem("token");
    },
    resetEmailStatus: (state) => {
      state.emailStatus = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(checkEmail.pending, (state) => {
        state.emailStatus = null;
      })
      .addCase(checkEmail.fulfilled, (state, action) => {
        if (action.payload.authorized) {
          state.emailStatus = true;
        } else {
          state.emailStatus = false;
        }
      })
      .addCase(checkEmail.rejected, (state) => {
        state.emailStatus = false;
      })

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
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        const role = action.payload.user?.role;
        if (role) {
          state.role = role;
          localStorage.setItem("role", role);
        }
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
        }
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        if (action.payload.role) {
          state.role = action.payload.role;
          localStorage.setItem("role", action.payload.role);
        }
      })
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
