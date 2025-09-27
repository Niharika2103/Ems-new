import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminRegisterApi, adminLoginApi, adminVerifyOtpApi, DeleteAdminApi } from "../../api/authApi";

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
  "admin/delete",
  async (id, thunkAPI) => {
    try {
      const response = await DeleteAdminApi(id);
      return id; // return deleted id to remove from list
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
      });
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
