import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
 FetchFreelancerApi,
} from "../../api/authApi";

//fetch all freelancer
export const fetchAllFreelancer = createAsyncThunk(
  "employee/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await FetchFreelancerApi();
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


const freelancerSlice = createSlice({
  name: "freelancerInfo",
  initialState: {
    freelancerlist:[],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearFreelancerState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
    //freelancer
      .addCase(fetchAllFreelancer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFreelancer.fulfilled, (state, action) => {
        state.loading = false;
        state.freelancerlist = action.payload;
      })
      .addCase(fetchAllFreelancer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearFreelancerState } = freelancerSlice.actions;
export default freelancerSlice.reducer;

