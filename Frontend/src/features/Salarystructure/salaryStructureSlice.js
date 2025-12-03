import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
 createSalaryStructureApi,fetchsalarybgidApi,createProbationPeriodApi,fetchassignProbationApi,
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
//Probation 
export const createProbation = createAsyncThunk(
  "probation/create",
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await createProbationPeriodApi(payload);
      // assuming API returns created item in resp.data
      return resp.data;
    } catch (err) {
      // Normalize error message
      const message =
        (err.response && err.response.data && err.response.data.error) ||
        (err.response && err.response.data) ||
        err.message ||
        "Failed to create probation";
      return rejectWithValue(message);
    }
  }
);
//get assign probation 
export const fetchassignProbation = createAsyncThunk(
  "Probation/fetch",
  async (_, thunkAPI) => {
    try {
      const response = await fetchassignProbationApi();
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
    created: null, // last created probation response
    list: [], // optional if you later fetch all probations
  
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
       .addCase(createProbation.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.created = null;
      })
      .addCase(createProbation.fulfilled, (state, action) => {
        state.creating = false;
        state.created = action.payload;
        // optionally push to list
        if (action.payload?.probation) {
          state.list.unshift(action.payload.probation);
        } else {
          // if API returns probation row directly
          state.list.unshift(action.payload);
        }
      })
      .addCase(createProbation.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || action.error?.message;
      })
      //fetchassignProbation
      .addCase(fetchassignProbation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchassignProbation.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchassignProbation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
 

  },
});

export const { clearSalaryStructureState } = salarystructureSlice.actions;
export default salarystructureSlice.reducer;

