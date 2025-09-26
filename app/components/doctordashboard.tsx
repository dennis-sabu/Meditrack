'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaCalendarAlt, FaPills, FaUserMd, FaUsers, FaEllipsisH } from 'react-icons/fa';

// Dummy data for charts
const lineChartData = [
  { time: '10am', value: 35 },
  { time: '11am', value: 28 },
  { time: '12am', value: 45 },
  { time: '01am', value: 32 },
  { time: '02am', value: 25 },
  { time: '03am', value: 55 },
  { time: '04am', value: 15 },
  { time: '05am', value: 35 },
  { time: '06am', value: 45 },
  { time: '07am', value: 65 },
];

const pieChartData = [
  { name: 'Sale', value: 60, color: '#4ade80' },
  { name: 'Distribute', value: 25, color: '#fbbf24' },
  { name: 'Return', value: 15, color: '#f87171' },
];

// Dummy recent orders data
const recentOrders = [
  {
    trackingNo: '#876364',
    productName: 'Camera Lens',
    price: '$178',
    totalOrder: 325,
    totalAmount: '$1,46,660',
    avatar: '👨‍⚕️'
  },
  {
    trackingNo: '#876368',
    productName: 'Black Sleep Dress',
    price: '$14',
    totalOrder: 53,
    totalAmount: '$46,660',
    avatar: '👩‍⚕️'
  },
  {
    trackingNo: '#876412',
    productName: 'Argan Oil',
    price: '$21',
    totalOrder: 78,
    totalAmount: '$3,46,676',
    avatar: '🧴'
  },
  {
    trackingNo: '#876621',
    productName: 'EAU DE Parfum',
    price: '$32',
    totalOrder: 98,
    totalAmount: '$3,46,981',
    avatar: '🧴'
  },
];

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600">
            <option>10-06-2021</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600">
            <option>10-10-2021</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">10+</p>
              <p className="text-gray-600 text-sm">Appointments</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-green-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">30+</p>
              <p className="text-gray-600 text-sm">Medicine Daily</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaPills className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">2</p>
              <p className="text-gray-600 text-sm">People Medicine Skipped</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaUserMd className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">12+</p>
              <p className="text-gray-600 text-sm">People in Good Health</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaUsers className="text-green-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reports Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
            <FaEllipsisH className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-gray-800 text-white rounded-lg inline-block">
            <span className="text-sm">Peak: 2,678</span>
          </div>
        </div>

        {/* Analytics Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
            <FaEllipsisH className="text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">80%</p>
                  <p className="text-sm text-gray-600">Appointments</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Sale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Distribute</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <FaEllipsisH className="text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 text-sm border-b">
                  <th className="pb-3">Tracking no</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Total Order</th>
                  <th className="pb-3">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-800">{order.trackingNo}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{order.avatar}</span>
                        <span className="text-sm text-gray-800">{order.productName}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-800">{order.price}</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                        {order.totalOrder}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-800">{order.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Today&apos;s Appointments</h3>
            <FaEllipsisH className="text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">No Appointments yet!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
