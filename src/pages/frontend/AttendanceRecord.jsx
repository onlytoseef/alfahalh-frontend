import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import moment from "moment";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const AttendanceRecord = () => {
  const [studentId, setStudentId] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("currentMonth");

  const fetchStudentData = async () => {
    if (studentId && studentId.length === 5) {
      setLoading(true);
      try {
        const studentResponse = await axios.get(
          `http://192.168.10.2:5000/api/student/${studentId}`
        );
        setStudentInfo(studentResponse.data);

        const currentMonthStart = moment()
          .startOf("month")
          .format("YYYY-MM-DD");
        const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");

        const attendanceResponse = await axios.get(
          `http://192.168.10.2:5000/api/attendance/student/${studentId}?startDate=${currentMonthStart}&endDate=${currentMonthEnd}`
        );

        const allDates = [];
        let currentDate = moment(currentMonthStart);
        while (currentDate.isSameOrBefore(currentMonthEnd)) {
          allDates.push(currentDate.format("YYYY-MM-DD"));
          currentDate.add(1, "day");
        }

        const attendanceMap = {};
        attendanceResponse.data.forEach((record) => {
          const recordDate = moment(record.date).format("YYYY-MM-DD");
          attendanceMap[recordDate] = record;
        });

        const history = allDates.map((date) => ({
          date,
          status: attendanceMap[date] ? "Present" : "Absent",
          time: attendanceMap[date] ? attendanceMap[date].time : null,
        }));

        setAttendanceHistory(history);
        toast.success(
          "Student data and attendance history fetched successfully!"
        );
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch student data."
        );
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please enter a valid 5-digit student ID.");
    }
  };
  const getDateRange = () => {
    switch (dateRange) {
      case "lastMonth":
        return {
          start: moment()
            .subtract(1, "month")
            .startOf("month")
            .format("YYYY-MM-DD"),
          end: moment()
            .subtract(1, "month")
            .endOf("month")
            .format("YYYY-MM-DD"),
        };
      case "lastWeek":
        return {
          start: moment()
            .subtract(1, "week")
            .startOf("week")
            .format("YYYY-MM-DD"),
          end: moment().subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
        };
      default: // currentMonth
        return {
          start: moment().startOf("month").format("YYYY-MM-DD"),
          end: moment().endOf("month").format("YYYY-MM-DD"),
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-8xl mx-auto bg-white rounded-xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Student Attendance History
        </h2>

        <div className="flex items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F1F64] focus:border-transparent"
          />
          <button
            onClick={fetchStudentData}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#6F1F64] to-[#8B2D7F] text-white rounded-lg hover:from-[#8B2D7F] hover:to-[#6F1F64] transition-all shadow-lg cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : (
              "Fetch Student Data"
            )}
          </button>
        </div>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setDateRange("currentMonth")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "currentMonth"
                ? "bg-[#6F1F64] text-white"
                : "bg-gray-200"
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setDateRange("lastMonth")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "lastMonth"
                ? "bg-[#6F1F64] text-white"
                : "bg-gray-200"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setDateRange("lastWeek")}
            className={`px-4 py-2 rounded-lg ${
              dateRange === "lastWeek"
                ? "bg-[#6F1F64] text-white"
                : "bg-gray-200"
            }`}
          >
            Last Week
          </button>
        </div>

        {studentInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 text-center"
          >
            {studentInfo.photo && (
              <img
                src={`http://192.168.10.4:5000${studentInfo.photo}`}
                alt="Student Photo"
                className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg border-4 border-[#6F1F64]"
              />
            )}
            <h3 className="text-2xl font-bold text-gray-800">
              {studentInfo.name}
            </h3>
            <p className="text-gray-600">
              Class: {studentInfo.classId.grade} - {studentInfo.classId.section}
            </p>
            <p className="text-gray-600">
              Roll Number: {studentInfo.rollNumber}
            </p>
          </motion.div>
        )}
        {attendanceHistory.length > 0 && (
          <div className="flex justify-center gap-6 my-6">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-800">
                {attendanceHistory.filter((r) => r.status === "Present").length}
              </p>
              <p className="text-green-600">Present Days</p>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-pink-800">
                {attendanceHistory.filter((r) => r.status === "Absent").length}
              </p>
              <p className="text-pink-600">Absent Days</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-800">
                {Math.round(
                  (attendanceHistory.filter((r) => r.status === "Present")
                    .length /
                    attendanceHistory.length) *
                    100
                )}
                %
              </p>
              <p className="text-blue-600">Attendance Rate</p>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {attendanceHistory.map((record) => (
              <motion.div
                key={record.date}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-xl shadow-lg ${
                  record.status === "Present"
                    ? "bg-gradient-to-r from-green-200 to-green-100 border-2 border-green-400"
                    : "bg-gradient-to-r from-pink-200 to-pink-100 border-2 border-pink-400"
                }`}
              >
                <p className="text-lg font-bold text-gray-800 text-center">
                  {moment(record.date).format("DD MMM YYYY")}
                </p>
                <div className="text-center mt-4">
                  {record.status === "Present" ? (
                    <>
                      <FaCheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="text-green-600 font-semibold mt-2">
                        Present
                      </p>
                      <p className="text-gray-600 text-sm">{record.time}</p>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="h-8 w-8 text-pink-600 mx-auto" />
                      <p className="text-pink-600 font-semibold mt-2">Absent</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AttendanceRecord;
