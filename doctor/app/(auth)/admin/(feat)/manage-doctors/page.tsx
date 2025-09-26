"use client";

import { api } from "@/utils/react";
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Doctor = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  experienceYears: number | null;
  medicalLicenseNumber: string | null;
  qualifications: string | null;
  consultationFee: string | null;
  isVerified: boolean | null;
  isActive: boolean | null;
  createdAt: Date | null;
  hospitalName: string | null;
  hospitalId: number | null;
};

export default function ManageDoctorsPage() {
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { isLoading, data, refetch } = api.admin.getAllDoctors.useQuery({
    limit: 100,
    page: 1,
    search: "",
    status: "all",
  });

  const verifyDoctorMutation = api.admin.verifyDoctor.useMutation({
    onError: (err) => {
      setError(err.message || "Action failed");
      setActionLoadingId(null);
    },
    onSuccess: () => {
      setActionLoadingId(null);
      refetch();
    },
  });

  const { pending, verified } = useMemo(() => {
    const doctors: Doctor[] = data?.doctors ?? [];
    return {
      pending: doctors.filter((d) => !d.isVerified),
      verified: doctors.filter((d) => d.isVerified),
    };
  }, [data]);

  async function handleVerify(doctorId: number, approve: boolean) {
    setActionLoadingId(doctorId);
    setError(null);
    try {
      await verifyDoctorMutation.mutateAsync({
        doctorId,
        approved: approve,
      });
    } catch {}
  }

  function toggleExpand(id: number) {
    setExpanded(expanded === id ? null : id);
  }

  return (
    <div className="font-sans min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        Manage Doctors
      </h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-600 text-white px-4 py-2">
          {error}
        </div>
      )}

      {/* Pending Requests */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Pending Requests
        </h2>
        {isLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="text-gray-500 italic">No pending requests.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="w-full border-collapse">
              <thead className="bg-indigo-50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">License #</th>
                  <th className="p-3">Hospital</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((d, idx) => (
                  <tr
                    key={d.id}
                    className={`border-t ${
                      idx % 2 === 0 ? "bg-white" : "bg-indigo-50/20"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">{d.name}</td>
                    <td className="p-3 text-gray-600">{d.specialization}</td>
                    <td className="p-3 text-gray-600">
                      {d.email ?? d.email}
                    </td>
                    <td className="p-3 text-gray-600">{d.medicalLicenseNumber}</td>
                    <td className="p-3 text-gray-600">{d.hospitalName}</td>
                    <td className="p-3 space-x-3">
                      <button
                        disabled={actionLoadingId === d.id}
                        onClick={() => handleVerify(d.id, true)}
                        className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoadingId === d.id ? "Processing..." : "Accept"}
                      </button>
                      <button
                        disabled={actionLoadingId === d.id}
                        onClick={() => {
                          if (!confirm("Reject this doctor registration?"))
                            return;
                          handleVerify(d.id, false);
                        }}
                        className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoadingId === d.id ? "Processing..." : "Reject"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Verified Doctors */}
      <section>
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Verified Doctors
        </h2>
        {isLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : verified.length === 0 ? (
          <div className="text-gray-500 italic">No verified doctors.</div>
        ) : (
          <ul className="space-y-3">
            {verified.map((d) => {
              const isOpen = expanded === d.id;
              return (
                <li
                  key={d.id}
                  className="bg-white rounded-lg shadow border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        {d.name}
                        <button
                          onClick={() => toggleExpand(d.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        {d.specialization}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          d.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Status: {d.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-1">
                      <div>Email: {d.email}</div>
                      <div>Contact: {d.phone}</div>
                      <div>License #: {d.medicalLicenseNumber}</div>
                      <div>Hospital: {d.hospitalName}</div>
                      <div>
                        Registered on:{" "}
                        {d.createdAt
                          ? new Date(d.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
