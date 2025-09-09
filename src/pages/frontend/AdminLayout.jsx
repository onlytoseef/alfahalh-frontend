import React, { useState } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Modal } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  ReadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LogoutOutlined,
  DollarOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import { AiOutlineRobot } from "react-icons/ai";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import "./AdminLayout.css";

const { Header, Footer, Sider, Content } = Layout;

const menuItems = [
  { key: "/", icon: <HomeOutlined />, label: "Dashboard", path: "/" },
  { key: "/staff", icon: <TeamOutlined />, label: "Staff", path: "/staff" },
  {
    key: "/students",
    icon: <UserOutlined />,
    label: "Students",
    path: "/students",
  },
  {
    key: "/classes",
    icon: <ReadOutlined />,
    label: "Classes",
    path: "/classes",
  },
  {
    key: "/student-attendance",
    icon: <CalendarOutlined />,
    label: "Attendance",
    path: "/student-attendance",
  },
  {
    key: "/attendance-record",
    icon: <FileTextOutlined />,
    label: "Attendance Records",
    path: "/attendance-record",
  },
  {
    key: "/student-list",
    icon: <DollarOutlined />,
    label: "Fee Management",
    path: "/student-list",
  },
  {
    key: "/chatbot",
    icon: <AiOutlineRobot />,
    label: "Alfalah Assistant",
    path: "/chatbot",
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isCopyrightModalVisible, setIsCopyrightModalVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  const showCopyrightModal = () => {
    setIsCopyrightModalVisible(true);
  };

  const handleCopyrightModalClose = () => {
    setIsCopyrightModalVisible(false);
  };

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={250}
        style={{
          background: "#1A1A1A",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="logo m-15"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px 0",
            height: "64px",
          }}
        >
          {collapsed ? (
            <img
              src={logo}
              alt="AFS Logo"
              style={{
                width: "30px",
                height: "30px",
                transition: "all 0.3s ease",
              }}
            />
          ) : (
            <img
              src={logo}
              alt="Al-Falah School Logo"
              style={{
                width: "150px",
                height: "auto",
                transition: "all 0.3s ease",
              }}
            />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            background: "transparent",
            borderRight: "none",
            flex: 1,
          }}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.path}
              icon={item.icon}
              style={{
                margin: "8px 0",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                backgroundColor:
                  location.pathname === item.path ? "#6F1F64" : "transparent",
              }}
            >
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
        <div
          style={{
            padding: "16px",
            background: "#6F1F64",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
          }}
          onClick={handleLogout}
        >
          <LogoutOutlined style={{ color: "#fff", fontSize: "18px" }} />
          {!collapsed && (
            <span style={{ color: "#fff", marginLeft: "8px" }}>Logout</span>
          )}
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            background: "#1A1A1A",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: "#fff", fontSize: "16px" }}
          />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="profile" onClick={() => navigate("/profile")}>
                  Profile
                </Menu.Item>
                <Menu.Item key="logout" onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                cursor: "pointer",
                backgroundColor: "#6F1F64",
                color: "#fff",
              }}
            />
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: "24px",
            margin: "16px",
            background: "#fff",
            minHeight: "85vh",
            borderRadius: "8px",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: "#1A1A1A",
            color: "#fff",
            padding: "16px",
            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div onClick={showCopyrightModal} style={{ cursor: "pointer" }}>
            © 2025 Al-Falah School System
          </div>
        </Footer>

        {/* Copyright Modal */}
        <Modal
          visible={isCopyrightModalVisible}
          onCancel={handleCopyrightModalClose}
          footer={null}
          closeIcon={<CloseOutlined style={{ color: "#6F1F64" }} />}
          centered
          width={800}
          bodyStyle={{ padding: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Copyright Information
                </h2>
                <div className="w-20 h-1 bg-purple-600 mx-auto mt-2"></div>
              </div>

              <div className="prose prose-lg text-gray-700">
                <p className="font-semibold">
                  Under Pakistani Copyright Law (Copyright Ordinance, 1962 as
                  amended):
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    All content, design, graphics, and software associated with
                    Al-Falah School System are protected under copyright law.
                  </li>
                  <li>
                    Unauthorized reproduction, distribution, or modification of
                    any materials is strictly prohibited.
                  </li>
                  <li>
                    The school's name, logo, and all related indicia are
                    trademarks of Al-Falah School System.
                  </li>
                  <li>
                    Legal action may be taken against any infringement of these
                    rights.
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Permissions
                  </h3>
                  <p>
                    For permissions to use any materials, please contact the
                    school administration at:
                    <br />
                    <span className="font-medium">
                      info@alfalahschool.edu.pk
                    </span>
                  </p>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <p>
                    This copyright notice is provided in accordance with Section
                    54 of the Copyright Ordinance, 1962 of Pakistan.
                    <br />
                    Developed by{" "}
                    <a target="_blank" href="http://wa.me/+923186444059">
                      Toseef Rana
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCopyrightModalClose}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </Modal>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
