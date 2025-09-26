"use client";

import { api } from "@/utils/react";
import React, { useMemo, useState } from "react";

type Hospital = {
  id: number;
  name: string;
  email: string | null;
  address: string | null;
  contactNumber: string | null;
  registrationNumber: string | null;
  isVerified: boolean | null;
  isActive: boolean | null;
  createdAt: Date | null;
  adminName: string | null;
  adminEmail: string | null;
  adminPhone: string | null;
};

export default function ManageHospitalsPage() {
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoading, data, refetch } = api.admin.getAllHospitals.useQuery({
    limit: 100,
    page: 1,
    search: "",
    status: "all",
  });

  const toggleStatusMutation = api.admin.toggleHospitalStatus.useMutation({
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
    const hospitals: Hospital[] = data?.hospitals ?? [];
    return {
      pending: hospitals.filter((h) => !h.isVerified),
      verified: hospitals.filter((h) => h.isVerified),
    };
  }, [data]);

  async function handleVerify(hospitalId: number, approve: boolean) {
    setActionLoadingId(hospitalId);
    setError(null);
    try {
      await toggleStatusMutation.mutateAsync({
        hospitalId,
        active: approve,
      });
      refetch();
    } catch {}
  }

  async function handleToggleActive(h: Hospital) {
    const confirmToggle = confirm(
      h.isActive ? "Deactivate this hospital?" : "Activate this hospital?"
    );
    if (!confirmToggle) return;
    setActionLoadingId(h.id);
    try {
      await toggleStatusMutation.mutateAsync({
        hospitalId: h.id,
        active: !h.isActive,
      });
    } catch {}
  }

  return (
    <div className="font-sans  min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Hospitals
      </h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-600 text-white px-4 py-2">
          {error}
        </div>
      )}

      {/* Pending Requests */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Pending Requests
        </h2>
        {isLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="text-gray-500 italic">No pending requests.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Registration #</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((h, idx) => (
                  <tr
                    key={h.id}
                    className={`border-t ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">{h.name}</td>
                    <td className="p-3 text-gray-600">
                      {h.contactNumber ?? h.email}
                    </td>
                    <td className="p-3 text-gray-600">
                      {h.registrationNumber}
                    </td>
                    <td className="p-3 text-gray-600">{h.address}</td>
                    <td className="p-3 space-x-3">
                      <button
                        disabled={actionLoadingId === h.id}
                        onClick={() => handleVerify(h.id, true)}
                        className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoadingId === h.id ? "Processing..." : "Accept"}
                      </button>
                      <button
                        disabled={actionLoadingId === h.id}
                        onClick={() => {
                          if (!confirm("Reject this hospital registration?"))
                            return;
                          handleVerify(h.id, false);
                        }}
                        className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoadingId === h.id ? "Processing..." : "Reject"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Verified Hospitals */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Verified Hospitals
        </h2>
        {isLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : verified.length === 0 ? (
          <div className="text-gray-500 italic">No verified hospitals.</div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
            {verified.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <div className="font-semibold text-gray-800">{h.name}</div>
                  <div className="text-sm text-gray-600">
                    {h.contactNumber ?? h.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    Registered: {h.registrationNumber}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      h.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Status: {h.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <button
                    disabled={actionLoadingId === h.id}
                    onClick={() => handleToggleActive(h)}
                    className={`px-3 py-1 rounded-md font-medium ${
                      h.isActive
                        ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    } disabled:opacity-50`}
                  >
                    {actionLoadingId === h.id
                      ? "Processing..."
                      : h.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
