// // // src/features/vendor/formSlice.js
// // import { createSlice } from '@reduxjs/toolkit';

// // // Load initial state from localStorage
// // const loadInitialState = () => {
// //   const savedFormConfig = localStorage.getItem('formConfig');
// //   const savedSubmissions = localStorage.getItem('vendorSubmissions');
  
// //   return {
// //     formConfig: savedFormConfig ? JSON.parse(savedFormConfig) : [
// //       { id: 1, label: "Company Name", type: "text", required: true },
// //       { id: 2, label: "Email", type: "email", required: true },
// //       { id: 3, label: "Phone", type: "tel", required: true },
// //       { id: 4, label: "Business Type", type: "select", options: ["Manufacturer", "Supplier", "Distributor"], required: true },
// //       { id: 5, label: "Years in Business", type: "number", required: true },
// //       { id: 6, label: "Company Website", type: "website", required: false },
// //       { id: 7, label: "Bank Details", type: "bank", required: true },
// //       { id: 8, label: "Tax Registration", type: "tax", required: true },
// //       { id: 9, label: "Business License", type: "file", required: true },
// //       { id: 10, label: "Required Documents", type: "multiFile", required: true }
// //     ],
// //     submissions: savedSubmissions ? JSON.parse(savedSubmissions) : []
// //   };
// // };

// // const formSlice = createSlice({
// //   name: 'form',
// //   initialState: loadInitialState(),
// //   reducers: {
// //     addField: (state, action) => {
// //       const newField = {
// //         ...action.payload,
// //         id: Date.now()
// //       };
// //       state.formConfig.push(newField);
// //       localStorage.setItem('formConfig', JSON.stringify(state.formConfig));
// //     },
    
// //     removeField: (state, action) => {
// //       state.formConfig = state.formConfig.filter(field => field.id !== action.payload);
// //       localStorage.setItem('formConfig', JSON.stringify(state.formConfig));
// //     },

// //     updateField: (state, action) => {
// //       const { id, updates } = action.payload;
// //       const index = state.formConfig.findIndex(f => f.id === id);
// //       if (index !== -1) {
// //         state.formConfig[index] = { ...state.formConfig[index], ...updates };
// //         localStorage.setItem('formConfig', JSON.stringify(state.formConfig));
// //       }
// //     },
// //     updateSubmissions: (state, action) => {
// //   state.submissions = action.payload;
// //   localStorage.setItem('vendorSubmissions', JSON.stringify(state.submissions));
// // },

// //     addSubmission: (state, action) => {
// //       state.submissions.push(action.payload);
// //       localStorage.setItem('vendorSubmissions', JSON.stringify(state.submissions));
// //     }
    
// //   }
// // });

// // export const { addField, removeField, updateField, addSubmission ,updateSubmissions} = formSlice.actions;
// // export default formSlice.reducer;
// // src/features/vendor/formSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// /* ================================
//    INITIAL STATE (NO localStorage)
// ================================ */
// const initialState = {
//   formConfig: [
//     { id: 1, label: "Company Name", type: "text", required: true },
//     { id: 2, label: "Email", type: "email", required: true },
//     { id: 3, label: "Phone", type: "tel", required: true },
//     {
//       id: 4,
//       label: "Business Type",
//       type: "select",
//       options: ["Manufacturer", "Supplier", "Distributor"],
//       required: true,
//     },
//     { id: 5, label: "Years in Business", type: "number", required: true },
//     { id: 6, label: "Company Website", type: "website", required: false },
//     { id: 7, label: "Bank Details", type: "bank", required: true },
//     { id: 8, label: "Tax Registration", type: "tax", required: true },
//     { id: 9, label: "Business License", type: "file", required: true },
//     {
//       id: 10,
//       label: "Required Documents",
//       type: "multiFile",
//       required: true,
//     },
//   ],
//   submissions: [],
// };

// /* ================================
//    SLICE
// ================================ */
// const formSlice = createSlice({
//   name: "form",
//   initialState,
//   reducers: {
//     addField: (state, action) => {
//       state.formConfig.push({
//         ...action.payload,
//         id: Date.now(),
//       });
//     },

//     removeField: (state, action) => {
//       state.formConfig = state.formConfig.filter(
//         (field) => field.id !== action.payload
//       );
//     },

//     updateField: (state, action) => {
//       const { id, updates } = action.payload;
//       const index = state.formConfig.findIndex((f) => f.id === id);
//       if (index !== -1) {
//         state.formConfig[index] = {
//           ...state.formConfig[index],
//           ...updates,
//         };
//       }
//     },

//     // ✅ ADD THIS (FIXES YOUR ERROR)
//     updateSubmissions: (state, action) => {
//       state.submissions = action.payload;
//     },
//   },
// });

// export const {
//   addField,
//   removeField,
//   updateField,
//   updateSubmissions, // ✅ NOW EXPORTED
// } = formSlice.actions;

// export default formSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formConfig: [
    { id: 1, label: "Company Name", type: "text", required: true },
    { id: 2, label: "Email", type: "email", required: true },
    { id: 3, label: "Phone", type: "tel", required: true },
    {
      id: 4,
      label: "Business Type",
      type: "select",
      options: ["Manufacturer", "Supplier", "Distributor"],
      required: true,
    },
    { id: 5, label: "Years in Business", type: "number", required: true },
    { id: 6, label: "Company Website", type: "website", required: false },
    { id: 7, label: "Bank Details", type: "bank", required: true },
    { id: 8, label: "Tax Registration", type: "tax", required: true },
    { id: 9, label: "Business License", type: "file", required: true },
    { id: 10, label: "Required Documents", type: "multiFile", required: true },
  ],
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    addField: (state, action) => {
      state.formConfig.push({ ...action.payload, id: Date.now() });
    },
    removeField: (state, action) => {
      state.formConfig = state.formConfig.filter(f => f.id !== action.payload);
    },
    updateField: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.formConfig.findIndex(f => f.id === id);
      if (index !== -1) {
        state.formConfig[index] = {
          ...state.formConfig[index],
          ...updates,
        };
      }
    },
  },
});

export const { addField, removeField, updateField } = formSlice.actions;
export default formSlice.reducer;
