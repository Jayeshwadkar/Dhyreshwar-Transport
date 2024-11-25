import React from "react";
import { FiUsers, FiCreditCard, FiEdit, FiList } from "react-icons/fi";
const navItems = [
  {
    label: "Users",
    to: "/users",
    icon: <FiUsers />,
    children: [
      {
        label: "Users list",
        to: "/users/usersList",
      },
      {
        label: "User registration",
        to: "/users/userRegistration",
      },
      {
        label: "User persmissions",
        to: "/users/userPermissions",
      },
    ],
  },
  {
    label: "Master",
    to: "/master",
    icon: <FiList />,
    children: [
      {
        label: "Articles",
        to: "/master/articles",
      },
      {
        label: "Places",
        to: "/master/places",
      },
      {
        label: "Branches",
        to: "/master/branches",
      },
      {
        label: "Customers",
        to: "/master/customers",
      },
      {
        label: "Drivers",
        to: "/master/drivers",
      },
      {
        label: "Employees",
        to: "/master/employees",
      },
      {
        label: "Vehicles",
        to: "/master/vehicles",
      },
      {
        label: "Vehicle Types",
        to: "/master/vehicleTypes",
      },
      {
        label: "Suppliers",
        to: "/master/suppliers",
      },
      {
        label: "Bank List",
        to: "/master/banks",
      },
      {
        label: "Bank Account List",
        to: "/master/bankAccounts",
      },
      // {
      //   label: "Rate Master",
      //   to: "/master/rateMasterList",
      // },
    ],
  },
  {
    label: "Transactions",
    to: "/transactions",
    icon: <FiCreditCard />,
    children: [
      {
        label: "Lorry Receipts",
        to: "/transactions/lorryReceipts",
      },
      // {
      //   label: "Add FO Num",
      //   to: "/transactions/addFONum",
      // },
      {
        label: "Loading Slips",
        to: "/transactions/loadingSlips",
      },
      {
        label: "LR Acknowledgement",
        to: "/transactions/lrAcknowledgement",
      },
      {
        label: "Local Memo List",
        to: "/transactions/localMemoList",
      },
      {
        label: "Bill List",
        to: "/transactions/billList",
      },
      // {
      //   label: "Cash Memo List",
      //   to: "/transactions/cashMemoList",
      // },
      {
        label: "Payment Collection",
        to: "/transactions/paymentCollection",
      },
      {
        label: "Payment Advice",
        to: "/transactions/paymentAdvice",
      },
      {
        label: "Money Transfers",
        to: "/transactions/moneyTransfers",
      },
      {
        label: "Petty Cash History",
        to: "/transactions/pettyCashHistory",
      },
      // {
      //   label: "Quotations",
      //   to: "/transactions/quotations",
      // },
    ],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: <FiEdit />,
    children: [
      {
        label: "Lorry Receipt Register",
        to: "/reports/lorryReceiptRegister",
      },
      {
        label: "Loading Trip Sheet",
        to: "/reports/loadingTripSheet",
      },
      {
        label: "Bill Register",
        to: "/reports/billRegister",
      },
      {
        label: "Over All Report",
        to: "/reports/billedLRStatus",
      },
      // {
      //   label: "Payment Collection Report",
      //   to: "/reports/paymentCollectionReport",
      // },
    ],
  },
];

export default navItems;
