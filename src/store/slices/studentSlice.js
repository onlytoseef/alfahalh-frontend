import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Set the base URL for API calls
const API_URL = "https://backend-alfalah.vercel.app/api";

export const fetchStudents = createAsyncThunk("students/fetchAll", async () => {
  const response = await axios.get(`${API_URL}/students`);
  return response.data;
});

export const fetchTotalStudents = createAsyncThunk(
  "students/fetchTotal",
  async () => {
    const response = await axios.get(`${API_URL}/total-students`);
    return response.data.total;
  }
);

export const addStudent = createAsyncThunk(
  "students/add",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/add-student`, // Correct endpoint
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.student;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateStudent = createAsyncThunk(
  "students/update",
  async ({ id, formData }) => {
    const response = await axios.put(`${API_URL}/student/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.student;
  }
);

export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/student/${studentId}`);
      return studentId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const studentsSlice = createSlice({
  name: "students",
  initialState: {
    students: [],
    totalStudents: 0,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchTotalStudents.fulfilled, (state, action) => {
        state.totalStudents = action.payload;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.students.push(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.students = state.students.map((student) =>
          student.studentId === action.payload.studentId
            ? action.payload
            : student
        );
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(
          (student) => student.studentId !== action.payload
        );
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        console.error("Failed to delete student:", action.payload);
      });
  },
});

export default studentsSlice.reducer;
