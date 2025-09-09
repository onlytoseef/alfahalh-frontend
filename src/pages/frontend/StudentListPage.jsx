import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchClasses } from "../../store/slices/classSlice";
import { fetchStudents } from "../../store/slices/studentSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Input,
  Button,
  Modal,
  Select,
  Pagination,
  Empty,
  Tag,
  message,
} from "antd";
import {
  FaSearch,
  FaArrowRight,
  FaFileInvoiceDollar,
  FaChartBar,
} from "react-icons/fa";
import { IoIosSchool } from "react-icons/io";
import { GiGraduateCap } from "react-icons/gi";
import axios from "axios";

const { Option } = Select;

const StudentCard = React.memo(
  ({ student, isHovered, setIsHovered, navigate }) => {
    const feeStatus = React.useMemo(() => {
      if (!student.feeHistory || student.feeHistory.length === 0) {
        return { hasFees: false };
      }
      const totalVouchers = student.feeHistory.length;
      const paidVouchers = student.feeHistory.filter(
        (fee) => fee.isPaid
      ).length;
      return {
        hasFees: true,
        totalVouchers,
        paidVouchers,
        pendingVouchers: totalVouchers - paidVouchers,
        hasPending: totalVouchers > paidVouchers,
        allPaid: paidVouchers === totalVouchers,
      };
    }, [student.feeHistory]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-full"
        style={{ willChange: "transform, opacity" }}
        onMouseEnter={() => setIsHovered(student._id)}
        onMouseLeave={() => setIsHovered(null)}
      >
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden h-full flex flex-col border border-gray-100 hover:border-blue-200 transition-all duration-100">
          {feeStatus.hasFees && (
            <div className="absolute top-2 right-2">
              {feeStatus.hasPending ? (
                <Tag color="red" className="font-bold">
                  {feeStatus.pendingVouchers} Pending
                </Tag>
              ) : feeStatus.allPaid ? (
                <Tag color="green" className="font-bold">
                  All Paid
                </Tag>
              ) : null}
            </div>
          )}

          <div className="p-4 sm:p-6 flex-1">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="relative flex-shrink-0">
                {student.photo ? (
                  <img
                    src={`http://192.168.10.2:5000${student.photo}` ||`http://localhost:5000${student.photo}` }
                    alt={student.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 sm:border-4 border-white shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-md">
                    <IoIosSchool className="text-xl sm:text-3xl text-blue-600" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-md">
                  {student.rollNumber}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate">
                  {student.name}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  ID: {student.studentId}
                </p>
                {student.classId && (
                  <span className="inline-block mt-1 sm:mt-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {student.classId.grade} - {student.classId.section}
                  </span>
                )}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered === student._id ? 1 : 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-gradient-to-t from-blue-500/80 to-purple-500/80 rounded-2xl flex items-end justify-center p-3 sm:p-4 cursor-pointer"
            onClick={() => navigate(`/students/${student._id}`)}
          >
            <button className="flex items-center cursor-pointer text-white font-medium px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all text-xs sm:text-sm">
              View Profile <FaArrowRight className="ml-1 sm:ml-2" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

const StudentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, status } = useSelector((state) => state.students);
  const { classes, status: classStatus } = useSelector(
    (state) => state.classes
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isHovered, setIsHovered] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState(2000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);

  // Debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Responsive page size
  useEffect(() => {
    const updateSize = () => {
      setPageSize(
        window.innerWidth < 640 ? 8 : window.innerWidth < 1024 ? 12 : 16
      );
    };

    const debouncedResize = debounce(updateSize, 100);
    window.addEventListener("resize", debouncedResize);
    updateSize();

    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  // Fetch data
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchClasses());
  }, [dispatch]);

  // Memoized filtered students
  const filteredStudents = React.useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm)
    );
  }, [students, searchTerm]);

  // Memoized pagination
  const { paginatedStudents, totalPages } = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return {
      paginatedStudents: filteredStudents.slice(
        startIndex,
        startIndex + pageSize
      ),
      totalPages: Math.ceil(filteredStudents.length / pageSize),
    };
  }, [filteredStudents, currentPage, pageSize]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleBulkGenerate = useCallback(async () => {
    if (!selectedClass) {
      message.error("Please select a class first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        "http://192.168.10.2:5000/api/student-fee/generate-bulk-monthly" || "http://localhost:5000/api/student-fee/generate-bulk-monthly",
        { classId: selectedClass, month, year, amount }
      );
      message.success(`Generated ${response.data.count} vouchers successfully`);
      setIsBulkModalOpen(false);
      dispatch(fetchStudents());
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to generate vouchers"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [selectedClass, month, year, amount, dispatch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  if (status === "loading" || classStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 sm:h-12 bg-gray-200 rounded-full w-3/4 sm:w-1/3 mx-auto animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(pageSize)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow p-4 h-48 sm:h-56 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
            Student Directory
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Browse through our vibrant student community
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search students by name or ID..."
              prefix={<FaSearch className="text-gray-400" />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl"
              allowClear
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              type="primary"
              icon={<FaFileInvoiceDollar />}
              onClick={() => setIsBulkModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Bulk Generate Fees</span>
              <span className="sm:hidden">Generate Fees</span>
            </Button>

            <Link to="/class-fee-summary" className="w-full sm:w-auto">
              <Button
                icon={<FaChartBar />}
                className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white"
              >
                <span className="hidden sm:inline">Class Summary</span>
                <span className="sm:hidden">Summary</span>
              </Button>
            </Link>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="flex justify-center py-12">
            <Empty
              image={
                <GiGraduateCap className="text-4xl sm:text-6xl text-gray-400" />
              }
              description={
                <span className="text-gray-500">No students found</span>
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <AnimatePresence mode="wait">
                {paginatedStudents.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    isHovered={isHovered}
                    setIsHovered={setIsHovered}
                    navigate={navigate}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <Pagination
                current={currentPage}
                total={filteredStudents.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                responsive
              />
            </div>
          </>
        )}
      </motion.div>

      <Modal
        title="Bulk Generate Monthly Fee Vouchers"
        visible={isBulkModalOpen}
        onOk={handleBulkGenerate}
        onCancel={() => setIsBulkModalOpen(false)}
        okText={isGenerating ? "Generating..." : "Generate"}
        okButtonProps={{ loading: isGenerating }}
        width={Math.min(window.innerWidth - 40, 600)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Class</label>
            <Select
              placeholder="Select Class"
              className="w-full"
              value={selectedClass}
              onChange={setSelectedClass}
            >
              {classes.map((cls) => (
                <Option key={cls._id} value={cls._id}>
                  {cls.grade} - {cls.section}
                </Option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Month</label>
              <Select value={month} onChange={setMonth} className="w-full">
                {months.map((monthName, index) => (
                  <Option key={monthName} value={index + 1}>
                    {monthName}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Year</label>
              <Select value={year} onChange={setYear} className="w-full">
                <Option value={year - 1}>{year - 1}</Option>
                <Option value={year}>{year}</Option>
                <Option value={year + 1}>{year + 1}</Option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Amount per Student
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              prefix="Rs."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 text-sm sm:text-base">
              This will generate monthly fee vouchers for all students in the
              selected class.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(StudentListPage);
