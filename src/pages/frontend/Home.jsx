import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { motion } from "framer-motion";
import axios from "axios";
import moment from "moment-timezone";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaClock,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaHandHoldingUsd,
  FaCalendarDay,
} from "react-icons/fa";

Chart.register(...registerables);

const SkeletonCard = () => (
  <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-gray-300">
    <div className="flex items-center">
      <div className="p-2 xl:p-3 rounded-full bg-gray-200 text-gray-400 mr-3 xl:mr-4">
        <div className="w-5 xl:w-6 h-5 xl:h-6"></div>
      </div>
      <div className="flex-1">
        <div className="h-3 xl:h-4 bg-gray-200 rounded w-3/4 mb-1 xl:mb-2"></div>
        <div className="h-6 xl:h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const SkeletonChart = ({ height = "300px" }) => (
  <div
    className="bg-gray-200 rounded animate-pulse"
    style={{ width: "100%", height }}
  ></div>
);

const SkeletonTable = () => (
  <div className="space-y-2">
    <div className="h-8 xl:h-10 bg-gray-200 rounded"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 xl:h-12 bg-gray-100 rounded"></div>
    ))}
  </div>
);

const Home = () => {
  const chartRef = useRef(null);
  const barChartRef = useRef(null);
  const dailyChartRef = useRef(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentStudents, setPresentStudents] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [monthlyPaid, setMonthlyPaid] = useState(0);
  const [monthlyPending, setMonthlyPending] = useState(0);
  const [monthlyPaidStudents, setMonthlyPaidStudents] = useState(0);
  const [monthlyPendingStudents, setMonthlyPendingStudents] = useState(0);
  const [admissionPaid, setAdmissionPaid] = useState(0);
  const [admissionPending, setAdmissionPending] = useState(0);
  const [admissionPaidStudents, setAdmissionPaidStudents] = useState(0);
  const [admissionPendingStudents, setAdmissionPendingStudents] = useState(0);
  const [staffSalaryPaid, setStaffSalaryPaid] = useState(0);
  const [staffSalaryPending, setStaffSalaryPending] = useState(0);
  const [paidStaffCount, setPaidStaffCount] = useState(0);
  const [pendingStaffCount, setPendingStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    moment().subtract(30, "days").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [dateError, setDateError] = useState("");

  const [feeData, setFeeData] = useState({
    labels: [],
    collected: [],
    pending: [],
  });
  const [dailyFeeData, setDailyFeeData] = useState({
    labels: [],
    paid: [],
    pending: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
      
        "http://192.168.10.2:5000/api/dashboard-summary"||"http://localhost:5000/api/dashboard-summary",
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      const data = response.data;

      setTotalStudents(data.totalStudents);
      setPresentStudents(data.presentStudents);
      setTotalStaff(data.totalStaff);

      setMonthlyPaid(data.monthlyFee.paid);
      setMonthlyPending(data.monthlyFee.pending);
      setMonthlyPaidStudents(data.monthlyFee.paidStudents);
      setMonthlyPendingStudents(data.monthlyFee.pendingStudents);

      setAdmissionPaid(data.admissionFee.paid);
      setAdmissionPending(data.admissionFee.pending);
      setAdmissionPaidStudents(data.admissionFee.paidStudents);
      setAdmissionPendingStudents(data.admissionFee.pendingStudents);

      setStaffSalaryPaid(data.staffSalary.paid);
      setStaffSalaryPending(data.staffSalary.pending);
      setPaidStaffCount(data.staffSalary.paidStaffCount);
      setPendingStaffCount(data.staffSalary.pendingStaffCount);

      setFeeData({
        labels: data.monthlyFeeYearSummary.map((item) => item.monthName),
        collected: data.monthlyFeeYearSummary.map((item) => item.paidFees),
        pending: data.monthlyFeeYearSummary.map((item) => item.pendingFees),
      });

      setDailyFeeData({
        labels: data.dailyFeeSummary.map((day) =>
          moment(day.date).format("DD MMM YYYY")
        ),
        paid: data.dailyFeeSummary.map((day) => day.paid),
        pending: data.dailyFeeSummary.map((day) => day.pending),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 400) {
        setDateError(error.response.data.message || "Invalid date range");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Validate date range
    if (moment(endDate).isBefore(startDate)) {
      setDateError("End date cannot be before start date");
      return;
    }
    setDateError("");
    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (!chartRef.current || loading) return;

    let pieChart, barChart, dailyChart;

    const createCharts = () => {
      // Pie Chart (Attendance)
      const ctx = chartRef.current.getContext("2d");
      pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Present", "Absent"],
          datasets: [
            {
              label: "Students",
              data: [presentStudents, totalStudents - presentStudents],
              backgroundColor: [
                "rgba(75, 192, 192, 0.6)",
                "rgba(255, 99, 132, 0.6)",
              ],
              borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: `Attendance for ${moment().format("DD MMM YYYY")}`,
              font: {
                size: window.innerWidth < 1280 ? 14 : 16,
              },
            },
          },
        },
      });

      // Bar Chart (Monthly Fees)
      if (barChartRef.current) {
        const barCtx = barChartRef.current.getContext("2d");
        barChart = new Chart(barCtx, {
          type: "bar",
          data: {
            labels: feeData.labels,
            datasets: [
              {
                label: "Collected Fees",
                data: feeData.collected,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
              {
                label: "Pending Fees",
                data: feeData.pending,
                backgroundColor: "rgba(255, 99, 132, 0.6)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Amount (Rs.)",
                  font: {
                    size: window.innerWidth < 1280 ? 12 : 14,
                  },
                },
                ticks: {
                  font: {
                    size: window.innerWidth < 1280 ? 10 : 12,
                  },
                },
              },
              x: {
                title: {
                  display: true,
                  text: `Months (${moment().year()})`,
                  font: {
                    size: window.innerWidth < 1280 ? 12 : 14,
                  },
                },
                ticks: {
                  font: {
                    size: window.innerWidth < 1280 ? 10 : 12,
                  },
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  font: {
                    size: window.innerWidth < 1280 ? 12 : 14,
                  },
                },
              },
            },
          },
        });
      }

      // Daily Fee Chart
      if (dailyChartRef.current) {
        const dailyCtx = dailyChartRef.current.getContext("2d");
        dailyChart = new Chart(dailyCtx, {
          type: "line",
          data: {
            labels: dailyFeeData.labels,
            datasets: [
              {
                label: "Daily Collected Fees",
                data: dailyFeeData.paid,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3,
                fill: true,
              },
              {
                label: "Daily Pending Fees",
                data: dailyFeeData.pending,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Fee Collection from ${moment(startDate).format(
                  "DD MMM YYYY"
                )} to ${moment(endDate).format("DD MMM YYYY")}`,
                font: {
                  size: window.innerWidth < 1280 ? 14 : 16,
                },
              },
              legend: {
                labels: {
                  font: {
                    size: window.innerWidth < 1280 ? 12 : 14,
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Amount (Rs.)",
                  font: {
                    size: window.innerWidth < 1280 ? 12 : 14,
                  },
                },
                ticks: {
                  font: {
                    size: window.innerWidth < 1280 ? 10 : 12,
                  },
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date",
                  font: {
                    size: window.innerWidth < 1280 ? 12 : 14,
                  },
                },
                ticks: {
                  font: {
                    size: window.innerWidth < 1280 ? 10 : 12,
                  },
                },
              },
            },
          },
        });
      }
    };

    createCharts();

    return () => {
      pieChart?.destroy();
      barChart?.destroy();
      dailyChart?.destroy();
    };
  }, [
    totalStudents,
    presentStudents,
    loading,
    feeData,
    dailyFeeData,
    startDate,
    endDate,
  ]);

  const currentMonthYear = moment().tz("Asia/Karachi").format("MMM YYYY");
  const totalCollectionRate =
    Math.round(
      ((monthlyPaid + admissionPaid) /
        (monthlyPaid + monthlyPending + admissionPaid + admissionPending)) *
        100
    ) || 0;

  const staffSalaryCollectionRate =
    Math.round(
      (staffSalaryPaid / (staffSalaryPaid + staffSalaryPending)) * 100
    ) || 0;

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  return (
    <div className="p-4 xl:p-6 2xl:p-8">
      <h1 className="text-xl md:text-2xl xl:text-3xl font-bold mb-4 xl:mb-6">
        Dashboard Home
      </h1>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 xl:gap-6 mb-6 xl:mb-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6 mb-6 xl:mb-8">
            <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md">
              <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
                Attendance Overview
              </h2>
              <div className="h-64 xl:h-80">
                <SkeletonChart />
              </div>
            </div>
            <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md">
              <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
                Monthly Fee Collection ({moment().year()})
              </h2>
              <div className="h-64 xl:h-80">
                <SkeletonChart />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md mb-6 xl:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 xl:mb-4">
              <h2 className="text-lg xl:text-xl font-semibold">
                Fee Collection
              </h2>
              <div className="flex items-center text-gray-500 text-sm xl:text-base mt-1 sm:mt-0">
                <FaCalendarDay className="mr-2" />
                <span>
                  {moment(startDate).format("DD MMM")} -{" "}
                  {moment(endDate).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
            <div className="h-80 xl:h-96">
              <SkeletonChart />
            </div>
          </div>

          <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md mb-6 xl:mb-8">
            <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
              Daily Fee Collection Details
            </h2>
            <SkeletonTable />
          </div>

          <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md">
            <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
              Financial Summary
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
              <div>
                <h3 className="text-base xl:text-lg font-medium mb-2">
                  Fee Collection Progress
                </h3>
                <div className="h-2 bg-gray-200 rounded-full mb-3 xl:mb-4"></div>
                <div className="grid grid-cols-2 gap-3 xl:gap-4">
                  <div className="h-20 xl:h-24 bg-gray-100 rounded-lg"></div>
                  <div className="h-20 xl:h-24 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
              <div>
                <h3 className="text-base xl:text-lg font-medium mb-2">
                  Salary Payment Progress
                </h3>
                <div className="h-2 bg-gray-200 rounded-full mb-3 xl:mb-4"></div>
                <div className="grid grid-cols-2 gap-3 xl:gap-4">
                  <div className="h-20 xl:h-24 bg-gray-100 rounded-lg"></div>
                  <div className="h-20 xl:h-24 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 xl:gap-6 mb-6 xl:mb-8">
            {/* Total Students Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-blue-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-blue-100 text-blue-600 mr-3 xl:mr-4">
                  <FaUsers className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Total Students
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-blue-600">
                    {totalStudents.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Total Staff Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-purple-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-purple-100 text-purple-600 mr-3 xl:mr-4">
                  <FaChalkboardTeacher className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Total Staff
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-purple-600">
                    {totalStaff.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Monthly Paid Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-green-100 text-green-600 mr-3 xl:mr-4">
                  <FaMoneyBillWave className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Monthly Paid ({currentMonthYear})
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-green-600">
                    Rs. {monthlyPaid.toLocaleString()}
                  </p>
                  <p className="text-xs xl:text-sm text-green-500 mt-1">
                    {monthlyPaidStudents} students paid
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Monthly Pending Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-red-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-red-100 text-red-600 mr-3 xl:mr-4">
                  <FaClock className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Monthly Pending ({currentMonthYear})
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-red-600">
                    Rs. {monthlyPending.toLocaleString()}
                  </p>
                  <p className="text-xs xl:text-sm text-red-500 mt-1">
                    {monthlyPendingStudents} students pending
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Admission Paid Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-teal-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-teal-100 text-teal-600 mr-3 xl:mr-4">
                  <FaFileInvoiceDollar className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Admission Paid
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-teal-600">
                    Rs. {admissionPaid.toLocaleString()}
                  </p>
                  <p className="text-xs xl:text-sm text-teal-500 mt-1">
                    {admissionPaidStudents} students paid
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Admission Pending Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-orange-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-orange-100 text-orange-600 mr-3 xl:mr-4">
                  <FaFileAlt className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Admission Pending
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-orange-600">
                    Rs. {admissionPending.toLocaleString()}
                  </p>
                  <p className="text-xs xl:text-sm text-orange-500 mt-1">
                    {admissionPendingStudents} students pending
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Staff Salary Paid Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-indigo-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-indigo-100 text-indigo-600 mr-3 xl:mr-4">
                  <FaMoneyCheckAlt className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Staff Salary Paid ({currentMonthYear})
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-indigo-600">
                    Rs. {staffSalaryPaid.toLocaleString()}
                  </p>
                  <p className="text-xs xl:text-sm text-indigo-500 mt-1">
                    {paidStaffCount} staff paid
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Staff Salary Pending Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-4 xl:p-6 rounded-lg shadow-md border-l-4 border-amber-500"
            >
              <div className="flex items-center">
                <div className="p-2 xl:p-3 rounded-full bg-amber-100 text-amber-600 mr-3 xl:mr-4">
                  <FaHandHoldingUsd className="text-xl xl:text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm xl:text-base text-gray-600 font-medium">
                    Staff Salary Pending ({currentMonthYear})
                  </h3>
                  <p className="text-2xl xl:text-3xl font-bold text-amber-600">
                    Rs. {staffSalaryPending.toLocaleString()}
                  </p>
                  <p className="text-xs xl:text-sm text-amber-500 mt-1">
                    {pendingStaffCount} staff pending
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6 mb-6 xl:mb-8">
            {/* Attendance Chart */}
            <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md">
              <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
                Attendance Overview
              </h2>
              <div className="h-64 xl:h-80">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>

            {/* Fee Collection Chart */}
            <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md">
              <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
                Monthly Fee Collection ({moment().year()})
              </h2>
              <div className="h-64 xl:h-80">
                <canvas ref={barChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Daily Fee Collection Chart */}
          <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md mb-6 xl:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 xl:mb-4">
              <h2 className="text-lg xl:text-xl font-semibold">
                Fee Collection
              </h2>
              <div className="flex items-center text-gray-500 text-sm xl:text-base mt-1 sm:mt-0">
                <FaCalendarDay className="mr-2" />
                <span>
                  {moment(startDate).format("DD MMM")} -{" "}
                  {moment(endDate).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
            <div className="h-80 xl:h-96">
              <canvas ref={dailyChartRef}></canvas>
            </div>
          </div>

          {/* Daily Fee Collection Table */}
          <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md mb-6 xl:mb-8 border border-gray-100">
            {/* Date Range Picker */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div>
                  <label className="text-sm font-medium text-gray-600 mr-2">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={handleDateChange}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mr-2">
                    End Date:
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={handleDateChange}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {dateError && (
                <p className="text-red-500 text-xs mt-2">{dateError}</p>
              )}
            </div>

            {/* Table Header with Title and Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 xl:mb-4 gap-2 xl:gap-3">
              <div>
                <h2 className="text-lg xl:text-xl font-semibold text-gray-800">
                  Daily Fee Collection
                </h2>
                <p className="text-xs xl:text-sm text-gray-500 mt-1">
                  Showing data from {moment(startDate).format("DD MMM YYYY")} to{" "}
                  {moment(endDate).format("DD MMM YYYY")} (
                  {dailyFeeData.labels.length} days)
                </p>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-xs xl:text-sm font-medium text-blue-700">
                  Total Collected: Rs.{" "}
                  {dailyFeeData.paid
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 xl:px-6 py-2 xl:py-3 text-left text-xs xl:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 xl:px-6 py-2 xl:py-3 text-left text-xs xl:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Collected (Rs.)
                    </th>
                    <th className="px-4 xl:px-6 py-2 xl:py-3 text-left text-xs xl:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Pending (Rs.)
                    </th>
                    <th className="px-4 xl:px-6 py-2 xl:py-3 text-left text-xs xl:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Total (Rs.)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyFeeData.labels.map((label, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-xs xl:text-sm font-medium text-gray-900">
                        {label}
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-xs xl:text-sm text-green-600 font-medium">
                        {dailyFeeData.paid[index].toLocaleString()}
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-xs xl:text-sm text-red-600 font-medium">
                        {dailyFeeData.pending[index].toLocaleString()}
                      </td>
                      <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-xs xl:text-sm font-bold text-gray-900">
                        {(
                          dailyFeeData.paid[index] + dailyFeeData.pending[index]
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="mt-2 xl:mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs xl:text-sm text-gray-500 gap-2">
              <div>Showing {dailyFeeData.labels.length} records</div>
              <div className="flex gap-3 xl:gap-4">
                <span className="text-green-600">
                  Paid: Rs.{" "}
                  {dailyFeeData.paid
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </span>
                <span className="text-red-600">
                  Pending: Rs.{" "}
                  {dailyFeeData.pending
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white p-4 xl:p-6 rounded-lg shadow-md">
            <h2 className="text-lg xl:text-xl font-semibold mb-3 xl:mb-4">
              Financial Summary
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
              <div>
                <h3 className="text-base xl:text-lg font-medium mb-2">
                  Fee Collection Progress
                </h3>
                <div className="flex justify-between mb-1">
                  <span className="text-xs xl:text-sm font-medium text-gray-600">
                    Collection Rate
                  </span>
                  <span className="text-xs xl:text-sm font-medium text-gray-600">
                    {totalCollectionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${totalCollectionRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-3 xl:gap-4 mt-3 xl:mt-4">
                  <div className="bg-green-50 p-3 xl:p-4 rounded-lg border border-green-100">
                    <p className="text-xs xl:text-sm text-green-600">
                      Total Fees Paid
                    </p>
                    <p className="text-xl xl:text-2xl font-bold text-green-700">
                      Rs. {(monthlyPaid + admissionPaid).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 xl:p-4 rounded-lg border border-red-100">
                    <p className="text-xs xl:text-sm text-red-600">
                      Total Fees Pending
                    </p>
                    <p className="text-xl xl:text-2xl font-bold text-red-700">
                      Rs. {(monthlyPending + admissionPending).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base xl:text-lg font-medium mb-2">
                  Salary Payment Progress
                </h3>
                <div className="flex justify-between mb-1">
                  <span className="text-xs xl:text-sm font-medium text-gray-600">
                    Payment Rate
                  </span>
                  <span className="text-xs xl:text-sm font-medium text-gray-600">
                    {staffSalaryCollectionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${staffSalaryCollectionRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-3 xl:gap-4 mt-3 xl:mt-4">
                  <div className="bg-blue-50 p-3 xl:p-4 rounded-lg border border-blue-100">
                    <p className="text-xs xl:text-sm text-blue-600">
                      Total Salary Paid
                    </p>
                    <p className="text-xl xl:text-2xl font-bold text-blue-700">
                      Rs. {staffSalaryPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 xl:p-4 rounded-lg border border-amber-100">
                    <p className="text-xs xl:text-sm text-amber-600">
                      Total Salary Pending
                    </p>
                    <p className="text-xl xl:text-2xl font-bold text-amber-700">
                      Rs. {staffSalaryPending.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
