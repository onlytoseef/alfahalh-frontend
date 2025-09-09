import React, { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Input, Select, Button, message } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import axios from "axios";

const PartialPaymentModal = ({
  visible,
  onCancel,
  voucher,
  student,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0);

  useEffect(() => {
    if (voucher) {
      const remaining = voucher.amount - (voucher.paidAmount || 0);
      setRemainingAmount(remaining);
      form.setFieldsValue({
        amount: remaining,
      });
    }
  }, [voucher, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const paymentAmount = Number(values.amount);

      if (paymentAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const requestData = {
        amount: paymentAmount,
        receivedBy: values.receivedBy,
        paymentMethod: values.paymentMethod,
        referenceNumber: values.referenceNumber || null,
        remarks: values.remarks || null,
        date: new Date().toISOString(),
      };

      const response = await axios.post(
        `https://backend-alfalah.vercel.app/api/student-fee/partial-payment/${student.studentId}/${voucher.voucherNumber}`,
        requestData
      );

      if (response.data?.success) {
        message.success(`Payment of ${paymentAmount} recorded successfully`);
        form.resetFields();
        refreshData();
        onCancel();
      } else {
        throw new Error(response.data?.message || "Payment failed");
      }
    } catch (error) {
      message.error(error.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  if (!voucher) return null;

  return (
    <Modal
      title={`Partial Payment - Voucher #${voucher.voucherNumber}`}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<DollarOutlined />}
        >
          Record Payment
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Student:</strong> {student?.name || "N/A"}
        </p>
        <p>
          <strong>Class:</strong> {student?.classId?.grade} -{" "}
          {student?.classId?.section}
        </p>
        <p>
          <strong>Total Amount:</strong> {voucher.amount || "0"}
        </p>
        <p>
          <strong>Paid Amount:</strong> {voucher.paidAmount || 0}
        </p>
        <p>
          <strong>Remaining Amount:</strong> {remainingAmount}
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Amount to Pay"
          name="amount"
          rules={[
            { required: true, message: "Please enter amount" },
            {
              validator: (_, value) => {
                const num = Number(value);
                if (isNaN(num)) {
                  return Promise.reject("Please enter a valid number");
                }
                if (num <= 0) {
                  return Promise.reject("Amount must be greater than 0");
                }
                if (num > remainingAmount) {
                  return Promise.reject(`Cannot exceed ${remainingAmount}`);
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={1}
            max={remainingAmount}
            precision={0}
          />
        </Form.Item>

        <Form.Item
          label="Received By"
          name="receivedBy"
          initialValue="Cashier"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Payment Method"
          name="paymentMethod"
          initialValue="Cash"
          rules={[{ required: true, message: "Required" }]}
        >
          <Select>
            <Select.Option value="Cash">Cash</Select.Option>
            <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
            <Select.Option value="Cheque">Cheque</Select.Option>
            <Select.Option value="Online Payment">Online Payment</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Reference Number" name="referenceNumber">
          <Input placeholder="Optional" />
        </Form.Item>

        <Form.Item label="Remarks" name="remarks">
          <Input.TextArea rows={3} placeholder="Optional notes" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PartialPaymentModal;
