import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
 createSalaryStructureApi,
} from "../../api/authApi";

//fetch all freelancer
export const saveSalaryStructure = createAsyncThunk(
  "salary/create",
  async (formData, thunkAPI) => {
    try {
      const response = await createSalaryStructureApi(formData);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


const salarystructureSlice = createSlice({
  name: "salaryInfo",
  initialState: {
    SalaryList:[],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSalaryStructureState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
    //freelancer
      .addCase(saveSalaryStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSalaryStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.SalaryList = action.payload;
      })
      .addCase(saveSalaryStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearSalaryStructureState } = salarystructureSlice.actions;
export default salarystructureSlice.reducer;

