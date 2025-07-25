"use client";

import { useState, useEffect } from "react";
import { fetchJobGrades } from "../../pages/api/jobGradeService";
import { fetchICFs } from "../../pages/api/icfService";
import { authFetch } from "@/utils/authFetch";
import toast, { Toaster } from "react-hot-toast";
import AppModuleLayout from "../../components/AppModuleLayout";

interface Record {
  id: number;
  incrementStep: string;
  salary: string;
  jobGrade: { id: number };
  icf: { id: number };
  beginningSalary: string;
  maxSalary: string;
  payGradeId?: number;
  rankId?: number;
}
interface ClassOption {
  id: number;
  grade: string;
}
interface IcfOption {
  id: number;
  ICF: string;
}
interface SavedRank {
  rankId: number;
  beginningSalary: string;
  maxSalary: string;
  jobGrade: { id: number };
  icf: { id: number };
}

const SalarySettings = () => {
  const [classDropdown, setClassDropdown] = useState<string>("");
  const [icfDropdown, setIcfDropdown] = useState<string>("");
  const [beginningSalary, setBeginningSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [incrementStep, setIncrementStep] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [records, setRecords] = useState<Record[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [icfOptions, setIcfOptions] = useState<IcfOption[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [editRecordId, setEditRecordId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [existingPayGradeId, setExistingPayGradeId] = useState<
    number | undefined
  >(undefined);
  const [existingRankId, setExistingRankId] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchClassAndICFData = async () => {
      try {
        const classData = await fetchJobGrades();
        setClassOptions(
          classData.map((item: any) => ({ id: item.id, grade: item.grade }))
        );
        const icfData = await fetchICFs();
        setIcfOptions(
          icfData.map((item: any) => ({ id: item.id, ICF: item.ICF }))
        );
      } catch (error) {
        toast.error("Error fetching class and ICF data.");
      }
    };
    fetchClassAndICFData();
  }, []);

  const loadPayGrades = async () => {
    if (!classDropdown || !icfDropdown) {
      return;
    }

    try {
      const response = await authFetch(
        `http://localhost:8080/api/hr-pay-grad/filter?classId=${classDropdown}&icfId=${icfDropdown}`
      );
      if (!response.ok) {
        toast.error("Failed to fetch pay grades.");
        return;
      }
      const data = await response.json();
      if (data.length === 0) {
        return;
      }
      const validRecords = data.map((item: any) => ({
        id: item.payGradeId || item.rank?.rankId || Date.now() + Math.random(),
        payGradeId: item.payGradeId,
        rankId: item.rank?.rankId || null,
        incrementStep: item.stepNo,
        salary: item.salary,
        jobGrade: item.rank?.jobGrade || null,
        icf: item.rank?.icf || null,
        beginningSalary: item.rank?.beginningSalary || "",
        maxSalary: item.rank?.maxSalary || "",
      }));
      console.log("Valid Records:", validRecords);
      setRecords(validRecords);
    } catch (error) {
      toast.error("Failed to fetch pay grades.");
      console.error("Error fetching pay grades:", error);
    }
  };
  useEffect(() => {
    loadPayGrades();
  }, [classDropdown, icfDropdown]);

  const addDetail = () => {
    if (!classDropdown || !icfDropdown || !beginningSalary || !maxSalary) {
      toast.error("Please fill all fields before adding details.");
      return;
    }
    setIsPopupOpen(true);
  };

  const editDetail = (record: Record) => {
    console.log("Selected Record:", record);

    if (
      !record.jobGrade ||
      !record.jobGrade.id ||
      !record.icf ||
      !record.icf.id
    ) {
      toast.error("Invalid record selected for editing.");
      return;
    }

    setEditRecordId(record.id);
    setExistingPayGradeId(record.payGradeId || undefined);
    setExistingRankId(record.rankId || undefined);

    setClassDropdown(record.jobGrade.id.toString());
    setIcfDropdown(record.icf.id.toString());
    setBeginningSalary(record.beginningSalary || "");
    setMaxSalary(record.maxSalary || "");
    setIncrementStep(record.incrementStep || "");
    setSalary(record.salary || "");
    setIsEditing(true);
  };

  const addIncrementStepAndSalary = () => {
    if (!incrementStep || !salary || !beginningSalary || !maxSalary) {
      toast.error("Please fill all fields in the pop-up form.");
      return;
    }

    const updatedRecord: Record = {
      id: editRecordId || Date.now() + Math.random(),
      incrementStep: incrementStep.toString(),
      salary: salary.toString(),
      jobGrade: { id: parseInt(classDropdown) },
      icf: { id: parseInt(icfDropdown) },
      beginningSalary: beginningSalary.trim(),
      maxSalary: maxSalary.trim(),
      payGradeId: existingPayGradeId || undefined,
      rankId: existingRankId || undefined,
    };

    if (editRecordId !== null) {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === editRecordId ? { ...record, ...updatedRecord } : record
        )
      );
      toast.success("Record updated.");
    } else {
      // Add a new record
      setRecords((prev) => [...prev, updatedRecord]);
      toast.success("Record added.");
    }

    // Reset form fields
    setIncrementStep("");
    setSalary("");
    setBeginningSalary("");
    setMaxSalary("");
    setClassDropdown("");
    setIcfDropdown("");
    setEditRecordId(null);
    setIsPopupOpen(false);
  };
  const deleteDetail = async (id: number) => {
    try {
      setRecords(records.filter((record) => record.id !== id));
      toast.success("Record deleted.");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const saveDetails = async () => {
    if (records.length === 0) {
      toast.error("No records to save.");
      return;
    }

    try {
      const newRanks = records.filter((r) => !r.rankId);
      const existingRanks = records.filter((r) => r.rankId);

      const newRankPayload = newRanks.map((record) => ({
        beginningSalary: record.beginningSalary.trim(),
        maxSalary: record.maxSalary.trim(),
        jobGrade: record.jobGrade,
        icf: record.icf,
      }));

      const existingRankPayload = existingRanks.map((record) => ({
        rankId: record.rankId,
        beginningSalary: record.beginningSalary.trim(),
        maxSalary: record.maxSalary.trim(),
        jobGrade: record.jobGrade,
        icf: record.icf,
      }));

      console.log("New Ranks Payload:", newRankPayload);
      let savedRanks: SavedRank[] = [];

      if (newRankPayload.length > 0) {
        const response = await authFetch(
          "http://localhost:8080/api/hr-rank/bulk-save",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRankPayload),
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const result = await response.json();
        savedRanks = result;
      }
      // Save existing ranks
      if (existingRankPayload.length > 0) {
        const response = await authFetch(
          "http://localhost:8080/api/hr-rank/bulk-save",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(existingRankPayload),
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const result = await response.json();
        savedRanks = [...savedRanks, ...result];
      }
      const payGradPayload = records.map((record) => {
        const rankId =
          record.rankId ||
          savedRanks.find(
            (savedRank: SavedRank) =>
              savedRank.beginningSalary === record.beginningSalary &&
              savedRank.maxSalary === record.maxSalary &&
              savedRank.jobGrade.id === record.jobGrade.id &&
              savedRank.icf.id === record.icf.id
          )?.rankId;
        return {
          payGradeId: record.payGradeId,
          rank: { rankId },
          stepNo: record.incrementStep,
          salary: record.salary,
        };
      });
      console.log("Pay Grade Payload:", payGradPayload);
      const payGradeResponse = await authFetch(
        "http://localhost:8080/api/hr-pay-grad/bulk-save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payGradPayload),
        }
      );
      if (!payGradeResponse.ok) {
        throw new Error(await payGradeResponse.text());
      }
      const payGradeResult = await payGradeResponse.json();
      console.log("Saved PayGrades:", payGradeResult);
      await loadPayGrades();
      setRecords([]);
      setClassDropdown("");
      setIcfDropdown("");
      setBeginningSalary("");
      setMaxSalary("");
      toast.success("Records saved successfully.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error saving details.");
      console.error(error);
    }
  };
  return (
    <div className="p-2 sm:p-4 md:p-6 bg-white">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Pay Grade</h2>
      <div className="space-y-4">
        {/* Class Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center text-xs gap-2 sm:gap-4 w-full">
          <label className="w-full sm:w-40 text-left sm:text-right mb-1 sm:mb-0">
            Class:
          </label>
          <select
            value={classDropdown}
            onChange={(e) => setClassDropdown(e.target.value)}
            className="w-full sm:flex-1 p-2 border rounded-md focus:border-blue-500 text-xs focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="">--Select One--</option>
            {classOptions.map((classOption) => (
              <option key={classOption.id} value={classOption.id}>
                {classOption.grade}
              </option>
            ))}
          </select>
        </div>

        {/* ICF Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center text-xs gap-2 sm:gap-4 w-full">
          <label className="w-full sm:w-40 text-left sm:text-right mb-1 sm:mb-0">
            ICF:
          </label>
          <select
            value={icfDropdown}
            onChange={(e) => setIcfDropdown(e.target.value)}
            className="w-full sm:flex-1 p-2 border rounded-md focus:border-blue-500 text-xs focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="">--Select One--</option>
            {icfOptions.map((icfOption) => (
              <option key={icfOption.id} value={icfOption.id}>
                {icfOption.ICF}
              </option>
            ))}
          </select>
        </div>

        {/* Beginning Salary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center text-sm gap-2 sm:gap-4 w-full">
          <label className="w-full sm:w-40 text-left sm:text-right mb-1 sm:mb-0">
            Beginning Salary:
          </label>
          <input
            type="number"
            value={beginningSalary}
            onChange={(e) => setBeginningSalary(e.target.value)}
            className="w-full sm:flex-1 p-2 border rounded-md focus:border-blue-500 text-xs focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="Beginning Salary"
          />
        </div>

        {/* Max Salary */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center text-sm gap-2 sm:gap-4 w-full mb-6">
          <label className="w-full sm:w-40 text-left sm:text-right mb-1 sm:mb-0">
            Max Salary:
          </label>
          <input
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="w-full sm:flex-1 p-2 border rounded-md text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="Max Salary"
          />
        </div>
        {/* Add Detail Button */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow mt-6">
        <table className="min-w-full bg-white border border-gray-200 mt-8 rounded-xl overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th
                colSpan={4}
                className="text-center px-6 py-4 border-b rounded-t-xl"
              >
                <button
                  onClick={addDetail}
                  className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] shadow-lg hover:shadow-xl"
                >
                  Add Detail
                </button>
              </th>
            </tr>
            <tr>
              <th className="px-6 py-3 border-b text-left">S/N</th>
              <th className="px-6 py-3 border-b text-left">Increment Step</th>
              <th className="px-6 py-3 border-b text-left">Salary</th>
              <th className="px-6 py-3 border-b text-left">Option</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b text-sm">{index + 1}</td>
                <td className="px-6 py-4 border-b text-sm">
                  {record.incrementStep}
                </td>
                <td className="px-6 py-4 border-b text-sm">{record.salary}</td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => editDetail(record)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDetail(record.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">
                  No records added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={saveDetails}
          className={`${
            isEditing ? "bg-[#3c8dbc]" : "bg-[#3c8dbc]"
          } text-white px-4 py-2 rounded-md`}
        >
          {isEditing ? "Update" : "Save"}
        </button>
      </div>

      {/* Pop-up Form */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 border border-white/30 rounded-2xl shadow-2xl backdrop-blur-sm p-6 w-[400px] max-w-[90%] relative">
            {/* Close Button */}
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-600">
              {editRecordId ? "Edit Pay Grade" : "Add Pay Grade"}
            </h2>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Increment Step */}
              <div className="flex items-center gap-4">
                <label className="w-40 text-right text-gray-600">
                  Increment Step:
                </label>
                <input
                  type="text"
                  value={incrementStep}
                  onChange={(e) => setIncrementStep(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="increment step"
                />
              </div>

              {/* Salary */}
              <div className="flex items-center gap-4">
                <label className="w-40 text-right text-gray-600">Salary:</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="salary"
                />
              </div>

              {/* Add/Update Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={addIncrementStepAndSalary}
                  className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-150"
                >
                  {editRecordId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SalarySettingsPage() {
  return (
    <AppModuleLayout>
      <SalarySettings />
    </AppModuleLayout>
  );
}
