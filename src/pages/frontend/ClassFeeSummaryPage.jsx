import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Input } from "antd";
import {
  Modal,
  Card,
  Select,
  InputNumber,
  Form,
  Table,
  Button,
  Spin,
  message,
  Progress,
  Tag,
  Divider,
  Statistic,
  Row,
  Col,
  Typography,
  Alert,
  Checkbox,
} from "antd";
import {
  PrinterOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  DownOutlined,
  UserOutlined,
  DownloadOutlined,
  FileTextOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  SmileOutlined,
  FireOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import FeeVoucher from "../components/FeeVoucher";
import { isEqual } from "lodash";
import PartialPaymentModal from "../components/PartialPaymentModal";

const { Title, Text } = Typography;
const { Option } = Select;

const months = moment.months();

const ClassFeeSummaryPage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [month, setMonth] = useState(moment().month() + 1);
  const [year, setYear] = useState(moment().year());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [admissionModalVisible, setAdmissionModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [admissionForm] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const prevValuesRef = useRef();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [printUnpaidOnly, setPrintUnpaidOnly] = useState(false);
  const [printAdmissionOnly, setPrintAdmissionOnly] = useState(false);
  const [partialPaymentModalVisible, setPartialPaymentModalVisible] =
    useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPendingVouchers, setSelectedPendingVouchers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const showPartialPaymentModal = (voucher) => {
    setSelectedVoucher(voucher);
    setSelectedStudent({
      studentId: voucher.studentId,
      name: voucher.studentName,
      classId: {
        grade: summary.className.split(" - ")[0],
        section: summary.className.split(" - ")[1] || "",
      },
    });
    setPartialPaymentModalVisible(true);
  };
  const filteredVouchers =
    summary?.vouchers
      ?.filter((voucher) => {
        if (voucher.feeType === "monthly") {
          return voucher.month === month && voucher.year === year;
        }
        return true; // Keep all admission vouchers
      })
      ?.filter((voucher) => {
        if (!searchTerm) return true;
        return voucher.studentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }) || [];

  const handleEditVoucher = (voucher) => {
    setCurrentVoucher(voucher);

    if (voucher.feeType === "admission") {
      admissionForm.setFieldsValue({
        admissionFee: voucher.details?.admissionFee || 0,
        annualCharges: voucher.details?.annualCharges || 0,
        securityCard: voucher.details?.securityCard || 0,
        paperFund: voucher.details?.paperFund || 0,
        otherDues: voucher.details?.otherDues || 0,
        monthlyFee: voucher.details?.monthlyFee || 0,
        monthlyFeeMonth: voucher.details?.monthlyFeeMonth,
        monthlyFeeYear: voucher.details?.monthlyFeeYear,
      });
    } else {
      form.setFieldsValue({
        amount: voucher.amount,
        month: voucher.month,
        year: voucher.year,
      });
    }

    setEditModalVisible(true);
  };

  const handleDeleteVoucher = (voucher) => {
    setCurrentVoucher(voucher);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteVoucher = async () => {
    try {
      await axios.delete(
        `https://backend-alfalah.vercel.app/api/student-fee/delete-voucher/${currentVoucher.studentId}/${currentVoucher.voucherNumber}`
      );
      message.success("Voucher deleted successfully");
      fetchClassSummary();
      setDeleteConfirmVisible(false);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete voucher"
      );
    }
  };

  const handleUpdateVoucher = async () => {
    try {
      setLoading(true);

      if (currentVoucher.feeType === "admission") {
        const values = await admissionForm.validateFields();
        await axios.put(
          `https://backend-alfalah.vercel.app/api/student-fee/edit-admission/${currentVoucher.studentId}/${currentVoucher.voucherNumber}` ,
          { feeDetails: values }
        );
      } else {
        const values = await form.validateFields();
        await axios.put(
          `https://backend-alfalah.vercel.app/api/student-fee/edit-monthly/${currentVoucher.studentId}/${currentVoucher.voucherNumber}`,
          values
        );
      }

      message.success("Voucher updated successfully");
      fetchClassSummary();
      setEditModalVisible(false);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update voucher"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchClassSummary();
  }, [selectedClass, month, year]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = admissionForm.getFieldsValue();
      if (!isEqual(prevValuesRef.current, currentValues)) {
        prevValuesRef.current = currentValues;
        const calculatedTotal = Object.values(currentValues).reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        setTotalAmount(calculatedTotal);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [admissionForm]);

  const fetchClasses = async () => {
    try {
  const response = await axios.get("https://backend-alfalah.vercel.app/api/classes");
      setClasses(response.data);
    } catch (error) {
      message.error("Failed to fetch classes");
    }
  };

  const fetchClassSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://backend-alfalah.vercel.app/api/student-fee/class-summary",
        { params: { classId: selectedClass, month, year } }
      );
      setSummary(response.data);
    } catch (error) {
      message.error("Failed to fetch class summary");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVouchers = async () => {
    try {
      const values = await form.validateFields();
      if (values.amount <= 0) {
        message.error("Fee amount must be greater than 0");
        return;
      }
      setGenerateModalVisible(false);
      setLoading(true);
      const response = await axios.post(
        "https://backend-alfalah.vercel.app/api/student-fee/generate-bulk-monthly",
        { classId: selectedClass, month, year, amount: values.amount }
      );
      message.success(`Generated ${response.data.count} vouchers successfully`);
      fetchClassSummary();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to generate vouchers"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAdmissionVouchers = async () => {
    try {
      const values = await admissionForm.validateFields();
      if (!selectedClass) {
        message.error("Please select a class first");
        return;
      }
      if (!values.admissionFee) {
        message.error("Admission fee is required");
        return;
      }
      if (
        values.monthlyFee > 0 &&
        (!values.monthlyFeeMonth || !values.monthlyFeeYear)
      ) {
        message.error("Month and year are required when including monthly fee");
        return;
      }

      setAdmissionModalVisible(false);
      setLoading(true);

      const response = await axios.post(
        "https://backend-alfalah.vercel.app/api/student-fee/generate-bulk-admission",
        {
          classId: selectedClass,
          feeDetails: {
            admissionFee: values.admissionFee,
            annualCharges: values.annualCharges || 0,
            securityCard: values.securityCard || 0,
            paperFund: values.paperFund || 0,
            otherDues: values.otherDues || 0,
            ...(values.monthlyFee > 0 && {
              monthlyFee: values.monthlyFee,
              monthlyFeeMonth: values.monthlyFeeMonth,
              monthlyFeeYear: values.monthlyFeeYear,
            }),
          },
        }
      );

      message.success(
        `Generated ${response.data.count} admission vouchers successfully`
      );
      fetchClassSummary();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to generate admission vouchers"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (voucherNumber, studentId) => {
    try {
      setLoading(true);
      await axios.put(
        `https://backend-alfalah.vercel.app/api/student-fee/update-status/${studentId}/${voucherNumber}`,
        { isPaid: true }
      );
      message.success("Fee marked as fully paid successfully");
      fetchClassSummary();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update fee status"
      );
    } finally {
      setLoading(false);
    }
  };

  const printVoucher = (voucher, student, paid = false) => {
    if (!voucher) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Fee Voucher - ${student.name}</title>
      <style>@page { size: A4 portrait; margin: 0; } body { margin: 0; padding: 0; }</style></head>
      <body><div id="voucher-container">
        ${
          document.getElementById(`voucher-${voucher.voucherNumber}`)
            ?.innerHTML || "<h1>Voucher not found</h1>"
        }
        ${
          paid
            ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 72px; color: green; opacity: 0.3; z-index: 1000; pointer-events: none;">PAID</div>`
            : ""
        }
      </div>
      <script>window.onload=function(){setTimeout(()=>{window.print();window.close();},500);};</script>
      </body></html>
    `);
    printWindow.document.close();
  };
  const printAllMonthlyVouchers = (paidOnly = false, unpaidOnly = false) => {
    if (!summary?.vouchers?.length) {
      message.warning("No vouchers available to print");
      return;
    }

    let vouchersToPrint = summary.vouchers.filter(
      (voucher) =>
        voucher.feeType === "monthly" &&
        voucher.month === month &&
        voucher.year === year
    );

    if (paidOnly) {
      vouchersToPrint = vouchersToPrint.filter((v) => v.isPaid);
    } else if (unpaidOnly) {
      vouchersToPrint = vouchersToPrint.filter((v) => !v.isPaid);
    }

    if (vouchersToPrint.length === 0) {
      message.warning("No monthly vouchers match the selected filters");
      return;
    }

    const printWindow = window.open("", "_blank");
    let vouchersHTML = `
    <style>
      @page { size: A4 portrait; margin: 0; }
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .voucher-page { width: 210mm; height: 297mm; page-break-after: always; position: relative; }
      .voucher { width: 190mm; height: 140mm; margin: 0 auto; padding: 5mm; box-sizing: border-box; position: absolute; left: 10mm; }
      .voucher-top { top: 0; } .voucher-bottom { top: 140mm; }
      .paid-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 72px; color: green; opacity: 0.3; z-index: 1000; pointer-events: none; }
      .unpaid-notice { position: absolute; bottom: 20mm; left: 0; right: 0; text-align: center; color: red; font-weight: bold; }
      .filter-info { text-align: center; margin-bottom: 10mm; font-size: 14px; color: #666; }
    </style>
    <div class="filter-info">
      Printing ${
        paidOnly ? "Paid" : unpaidOnly ? "Unpaid" : "All"
      } Monthly Vouchers for ${months[month - 1]} ${year}
    </div>
  `;

    for (let i = 0; i < vouchersToPrint.length; i += 2) {
      vouchersHTML += `<div class="voucher-page">`;
      if (i < vouchersToPrint.length) {
        const voucher = vouchersToPrint[i];
        vouchersHTML += `
        <div class="voucher voucher-top">
          ${
            document.getElementById(`voucher-${voucher.voucherNumber}`)
              ?.innerHTML || ""
          }
          ${
            voucher.isPaid
              ? '<div class="paid-stamp">PAID</div>'
              : '<div class="unpaid-notice">Please pay your fees immediately</div>'
          }
        </div>
      `;
      }
      if (i + 1 < vouchersToPrint.length) {
        const voucher = vouchersToPrint[i + 1];
        vouchersHTML += `
        <div class="voucher voucher-bottom">
          ${
            document.getElementById(`voucher-${voucher.voucherNumber}`)
              ?.innerHTML || ""
          }
          ${
            voucher.isPaid
              ? '<div class="paid-stamp">PAID</div>'
              : '<div class="unpaid-notice">Please pay your fees immediately</div>'
          }
        </div>
      `;
      }
      vouchersHTML += `</div>`;
    }

    printWindow.document.write(`
    <html><head><title>Monthly Fee Vouchers - ${summary.className}</title></head>
    <body>${vouchersHTML}</body></html>
  `);
    printWindow.document.close();
  };

  const printAllVouchers = (unpaidOnly = false, admissionOnly = false) => {
    if (!summary?.vouchers?.length) {
      message.warning("No vouchers available to print");
      return;
    }

    let vouchersToPrint = summary.vouchers;

    // Filter by month and year for monthly vouchers
    vouchersToPrint = vouchersToPrint.filter((voucher) => {
      if (voucher.feeType === "monthly") {
        return voucher.month === month && voucher.year === year;
      }
      return true; // Keep all admission vouchers
    });

    // Apply additional filters
    if (unpaidOnly) {
      vouchersToPrint = vouchersToPrint.filter((v) => !v.isPaid);
    }
    if (admissionOnly) {
      vouchersToPrint = vouchersToPrint.filter(
        (v) => v.feeType === "admission"
      );
    }

    if (vouchersToPrint.length === 0) {
      message.warning("No vouchers match the selected filters");
      return;
    }

    const printWindow = window.open("", "_blank");
    let vouchersHTML = `
      <style>
        @page { size: A4 portrait; margin: 0; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .voucher-page { width: 210mm; height: 297mm; page-break-after: always; position: relative; }
        .voucher { width: 190mm; height: 140mm; margin: 0 auto; padding: 5mm; box-sizing: border-box; position: absolute; left: 10mm; }
        .voucher-top { top: 0; } .voucher-bottom { top: 140mm; }
        .paid-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 72px; color: green; opacity: 0.3; z-index: 1000; pointer-events: none; }
        .unpaid-notice { position: absolute; bottom: 20mm; left: 0; right: 0; text-align: center; color: red; font-weight: bold; }
        .filter-info { text-align: center; margin-bottom: 10mm; font-size: 14px; color: #666; }
      </style>
      <div class="filter-info">
        Printing ${unpaidOnly ? "Unpaid" : "All"} ${
      admissionOnly ? "Admission" : ""
    } Vouchers for ${months[month - 1]} ${year}
      </div>
    `;

    for (let i = 0; i < vouchersToPrint.length; i += 2) {
      vouchersHTML += `<div class="voucher-page">`;
      if (i < vouchersToPrint.length) {
        const voucher = vouchersToPrint[i];
        vouchersHTML += `
          <div class="voucher voucher-top">
            ${
              document.getElementById(`voucher-${voucher.voucherNumber}`)
                ?.innerHTML || ""
            }
            ${
              voucher.isPaid
                ? '<div class="paid-stamp">PAID</div>'
                : '<div class="unpaid-notice">Please pay your fees immediately</div>'
            }
          </div>
        `;
      }
      if (i + 1 < vouchersToPrint.length) {
        const voucher = vouchersToPrint[i + 1];
        vouchersHTML += `
          <div class="voucher voucher-bottom">
            ${
              document.getElementById(`voucher-${voucher.voucherNumber}`)
                ?.innerHTML || ""
            }
            ${
              voucher.isPaid
                ? '<div class="paid-stamp">PAID</div>'
                : '<div class="unpaid-notice">Please pay your fees immediately</div>'
            }
          </div>
        `;
      }
      vouchersHTML += `</div>`;
    }

    printWindow.document.write(`
      <html><head><title>Class Fee Vouchers - ${summary.className}</title></head>
      <body>${vouchersHTML}</body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4">
      {/* Hidden voucher elements for printing */}
      {summary?.vouchers?.map((voucher) => (
        <div
          key={`voucher-${voucher.voucherNumber}`}
          id={`voucher-${voucher.voucherNumber}`}
          style={{ display: "none" }}
        >
          <FeeVoucher
            student={{
              studentId: voucher.studentId,
              name: voucher.studentName,
              rollNumber: voucher.rollNumber,
              classId: {
                grade: summary.className.split(" - ")[0],
                section: summary.className.split(" - ")[1] || "",
              },
            }}
            fee={{
              ...voucher,
              feeType: voucher.feeType,
              amount: voucher.amount,
              isPaid: voucher.isPaid,
              voucherNumber: voucher.voucherNumber,
              details: voucher.details || {},
              month: voucher.month,
              year: voucher.year,
            }}
          />
        </div>
      ))}
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} className="mb-1">
            Fee Dashboard
          </Title>
          <Text type="secondary">
            {summary
              ? `${summary.className} • ${months[month - 1]} ${year}`
              : "Select filters to begin"}
          </Text>
        </Col>
        <Col>
          <Button.Group>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => setPrintModalVisible(true)}
            >
              Print
            </Button>
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => setGenerateModalVisible(true)}
            >
              Generate Monthly
            </Button>
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={() => setAdmissionModalVisible(true)}
            >
              Generate Admission
            </Button>
          </Button.Group>
        </Col>
      </Row>
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Class">
              <Select
                placeholder="Select Class"
                value={selectedClass}
                onChange={setSelectedClass}
                suffixIcon={<DownOutlined />}
              >
                {classes.map((cls) => (
                  <Option key={cls._id} value={cls._id}>
                    {cls.grade} - {cls.section}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Month">
              <Select
                placeholder="Select Month"
                value={month}
                onChange={setMonth}
                suffixIcon={<DownOutlined />}
              >
                {months.map((_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    {moment().month(i).format("MMMM")}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Year">
              <Select
                placeholder="Select Year"
                value={year}
                onChange={setYear}
                suffixIcon={<DownOutlined />}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Option key={i} value={moment().year() - 2 + i}>
                    {moment().year() - 2 + i}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
      {loading && !summary ? (
        <Spin size="large" className="flex justify-center items-center h-64" />
      ) : summary ? (
        <>
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Students"
                  value={summary.totalStudents}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Paid Students"
                  value={summary.paidStudents}
                  prefix={<CheckCircleOutlined />}
                />
                <Progress
                  percent={Math.round(
                    (summary.paidStudents / summary.totalStudents) * 100
                  )}
                  size="small"
                  strokeColor="#52c41a"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Pending Students"
                  value={summary.pendingStudents}
                  prefix={<ClockCircleOutlined />}
                />
                <Tag color="orange">
                  {Math.round(
                    (summary.pendingStudents / summary.totalStudents) * 100
                  )}
                  % pending
                </Tag>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Collection Rate"
                  value={Math.round(
                    (summary.paidStudents / summary.totalStudents) * 100
                  )}
                  suffix="%"
                  prefix={<PercentageOutlined />}
                />
                {summary.paidStudents / summary.totalStudents > 0.7 ? (
                  <Tag color="success">On Target</Tag>
                ) : (
                  <Tag color="error">Needs Attention</Tag>
                )}
              </Card>
            </Col>
          </Row>

          <Card title="Financial Summary" className="mb-6">
            <Row gutter={16}>
              <Col span={24}>
                <Progress
                  percent={100}
                  strokeColor="#1890ff"
                  showInfo={false}
                />
                <Text strong className="block mb-2">
                  Total Fees: Rs. {summary.totalFees.toLocaleString()}
                </Text>
              </Col>
              <Col span={24}>
                <Progress
                  percent={Math.round(
                    (summary.paidFees / summary.totalFees) * 100
                  )}
                  strokeColor="#52c41a"
                />
                <Text strong className="block mb-2">
                  Paid Fees: Rs. {summary.paidFees.toLocaleString()}
                </Text>
              </Col>
              <Col span={24}>
                <Progress
                  percent={Math.round(
                    (summary.pendingFees / summary.totalFees) * 100
                  )}
                  strokeColor="#faad14"
                />
                <Text strong className="block">
                  Pending Fees: Rs. {summary.pendingFees.toLocaleString()}
                </Text>
              </Col>
            </Row>

            {summary.paidFees / summary.totalFees > 0.8 && (
              <Alert
                message="Great Job!"
                description="You've collected over 80% of fees this month. Keep it up!"
                type="success"
                showIcon
                icon={<TrophyOutlined />}
                className="mt-4"
              />
            )}
          </Card>

          <Card
            title={`Student Vouchers (${months[month - 1]} ${year})`}
            extra={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Input
                  placeholder="Search by student name"
                  allowClear
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 200, marginRight: 16 }}
                />
                <Text type="secondary">{filteredVouchers.length} records</Text>
              </div>
            }
          >
            <Table
              columns={[
                {
                  title: "Roll No.",
                  dataIndex: "rollNumber",
                  key: "rollNumber",
                },
                {
                  title: "Student",
                  render: (_, record) => (
                    <>
                      <Text strong>{record.studentName}</Text>
                      <br />
                      <Text type="secondary">ID: {record.studentId}</Text>
                    </>
                  ),
                },
                {
                  title: "Voucher",
                  dataIndex: "voucherNumber",
                  key: "voucherNumber",
                },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  key: "amount",
                  render: (amount) => (
                    <Text strong>Rs. {amount.toLocaleString()}</Text>
                  ),
                },
                {
                  title: "Status",
                  dataIndex: "isPaid",
                  key: "status",
                  render: (isPaid) =>
                    isPaid ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Paid
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="orange">
                        Pending
                      </Tag>
                    ),
                },
                {
                  title: "Payment Status",
                  key: "paymentStatus",
                  render: (_, record) => (
                    <div>
                      {record.isPaid ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          Fully Paid
                        </Tag>
                      ) : (
                        <>
                          <div>
                            Paid: Rs. {record.paidAmount?.toLocaleString() || 0}
                          </div>
                          <div>
                            Remaining: Rs.{" "}
                            {(
                              record.amount - (record.paidAmount || 0)
                            ).toLocaleString()}
                          </div>
                          <Progress
                            percent={Math.round(
                              ((record.paidAmount || 0) / record.amount) * 100
                            )}
                            size="small"
                            status="active"
                          />
                        </>
                      )}
                    </div>
                  ),
                },
                {
                  title: "Actions",
                  key: "actions",
                  render: (_, record) => (
                    <Button.Group>
                      {record.isPaid ? (
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() =>
                            printVoucher(record, {
                              studentId: record.studentId,
                              name: record.studentName,
                              rollNumber: record.rollNumber,
                              classId: {
                                grade: summary.className.split(" - ")[0],
                                section:
                                  summary.className.split(" - ")[1] || "",
                              },
                            })
                          }
                        >
                          Print
                        </Button>
                      ) : (
                        <>
                          <Button
                            icon={<DollarOutlined />}
                            onClick={() => showPartialPaymentModal(record)}
                          >
                            Partial Pay
                          </Button>
                          <Button
                            icon={<CheckCircleOutlined />}
                            onClick={() =>
                              markAsPaid(record.voucherNumber, record.studentId)
                            }
                            loading={loading}
                          >
                            Mark Fully Paid
                          </Button>
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditVoucher(record)}
                          />
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteVoucher(record)}
                          />
                          <Button
                            icon={<PrinterOutlined />}
                            onClick={() =>
                              printVoucher(record, {
                                studentId: record.studentId,
                                name: record.studentName,
                                rollNumber: record.rollNumber,
                                classId: {
                                  grade: summary.className.split(" - ")[0],
                                  section:
                                    summary.className.split(" - ")[1] || "",
                                },
                              })
                            }
                          >
                            Print
                          </Button>
                        </>
                      )}
                    </Button.Group>
                  ),
                },
              ]}
              dataSource={filteredVouchers}
              rowKey="voucherNumber"
              loading={loading}
            />
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center">
            <InfoCircleOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={4}>No class selected</Title>
            <Text type="secondary">
              Please select a class from the filters above to view fee summary
              and vouchers.
            </Text>
          </div>
        </Card>
      )}
      {/* Generate Monthly Vouchers Modal */}
      <Modal
        title="Generate Vouchers"
        visible={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setGenerateModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleGenerateVouchers}
          >
            Generate Vouchers
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Amount per Student (Rs.)"
            name="amount"
            rules={[
              { required: true, message: "Please enter fee amount" },
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject("Amount must be greater than 0"),
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Card title="Generation Summary" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Class:</Text>
                <Text className="block">
                  {selectedClass
                    ? classes.find((c) => c._id === selectedClass)?.grade +
                      " - " +
                      classes.find((c) => c._id === selectedClass)?.section
                    : "Not selected"}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Month:</Text>
                <Text className="block">{months[month - 1]}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Year:</Text>
                <Text className="block">{year}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Students:</Text>
                <Text className="block">{summary?.totalStudents || 0}</Text>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
      {/* Generate Admission Vouchers Modal */}
      <Modal
        title="Generate Admission Vouchers"
        visible={admissionModalVisible}
        onCancel={() => setAdmissionModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setAdmissionModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleGenerateAdmissionVouchers}
            icon={<CreditCardOutlined />}
          >
            Generate Vouchers
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={admissionForm}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => {
            const calculatedTotal = Object.values(allValues).reduce(
              (sum, val) => sum + (val || 0),
              0
            );
            setTotalAmount(calculatedTotal);
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Admission Fee (Rs.)"
                name="admissionFee"
                rules={[
                  { required: true, message: "Please enter admission fee" },
                  {
                    validator: (_, value) =>
                      value > 0
                        ? Promise.resolve()
                        : Promise.reject("Amount must be greater than 0"),
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Annual Charges (Rs.)" name="annualCharges">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Security Card Fee (Rs.)" name="securityCard">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Paper Fund (Rs.)" name="paperFund">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Other Dues (Rs.)" name="otherDues">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Monthly Fee (Rs.)" name="monthlyFee">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          {admissionForm.getFieldValue("monthlyFee") > 0 && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Month for Monthly Fee"
                  name="monthlyFeeMonth"
                  rules={[
                    {
                      required: admissionForm.getFieldValue("monthlyFee") > 0,
                      message: "Please select month",
                    },
                  ]}
                >
                  <Select placeholder="Select month">
                    {months.map((_, i) => (
                      <Option key={i + 1} value={i + 1}>
                        {moment().month(i).format("MMMM")}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Year for Monthly Fee"
                  name="monthlyFeeYear"
                  rules={[
                    {
                      required: admissionForm.getFieldValue("monthlyFee") > 0,
                      message: "Please select year",
                    },
                  ]}
                >
                  <Select placeholder="Select year">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Option key={i} value={moment().year() - 2 + i}>
                        {moment().year() - 2 + i}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Card title="Total Amount" size="small" className="mb-4">
            <Statistic
              value={totalAmount}
              prefix={<DollarOutlined />}
              valueStyle={{ fontSize: "24px" }}
            />
          </Card>

          <Card title="Generation Summary" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Class:</Text>
                <Text className="block">
                  {selectedClass
                    ? classes.find((c) => c._id === selectedClass)?.grade +
                      " - " +
                      classes.find((c) => c._id === selectedClass)?.section
                    : "Not selected"}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Students:</Text>
                <Text className="block">{summary?.totalStudents || 0}</Text>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
      {/* Edit Voucher Modal */}
      {/* Edit Voucher Modal */}
      <Modal
        title={`Edit ${
          currentVoucher?.feeType === "admission" ? "Admission" : "Monthly"
        } Fee Voucher`}
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpdateVoucher}
            loading={loading}
          >
            Update
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        {currentVoucher?.feeType === "admission" ? (
          <Form
            form={admissionForm}
            layout="vertical"
            initialValues={{
              admissionFee: currentVoucher?.details?.admissionFee || 0,
              annualCharges: currentVoucher?.details?.annualCharges || 0,
              securityCard: currentVoucher?.details?.securityCard || 0,
              paperFund: currentVoucher?.details?.paperFund || 0,
              otherDues: currentVoucher?.details?.otherDues || 0,
              monthlyFee: currentVoucher?.details?.monthlyFee || 0,
              monthlyFeeMonth: currentVoucher?.details?.monthlyFeeMonth,
              monthlyFeeYear: currentVoucher?.details?.monthlyFeeYear,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Admission Fee (Rs.)"
                  name="admissionFee"
                  rules={[
                    { required: true, message: "Please enter admission fee" },
                    {
                      validator: (_, value) =>
                        value > 0
                          ? Promise.resolve()
                          : Promise.reject("Amount must be greater than 0"),
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Annual Charges (Rs.)" name="annualCharges">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Security Card Fee (Rs.)" name="securityCard">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Paper Fund (Rs.)" name="paperFund">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Other Dues (Rs.)" name="otherDues">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Monthly Fee (Rs.)" name="monthlyFee">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            {admissionForm.getFieldValue("monthlyFee") > 0 && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Month for Monthly Fee"
                    name="monthlyFeeMonth"
                    rules={[
                      {
                        required: admissionForm.getFieldValue("monthlyFee") > 0,
                        message: "Please select month",
                      },
                    ]}
                  >
                    <Select placeholder="Select month">
                      {months.map((_, i) => (
                        <Option key={i + 1} value={i + 1}>
                          {moment().month(i).format("MMMM")}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Year for Monthly Fee"
                    name="monthlyFeeYear"
                    rules={[
                      {
                        required: admissionForm.getFieldValue("monthlyFee") > 0,
                        message: "Please select year",
                      },
                    ]}
                  >
                    <Select placeholder="Select year">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Option key={i} value={moment().year() - 2 + i}>
                          {moment().year() - 2 + i}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              amount: currentVoucher?.amount || 0,
              month: currentVoucher?.month,
              year: currentVoucher?.year,
            }}
          >
            <Form.Item
              label="Amount (Rs.)"
              name="amount"
              rules={[
                { required: true, message: "Please enter amount" },
                {
                  validator: (_, value) =>
                    value > 0
                      ? Promise.resolve()
                      : Promise.reject("Amount must be greater than 0"),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
            <Form.Item
              label="Month"
              name="month"
              rules={[{ required: true, message: "Please select month" }]}
            >
              <Select>
                {months.map((_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    {moment().month(i).format("MMMM")}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Year"
              name="year"
              rules={[{ required: true, message: "Please select year" }]}
            >
              <Select>
                {Array.from({ length: 5 }, (_, i) => (
                  <Option key={i} value={moment().year() - 2 + i}>
                    {moment().year() - 2 + i}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={deleteConfirmVisible}
        onOk={confirmDeleteVoucher}
        onCancel={() => setDeleteConfirmVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this voucher?</p>
        <p>
          <strong>Voucher Number:</strong> {currentVoucher?.voucherNumber}
        </p>
        <p>
          <strong>Amount:</strong> Rs. {currentVoucher?.amount}
        </p>
        {currentVoucher?.isPaid && (
          <Alert
            message="Warning"
            description="This voucher is marked as paid. Deleting it may affect your records."
            type="warning"
            showIcon
          />
        )}
      </Modal>
      {/* Print Options Modal */}
      {/* Print Options Modal */}
      {/* Print Options Modal */}
      <Modal
        title="Print Vouchers"
        visible={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPrintModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() =>
              printAllVouchers(printUnpaidOnly, printAdmissionOnly)
            }
          >
            Print Selected Vouchers
          </Button>,
        ]}
        width={1000} // Increased width to accommodate more columns
      >
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Print Options">
              <Checkbox
                checked={printUnpaidOnly}
                onChange={(e) => setPrintUnpaidOnly(e.target.checked)}
              >
                Print Unpaid Vouchers Only
              </Checkbox>
              <br />
              <Checkbox
                checked={printAdmissionOnly}
                onChange={(e) => setPrintAdmissionOnly(e.target.checked)}
              >
                Print Admission Vouchers Only
              </Checkbox>
            </Card>
          </Col>
        </Row>

        {/* Monthly Vouchers Section */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => printAllVouchers(false, false)}
              className="text-center"
            >
              <PrinterOutlined className="text-3xl mb-3" />
              <Title level={4}>Print All Vouchers</Title>
              <Text type="secondary">{filteredVouchers.length} vouchers</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => printAllVouchers(true, false)}
              className="text-center"
            >
              <PrinterOutlined className="text-3xl mb-3" />
              <Title level={4}>Print Unpaid Vouchers</Title>
              <Text type="secondary">
                {filteredVouchers.filter((v) => !v.isPaid).length} vouchers
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => printAllVouchers(false, true)}
              className="text-center"
            >
              <PrinterOutlined className="text-3xl mb-3" />
              <Title level={4}>Print Admission Vouchers</Title>
              <Text type="secondary">
                {
                  filteredVouchers.filter((v) => v.feeType === "admission")
                    .length
                }{" "}
                vouchers
              </Text>
            </Card>
          </Col>
        </Row>

        {/* New Monthly Vouchers Section */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => printAllMonthlyVouchers(false)}
              className="text-center"
            >
              <PrinterOutlined className="text-3xl mb-3" />
              <Title level={4}>Print All Monthly Vouchers</Title>
              <Text type="secondary">
                {filteredVouchers.filter((v) => v.feeType === "monthly").length}{" "}
                vouchers
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => printAllMonthlyVouchers(true)}
              className="text-center"
            >
              <PrinterOutlined className="text-3xl mb-3" />
              <Title level={4}>Print Paid Monthly Vouchers</Title>
              <Text type="secondary">
                {
                  filteredVouchers.filter(
                    (v) => v.feeType === "monthly" && v.isPaid
                  ).length
                }{" "}
                vouchers
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => printAllMonthlyVouchers(false, true)}
              className="text-center"
            >
              <PrinterOutlined className="text-3xl mb-3" />
              <Title level={4}>Print Unpaid Monthly Vouchers</Title>
              <Text type="secondary">
                {
                  filteredVouchers.filter(
                    (v) => v.feeType === "monthly" && !v.isPaid
                  ).length
                }{" "}
                vouchers
              </Text>
            </Card>
          </Col>
        </Row>
      </Modal>
      <PartialPaymentModal
        visible={partialPaymentModalVisible}
        onCancel={() => setPartialPaymentModalVisible(false)}
        voucher={selectedVoucher}
        student={selectedStudent}
        refreshData={fetchClassSummary}
      />
      ;
    </div>
  );
};

export default ClassFeeSummaryPage;
