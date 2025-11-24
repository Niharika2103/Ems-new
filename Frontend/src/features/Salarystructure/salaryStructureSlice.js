import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
 createSalaryStructureApi,fetchsalarybgidApi,
} from "../../api/authApi";

//save salary structure 
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

export const getsalarybyid = createAsyncThunk(
  "salary/fetch",
  async (id, thunkAPI) => {
    try {
      const response = await fetchsalarybgidApi(id);
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
    //save salary structure
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
      //get salary structure
      .addCase(getsalarybyid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getsalarybyid.fulfilled, (state, action) => {
        state.loading = false;
        state.SalaryList = action.payload;
      })
      .addCase(getsalarybyid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearSalaryStructureState } = salarystructureSlice.actions;
export default salarystructureSlice.reducer;

