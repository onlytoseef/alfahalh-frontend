import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Set the base URL for API calls
const API_URL = "https://backend-alfalah.vercel.app/api";

export const fetchClasses = createAsyncThunk("classes/fetchAll", async () => {
  const response = await axios.get(`${API_URL}/classes`);
  return response.data;
});

export const fetchClassById = createAsyncThunk(
  "classes/fetchById",
  async (id) => {
    const response = await axios.get(`${API_URL}/class/${id}`);
    return response.data;
  }
);

export const addClass = createAsyncThunk("classes/add", async (classData) => {
  const response = await axios.post(`${API_URL}/add-class`, classData);
  return response.data.newClass;
});

export const deleteClass = createAsyncThunk("classes/delete", async (id) => {
  await axios.delete(`${API_URL}/delete-class/${id}`);
  return id;
});

const classSlice = createSlice({
  name: "classes",
  initialState: {
    classes: [],
    selectedClass: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedClass: (state) => {
      state.selectedClass = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch Single Class
      .addCase(fetchClassById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClass = action.payload;
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addClass.fulfilled, (state, action) => {
        state.classes.push(action.payload);
      })

      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(
          (cls) => cls._id !== action.payload
        );
      });
  },
});

export const { clearSelectedClass } = classSlice.actions;
export default classSlice.reducer;
