import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { verifyEmailAdmin, sendVerifyEmailAdmin} from "../../api/authApi";

// Send OTP
export const sendEmailOtp = createAsyncThunk(
  "email/sendOtp",
  async (_, thunkAPI) => {
    try {
      const res = await sendVerifyEmailAdmin();
      return res.data.message; 
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to send OTP"
      );
    }
  }
);

// Verify OTP
export const verifyEmailOtp = createAsyncThunk(
  "email/verifyOtp",
  async (otp, thunkAPI) => {
    try {
      const res = await verifyEmailAdmin({ otp });
      return res.data.message; 
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Invalid or expired OTP"
      );
    }
  }
);

const emailSlice = createSlice({
  name: "verification",
  initialState: {
    loading: false,
    emailSent: false,
    emailVerified: false,
    error: null,
  },
  reducers: {
    resetEmailState: (state) => {
      state.loading = false;
      state.emailSent = false;
      state.emailVerified = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendEmailOtp.fulfilled, (state) => {
        state.loading = false;
        state.emailSent = true;
      })
      .addCase(sendEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state) => {
        state.loading = false;
        state.emailVerified = true;
        state.emailSent = false; 
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetEmailState } = emailSlice.actions;
export default emailSlice.reducer;
